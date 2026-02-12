
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, Phone, Video, MapPin, Eye, BadgeCheck, ArrowLeft, AlertCircle, Lock, Flag, Heart, Share2, Bookmark, DollarSign, CheckCircle, Image as ImageIcon } from 'lucide-react';
import Header from '@/components/layout/Header';
import LoginModal from '@/components/features/LoginModal';
import PaymentModal from '@/components/features/PaymentModal';
import ReportModal from '@/components/features/ReportModal';
import PhotoGallery from '@/components/features/PhotoGallery';
import { User } from '@/types';
import { getUsers, incrementViewCount } from '@/lib/storage';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedService, setSelectedService] = useState<'chat' | 'voice' | 'video'>('chat');
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (id) {
      const users = getUsers();
      const foundUser = users.find(u => u.id === id);
      if (foundUser) {
        setUser(foundUser);
        incrementViewCount(id);
      }
    }
  }, [id]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  const isServiceAccessible = user.verified && user.categoryApproved && user.priceActivated && user.canSetPrice;

  const handleServiceClick = (service: 'chat' | 'voice' | 'video') => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    // FREE services: chat and voice - direct navigation (no payment)
    if (service === 'chat') {
      // Navigate directly to chat (create free session)
      navigate(`/chat/free-${user.id}-${Date.now()}`);
      return;
    }

    if (service === 'voice') {
      // Navigate directly to voice call (create free session)
      navigate(`/call/free-voice-${user.id}-${Date.now()}`);
      return;
    }

    // PAID service: video - requires payment and provider subscription
    if (service === 'video') {
      if (!isServiceAccessible) {
        alert('This user has not activated video call pricing yet. Please contact via WhatsApp or use free chat/voice.');
        return;
      }
      setSelectedService(service);
      setShowPaymentModal(true);
    }
  };

  const getServicePrice = (service: 'chat' | 'voice' | 'video') => {
    switch (service) {
      case 'chat': return user.chatPrice || 0;
      case 'voice': return user.voicePrice || 0;
      case 'video': return user.videoPrice || 0;
    }
  };

  const whatsappNumber = user.whatsappNumber || '+94771851672';
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;
  
  // NEW SYSTEM: WhatsApp unlocked only if provider has active subscription plan
  // Check if PROVIDER (user being viewed) has active subscription
  const providerHasActiveSubscription = user.subscriptionPlan && 
    user.subscriptionExpiresAt && 
    new Date(user.subscriptionExpiresAt) > new Date();
  
  // Check if current user has already paid to unlock THIS provider's WhatsApp
  // TODO: Track per-provider unlock payments in localStorage/backend
  const currentUserObj = useAuthStore.getState().currentUser;
  const unlockedProviders = JSON.parse(localStorage.getItem(`unlocked_providers_${currentUserObj?.id}`) || '[]');
  const hasUnlockedThisProvider = unlockedProviders.includes(user.id);
  
  // WhatsApp unlocked if: Provider has plan AND (current user paid OR is the provider themselves)
  const whatsappUnlocked = providerHasActiveSubscription && (hasUnlockedThisProvider || currentUserObj?.id === user.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back
          </Button>
          <Button
            onClick={() => setShowReportModal(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Flag size={16} />
            Report
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Profile Card - HelaLankaAds Style */}
          <div className="bg-card rounded-lg shadow-lg overflow-hidden">
            {/* Profile Image with Overlay Info */}
            <div className="relative">
              <img
                src={user.profileImage || 'https://via.placeholder.com/600x800?text=No+Image'}
                alt={user.username}
                className="w-full object-cover aspect-[3/4]"
              />
              
              {/* Username Overlay at Bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <h1 className="text-white text-2xl font-bold">{user.username}</h1>
                <div className="flex items-center gap-2 text-white/90 text-sm mt-1">
                  {user.verified && <BadgeCheck size={16} className="text-primary" />}
                  <span className="capitalize">{user.gender}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
              
              {/* Featured Badge */}
              {user.featured && (
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold text-sm">
                  ⭐ FEATURED
                </div>
              )}
            </div>

            {/* Service Category Badge */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-center py-3 font-semibold">
              {user.category === 'livecam' ? '📹 CAM SHOW WITH FACE' :
               user.category === 'girls' ? '💖 Girls Personal' :
               user.category === 'boys' ? '💙 Boys Personal' :
               user.category === 'spa' ? '🧖 Spa Service' :
               '✨ ' + (user.category || 'Service')}
            </div>

            {/* Location & Stats */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  {user.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Eye size={14} />
                    <span>{user.viewCount || 0} Views</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons (Like, Save, Share) */}
            <div className="grid grid-cols-3 gap-2 p-4 border-b border-border">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Heart size={16} />
                <span>Like</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Bookmark size={16} />
                <span>Save</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Share2 size={16} />
                <span>Share</span>
              </Button>
            </div>

            {/* Main Price Display with Wallet Balance */}
            <div className="bg-primary/10 border-y-2 border-primary p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-foreground font-semibold">Base Rate:</span>
                <span className="text-primary text-3xl font-bold">${user.videoPrice || 15}</span>
              </div>
              {user.walletBalance > 0 && (
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 rounded-lg p-3 mb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="text-yellow-600" size={20} />
                      <span className="text-sm font-semibold text-foreground">Custom Wallet:</span>
                    </div>
                    <span className="text-yellow-600 text-2xl font-bold">${user.walletBalance.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">💎 Premium member with custom pricing power</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">💰 0 Likes • Starting price for services</p>
            </div>

            {/* WhatsApp Contact Buttons - LOCKED/UNLOCKED */}
            <div className="p-4 space-y-2">
              {!providerHasActiveSubscription ? (
                // Provider has NO subscription plan - WhatsApp locked completely
                <>
                  <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-400 rounded-lg p-3 mb-2">
                    <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 font-bold">
                      <Lock size={20} />
                      <span>🚫 This user hasn't activated Premium Plan</span>
                    </div>
                  </div>
                  
                  <Button 
                    disabled
                    className="w-full bg-gray-400 text-white cursor-not-allowed opacity-50"
                  >
                    <Lock size={18} className="mr-2" />
                    WhatsApp Not Available (No Premium Plan)
                  </Button>
                  
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-400 rounded-lg p-3 mt-2">
                    <p className="text-xs text-blue-900 dark:text-blue-200 text-center">
                      💡 This user needs to buy a subscription plan ($25-$100) to activate WhatsApp features.
                    </p>
                  </div>
                </>
              ) : whatsappUnlocked ? (
                // UNLOCKED: Current user has already paid - Show actual WhatsApp buttons
                <>
                  <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-950/20 dark:to-blue-950/20 border-2 border-green-500 rounded-lg p-3 mb-2">
                    <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400 font-bold">
                      <CheckCircle size={20} />
                      <span>🔓 WhatsApp UNLOCKED - Video & Photo Features!</span>
                    </div>
                  </div>
                  
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2">
                      <Phone size={18} />
                      📞 Call +{whatsappNumber}
                    </Button>
                  </a>
                  
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2">
                      <Video size={18} />
                      📹 WhatsApp Video Call & Photo Send
                    </Button>
                  </a>
                </>
              ) : (
                // LOCKED: Premium user, but current user hasn't paid yet
                <>
                  <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-950/20 dark:to-orange-950/20 border-2 border-red-500 rounded-lg p-3 mb-2">
                    <div className="flex items-center justify-center gap-2 text-red-700 dark:text-red-400 font-bold">
                      <Lock size={20} />
                      <span>🔒 WhatsApp Number Locked - Payment Required</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleServiceClick('video')}
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white flex items-center justify-center gap-2 relative overflow-hidden"
                  >
                    <Lock size={18} className="mr-2" />
                    <span className="flex flex-col items-center">
                      <span className="font-bold">💳 Pay ${user.videoPrice || 15} to Unlock WhatsApp</span>
                      <span className="text-xs opacity-90">Video Call & Photo Send via WhatsApp</span>
                    </span>
                  </Button>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-400 rounded-lg p-3 mt-2">
                    <p className="text-xs text-yellow-900 dark:text-yellow-200 text-center font-semibold">
                      💰 Payment Split: 85% to {user.username} | 15% Platform Fee
                    </p>
                    <p className="text-xs text-yellow-900 dark:text-yellow-200 text-center mt-1">
                      ⚠️ Payment කළ පසු WhatsApp number unlock වෙයි.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Profile Description */}
            <div className="p-4 border-t border-border">
              <div className="mb-4">
                <p className="text-foreground mb-3">
                  {user.description || 'I am available for private services. Contact me via WhatsApp for details and booking.'}
                </p>
                
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full">💖 Age: {user.age || '21+'}</span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">🏠 Location: {user.location || 'Available'}</span>
                  {user.verified && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">✅ Verified</span>
                  )}
                </div>
              </div>

              {/* Service Pricing List - HelaLankaAds Style */}
              <div className="border-t border-border pt-4">
                <div className="space-y-3">
                  <div className="bg-accent/10 rounded-lg p-3">
                    <p className="text-sm font-semibold text-foreground mb-2">📹 Video Verification Available</p>
                    <p className="text-xs text-muted-foreground">✅ Audio verification: FREE</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-pink-50 dark:bg-pink-950/20 p-3 rounded">
                      <span className="text-sm">💖 05 Min Only</span>
                      <span className="font-bold text-pink-600">${user.videoPrice || 15}</span>
                    </div>
                    
                    <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-950/20 p-3 rounded">
                      <span className="text-sm">💜 15 Min Full Body Show</span>
                      <span className="font-bold text-purple-600">${((user.videoPrice || 15) * 2)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/20 p-3 rounded">
                      <span className="text-sm">💙 15 Min Show with Hand Shake</span>
                      <span className="font-bold text-blue-600">${((user.videoPrice || 15) * 2.5)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/20 p-3 rounded">
                      <span className="text-sm">💚 20 Min Full Body Show</span>
                      <span className="font-bold text-green-600">${((user.videoPrice || 15) * 3)}</span>
                    </div>

                    <div className="flex items-center justify-between bg-orange-50 dark:bg-orange-950/20 p-3 rounded">
                      <span className="text-sm">🧡 30 Min Premium Show</span>
                      <span className="font-bold text-orange-600">${((user.videoPrice || 15) * 4)}</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-950/20 dark:to-pink-950/20 rounded-lg p-4 mt-4">
                    <p className="text-sm font-bold text-foreground mb-2">🔥 FULL SERVICE AVAILABLE 💋</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>• One Hour: ${((user.videoPrice || 15) * 6)}</p>
                      <p>• Two Hours with room: ${((user.videoPrice || 15) * 10)}</p>
                      <p>• Full Night: ${((user.videoPrice || 15) * 20)}</p>
                    </div>
                  </div>

                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-4">
                    <p className="text-xs text-foreground mb-2">
                      🛡️ <strong>Genuine Service</strong> - මම ඇත්තටම සැබෑ සේවාවක් සපයන්නම්. ඔබ සතුටු වන තුරු සේවය සපයනවා.
                    </p>
                    <p className="text-xs text-primary font-semibold mt-2">
                      ✅ Verification Available | Voice Call FREE | Video verification $5
                    </p>
                  </div>

                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">
                      💳 <strong>Payment Method:</strong> Bank Transfer or Cash 💵
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Website Chat & Voice Buttons */}
            <div className="p-4 border-t-2 border-border bg-muted/50">
              <p className="text-sm font-semibold text-foreground mb-3 text-center">
                🌐 Quick Contact (In-Website)
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleServiceClick('chat')}
                  className="flex flex-col items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-lg py-4 transition-colors shadow-lg btn-3d"
                >
                  <MessageCircle size={24} className="mb-2" />
                  <span className="text-sm font-semibold">Free Chat</span>
                  <span className="text-xs">🆓 FREE - Click Now!</span>
                </button>

                <button
                  onClick={() => handleServiceClick('voice')}
                  className="flex flex-col items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-4 transition-colors shadow-lg btn-3d"
                >
                  <Phone size={24} className="mb-2" />
                  <span className="text-sm font-semibold">Voice Call</span>
                  <span className="text-xs">🆓 FREE - Click Now!</span>
                </button>
              </div>

              <p className="text-xs text-center text-green-600 dark:text-green-400 mt-2 font-semibold">
                ✅ Chat and voice calls are 100% FREE - No payment needed!
              </p>
            </div>

            {/* Admin Panel Info for Users */}
            {!user.canSetPrice && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border-t border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-yellow-800 dark:text-yellow-200 text-sm mb-1">
                      🔒 This user hasn't activated pricing yet
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      For video calls and photo sharing with custom pricing, the user needs to purchase the $50 Admin Panel (3 months access)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Note */}
            <div className="p-4 bg-muted/50 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                ⚠️ <strong>Lanka Ads</strong> does not guarantee services. Please use verified profiles for reliable services.
              </p>
              <p className="text-xs text-center text-muted-foreground mt-2">
                💳 If you're getting full service, please don't deposit money before meet. This is only a Classified Ads website.
              </p>
            </div>
          </div>

          {/* Photo Gallery Section */}
          <div className="max-w-2xl mx-auto mt-6">
            <div className="bg-card rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <ImageIcon className="text-primary" size={28} />
                📸 Photo Gallery
              </h2>
              <PhotoGallery userId={user.id} isOwnProfile={false} />
            </div>
          </div>
        </div> {/* Closing div for max-w-2xl mx-auto */}
      </div> {/* Closing div for container mx-auto px-4 py-6 */}

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        service={selectedService}
        price={getServicePrice(selectedService)}
        username={user.username}
        providerId={user.id}
      />
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedUserId={user.id}
        reportedUsername={user.username}
        type="profile"
      />
    </div>
  );
}
