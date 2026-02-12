import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { registerUser, uploadFile } from '@/lib/storage';
import { useAuthStore } from '@/stores/authStore';
import { AlertCircle, Camera, Shield, Check, DollarSign, CreditCard } from 'lucide-react';
import { Category } from '@/types';
import LiveSelfieCapture from '@/components/features/LiveSelfieCapture';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'female' as 'male' | 'female' | 'other',
    category: '' as Category | '',
    age18Plus: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSelfieCapture, setShowSelfieCapture] = useState(false);
  const [selfieBlob, setSelfieBlob] = useState<Blob | null>(null);
  const [selfiePreview, setSelfiePreview] = useState('');
  
  // Subscription Plan (Optional)
  const [selectedPlan, setSelectedPlan] = useState<'none' | '1month' | '3month' | '6month' | '12month'>('none');
  const [paymentProof, setPaymentProof] = useState('');
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSelfieCapture = (blob: Blob) => {
    setSelfieBlob(blob);
    setSelfiePreview(URL.createObjectURL(blob));
    setShowSelfieCapture(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.age18Plus) {
      setError('You must confirm you are 18 years or older');
      return;
    }

    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    if (formData.category === 'all' || formData.category === 'verified') {
      setError('Please select a valid category (not "All" or "Verified")');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (!selfieBlob) {
      setError('🚨 LIVE SELFIE REQUIRED: Please capture a live selfie for verification (MANDATORY)');
      setLoading(false);
      return;
    }

    // Validate payment proof if plan selected
    if (selectedPlan !== 'none' && !paymentProof.trim()) {
      setError('💳 Subscription plan තෝරලා තියෙනවා නම් payment proof එක ඇතුළත් කරන්න (හෝ "Skip for now" තෝරන්න)');
      setLoading(false);
      return;
    }

    try {
      // Upload verification selfie (admin only access)
      const selfiePath = `${Date.now()}-${formData.username}-verification.jpg`;
      const verificationSelfieUrl = await uploadFile('verification-selfies', selfieBlob, selfiePath);

      // Use selfie as profile image (no separate upload needed)
      const profileSelfieUrl = verificationSelfieUrl;

      // Prepare subscription data
      let subscriptionPlan = undefined;
      let subscriptionPaymentProof = undefined;
      
      if (selectedPlan !== 'none' && paymentProof.trim()) {
        const planMapping: Record<string, string> = {
          '1month': '1 Month - $25',
          '3month': '3 Months - $50',
          '6month': '6 Months - $75',
          '12month': '12 Months - $100',
        };
        subscriptionPlan = planMapping[selectedPlan];
        subscriptionPaymentProof = paymentProof;
      }

      const newUser = registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        gender: formData.gender,
        age18Plus: formData.age18Plus,
        category: formData.category,
        profileImage: profileSelfieUrl,
        verificationSelfie: verificationSelfieUrl,
        verified: false,
        categoryApproved: false,
        priceActivated: false,
        canSetPrice: false,
        status: 'active',
        isAdmin: false,
        chatPrice: 0,
        voicePrice: 0,
        videoPrice: 0,
        activationFeeProof: subscriptionPaymentProof,
      });

      // Auto login after registration
      login(formData.email, formData.password);
      navigate('/home');
    } catch (err: any) {
      setError('Registration failed: ' + (err.message || 'Unknown error'));
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
          alt="PrivateConnect - Verified Adult Profiles Only"
          className="w-full h-auto max-h-[400px] object-contain bg-black"
        />
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* 3D Form Container */}
          <div className="form-container-3d rounded-2xl p-6 md:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600 rounded-3xl flex items-center justify-center mb-3 shadow-2xl">
                <Shield className="text-white" size={32} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Join SL Girl Online
              </h1>
              <p className="text-gray-600 text-sm">
                Create your verified account - All fields mandatory
              </p>
            </div>
          
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Username <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    placeholder="Your display name"
                    className="h-11 border-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="your@email.com"
                    className="h-11 border-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Gender <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full h-11 p-2 border-2 border-gray-200 rounded-md bg-white text-gray-900 font-medium focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    required
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Category <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                    className="w-full h-11 p-2 border-2 border-gray-200 rounded-md bg-white text-gray-900 font-medium focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                    required
                  >
                    <option value="">-- Select Category --</option>
                    <option value="girls">Girls Personal</option>
                    <option value="boys">Boys Personal</option>
                    <option value="livecam">Live Cam</option>
                    <option value="spa">Spa</option>
                    <option value="others">Others</option>
                  </select>
                </div>
              </div>

              {/* MANDATORY: Live Selfie Verification - Will be used as profile image */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-xl p-4">
                <label className="block text-sm font-bold mb-2 text-red-900 flex items-center gap-2">
                  <Camera className="text-red-600" size={18} />
                  🚨 LIVE SELFIE VERIFICATION (MANDATORY) <span className="text-red-600">*</span>
                </label>
                
                {selfiePreview ? (
                  <div className="relative">
                    <img src={selfiePreview} alt="Verification Selfie" className="w-full h-48 object-cover rounded-lg" />
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm font-bold">
                      <Check size={16} />
                      Selfie Captured
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="absolute top-2 right-2 bg-white"
                      onClick={() => setShowSelfieCapture(true)}
                    >
                      <Camera size={16} className="mr-2" />
                      Retake
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setShowSelfieCapture(true)}
                    className="w-full h-14 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold"
                  >
                    <Camera size={20} className="mr-2" />
                    📸 Capture Live Selfie NOW (Compulsory)
                  </Button>
                )}

                <div className="bg-red-100 border border-red-400 rounded-lg p-3 mt-3 text-xs text-red-900 space-y-1">
                  <p className="font-bold">🚨 ANTI-FRAUD REQUIREMENTS:</p>
                  <ul className="space-y-0.5 ml-4">
                    <li>• Take a LIVE selfie using your camera (required)</li>
                    <li>• Your face must be CLEARLY VISIBLE</li>
                    <li>• Admin will verify this selfie before approval</li>
                    <li>• This selfie will be your profile picture</li>
                    <li>• This prevents fake profiles and scams</li>
                    <li>• Cannot proceed without live selfie</li>
                  </ul>
                </div>
              </div>

              {/* OPTIONAL: Subscription Plan Selection */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-xl p-4">
                <h3 className="text-sm font-bold mb-3 text-yellow-900 flex items-center gap-2">
                  <DollarSign className="text-yellow-600" size={18} />
                  💰 Subscription Plan (OPTIONAL - Skip කරන්න පුළුවන්)
                </h3>
                
                <div className="space-y-2">
                  {/* Skip Option */}
                  <label className="flex items-center gap-3 p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-white transition">
                    <input
                      type="radio"
                      name="plan"
                      value="none"
                      checked={selectedPlan === 'none'}
                      onChange={(e) => setSelectedPlan(e.target.value as any)}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">⏩ Skip for now (Register පමණක්)</p>
                      <p className="text-xs text-gray-600">පසුව dashboard එකෙන් buy කරන්න පුළුවන්</p>
                    </div>
                  </label>

                  {/* 1 Month - $25 */}
                  <label className="flex items-center gap-3 p-3 border-2 border-pink-300 rounded-lg cursor-pointer hover:bg-pink-50 transition">
                    <input
                      type="radio"
                      name="plan"
                      value="1month"
                      checked={selectedPlan === '1month'}
                      onChange={(e) => setSelectedPlan(e.target.value as any)}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-pink-900">📅 1 Month Plan</p>
                        <p className="font-bold text-pink-600">$25</p>
                      </div>
                      <p className="text-xs text-pink-700 mt-1">+ $12.50 wallet bonus</p>
                    </div>
                  </label>

                  {/* 3 Months - $50 */}
                  <label className="flex items-center gap-3 p-3 border-2 border-purple-300 rounded-lg cursor-pointer hover:bg-purple-50 transition">
                    <input
                      type="radio"
                      name="plan"
                      value="3month"
                      checked={selectedPlan === '3month'}
                      onChange={(e) => setSelectedPlan(e.target.value as any)}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-purple-900">📅 3 Months Plan</p>
                        <p className="font-bold text-purple-600">$50</p>
                      </div>
                      <p className="text-xs text-purple-700 mt-1">+ $25.00 wallet bonus</p>
                    </div>
                  </label>

                  {/* 6 Months - $75 */}
                  <label className="flex items-center gap-3 p-3 border-2 border-blue-300 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                    <input
                      type="radio"
                      name="plan"
                      value="6month"
                      checked={selectedPlan === '6month'}
                      onChange={(e) => setSelectedPlan(e.target.value as any)}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-blue-900">📅 6 Months Plan</p>
                        <p className="font-bold text-blue-600">$75</p>
                      </div>
                      <p className="text-xs text-blue-700 mt-1">+ $37.50 wallet bonus</p>
                    </div>
                  </label>

                  {/* 12 Months - $100 */}
                  <label className="flex items-center gap-3 p-3 border-2 border-green-300 rounded-lg cursor-pointer hover:bg-green-50 transition">
                    <input
                      type="radio"
                      name="plan"
                      value="12month"
                      checked={selectedPlan === '12month'}
                      onChange={(e) => setSelectedPlan(e.target.value as any)}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-green-900">📅 12 Months Plan ⭐ BEST VALUE</p>
                        <p className="font-bold text-green-600">$100</p>
                      </div>
                      <p className="text-xs text-green-700 mt-1">+ $50.00 wallet bonus</p>
                    </div>
                  </label>
                </div>

                {/* Payment Proof Input - Only show if plan selected */}
                {selectedPlan !== 'none' && (
                  <div className="mt-4">
                    <label className="block text-sm font-semibold mb-2 text-yellow-900">
                      Payment Proof <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={paymentProof}
                      onChange={(e) => setPaymentProof(e.target.value)}
                      placeholder="Bank transfer receipt, Binance TXID, PayPal confirmation, හෝ screenshot link ඇතුළත් කරන්න"
                      className="w-full min-h-[80px] px-3 py-2 rounded-md border-2 border-yellow-300 bg-white text-gray-900"
                    />
                    <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-2 mt-2 text-xs text-yellow-900">
                      <p className="font-bold mb-1">💳 Payment Details:</p>
                      <p>• Bank: Sampath Bank - 105057458082 (J A Y S Kavinda)</p>
                      <p>• Crypto: Contact admin for wallet address</p>
                      <p>• WhatsApp: +94 76 585 1997</p>
                    </div>
                  </div>
                )}

                <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-3 mt-3 text-xs text-yellow-900">
                  <p className="font-bold mb-1">📌 Subscription Benefits:</p>
                  <ul className="space-y-0.5 ml-4">
                    <li>✅ Video Call & Photo Send features unlock</li>
                    <li>✅ WhatsApp number visible to paid users</li>
                    <li>✅ 50% wallet bonus (visible to other users)</li>
                    <li>✅ Can set custom pricing</li>
                    <li>⚠️ Admin verification required after payment</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Password <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    placeholder="••••••••"
                    minLength={6}
                    className="h-11 border-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Confirm Password <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    placeholder="••••••••"
                    className="h-11 border-2"
                  />
                </div>
              </div>

              {/* Age Confirmation */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.age18Plus}
                    onChange={(e) => setFormData({ ...formData, age18Plus: e.target.checked })}
                    className="mt-1 w-5 h-5"
                    required
                  />
                  <div>
                    <span className="text-sm font-bold text-purple-900">
                      I confirm I am 18 years or older <span className="text-red-600">*</span>
                    </span>
                    <p className="text-xs text-purple-700 mt-1">
                      🔞 This platform is for adults only (18+)
                    </p>
                  </div>
                </label>
              </div>

              {/* Registration Notice */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-4 flex gap-3">
                <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
                <div className="text-sm text-blue-900">
                  <p className="font-bold mb-2">📋 Account Approval Process</p>
                  <ul className="text-xs space-y-1">
                    <li>✓ Admin will verify your selfie photo</li>
                    <li>✓ Gender and category verification required</li>
                    <li>✓ Profile visible only after approval</li>
                    <li>✓ Pay $30/month for video call & photo send features</li>
                  </ul>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-300 text-red-900 text-sm p-4 rounded-xl flex items-start gap-2 font-medium">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading || !selfieBlob}
                className="w-full h-12 text-base font-bold btn-3d bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 hover:from-pink-700 hover:via-purple-700 hover:to-blue-700 text-white disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <div className="text-center text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                Already have an account?{' '}
                <Link to="/login" className="text-purple-600 hover:text-purple-700 font-bold hover:underline">
                  Login here
                </Link>
              </div>
            </form>
          </div>

          {/* Security Notice */}
          <div className="text-center mt-4 text-white/90 text-sm backdrop-blur-sm bg-black/20 rounded-xl p-3">
            <p className="font-medium">🔒 Your data is protected</p>
          </div>
        </div>
      </div>

      {/* Live Selfie Capture Modal */}
      {showSelfieCapture && (
        <LiveSelfieCapture
          onCapture={handleSelfieCapture}
          onClose={() => setShowSelfieCapture(false)}
        />
      )}
    </div>
  );
}
