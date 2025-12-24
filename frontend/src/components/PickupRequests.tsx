import React, { useState } from 'react';
import { DataTable } from './DataTable';
import { StatusBadge } from './StatusBadge';
import { pickupRequests } from '../data/mockData';

export const PickupRequests: React.FC = () => {
  const [requests, setRequests] = useState(pickupRequests);

  const columns = [
    { key: 'id', label: 'Request ID' },
    { key: 'vendor', label: 'Vendor' },
    { key: 'material', label: 'Material' },
    { key: 'quantity', label: 'Quantity (kg)' },
    { key: 'date', label: 'Date' },
    {
      key: 'status',
      label: 'Status',
      render: (status: string) => <StatusBadge status={status as any} />
    }
  ];

  const handleApprove = (request: any) => {
    setRequests(prev =>
      prev.map(r => r.id === request.id ? { ...r, status: 'approved' } : r)
    );
    alert(`Request ${request.id} approved!`);
  };

  const handleReject = (request: any) => {
    setRequests(prev =>
      prev.map(r => r.id === request.id ? { ...r, status: 'rejected' } : r)
    );
    alert(`Request ${request.id} rejected!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Pickup Requests</h2>
        <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          + Create Request
        </button>
      </div>

      <DataTable
        columns={columns}
        data={requests}
        actions={(row) => (
          <div className="flex gap-2">
            {row.status === 'pending' && (
              <>
                <button
                  onClick={() => handleApprove(row)}
                  className="text-green-600 hover:text-green-800 font-medium"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(row)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Reject
                </button>
              </>
            )}
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              View
            </button>
          </div>
        )}
      />
    </div>
  );
};
