import React, { useState } from 'react';
import { DataTable } from './DataTable';
import { StatusBadge } from './StatusBadge';
import { vendors } from '../data/mockData';

export const VendorManagement: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);

  const columns = [
    { key: 'id', label: 'Vendor ID' },
    { key: 'name', label: 'Name' },
    { key: 'contact', label: 'Contact' },
    { key: 'email', label: 'Email' },
    {
      key: 'status',
      label: 'Status',
      render: (status: string) => <StatusBadge status={status as any} />
    },
    {
      key: 'totalSales',
      label: 'Total Sales (TZS)',
      render: (val: number) => val.toLocaleString()
    }
  ];

  const handleApprove = (vendor: any) => {
    alert(`Vendor ${vendor.name} approved!`);
  };

  const handleReject = (vendor: any) => {
    alert(`Vendor ${vendor.name} rejected!`);
  };

  const handleViewDetails = (vendor: any) => {
    setSelectedVendor(vendor);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Vendor Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          + Add Vendor
        </button>
      </div>

      <DataTable
        columns={columns}
        data={vendors}
        onRowClick={handleViewDetails}
        actions={(row) => (
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleApprove(row); }}
              className="text-green-600 hover:text-green-800"
            >
              Approve
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleReject(row); }}
              className="text-red-600 hover:text-red-800"
            >
              Reject
            </button>
          </div>
        )}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">
              {selectedVendor ? 'Vendor Details' : 'Add New Vendor'}
            </h3>
            {selectedVendor ? (
              <div className="space-y-4">
                <img src={selectedVendor.image} alt={selectedVendor.name} className="w-32 h-32 rounded-full mx-auto" />
                <p><strong>ID:</strong> {selectedVendor.id}</p>
                <p><strong>Name:</strong> {selectedVendor.name}</p>
                <p><strong>Contact:</strong> {selectedVendor.contact}</p>
                <p><strong>Email:</strong> {selectedVendor.email}</p>
                <p><strong>Status:</strong> <StatusBadge status={selectedVendor.status} /></p>
                <p><strong>Total Sales:</strong> TZS {selectedVendor.totalSales.toLocaleString()}</p>
              </div>
            ) : (
              <form className="space-y-4">
                <input type="text" placeholder="Vendor Name" className="w-full px-4 py-2 border rounded-lg" />
                <input type="tel" placeholder="Contact" className="w-full px-4 py-2 border rounded-lg" />
                <input type="email" placeholder="Email" className="w-full px-4 py-2 border rounded-lg" />
                <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                  Add Vendor
                </button>
              </form>
            )}
            <button
              onClick={() => { setShowModal(false); setSelectedVendor(null); }}
              className="mt-4 w-full bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
