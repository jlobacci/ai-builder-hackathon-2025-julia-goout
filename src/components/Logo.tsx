import React from 'react';
import logoImage from '@/assets/logo.png';

export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-16'
  };

  return (
    <div className="flex items-center">
      <img 
        src={logoImage} 
        alt="goOut" 
        className={`${sizeClasses[size]} w-auto`}
      />
    </div>
  );
};
