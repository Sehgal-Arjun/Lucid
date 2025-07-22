import React, { useRef, useState } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { uploadImage, type ImageData } from '@/lib/imageService';

interface ImageUploadProps {
  entryId: number;
  onImageUploaded: (image: ImageData) => void;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ entryId, onImageUploaded, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('[ImageUpload] Starting upload for entryId:', entryId);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadImage(file, entryId);
      console.log('[ImageUpload] Upload result:', result);
      
      if (result.success && result.data) {
        console.log('[ImageUpload] Calling onImageUploaded');
        onImageUploaded(result.data);
        toast({
          title: "Image Uploaded",
          description: "Your image has been added to the journal entry.",
        });
      } else {
        toast({
          title: "Upload Failed",
          description: result.error || "Failed to upload image. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred while uploading.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleButtonClick}
        disabled={disabled || isUploading}
        className="text-slate-600 hover:bg-white rounded-xl"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <ImageIcon className="h-4 w-4 mr-2" />
            Add Photo
          </>
        )}
      </Button>
    </>
  );
};

export default ImageUpload; 