import { Users, UserCircle, Video, Droplet, BadgeCheck } from 'lucide-react';
import { Category } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
}

export default function Sidebar({ selectedCategory, onCategoryChange }: SidebarProps) {
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();

  const categories = [
    { id: 'all' as Category, name: 'All Profiles', icon: Users },
    { id: 'girls' as Category, name: 'Girls Personal', icon: UserCircle },
    { id: 'boys' as Category, name: 'Boys Personal', icon: UserCircle },
    { id: 'livecam' as Category, name: 'Live Cam', icon: Video },
    { id: 'spa' as Category, name: 'Spa', icon: Droplet },
    { id: 'verified' as Category, name: 'Verified Profiles', icon: BadgeCheck },
    { id: 'others' as Category, name: 'Others', icon: Users },
  ];

  return (
    <aside className="w-64 bg-card rounded-lg shadow-lg p-4 h-fit sticky top-20">
      <h2 className="text-lg font-bold mb-4 text-foreground">Categories</h2>
      
      <nav className="space-y-1">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`category-item w-full ${
                isSelected ? 'bg-muted text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{category.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-6 pt-6 border-t border-border space-y-2">
        {!isLoggedIn ? (
          <>
            <Button
              onClick={() => navigate('/login')}
              className="w-full"
              variant="default"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate('/register')}
              className="w-full"
              variant="outline"
            >
              Register
            </Button>
          </>
        ) : (
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full"
            variant="default"
          >
            My Account
          </Button>
        )}
      </div>
    </aside>
  );
}
