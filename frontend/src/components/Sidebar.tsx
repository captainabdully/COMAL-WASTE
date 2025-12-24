import React from 'react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'vendors', label: 'Vendors', icon: '🏢' },
    { id: 'pickups', label: 'Pickup Requests', icon: '📦' },
    { id: 'fleet', label: 'Fleet Management', icon: '🚚' },
    { id: 'materials', label: 'Material Inventory', icon: '📋' },
    { id: 'financial', label: 'Financial', icon: '💰' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'settings', label: 'Admin panel', icon: '⚙️' }
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-green-400">COMAL</h1>
        <p className="text-sm text-gray-400">Waste Management Platform</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activeSection === item.id
                ? 'bg-green-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-8 pt-8 border-t border-gray-700">
        <div className="flex items-center gap-3 px-4">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-lg">👤</span>
          </div>
          <div>
            <p className="font-medium">Admin User</p>
            <p className="text-xs text-gray-400">admin@comal.co.tz</p>
          </div>
        </div>
      </div>
    </div>
  );
};
