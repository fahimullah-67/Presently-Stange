import { useState, useEffect, useRef } from 'react';
import { Video, Mic, MicOff, VideoOff, Phone, Share2, Settings } from 'lucide-react';
import axios from 'axios';

const ZoomMeeting = ({ sessionId, meetingId }) => {
  const containerRef = useRef(null);
  const [status, setStatus] = useState('connecting'); // connecting, joined, error
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [participants, setParticipants] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  /**
   * Initialize Zoom SDK
   */
  useEffect(() => {
    const initZoom = async () => {
      try {
        setLoading(true);

        // Get JWT signature from backend
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/zoom-signature`,
          { meetingId, role: 0 }, // role: 0 = participant, 1 = host
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        const { signature } = response.data;

        // Load Zoom Web SDK
        const script = document.createElement('script');
        script.src = 'https://source.zoom.us/2.15.1/zoom-web.umd.js';
        script.async = true;

        script.onload = () => {
          initializeZoomMeeting(signature, meetingId);
        };

        script.onerror = () => {
          setError('Failed to load Zoom SDK');
          setStatus('error');
        };

        document.body.appendChild(script);

        return () => {
          if (document.body.contains(script)) {
            document.body.removeChild(script);
          }
        };
      } catch (err) {
        console.error('[v0] Error initializing Zoom:', err);
        setError('Failed to get meeting credentials');
        setStatus('error');
      } finally {
        setLoading(false);
      }
    };

    initZoom();
  }, [meetingId]);

  /**
   * Initialize Zoom Meeting
   */
  const initializeZoomMeeting = async (signature, meetingId) => {
    try {
      const { ZoomMtg } = window;

      // Set up Zoom
      ZoomMtg.setZoomJSLib('https://source.zoom.us/lib', '/av');
      ZoomMtg.preLoadWasm();

      // Initialize meeting
      ZoomMtg.init({
        leaveUrl: `${window.location.origin}/dashboard`,
        success: () => {
          console.log('[v0] Zoom initialized successfully');

          // Join meeting
          ZoomMtg.join({
            signature,
            meetingNumber: meetingId,
            userName: localStorage.getItem('userName') || 'User',
            userEmail: localStorage.getItem('userEmail') || 'user@example.com',
            zak: '', // Optional
            success: () => {
              setStatus('joined');
              setParticipants(1); // At least the current user
              console.log('[v0] Successfully joined Zoom meeting');
            },
            error: (err) => {
              console.error('[v0] Error joining meeting:', err);
              setError('Failed to join meeting');
              setStatus('error');
            },
          });
        },
        error: (err) => {
          console.error('[v0] Error initializing Zoom:', err);
          setError('Failed to initialize Zoom');
          setStatus('error');
        },
      });
    } catch (err) {
      console.error('[v0] Error in Zoom setup:', err);
      setError('Failed to set up Zoom meeting');
      setStatus('error');
    }
  };

  /**
   * Toggle microphone
   */
  const handleToggleMic = () => {
    try {
      const { ZoomMtg } = window;
      if (isMuted) {
        ZoomMtg.getAttendeesAudioContext().unmuteAudio();
      } else {
        ZoomMtg.getAttendeesAudioContext().muteAudio();
      }
      setIsMuted(!isMuted);
    } catch (err) {
      console.error('[v0] Error toggling microphone:', err);
    }
  };

  /**
   * Toggle video
   */
  const handleToggleVideo = () => {
    try {
      const { ZoomMtg } = window;
      if (isVideoOn) {
        ZoomMtg.getAttendeesVideoContext().stopVideo();
      } else {
        ZoomMtg.getAttendeesVideoContext().startVideo();
      }
      setIsVideoOn(!isVideoOn);
    } catch (err) {
      console.error('[v0] Error toggling video:', err);
    }
  };

  /**
   * Leave meeting
   */
  const handleLeaveMeeting = () => {
    try {
      const { ZoomMtg } = window;
      ZoomMtg.getAttendeesAudioContext().stopAudio();
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('[v0] Error leaving meeting:', err);
      window.location.href = '/dashboard';
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Connecting to Zoom meeting...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive text-6xl mb-4">!</div>
          <h2 className="text-white text-2xl font-bold mb-2">Meeting Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <a
            href="/dashboard"
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-[#1A5FCC]"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-screen bg-black relative">
      {/* Zoom meeting container */}
      <div id="zmmtg-root" className="w-full h-full"></div>

      {/* Custom controls overlay */}
      {status === 'joined' && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40">
          <div className="flex items-center gap-3 bg-black/80 backdrop-blur-sm px-6 py-4 rounded-full border border-border/50">
            {/* Mic Button */}
            <button
              onClick={handleToggleMic}
              className={`p-3 rounded-full transition-colors ${
                isMuted
                  ? 'bg-destructive text-white hover:bg-red-600'
                  : 'bg-primary text-white hover:bg-[#1A5FCC]'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            {/* Video Button */}
            <button
              onClick={handleToggleVideo}
              className={`p-3 rounded-full transition-colors ${
                !isVideoOn
                  ? 'bg-destructive text-white hover:bg-red-600'
                  : 'bg-primary text-white hover:bg-[#1A5FCC]'
              }`}
              title={!isVideoOn ? 'Turn on camera' : 'Turn off camera'}
            >
              {!isVideoOn ? (
                <VideoOff className="w-5 h-5" />
              ) : (
                <Video className="w-5 h-5" />
              )}
            </button>

            {/* Leave Button */}
            <button
              onClick={handleLeaveMeeting}
              className="p-3 rounded-full bg-destructive text-white hover:bg-red-600 transition-colors"
              title="Leave meeting"
            >
              <Phone className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Participant count */}
      {status === 'joined' && (
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-border/50 text-white">
          <p className="text-sm">Participants: {participants}</p>
        </div>
      )}
    </div>
  );
};

export default ZoomMeeting;
