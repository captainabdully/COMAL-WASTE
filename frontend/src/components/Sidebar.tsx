import React, { useState } from 'react';
import { useIsMobile } from '../hooks/use-mobile';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  notificationCounts: { pickups: number; vendors: number };
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, notificationCounts }) => {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const { can, user } = useAuth();
  const [minimized, setMinimized] = useState(isMobile);
  React.useEffect(() => {
    setMinimized(isMobile);
  }, [isMobile]);

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: '📊', notifications: 0, allowed: can('reports.view') },
    { id: 'vendors', label: t('vendors'), icon: '🏢', notifications: notificationCounts.vendors, allowed: can('users.view') || can('users.manage') },
    { id: 'pickups', label: t('pickupRequests'), icon: '📦', notifications: notificationCounts.pickups, allowed: can('orders.view_all') },
    { id: 'daily-prices', label: t('dailyPrices'), icon: '🏷️', notifications: 0, allowed: can('prices.manage') },
    { id: 'fleet', label: t('fleetManagement'), icon: '🚚', notifications: 0, allowed: can('reports.view') },
    { id: 'financial', label: t('financial'), icon: '💰', notifications: 0, allowed: can('reports.view') },
    { id: 'reports', label: t('reports'), icon: '📈', notifications: 0, allowed: can('reports.view') },
    { id: 'users', label: t('users'), icon: '👥', notifications: 0, allowed: can('users.view') || can('users.manage') },
    { id: 'roles', label: t('rolesPermissions'), icon: '🔐', notifications: 0, allowed: can('roles.manage') },
    { id: 'settings', label: t('adminPanel'), icon: '⚙️', notifications: 0, allowed: can('users.manage') || can('roles.manage') }
  ].filter(item => item.allowed);

  return (
    <div
      className={`bg-gray-900 text-white min-h-screen p-4 transition-all duration-300 ${minimized ? 'w-16' : 'w-64'}`}
      style={{ width: minimized ? 64 : 256 }}
    >
      <div className="flex items-center justify-between mb-8">
        {!minimized && (
          <>
            <h1 className="text-2xl font-bold text-green-400">COMAL</h1>
          
          </>
        )}
        <button
          className="ml-auto p-1 rounded hover:bg-gray-800 focus:outline-none"
          onClick={() => setMinimized((m) => !m)}
          aria-label={minimized ? 'Expand sidebar' : 'Minimize sidebar'}
        >
          <span className="text-xl">{minimized ? '›' : '‹'}</span>
        </button>
      </div>

      <nav className="space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeSection === item.id
                ? 'bg-green-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
              } ${minimized ? 'justify-center px-2' : ''}`}
            title={item.label}
          >
            <span className="text-xl">{item.icon}</span>
            {!minimized && <span className="font-medium flex-1 text-left">{item.label}</span>}
            {!!item.notifications && (
              <span
                aria-label={`${item.notifications} new ${item.label}`}
                className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center"
              >
                {item.notifications > 99 ? '99+' : item.notifications}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className={`mt-8 pt-8 border-t border-gray-700 ${minimized ? 'px-0' : 'px-4'}`}>
        <div className={`flex items-center gap-3 ${minimized ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-lg">👤</span>
          </div>
          {!minimized && (
            <div>
              <p className="font-medium truncate max-w-[10rem]">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-400 truncate max-w-[10rem]">{user?.email || ''}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
