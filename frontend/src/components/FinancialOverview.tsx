import React, { useState } from 'react';
import { MetricCard } from './MetricCard';

export const FinancialOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState('payable');

  const payableData = [
    { id: 'INV001', vendor: 'Dar Metal Works', amount: 2500000, dueDate: '2025-10-15', status: 'pending' },
    { id: 'INV002', vendor: 'Arusha Scrap Ltd', amount: 1800000, dueDate: '2025-10-12', status: 'paid' },
    { id: 'INV003', vendor: 'Dodoma Metal Hub', amount: 3200000, dueDate: '2025-10-18', status: 'pending' }
  ];

  const receivableData = [
    { id: 'CUS001', customer: 'Tanzania Steel Mills', amount: 5600000, dueDate: '2025-10-20', status: 'pending' },
    { id: 'CUS002', customer: 'East Africa Metals', amount: 4200000, dueDate: '2025-10-10', status: 'paid' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Financial Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Total Payable" value="TZS 7.5M" color="bg-red-500" />
        <MetricCard title="Total Receivable" value="TZS 9.8M" color="bg-green-500" />
        <MetricCard title="Net Position" value="TZS 2.3M" color="bg-blue-500" trend="up" change="+18%" />
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('payable')}
              className={`px-6 py-4 font-medium ${activeTab === 'payable' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Amount Payable
            </button>
            <button
              onClick={() => setActiveTab('receivable')}
              className={`px-6 py-4 font-medium ${activeTab === 'receivable' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Amount Receivable
            </button>
          </div>
        </div>

        <div className="p-6">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {activeTab === 'payable' ? 'Vendor' : 'Customer'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount (TZS)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(activeTab === 'payable' ? payableData : receivableData).map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-mono">{item.id}</td>
                  <td className="px-4 py-4 text-sm">{activeTab === 'payable' ? item.vendor : (item as any).customer}</td>
                  <td className="px-4 py-4 text-sm font-bold">{item.amount.toLocaleString()}</td>
                  <td className="px-4 py-4 text-sm">{item.dueDate}</td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                      {item.status === 'pending' ? 'Process' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
