import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { getWithdrawals, approveWithdrawal, rejectWithdrawal } from '@/lib/wallet';
import { getUsers } from '@/lib/storage';
import { Withdrawal } from '@/types';

export default function WithdrawalManagement() {
  const { currentUser, isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !currentUser?.isAdmin) {
      navigate('/home');
      return;
    }
    loadWithdrawals();
  }, [isLoggedIn, currentUser, navigate]);

  const loadWithdrawals = () => {
    const allWithdrawals = getWithdrawals();
    setWithdrawals(allWithdrawals.sort((a, b) => 
      new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    ));
  };

  const handleApprove = (withdrawalId: string) => {
    if (!currentUser || !window.confirm('Approve this withdrawal request?')) return;
    approveWithdrawal(withdrawalId, currentUser.id);
    loadWithdrawals();
    setSelectedWithdrawal(null);
  };

  const handleReject = (withdrawalId: string) => {
    if (!currentUser || !window.confirm('Reject this withdrawal request?')) return;
    rejectWithdrawal(withdrawalId, currentUser.id);
    loadWithdrawals();
    setSelectedWithdrawal(null);
  };

  const getUsernameById = (userId: string) => {
    const users = getUsers();
    return users.find(u => u.id === userId)?.username || 'Unknown';
  };

  if (!currentUser?.isAdmin) return null;

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const processedWithdrawals = withdrawals.filter(w => w.status !== 'pending');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-2">
          <DollarSign size={32} />
          Withdrawal Management
        </h1>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Withdrawals List */}
          <div className="bg-card rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Pending Withdrawals ({pendingWithdrawals.length})
            </h2>
            
            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {pendingWithdrawals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending withdrawals</p>
              ) : (
                pendingWithdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    onClick={() => setSelectedWithdrawal(withdrawal)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedWithdrawal?.id === withdrawal.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-border/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg text-foreground">
                        Rs {withdrawal.amount.toFixed(2)}
                      </span>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full flex items-center gap-1">
                        <Clock size={12} /> Pending
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>User: <strong>{getUsernameById(withdrawal.userId)}</strong></p>
                      <p>Method: {withdrawal.method === 'bank' ? 'Bank Transfer' : 'Binance USDT'}</p>
                      <p className="text-xs">{new Date(withdrawal.requestedAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Processed Withdrawals */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-lg font-bold text-foreground mb-3">
                Recently Processed ({processedWithdrawals.slice(0, 5).length})
              </h3>
              <div className="space-y-2">
                {processedWithdrawals.slice(0, 5).map((withdrawal) => (
                  <div key={withdrawal.id} className="p-3 rounded-lg bg-muted">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">
                        {getUsernameById(withdrawal.userId)} - Rs {withdrawal.amount.toFixed(2)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        withdrawal.status === 'approved'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-destructive/10 text-destructive'
                      }`}>
                        {withdrawal.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Withdrawal Details & Actions */}
          <div className="bg-card rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Withdrawal Details</h2>
            
            {selectedWithdrawal ? (
              <div className="space-y-4">
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Withdrawal Amount</p>
                  <p className="text-4xl font-bold text-primary">
                    Rs {selectedWithdrawal.amount.toFixed(2)}
                  </p>
                </div>

                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">User:</span>
                    <span className="font-semibold text-foreground">
                      {getUsernameById(selectedWithdrawal.userId)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Method:</span>
                    <span className="font-semibold text-foreground">
                      {selectedWithdrawal.method === 'bank' ? 'Bank Transfer' : 'Binance USDT'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Requested:</span>
                    <span className="font-semibold text-foreground">
                      {new Date(selectedWithdrawal.requestedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-semibold ${
                      selectedWithdrawal.status === 'approved' ? 'text-primary' :
                      selectedWithdrawal.status === 'rejected' ? 'text-destructive' :
                      'text-muted-foreground'
                    }`}>
                      {selectedWithdrawal.status}
                    </span>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">
                    {selectedWithdrawal.method === 'bank' ? 'Bank Account Details' : 'Binance USDT Address'}
                  </h4>
                  <p className="text-sm text-muted-foreground break-all">
                    {selectedWithdrawal.details}
                  </p>
                </div>

                {selectedWithdrawal.status === 'pending' && (
                  <div className="space-y-2 pt-4 border-t border-border">
                    <h4 className="font-semibold text-foreground mb-3">Admin Actions</h4>

                    <Button
                      onClick={() => handleApprove(selectedWithdrawal.id)}
                      className="w-full flex items-center justify-center gap-2"
                      variant="default"
                    >
                      <CheckCircle size={16} />
                      Approve Withdrawal
                    </Button>

                    <Button
                      onClick={() => handleReject(selectedWithdrawal.id)}
                      className="w-full flex items-center justify-center gap-2"
                      variant="destructive"
                    >
                      <XCircle size={16} />
                      Reject Withdrawal
                    </Button>
                  </div>
                )}

                {selectedWithdrawal.status !== 'pending' && (
                  <div className={`border rounded-lg p-4 ${
                    selectedWithdrawal.status === 'approved'
                      ? 'bg-primary/10 border-primary/20'
                      : 'bg-destructive/10 border-destructive/20'
                  }`}>
                    <p className={`text-sm ${
                      selectedWithdrawal.status === 'approved' ? 'text-primary' : 'text-destructive'
                    }`}>
                      This withdrawal has been {selectedWithdrawal.status}.
                    </p>
                    {selectedWithdrawal.processedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Processed on {new Date(selectedWithdrawal.processedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">
                Select a withdrawal request to view details
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
