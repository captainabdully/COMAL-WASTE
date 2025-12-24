import React, { useState } from 'react';
import { scrapMaterials } from '../data/mockData';

export const MaterialInventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredMaterials = scrapMaterials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Material Inventory (SKU)</h2>
        <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          + Add Material
        </button>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search materials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          <option value="Metal">Metal</option>
          <option value="Battery">Battery</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map(material => (
          <div key={material.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
            <img src={material.image} alt={material.name} className="w-full h-48 object-cover" />
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-900">{material.name}</h3>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  {material.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">SKU: {material.id}</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">TZS {material.price}</p>
                  <p className="text-sm text-gray-500">per {material.unit}</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
