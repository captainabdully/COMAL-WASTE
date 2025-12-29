import { sql } from '../config/db.js';

async function check() {
    try {
        const result = await sql`
      SELECT enum_range(NULL::category_type)
    `;
        console.log("Allowed categories:", result);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

check();
