import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, AlertCircle, Lock, Clock, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { validateSession, endSession, createFreeSession } from '@/lib/session';
import { sendMessage, getSessionMessages, markMessagesAsRead } from '@/lib/chat';
import { canSendMessage, containsRestrictedContent } from '@/lib/moderation';
import { getUsers } from '@/lib/storage';
import { formatDistanceToNow } from 'date-fns';

export default function ChatPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId || !currentUser) {
      navigate('/home');
      return;
    }

    // Check if it's a free session ID (format: free-{providerId}-{timestamp})
    const isFreeSession = sessionId.startsWith('free-');
    let validSession;

    if (isFreeSession) {
      // Extract provider ID from free session format: free-{providerId}-{timestamp}
      const parts = sessionId.split('-');
      const providerId = parts[1];
      
      if (!providerId) {
        setError('Invalid free session');
        setTimeout(() => navigate('/home'), 3000);
        return;
      }

      // Create or validate free session
      validSession = validateSession(sessionId);
      if (!validSession) {
        // Create new free session
        validSession = createFreeSession(currentUser.id, providerId, 'chat');
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

    // Load messages
    loadMessages();

    // Setup polling for new messages (simulates real-time)
    const interval = setInterval(() => {
      loadMessages();
      updateTimeRemaining(validSession);
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId, currentUser, navigate]);

  const loadMessages = () => {
    if (!sessionId || !currentUser) return;
    
    const sessionMessages = getSessionMessages(sessionId);
    setMessages(sessionMessages);
    
    // Mark messages as read
    markMessagesAsRead(sessionId, currentUser.id);
    
    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const updateTimeRemaining = (sess: any) => {
    const now = new Date();
    const expires = new Date(sess.expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) {
      setError('Session expired');
      setTimeout(() => navigate('/home'), 2000);
    } else {
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || !sessionId || !currentUser || !otherUser) return;

    // Check rate limiting
    if (!canSendMessage(currentUser.id)) {
      setError('Rate limit exceeded. Please wait before sending more messages.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Check for restricted content
    if (containsRestrictedContent(message)) {
      setError('Message contains restricted content (phone numbers, emails, external links).');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Send message
    sendMessage(sessionId, currentUser.id, otherUser.id, message);
    setMessage('');
    loadMessages();
  };

  const handleEndSession = () => {
    if (sessionId && window.confirm('Are you sure you want to end this session?')) {
      endSession(sessionId);
      navigate('/home');
    }
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Chat Header */}
      <div className="bg-card border-b border-border px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/home')}
              variant="ghost"
              size="icon"
            >
              <ArrowLeft size={20} />
            </Button>
            <img
              src={otherUser.profileImage || 'https://via.placeholder.com/40'}
              alt={otherUser.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h2 className="font-bold text-foreground">{otherUser.username}</h2>
              <p className="text-xs text-muted-foreground">Private Chat Session</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full">
              <Clock size={16} />
              <span className="text-sm font-semibold">{timeRemaining}</span>
            </div>
            <Button onClick={handleEndSession} variant="destructive" size="sm">
              End Session
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-muted/20 p-4">
        <div className="container mx-auto max-w-4xl">
          {/* Session Info */}
          <div className="bg-green-100 dark:bg-green-950/30 border border-green-300 dark:border-green-700 rounded-lg p-4 mb-4 text-center">
            <Lock className="text-green-600 mx-auto mb-2" size={24} />
            <p className="text-sm text-green-900 dark:text-green-100 font-semibold">
              <strong>🆓 FREE Chat Session - No Payment Required!</strong>
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              {session?.amount === 0 ? 'Enjoy unlimited free messaging!' : `All messages are private. Session expires in ${timeRemaining}.`}
            </p>
          </div>

          {/* Messages */}
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const isMine = msg.senderId === currentUser?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isMine
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card text-foreground border border-border'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border-t border-destructive/20 px-4 py-2">
          <div className="container mx-auto max-w-4xl">
            <p className="text-sm text-destructive flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-card border-t border-border px-4 py-3">
        <div className="container mx-auto max-w-4xl">
          <div className="flex gap-2">
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!message.trim()}>
              <Send size={20} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            ⚠️ Do not share phone numbers, emails, or external links
          </p>
        </div>
      </div>
    </div>
  );
}
