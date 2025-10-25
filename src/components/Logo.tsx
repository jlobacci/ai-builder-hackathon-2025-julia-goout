import React from 'react';

export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeClasses[size]} bg-primary rounded-lg flex items-center justify-center font-bold text-primary-foreground`}>
        OUT
      </div>
      {size !== 'sm' && (
        <span className="text-xl font-bold text-foreground">goOut</span>
      )}
    </div>
  );
};
