import { supabase } from './supabase';

/**
 * Uploads a file to Supabase Storage (Bucket: 'photos').
 * NOTE: For Cloudflare R2, you would typically need a backend API to generate presigned URLs.
 * To keep this frontend-only and simpler for deployment, we are using Supabase Storage directly here.
 */
export const uploadToR2 = async (
  file: File | Blob,
  path: string,
  contentType: string
): Promise<string> => {
  try {
    // 1. Upload the file to Supabase Storage bucket named 'photos'
    const { data, error } = await supabase.storage
      .from('photos')
      .upload(path, file, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error('Storage Upload Error:', error);
      throw error;
    }

    // 2. Get the Public URL to display the image
    const { data: publicUrlData } = supabase.storage
      .from('photos')
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Upload failed:', err);
    throw new Error('Image upload failed');
  }
};
