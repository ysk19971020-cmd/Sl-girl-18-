import { User } from '@/types';
import { createClient } from '@supabase/supabase-js';

const USERS_KEY = 'privateconnect_users';
const AUTH_KEY = 'privateconnect_auth';

// Supabase client for storage
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize with sample data
export const initializeStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    const sampleUsers: User[] = [
      {
        id: '1',
        username: 'J A Y S Kavinda',
        email: 'jayakodyarachchigemahisha@gmail.com',
        password: 'jayakody@123',
        gender: 'male',
        age18Plus: true,
        verified: true,
        categoryApproved: true,
        priceActivated: true,
        canSetPrice: true,
        status: 'active',
        isAdmin: true,
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
        description: 'System Administrator - J A Y S Kavinda',
        location: 'Colombo',
        chatPrice: 0,
        voicePrice: 0,
        videoPrice: 0,
        category: 'boys',
        featured: false,
        viewCount: 0,
        walletBalance: 0,
        pendingBalance: 0,
        reportCount: 0,
        warnings: [],
        messageCount: 0,
        createdAt: new Date().toISOString(),
        verificationSelfie: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      },
      {
        id: '2',
        username: 'Maya_VIP',
        email: 'maya@example.com',
        password: 'user123',
        gender: 'female',
        age18Plus: true,
        verified: true,
        categoryApproved: true,
        priceActivated: true,
        canSetPrice: true,
        status: 'active',
        isAdmin: false,
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
        description: 'Premium verified profile. Available for private chat and calls.',
        location: 'Kandy',
        chatPrice: 800,
        voicePrice: 1200,
        videoPrice: 2000,
        category: 'girls',
        featured: true,
        viewCount: 856,
        activationFeeProof: 'PAID-ACT-12345',
        walletBalance: 0,
        pendingBalance: 0,
        reportCount: 0,
        warnings: [],
        messageCount: 0,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: '3',
        username: 'Ravi_Premium',
        email: 'ravi@example.com',
        password: 'user123',
        gender: 'male',
        age18Plus: true,
        verified: true,
        categoryApproved: true,
        priceActivated: true,
        canSetPrice: true,
        status: 'active',
        isAdmin: false,
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        description: 'Professional model available for video calls.',
        location: 'Galle',
        chatPrice: 600,
        voicePrice: 1000,
        videoPrice: 1800,
        category: 'boys',
        featured: false,
        viewCount: 432,
        activationFeeProof: 'PAID-ACT-67890',
        walletBalance: 0,
        pendingBalance: 0,
        reportCount: 0,
        warnings: [],
        messageCount: 0,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: '4',
        username: 'Sachi_Cam',
        email: 'sachi@example.com',
        password: 'user123',
        gender: 'female',
        age18Plus: true,
        verified: false,
        categoryApproved: false,
        priceActivated: false,
        canSetPrice: false,
        status: 'active',
        isAdmin: false,
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
        description: 'New profile - verification pending.',
        location: 'Negombo',
        chatPrice: 0,
        voicePrice: 0,
        videoPrice: 0,
        category: 'livecam',
        featured: false,
        viewCount: 123,
        activationFeeProof: 'BINANCE-TXN-ABC123',
        walletBalance: 0,
        pendingBalance: 0,
        reportCount: 0,
        warnings: [],
        messageCount: 0,
        createdAt: new Date(Date.now() - 259200000).toISOString(),
      },
      {
        id: '5',
        username: 'ShiShi 🥰',
        email: 'shishi@privateconnect.lk',
        password: 'shishi123',
        gender: 'female',
        age18Plus: true,
        verified: true,
        categoryApproved: true,
        priceActivated: true,
        canSetPrice: true,
        status: 'active',
        isAdmin: false,
        profileImage: '/profiles/shishi-profile.jpg',
        description: `🎥 CAM SHOW 🥰😍\n5min - Rs.1000 | 10min - Rs.2000 | 15min - Rs.3000\n20min - Rs.4000 | 25min - Rs.5000 | 30min - Rs.6000\n\n📞 CALL SHOW 💋🍆\n5min - Rs.2000 | 10min - Rs.4000\n20min - Rs.6000 | 30min - Rs.10000\n\n🏠 FULL SERVICE (With Room)\n1 Hour - Rs.6500 (1 shot) 😍\nFull Night - Rs.35000 (Unlimited shots) 😍\n\n📱 WhatsApp: 0764868257`,
        location: 'Colombo',
        chatPrice: 1000,
        voicePrice: 2000,
        videoPrice: 6000,
        whatsappNumber: '0764868257',
        category: 'livecam',
        featured: true,
        viewCount: 1245,
        activationFeeProof: 'PAID-SHISHI-2026',
        subscriptionPlan: '12months',
        subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        subscriptionPaymentProof: 'PREMIUM-12M-SHISHI-2026',
        walletBalance: 0,
        pendingBalance: 0,
        reportCount: 0,
        warnings: [],
        messageCount: 0,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        verificationSelfie: '/profiles/shishi-profile.jpg',
      },
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(sampleUsers));
  }
};

export const getUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
};

export const loginUser = (email: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (user && user.status === 'active') {
    // SECURITY: Only jayakodyarachchigemahisha@gmail.com can be admin
    if (user.isAdmin && user.email !== 'jayakodyarachchigemahisha@gmail.com') {
      // Demote unauthorized admin
      user.isAdmin = false;
      updateUser(user.id, { isAdmin: false });
    }
    setCurrentUser(user);
    return user;
  }
  return null;
};

export const registerUser = (userData: Omit<User, 'id' | 'createdAt' | 'viewCount'>): User => {
  const users = getUsers();
  
  // SECURITY: Verify that verificationSelfie exists (MANDATORY)
  if (!userData.verificationSelfie) {
    throw new Error('🚨 SECURITY ERROR: Live selfie verification is MANDATORY. Cannot register without selfie.');
  }
  
  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    viewCount: 0,
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const updateUser = (userId: string, updates: Partial<User>): void => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
    
    // Update current user if it's the same user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(users[index]);
    }
  }
};

export const incrementViewCount = (userId: string): void => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    user.viewCount = (user.viewCount || 0) + 1;
    saveUsers(users);
  }
};

/**
 * Upload file to Supabase Storage
 */
export const uploadFile = async (
  bucket: 'profile-images' | 'verification-selfies',
  file: File | Blob,
  path: string
): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error: any) {
    console.error('Upload error:', error);
    throw new Error('File upload failed: ' + error.message);
  }
};

/**
 * Delete file from Supabase Storage
 */
export const deleteFile = async (
  bucket: 'profile-images' | 'verification-selfies',
  path: string
): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  } catch (error: any) {
    console.error('Delete error:', error);
    throw new Error('File deletion failed: ' + error.message);
  }
};
