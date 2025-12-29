import { sql } from '../config/db.js';

const DROPPING_POINTS = [
    {
        name: 'City Center Collection',
        address: '123 Main Street, Downtown',
        categories: [
            { category: 'heavy', price: 50 },
            { category: 'mixer', price: 40 },
            { category: 'light', price: 30 },
            { category: 'cast', price: 60 },
        ]
    },
    {
        name: 'Green Valley Station',
        address: '456 Green Valley Road',
        categories: [
            { category: 'heavy', price: 55 },
            { category: 'mixer', price: 45 },
            { category: 'light', price: 35 },
            { category: 'cast', price: 65 },
        ]
    },
    {
        name: 'Eco Park Depot',
        address: 'Eco Park, Sector 15',
        categories: [
            { category: 'heavy', price: 48 },
            { category: 'mixer', price: 38 },
            { category: 'light', price: 28 },
            { category: 'cast', price: 58 },
        ]
    },
    {
        name: 'Industrial Zone Center',
        address: 'Industrial Area, Phase 2',
        categories: [
            { category: 'heavy', price: 45 },
            { category: 'mixer', price: 35 },
            { category: 'light', price: 25 },
            { category: 'cast', price: 55 },
        ]
    },
    {
        name: 'Residential Hub',
        address: '789 Residential Complex',
        categories: [
            { category: 'heavy', price: 52 },
            { category: 'mixer', price: 42 },
            { category: 'light', price: 32 },
            { category: 'cast', price: 62 },
        ]
    },
    {
        name: 'Market Area Station',
        address: 'Central Market, 1st Floor',
        categories: [
            { category: 'heavy', price: 53 },
            { category: 'mixer', price: 43 },
            { category: 'light', price: 33 },
            { category: 'cast', price: 63 },
        ]
    },
];

async function seed() {
    try {
        console.log("Starting seed process...");

        // 1. Get an existing user (admin/manager preferred, but any for now)
        const users = await sql`SELECT user_id FROM users LIMIT 1`;
        if (users.length === 0) {
            console.error("No users found. Please create a user/admin first.");
            process.exit(1);
        }
        const userId = users[0].user_id;
        console.log(`Using user_id: ${userId} for creation`);

        // 2. Clear existing entries (optional, but good for idempotency if we want to reset)
        // NOTE: This will delete associated prices due to CASCADE
        // await sql`DELETE FROM dropping_point`; 

        for (const point of DROPPING_POINTS) {
            console.log(`Creating point: ${point.name}`);

            // Check if point exists to avoid duplicates or assume new
            // For this script, let's just insert. If you want updates, logic would be more complex.
            // We will check by name
            const existing = await sql`SELECT id FROM dropping_point WHERE location_name = ${point.name}`;

            let pointId;
            if (existing.length > 0) {
                pointId = existing[0].id;
                console.log(`  - Point exists (ID: ${pointId}), skipping creation...`);
            } else {
                const newPoint = await sql`
          INSERT INTO dropping_point (location_name, address, created_by)
          VALUES (${point.name}, ${point.address}, ${userId})
          RETURNING id
        `;
                pointId = newPoint[0].id;
                console.log(`  - Created with ID: ${pointId}`);
            }

            // 3. Insert Prices
            for (const cat of point.categories) {
                // Upsert price for today
                console.log(`  - Setting price for ${cat.category}: ${cat.price}`);
                await sql`
          INSERT INTO daily_price (dropping_point_id, category, price, created_by)
          VALUES (${pointId}, ${cat.category}, ${cat.price}, ${userId})
          ON CONFLICT (dropping_point_id, category, effective_date) 
          DO UPDATE SET price = EXCLUDED.price, created_by = EXCLUDED.created_by
        `;
            }
        }

        console.log("Seeding completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seed();
