import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DataTable } from './DataTable';
import { api } from '../lib/api';
import { confirmAction, showError, showSuccess } from '../lib/alerts';


interface DailyPrice {
    id?: number;
    dropping_point_id: number;
    dropping_point_name?: string;
    location_name?: string; // Add this from API response
    category: string;
    price: number;
    created_by?: string;
    created_at?: string;
}
interface DroppingPoint {
    id: number;
    name: string;
}

export const DailyPrices: React.FC = () => {
    const { token, user } = useAuth();
    const [prices, setPrices] = useState<DailyPrice[]>([]);
    const [droppingPoints, setDroppingPoints] = useState<DroppingPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentPrice, setCurrentPrice] = useState<DailyPrice>({
        dropping_point_id: 0,
        category: '',
        price: 0,
    });
    const [isEditing, setIsEditing] = useState(false);


    useEffect(() => {
        fetchPrices();
        fetchDroppingPoints();
    }, [token]);

    const fetchDroppingPoints = async () => {
        try {
            // Attempt to fetch dropping points.
            const res = await api.get('/dropping-point');

            const rawPoints = Array.isArray(res.data) ? res.data : (res.data.data || []);
            const points = rawPoints.map((p: any) => ({
                id: p.id,
                name: p.location_name || p.name // Map location_name to name, fallback to name
            }));

            setDroppingPoints(points);
        } catch (error) {
            console.warn("Could not fetch dropping points:", error);
            await showError('Could not load dropping points', error);
        }
    };

    const fetchPrices = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/daily-price/last-7-days');

            let data: DailyPrice[] = [];
            if (Array.isArray(res.data)) {
                data = res.data;
            } else if (res.data && Array.isArray(res.data.data)) {
                data = res.data.data;
            } else if (res.data && Array.isArray(res.data.prices)) {
                data = res.data.prices;
            }

            setPrices(data);
        } catch (error) {
            console.error("Error fetching last 7 days prices:", error);
            await showError('Could not load prices', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSavePrice = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...currentPrice, created_by: user?.user_id };

            if (isEditing && currentPrice.id) {
                // Assuming update uses base URL or specific ID URL. For now using base.
                // If API supports PUT /api/daily-price/:id
                await api.post('/daily-price', payload);
            } else {
                await api.post('/daily-price', payload);
            }
            await showSuccess('Price saved successfully');
            setShowModal(false);
            fetchPrices();
            resetForm();
        } catch (error) {
            console.error("Error saving price:", error);
            await showError('Could not save price', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!(await confirmAction('Delete this price?', 'This action cannot be undone.'))) return;
        try {
            await api.delete(`/daily-price/${id}`);
            await showSuccess('Price deleted successfully');
            fetchPrices();
        } catch (error) {
            console.error("Error deleting price:", error);
            await showError('Could not delete price', error);
        }
    };

    const resetForm = () => {
        setCurrentPrice({
            dropping_point_id: droppingPoints.length > 0 ? droppingPoints[0].id : 0,
            category: '',
            price: 0,
        });
        setIsEditing(false);
    };

    const handleEdit = (price: DailyPrice) => {
        setCurrentPrice(price);
        setIsEditing(true);
        setShowModal(true);
    };

    // Helper to get name
    const getDroppingPointName = (id: number) => {
        const point = droppingPoints.find(p => p.id === id);
        return point ? point.name : `ID: ${id}`;
    };

    const columns = [
        { key: 'category', label: 'Category' },
        { key: 'price', label: 'Price (TZS)', render: (val: number) => val.toLocaleString() },
        {
            key: 'dropping_point_id',
            label: 'Dropping Point',
            render: (val: number, row: DailyPrice) => row.location_name || row.dropping_point_name || getDroppingPointName(val)
        },
        { key: 'created_at', label: 'Date', render: (val: string) => val ? new Date(val).toLocaleDateString() : 'Today' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Daily Prices</h2>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                    + Update Today's Price
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-4">Loading prices...</div>
            ) : (
                <DataTable
                    columns={columns}
                    data={prices}
                    actions={(row) => (
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                Edit
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); if (row.id) handleDelete(row.id); }}
                                className="text-red-600 hover:text-red-800"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                />
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                        <h3 className="text-2xl font-bold mb-4">
                            {isEditing ? 'Edit Price' : 'Add Daily Price'}
                        </h3>
                        <form onSubmit={handleSavePrice} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    className="w-full px-4 py-2 border rounded-lg mt-1"
                                    value={currentPrice.category}
                                    onChange={(e) => setCurrentPrice({ ...currentPrice, category: e.target.value })}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="heavy">Heavy</option>
                                    <option value="light">Light</option>
                                     <option value="cast">Cast</option>
                                     <option value="mixer">Mixer</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dropping Point</label>
                                {droppingPoints.length > 0 ? (
                                    <select
                                        className="w-full px-4 py-2 border rounded-lg mt-1"
                                        value={currentPrice.dropping_point_id}
                                        onChange={(e) => setCurrentPrice({ ...currentPrice, dropping_point_id: Number(e.target.value) })}
                                        required
                                    >
                                        <option value={0}>Select Dropping Point</option>
                                        {droppingPoints.map(dp => (
                                            <option key={dp.id} value={dp.id}>{dp.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="number"
                                        placeholder="Dropping Point ID"
                                        className="w-full px-4 py-2 border rounded-lg mt-1"
                                        value={currentPrice.dropping_point_id || ''}
                                        onChange={(e) => setCurrentPrice({ ...currentPrice, dropping_point_id: Number(e.target.value) })}
                                        required
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-2 border rounded-lg mt-1"
                                    value={currentPrice.price}
                                    onChange={(e) => setCurrentPrice({ ...currentPrice, price: Number(e.target.value) })}
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
