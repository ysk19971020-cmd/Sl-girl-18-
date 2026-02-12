import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createReport } from '@/lib/moderation';
import { useAuthStore } from '@/stores/authStore';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedUsername: string;
  type: 'profile' | 'message' | 'call';
}

export default function ReportModal({ 
  isOpen, 
  onClose, 
  reportedUserId, 
  reportedUsername,
  type 
}: ReportModalProps) {
  const { currentUser } = useAuthStore();
  const [reason, setReason] = useState<'scam' | 'fake_profile' | 'abuse' | 'other'>('scam');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    createReport(currentUser.id, reportedUserId, type, reason, details);
    setSubmitted(true);
    
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setDetails('');
      setReason('scam');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="text-destructive" size={24} />
            Report User
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={24} />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
              <p className="text-primary font-semibold">Report Submitted Successfully</p>
              <p className="text-sm text-muted-foreground mt-2">
                Our moderation team will review this report shortly.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Reporting:</p>
              <p className="font-semibold text-foreground">{reportedUsername}</p>
              <p className="text-xs text-muted-foreground capitalize">Type: {type}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Reason <span className="text-destructive">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                required
              >
                <option value="scam">Scam / Fraud</option>
                <option value="fake_profile">Fake Profile</option>
                <option value="abuse">Harassment / Abuse</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Details <span className="text-destructive">*</span>
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full p-2 border border-border rounded-md bg-background text-foreground min-h-[100px]"
                placeholder="Please describe the issue..."
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" onClick={onClose} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button type="submit" variant="destructive" className="flex-1">
                Submit Report
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
