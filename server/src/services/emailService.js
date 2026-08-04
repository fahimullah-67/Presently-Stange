const nodemailer = require('nodemailer');
const redis = require('../config/redis');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  /**
   * Generate OTP
   */
  generateOTP(length = 6) {
    return Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0');
  }

  /**
   * Send OTP email for authentication
   */
  async sendOTPEmail(email, userName = null) {
    try {
      // Check rate limiting - max 3 OTPs per hour per email
      const rateLimitKey = `otp_rate_limit:${email}`;
      const attempts = await redis.incr(rateLimitKey);

      if (attempts === 1) {
        // Set expiry only on first attempt
        await redis.expire(rateLimitKey, 3600); // 1 hour
      }

      if (attempts > 3) {
        throw new Error('Too many OTP requests. Please try again later.');
      }

      // Generate OTP
      const otp = this.generateOTP();
      const otpKey = `otp:${email}`;
      const expiryTime = 900; // 15 minutes

      // Store OTP in Redis with expiry
      await redis.setex(otpKey, expiryTime, JSON.stringify({
        otp,
        email,
        attempts: 0,
        createdAt: new Date().toISOString(),
      }));

      // Send email
      const mailOptions = {
        from: process.env.SMTP_FROM_EMAIL,
        to: email,
        subject: 'Presently - Email Verification',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { color: #2D8CFF; margin: 0; }
                .content { text-align: center; }
                .otp-box { background-color: #E8F0FE; padding: 20px; border-radius: 8px; margin: 30px 0; }
                .otp { font-size: 48px; font-weight: bold; color: #2D8CFF; letter-spacing: 5px; }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Presently</h1>
                </div>
                <div class="content">
                  <p>Hello${userName ? ` ${userName}` : ''},</p>
                  <p>Your one-time verification code is:</p>
                  <div class="otp-box">
                    <div class="otp">${otp}</div>
                  </div>
                  <p>This code will expire in 15 minutes.</p>
                  <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
                </div>
                <div class="footer">
                  <p>&copy; 2024 Presently. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        message: 'OTP sent to email',
        expiresIn: expiryTime,
      };
    } catch (error) {
      console.error('[v0] Error sending OTP email:', error.message);
      throw error;
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(email, otp) {
    try {
      const otpKey = `otp:${email}`;
      const storedData = await redis.get(otpKey);

      if (!storedData) {
        throw new Error('OTP expired or not found');
      }

      const data = JSON.parse(storedData);

      // Check attempt limit - max 5 attempts
      if (data.attempts >= 5) {
        // Delete OTP after 5 failed attempts
        await redis.del(otpKey);
        throw new Error('Too many attempts. Please request a new OTP.');
      }

      if (data.otp !== otp) {
        data.attempts += 1;
        await redis.setex(otpKey, 900, JSON.stringify(data));
        throw new Error('Invalid OTP');
      }

      // OTP is correct, delete it
      await redis.del(otpKey);
      // Also delete rate limit key to allow new requests
      await redis.del(`otp_rate_limit:${email}`);

      return {
        success: true,
        email,
        verifiedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[v0] Error verifying OTP:', error.message);
      throw error;
    }
  }

  /**
   * Send welcome email after successful registration
   */
  async sendWelcomeEmail(email, userName) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM_EMAIL,
        to: email,
        subject: 'Welcome to Presently',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { color: #2D8CFF; margin: 0; }
                .content { }
                .button { background-color: #2D8CFF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px; }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Welcome to Presently</h1>
                </div>
                <div class="content">
                  <p>Hello ${userName},</p>
                  <p>Thank you for signing up! You're now ready to create engaging live sessions.</p>
                  <p>With Presently, you can:</p>
                  <ul>
                    <li>Create live polls and engage your audience</li>
                    <li>Host real-time Q&A sessions</li>
                    <li>Track attendance and engagement</li>
                    <li>Integrate with Zoom for video conferencing</li>
                  </ul>
                  <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Get Started</a>
                </div>
                <div class="footer">
                  <p>&copy; 2024 Presently. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('[v0] Error sending welcome email:', error.message);
      // Don't throw - welcome email failure shouldn't break signup
      return { success: false, error: error.message };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email, resetToken) {
    try {
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: process.env.SMTP_FROM_EMAIL,
        to: email,
        subject: 'Presently - Password Reset',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; }
                .button { background-color: #2D8CFF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>Password Reset Request</h2>
                <p>Click the button below to reset your password:</p>
                <a href="${resetLink}" class="button">Reset Password</a>
                <p style="color: #999; font-size: 12px;">This link expires in 1 hour.</p>
              </div>
            </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('[v0] Error sending reset email:', error.message);
      throw error;
    }
  }

  /**
   * Send session notification email
   */
  async sendSessionNotification(email, sessionName, joinUrl) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM_EMAIL,
        to: email,
        subject: `Session Starting: ${sessionName}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; }
                .button { background-color: #2D8CFF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>Your session is starting!</h2>
                <p>The session "<strong>${sessionName}</strong>" is now live.</p>
                <a href="${joinUrl}" class="button">Join Now</a>
              </div>
            </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('[v0] Error sending notification email:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
