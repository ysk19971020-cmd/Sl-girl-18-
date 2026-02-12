import { ChatSession, User } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const SESSIONS_KEY = 'privateconnect_sessions';
const PLATFORM_SETTINGS_KEY = 'privateconnect_platform_settings';

// Default platform settings
export const getDefaultSettings = () => ({
  commissionPercentage: 15, // 15% platform commission (admin), 85% goes to provider
  minWithdrawal: 1000, // Rs 1000 minimum
  maxMessagesPerMinute: 30,
  maxCallsPerHour: 5,
  sessionDuration: 60, // 60 minutes
});

export const getPlatformSettings = () => {
  const settings = localStorage.getItem(PLATFORM_SETTINGS_KEY);
  return settings ? JSON.parse(settings) : getDefaultSettings();
};

export const updatePlatformSettings = (settings: any) => {
  localStorage.setItem(PLATFORM_SETTINGS_KEY, JSON.stringify(settings));
};

// Session Management
export const getSessions = (): ChatSession[] => {
  const data = localStorage.getItem(SESSIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveSessions = (sessions: ChatSession[]) => {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
};

/**
 * Create a FREE session for chat or voice (no payment required)
 * Returns a new ChatSession object for free services
 */
export function createFreeSession(
  callerId: string,
  providerId: string,
  serviceType: 'chat' | 'voice'
): ChatSession {
  const settings = getPlatformSettings();
  const sessions = getSessions();
  
  const sessionToken = `free-${uuidv4()}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60000); // 24 hours for free sessions
  
  const session: ChatSession = {
    id: sessionToken,
    serviceType,
    callerId,
    providerId,
    amount: 0, // FREE - no payment
    commission: 0, // No commission on free services
    status: 'active',
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    sessionToken,
  };
  
  sessions.push(session);
  saveSessions(sessions);
  
  return session;
}

/**
 * Create a new paid session after payment approval (for VIDEO CALLS only)
 */
export const createSession = (
  callerId: string,
  providerId: string,
  serviceType: 'chat' | 'voice' | 'video',
  amount: number
): ChatSession => {
  const settings = getPlatformSettings();
  const sessions = getSessions();
  
  const sessionToken = uuidv4();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + settings.sessionDuration * 60000);
  
  const session: ChatSession = {
    id: uuidv4(),
    serviceType,
    callerId,
    providerId,
    amount,
    commission: settings.commissionPercentage,
    status: 'active',
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    sessionToken,
  };
  
  sessions.push(session);
  saveSessions(sessions);
  
  return session;
};

/**
 * Validate if session is still active
 */
export const validateSession = (sessionId: string): ChatSession | null => {
  const sessions = getSessions();
  const session = sessions.find(s => s.id === sessionId);
  
  if (!session) return null;
  
  // Check if expired
  const now = new Date();
  const expiresAt = new Date(session.expiresAt);
  
  if (now > expiresAt || session.status !== 'active') {
    session.status = 'expired';
    saveSessions(sessions);
    return null;
  }
  
  return session;
};

/**
 * Check if user has active session with another user
 */
export const getActiveSession = (userId1: string, userId2: string): ChatSession | null => {
  const sessions = getSessions();
  const now = new Date();
  
  const activeSession = sessions.find(s => {
    const isParticipant = 
      (s.callerId === userId1 && s.providerId === userId2) ||
      (s.callerId === userId2 && s.providerId === userId1);
    
    const notExpired = new Date(s.expiresAt) > now;
    
    return isParticipant && s.status === 'active' && notExpired;
  });
  
  return activeSession || null;
};

/**
 * End a session manually
 */
export const endSession = (sessionId: string) => {
  const sessions = getSessions();
  const session = sessions.find(s => s.id === sessionId);
  
  if (session) {
    session.status = 'completed';
    saveSessions(sessions);
  }
};

/**
 * Clean up expired sessions
 */
export const cleanupExpiredSessions = () => {
  const sessions = getSessions();
  const now = new Date();
  
  const updated = sessions.map(s => {
    if (s.status === 'active' && new Date(s.expiresAt) < now) {
      return { ...s, status: 'expired' as const };
    }
    return s;
  });
  
  saveSessions(updated);
};
