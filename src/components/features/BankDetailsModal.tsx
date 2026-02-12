import { Copy, Building2, User, CreditCard, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface BankDetailsModalProps {
  amount: number;
  onConfirmPayment: (proof: string) => void;
}

export default function BankDetailsModal({ amount, onConfirmPayment }: BankDetailsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [depositSlip, setDepositSlip] = useState('');

  // Admin Bank Details (J A Y S Kavinda)
  const bankDetails = {
    bankName: 'Sampath Bank PLC',
    branchName: 'Kaluthara Branch',
    accountName: 'J A Y S Kavinda',
    accountNumber: '105057458082',
    swiftCode: 'SAMBLKLX',
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = () => {
    if (!depositSlip.trim()) {
      alert('කරුණාකර deposit slip number හෝ payment proof එක ඇතුළත් කරන්න');
      return;
    }
    onConfirmPayment(depositSlip);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-4">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-foreground">
          <Building2 size={20} className="text-primary" />
          Bank Transfer Details
        </h3>

        <div className="space-y-3">
          {/* Bank Name */}
          <div className="bg-card rounded p-3 border border-border">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Bank Name</p>
                <p className="font-semibold text-foreground">{bankDetails.bankName}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(bankDetails.bankName, 'bank')}
              >
                {copiedField === 'bank' ? (
                  <Check size={16} className="text-primary" />
                ) : (
                  <Copy size={16} />
                )}
              </Button>
            </div>
          </div>

          {/* Branch */}
          <div className="bg-card rounded p-3 border border-border">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Branch</p>
                <p className="font-semibold text-foreground">{bankDetails.branchName}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(bankDetails.branchName, 'branch')}
              >
                {copiedField === 'branch' ? (
                  <Check size={16} className="text-primary" />
                ) : (
                  <Copy size={16} />
                )}
              </Button>
            </div>
          </div>

          {/* Account Name */}
          <div className="bg-card rounded p-3 border border-border">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Account Name</p>
                <p className="font-semibold text-foreground">{bankDetails.accountName}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(bankDetails.accountName, 'name')}
              >
                {copiedField === 'name' ? (
                  <Check size={16} className="text-primary" />
                ) : (
                  <Copy size={16} />
                )}
              </Button>
            </div>
          </div>

          {/* Account Number */}
          <div className="bg-card rounded p-3 border border-primary/30">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Account Number</p>
                <p className="font-bold text-lg text-primary">{bankDetails.accountNumber}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(bankDetails.accountNumber, 'account')}
              >
                {copiedField === 'account' ? (
                  <Check size={16} className="text-primary" />
                ) : (
                  <Copy size={16} />
                )}
              </Button>
            </div>
          </div>

          {/* SWIFT Code */}
          <div className="bg-card rounded p-3 border border-border">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">SWIFT Code (International)</p>
                <p className="font-semibold text-foreground">{bankDetails.swiftCode}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(bankDetails.swiftCode, 'swift')}
              >
                {copiedField === 'swift' ? (
                  <Check size={16} className="text-primary" />
                ) : (
                  <Copy size={16} />
                )}
              </Button>
            </div>
          </div>

          {/* Amount to Transfer */}
          <div className="bg-primary/20 border-2 border-primary rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Transfer Amount</p>
            <p className="text-3xl font-bold text-primary">Rs {amount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
        <h4 className="font-semibold mb-2 text-foreground">📋 Payment Instructions (Sinhala/English):</h4>
        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
          <li>ඉහත bank account එකට **Rs {amount.toLocaleString()}** transfer කරන්න</li>
          <li>Online banking, Mobile app, හෝ Bank branch එකෙන් deposit කරන්න පුළුවන්</li>
          <li>Payment කළ පසු **deposit slip number** හෝ **transaction reference** එක copy කරන්න</li>
          <li>පහළ box එකට deposit slip number/screenshot එක paste කරන්න</li>
          <li>"Confirm Payment" click කරන්න - Admin verify කළ පසු service activate වෙයි</li>
        </ol>
      </div>

      {/* Deposit Slip Input */}
      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          Deposit Slip / Transaction Proof <span className="text-destructive">*</span>
        </label>
        <textarea
          value={depositSlip}
          onChange={(e) => setDepositSlip(e.target.value)}
          placeholder="Deposit slip number, screenshot link, හෝ transaction reference ඇතුළත් කරන්න&#10;උදාහරණ: SLIP-123456789 හෝ image link"
          className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-foreground"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          💡 Tip: Deposit slip photo එක upload කරලා link එක මෙහි paste කරන්න
        </p>
      </div>

      <Button onClick={handleSubmit} className="w-full" size="lg">
        <CreditCard size={18} className="mr-2" />
        Confirm Bank Payment
      </Button>

      {/* Contact Info */}
      <div className="bg-muted rounded-lg p-3 text-center">
        <p className="text-xs text-muted-foreground mb-1">Payment issues? Contact Admin:</p>
        <p className="text-sm font-semibold text-foreground">
          📱 WhatsApp: <a href="https://wa.me/94765851997" className="text-primary hover:underline">+94 76 585 1997</a>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          📧 {bankDetails.accountName} | 198/B Ethanamadala, Kaluthara North
        </p>
      </div>
    </div>
  );
}
