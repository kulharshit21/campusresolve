import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';

export const BUCKET_NAME = 'complaint-evidence';
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function uploadComplaintEvidence(
  file: File,
  userId: string
): Promise<{ url: string | null; error: string | null }> {
  // Client-side validation
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      url: null,
      error: 'Invalid file format. Only JPEG, PNG, and WebP images are permitted.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      url: null,
      error: 'File size exceeds 5MB limit. Please upload a smaller image.',
    };
  }

  if (!isSupabaseConfigured) {
    // Development fixture: convert to Data URL for instant preview without backend
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({ url: reader.result as string, error: null });
      };
      reader.onerror = () => {
        resolve({ url: null, error: 'Failed to read image locally.' });
      };
      reader.readAsDataURL(file);
    });
  }

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const sanitizedFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `${userId}/${sanitizedFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return { url: null, error: uploadError.message };
    }

    // Get public URL (or signed URL depending on policy)
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    console.error('Upload exception:', err);
    return { url: null, error: err.message || 'An unexpected upload error occurred.' };
  }
}
