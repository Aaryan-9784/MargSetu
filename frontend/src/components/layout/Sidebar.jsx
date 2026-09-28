import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Archive,
  Wrench,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  User,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { RoleBadge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Asset Inventory', path: '/assets', icon: Archive },
  { label: 'Maintenance', path: '/maintenance', icon: Wrench },
  { label: 'Lifecycle Analytics', path: '/lifecycle', icon: History },
];

const NavItem = ({ item, collapsed }) => (
  <NavLink
    to={item.path}
    className={({ isActive }) =>
      `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
        isActive
          ? 'bg-[#1976A5]/10 text-[#1976A5] border-l-[3px] border-[#1976A5] -ml-px'
          : 'text-charcoal-500 hover:bg-charcoal-50 hover:text-navy-800'
      } ${collapsed ? 'justify-center' : ''}`
    }
  >
    <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
    {!collapsed && <span>{item.label}</span>}
  </NavLink>
);

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header / Logo */}
      <div className={`px-4 pt-5 pb-4 border-b border-charcoal-200 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <div className="w-9 h-9">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <rect width="48" height="48" rx="10" fill="#0B1F33"/>
              <path d="M6 34C14 18 34 18 42 34" stroke="#D89B24" strokeWidth="3.2" strokeLinecap="round"/>
              <line x1="16" y1="22" x2="16" y2="34" stroke="#D89B24" strokeWidth="1.5" strokeDasharray="2 1.5" strokeOpacity="0.8"/>
              <line x1="24" y1="19.5" x2="24" y2="34" stroke="#D89B24" strokeWidth="1.5" strokeDasharray="2 1.5" strokeOpacity="0.8"/>
              <line x1="32" y1="22" x2="32" y2="34" stroke="#D89B24" strokeWidth="1.5" strokeDasharray="2 1.5" strokeOpacity="0.8"/>
              <path d="M4 34.5H44" stroke="#1976A5" strokeWidth="3" strokeLinecap="round"/>
              <polygon points="12,44 19,35 29,35 36,44" fill="#123B5D" opacity="0.9"/>
              <line x1="24" y1="36" x2="24" y2="44" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="2 2"/>
            </svg>
          </div>
        ) : (
          <Logo size="md" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Collapse Toggle (desktop only) */}
      <div className="hidden lg:block px-3 pb-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-charcoal-500 hover:text-navy-800 hover:bg-charcoal-50 rounded-lg transition-colors"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>

      {/* User Panel */}
      <div className="border-t border-charcoal-200 px-3 py-3">
        {collapsed ? (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-navy-900 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-navy-900 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-navy-900 truncate">{user?.name?.split('(')[0]?.trim()}</p>
                <p className="text-[10px] text-charcoal-500 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <RoleBadge role={user?.role} />
              <button
                onClick={handleLogout}
                className="p-1.5 text-charcoal-500 hover:text-govDanger hover:bg-red-50 rounded-md transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-white rounded-lg shadow-card border border-charcoal-200"
      >
        <Menu className="w-5 h-5 text-navy-900" />
      </button>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-elevation border-r border-charcoal-200">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 p-1.5 text-charcoal-500 hover:text-navy-900 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
            <div onClick={() => setMobileOpen(false)}>
              {sidebarContent}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-charcoal-200 h-screen sticky top-0 transition-all duration-300 ${
          collapsed ? 'w-[68px]' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
