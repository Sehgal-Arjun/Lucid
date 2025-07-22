import { supabase } from './supabaseClient';

export interface ImageData {
  image_id: number;
  entry_id: number;
  file_path: string;
  caption?: string;
}

const getCurrentUser = () => {
  try {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('Error getting user from session storage:', error);
    return null;
  }
};


const generateImagePath = (userId: number, fileName: string): string => {
  const timestamp = Date.now();
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `user_${userId}/${timestamp}_${cleanFileName}`;
};

export const uploadImage = async (
  file: File,
  entryId: number
): Promise<{ success: boolean; data?: ImageData; error?: string }> => {
  try {
    const user = getCurrentUser();
    if (!user || !user.uid) {
      return { success: false, error: 'User not authenticated. Please log in.' };
    }

    
    const filePath = generateImagePath(user.uid, file.name);


    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('journal-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }


    const { data, error } = await supabase.rpc('add_image_to_entry', {
      p_entry_id: entryId,
      p_file_path: filePath,
      p_caption: null
    });

    if (error) {
      
      await supabase.storage
        .from('journal-images')
        .remove([filePath]);
      return { success: false, error: error.message };
    }

    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Upload exception:', error);
    return { success: false, error: 'Failed to upload image' };
  }
};

export const getEntryImages = async (
  entryId: number
): Promise<{ data?: ImageData[]; error?: string }> => {
  try {
    const user = getCurrentUser();
    console.log('[getEntryImages] user:', user, 'entryId:', entryId);
    
    if (!user || !user.uid) {
      return { error: 'User not authenticated. Please log in.' };
    }

    const { data, error } = await supabase.rpc('get_entry_images', {
      p_entry_id: entryId
    });

    console.log('[getEntryImages] RPC result:', { data, error });

    if (error) {
      return { error: error.message };
    }

    return { data: data || [] };
  } catch (error) {
    console.log('[getEntryImages] Exception:', error);
    return { error: 'Failed to load images' };
  }
};

export const deleteImage = async (
  imageId: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const user = getCurrentUser();
    if (!user || !user.uid) {
      return { success: false, error: 'User not authenticated. Please log in.' };
    }


    const { data: images } = await supabase
      .from('images')
      .select('file_path')
      .eq('image_id', imageId)
      .single();


    const { data, error } = await supabase.rpc('delete_image', {
      p_image_id: imageId,
      p_user_id: user.uid
    });

    if (error) {
      return { success: false, error: error.message };
    }

 
    if (images?.file_path) {
      await supabase.storage
        .from('journal-images')
        .remove([images.file_path]);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete image' };
  }
};

export const updateImageCaption = async (
  imageId: number,
  caption: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const user = getCurrentUser();
    if (!user || !user.uid) {
      return { success: false, error: 'User not authenticated. Please log in.' };
    }

    const { data, error } = await supabase.rpc('update_image_caption', {
      p_image_id: imageId,
      p_caption: caption,
      p_user_id: user.uid
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update caption' };
  }
};

export const getImageUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from('journal-images')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};