import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Trash2, Facebook, Twitter, Instagram } from 'lucide-react';
import { Photo } from '@/types';
import { getUserPhotos, toggleLike, deletePhoto } from '@/lib/photos';
import { useAuthStore } from '@/stores/authStore';
import PhotoViewer from './PhotoViewer';
import { formatDistanceToNow } from 'date-fns';

interface PhotoGalleryProps {
  userId: string;
  isOwnProfile?: boolean;
}

export default function PhotoGallery({ userId, isOwnProfile = false }: PhotoGalleryProps) {
  const { currentUser } = useAuthStore();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    loadPhotos();
  }, [userId]);

  const loadPhotos = () => {
    const userPhotos = getUserPhotos(userId);
    setPhotos(userPhotos);
  };

  const handleLike = (photoId: string) => {
    if (!currentUser) {
      alert('Please login to like photos');
      return;
    }
    toggleLike(photoId, currentUser.id);
    loadPhotos();
  };

  const handleDelete = (photoId: string) => {
    if (confirm('Are you sure you want to delete this photo?')) {
      deletePhoto(photoId);
      loadPhotos();
    }
  };

  const handleShare = (photo: Photo, platform: string) => {
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
        // Instagram doesn't support direct sharing via URL, show message
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

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border border-border">
        <p className="text-muted-foreground">
          {isOwnProfile ? 'Upload your first photo to get started!' : 'No photos yet'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {photos.map((photo) => {
          const isLiked = currentUser && photo.likes.includes(currentUser.id);
          
          return (
            <div
              key={photo.id}
              className="relative group bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all card-hover"
            >
              {/* Photo */}
              <div
                onClick={() => setSelectedPhoto(photo)}
                className="cursor-pointer aspect-square"
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.caption || 'Photo'}
                  className="w-full h-full object-cover"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1 text-white">
                    <Heart size={20} />
                    <span className="font-semibold">{photo.likes.length}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white">
                    <MessageCircle size={20} />
                    <span className="font-semibold">{photo.comments.length}</span>
                  </div>
                </div>
              </div>

              {/* Caption */}
              {photo.caption && (
                <div className="p-2 bg-card">
                  <p className="text-xs text-foreground line-clamp-2">{photo.caption}</p>
                </div>
              )}

              {/* Actions */}
              <div className="p-2 bg-card border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Like Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(photo.id);
                    }}
                    className={`flex items-center gap-1 text-sm ${
                      isLiked ? 'text-red-600' : 'text-muted-foreground hover:text-red-600'
                    } transition`}
                  >
                    <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                    <span>{photo.likes.length}</span>
                  </button>

                  {/* Comment Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhoto(photo);
                    }}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition"
                  >
                    <MessageCircle size={16} />
                    <span>{photo.comments.length}</span>
                  </button>
                </div>

                {/* Share & Delete */}
                <div className="flex items-center gap-1">
                  {/* Share Button */}
                  <div className="relative group/share">
                    <button className="p-1 text-muted-foreground hover:text-primary transition">
                      <Share2 size={16} />
                    </button>
                    
                    {/* Share Dropdown */}
                    <div className="absolute bottom-full right-0 mb-2 bg-card border border-border rounded-lg shadow-xl p-2 opacity-0 invisible group-hover/share:opacity-100 group-hover/share:visible transition-all z-10">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(photo, 'facebook');
                          }}
                          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                          title="Share on Facebook"
                        >
                          <Facebook size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(photo, 'twitter');
                          }}
                          className="p-2 bg-sky-500 text-white rounded hover:bg-sky-600 transition"
                          title="Share on Twitter"
                        >
                          <Twitter size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(photo, 'whatsapp');
                          }}
                          className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                          title="Share on WhatsApp"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(photo, 'instagram');
                          }}
                          className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded hover:from-purple-700 hover:to-pink-700 transition"
                          title="Share on Instagram"
                        >
                          <Instagram size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(photo, 'linkedin');
                          }}
                          className="p-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
                          title="Share on LinkedIn"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button (own photos only) */}
                  {isOwnProfile && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(photo.id);
                      }}
                      className="p-1 text-muted-foreground hover:text-red-600 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Timestamp */}
              <div className="px-2 pb-2">
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(photo.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <PhotoViewer
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onUpdate={loadPhotos}
        />
      )}
    </>
  );
}
