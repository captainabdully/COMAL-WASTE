import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardOverview } from './DashboardOverview';
import { VendorManagement } from './VendorManagement';
import { PickupRequests } from './PickupRequests';
import { FleetManagement } from './FleetManagement';
import { FinancialOverview } from './FinancialOverview';
import { ReportsAnalytics } from './ReportsAnalytics';
import { DailyPrices } from './DailyPrices';
import { Settings } from './Settings';
import { useAuth } from '../contexts/AuthContext';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../lib/api';

type NotificationCounts = { pickups: number; vendors: number };
type SeenEventIds = { pickups: string[]; vendors: string[] };

const readSeenEvents = (storageKey: string): SeenEventIds | null => {
  try {
    const value = localStorage.getItem(storageKey);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const AppLayout: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { logout, user } = useAuth();
  const { t } = useLanguage();
  const [notificationCounts, setNotificationCounts] = useState<NotificationCounts>({ pickups: 0, vendors: 0 });
  const seenEventsRef = useRef<SeenEventIds | null>(null);
  const storageKey = `comal:seen-menu-events:${user?.user_id ?? 'dashboard-user'}`;

  const saveSeenEvents = useCallback((events: SeenEventIds) => {
    seenEventsRef.current = events;
    localStorage.setItem(storageKey, JSON.stringify(events));
  }, [storageKey]);

  const refreshNotifications = useCallback(async () => {
    try {
      const [pickupResponse, usersResponse] = await Promise.all([
        api.get('/pickup-order'),
        api.get('/users'),
      ]);
      const pickupIds = (pickupResponse.data.data || []).map((order: { id: string | number }) => String(order.id));
      const vendorIds = (usersResponse.data.users || [])
        .filter((user: { user_roles?: string[] }) => user.user_roles?.includes('vendor'))
        .map((vendor: { user_id: string | number }) => String(vendor.user_id));

      let seen = seenEventsRef.current;
      if (!seen) {
        seen = readSeenEvents(storageKey);
        if (!seen) {
          // The first visit establishes a baseline; only later events are marked new.
          saveSeenEvents({ pickups: pickupIds, vendors: vendorIds });
          setNotificationCounts({ pickups: 0, vendors: 0 });
          return;
        }
        seenEventsRef.current = seen;
      }

      setNotificationCounts({
        pickups: pickupIds.filter((id: string) => !seen!.pickups.includes(id)).length,
        vendors: vendorIds.filter((id: string) => !seen!.vendors.includes(id)).length,
      });
    } catch (error) {
      // Dashboard content already provides its own error handling; a transient polling failure should stay silent.
      console.error('Could not refresh menu notifications:', error);
    }
  }, [saveSeenEvents, storageKey]);

  useEffect(() => {
    seenEventsRef.current = null;
    void refreshNotifications();
    const interval = window.setInterval(() => void refreshNotifications(), 30_000);
    return () => window.clearInterval(interval);
  }, [refreshNotifications]);

  const handleSectionChange = (section: string) => {
    if (section === 'pickups' || section === 'vendors') {
      void (async () => {
        try {
          const response = await api.get(section === 'pickups' ? '/pickup-order' : '/users');
          const ids = section === 'pickups'
            ? (response.data.data || []).map((order: { id: string | number }) => String(order.id))
            : (response.data.users || [])
              .filter((vendor: { user_roles?: string[] }) => vendor.user_roles?.includes('vendor'))
              .map((vendor: { user_id: string | number }) => String(vendor.user_id));
          const current = seenEventsRef.current || readSeenEvents(storageKey) || { pickups: [], vendors: [] };
          saveSeenEvents({ ...current, [section]: ids });
          setNotificationCounts((counts) => ({ ...counts, [section]: 0 }));
        } catch (error) {
          console.error(`Could not mark ${section} notifications as seen:`, error);
        }
      })();
    }
    setActiveSection(section);
  };

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
      case 'financial':
        return <FinancialOverview />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'daily-prices':
        return <DailyPrices />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} notificationCounts={notificationCounts} />
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              {t(activeSection === 'daily-prices' ? 'dailyPrices' : activeSection === 'pickups' ? 'pickupRequests' : activeSection === 'fleet' ? 'fleetManagement' : activeSection === 'settings' ? 'adminPanel' : activeSection as 'dashboard' | 'vendors' | 'financial' | 'reports')}
            </h2>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900" aria-label="Menu notifications">
                <span className="text-2xl">🔔</span>
                {(notificationCounts.pickups + notificationCounts.vendors) > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center">
                    {notificationCounts.pickups + notificationCounts.vendors > 99 ? '99+' : notificationCounts.pickups + notificationCounts.vendors}
                  </span>
                )}
              </button>
              <LanguageToggle />
              <button onClick={logout} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">{t('logout')}</button>
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
