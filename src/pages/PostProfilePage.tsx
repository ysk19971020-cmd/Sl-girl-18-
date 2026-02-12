import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { registerUser } from '@/lib/storage';
import { useAuthStore } from '@/stores/authStore';

export default function PostProfilePage() {
  const { isLoggedIn, currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    gender: 'female' as 'male' | 'female' | 'other',
    description: '',
    location: '',
    whatsappNumber: '',
    chatPrice: 500,
    voicePrice: 1000,
    videoPrice: 1500,
    category: 'girls' as string,
  });
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoggedIn && currentUser) {
      setMessage('You already have a profile. Please use your dashboard to edit it.');
      return;
    }

    registerUser({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      gender: formData.gender,
      description: formData.description,
      location: formData.location,
      whatsappNumber: formData.whatsappNumber,
      chatPrice: formData.chatPrice,
      voicePrice: formData.voicePrice,
      videoPrice: formData.videoPrice,
      category: formData.category,
      verified: false,
      priceActivated: false,
      status: 'active',
      isAdmin: false,
    });

    setMessage('Profile created successfully! Please wait for admin approval.');
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-card rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">Post Your Profile</h1>
          
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('successfully') 
                ? 'bg-primary/10 border border-primary/20 text-primary' 
                : 'bg-destructive/10 border border-destructive/20 text-destructive'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Username</label>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                placeholder="Your display name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Password</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="••••••••"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                  required
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                  required
                >
                  <option value="girls">Girls Personal</option>
                  <option value="boys">Boys Personal</option>
                  <option value="livecam">Live Cam</option>
                  <option value="spa">Spa</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border border-border rounded-md bg-background text-foreground min-h-[100px]"
                placeholder="Tell visitors about yourself..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Location</label>
              <Input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Colombo, Kandy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                WhatsApp Number (with country code)
              </label>
              <Input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                placeholder="e.g., +94771234567"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                ⚠️ මෙම WhatsApp number එක video call & photo send සඳහා භාවිතා වෙයි (payment කළ පසු unlock වෙයි)
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Chat Price (Rs)</label>
                <Input
                  type="number"
                  value={formData.chatPrice}
                  onChange={(e) => setFormData({ ...formData, chatPrice: Number(e.target.value) })}
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Voice Price (Rs)</label>
                <Input
                  type="number"
                  value={formData.voicePrice}
                  onChange={(e) => setFormData({ ...formData, voicePrice: Number(e.target.value) })}
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Video Price (Rs)</label>
                <Input
                  type="number"
                  value={formData.videoPrice}
                  onChange={(e) => setFormData({ ...formData, videoPrice: Number(e.target.value) })}
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg text-sm">
              <p className="font-semibold text-foreground mb-2">Important:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Your profile will be reviewed by admin before going live</li>
                <li>Upload payment proof in dashboard to activate pricing</li>
                <li>Ensure all information is accurate</li>
              </ul>
            </div>

            <Button type="submit" className="w-full">
              Submit Profile
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
