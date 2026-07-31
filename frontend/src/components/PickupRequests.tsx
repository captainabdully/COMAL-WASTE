import React, { useState, useEffect } from 'react';
import { DataTable } from './DataTable';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { showError, showSuccess } from '../lib/alerts';


export const PickupRequests: React.FC = () => {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [processingOrder, setProcessingOrder] = useState<any>(null);

  useEffect(() => {
    fetchRequests();
  }, [token]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pickup-order');

      const orders = res.data.data || [];
      const formattedRequests = orders.map((order: any) => ({
        id: order.id,
        vendor: order.vendor_name || 'Unknown Vendor',
        material: order.category ? (order.category.charAt(0).toUpperCase() + order.category.slice(1)) : 'N/A',
        quantity: `${order.quantity} kg`,
        date: new Date(order.created_at).toLocaleDateString(),
        status: order.status,
        originalData: order // Keep original data if needed
      }));

      setRequests(formattedRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      await showError('Could not load pickup requests', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/pickup-order/${id}/status`, { status, assigned_to: user?.user_id });

      // Update local state to reflect change immediately
      setRequests(prev =>
        prev.map(r => r.id === id ? { ...r, status: status } : r)
      );

      // Also update selectedRequest if it's the one we're viewing
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest({ ...selectedRequest, status: status });
      }

      await showSuccess('Request updated', `Request ${id} is now ${status}.`);
      fetchRequests(); // Refresh to ensure data consistency
    } catch (error) {
      console.error("Error updating status:", error);
      await showError('Could not update request', error);
    }
  };

  const handleCompleteOrder = async () => {
    if (!processingOrder) return;

    try {
      // 1. Record order completion
      await api.post('/pickup-order/completion', {
        order_id: processingOrder.id,
        completed_by: user?.user_id,
        completion_notes: completionNotes
      });

      // 2. Update order status to 'completed'
      await updateStatus(processingOrder.id, 'completed');

      setShowCompletionModal(false);
      setCompletionNotes('');
      setProcessingOrder(null);
    } catch (error) {
      console.error("Error completing order:", error);
      await showError('Could not complete request', error);
    }
  };


  const handleApprove = (request: any) => {
    // Mapping "Approve" to "assigned" status (as used in db constraint)
    updateStatus(request.id, 'assigned');
  };

  const handleReject = (request: any) => {
    // Mapping "Reject" to "cancelled" status
    updateStatus(request.id, 'cancelled');
  };

  const columns = [
    { key: 'id', label: 'Request ID' },
    { key: 'vendor', label: 'Vendor' },
    { key: 'material', label: 'Material' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'date', label: 'Date' },
    {
      key: 'status',
      label: 'Status',
      render: (status: string) => <StatusBadge status={status as any} />
    }
  ];

  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const handleView = (request: any) => {
    setSelectedRequest(request.originalData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Pickup Requests</h2>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading pickup requests...</div>
      ) : (
        <DataTable
          columns={columns}
          data={requests}
          onRowClick={(row) => handleView(row)} // Allow row click to view
          actions={(row) => (
            <div className="flex gap-2">
              {row.status === 'pending' && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleApprove(row); }}
                    className="text-green-600 hover:text-green-800 font-medium"
                  >
                    Approve
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleReject(row); }}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); handleView(row); }}
                className="text-blue-600 hover:text-blue-800 font-medium">
                View
              </button>
            </div>
          )}
        />
      )}

      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Request Details
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {selectedRequest.image ? (
                  <img
                    src={`${API_URL.replace('/api', '')}/uploads/${selectedRequest.image}`}
                    alt="Waste"
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                    onError={(e: any) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                    No Image Available
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="mt-1"><StatusBadge status={selectedRequest.status} /></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Vendor</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedRequest.vendor_name}</p>
                  <p className="text-sm text-gray-600">{selectedRequest.phone_number}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Waste Details</p>
                  <p className="text-base text-gray-900">
                    <span className="font-semibold">{selectedRequest.category}</span> • {selectedRequest.quantity} kg
                  </p>
                  <p className="text-sm text-gray-600">Price: {selectedRequest.price} TZS/kg</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Comments</p>
                  <p className="text-base text-gray-900 italic">
                    "{selectedRequest.comment || 'No comments provided'}"
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-base text-gray-900">{selectedRequest.location_name}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Date Requested</p>
                  <p className="text-base text-gray-900">
                    {new Date(selectedRequest.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Close
              </button>

              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleReject({ id: selectedRequest.id });
                      setSelectedRequest(null);
                    }}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition border border-red-200"
                  >
                    Reject Request
                  </button>
                  <button
                    onClick={() => {
                      handleApprove({ id: selectedRequest.id });
                      setSelectedRequest(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
                  >
                    Approve Request
                  </button>
                </>
              )}

              {['assigned', 'in-progress'].includes(selectedRequest.status) && (
                <button
                  onClick={() => {
                    setProcessingOrder(selectedRequest);
                    setShowCompletionModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                  Complete Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Complete Order</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please enter any notes or comments regarding the completion of this order.
            </p>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={4}
              placeholder="Enter completion notes..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCompletionModal(false);
                  setProcessingOrder(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteOrder}
                disabled={!completionNotes.trim()}
                className={`px-6 py-2 rounded-lg text-white font-medium transition ${completionNotes.trim() ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
                  }`}
              >
                Confirm Completion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
