import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from './Logo';
import { Compass, Plus, Calendar, MessageCircle, User, Info, Newspaper, Users } from 'lucide-react';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const loadPendingCount = async () => {
      const { count } = await supabase
        .from('connections' as any)
        .select('*', { count: 'exact', head: true })
        .eq('target_id', user.id)
        .eq('status', 'pendente');
      
      setPendingCount(count || 0);
    };

    loadPendingCount();

    // Refresh every 30 seconds
    const interval = setInterval(loadPendingCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const menuItems = [
    { to: '/feed', label: 'Feed', icon: Newspaper },
    { to: '/outs', label: 'Outs', icon: Compass },
    { to: '/out/new', label: 'Criar Out', icon: Plus },
    { to: '/my-outs', label: 'Meus Outs', icon: Calendar },
    { to: '/messages', label: 'Mensagens', icon: MessageCircle },
    { to: '/profile?tab=conexoes', label: 'Conexões', icon: Users, badge: pendingCount },
    { to: '/profile', label: 'Perfil', icon: User },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r bg-sidebar-background flex flex-col">
      <div className="p-6">
        <Logo size="md" />
      </div>

      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1.5 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>

        <Separator className="my-4" />

        <NavLink
          to="/about"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            }`
          }
        >
          <Info className="w-5 h-5" />
          <span className="font-medium">Sobre & Segurança</span>
        </NavLink>
      </nav>
    </aside>
  );
};
