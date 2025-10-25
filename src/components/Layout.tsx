import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  PlusCircle, 
  MessageCircle, 
  User, 
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { ProfileCard } from './ProfileCard';
import { UpcomingEvents } from './UpcomingEvents';
import { NotificationsDropdown } from './NotificationsDropdown';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Logo } from './Logo';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navItems = [
    { path: '/feed', icon: Home, label: 'Feed' },
    { path: '/my-outs', icon: Calendar, label: 'Meus Outs' },
    { path: '/out/new', icon: PlusCircle, label: 'Criar Out' },
    { path: '/messages', icon: MessageCircle, label: 'Mensagens' },
    { path: '/about', icon: Shield, label: 'Segurança' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Hide profile card on profile pages
  const isProfilePage = location.pathname === '/profile' || location.pathname.startsWith('/u/');

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      {/* Fixed Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 h-full grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-center">
          {/* Logo - Aligned with left sidebar */}
          <button 
            onClick={() => navigate('/feed')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity lg:justify-start justify-center"
          >
            <Logo size="md" />
          </button>

          {/* Right side - Navigation + Profile */}
          <div className="hidden lg:flex items-center max-w-[700px] w-full">
            {/* Desktop Navigation - Centered in main column */}
            <nav className="flex items-center gap-1 flex-1 justify-center">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex flex-col items-center px-4 py-2 rounded-lg transition-all ${
                      active 
                        ? 'text-primary border-b-2 border-primary' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs mt-1">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Notifications + Profile Avatar - Aligned with right edge of main column (700px) */}
            <div className="flex items-center gap-2">
              <NotificationsDropdown />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="cursor-pointer">
                  <Avatar className="w-10 h-10 border-2 border-border hover:border-primary transition-colors">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {profile?.display_name?.[0] || user?.email?.[0].toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card z-50">
                {profile && (
                  <>
                    <div className="px-2 py-3 border-b">
                      <p className="font-semibold">{profile.display_name}</p>
                      <p className="text-sm text-muted-foreground">@{profile.handle}</p>
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Menu + Avatar */}
          <div className="flex lg:hidden items-center gap-2 justify-end absolute right-4 top-1/2 -translate-y-1/2">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  {/* Profile info in mobile menu */}
                  {profile && (
                    <div className="flex items-center gap-3 pb-4 border-b">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={profile.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {profile.display_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{profile.display_name}</p>
                        <p className="text-xs text-muted-foreground">@{profile.handle}</p>
                      </div>
                    </div>
                  )}

                  {/* Mobile nav items */}
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          active 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-accent'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}

                  <div className="pt-4 border-t">
                    <button
                      onClick={() => {
                        navigate('/notificacoes');
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent w-full"
                    >
                      <Bell className="w-5 h-5" />
                      <span>Notificações</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/about');
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent w-full"
                    >
                      <Shield className="w-5 h-5" />
                      <span>Segurança</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent w-full"
                    >
                      <Settings className="w-5 h-5" />
                      <span>Configurações</span>
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 text-destructive w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sair</span>
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Avatar className="w-10 h-10 border-2 border-border">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {profile?.display_name?.[0] || user?.email?.[0].toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 pt-16">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          {isProfilePage ? (
            // Profile page - no sidebar, full width
            <main className="min-h-[calc(100vh-8rem)]">
              {children}
            </main>
          ) : (
            // Other pages - with sidebar (LinkedIn-style grid)
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
              {/* Left Sidebar - Profile Card + Upcoming Events (Desktop only) */}
              <aside className="hidden lg:block space-y-4">
                <ProfileCard />
                <UpcomingEvents />
              </aside>

              {/* Main Content - Max width ~700px for optimal readability */}
              <main className="min-h-[calc(100vh-8rem)] max-w-[700px]">
                {children}
              </main>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
