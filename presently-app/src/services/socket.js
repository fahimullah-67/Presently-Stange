import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = {};
  }

  /**
   * Initialize Socket.io connection
   */
  connect() {
    if (this.socket) {
      return this.socket;
    }

    const token = localStorage.getItem('token');

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection events
    this.socket.on('connect', () => {
      console.log('[Socket.io connected:', this.socket.id);
      this.isConnected = true;
      this.emit('connected', { socketId: this.socket.id });
    });

    this.socket.on('disconnect', () => {
      console.log('[Socket.io disconnected');
      this.isConnected = false;
      this.emit('disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('[v0] Socket.io error:', error);
    });

    return this.socket;
  }

  /**
   * Disconnect Socket.io
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Emit custom event
   */
  emit(event, data) {
    if (!this.socket) {
      console.warn('Socket not connected');
      return;
    }
    this.socket.emit(event, data);
  }

  /**
   * Listen to events
   */
  on(event, callback) {
    if (!this.socket) {
      console.warn('Socket not connected');
      return;
    }

    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(callback);
    this.socket.on(event, callback);
  }

  /**
   * Remove listener
   */
  off(event, callback) {
    if (!this.socket) return;

    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    }

    this.socket.off(event, callback);
  }

  /**
   * Join session room
   */
  joinSession(sessionId) {
    this.emit('join-session', { sessionId });
    console.log('Joined session:', sessionId);
  }

  /**
   * Leave session room
   */
  leaveSession(sessionId) {
    this.emit('leave-session', { sessionId });
    console.log('Left session:', sessionId);
  }

  /**
   * Send message
   */
  sendMessage(sessionId, message) {
    this.emit('send-message', {
      sessionId,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Listen for new messages
   */
  onNewMessage(sessionId, callback) {
    this.on(`new-message:${sessionId}`, callback);
  }

  /**
   * Send poll response
   */
  pollResponse(pollId, response) {
    this.emit('poll-response', {
      pollId,
      response,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Listen for poll updates
   */
  onPollUpdate(pollId, callback) {
    this.on(`poll-update:${pollId}`, callback);
  }

  /**
   * User typing indicator
   */
  userTyping(sessionId, userName) {
    this.emit('user-typing', { sessionId, userName });
  }

  /**
   * Listen for typing indicators
   */
  onUserTyping(sessionId, callback) {
    this.on(`user-typing:${sessionId}`, callback);
  }

  /**
   * User joined session
   */
  onUserJoined(sessionId, callback) {
    this.on(`user-joined:${sessionId}`, callback);
  }

  /**
   * User left session
   */
  onUserLeft(sessionId, callback) {
    this.on(`user-left:${sessionId}`, callback);
  }

  /**
   * Listen for attendee updates
   */
  onAttendeeUpdate(sessionId, callback) {
    this.on(`attendee-update:${sessionId}`, callback);
  }

  /**
   * Listen for session updates
   */
  onSessionUpdate(sessionId, callback) {
    this.on(`session-update:${sessionId}`, callback);
  }

  /**
   * React to message
   */
  reactToMessage(sessionId, messageId, emoji) {
    this.emit('message-reaction', {
      sessionId,
      messageId,
      emoji,
    });
  }

  /**
   * Listen for message reactions
   */
  onMessageReaction(sessionId, callback) {
    this.on(`message-reaction:${sessionId}`, callback);
  }

  /**
   * Get socket instance
   */
  getSocket() {
    return this.socket;
  }

  /**
   * Check if connected
   */
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  /**
   * Clear all listeners
   */
  clearListeners() {
    Object.keys(this.listeners).forEach((event) => {
      this.listeners[event].forEach((callback) => {
        this.socket?.off(event, callback);
      });
    });
    this.listeners = {};
  }
}

// Export singleton instance
export default new SocketService();
