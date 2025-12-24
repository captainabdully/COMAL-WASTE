import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardOverview } from './DashboardOverview';
import { VendorManagement } from './VendorManagement';
import { PickupRequests } from './PickupRequests';
import { FleetManagement } from './FleetManagement';
import { MaterialInventory } from './MaterialInventory';
import { FinancialOverview } from './FinancialOverview';
import { ReportsAnalytics } from './ReportsAnalytics';
import { Settings } from './Settings';

const AppLayout: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'vendors':
        return <VendorManagement />;
      case 'pickups':
        return <PickupRequests />;
      case 'fleet':
        return <FleetManagement />;
      case 'materials':
        return <MaterialInventory />;
      case 'financial':
        return <FinancialOverview />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1).replace('-', ' ')}
            </h2>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <span className="text-2xl">🔔</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                + Quick Action
              </button>
            </div>
          </div>
        </header>
        <main className="p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
