import { Photo, PhotoComment } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const PHOTOS_KEY = 'privateconnect_photos';

// Get all photos
export const getAllPhotos = (): Photo[] => {
  const data = localStorage.getItem(PHOTOS_KEY);
  return data ? JSON.parse(data) : [];
};

// Save photos
export const savePhotos = (photos: Photo[]) => {
  localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
};

// Get photos by user ID
export const getUserPhotos = (userId: string): Photo[] => {
  const photos = getAllPhotos();
  return photos.filter(p => p.userId === userId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

// Add new photo
export const addPhoto = (userId: string, imageUrl: string, caption?: string): Photo => {
  const photos = getAllPhotos();
  
  const newPhoto: Photo = {
    id: uuidv4(),
    userId,
    imageUrl,
    caption,
    likes: [],
    comments: [],
    createdAt: new Date().toISOString(),
  };
  
  photos.push(newPhoto);
  savePhotos(photos);
  
  return newPhoto;
};

// Delete photo
export const deletePhoto = (photoId: string) => {
  const photos = getAllPhotos();
  const filtered = photos.filter(p => p.id !== photoId);
  savePhotos(filtered);
};

// Toggle like on photo
export const toggleLike = (photoId: string, userId: string): boolean => {
  const photos = getAllPhotos();
  const photo = photos.find(p => p.id === photoId);
  
  if (!photo) return false;
  
  const likeIndex = photo.likes.indexOf(userId);
  
  if (likeIndex > -1) {
    // Unlike
    photo.likes.splice(likeIndex, 1);
  } else {
    // Like
    photo.likes.push(userId);
  }
  
  savePhotos(photos);
  return likeIndex === -1; // Return true if liked, false if unliked
};

// Add comment to photo
export const addComment = (
  photoId: string,
  userId: string,
  username: string,
  userImage: string | undefined,
  text: string
): PhotoComment => {
  const photos = getAllPhotos();
  const photo = photos.find(p => p.id === photoId);
  
  if (!photo) throw new Error('Photo not found');
  
  const comment: PhotoComment = {
    id: uuidv4(),
    userId,
    username,
    userImage,
    text,
    createdAt: new Date().toISOString(),
  };
  
  photo.comments.push(comment);
  savePhotos(photos);
  
  return comment;
};

// Delete comment
export const deleteComment = (photoId: string, commentId: string) => {
  const photos = getAllPhotos();
  const photo = photos.find(p => p.id === photoId);
  
  if (!photo) return;
  
  photo.comments = photo.comments.filter(c => c.id !== commentId);
  savePhotos(photos);
};

// Get photo by ID
export const getPhotoById = (photoId: string): Photo | null => {
  const photos = getAllPhotos();
  return photos.find(p => p.id === photoId) || null;
};
