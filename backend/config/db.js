import {neon} from '@neondatabase/serverless';
import { setDefaultAutoSelectFamily } from 'node:net';
import "dotenv/config";
// import jwt from "jsonwebtoken";

// Node's IPv4/IPv6 connection racing can time out against Neon's HTTPS
// endpoint on some networks even when IPv4 is reachable.
setDefaultAutoSelectFamily(false);

// Creates a SQL connection using our DB URL from .env file
export const sql = neon(process.env.DATABASE_URL);


async function initDB() {
  try {
    // Users table
    await sql`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      phone_number VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    await sql`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password TEXT;
`;

    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS user_category VARCHAR(50);
    `;

    // Password reset tokens table
    await sql`CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      reset_token VARCHAR(255) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )`;

    // User roles table
    await sql`CREATE TABLE IF NOT EXISTS user_roles (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(100) NOT NULL,
      user_role VARCHAR(50) NOT NULL CHECK (user_role IN ('vendor', 'manager', 'admin')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      UNIQUE(user_id, user_role)
    )`;

    // Create enum type for categories
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category_type') THEN
          CREATE TYPE category_type AS ENUM ('heavy','light','mixer','cast');
           
        END IF;
      END$$;
    `;

    // Dropping points table
    await sql`CREATE TABLE IF NOT EXISTS dropping_point (
      id SERIAL PRIMARY KEY,
      location_name VARCHAR(255) NOT NULL,
      address TEXT,
      created_by VARCHAR(100) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(user_id)
    )`;

    // Daily price table
    await sql`
      CREATE TABLE IF NOT EXISTS daily_price (
        id SERIAL PRIMARY KEY,
        dropping_point_id INT NOT NULL,
        category category_type NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        effective_date DATE DEFAULT CURRENT_DATE,
        created_by VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dropping_point_id) REFERENCES dropping_point(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(user_id),
        UNIQUE(dropping_point_id, category, effective_date)
      )
    `;

    // Pickup orders table
    await sql`
      CREATE TABLE IF NOT EXISTS pickup_order (
        id SERIAL PRIMARY KEY,
        vendor_id VARCHAR(100) NOT NULL,
        dropping_point_id INT NOT NULL,
        category category_type NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        quantity DECIMAL(12,3) NOT NULL,
        quantity_unit VARCHAR(10) NOT NULL DEFAULT 'kg' CHECK (quantity_unit IN ('kg', 'tonne')),
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'completed', 'cancelled')),
        comment TEXT,
        rejection_comment TEXT,
        rejection_comment_by VARCHAR(100),
        rejection_commented_at TIMESTAMP,
        image VARCHAR(255),
        assigned_to VARCHAR(100),
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vendor_id) REFERENCES users(user_id),
        FOREIGN KEY (dropping_point_id) REFERENCES dropping_point(id),
        FOREIGN KEY (assigned_to) REFERENCES users(user_id)
      )
    `;

    await sql`ALTER TABLE pickup_order ALTER COLUMN quantity TYPE DECIMAL(12,3) USING quantity::DECIMAL`;
    await sql`ALTER TABLE pickup_order ADD COLUMN IF NOT EXISTS quantity_unit VARCHAR(10) NOT NULL DEFAULT 'kg'`;

    // Backfill columns for databases created before rejection feedback was added.
    await sql`ALTER TABLE pickup_order ADD COLUMN IF NOT EXISTS rejection_comment TEXT`;
    await sql`ALTER TABLE pickup_order ADD COLUMN IF NOT EXISTS rejection_comment_by VARCHAR(100)`;
    await sql`ALTER TABLE pickup_order ADD COLUMN IF NOT EXISTS rejection_commented_at TIMESTAMP`;

    // Order completion table
    await sql`CREATE TABLE IF NOT EXISTS order_completion (
      id SERIAL PRIMARY KEY,
      order_id INT NOT NULL,
      completed_by VARCHAR(100) NOT NULL,
      completion_notes TEXT,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES pickup_order(id) ON DELETE CASCADE,
      FOREIGN KEY (completed_by) REFERENCES users(user_id)
    )`;

    // Keep the most common application reads responsive as data grows.
    await sql`CREATE INDEX IF NOT EXISTS pickup_order_vendor_id_idx ON pickup_order (vendor_id)`;
    await sql`CREATE INDEX IF NOT EXISTS pickup_order_status_created_at_idx ON pickup_order (status, created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS daily_price_point_date_idx ON daily_price (dropping_point_id, effective_date DESC)`;

    console.log("All tables created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
    process.exit(1);
  }
}

export { initDB};
