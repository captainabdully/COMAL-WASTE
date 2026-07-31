import React, { useState, useEffect } from 'react';
import { DataTable } from './DataTable';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { showError, showInfo, showSuccess } from '../lib/alerts';

export const VendorManagement: React.FC = () => {
  const { token } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New vendor form state
  const [newVendor, setNewVendor] = useState({
    name: '',
    email: '',
    phone_number: '',
    password: '',
    role: 'vendor'
  });

  useEffect(() => {
    fetchVendors();
  }, [token]);

  const fetchVendors = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/users');

      const allUsers = res.data.users || [];
      // Filter for users who have 'vendor' role
      const vendorList = allUsers.filter((user: any) =>
        user.user_roles && Array.isArray(user.user_roles) && user.user_roles.includes('vendor')
      ).map((vendor: any) => ({
        id: vendor.user_id,
        name: vendor.name,
        contact: vendor.phone_number,
        email: vendor.email,
        status: 'active', // Default status as backend doesn't show it yet
        totalSales: 0, // Placeholder
        image: 'https://ui-avatars.com/api/?name=' + vendor.name // Placeholder avatar
      }));

      setVendors(vendorList);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      await showError('Could not load vendors', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', newVendor);
      await showSuccess('Vendor added successfully');
      setShowModal(false);
      fetchVendors(); // Refresh list
      setNewVendor({ name: '', email: '', phone_number: '', password: '', role: 'vendor' });
    } catch (error) {
      console.error("Error adding vendor:", error);
      await showError('Could not add vendor', error);
    }
  };

  const columns = [
    { key: 'id', label: 'Vendor ID' },
    { key: 'name', label: 'Name' },
    { key: 'contact', label: 'Contact' },
    { key: 'email', label: 'Email' },
    {
      key: 'status',
      label: 'Status',
      render: (status: string) => <StatusBadge status={status as any} />
    }
  ];

  const handleApprove = async (vendor: any) => {
    await showInfo('Not available', `Vendor approval for ${vendor.name} is not implemented by the API yet.`);
  };

  const handleReject = async (vendor: any) => {
    await showInfo('Not available', `Vendor rejection for ${vendor.name} is not implemented by the API yet.`);
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

      {isLoading ? (
        <div className="text-center py-4">Loading vendors...</div>
      ) : (
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
      )}

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
              <form onSubmit={handleAddVendor} className="space-y-4">
                <input
                  type="text"
                  placeholder="Vendor Name"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                  required
                />
                <input
                  type="tel"
                  placeholder="Contact"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={newVendor.phone_number}
                  onChange={(e) => setNewVendor({ ...newVendor, phone_number: e.target.value })}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={newVendor.email}
                  onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                  required
                />
                <input
                  type="password"
                  placeholder="Temporary password (at least 8 characters)"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={newVendor.password}
                  onChange={(e) => setNewVendor({ ...newVendor, password: e.target.value })}
                  minLength={8}
                  required
                />

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
