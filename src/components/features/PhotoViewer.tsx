import { useState } from 'react';
import { X, Heart, Send, Trash2, Facebook, Twitter, Instagram, Share2 } from 'lucide-react';
import { Photo } from '@/types';
import { toggleLike, addComment, deleteComment } from '@/lib/photos';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';

interface PhotoViewerProps {
  photo: Photo;
  onClose: () => void;
  onUpdate: () => void;
}

export default function PhotoViewer({ photo, onClose, onUpdate }: PhotoViewerProps) {
  const { currentUser } = useAuthStore();
  const [commentText, setCommentText] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);

  const isLiked = currentUser && photo.likes.includes(currentUser.id);

  const handleLike = () => {
    if (!currentUser) {
      alert('Please login to like photos');
      return;
    }
    toggleLike(photo.id, currentUser.id);
    onUpdate();
  };

  const handleComment = () => {
    if (!currentUser) {
      alert('Please login to comment');
      return;
    }
    
    if (!commentText.trim()) return;
    
    addComment(
      photo.id,
      currentUser.id,
      currentUser.username,
      currentUser.profileImage,
      commentText
    );
    
    setCommentText('');
    onUpdate();
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm('Delete this comment?')) {
      deleteComment(photo.id, commentId);
      onUpdate();
    }
  };

  const handleShare = (platform: string) => {
    const shareUrl = window.location.href;
    const shareText = photo.caption || 'Check out this photo!';
    
    let url = '';
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      case 'instagram':
        alert('To share on Instagram: Screenshot this photo and post it manually');
        return;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
        {/* Left: Photo */}
        <div className="md:w-2/3 bg-black flex items-center justify-center relative">
          <img
            src={photo.imageUrl}
            alt={photo.caption || 'Photo'}
            className="max-w-full max-h-[70vh] object-contain"
          />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Right: Comments & Info */}
        <div className="md:w-1/3 flex flex-col max-h-[90vh]">
          {/* Caption */}
          {photo.caption && (
            <div className="p-4 border-b border-border">
              <p className="text-foreground">{photo.caption}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {formatDistanceToNow(new Date(photo.createdAt), { addSuffix: true })}
              </p>
            </div>
          )}

          {/* Like & Share Actions */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 ${
                  isLiked ? 'text-red-600' : 'text-muted-foreground hover:text-red-600'
                } transition`}
              >
                <Heart size={24} className={isLiked ? 'fill-current' : ''} />
                <span className="font-semibold">{photo.likes.length}</span>
              </button>
            </div>

            {/* Share Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition"
              >
                <Share2 size={20} />
                <span className="text-sm font-medium">Share</span>
              </button>

              {showShareMenu && (
                <>
                  {/* Backdrop to close menu */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowShareMenu(false)}
                  />
                  
                  {/* Share Menu */}
                  <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-xl p-3 z-20 min-w-[200px]">
                    <p className="text-xs text-muted-foreground mb-2 font-semibold">Share on:</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          handleShare('facebook');
                          setShowShareMenu(false);
                        }}
                        className="w-full flex items-center gap-3 p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        <Facebook size={18} />
                        <span className="text-sm font-medium">Facebook</span>
                      </button>
                      <button
                        onClick={() => {
                          handleShare('twitter');
                          setShowShareMenu(false);
                        }}
                        className="w-full flex items-center gap-3 p-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition"
                      >
                        <Twitter size={18} />
                        <span className="text-sm font-medium">Twitter</span>
                      </button>
                      <button
                        onClick={() => {
                          handleShare('whatsapp');
                          setShowShareMenu(false);
                        }}
                        className="w-full flex items-center gap-3 p-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        <span className="text-sm font-medium">WhatsApp</span>
                      </button>
                      <button
                        onClick={() => {
                          handleShare('instagram');
                          setShowShareMenu(false);
                        }}
                        className="w-full flex items-center gap-3 p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded hover:from-purple-700 hover:to-pink-700 transition"
                      >
                        <Instagram size={18} />
                        <span className="text-sm font-medium">Instagram</span>
                      </button>
                      <button
                        onClick={() => {
                          handleShare('linkedin');
                          setShowShareMenu(false);
                        }}
                        className="w-full flex items-center gap-3 p-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                        <span className="text-sm font-medium">LinkedIn</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {photo.comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              photo.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <img
                    src={comment.userImage || 'https://via.placeholder.com/40'}
                    alt={comment.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="bg-muted rounded-lg p-3">
                      <p className="font-semibold text-sm text-foreground">{comment.username}</p>
                      <p className="text-sm text-foreground mt-1">{comment.text}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 px-1">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </p>
                      {currentUser && currentUser.id === comment.userId && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                placeholder="Add a comment..."
                className="flex-1"
              />
              <Button onClick={handleComment} size="icon">
                <Send size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
