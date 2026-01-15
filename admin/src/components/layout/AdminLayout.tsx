import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Users,
  Palette,
  LayoutTemplate,
  Brush,
  Settings,
  LogOut,
  Menu,
  X,
  Library,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getBackendUrl } from '@aiprimary/api';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/slide-themes', icon: Palette, label: 'Slide Themes' },
  { to: '/slide-templates', icon: LayoutTemplate, label: 'Slide Templates' },
  { to: '/art-styles', icon: Brush, label: 'Art Styles' },
  { to: '/question-bank', icon: Library, label: 'Question Bank' },
  { to: '/model-config', icon: Settings, label: 'Model Config' },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-background flex min-h-screen">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-sidebar border-sidebar-border fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="border-sidebar-border flex h-16 items-center justify-between border-b px-6">
          <h1 className="text-sidebar-foreground text-xl font-bold">Admin Panel</h1>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }: { isActive: boolean }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Separator />

        <div className="p-4">
          <div className="bg-sidebar-accent/50 mb-4 rounded-lg p-3">
            <p className="text-sidebar-foreground text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sidebar-foreground/70 text-xs">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            className="text-sidebar-foreground hover:bg-sidebar-accent/50 w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <header className="bg-background flex h-16 items-center gap-4 border-b px-6 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Admin Panel</h1>
        </header>

        {/* Backend URL Display */}
        <div className="bg-background flex items-center justify-end gap-4 border-b px-6 py-3">
          <div className="text-muted-foreground text-sm">
            Backend: <span className="font-mono">{import.meta.env.VITE_API_URL || getBackendUrl()}</span>
          </div>
        </div>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
