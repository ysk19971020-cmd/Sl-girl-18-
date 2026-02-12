import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, AlertCircle, Clock, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { validateSession, endSession, createFreeSession } from '@/lib/session';
import { getUsers } from '@/lib/storage';

export default function CallPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [callConnected, setCallConnected] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!sessionId || !currentUser) {
      navigate('/home');
      return;
    }

    // Check if it's a free session ID (format: free-voice-{providerId}-{timestamp})
    const isFreeSession = sessionId.startsWith('free-voice-');
    let validSession;

    if (isFreeSession) {
      // Extract provider ID from free session format
      const parts = sessionId.split('-');
      const providerId = parts[2];
      
      if (!providerId) {
        setError('Invalid free session');
        setTimeout(() => navigate('/home'), 3000);
        return;
      }

      // Create or validate free voice session
      validSession = validateSession(sessionId);
      if (!validSession) {
        validSession = createFreeSession(currentUser.id, providerId, 'voice');
      }
    } else {
      // Validate paid session
      validSession = validateSession(sessionId);
      if (!validSession) {
        setError('Session expired or invalid. Please make a new payment.');
        setTimeout(() => navigate('/home'), 3000);
        return;
      }
    }

    setSession(validSession);

    // Get other user
    const users = getUsers();
    const otherId = validSession.callerId === currentUser.id 
      ? validSession.providerId 
      : validSession.callerId;
    const other = users.find(u => u.id === otherId);
    setOtherUser(other);

    // Determine if video call
    const isVideoCall = validSession.serviceType === 'video';
    setIsVideoOn(isVideoCall);

    // Initialize media
    initializeMedia(isVideoCall);

    // Setup time tracker
    const interval = setInterval(() => {
      updateTimeRemaining(validSession);
    }, 1000);

    return () => {
      clearInterval(interval);
      cleanup();
    };
  }, [sessionId, currentUser, navigate]);

  const initializeMedia = async (enableVideo: boolean) => {
    try {
      const constraints = {
        audio: true,
        video: enableVideo ? { width: 1280, height: 720 } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current && enableVideo) {
        localVideoRef.current.srcObject = stream;
      }

      // Simulate connection (in real app, this would use WebRTC signaling)
      setTimeout(() => {
        setCallConnected(true);
        simulateRemoteStream(enableVideo);
      }, 2000);
    } catch (err: any) {
      setError(`Media access denied: ${err.message}. Please allow microphone/camera access.`);
    }
  };

  const simulateRemoteStream = (enableVideo: boolean) => {
    // In a real WebRTC implementation, this would be the remote peer's stream
    // For demo purposes, we'll show a placeholder
    if (remoteVideoRef.current && enableVideo) {
      // Create a canvas with placeholder
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Remote User Video', canvas.width / 2, canvas.height / 2);
      }
      const stream = (canvas as any).captureStream();
      remoteVideoRef.current.srcObject = stream;
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const updateTimeRemaining = (sess: any) => {
    const now = new Date();
    const expires = new Date(sess.expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) {
      setError('Session expired');
      handleEndCall();
    } else {
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const handleEndCall = () => {
    if (sessionId) {
      endSession(sessionId);
    }
    cleanup();
    navigate('/home');
  };

  if (error && !session) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md mx-auto">
            <AlertCircle className="text-destructive mx-auto mb-4" size={48} />
            <p className="text-destructive font-semibold">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session || !otherUser) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const isVideoCall = session.serviceType === 'video';

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Call Header */}
      <div className="bg-black/80 backdrop-blur px-4 py-3 absolute top-0 left-0 right-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={otherUser.profileImage || 'https://via.placeholder.com/40'}
              alt={otherUser.username}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary"
            />
            <div>
              <h2 className="font-bold text-white">{otherUser.username}</h2>
              <p className="text-xs text-white/70">
                {callConnected ? (session?.amount === 0 ? '🆓 FREE Voice Call' : isVideoCall ? 'Video Call Active' : 'Voice Call Active') : 'Connecting...'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-primary/20 text-white px-3 py-1.5 rounded-full">
            {session?.amount === 0 ? (
              <>
                <span className="text-sm font-semibold">🆓 FREE Call</span>
              </>
            ) : (
              <>
                <Clock size={16} />
                <span className="text-sm font-semibold">{timeRemaining}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative">
        {isVideoCall ? (
          <>
            {/* Remote Video (Full Screen) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Local Video (Picture-in-Picture) */}
            <div className="absolute top-20 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-white shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!isVideoOn && (
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                  <VideoOff className="text-white" size={32} />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <div className="text-center">
              <img
                src={otherUser.profileImage || 'https://via.placeholder.com/200'}
                alt={otherUser.username}
                className="w-48 h-48 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-2xl"
              />
              <h2 className="text-3xl font-bold text-white mb-2">{otherUser.username}</h2>
              <p className="text-white/80">
                {session?.amount === 0 ? '🆓 FREE Voice Call Active - Unlimited!' : (callConnected ? 'Call in progress...' : 'Connecting...')}
              </p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="bg-destructive/90 rounded-lg p-6 max-w-md text-center">
              <AlertCircle className="text-white mx-auto mb-4" size={48} />
              <p className="text-white font-semibold">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="bg-black/80 backdrop-blur px-4 py-6 absolute bottom-0 left-0 right-0">
        <div className="container mx-auto flex justify-center gap-4">
          {/* Mute Button */}
          <Button
            onClick={toggleMute}
            size="lg"
            variant={isMuted ? 'destructive' : 'secondary'}
            className="w-16 h-16 rounded-full"
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </Button>

          {/* Video Toggle (only for video calls) */}
          {isVideoCall && (
            <Button
              onClick={toggleVideo}
              size="lg"
              variant={isVideoOn ? 'secondary' : 'destructive'}
              className="w-16 h-16 rounded-full"
            >
              {isVideoOn ? <VideoIcon size={24} /> : <VideoOff size={24} />}
            </Button>
          )}

          {/* End Call Button */}
          <Button
            onClick={handleEndCall}
            size="lg"
            variant="destructive"
            className="w-16 h-16 rounded-full"
          >
            <PhoneOff size={24} />
          </Button>
        </div>

        <p className="text-center text-white/70 text-sm mt-4">
          {session?.amount === 0 ? '🆓 FREE unlimited voice call - No time limit!' : `Session expires in ${timeRemaining}`}
        </p>
      </div>
    </div>
  );
}
