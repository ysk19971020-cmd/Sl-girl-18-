import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { Shield, User } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = login(email, password);
    if (success) {
      navigate('/home');
    } else {
      setError('Invalid email or password. Your account may be blocked.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Promotional Hero Banner */}
      <div className="relative w-full">
        <img
          src="/promo-banner.jpg"
          alt="PrivateConnect - Verified Adult Profiles Only"
          className="w-full h-auto max-h-[400px] object-contain bg-black"
        />
      </div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-md mx-auto">
          {/* 3D Form Container */}
          <div className="form-container-3d rounded-2xl p-8 md:p-10">
            {/* Logo/Icon */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600 rounded-3xl flex items-center justify-center mb-4 shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <Shield className="text-white" size={40} />
              </div>
              {/* Brand Name */}
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-3 tracking-tight">
                YOUR SEXY
              </h1>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600 text-sm">
                Sign in to SL Girl Online
              </p>
            </div>
          
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="h-12 px-4 text-base border-2 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-12 px-4 text-base border-2 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 text-sm p-4 rounded-xl font-medium">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-bold btn-3d bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 hover:from-pink-700 hover:via-purple-700 hover:to-blue-700 text-white"
              >
                Sign In
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">
                    New to SL Girl Online?
                  </span>
                </div>
              </div>

              <Link to="/register">
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-base font-bold border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all"
                >
                  <User size={18} className="mr-2" />
                  Create New Account
                </Button>
              </Link>
            </form>
          </div>

          {/* Security Notice */}
          <div className="text-center mt-6 text-white/90 text-sm backdrop-blur-sm bg-black/20 rounded-xl p-4">
            <p className="font-medium">🔒 Secure Login</p>
            <p className="text-xs text-white/70 mt-1">
              Your connection is encrypted and secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
