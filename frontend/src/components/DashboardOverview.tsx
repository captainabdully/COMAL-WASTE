import React from 'react';
import { MetricCard } from './MetricCard';

export const DashboardOverview: React.FC = () => {
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
            <h1 className="text-4xl font-bold text-white mb-2">COMAL Platform</h1>
            <p className="text-xl text-gray-200">Smart Scrap Material Management System</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Scrap Collected"
          value="12,450 kg"
          change="+15% this month"
          trend="up"
          color="bg-green-500"
        />
        <MetricCard
          title="Active Requests"
          value="28"
          change="4 pending approval"
          trend="neutral"
          color="bg-amber-500"
        />
        <MetricCard
          title="Revenue (TZS)"
          value="45.2M"
          change="+22% this month"
          trend="up"
          color="bg-blue-500"
        />
        <MetricCard
          title="Fleet Utilization"
          value="78%"
          change="+5% from last week"
          trend="up"
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MetricCard title="Active Vendors" value="42" color="bg-indigo-500" />
        <MetricCard title="Pending Payments" value="TZS 8.5M" color="bg-red-500" />
        <MetricCard title="Completed Jobs" value="156" color="bg-teal-500" />
      </div>
    </div>
  );
};
