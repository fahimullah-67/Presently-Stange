const axios = require('axios');
const jwt = require('jsonwebtoken');
const redis = require('../config/redis');

class ZoomService {
  constructor() {
    this.clientId = process.env.ZOOM_CLIENT_ID;
    this.clientSecret = process.env.ZOOM_CLIENT_SECRET;
    this.accountId = process.env.ZOOM_ACCOUNT_ID;
    this.baseUrl = 'https://zoom.us/oauth/token';
    this.apiUrl = 'https://api.zoom.us/v2';
  }

  /**
   * Get OAuth access token from Zoom
   */
  async getAccessToken() {
    try {
      // Check Redis cache first
      const cachedToken = await redis.get('zoom_access_token');
      if (cachedToken) {
        console.log('[v0] Using cached Zoom token');
        return cachedToken;
      }

      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(
        this.baseUrl,
        'grant_type=account_credentials&account_id=' + this.accountId,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const token = response.data.access_token;
      
      // Cache token for 55 minutes (expires in 60 minutes)
      await redis.setex('zoom_access_token', 3300, token);
      
      return token;
    } catch (error) {
      console.error('[v0] Error getting Zoom access token:', error.message);
      throw new Error('Failed to get Zoom access token');
    }
  }

  /**
   * Create a Zoom meeting
   */
  async createMeeting(userId, meetingDetails) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(
        `${this.apiUrl}/users/me/meetings`,
        {
          topic: meetingDetails.topic || 'Presently Session',
          type: 2, // Scheduled meeting
          start_time: meetingDetails.startTime,
          duration: meetingDetails.duration || 60,
          timezone: 'UTC',
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: true,
            mute_upon_entry: false,
            waiting_room: false,
            meeting_authentication: false,
            jbh_time: 0,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const meeting = {
        meetingId: response.data.id,
        joinUrl: response.data.join_url,
        startUrl: response.data.start_url,
        topic: response.data.topic,
        startTime: response.data.start_time,
        duration: response.data.duration,
      };

      // Cache meeting info for quick lookup
      await redis.setex(
        `zoom_meeting:${response.data.id}`,
        7200, // 2 hours
        JSON.stringify(meeting)
      );

      return meeting;
    } catch (error) {
      console.error('[v0] Error creating Zoom meeting:', error.response?.data || error.message);
      throw new Error('Failed to create Zoom meeting');
    }
  }

  /**
   * Get meeting info
   */
  async getMeetingInfo(meetingId) {
    try {
      // Check Redis cache first
      const cachedMeeting = await redis.get(`zoom_meeting:${meetingId}`);
      if (cachedMeeting) {
        console.log('[v0] Using cached meeting info');
        return JSON.parse(cachedMeeting);
      }

      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.apiUrl}/meetings/${meetingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const meeting = {
        meetingId: response.data.id,
        joinUrl: response.data.join_url,
        startUrl: response.data.start_url,
        topic: response.data.topic,
        startTime: response.data.start_time,
        duration: response.data.duration,
        status: response.data.status,
      };

      // Cache for 2 hours
      await redis.setex(
        `zoom_meeting:${meetingId}`,
        7200,
        JSON.stringify(meeting)
      );

      return meeting;
    } catch (error) {
      console.error('[v0] Error getting Zoom meeting:', error.response?.data || error.message);
      throw new Error('Failed to get Zoom meeting info');
    }
  }

  /**
   * End a Zoom meeting
   */
  async endMeeting(meetingId) {
    try {
      const token = await this.getAccessToken();

      await axios.put(
        `${this.apiUrl}/meetings/${meetingId}/status`,
        { action: 'end' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Remove from cache
      await redis.del(`zoom_meeting:${meetingId}`);

      return { success: true };
    } catch (error) {
      console.error('[v0] Error ending Zoom meeting:', error.response?.data || error.message);
      throw new Error('Failed to end Zoom meeting');
    }
  }

  /**
   * Get meeting participants
   */
  async getMeetingParticipants(meetingId) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.apiUrl}/meetings/${meetingId}/participants`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.participants || [];
    } catch (error) {
      console.error('[v0] Error getting meeting participants:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Get meeting recordings
   */
  async getMeetingRecordings(meetingId) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.apiUrl}/meetings/${meetingId}/recordings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.recording_files || [];
    } catch (error) {
      console.error('[v0] Error getting recordings:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Generate Zoom SDK signature for client-side
   */
  generateSignature(meetingId, role = 0) {
    try {
      const iat = Math.floor(Date.now() / 1000);
      const exp = iat + 60 * 60; // 1 hour

      const payload = {
        appKey: this.clientId,
        exp,
        iat,
        tokenExp: iat + 60 * 60,
        role,
        sessionKey: meetingId,
        userIdentity: `user_${Math.random().toString(36).substr(2, 9)}`,
      };

      const signature = jwt.sign(payload, this.clientSecret, {
        header: {
          alg: 'HS256',
          typ: 'JWT',
        },
        noTimestamp: true,
      });

      return signature;
    } catch (error) {
      console.error('[v0] Error generating Zoom signature:', error.message);
      throw new Error('Failed to generate Zoom signature');
    }
  }

  /**
   * List user's meetings
   */
  async getUserMeetings(userId = 'me') {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.apiUrl}/users/${userId}/meetings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.meetings || [];
    } catch (error) {
      console.error('[v0] Error listing user meetings:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Delete a meeting
   */
  async deleteMeeting(meetingId) {
    try {
      const token = await this.getAccessToken();

      await axios.delete(
        `${this.apiUrl}/meetings/${meetingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove from cache
      await redis.del(`zoom_meeting:${meetingId}`);

      return { success: true };
    } catch (error) {
      console.error('[v0] Error deleting meeting:', error.response?.data || error.message);
      throw new Error('Failed to delete meeting');
    }
  }
}

module.exports = new ZoomService();
