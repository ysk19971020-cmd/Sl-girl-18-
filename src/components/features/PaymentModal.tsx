import { useState } from 'react';
import { X, DollarSign, CheckCircle, Building2, Wallet, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createSession } from '@/lib/session';
import { processPayment } from '@/lib/wallet';
import { useAuthStore } from '@/stores/authStore';
import BankDetailsModal from './BankDetailsModal';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: 'chat' | 'voice' | 'video';
  price: number;
  username: string;
  providerId: string;
}

export default function PaymentModal({ isOpen, onClose, service, price, username, providerId }: PaymentModalProps) {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const [paymentProof, setPaymentProof] = useState('');
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'select' | 'bank' | 'crypto' | 'online'>('select');

  if (!isOpen) return null;

  const serviceNames = {
    chat: 'Private Chat',
    voice: 'Voice Call',
    video: 'Video Call',
  };

  const handlePayment = (proof?: string) => {
    const finalProof = proof || paymentProof;
    
    if (!finalProof.trim()) {
      alert('Please enter payment proof');
      return;
    }
    
    if (!currentUser) return;
    
    // Create session with 15% commission
    const session = createSession(currentUser.id, providerId, service, price);
    
    // Process payment (wallet split: 15% admin, 85% provider)
    processPayment(session);
    
    // Store unlock status in localStorage
    const unlockedProviders = JSON.parse(localStorage.getItem(`unlocked_providers_${currentUser.id}`) || '[]');
    if (!unlockedProviders.includes(providerId)) {
      unlockedProviders.push(providerId);
      localStorage.setItem(`unlocked_providers_${currentUser.id}`, JSON.stringify(unlockedProviders));
    }
    
    setPaymentSubmitted(true);
    
    // For video service: Unlock WhatsApp
    if (service === 'video') {
      setTimeout(() => {
        onClose();
        navigate(`/profile/${providerId}`); // Reload to show unlocked WhatsApp
      }, 2000);
    } else {
      setTimeout(() => {
        if (service === 'chat') {
          navigate(`/chat/${session.id}`);
        } else {
          navigate(`/call/${session.id}`);
        }
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6 my-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Payment Required</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={24} />
          </button>
        </div>

        {paymentSubmitted ? (
          <div className="text-center py-6">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
              <CheckCircle className="text-primary mx-auto mb-3" size={48} />
              <p className="text-primary font-semibold">Payment Submitted!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Admin verify කළ පසු WhatsApp number unlock වෙයි...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {service === 'video' 
                  ? '📱 WhatsApp button unlocking...'
                  : `Redirecting to ${service === 'chat' ? 'chat' : 'call'}...`}
              </p>
            </div>
          </div>
        ) : paymentMethod === 'select' ? (
          <div>
            {/* Order Summary */}
            <div className="bg-muted rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Service</span>
                <span className="font-semibold text-foreground">{serviceNames[service]}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Profile</span>
                <span className="font-semibold text-foreground">{username}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className="font-bold text-lg text-primary">${price}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-border space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Provider ({username}) receives:</span>
                  <span className="font-semibold text-green-600">${(price * 0.85).toFixed(2)} (85%)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Platform fee:</span>
                  <span className="font-semibold text-orange-600">${(price * 0.15).toFixed(2)} (15%)</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-4">
              <h3 className="font-semibold mb-3 text-foreground">Select Payment Method:</h3>
              <div className="grid grid-cols-1 gap-3">
                {/* Bank Transfer - Primary Option */}
                <button
                  onClick={() => setPaymentMethod('bank')}
                  className="flex items-center gap-3 p-4 border-2 border-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition text-left"
                >
                  <Building2 size={24} className="text-primary" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">🏦 Bank Transfer (Sri Lanka)</p>
                    <p className="text-xs text-muted-foreground">Local bank deposit - Fastest & Recommended</p>
                  </div>
                </button>

                {/* Crypto */}
                <button
                  onClick={() => setPaymentMethod('crypto')}
                  className="flex items-center gap-3 p-4 border border-border bg-card rounded-lg hover:bg-muted transition text-left"
                >
                  <Wallet size={24} className="text-primary" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">₿ Cryptocurrency</p>
                    <p className="text-xs text-muted-foreground">USDT / BTC / ETH - Binance accepted</p>
                  </div>
                </button>

                {/* Online International */}
                <button
                  onClick={() => setPaymentMethod('online')}
                  className="flex items-center gap-3 p-4 border border-border bg-card rounded-lg hover:bg-muted transition text-left"
                >
                  <CreditCard size={24} className="text-primary" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">🌍 International Payment</p>
                    <p className="text-xs text-muted-foreground">PayPal / Wise / Western Union</p>
                  </div>
                </button>
              </div>
            </div>

            <Button onClick={onClose} variant="outline" className="w-full">
              Cancel
            </Button>
          </div>
        ) : paymentMethod === 'bank' ? (
          <div>
            <Button
              onClick={() => setPaymentMethod('select')}
              variant="ghost"
              size="sm"
              className="mb-4"
            >
              ← Back to payment methods
            </Button>
            <BankDetailsModal 
              amount={price} 
              onConfirmPayment={(proof) => handlePayment(proof)}
            />
          </div>
        ) : (
          <div>
            <Button
              onClick={() => setPaymentMethod('select')}
              variant="ghost"
              size="sm"
              className="mb-4"
            >
              ← Back to payment methods
            </Button>

            {/* Crypto/Online Payment */}
            <div className="bg-muted rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-2 text-foreground">
                {paymentMethod === 'crypto' ? '₿ Cryptocurrency Payment' : '🌍 International Payment'}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Amount: <span className="font-bold text-primary">Rs {price}</span>
              </p>
            </div>

            {paymentMethod === 'crypto' && (
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-4">
                <p className="text-sm text-foreground mb-2">
                  <strong>Crypto Payment Info:</strong>
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Binance USDT / BTC / ETH accepted</li>
                  <li>Send to admin wallet (contact for address)</li>
                  <li>Submit transaction ID (TXID) below</li>
                </ul>
              </div>
            )}

            {paymentMethod === 'online' && (
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-4">
                <p className="text-sm text-foreground mb-2">
                  <strong>International Payment:</strong>
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>PayPal / Wise / Western Union accepted</li>
                  <li>Contact admin for payment details</li>
                  <li>Submit payment confirmation/receipt</li>
                </ul>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-foreground">
                Payment Proof <span className="text-destructive">*</span>
              </label>
              <textarea
                value={paymentProof}
                onChange={(e) => setPaymentProof(e.target.value)}
                placeholder={
                  paymentMethod === 'crypto' 
                    ? 'Crypto TXID හෝ transaction proof ඇතුළත් කරන්න'
                    : 'PayPal/Wise receipt හෝ confirmation ඇතුළත් කරන්න'
                }
                className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-foreground"
                required
              />
            </div>

            {/* Admin Contact */}
            <div className="bg-muted rounded-lg p-3 mb-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Payment details අවශ්‍ය නම්:</p>
              <p className="text-sm font-semibold text-foreground">
                📱 <a href="https://wa.me/94765851997" className="text-primary hover:underline">+94 76 585 1997</a> (WhatsApp)
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={onClose} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => handlePayment()} className="flex-1">
                <DollarSign size={18} className="mr-1" />
                Confirm Payment
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
