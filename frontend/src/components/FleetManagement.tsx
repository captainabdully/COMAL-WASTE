import React, { useState } from 'react';
import { fleetData } from '../data/mockData';
import { StatusBadge } from './StatusBadge';

export const FleetManagement: React.FC = () => {
  const [filter, setFilter] = useState('all');

  const filteredFleet = filter === 'all'
    ? fleetData
    : fleetData.filter(truck => truck.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Fleet Management</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-4 py-2 rounded-lg ${filter === 'available' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Available
          </button>
          <button
            onClick={() => setFilter('in-transit')}
            className={`px-4 py-2 rounded-lg ${filter === 'in-transit' ? 'bg-amber-600 text-white' : 'bg-gray-200'}`}
          >
            In Transit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFleet.map(truck => (
          <div key={truck.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
            <img src={truck.image} alt={truck.plateNumber} className="w-full h-48 object-cover" />
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{truck.plateNumber}</h3>
                  <p className="text-gray-600">{truck.driver}</p>
                </div>
                <StatusBadge status={truck.status === 'available' ? 'approved' : 'in-progress'} />
              </div>
              <p className="text-sm text-gray-700 mb-4">
                <strong>Capacity:</strong> {truck.capacity}
              </p>
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Assign Job
                </button>
                <button className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300">
                  Track
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
