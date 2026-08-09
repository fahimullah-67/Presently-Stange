import axios from "axios";
import jwt from "jsonwebtoken";

import { cacheSet, cacheGet, cacheDelete } from "../config/redis.js";

// Zoom Service

class ZoomService {
  constructor() {
    // Zoom credentials
    this.clientId = process.env.ZOOM_CLIENT_ID;
    this.clientSecret = process.env.ZOOM_CLIENT_SECRET;
    this.accountId = process.env.ZOOM_ACCOUNT_ID;

    // Zoom API endpoints
    this.oauthUrl = "https://zoom.us/oauth/token";
    this.apiUrl = "https://api.zoom.us/v2";
  }

  // Authentication

  /**
   * Get OAuth access token from Zoom.
   *
   * Token is cached in Redis for 55 minutes.
   */
  async getAccessToken() {
    try {
      // Check Redis cache first
      const cachedToken = await cacheGet("zoom_access_token");

      if (cachedToken) {
        console.log("🔐 Using cached Zoom access token");

        return cachedToken;
      }

      // Create Basic Authentication credentials
      const credentials = Buffer.from(
        `${this.clientId}:${this.clientSecret}`,
      ).toString("base64");

      // Request access token from Zoom
      const response = await axios.post(
        this.oauthUrl,
        `grant_type=account_credentials&account_id=${this.accountId}`,
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      const token = response.data.access_token;

      // Cache token for 55 minutes
      await cacheSet("zoom_access_token", token, 3300);

      return token;
    } catch (error) {
      console.error(
        "❌ Zoom Access Token Error:",
        error.response?.data || error.message,
      );

      throw new Error("Failed to get Zoom access token");
    }
  }

  // Meetings

  /**
   * Create a Zoom meeting for an authenticated user.
   */
  async createMeeting(userId, meetingDetails) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(
        `${this.apiUrl}/users/me/meetings`,
        {
          topic: meetingDetails.topic || "Presently Session",

          type: 2,

          start_time: meetingDetails.startTime,

          duration: meetingDetails.duration || 60,

          timezone: "UTC",

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
            "Content-Type": "application/json",
          },
        },
      );

      const meeting = {
        meetingId: response.data.id,
        joinUrl: response.data.join_url,
        startUrl: response.data.start_url,
        topic: response.data.topic,
        startTime: response.data.start_time,
        duration: response.data.duration,

        // Presently authenticated user
        userId,
      };

      // Cache meeting information for 2 hours
      await cacheSet(`zoom_meeting:${response.data.id}`, meeting, 7200);

      return meeting;
    } catch (error) {
      console.error(
        "❌ Zoom Create Meeting Error:",
        error.response?.data || error.message,
      );

      throw new Error("Failed to create Zoom meeting");
    }
  }

  /**
   * Get meeting information.
   */
  async getMeetingInfo(meetingId) {
    try {
      // Check Redis cache first
      const cachedMeeting = await cacheGet(`zoom_meeting:${meetingId}`);

      if (cachedMeeting) {
        console.log("📦 Using cached Zoom meeting info");

        return cachedMeeting;
      }

      const token = await this.getAccessToken();

      const response = await axios.get(`${this.apiUrl}/meetings/${meetingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const meeting = {
        meetingId: response.data.id,
        joinUrl: response.data.join_url,
        startUrl: response.data.start_url,
        topic: response.data.topic,
        startTime: response.data.start_time,
        duration: response.data.duration,
        status: response.data.status,
      };

      // Cache meeting information for 2 hours
      await cacheSet(`zoom_meeting:${meetingId}`, meeting, 7200);

      return meeting;
    } catch (error) {
      console.error(
        "❌ Zoom Get Meeting Error:",
        error.response?.data || error.message,
      );

      throw new Error("Failed to get Zoom meeting info");
    }
  }

  /**
   * End a Zoom meeting.
   */
  async endMeeting(meetingId) {
    try {
      const token = await this.getAccessToken();

      await axios.put(
        `${this.apiUrl}/meetings/${meetingId}/status`,
        {
          action: "end",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      // Remove meeting from cache
      await cacheDelete(`zoom_meeting:${meetingId}`);

      return {
        success: true,
      };
    } catch (error) {
      console.error(
        "❌ Zoom End Meeting Error:",
        error.response?.data || error.message,
      );

      throw new Error("Failed to end Zoom meeting");
    }
  }

  /**
   * Delete a Zoom meeting.
   */
  async deleteMeeting(meetingId) {
    try {
      const token = await this.getAccessToken();

      await axios.delete(`${this.apiUrl}/meetings/${meetingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove meeting from cache
      await cacheDelete(`zoom_meeting:${meetingId}`);

      return {
        success: true,
      };
    } catch (error) {
      console.error(
        "❌ Zoom Delete Meeting Error:",
        error.response?.data || error.message,
      );

      throw new Error("Failed to delete meeting");
    }
  }

  /**
   * Get meetings for a Zoom user.
   */
  async getUserMeetings(userId = "me") {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.apiUrl}/users/${userId}/meetings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data.meetings || [];
    } catch (error) {
      console.error(
        "❌ Zoom List Meetings Error:",
        error.response?.data || error.message,
      );

      return [];
    }
  }

  // Participants & Recordings

  /**
   * Get participants from a Zoom meeting.
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
        },
      );

      return response.data.participants || [];
    } catch (error) {
      console.error(
        "❌ Zoom Participants Error:",
        error.response?.data || error.message,
      );

      return [];
    }
  }

  /**
   * Get recordings from a Zoom meeting.
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
        },
      );

      return response.data.recording_files || [];
    } catch (error) {
      console.error(
        "❌ Zoom Recordings Error:",
        error.response?.data || error.message,
      );

      return [];
    }
  }

  // Zoom SDK

  /**
   * Generate a Zoom SDK signature.
   */
  generateSignature(meetingId, role = 0) {
    try {
      const issuedAt = Math.floor(Date.now() / 1000);

      const expiresAt = issuedAt + 60 * 60;

      const payload = {
        appKey: this.clientId,

        role,

        sessionKey: meetingId,

        iat: issuedAt,

        exp: expiresAt,

        tokenExp: expiresAt,

        userIdentity: `user_${Math.random().toString(36).substring(2, 11)}`,
      };

      const signature = jwt.sign(payload, this.clientSecret, {
        header: {
          alg: "HS256",
          typ: "JWT",
        },

        noTimestamp: true,
      });

      return signature;
    } catch (error) {
      console.error("❌ Zoom Signature Error:", error.message);

      throw new Error("Failed to generate Zoom signature");
    }
  }
}

// Export Singleton

export const zoomService = new ZoomService();

