import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { useNavigate } from 'react-router-dom';

export const ProfileCard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [hobbies, setHobbies] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileData) {
      setProfile(profileData);

      const { data: hobbiesData } = await supabase
        .from('user_hobbies')
        .select('*, hobbies(*)')
        .eq('user_id', user.id)
        .limit(5);

      setHobbies(hobbiesData || []);
    }
  };

  if (!profile) return null;

  return (
    <Card 
      className="sticky top-20 w-full bg-card shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => navigate('/profile')}
    >
      <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
        <Avatar className="w-20 h-20 border-2 border-primary/10">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
            {profile.display_name?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="w-full">
          <h3 className="font-semibold text-foreground">{profile.display_name}</h3>
          <p className="text-sm text-muted-foreground">@{profile.handle}</p>
        </div>

        {hobbies.length > 0 && (
          <div className="w-full pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Meus Hobbies</p>
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
