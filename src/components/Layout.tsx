import React from 'react';
import { Sidebar } from './Sidebar';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <header className="sticky top-0 z-10 h-16 border-b bg-background flex items-center justify-between px-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="pl-10"
              />
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.email?.[0].toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
