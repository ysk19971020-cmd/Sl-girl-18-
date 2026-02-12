import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, DollarSign, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, CreditCard, X, Upload, CheckCircle2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { getWithdrawals, requestWithdrawal, getPlatformSettings } from '@/lib/wallet';
import { updateUser } from '@/lib/storage';
import { Withdrawal } from '@/types';

export default function WalletPage() {
  const { currentUser, isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'bank' | 'binance'>('bank');
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activationFeeProof, setActivationFeeProof] = useState(currentUser?.activationFeeProof || '');

  useEffect(() => {
    if (!isLoggedIn || !currentUser) {
      navigate('/login');
      return;
    }

    loadWithdrawals();
  }, [isLoggedIn, currentUser, navigate]);

  const loadWithdrawals = () => {
    if (!currentUser) return;
    const allWithdrawals = getWithdrawals();
    setWithdrawals(allWithdrawals.filter(w => w.userId === currentUser.id));
  };

  const handleRequestWithdrawal = () => {
    if (!currentUser) return;

    const amount = parseFloat(withdrawAmount);
    const settings = getPlatformSettings();

    // Validation
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amount < settings.minWithdrawal) {
      setError(`Minimum withdrawal is Rs ${settings.minWithdrawal}`);
      return;
    }

    if (amount > (currentUser.walletBalance || 0)) {
      setError('Insufficient balance');
      return;
    }

    if (!withdrawDetails.trim()) {
      setError(withdrawMethod === 'bank' ? 'Please enter bank account details' : 'Please enter Binance USDT address');
      return;
    }

    // Request withdrawal
    requestWithdrawal(currentUser.id, amount, withdrawMethod, withdrawDetails);
    
    // Reset and reload
    setShowWithdrawModal(false);
    setWithdrawAmount('');
    setWithdrawDetails('');
    setError('');
    loadWithdrawals();
    
    // Refresh user data
    window.location.reload();
  };

  if (!currentUser) return null;

  const settings = getPlatformSettings();

  const handleActivationFeeSubmit = () => {
    if (!currentUser) return;
    if (!activationFeeProof.trim()) {
      alert('Please enter payment proof');
      return;
    }

    updateUser(currentUser.id, { activationFeeProof });
    setShowPaymentModal(false);
    alert('Subscription payment proof submitted. Waiting for admin approval.');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Wallet size={32} />
            My Wallet
          </h1>

          {/* Admin Payment Button - Quick Access */}
          {!currentUser.canSetPrice && (
            <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 rounded-2xl p-6 text-white shadow-2xl mb-6 card-3d">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-xl font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
                    <CreditCard size={24} />
                    💰 Unlock Premium Features
                  </h2>
                  <p className="text-white/90 text-sm mb-1">
                    Flexible Plans • 1-12 months • Photo & Video pricing
                  </p>
                  <p className="text-white/80 text-xs">
                    $25/mo • $50/3mo • $75/6mo • $100/12mo • Earn 80% globally!
                  </p>
                </div>
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  className="btn-3d bg-white text-purple-700 hover:bg-gray-100 font-bold px-6 py-4 text-base h-auto rounded-xl shadow-xl"
                >
                  💳 Choose Plan
                </Button>
              </div>
            </div>
          )}

          {/* Balance Cards */}
          <div className="grid md:grid-cols-1 gap-6 mb-6">
            <div className="bg-gradient-to-br from-primary to-accent rounded-lg p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-90">Available Balance</span>
                <Wallet size={24} />
              </div>
              <p className="text-4xl font-bold mb-4">${currentUser.walletBalance?.toFixed(2) || '0.00'}</p>
              
              <div className="bg-white/10 rounded-lg p-4 mt-4">
                <p className="text-sm font-semibold mb-2">💰 Withdraw Worldwide</p>
                <p className="text-xs opacity-90 mb-3">Manual processing by admin (all countries supported)</p>
                
                <div className="space-y-2">
                  <div className="bg-white/20 rounded p-2">
                    <p className="text-xs opacity-75">🌍 International Options:</p>
                    <ul className="text-xs mt-2 space-y-1">
                      <li>• PayPal / Wise / Western Union</li>
                      <li>• Cryptocurrency (USDT/BTC/ETH)</li>
                      <li>• Bank Transfer (International)</li>
                    </ul>
                  </div>
                </div>
                
                <p className="text-xs opacity-75 mt-3">
                  📌 Contact admin to request withdrawal
                </p>
              </div>
            </div>
          </div>

          {/* Earnings Info */}
          <div className="bg-card rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">💰 How to Earn (Global)</h2>
            
            <div className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">Chat & Voice Calls</h3>
                <p className="text-sm text-muted-foreground mb-2">🆓 Completely FREE - No charges</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• When someone chats or voice calls you = FREE</li>
                  <li>• No earnings from free features</li>
                </ul>
              </div>
              
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">Photo Send & Video Calls</h3>
                <p className="text-sm text-primary mb-2">💰 PAID Feature - You set the price</p>
                <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                  <li>• Subscribe: $25/mo, $50/3mo, $75/6mo, or $100/12mo</li>
                  <li>• <strong>BONUS:</strong> Get 50% of plan amount in wallet instantly!</li>
                  <li>• Set your own price for video calls</li>
                  <li>• Earn when users video call you</li>
                  <li>• Platform commission: 10% | You get: 90%</li>
                  <li>• Accept payments from worldwide users</li>
                </ul>
                
                {!currentUser.canSetPrice && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-xs text-destructive mb-1">🔒 Currently Locked</p>
                    <p className="text-xs text-muted-foreground">Check Dashboard for payment details</p>
                  </div>
                )}
                
                {currentUser.canSetPrice && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <p className="text-xs text-primary mb-1">✅ Unlocked - You can set video call prices</p>
                    <p className="text-xs text-muted-foreground">Update prices via Dashboard</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Withdrawal Info */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mt-6">
            <h3 className="font-semibold text-foreground mb-2">📤 Withdrawal Process (Worldwide)</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Direct message admin for withdrawal request</li>
              <li>• Provide PayPal/Wise/Crypto address or bank details</li>
              <li>• Admin processes manually (1-3 days)</li>
              <li>• Minimum withdrawal: ${settings.minWithdrawal}</li>
              <li>• Available in all countries globally</li>
            </ul>
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

            {/* Admin Contact Info */}
            <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 border-2 border-primary/30 rounded-xl p-5 mb-6">
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

            {/* Payment Options */}
            <div className="space-y-4 mb-6">
              <h3 className="font-bold text-foreground mb-3">💳 Payment Options (Choose One):</h3>
              
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
                  value={activationFeeProof}
                  onChange={(e) => setActivationFeeProof(e.target.value)}
                  placeholder="Payment proof URL or Transaction ID"
                  className="flex-1 border-2 border-red-300"
                />
                <Button
                  onClick={handleActivationFeeSubmit}
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

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Request Withdrawal</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Amount (Rs) <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={`Min: $${settings.minWithdrawal}`}
                  min={settings.minWithdrawal}
                  max={currentUser.walletBalance}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available: ${currentUser.walletBalance?.toFixed(2) || '0.00'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Withdrawal Method <span className="text-destructive">*</span>
                </label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value as any)}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="bank">Bank Transfer (International)</option>
                  <option value="crypto">Cryptocurrency (USDT/BTC/ETH)</option>
                  <option value="paypal">PayPal</option>
                  <option value="wise">Wise (TransferWise)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  {withdrawMethod === 'bank' ? 'Bank Account Details' : 
                   withdrawMethod === 'crypto' ? 'Crypto Wallet Address' :
                   withdrawMethod === 'paypal' ? 'PayPal Email' :
                   'Wise Account Details'} <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={withdrawDetails}
                  onChange={(e) => setWithdrawDetails(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground min-h-[80px]"
                  placeholder={withdrawMethod === 'bank' 
                    ? 'Bank name, SWIFT/IBAN, Account number, Account holder name, Country'
                    : withdrawMethod === 'crypto'
                    ? 'Your crypto wallet address (USDT/BTC/ETH)'
                    : withdrawMethod === 'paypal'
                    ? 'Your PayPal email address'
                    : 'Your Wise account email and details'
                  }
                />
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setError('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRequestWithdrawal}
                  className="flex-1"
                >
                  Submit Request
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
