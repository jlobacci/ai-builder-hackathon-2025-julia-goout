import React from 'react';
import { getPublicUrl } from '@/lib/storage';

interface SecureImageProps {
  bucket: string;
  path: string;
  alt?: string;
  className?: string;
}

export const SecureImage: React.FC<SecureImageProps> = ({ 
  bucket, 
  path, 
  alt = '', 
  className = '' 
}) => {
  const publicUrl = getPublicUrl(bucket, path);

  return <img src={publicUrl} alt={alt} className={className} />;
};
