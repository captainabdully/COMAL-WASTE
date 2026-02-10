import React, { useState } from 'react';
import { useIsMobile } from '../hooks/use-mobile';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const isMobile = useIsMobile();
  const [minimized, setMinimized] = useState(isMobile);
  React.useEffect(() => {
    setMinimized(isMobile);
  }, [isMobile]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'vendors', label: 'Vendors', icon: '🏢' },
    { id: 'pickups', label: 'Pickup Requests', icon: '📦' },
    { id: 'daily-prices', label: 'Daily Prices', icon: '🏷️' },
    { id: 'fleet', label: 'Fleet Management', icon: '🚚' },
    { id: 'financial', label: 'Financial', icon: '💰' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'settings', label: 'Admin panel', icon: '⚙️' }
  ];

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
            {!minimized && <span className="font-medium">{item.label}</span>}
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
              <p className="font-medium">Admin User</p>
              <p className="text-xs text-gray-400">admin@system.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
