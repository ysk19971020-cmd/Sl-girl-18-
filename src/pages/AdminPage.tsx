import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { getUsers, updateUser } from '@/lib/storage';
import { User } from '@/types';
import { BadgeCheck, DollarSign, Ban, CheckCircle, Tags, XCircle, Eye, Shield, UserPlus, UserMinus, Camera, AlertTriangle } from 'lucide-react';

export default function AdminPage() {
  const { currentUser, isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'admins'>('users');

  useEffect(() => {
    // SECURITY: Only jayakodyarachchigemahisha@gmail.com can access admin panel
    if (!isLoggedIn || !currentUser?.isAdmin || currentUser.email !== 'jayakodyarachchigemahisha@gmail.com') {
      alert('⛔ UNAUTHORIZED: Only J A Y S Kavinda (jayakodyarachchigemahisha@gmail.com) can access admin panel!');
      navigate('/home');
      return;
    }
    loadUsers();
  }, [isLoggedIn, currentUser, navigate]);

  const loadUsers = () => {
    const allUsers = getUsers();
    // SECURITY: Only jayakodyarachchigemahisha@gmail.com can be admin
    const authorizedAdmins = allUsers.filter(u => u.isAdmin && u.email === 'jayakodyarachchigemahisha@gmail.com');
    setAdminUsers(authorizedAdmins);
    setUsers(allUsers.filter(u => !u.isAdmin || u.email !== 'jayakodyarachchigemahisha@gmail.com'));
  };

  const handleVerifyGender = (userId: string) => {
    updateUser(userId, { verified: true });
    loadUsers();
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, verified: true });
    }
  };

  const handleApproveCategory = (userId: string) => {
    updateUser(userId, { categoryApproved: true });
    loadUsers();
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, categoryApproved: true });
    }
  };

  const handleChangeCategory = (userId: string, newCategory: string) => {
    updateUser(userId, { category: newCategory as any });
    loadUsers();
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, category: newCategory as any });
    }
  };

  const handleApprovePriceActivation = (userId: string) => {
    const user = users.find(u => u.id === userId) || selectedUser;
    if (!user) return;

    // Calculate 50% wallet bonus from subscription plan
    // Extract plan amount from activationFeeProof (format: "$25", "$50", "$75", "$100")
    let walletBonus = 0;
    if (user.activationFeeProof) {
      const proofText = user.activationFeeProof.toLowerCase();
      if (proofText.includes('25') || proofText.includes('1 month')) {
        walletBonus = 12.50; // 50% of $25
      } else if (proofText.includes('50') || proofText.includes('3 month')) {
        walletBonus = 25.00; // 50% of $50
      } else if (proofText.includes('75') || proofText.includes('6 month')) {
        walletBonus = 37.50; // 50% of $75
      } else if (proofText.includes('100') || proofText.includes('12 month')) {
        walletBonus = 50.00; // 50% of $100
      }
    }

    // Approve and add wallet bonus
    const currentBalance = user.walletBalance || 0;
    const newBalance = currentBalance + walletBonus;
    
    updateUser(userId, { 
      canSetPrice: true, 
      priceActivated: true,
      walletBalance: newBalance
    });
    
    loadUsers();
    if (selectedUser?.id === userId) {
      setSelectedUser({ 
        ...selectedUser, 
        canSetPrice: true, 
        priceActivated: true,
        walletBalance: newBalance
      });
    }

    alert(`✅ Price activation approved!\n💰 Wallet bonus added: $${walletBonus.toFixed(2)}\n📊 New wallet balance: $${newBalance.toFixed(2)}`);
  };

  const handleBlock = (userId: string) => {
    const user = users.find(u => u.id === userId);
    const newStatus = user?.status === 'active' ? 'blocked' : 'active';
    updateUser(userId, { status: newStatus });
    loadUsers();
    if (selectedUser?.id === userId) {
      setSelectedUser({ ...selectedUser, status: newStatus });
    }
  };

  const handlePromoteToAdmin = (userId: string) => {
    if (confirm('Are you sure you want to promote this user to Admin? They will have full admin access.')) {
      updateUser(userId, { isAdmin: true });
      loadUsers();
      setSelectedUser(null);
    }
  };

  const handleDemoteAdmin = (userId: string) => {
    if (userId === currentUser?.id) {
      alert('You cannot demote yourself!');
      return;
    }
    if (confirm('Are you sure you want to remove admin access from this user?')) {
      updateUser(userId, { isAdmin: false });
      loadUsers();
      setSelectedUser(null);
    }
  };

  // SECURITY: Double-check admin email
  if (!isLoggedIn || !currentUser?.isAdmin || currentUser.email !== 'jayakodyarachchigemahisha@gmail.com') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-4">Admin Panel</h1>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 bg-muted p-1 rounded-lg inline-flex">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                activeTab === 'users'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Regular Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`px-6 py-2 rounded-md font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'admins'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Shield size={16} />
              Admins ({adminUsers.length})
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* User/Admin List */}
          <div className="bg-card rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              {activeTab === 'users' ? (
                <>All Users ({users.length})</>
              ) : (
                <>
                  <Shield size={24} className="text-primary" />
                  Admin Users ({adminUsers.length})
                </>
              )}
            </h2>
            
            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {activeTab === 'users' && users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedUser?.id === user.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-border/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{user.username}</span>
                      {user.verified && <BadgeCheck className="text-primary" size={16} />}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.status === 'active' 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="capitalize">{user.gender}</span>
                    <span>•</span>
                    <span className="capitalize">{user.category}</span>
                    <span>•</span>
                    <span>{user.email}</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {!user.verified && (
                      <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded flex items-center gap-1">
                        <XCircle size={12} /> Unverified
                      </span>
                    )}
                    {!user.categoryApproved && (
                      <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded flex items-center gap-1">
                        <XCircle size={12} /> Category Pending
                      </span>
                    )}
                    {!user.canSetPrice && user.activationFeeProof && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded flex items-center gap-1">
                        <DollarSign size={12} /> Fee Submitted
                      </span>
                    )}
                    {user.canSetPrice && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded flex items-center gap-1">
                        <CheckCircle size={12} /> Price Active
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {activeTab === 'users' && users.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No users found</p>
              )}

              {activeTab === 'admins' && adminUsers.map((admin) => (
                <div
                  key={admin.id}
                  onClick={() => setSelectedUser(admin)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedUser?.id === admin.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-border/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="text-primary" size={18} />
                      <span className="font-semibold text-foreground">{admin.username}</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      Admin
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{admin.email}</span>
                    {admin.id === currentUser?.id && (
                      <>
                        <span>•</span>
                        <span className="text-primary font-semibold">You</span>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {activeTab === 'admins' && adminUsers.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No admins found</p>
              )}
            </div>
          </div>

          {/* User Details & Actions */}
          <div className="bg-card rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">User Details & Actions</h2>
            
            {selectedUser ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedUser.profileImage || 'https://via.placeholder.com/100'}
                    alt={selectedUser.username}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{selectedUser.username}</h3>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    <p className="text-sm text-muted-foreground capitalize">Gender: {selectedUser.gender}</p>
                    <p className="text-sm text-muted-foreground">Age 18+: {selectedUser.age18Plus ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                {/* Status Overview */}
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gender Verified:</span>
                    <span className={selectedUser.verified ? 'text-primary font-semibold flex items-center gap-1' : 'text-destructive flex items-center gap-1'}>
                      {selectedUser.verified ? <><CheckCircle size={14} /> Yes</> : <><XCircle size={14} /> No</>}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-semibold text-foreground capitalize">{selectedUser.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category Approved:</span>
                    <span className={selectedUser.categoryApproved ? 'text-primary font-semibold flex items-center gap-1' : 'text-destructive flex items-center gap-1'}>
                      {selectedUser.categoryApproved ? <><CheckCircle size={14} /> Yes</> : <><XCircle size={14} /> No</>}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Can Set Prices:</span>
                    <span className={selectedUser.canSetPrice ? 'text-primary font-semibold flex items-center gap-1' : 'text-destructive flex items-center gap-1'}>
                      {selectedUser.canSetPrice ? <><CheckCircle size={14} /> Yes</> : <><XCircle size={14} /> No</>}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Account Status:</span>
                    <span className={selectedUser.status === 'active' ? 'text-primary font-semibold' : 'text-destructive font-semibold'}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>

                {/* VERIFICATION SELFIE - ADMIN ONLY */}
                {selectedUser.verificationSelfie && (
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                    <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                      <Camera size={18} className="text-red-600" />
                      🔴 LIVE SELFIE VERIFICATION (MANDATORY)
                    </h4>
                    <div className="relative rounded-lg overflow-hidden border-2 border-red-400">
                      <img
                        src={selectedUser.verificationSelfie}
                        alt="Verification Selfie"
                        className="w-full h-auto max-h-96 object-contain bg-black"
                      />
                      <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <AlertTriangle size={14} />
                        Admin Verification Required
                      </div>
                    </div>
                    <div className="mt-3 bg-red-100 border border-red-400 rounded p-3 text-xs text-red-900">
                      <p className="font-bold mb-1">🔒 SECURITY CHECK:</p>
                      <ul className="space-y-0.5 ml-4">
                        <li>✓ තැනැත්තාගේ මුහුණ පැහැදිලිව පෙනෙනවාද?</li>
                        <li>✓ Live selfie එකක් නම් තහවුරු කරන්න (not uploaded photo)</li>
                        <li>✓ Gender එක profile එකේ දැක්වෙන එක සමග match වෙනවාද?</li>
                        <li>✓ Clear quality, good lighting තියෙනවාද?</li>
                        <li>⚠️ Fake/unclear photos reject කරන්න</li>
                      </ul>
                    </div>
                  </div>
                )}

                {!selectedUser.verificationSelfie && (
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 text-center">
                    <Camera className="text-red-600 mx-auto mb-2" size={32} />
                    <p className="text-red-900 font-bold text-sm">⚠️ NO VERIFICATION SELFIE</p>
                    <p className="text-red-700 text-xs mt-1">This user did not submit a live selfie (security risk)</p>
                  </div>
                )}

                {/* Activation Fee Proof */}
                {selectedUser.activationFeeProof && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <DollarSign size={16} className="text-primary" />
                      Activation Fee Payment Proof
                    </h4>
                    <p className="text-sm text-foreground break-all">{selectedUser.activationFeeProof}</p>
                  </div>
                )}

                {/* Current Prices */}
                {selectedUser.canSetPrice && (
                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">Current Pricing</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Chat:</span>
                        <span className="font-semibold text-foreground">${selectedUser.chatPrice || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Voice:</span>
                        <span className="font-semibold text-foreground">${selectedUser.voicePrice || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Video:</span>
                        <span className="font-semibold text-foreground">${selectedUser.videoPrice || 0}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Actions */}
                <div className="space-y-2 pt-4 border-t border-border">
                  <h4 className="font-semibold text-foreground mb-3">Admin Actions</h4>

                  {/* View Public Profile */}
                  <Button
                    onClick={() => navigate(`/profile/${selectedUser.id}`)}
                    className="w-full flex items-center justify-center gap-2"
                    variant="outline"
                  >
                    <Eye size={16} />
                    View Public Profile
                  </Button>

                  {/* Gender Verification - REQUIRES SELFIE */}
                  {!selectedUser.verified && (
                    selectedUser.verificationSelfie ? (
                      <Button
                        onClick={() => handleVerifyGender(selectedUser.id)}
                        className="w-full flex items-center justify-center gap-2"
                        variant="default"
                      >
                        <BadgeCheck size={16} />
                        ✅ Verify Gender (Selfie OK)
                      </Button>
                    ) : (
                      <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-center">
                        <AlertTriangle className="text-red-600 mx-auto mb-2" size={20} />
                        <p className="text-xs text-red-900 font-semibold">
                          🚨 CANNOT VERIFY: No live selfie submitted
                        </p>
                        <p className="text-xs text-red-700 mt-1">
                          User must re-register with mandatory selfie
                        </p>
                      </div>
                    )
                  )}

                  {/* Category Management */}
                  <div className="bg-muted rounded-lg p-3">
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Change Category
                    </label>
                    <select
                      value={selectedUser.category}
                      onChange={(e) => handleChangeCategory(selectedUser.id, e.target.value)}
                      className="w-full p-2 border border-border rounded-md bg-background text-foreground mb-2"
                    >
                      <option value="girls">Girls Personal</option>
                      <option value="boys">Boys Personal</option>
                      <option value="livecam">Live Cam</option>
                      <option value="spa">Spa</option>
                      <option value="others">Others</option>
                    </select>
                    {!selectedUser.categoryApproved && (
                      <Button
                        onClick={() => handleApproveCategory(selectedUser.id)}
                        className="w-full flex items-center justify-center gap-2"
                        size="sm"
                      >
                        <Tags size={16} />
                        Approve Category
                      </Button>
                    )}
                  </div>

                  {/* Price Activation */}
                  {selectedUser.verified && selectedUser.categoryApproved && !selectedUser.canSetPrice && selectedUser.activationFeeProof && (
                    <Button
                      onClick={() => handleApprovePriceActivation(selectedUser.id)}
                      className="w-full flex items-center justify-center gap-2"
                      variant="default"
                    >
                      <DollarSign size={16} />
                      Approve Price Activation
                    </Button>
                  )}

                  {/* Promote to Admin - Only for regular users */}
                  {!selectedUser.isAdmin && (
                    <Button
                      onClick={() => handlePromoteToAdmin(selectedUser.id)}
                      className="w-full flex items-center justify-center gap-2"
                      variant="default"
                    >
                      <UserPlus size={16} />
                      Promote to Admin
                    </Button>
                  )}

                  {/* Demote Admin - Only for admin users */}
                  {selectedUser.isAdmin && selectedUser.id !== currentUser?.id && (
                    <Button
                      onClick={() => handleDemoteAdmin(selectedUser.id)}
                      className="w-full flex items-center justify-center gap-2"
                      variant="destructive"
                    >
                      <UserMinus size={16} />
                      Remove Admin Access
                    </Button>
                  )}

                  {selectedUser.isAdmin && selectedUser.id === currentUser?.id && (
                    <div className="bg-muted border border-border rounded-lg p-3 text-center">
                      <p className="text-sm text-muted-foreground">
                        ℹ️ You cannot remove your own admin access
                      </p>
                    </div>
                  )}

                  {/* Block/Unblock - Only for regular users */}
                  {!selectedUser.isAdmin && (
                    <Button
                      onClick={() => handleBlock(selectedUser.id)}
                      className="w-full flex items-center justify-center gap-2"
                      variant={selectedUser.status === 'active' ? 'destructive' : 'secondary'}
                    >
                      {selectedUser.status === 'active' ? (
                        <>
                          <Ban size={16} />
                          Block User
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          Unblock User
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">
                Select a user to view details and perform actions
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
