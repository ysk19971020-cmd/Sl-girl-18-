import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Shield, Mail, Lock, User, Camera, CheckCircle } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ADMIN_EMAIL = 'jayakodyarachchigemahisha@gmail.com';

export default function AdminRegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: ADMIN_EMAIL,
    password: 'Admin@2026',
    confirmPassword: 'Admin@2026',
    username: 'J A Y S Kavinda',
  });
  const [selfieData, setSelfieData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  const handleSelfieCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelfieData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendOtp = async () => {
    setError('');
    setSendingOtp(true);

    try {
      console.log('📧 Sending OTP to:', formData.email);

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (otpError) throw otpError;

      console.log('✅ OTP sent successfully!');
      setOtpSent(true);
      setError('');
    } catch (err: any) {
      console.error('❌ OTP send error:', err);
      setError(`Failed to send OTP: ${err.message}`);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password.length < 6) {
      setError('⚠️ Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('⚠️ Passwords do not match');
      return;
    }

    // Validation
    if (!otpSent) {
      setError('⚠️ Please send and verify OTP first');
      return;
    }

    if (!otp || otp.length < 4) {
      setError('⚠️ Please enter the OTP code from your email');
      return;
    }

    setLoading(true);

    try {
      console.log('🚀 Starting admin registration...');

      // Step 1: Verify OTP and create auth user
      const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: otp,
        type: 'email',
      });

      console.log('📧 OTP verification result:', { authData, verifyError });

      if (verifyError) throw verifyError;

      if (!authData.user) {
        throw new Error('Failed to verify OTP');
      }

      console.log('✅ OTP verified, user created:', authData.user.id);

      // Step 2: Set password for the user
      const { error: passwordError } = await supabase.auth.updateUser({
        password: formData.password,
        data: {
          username: formData.username,
          is_admin: true,
        },
      });

      if (passwordError) {
        console.error('Password update error:', passwordError);
      } else {
        console.log('✅ Password set successfully');
      }

      // Step 3: Upload selfie if provided
      let profileImageUrl = '';
      if (selfieData) {
        try {
          const selfieBlob = await fetch(selfieData).then(r => r.blob());
          const selfiePath = `${authData.user.id}/verification-selfie.jpg`;
          
          const { error: uploadError } = await supabase.storage
            .from('verification-selfies')
            .upload(selfiePath, selfieBlob, {
              cacheControl: '3600',
              upsert: true,
            });

          if (uploadError) {
            console.error('Selfie upload error:', uploadError);
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('verification-selfies')
              .getPublicUrl(selfiePath);
            profileImageUrl = publicUrl;
          }
        } catch (err) {
          console.error('Selfie processing error:', err);
        }
      }

      // Step 4: Wait for trigger to create profile, then update it
      console.log('⏳ Waiting for profile creation...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          is_admin: true,
          verified: true,
          category_approved: true,
          price_activated: true,
          can_set_price: true,
          status: 'active',
          username: formData.username,
          description: 'System Administrator - J A Y S Kavinda',
          location: 'Colombo',
          gender: 'male',
          age_18_plus: true,
          category: 'boys',
          profile_image: profileImageUrl || '',
        })
        .eq('id', authData.user.id);

      console.log('🔄 Profile update result:', { updateError });

      if (updateError) {
        console.error('Profile update error:', updateError);
      }

      console.log('🎉 Admin account created successfully!');

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/login');
      }, 2000);

    } catch (err: any) {
      console.error('❌ Registration error:', err);
      setError(`Registration failed: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: 'linear-gradient(135deg, #0a0e27 0%, #1a1030 25%, #2a1a4a 50%, #1a1030 75%, #0a0e27 100%)',
        }}>
        <div className="max-w-md w-full bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">✅ Admin Account Created!</h2>
          <p className="text-gray-300 mb-4">Redirecting to login page...</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Shield className="w-4 h-4" />
            <span>Administrator privileges activated</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1030 25%, #2a1a4a 50%, #1a1030 75%, #0a0e27 100%)',
      }}>
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Registration</h1>
          <p className="text-gray-300">Create system administrator account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Email (locked) */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Mail className="w-4 h-4" />
              Admin Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={formData.email}
                disabled
                className="flex-1 px-4 py-3 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white opacity-60 cursor-not-allowed"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp || otpSent}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {sendingOtp ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : otpSent ? (
                  '✓ Sent'
                ) : (
                  'Send OTP'
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {otpSent ? (
                <span className="text-green-400">✅ OTP sent to your email! Check your inbox.</span>
              ) : (
                '⚠️ Click "Send OTP" to receive verification code'
              )}
            </p>
          </div>

          {/* OTP Input (shown after OTP is sent) */}
          {otpSent && (
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Mail className="w-4 h-4" />
                Enter OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 4-6 digit code"
                className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white text-center text-2xl tracking-widest focus:border-purple-500 focus:outline-none"
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-400 mt-1 text-center">
                📧 Check your email: {formData.email}
              </p>
            </div>
          )}

          {/* Username */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <User className="w-4 h-4" />
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          {/* Password - Pre-filled */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Lock className="w-4 h-4" />
              Password (Pre-configured)
            </label>
            <div className="px-4 py-3 bg-green-900/20 border border-green-500/30 rounded-lg">
              <p className="text-green-300 font-mono text-sm">Admin@2026</p>
              <p className="text-xs text-gray-400 mt-1">✅ Default admin password - Change after first login</p>
            </div>
          </div>

          {/* Live Selfie (Optional) */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Camera className="w-4 h-4" />
              Live Selfie Verification
              <span className="text-gray-500">(Optional)</span>
            </label>
            
            {!selfieData ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-500/20 rounded-lg cursor-pointer hover:border-purple-500/40 transition-colors bg-gray-800/20">
                <Camera className="w-6 h-6 text-gray-500 mb-2" />
                <span className="text-xs text-gray-500">Click to capture selfie (optional)</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleSelfieCapture}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={selfieData}
                  alt="Selfie"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setSelfieData(null)}
                  className="absolute top-2 right-2 px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating Admin Account...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Create Admin Account
              </>
            )}
          </button>

          {/* Back to Login */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/admin/login')}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              ← Back to Admin Login
            </button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <p className="text-xs text-yellow-200">
            <strong>🔒 Security Notice:</strong> This page creates a system administrator account with full privileges. Only authorized personnel should access this page.
          </p>
        </div>
      </div>
    </div>
  );
}
