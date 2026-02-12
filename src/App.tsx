import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import AdminRegisterPage from '@/pages/AdminRegisterPage';
import RegisterPage from '@/pages/RegisterPage';
import ProfilePage from '@/pages/ProfilePage';
import DashboardPage from '@/pages/DashboardPage';
import AdminPage from '@/pages/AdminPage';
import PostProfilePage from '@/pages/PostProfilePage';
import ChatPage from '@/pages/ChatPage';
import CallPage from '@/pages/CallPage';
import WalletPage from '@/pages/WalletPage';
import ModerationPanel from '@/pages/ModerationPanel';
import WithdrawalManagement from '@/pages/WithdrawalManagement';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/register" element={<AdminRegisterPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/post-profile" element={<PostProfilePage />} />
        <Route path="/chat/:sessionId" element={<ChatPage />} />
        <Route path="/call/:sessionId" element={<CallPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/moderation" element={<ModerationPanel />} />
        <Route path="/withdrawals" element={<WithdrawalManagement />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Routes>
    </Router>
  );
}

export default App;
