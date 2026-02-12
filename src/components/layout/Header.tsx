import { Link, useNavigate } from 'react-router-dom';
import { User, PlusCircle, Menu, X, Wallet, Shield, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoggedIn, currentUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="gradient-header text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                PC
              </span>
            </div>
            <span className="text-xl font-bold hidden sm:block">SL Girl Online</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 overflow-x-auto">
            {isLoggedIn ? (
              <>
                {currentUser?.isAdmin ? (
                  // Admin user interface
                  <>
                    <Button
                      onClick={() => navigate('/admin')}
                      variant="default"
                      size="sm"
                      className="flex items-center gap-1 flex-shrink-0 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                    >
                      <Shield size={16} />
                      Admin Panel
                    </Button>
                    <Button
                      onClick={() => navigate('/moderation')}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 flex-shrink-0 border-white/40 text-white hover:bg-white/20"
                    >
                      <Shield size={14} />
                      Moderation
                    </Button>
                    <Button
                      onClick={() => navigate('/home')}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 flex-shrink-0"
                    >
                      View Site
                    </Button>
                    <Button onClick={handleLogout} variant="ghost" size="sm" className="text-white hover:bg-white/20 flex-shrink-0">
                      Logout
                    </Button>
                  </>
                ) : (
                  // Regular user interface
                  <>
                    <Button
                      onClick={() => navigate('/home')}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 flex-shrink-0"
                    >
                      All Profiles
                    </Button>
                    <Button
                      onClick={() => navigate('/wallet')}
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-1 flex-shrink-0"
                    >
                      <Wallet size={16} />
                      <span className="hidden lg:inline">Wallet</span>
                    </Button>
                    <Button
                      onClick={() => navigate('/dashboard')}
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-1 flex-shrink-0"
                    >
                      <User size={16} />
                      <span className="max-w-[80px] truncate">{currentUser?.username}</span>
                    </Button>
                    <Button onClick={handleLogout} variant="ghost" size="sm" className="text-white hover:bg-white/20 flex-shrink-0">
                      Logout
                    </Button>
                  </>
                )}
              </>
            ) : (
              // Not logged in - Public interface
              <>
                <Button
                  onClick={() => navigate('/home')}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 flex-shrink-0"
                >
                  All Profiles
                </Button>
                <Button
                  onClick={() => navigate('/login')}
                  variant="secondary"
                  size="sm"
                  className="flex-shrink-0"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate('/admin/login')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 flex-shrink-0 border-red-500/60 text-red-300 hover:bg-red-500/20"
                >
                  <Shield size={14} />
                  <span className="hidden lg:inline">Admin</span>
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  variant="default"
                  size="sm"
                  className="flex-shrink-0"
                >
                  Register
                </Button>
                <Button
                  onClick={() => navigate('/post-profile')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 flex-shrink-0 border-white/40 text-white hover:bg-white/20"
                >
                  <PlusCircle size={16} />
                  <span className="hidden lg:inline">Post Profile</span>
                </Button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-2 flex flex-col gap-2">
            {isLoggedIn ? (
              <>
                {currentUser?.isAdmin ? (
                  // Admin mobile menu
                  <>
                    <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-2 mb-2">
                      <p className="text-xs text-yellow-300 font-bold px-2 mb-2">⭐ Admin Tools</p>
                      <Button
                        onClick={() => {
                          navigate('/admin');
                          setIsMobileMenuOpen(false);
                        }}
                        variant="default"
                        size="sm"
                        className="justify-start w-full mb-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                      >
                        🛡️ Admin Panel
                      </Button>
                      <Button
                        onClick={() => {
                          navigate('/moderation');
                          setIsMobileMenuOpen(false);
                        }}
                        variant="outline"
                        size="sm"
                        className="justify-start w-full border-yellow-500/40 text-white hover:bg-yellow-500/20"
                      >
                        ⚠️ Moderation
                      </Button>
                    </div>
                    <Button
                      onClick={() => {
                        navigate('/home');
                        setIsMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 justify-start"
                    >
                      🌐 View Website
                    </Button>
                    <div className="border-t border-white/20 my-2"></div>
                    <Button onClick={handleLogout} variant="ghost" size="sm" className="text-white hover:bg-white/20 justify-start">
                      🚪 Logout
                    </Button>
                  </>
                ) : (
                  // Regular user mobile menu
                  <>
                    <Button
                      onClick={() => {
                        navigate('/home');
                        setIsMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 justify-start"
                    >
                      🏠 All Profiles
                    </Button>
                    <Button
                      onClick={() => {
                        navigate('/wallet');
                        setIsMobileMenuOpen(false);
                      }}
                      variant="secondary"
                      size="sm"
                      className="justify-start"
                    >
                      💰 Wallet
                    </Button>
                    <Button
                      onClick={() => {
                        navigate('/dashboard');
                        setIsMobileMenuOpen(false);
                      }}
                      variant="secondary"
                      size="sm"
                      className="justify-start"
                    >
                      👤 My Account
                    </Button>
                    <div className="border-t border-white/20 my-2"></div>
                    <Button onClick={handleLogout} variant="ghost" size="sm" className="text-white hover:bg-white/20 justify-start">
                      🚪 Logout
                    </Button>
                  </>
                )}
              </>
            ) : (
              // Not logged in - Public mobile menu
              <>
                <Button
                  onClick={() => {
                    navigate('/home');
                    setIsMobileMenuOpen(false);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 justify-start"
                >
                  🏠 All Profiles
                </Button>
                <Button
                  onClick={() => {
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                  }}
                  variant="secondary"
                  size="sm"
                  className="justify-start"
                >
                  🔐 Login
                </Button>
                <Button
                  onClick={() => {
                    navigate('/admin/login');
                    setIsMobileMenuOpen(false);
                  }}
                  variant="outline"
                  size="sm"
                  className="justify-start border-red-500/40 text-red-300 hover:bg-red-500/20"
                >
                  🛡️ Admin Login
                </Button>
                <Button
                  onClick={() => {
                    navigate('/register');
                    setIsMobileMenuOpen(false);
                  }}
                  variant="default"
                  size="sm"
                  className="justify-start"
                >
                  📝 Register
                </Button>
                <Button
                  onClick={() => {
                    navigate('/post-profile');
                    setIsMobileMenuOpen(false);
                  }}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                >
                  ➕ Post Profile
                </Button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
