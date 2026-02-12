import { MessageCircle, Phone, Video, Eye, MapPin, BadgeCheck } from 'lucide-react';
import { User } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface ProfileCardProps {
  user: User;
}

export default function ProfileCard({ user }: ProfileCardProps) {
  const navigate = useNavigate();
  
  const timeAgo = formatDistanceToNow(new Date(user.createdAt), { addSuffix: true });
  
  const cardClasses = `bg-card rounded-lg overflow-hidden card-shadow card-hover cursor-pointer ${
    user.featured ? 'featured-card' : ''
  }`;

  return (
    <div className={cardClasses} onClick={() => navigate(`/profile/${user.id}`)}>
      {/* Profile Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={user.profileImage || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={user.username}
          className="w-full h-full object-cover"
        />
        {user.featured && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
            FEATURED
          </div>
        )}
        {user.verified && (
          <div className="absolute top-2 right-2">
            <BadgeCheck className="text-primary fill-white" size={24} />
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              {user.username}
              {user.verified && (
                <BadgeCheck className="text-primary" size={18} />
              )}
            </h3>
            <div className="flex gap-2 mt-1">
              <span className="inline-block bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">
                {user.gender === 'female' ? 'Female' : user.gender === 'male' ? 'Male' : 'Other'}
              </span>
              {user.category && user.category !== 'all' && user.category !== 'verified' && (
                <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                  {user.category === 'girls' ? 'Girls' :
                   user.category === 'boys' ? 'Boys' :
                   user.category === 'livecam' ? 'Live Cam' :
                   user.category === 'spa' ? 'Spa' : 'Others'}
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {user.description || 'No description available.'}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          {user.location && (
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{user.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{user.viewCount || 0} views</span>
          </div>
          <span>{timeAgo}</span>
        </div>

        {/* Wallet Balance Indicator */}
        {user.walletBalance > 0 && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg px-3 py-2 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                <DollarSign size={12} className="text-yellow-600" />
                Custom Wallet:
              </span>
              <span className="text-yellow-600 font-bold text-sm">${user.walletBalance.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">💎 Premium pricing available</p>
          </div>
        )}

        {/* Price Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            className="flex flex-col items-center justify-center bg-primary/10 hover:bg-primary/20 text-primary rounded-lg py-2 px-1 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${user.id}`);
            }}
          >
            <MessageCircle size={16} className="mb-1" />
            <span className="text-xs font-semibold">Chat</span>
            <span className="text-xs">FREE</span>
          </button>
          
          <button
            className="flex flex-col items-center justify-center bg-primary/10 hover:bg-primary/20 text-primary rounded-lg py-2 px-1 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${user.id}`);
            }}
          >
            <Phone size={16} className="mb-1" />
            <span className="text-xs font-semibold">Voice</span>
            <span className="text-xs">FREE</span>
          </button>
          
          <button
            className="flex flex-col items-center justify-center bg-accent/10 hover:bg-accent/20 text-accent rounded-lg py-2 px-1 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${user.id}`);
            }}
          >
            <Video size={16} className="mb-1" />
            <span className="text-xs font-semibold">Video</span>
            <span className="text-xs">${user.videoPrice || 0}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
