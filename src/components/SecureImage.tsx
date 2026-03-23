import React from 'react';

interface SecureImageProps {
  bucket: string;
  path: string;
  alt?: string;
  className?: string;
}

export const SecureImage: React.FC<SecureImageProps> = ({ 
  path, 
  alt = '', 
  className = '' 
}) => {
  // In mock mode, path is either a full URL or a placeholder
  const src = path.startsWith('http') ? path : '/placeholder.svg';
  return <img src={src} alt={alt} className={className} />;
};
