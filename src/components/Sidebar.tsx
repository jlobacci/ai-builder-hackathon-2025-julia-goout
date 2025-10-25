import React from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from './Logo';
import { Compass, Plus, Calendar, User, Info } from 'lucide-react';
import { Separator } from './ui/separator';

export const Sidebar: React.FC = () => {
  const menuItems = [
    { to: '/outs', label: 'Descobrir Outs', icon: Compass },
    { to: '/out/new', label: 'Criar Out', icon: Plus },
    { to: '/my-outs', label: 'Meus Outs', icon: Calendar },
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
