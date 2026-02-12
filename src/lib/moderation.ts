import { Report, Warning, User } from '@/types';
import { getUsers, updateUser } from './storage';
import { v4 as uuidv4 } from 'uuid';

const REPORTS_KEY = 'privateconnect_reports';

// Report Management
export const getReports = (): Report[] => {
  const data = localStorage.getItem(REPORTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveReports = (reports: Report[]) => {
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
};

export const createReport = (
  reporterId: string,
  reportedUserId: string,
  type: 'profile' | 'message' | 'call',
  reason: 'scam' | 'fake_profile' | 'abuse' | 'other',
  details: string
): Report => {
  const reports = getReports();
  
  const report: Report = {
    id: uuidv4(),
    reporterId,
    reportedUserId,
    type,
    reason,
    details,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  
  reports.push(report);
  saveReports(reports);
  
  // Increment report count on user
  const users = getUsers();
  const reportedUser = users.find(u => u.id === reportedUserId);
  if (reportedUser) {
    updateUser(reportedUserId, {
      reportCount: (reportedUser.reportCount || 0) + 1,
    });
    
    // Auto-flag if multiple reports
    if ((reportedUser.reportCount || 0) >= 3) {
      // Auto-suspend for review
      updateUser(reportedUserId, {
        status: 'suspended',
      });
    }
  }
  
  return report;
};

export const reviewReport = (reportId: string, adminId: string, action: 'dismiss' | 'warn' | 'suspend' | 'ban') => {
  const reports = getReports();
  const report = reports.find(r => r.id === reportId);
  
  if (!report) return;
  
  report.status = 'reviewed';
  report.reviewedBy = adminId;
  report.reviewedAt = new Date().toISOString();
  saveReports(reports);
  
  const users = getUsers();
  const user = users.find(u => u.id === report.reportedUserId);
  if (!user) return;
  
  switch (action) {
    case 'warn':
      const warning: Warning = {
        id: uuidv4(),
        reason: report.reason,
        issuedBy: adminId,
        issuedAt: new Date().toISOString(),
      };
      updateUser(report.reportedUserId, {
        warnings: [...(user.warnings || []), warning],
      });
      break;
    
    case 'suspend':
      updateUser(report.reportedUserId, {
        status: 'suspended',
      });
      break;
    
    case 'ban':
      updateUser(report.reportedUserId, {
        status: 'blocked',
      });
      break;
    
    case 'dismiss':
      // Just mark as reviewed, no action
      break;
  }
};

export const dismissReport = (reportId: string, adminId: string) => {
  const reports = getReports();
  const report = reports.find(r => r.id === reportId);
  
  if (report) {
    report.status = 'dismissed';
    report.reviewedBy = adminId;
    report.reviewedAt = new Date().toISOString();
    saveReports(reports);
  }
};

// Rate Limiting
export const canSendMessage = (userId: string): boolean => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) return false;
  
  const now = Date.now();
  const lastMessageTime = user.lastMessageTime || 0;
  const timeDiff = now - lastMessageTime;
  
  // Reset counter if more than 1 minute has passed
  if (timeDiff > 60000) {
    updateUser(userId, {
      messageCount: 0,
      lastMessageTime: now,
    });
    return true;
  }
  
  // Check if under limit (30 messages per minute)
  const maxMessagesPerMinute = 30;
  const messageCount = user.messageCount || 0;
  if (messageCount >= maxMessagesPerMinute) {
    return false;
  }
  
  // Increment counter
  updateUser(userId, {
    messageCount: messageCount + 1,
    lastMessageTime: now,
  });
  
  return true;
};

// Content Validation
export const containsRestrictedContent = (text: string): boolean => {
  // Check for phone numbers, emails, external links
  const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const urlPattern = /(https?:\/\/|www\.)[^\s]+/;
  const whatsappPattern = /whatsapp|viber|telegram|signal/i;
  
  return (
    phonePattern.test(text) ||
    emailPattern.test(text) ||
    urlPattern.test(text) ||
    whatsappPattern.test(text)
  );
};
