export const scrapMaterials = [
  { id: 'SKU001', name: 'Steel Scrap', category: 'Metal', price: 450, unit: 'kg', image: 'https://d64gsuwffb70l.cloudfront.net/68e36b0ac991e083b7564aad_1759734603557_ec7fb6b8.webp' },
  { id: 'SKU002', name: 'Copper Wire', category: 'Metal', price: 1200, unit: 'kg', image: 'https://d64gsuwffb70l.cloudfront.net/68e36b0ac991e083b7564aad_1759734605447_381e17a9.webp' },
  { id: 'SKU003', name: 'Aluminum Cans', category: 'Metal', price: 380, unit: 'kg', image: 'https://d64gsuwffb70l.cloudfront.net/68e36b0ac991e083b7564aad_1759734607407_9f14e3c8.webp' },
  { id: 'SKU004', name: 'Brass Fittings', category: 'Metal', price: 950, unit: 'kg', image: 'https://d64gsuwffb70l.cloudfront.net/68e36b0ac991e083b7564aad_1759734609503_bac83917.webp' },
  { id: 'SKU005', name: 'Iron Rods', category: 'Metal', price: 320, unit: 'kg', image: 'https://d64gsuwffb70l.cloudfront.net/68e36b0ac991e083b7564aad_1759734611425_69041e99.webp' },
  { id: 'SKU006', name: 'Lead Batteries', category: 'Battery', price: 680, unit: 'kg', image: 'https://d64gsuwffb70l.cloudfront.net/68e36b0ac991e083b7564aad_1759734613149_3408db1f.webp' }
];

export const vendors = [
  { id: 'V001', name: 'Dar Metal Works', contact: '+255 712 345 678', email: 'info@darmetalworks.co.tz', status: 'approved', totalSales: 125000, image: 'https://d64gsuwffb70l.cloudfront.net/68e36b0ac991e083b7564aad_1759734613878_99c707b9.webp' },
  { id: 'V002', name: 'Arusha Scrap Ltd', contact: '+255 754 987 654', email: 'sales@arushascrap.co.tz', status: 'approved', totalSales: 98000, image: 'https://d64gsuwffb70l.cloudfront.net/68e36b0ac991e083b7564aad_1759734615711_db21ab25.webp' },
  { id: 'V003', name: 'Mwanza Recyclers', contact: '+255 768 234 567', email: 'contact@mwanzarecyclers.co.tz', status: 'pending', totalSales: 0, image: 'https://d64gsuwffb70l.cloudfront.net/68e36b0ac991e083b7564aad_1759734618191_6cd5093e.webp' },
  { id: 'V004', name: 'Dodoma Metal Hub', contact: '+255 745 876 543', email: 'info@dodomamet.co.tz', status: 'approved', totalSales: 156000, image: 'https://d64gsuwffb70l.cloudfront.net/68e36b0ac991e083b7564aad_1759734620690_c1e0e9d2.webp' }
];

export const fleetData = [
  { id: 'TRK001', plateNumber: 'T 123 ABC', driver: 'John Mwamba', capacity: '5 tons', status: 'available', image: 'https://d64gsuwffb70l.cloudfront.net/68e36b0ac991e083b7564aad_1759734599313_fd74c817.webp' },
  { id: 'TRK002', plateNumber: 'T 456 DEF', driver: 'Sarah Kileo', capacity: '10 tons', status: 'in-transit', image: 'https://d64gsuwffb70l.cloudfront.net/68e36b0ac991e083b7564aad_1759734601092_462745be.webp' },
  { id: 'TRK003', plateNumber: 'T 789 GHI', driver: 'David Moshi', capacity: '7 tons', status: 'available', image: 'https://d64gsuwffb70l.cloudfront.net/68e36b0ac991e083b7564aad_1759734602815_d1c33158.webp' }
];

export const pickupRequests = [
  { id: 'PR001', vendor: 'Dar Metal Works', material: 'Steel Scrap', quantity: 500, date: '2025-10-08', status: 'pending' },
  { id: 'PR002', vendor: 'Arusha Scrap Ltd', material: 'Copper Wire', quantity: 150, date: '2025-10-07', status: 'approved' },
  { id: 'PR003', vendor: 'Dodoma Metal Hub', material: 'Aluminum Cans', quantity: 300, date: '2025-10-09', status: 'in-progress' },
  { id: 'PR004', vendor: 'Dar Metal Works', material: 'Brass Fittings', quantity: 200, date: '2025-10-10', status: 'completed' }
];
