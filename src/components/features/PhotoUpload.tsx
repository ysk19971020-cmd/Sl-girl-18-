import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addPhoto } from '@/lib/photos';
import { uploadFile } from '@/lib/storage';
import { useAuthStore } from '@/stores/authStore';

interface PhotoUploadProps {
  onPhotoUploaded: () => void;
}

export default function PhotoUpload({ onPhotoUploaded }: PhotoUploadProps) {
  const { currentUser } = useAuthStore();
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!imageFile || !currentUser) return;
    
    setUploading(true);
    try {
      // Convert file to blob
      const blob = await imageFile.arrayBuffer().then(buf => new Blob([buf]));
      
      // Upload to profile-images bucket
      const fileName = `${currentUser.id}/${Date.now()}-${imageFile.name}`;
      const imageUrl = await uploadFile('profile-images', blob, fileName);
      
      // Add photo to gallery
      addPhoto(currentUser.id, imageUrl, caption);
      
      // Reset form
      setCaption('');
      setImageFile(null);
      setImagePreview('');
      setShowUploadForm(false);
      
      // Notify parent
      onPhotoUploaded();
    } catch (error) {
      console.error('Photo upload failed:', error);
      alert('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  if (!showUploadForm) {
    return (
      <Button
        onClick={() => setShowUploadForm(true)}
        className="w-full btn-3d bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 hover:from-pink-700 hover:to-blue-700 text-white"
      >
        <Upload size={18} className="mr-2" />
        📸 Upload New Photo
      </Button>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <ImageIcon size={20} className="text-primary" />
          Upload New Photo
        </h3>
        <button
          onClick={() => {
            setShowUploadForm(false);
            setImageFile(null);
            setImagePreview('');
            setCaption('');
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Image Preview */}
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg"
            />
            <button
              onClick={() => {
                setImageFile(null);
                setImagePreview('');
              }}
              className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition">
            <Upload size={48} className="text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Click to select photo</p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or GIF (max 5MB)</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>
        )}

        {/* Caption */}
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">
            Caption (Optional)
          </label>
          <Input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption for your photo..."
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {caption.length}/200 characters
          </p>
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!imageFile || uploading}
          className="w-full btn-3d bg-primary hover:bg-primary/90"
        >
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </Button>
      </div>
    </div>
  );
}
