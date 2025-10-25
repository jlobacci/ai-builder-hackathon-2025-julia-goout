import { supabase } from "@/integrations/supabase/client";

/**
 * Gets a signed URL for a private storage file
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @param expiresIn - Time in seconds until the URL expires (default: 3600 = 1 hour)
 * @returns The signed URL or null if there's an error
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error in getSignedUrl:', error);
    return null;
  }
}

/**
 * Gets a public URL for a public storage file
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @returns The public URL
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
