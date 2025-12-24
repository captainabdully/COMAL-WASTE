import React, { useState } from 'react';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <div className="flex">
            {['general', 'pricing', 'tax', 'users'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium capitalize ${
                  activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold mb-4">General Settings</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input type="text" defaultValue="Country Material Limited" className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                <input type="email" defaultValue="info@comal.co.tz" className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input type="tel" defaultValue="+255 22 123 4567" className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold mb-4">Pricing & Commission</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logistics Commission (%)</label>
                <input type="number" defaultValue="15" className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Base Transport Rate (TZS/km)</label>
                <input type="number" defaultValue="500" className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
          )}

          {activeTab === 'tax' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold mb-4">Tax Configuration</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">VAT Rate (%)</label>
                <input type="number" defaultValue="18" className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">TRA Registration Number</label>
                <input type="text" defaultValue="123-456-789" className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold mb-4">User Roles & Permissions</h3>
              <div className="space-y-2">
                {['Admin', 'Operations Manager', 'Field Supervisor', 'Dispatching Officer', 'Accounts Manager'].map(role => (
                  <div key={role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{role}</span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Configure</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
