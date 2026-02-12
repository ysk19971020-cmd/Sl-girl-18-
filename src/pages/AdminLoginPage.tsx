import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ADMIN_EMAIL = 'jayakodyarachchigemahisha@gmail.com';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // SECURITY: Only allow admin email
      if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        setError('⛔ UNAUTHORIZED: This login is restricted to authorized administrators only.');
        setLoading(false);
        return;
      }

      // Sign in with Supabase Auth
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(`❌ Login failed: ${signInError.message}`);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError('❌ Login failed: No user data returned');
        setLoading(false);
        return;
      }

      // Fetch user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        setError('❌ Failed to fetch user profile');
        setLoading(false);
        return;
      }

      // Verify admin status
      if (!profile.is_admin) {
        setError('⛔ ACCESS DENIED: Account is not authorized for admin panel.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Success - update auth store with admin user
      login(profile.email, password); // Update local auth store
      navigate('/admin');
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(`❌ Login error: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Promotional Hero Banner */}
      <div className="relative w-full">
        <img
          src="/promo-banner.jpg"
          alt="PrivateConnect - Admin Access"
          className="w-full h-auto max-h-[400px] object-contain bg-black"
        />
      </div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Security Warning */}
          <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-500 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="font-bold text-red-900 dark:text-red-200 mb-1">
                🚨 RESTRICTED AREA
              </p>
              <p className="text-sm text-red-800 dark:text-red-300">
                This login is exclusively for authorized system administrators. Unauthorized access attempts are logged and monitored.
              </p>
            </div>
          </div>

          {/* 3D Form Container */}
          <div className="form-container-3d rounded-2xl p-8 md:p-10">
            {/* Logo/Icon */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-600 via-orange-600 to-yellow-600 rounded-3xl flex items-center justify-center mb-4 shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <Shield className="text-white" size={40} />
              </div>
              {/* Brand Name */}
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-3 tracking-tight">
                ADMIN PANEL
              </h1>
              <h2 className="text-xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-2">
                System Administrator Login
              </h2>
              <p className="text-gray-600 text-sm flex items-center justify-center gap-2">
                <Lock size={14} />
                Authorized Personnel Only
              </p>
            </div>
          
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Admin Email Notice */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-blue-400 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-900 dark:text-blue-200 font-semibold text-center">
                  🔐 Authorized Admin Email Only
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-300 text-center mt-1">
                  {ADMIN_EMAIL}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Admin Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={ADMIN_EMAIL}
                  className="h-12 px-4 text-base border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Admin Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-12 px-4 text-base border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 text-sm p-4 rounded-xl font-medium flex items-start gap-2">
                  <AlertTriangle className="flex-shrink-0 mt-0.5" size={16} />
                  <span>{error}</span>
                </div>
              )}

              <Button 
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-bold btn-3d bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-700 hover:via-orange-700 hover:to-yellow-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield size={18} className="mr-2" />
                    Access Admin Panel
                  </>
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">
                    Not an admin?
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link to="/login">
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-sm font-bold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
                  >
                    ← User Login
                  </Button>
                </Link>
                <Link to="/admin/register">
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-sm font-bold border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all"
                  >
                    Register Admin →
                  </Button>
                </Link>
              </div>
            </form>
          </div>

          {/* Security Notice */}
          <div className="text-center mt-6 text-white/90 text-sm backdrop-blur-sm bg-black/20 rounded-xl p-4">
            <p className="font-medium">🔒 Secure Admin Access</p>
            <p className="text-xs text-white/70 mt-1">
              All login attempts are encrypted and monitored
            </p>
            <p className="text-xs text-white/60 mt-2">
              Authorized Admin: J A Y S Kavinda
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
