import React, { useEffect, useState } from 'react';
import { getSignedUrl } from '@/lib/storage';
import { Loader2 } from 'lucide-react';

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
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSignedUrl = async () => {
      try {
        setLoading(true);
        setError(false);
        const url = await getSignedUrl(bucket, path);
        
        if (mounted) {
          if (url) {
            setSignedUrl(url);
          } else {
            setError(true);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading signed URL:', err);
        if (mounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    loadSignedUrl();

    return () => {
      mounted = false;
    };
  }, [bucket, path]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !signedUrl) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <span className="text-sm text-muted-foreground">Imagem não disponível</span>
      </div>
    );
  }

  return <img src={signedUrl} alt={alt} className={className} />;
};
