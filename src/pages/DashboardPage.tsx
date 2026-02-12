import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { updateUser } from '@/lib/storage';
import PhotoGallery from '@/components/features/PhotoGallery';
import PhotoUpload from '@/components/features/PhotoUpload';
import { User as UserIcon, BadgeCheck, AlertCircle, Upload, DollarSign, CheckCircle2, XCircle, CreditCard, X, Image as ImageIcon } from 'lucide-react';

export default function DashboardPage() {
  const { currentUser, isLoggedIn, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    description: currentUser?.description || '',
    location: currentUser?.location || '',
    whatsappNumber: currentUser?.whatsappNumber || '',
    age: currentUser?.age || 21,
    chatPrice: currentUser?.chatPrice || 0,
    voicePrice: currentUser?.voicePrice || 0,
    videoPrice: currentUser?.videoPrice || 15,
    activationFeeProof: currentUser?.activationFeeProof || '',
  });
  const [message, setMessage] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [photoGalleryKey, setPhotoGalleryKey] = useState(0);

  if (!isLoggedIn || !currentUser) {
    navigate('/login');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only allow price updates if canSetPrice is true
    const updates: any = {
      username: formData.username,
      description: formData.description,
      location: formData.location,
      whatsappNumber: formData.whatsappNumber,
      age: formData.age,
    };

    if (currentUser.canSetPrice) {
      updates.chatPrice = formData.chatPrice;
      updates.voicePrice = formData.voicePrice;
      updates.videoPrice = formData.videoPrice;
    }

    updateUser(currentUser.id, updates);
    refreshUser();
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePhotoUploaded = () => {
    // Force re-render of photo gallery
    setPhotoGalleryKey(prev => prev + 1);
  };

  const handleActivationFeeSubmit = () => {
    if (!formData.activationFeeProof.trim()) {
      setMessage('Please enter payment proof');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    updateUser(currentUser.id, { activationFeeProof: formData.activationFeeProof });
    refreshUser();
    setMessage('Activation fee proof submitted. Waiting for admin approval.');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">My Dashboard</h1>

          {/* Admin Payment Button - Prominent CTA */}
          {!currentUser.canSetPrice && (
            <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 rounded-2xl p-6 text-white shadow-2xl mb-6 card-3d">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
                    <CreditCard size={28} />
                    Unlock Photo & Video Features
                  </h2>
                  <p className="text-white/90 text-sm mb-2">
                    Choose Your Plan • 1-12 months • Earn from worldwide users
                  </p>
                  <p className="text-white/80 text-xs">
                    $25/mo • $50/3mo • $75/6mo • $100/12mo • Set your own prices!
                  </p>
                </div>
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  className="btn-3d bg-white text-purple-700 hover:bg-gray-100 font-bold px-8 py-6 text-lg h-auto rounded-xl shadow-xl"
                >
                  💰 Choose Plan
                </Button>
              </div>
            </div>
          )}

          {/* Status Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <UserIcon className="text-primary" size={20} />
                <span className="text-sm text-muted-foreground">Status</span>
              </div>
              <p className="text-lg font-bold text-foreground">
                {currentUser.status === 'active' ? 'Active' : 'Blocked'}
              </p>
            </div>

            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <BadgeCheck className={currentUser.verified ? 'text-primary' : 'text-muted-foreground'} size={20} />
                <span className="text-sm text-muted-foreground">Verified</span>
              </div>
              <p className="text-lg font-bold text-foreground flex items-center gap-1">
                {currentUser.verified ? <CheckCircle2 className="text-primary" size={18} /> : <XCircle className="text-destructive" size={18} />}
                {currentUser.verified ? 'Yes' : 'No'}
              </p>
            </div>

            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className={currentUser.categoryApproved ? 'text-primary' : 'text-muted-foreground'} size={20} />
                <span className="text-sm text-muted-foreground">Category</span>
              </div>
              <p className="text-lg font-bold text-foreground flex items-center gap-1">
                {currentUser.categoryApproved ? <CheckCircle2 className="text-primary" size={18} /> : <XCircle className="text-destructive" size={18} />}
                {currentUser.categoryApproved ? 'Approved' : 'Pending'}
              </p>
            </div>

            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className={currentUser.canSetPrice ? 'text-primary' : 'text-muted-foreground'} size={20} />
                <span className="text-sm text-muted-foreground">Pricing</span>
              </div>
              <p className="text-lg font-bold text-foreground flex items-center gap-1">
                {currentUser.canSetPrice ? <CheckCircle2 className="text-primary" size={18} /> : <XCircle className="text-destructive" size={18} />}
                {currentUser.canSetPrice ? 'Active' : 'Locked'}
              </p>
            </div>
          </div>

          {/* Alert Messages */}
          {!currentUser.verified && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="text-destructive flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-destructive">Gender Verification Pending</p>
                <p className="text-sm text-muted-foreground">Admin is reviewing your profile photo and gender information.</p>
              </div>
            </div>
          )}

          {currentUser.verified && !currentUser.categoryApproved && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="text-destructive flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-destructive">Category Approval Pending</p>
                <p className="text-sm text-muted-foreground">Admin is reviewing your selected category: <strong>{currentUser.category}</strong></p>
              </div>
            </div>
          )}

          {currentUser.verified && currentUser.categoryApproved && !currentUser.canSetPrice && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="text-destructive flex-shrink-0" size={20} />
              <div className="w-full">
                <p className="font-semibold text-destructive mb-2">Subscribe to Unlock Features</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose a subscription plan to unlock Photo Send & Video Call Features globally.
                </p>
                
                <div className="bg-card rounded-lg p-4 border border-border mb-4">
                  <h4 className="font-semibold text-foreground mb-3">💰 Subscription Plans</h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white text-center">
                      <p className="text-2xl font-bold">$25</p>
                      <p className="text-xs opacity-90">1 Month</p>
                      <p className="text-xs opacity-75 mt-1">30 days</p>
                      <p className="text-xs font-bold mt-2 bg-yellow-400 text-blue-900 rounded px-1">+$12.50 Bonus</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white text-center border-2 border-yellow-400">
                      <p className="text-2xl font-bold">$50</p>
                      <p className="text-xs opacity-90">3 Months</p>
                      <p className="text-xs opacity-75 mt-1">90 days ⭐</p>
                      <p className="text-xs font-bold mt-2 bg-yellow-400 text-purple-900 rounded px-1">+$25.00 Bonus</p>
                    </div>
                    <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-3 text-white text-center">
                      <p className="text-2xl font-bold">$75</p>
                      <p className="text-xs opacity-90">6 Months</p>
                      <p className="text-xs opacity-75 mt-1">180 days 🔥</p>
                      <p className="text-xs font-bold mt-2 bg-yellow-400 text-pink-900 rounded px-1">+$37.50 Bonus</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white text-center border-2 border-yellow-400">
                      <p className="text-2xl font-bold">$100</p>
                      <p className="text-xs opacity-90">12 Months</p>
                      <p className="text-xs opacity-75 mt-1">365 days 💎</p>
                      <p className="text-xs font-bold mt-2 bg-yellow-400 text-green-900 rounded px-1">+$50.00 Bonus</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">🌍 International Payment Options:</p>
                      <ul className="text-xs text-foreground space-y-1 mt-2">
                        <li>• PayPal / Wise / Western Union</li>
                        <li>• Cryptocurrency (USDT, BTC, ETH)</li>
                        <li>• Bank Transfer (International)</li>
                      </ul>
                    </div>
                    
                    <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">💳 Crypto Payment (Preferred)</p>
                      <p className="text-xs text-foreground">Contact admin for wallet addresses</p>
                    </div>
                  </div>
                  
                  <div className="bg-accent/10 border-t border-accent/20 pt-3">
                    <p className="text-xs text-muted-foreground mb-2">📌 After Payment:</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Submit payment proof (receipt/TXID)</li>
                      <li>Admin approval within 24 hours</li>
                      <li>Set your own Photo & Video Call prices</li>
                      <li>Earn from worldwide users during subscription</li>
                      <li>Renew before expiry to maintain access</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-card rounded-lg p-4 border border-border">
                  <h4 className="font-semibold text-foreground mb-2">Submit Payment Proof</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Payment receipt, transaction ID, or crypto TXID (Choose: $25/1mo, $50/3mo, $75/6mo, $100/12mo)
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={formData.activationFeeProof}
                      onChange={(e) => setFormData({ ...formData, activationFeeProof: e.target.value })}
                      placeholder="Payment proof URL or Transaction ID"
                    />
                    <Button type="button" onClick={handleActivationFeeSubmit}>
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentUser.activationFeeProof && !currentUser.canSetPrice && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="text-primary flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-primary">Subscription Payment Submitted</p>
                <p className="text-sm text-muted-foreground">
                  Your payment proof is under review. You'll be notified once approved.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Proof: {currentUser.activationFeeProof}
                </p>
              </div>
            </div>
          )}

          {message && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
              <p className="text-primary font-medium">{message}</p>
            </div>
          )}

          {/* Profile Edit Form */}
          <div className="bg-card rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Edit Profile</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Username</label>
                <Input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground min-h-[100px]"
                  placeholder="Tell visitors about yourself..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Location</label>
                <Input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Colombo, New York, London"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">WhatsApp Number (for Video/Photo)</label>
                <Input
                  type="text"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  placeholder="+94771234567 or +1234567890"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  After subscription payment, users can contact you via WhatsApp for video/photo services
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Age (Display)</label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  placeholder="e.g., 21, 25, 30"
                  min="18"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional: Display your age on your profile
                </p>
              </div>

              {/* Price Settings - Only if canSetPrice is true */}
              <div className={`border rounded-lg p-4 ${currentUser.canSetPrice ? 'border-primary bg-primary/5' : 'border-border bg-muted/50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">Price Settings (Photo & Video Only)</h3>
                  {currentUser.canSetPrice ? (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">UNLOCKED</span>
                  ) : (
                    <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">LOCKED</span>
                  )}
                </div>

                {!currentUser.canSetPrice && (
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mb-3">
                    <p className="text-sm text-muted-foreground mb-2">
                      ✅ Chat & Voice Call = FREE (All users worldwide)
                    </p>
                    <p className="text-sm text-destructive">
                      🔒 Photo Send & Video Call = PAID (After subscription: $25-$100)
                    </p>
                  </div>
                )}

                {currentUser.canSetPrice && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-3">
                    <p className="text-xs text-primary">
                      ℹ️ Chat & Voice are free. Set prices only for Photo Send & Video Call features.
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="opacity-50">
                    <label className="block text-sm font-medium mb-2 text-foreground">Chat Price ($)</label>
                    <Input
                      type="number"
                      value={0}
                      disabled
                    />
                    <p className="text-xs text-primary mt-1">🆓 FREE</p>
                  </div>

                  <div className="opacity-50">
                    <label className="block text-sm font-medium mb-2 text-foreground">Voice Price ($)</label>
                    <Input
                      type="number"
                      value={0}
                      disabled
                    />
                    <p className="text-xs text-primary mt-1">🆓 FREE</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Video Call Price ($)</label>
                    <Input
                      type="number"
                      value={formData.videoPrice}
                      onChange={(e) => setFormData({ ...formData, videoPrice: Number(e.target.value) })}
                      min="0"
                      disabled={!currentUser.canSetPrice}
                    />
                    {currentUser.canSetPrice ? (
                      <p className="text-xs text-primary mt-1">💰 PAID</p>
                    ) : (
                      <p className="text-xs text-destructive mt-1">🔒 LOCKED</p>
                    )}
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </form>
          </div>

          {/* Photo Gallery Management */}
          <div className="bg-card rounded-lg shadow-lg p-6 mt-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <ImageIcon className="text-primary" size={24} />
              📸 My Photo Gallery
            </h2>
            
            <PhotoUpload onPhotoUploaded={handlePhotoUploaded} />
            
            <div className="mt-6">
              <PhotoGallery key={photoGalleryKey} userId={currentUser.id} isOwnProfile={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative form-container-3d">
            {/* Close Button */}
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={24} />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600 rounded-3xl flex items-center justify-center mb-4 shadow-2xl">
                <CreditCard className="text-white" size={40} />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Subscription Plans
              </h2>
              <p className="text-muted-foreground">
                Unlock Photo Send & Video Call Features - Worldwide
              </p>
            </div>

            {/* Pricing Plans */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-foreground text-center mb-4">📋 Choose Your Plan</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white text-center shadow-lg">
                  <p className="text-4xl font-bold mb-2">$25</p>
                  <p className="text-sm font-semibold mb-1">1 Month</p>
                  <p className="text-xs opacity-90">30 days access</p>
                  <p className="text-sm font-bold mt-3 bg-yellow-400 text-blue-900 rounded px-2 py-1">+$12.50 Bonus</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white text-center shadow-lg border-4 border-yellow-400">
                  <p className="text-4xl font-bold mb-2">$50</p>
                  <p className="text-sm font-semibold mb-1">3 Months ⭐</p>
                  <p className="text-xs opacity-90">90 days access</p>
                  <p className="text-sm font-bold mt-3 bg-yellow-400 text-purple-900 rounded px-2 py-1">+$25.00 Bonus</p>
                </div>
                <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-5 text-white text-center shadow-lg">
                  <p className="text-4xl font-bold mb-2">$75</p>
                  <p className="text-sm font-semibold mb-1">6 Months 🔥</p>
                  <p className="text-xs opacity-90">180 days access</p>
                  <p className="text-sm font-bold mt-3 bg-yellow-400 text-pink-900 rounded px-2 py-1">+$37.50 Bonus</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white text-center shadow-lg border-4 border-yellow-400">
                  <p className="text-4xl font-bold mb-2">$100</p>
                  <p className="text-sm font-semibold mb-1">12 Months 💎</p>
                  <p className="text-xs opacity-90">365 days access</p>
                  <p className="text-sm font-bold mt-3 bg-yellow-400 text-green-900 rounded px-2 py-1">+$50.00 Bonus</p>
                </div>
              </div>
              <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-center">
                <p className="text-sm text-foreground font-medium">
                  💡 <strong>Special Offer:</strong> Get 50% of your plan amount as wallet bonus instantly! Plus earn 90% from users (10% to admin)
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="text-primary" size={20} />
                What You Get:
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Set your own Video Call & Photo Send prices</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span><strong>50% Wallet Bonus</strong> - Get half your plan amount instantly!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>WhatsApp contact enabled for premium users</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Earn 90% commission from worldwide users (10% to admin)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Valid for entire subscription duration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Accept international payments globally</span>
                </li>
              </ul>
            </div>

            {/* Payment Options */}
            <div className="space-y-4 mb-6">
              <h3 className="font-bold text-foreground mb-3">💳 Payment Options (Choose One):</h3>
              
              {/* Admin Contact Info */}
              <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 border-2 border-primary/30 rounded-xl p-5 mb-4">
                <h3 className="font-bold text-foreground mb-3 text-lg flex items-center gap-2">
                  <span className="text-2xl">👤</span> Admin Contact Details
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="flex items-start gap-2">
                    <span className="font-semibold text-foreground min-w-[100px]">Name:</span>
                    <span className="text-muted-foreground">J A Y S Kavinda</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-semibold text-foreground min-w-[100px]">Email:</span>
                    <span className="text-muted-foreground break-all">jayakodyarachchigemahisha@gmail.com</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-semibold text-foreground min-w-[100px]">WhatsApp:</span>
                    <span className="text-primary font-semibold">+94 76 585 1997</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-semibold text-foreground min-w-[100px]">Address:</span>
                    <span className="text-muted-foreground">198/B Ethanamadala, Kaluthara North</span>
                  </p>
                </div>
              </div>

              {/* Crypto Payment */}
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="text-yellow-500">₿</span> Cryptocurrency (Preferred)
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• USDT (TRC20/ERC20)</li>
                  <li>• Bitcoin (BTC)</li>
                  <li>• Ethereum (ETH)</li>
                </ul>
                <p className="text-xs text-accent mt-2 font-medium">💡 Contact admin WhatsApp: +94 76 585 1997</p>
              </div>

              {/* PayPal/Wise */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="text-blue-600">💵</span> PayPal / Wise / Western Union
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• PayPal: jayakodyarachchigemahisha@gmail.com</li>
                  <li>• Wise (TransferWise): Contact admin</li>
                  <li>• Western Union: Available</li>
                </ul>
              </div>

              {/* Bank Transfer */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span className="text-purple-600">🏦</span> International Bank Transfer
                </p>
                <p className="text-sm text-muted-foreground ml-4">
                  Contact admin WhatsApp +94 76 585 1997 for bank details (all countries supported)
                </p>
              </div>
            </div>

            {/* Submit Payment Proof */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-xl p-5">
              <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                <Upload className="text-red-600" size={20} />
                Submit Payment Proof
              </h3>
              <p className="text-sm text-red-800 mb-3">
                After paying (Choose: $25/1mo, $50/3mo, $75/6mo, $100/12mo), submit receipt/TXID/screenshot
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={formData.activationFeeProof}
                  onChange={(e) => setFormData({ ...formData, activationFeeProof: e.target.value })}
                  placeholder="Payment proof URL or Transaction ID"
                  className="flex-1 border-2 border-red-300"
                />
                <Button
                  onClick={() => {
                    handleActivationFeeSubmit();
                    setShowPaymentModal(false);
                  }}
                  className="btn-3d bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 hover:from-pink-700 hover:via-purple-700 hover:to-blue-700"
                >
                  Submit
                </Button>
              </div>
            </div>

            {/* Footer Note */}
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mt-6">
              <p className="text-xs text-muted-foreground">
                📌 <strong>After approval:</strong> You can set your own Photo & Video Call prices. Users can contact you via WhatsApp. Valid for the duration of your selected plan. Renew before expiry to maintain access.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
