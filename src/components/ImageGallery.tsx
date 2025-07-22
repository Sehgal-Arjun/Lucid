import React, { useState } from 'react';
import { X, Edit2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { deleteImage, updateImageCaption, getImageUrl, type ImageData } from '@/lib/imageService';

interface ImageGalleryProps {
  images: ImageData[];
  onImageDeleted: (imageId: number) => void;
  onImageUpdated: (imageId: number, caption: string) => void;
  readOnly?: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  onImageDeleted, 
  onImageUpdated,
  readOnly = false 
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);
  const { toast } = useToast();

  const handleDeleteImage = async (imageId: number) => {
    if (deleting) return;
    
    setDeleting(imageId);
    
    try {
      const result = await deleteImage(imageId);
      
      if (result.success) {
        onImageDeleted(imageId);
        toast({
          title: "Image Deleted",
          description: "The image has been removed from your journal entry.",
        });
      } else {
        toast({
          title: "Delete Failed",
          description: result.error || "Failed to delete image. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Delete Error",
        description: "An unexpected error occurred while deleting.",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleEditCaption = (image: ImageData) => {
    setEditingId(image.image_id);
    setEditCaption(image.caption || '');
  };

  const handleSaveCaption = async (imageId: number) => {
    try {
      const result = await updateImageCaption(imageId, editCaption);
      
      if (result.success) {
        onImageUpdated(imageId, editCaption);
        setEditingId(null);
        toast({
          title: "Caption Updated",
          description: "Image caption has been saved.",
        });
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Failed to update caption. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Update Error",
        description: "An unexpected error occurred while updating.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditCaption('');
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-slate-700">Images ({images.length})</h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {images.map((image) => (
          <div key={image.image_id} className="group relative">
            <div className="aspect-square rounded-lg overflow-hidden bg-slate-100">
              <img
                src={getImageUrl(image.file_path)}
                alt={image.caption || 'Journal image'}
                className="w-full h-full object-cover"
              />
              
              {!readOnly && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteImage(image.image_id)}
                    disabled={deleting === image.image_id}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <div className="mt-2">
              {editingId === image.image_id ? (
                <div className="flex gap-2">
                  <Input
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    placeholder="Add a caption..."
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSaveCaption(image.image_id)}
                    className="px-2"
                  >
                    <Save className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="px-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600 truncate">
                    {image.caption || 'No caption'}
                  </p>
                  {!readOnly && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditCaption(image)}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery; 