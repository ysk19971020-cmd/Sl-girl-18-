export type Category = 'all' | 'girls' | 'boys' | 'livecam' | 'spa' | 'verified' | 'others';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  gender: 'male' | 'female' | 'other';
  age?: number; // Age display (optional)
  age18Plus: boolean; // Age confirmation
  verified: boolean; // Gender verified by admin
  categoryApproved: boolean; // Category approved by admin
  priceActivated: boolean; // Price activation payment approved by admin
  canSetPrice: boolean; // Can set own prices after activation fee payment
  adminPlanExpiry?: string; // When the $50/3 month plan expires
  status: 'active' | 'blocked' | 'suspended';
  isAdmin: boolean;
  profileImage?: string;
  verificationSelfie?: string; // Live selfie for admin verification (mandatory)
  description?: string;
  location?: string;
  whatsappNumber?: string; // WhatsApp contact for video/photo services
  chatPrice?: number;
  voicePrice?: number;
  videoPrice?: number;
  category: Category; // Mandatory during registration
  featured?: boolean;
  viewCount?: number;
  paymentProof?: string; // Payment proof for services
  activationFeeProof?: string; // Activation fee payment proof (now $50 for 3 months)
  createdAt: string;
  // Wallet System
  walletBalance: number;
  pendingBalance: number;
  // Anti-Scam System
  reportCount: number;
  warnings: Warning[];
  lastMessageTime?: number; // For rate limiting
  messageCount: number; // Messages sent in current window
}

export interface Warning {
  id: string;
  reason: string;
  issuedBy: string;
  issuedAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  method: 'bank' | 'binance';
  details: string; // Bank account or USDT address
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  type: 'profile' | 'message' | 'call';
  reason: 'scam' | 'fake_profile' | 'abuse' | 'other';
  details: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ChatSession {
  id: string;
  serviceType: 'chat' | 'voice' | 'video';
  callerId: string;
  providerId: string;
  amount: number;
  commission: number; // Platform commission percentage
  status: 'active' | 'expired' | 'completed';
  createdAt: string;
  expiresAt: string;
  sessionToken: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface PlatformSettings {
  commissionPercentage: number; // Default 20%
  minWithdrawal: number;
  maxMessagesPerMinute: number;
  maxCallsPerHour: number;
  sessionDuration: number; // in minutes
}

export interface Photo {
  id: string;
  userId: string;
  imageUrl: string;
  caption?: string;
  likes: string[]; // Array of user IDs who liked
  comments: PhotoComment[];
  createdAt: string;
}

export interface PhotoComment {
  id: string;
  userId: string;
  username: string;
  userImage?: string;
  text: string;
  createdAt: string;
}
