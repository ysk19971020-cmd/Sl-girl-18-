import { User, Withdrawal, ChatSession } from '@/types';
import { getUsers, saveUsers, updateUser } from './storage';
import { getPlatformSettings } from './session';
import { v4 as uuidv4 } from 'uuid';

// Re-export getPlatformSettings for convenience
export { getPlatformSettings } from './session';

const WITHDRAWALS_KEY = 'privateconnect_withdrawals';
const ADMIN_WALLET_KEY = 'privateconnect_admin_wallet';

// Withdrawal Management
export const getWithdrawals = (): Withdrawal[] => {
  const data = localStorage.getItem(WITHDRAWALS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveWithdrawals = (withdrawals: Withdrawal[]) => {
  localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(withdrawals));
};

export const requestWithdrawal = (
  userId: string,
  amount: number,
  method: 'bank' | 'binance',
  details: string
): Withdrawal => {
  const withdrawals = getWithdrawals();
  
  const withdrawal: Withdrawal = {
    id: uuidv4(),
    userId,
    amount,
    method,
    details,
    status: 'pending',
    requestedAt: new Date().toISOString(),
  };
  
  withdrawals.push(withdrawal);
  saveWithdrawals(withdrawals);
  
  // Move from available to pending balance
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    updateUser(userId, {
      walletBalance: (user.walletBalance || 0) - amount,
      pendingBalance: (user.pendingBalance || 0) + amount,
    });
  }
  
  return withdrawal;
};

export const approveWithdrawal = (withdrawalId: string, adminId: string) => {
  const withdrawals = getWithdrawals();
  const withdrawal = withdrawals.find(w => w.id === withdrawalId);
  
  if (withdrawal && withdrawal.status === 'pending') {
    withdrawal.status = 'approved';
    withdrawal.processedAt = new Date().toISOString();
    withdrawal.processedBy = adminId;
    saveWithdrawals(withdrawals);
    
    // Remove from pending balance
    const users = getUsers();
    const user = users.find(u => u.id === withdrawal.userId);
    if (user) {
      updateUser(withdrawal.userId, {
        pendingBalance: (user.pendingBalance || 0) - withdrawal.amount,
      });
    }
  }
};

export const rejectWithdrawal = (withdrawalId: string, adminId: string) => {
  const withdrawals = getWithdrawals();
  const withdrawal = withdrawals.find(w => w.id === withdrawalId);
  
  if (withdrawal && withdrawal.status === 'pending') {
    withdrawal.status = 'rejected';
    withdrawal.processedAt = new Date().toISOString();
    withdrawal.processedBy = adminId;
    saveWithdrawals(withdrawals);
    
    // Return to available balance
    const users = getUsers();
    const user = users.find(u => u.id === withdrawal.userId);
    if (user) {
      updateUser(withdrawal.userId, {
        walletBalance: (user.walletBalance || 0) + withdrawal.amount,
        pendingBalance: (user.pendingBalance || 0) - withdrawal.amount,
      });
    }
  }
};

// Admin Wallet
export const getAdminWallet = () => {
  const data = localStorage.getItem(ADMIN_WALLET_KEY);
  return data ? JSON.parse(data) : { balance: 0 };
};

export const updateAdminWallet = (amount: number) => {
  const wallet = getAdminWallet();
  wallet.balance += amount;
  localStorage.setItem(ADMIN_WALLET_KEY, JSON.stringify(wallet));
};

/**
 * Process payment and split commission
 * Called when a session is created
 */
export const processPayment = (session: ChatSession) => {
  const settings = getPlatformSettings();
  const commissionAmount = (session.amount * session.commission) / 100;
  const providerAmount = session.amount - commissionAmount;
  
  // Credit provider wallet
  const users = getUsers();
  const provider = users.find(u => u.id === session.providerId);
  if (provider) {
    updateUser(session.providerId, {
      walletBalance: (provider.walletBalance || 0) + providerAmount,
    });
  }
  
  // Credit admin wallet
  updateAdminWallet(commissionAmount);
  
  // Deduct from caller (in real app, this would charge their payment method)
  const caller = users.find(u => u.id === session.callerId);
  if (caller) {
    updateUser(session.callerId, {
      walletBalance: (caller.walletBalance || 0) - session.amount,
    });
  }
};
