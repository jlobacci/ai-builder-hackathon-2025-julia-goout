import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_PROFILES, MOCK_USER_HOBBIES } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { useNavigate } from 'react-router-dom';

export const ProfileCard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const profile = MOCK_PROFILES.find(p => p.user_id === user.id);
  if (!profile) return null;

  const hobbies = MOCK_USER_HOBBIES.filter(uh => uh.user_id === user.id).slice(0, 5);

  return (
    <Card 
      className="w-full bg-card shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => navigate('/profile')}
    >
      <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
        <Avatar className="w-20 h-20 border-2 border-primary/10">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
            {profile.display_name?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="w-full">
          <h3 className="font-semibold text-foreground text-lg">{profile.display_name}</h3>
          <p className="text-sm text-muted-foreground">@{profile.handle}</p>
        </div>

        {hobbies.length > 0 && (
          <div className="w-full pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2.5 font-medium">Meus Hobbies</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {hobbies.map((uh) => (
                <Badge 
                  key={uh.hobby_id} 
                  variant="secondary"
                  className="text-xs bg-accent text-accent-foreground"
                >
                  {uh.hobbies.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
