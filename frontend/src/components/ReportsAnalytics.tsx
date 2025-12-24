import React, { useState } from 'react';

export const ReportsAnalytics: React.FC = () => {
  const [reportType, setReportType] = useState('scrap-collected');
  const [dateRange, setDateRange] = useState('month');

  const reportTypes = [
    { id: 'scrap-collected', label: 'Scrap Collected Report' },
    { id: 'vendor-performance', label: 'Vendor Performance' },
    { id: 'fleet-utilization', label: 'Fleet Utilization' },
    { id: 'financial-summary', label: 'Financial Summary' },
    { id: 'tax-compliance', label: 'Tax Compliance (TRA)' }
  ];

  const handleExport = (format: string) => {
    alert(`Exporting ${reportType} as ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {reportTypes.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('pdf')}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
              >
                PDF
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Excel
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                CSV
              </button>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-bold mb-4">Report Preview</h3>
          <div className="bg-gray-50 rounded-lg p-6 min-h-[300px]">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">📊 Report Preview</p>
              <p className="text-sm">Select report type and date range to generate preview</p>
              <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Scrap Collected:</span>
              <span className="font-bold">12,450 kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Vendors:</span>
              <span className="font-bold">42</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed Jobs:</span>
              <span className="font-bold">156</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue (TZS):</span>
              <span className="font-bold">45.2M</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">Recent Reports</h3>
          <div className="space-y-2">
            {['Scrap Collection - Sept 2025', 'Vendor Performance - Q3', 'Fleet Utilization - Sept'].map((report, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-700">{report}</span>
                <button className="text-blue-600 hover:text-blue-800 text-sm">Download</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
