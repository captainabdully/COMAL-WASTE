import React, { useEffect, useState } from 'react';
import { MetricCard } from './MetricCard';
import { api } from '../lib/api';
import { showError } from '../lib/alerts';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

type OrderStatus = 'pending' | 'assigned' | 'completed' | 'cancelled';

interface Order {
  id: number;
  status: OrderStatus;
  quantity: number | string;
  quantity_unit?: 'kg' | 'tonne';
  price: number | string;
  created_at: string;
  completed_at?: string | null;
}

interface User {
  user_id: string;
  user_roles?: string[];
}

interface DashboardMetrics {
  completedKg: number;
  cancelledOrders: number;
  pendingOrders: number;
  monthlyRequests: number;
  activeVendors: number;
  pendingPayment: number;
  completedJobsThisMonth: number;
}

const emptyMetrics: DashboardMetrics = {
  completedKg: 0,
  cancelledOrders: 0,
  pendingOrders: 0,
  monthlyRequests: 0,
  activeVendors: 0,
  pendingPayment: 0,
  completedJobsThisMonth: 0,
};

const isInCurrentMonth = (dateValue?: string | null) => {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  const today = new Date();
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
};

const numberValue = (value: number | string) => Number(value) || 0;

const formatNumber = (value: number) => new Intl.NumberFormat('en-TZ').format(value);

export const DashboardOverview: React.FC = () => {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState<DashboardMetrics>(emptyMetrics);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [ordersResponse, usersResponse] = await Promise.all([
          api.get<{ data: Order[] }>('/pickup-order'),
          api.get<{ users: User[] }>('/users'),
        ]);

        const orders = ordersResponse.data.data || [];
        const users = usersResponse.data.users || [];
        const completedOrders = orders.filter((order) => order.status === 'completed');
        const assignedOrders = orders.filter((order) => order.status === 'assigned');

        setMetrics({
          completedKg: completedOrders.reduce(
            (total, order) => total + numberValue(order.quantity) * (order.quantity_unit === 'tonne' ? 1000 : 1),
            0,
          ),
          cancelledOrders: orders.filter((order) => order.status === 'cancelled').length,
          pendingOrders: orders.filter((order) => order.status === 'pending').length,
          monthlyRequests: orders.filter((order) => isInCurrentMonth(order.created_at)).length,
          activeVendors: users.filter((user) => user.user_roles?.includes('vendor')).length,
          pendingPayment: assignedOrders.reduce((total, order) => total + numberValue(order.price), 0),
          completedJobsThisMonth: completedOrders.filter((order) => isInCurrentMonth(order.completed_at || order.created_at)).length,
        });
      } catch (error) {
        await showError('Could not load dashboard metrics', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [token]);

  const value = (metric: number, suffix = '') => loading ? '—' : `${formatNumber(metric)}${suffix}`;

  return (
    <div className="space-y-6">
      <div className="relative h-64 rounded-xl overflow-hidden">
        <img
          src="https://d64gsuwffb70l.cloudfront.net/68e36b0ac991e083b7564aad_1759734598530_30b28075.webp"
          alt="Logistics Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-green-900/90 flex items-center">
          <div className="px-8">
            <h1 className="text-4xl font-bold text-white mb-2">{t('platform')}</h1>
            <p className="text-xl text-gray-200">{t('platformSubtitle')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title={t('completedScrap')}
          value={value(metrics.completedKg, ' kg')}
          change={t('completedOrders')}
          trend="neutral"
          color="bg-green-500"
        />
        <MetricCard
          title={t('cancelledOrders')}
          value={value(metrics.cancelledOrders)}
          change={t('allTime')}
          trend="neutral"
          color="bg-amber-500"
        />
        <MetricCard
          title={t('pendingOrders')}
          value={value(metrics.pendingOrders)}
          change={t('awaitingAssignment')}
          trend="neutral"
          color="bg-blue-500"
        />
        <MetricCard
          title={t('requestsThisMonth')}
          value={value(metrics.monthlyRequests)}
          change={t('createdThisMonth')}
          trend="neutral"
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MetricCard title={t('activeVendors')} value={value(metrics.activeVendors)} change={t('registeredVendorAccounts')} color="bg-indigo-500" />
        <MetricCard title={t('pendingPayment')} value={loading ? '—' : `TZS ${formatNumber(metrics.pendingPayment)}`} change={t('assignedOrders')} color="bg-red-500" />
        <MetricCard title={t('completedJobsThisMonth')} value={value(metrics.completedJobsThisMonth)} change={t('completedThisMonth')} color="bg-teal-500" />
      </div>
    </div>
  );
};
