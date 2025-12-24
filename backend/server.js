import express from 'express';
import dotenv from 'dotenv';
import { sql } from './config/db.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
const swaggerDocument = YAML.load('./swagger.yaml');
import { isAdmin } from "./middleware/isAdmin.js";
import rateLimitMiddleware from './config/upstash.js';


dotenv.config();

const app = express();


//after creating api the we initialize the express json middleware
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(isAdmin);


const PORT = process.env.PORT || 5001;

//Admin check middleware usage!!!


// To display the country app
app.get('/',(req,res)=>{
    res.send("Developing a backend server for country data");
});

console.log("my port:", process.env.PORT || 5001);

//Database connction 
async function initDB(){
  try {
    // Users table (base table for all user types)
    await sql`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      phone_number VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    console.log("Users table created successfully");

    // User roles table with proper relationships
    await sql`CREATE TABLE IF NOT EXISTS user_roles (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(100) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK (role IN ('vendor', 'manager', 'admin')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      UNIQUE(user_id, role)
    )`;
    console.log("User roles table created successfully");

    // Dropping points table (managed by managers/admins)
    await sql`CREATE TABLE IF NOT EXISTS dropping_point (
      id SERIAL PRIMARY KEY,
      location_name VARCHAR(255) NOT NULL,
      address TEXT,
      created_by VARCHAR(100) NOT NULL, /* manager/admin who created it */
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(user_id)
    )`;
    console.log("Dropping point table created successfully");

    // Create enum type for categories
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category_type') THEN
          CREATE TYPE category_type AS ENUM ('heavy','mixer', 'light', 'cast');
        END IF;
      END$$;
    `;

    // Daily price table (managed by managers/admins)
    await sql`
      CREATE TABLE IF NOT EXISTS daily_price (
        id SERIAL PRIMARY KEY,
        dropping_point_id INT NOT NULL,
        category category_type NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        effective_date DATE DEFAULT CURRENT_DATE,
        created_by VARCHAR(100) NOT NULL, /* manager/admin who set the price */
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dropping_point_id) REFERENCES dropping_point(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(user_id),
        UNIQUE(dropping_point_id, category, effective_date)
      )
    `;
    console.log("Daily price table created successfully");

    // Pickup orders table (created by vendors)
    await sql`
      CREATE TABLE IF NOT EXISTS pickup_order (
        id SERIAL PRIMARY KEY,
        vendor_id VARCHAR(100) NOT NULL,
        dropping_point_id INT NOT NULL,
        category category_type NOT NULL,
        price DECIMAL(10,2) NOT NULL, /* snapshot of price at time of order */
        phone_number VARCHAR(20) NOT NULL,
        quantity INT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'completed', 'cancelled')),
        comment TEXT,
        image VARCHAR(255),
        assigned_to VARCHAR(100), /* manager assigned to handle this order */
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vendor_id) REFERENCES users(user_id),
        FOREIGN KEY (dropping_point_id) REFERENCES dropping_point(id),
        FOREIGN KEY (assigned_to) REFERENCES users(user_id)
      )
    `;
    console.log("Pickup order table created successfully");

    // Order completion tracking (for managers)
    await sql`CREATE TABLE IF NOT EXISTS order_completion (
      id SERIAL PRIMARY KEY,
      order_id INT NOT NULL,
      completed_by VARCHAR(100) NOT NULL,  /* manager who marked complete */
      completion_notes TEXT,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES pickup_order(id) ON DELETE CASCADE,
      FOREIGN KEY (completed_by) REFERENCES users(user_id)
    )`;
    console.log("Order completion table created successfully");

  } catch (error) {
    console.error("Error creating tables:", error);
    process.exit(1);
  }
}



// User Roles Endpoints (Fixed)
app.post("/api/user-roles", async(req, res) => {
    try {
        const { user_id, role } = req.body; 
        
        if (!user_id || !role) {   
            return res.status(400).json({ message: "User ID and role are required" });
        }
        
        // Validate role
        const validRoles = ['vendor', 'manager', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role. Must be: vendor, manager, or admin" });
        }
        
        await sql`
            INSERT INTO user_roles (user_id, role) 
            VALUES (${user_id}, ${role})
            RETURNING *
        `;
        res.status(201).json({ message: "User role created successfully" });

    } catch (error) { 
        console.error("Error creating user role:", error);
        res.status(500).json({ message: "Internal server error" });
    }  
});

app.get("/api/user-roles", async (req, res) => {
  try {
    const roles = await sql`SELECT * FROM user_roles ORDER BY id DESC`;

    res.status(200).json({
      message: "All roles fetched successfully",
      data: roles
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user with roles
app.get("/api/users-with-roles/:user_id", async (req, res) => {
    try {
        const { user_id } = req.params; 
        if (!user_id) {
            return res.status(400).json({ message: "user_id is required" });
        }
        
        const userWithRoles = await sql`
            SELECT u.*, array_agg(ur.role) as roles
            FROM users u
            LEFT JOIN user_roles ur ON u.user_id = ur.user_id
            WHERE u.user_id = ${user_id}
            GROUP BY u.id, u.user_id, u.name, u.email, u.phone_number, u.created_at
        `;
        
        if (!userWithRoles.length) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json({ data: userWithRoles[0] });
    } catch (error) {
        console.error("Error fetching user with roles:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.put("/api/user-roles/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const validRoles = ["vendor", "manager", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be: vendor, manager, or admin" });
    }

    const updated = await sql`
      UPDATE user_roles
      SET role = ${role}
      WHERE user_id = ${user_id}
      RETURNING *
    `;

    if (updated.length === 0) {
      return res.status(404).json({ message: "User not found or role not set" });
    }

    res.status(200).json({
      message: "Role updated successfully",
      data: updated[0]
    });

  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/user-roles/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const deleted = await sql`
      DELETE FROM user_roles
      WHERE user_id = ${user_id}
      RETURNING *
    `;

    if (deleted.length === 0) {
      return res.status(404).json({ message: "Role not found for this user" });
    }

    res.status(200).json({
      message: "Role deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Daily Price Endpoints (Fixed)
app.post("/api/daily-price", async(req, res) => {
    try {
        const { dropping_point_id, category, price, created_by } = req.body;   
        
        if (!dropping_point_id || !category || price === undefined || !created_by) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        await sql`
            INSERT INTO daily_price (dropping_point_id, category, price, created_by) 
            VALUES (${dropping_point_id}, ${category}, ${price}, ${created_by})
            RETURNING *
        `;
        res.status(201).json({ message: "Daily price created successfully" });

    } catch (error) { 
        console.error("Error creating daily price:", error);
        res.status(500).json({ message: "Internal server error" });
    }  
});

app.get("/api/daily-prices/:dropping_point_id", async (req, res) => {
  try {
    const { dropping_point_id } = req.params; 
    if (!dropping_point_id) {
      return res.status(400).json({ message: "dropping_point_id is required" });
    } 
    
    // Get today's prices for all categories at this dropping point
    const prices = await sql`
      SELECT 
        dp.*, 
        dpp.location_name, 
        u.name as created_by_name
      FROM daily_price dp
      LEFT JOIN dropping_point dpp ON dp.dropping_point_id = dpp.id
      LEFT JOIN users u ON dp.created_by = u.user_id
      WHERE dp.dropping_point_id = ${dropping_point_id}
        AND dp.effective_date = CURRENT_DATE
      ORDER BY 
        CASE dp.category
          WHEN 'heavy' THEN 1
          WHEN 'mixer' THEN 2
          WHEN 'light' THEN 3
          WHEN 'cast' THEN 4
        END
    `;
           res.status(200).json({ data: prices });
    } catch (error) {
        console.error("Error fetching today's prices:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//Dropping Point Endpoints (Fixed)
//router.post("/dropping-points", isAdmin, createDroppingPoint);
app.post("/api/dropping-point", isAdmin, async (req, res) => {
  try {
    const { location_name, user_id } = req.body;

    if (!location_name || !user_id) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newPoint = await sql`
      INSERT INTO dropping_point (location_name, created_by)
      VALUES (${location_name}, ${user_id})
      RETURNING *
    `;

    res.status(201).json({
      message: "Dropping point created successfully",
      data: newPoint[0]
    });

  } catch (error) {
    console.error("Error creating dropping point:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/dropping-point", async (req, res) => {
  try {
    const points = await sql`
      SELECT dp.*, u.name as created_by_name
      FROM dropping_point dp
      LEFT JOIN users u ON dp.created_by = u.user_id
      ORDER BY dp.id DESC
    `;

    res.status(200).json({
      message: "Dropping points fetched successfully",
      data: points
    });

  } catch (error) {
    console.error("Error fetching dropping points:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/dropping-point/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const point = await sql`
      SELECT * FROM dropping_point WHERE id = ${id}
    `;

    if (point.length === 0) {
      return res.status(404).json({ message: "Dropping point not found" });
    }

    res.status(200).json({
      message: "Dropping point found",
      data: point[0]
    });

  } catch (error) {
    console.error("Error fetching dropping point:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/dropping-point/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { location_name } = req.body;

    if (!location_name) {
      return res.status(400).json({ message: "location_name is required" });
    }

    const updated = await sql`
      UPDATE dropping_point
      SET location_name = ${location_name}
      WHERE id = ${id}
      RETURNING *
    `;

    if (updated.length === 0) {
      return res.status(404).json({ message: "Dropping point not found" });
    }

    res.status(200).json({
      message: "Dropping point updated successfully",
      data: updated[0]
    });

  } catch (error) {
    console.error("Error updating dropping point:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/dropping-point/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const removed = await sql`
      DELETE FROM dropping_point
      WHERE id = ${id}
      RETURNING *
    `;

    if (removed.length === 0) {
      return res.status(404).json({ message: "Dropping point not found" });
    }

    res.status(200).json({
      message: "Dropping point deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting dropping point:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get today's prices for all dropping points
app.get("/api/today-prices", async (req, res) => {
    try {
        const prices = await sql`
            SELECT dp.*, dpp.location_name, u.name as created_by_name
            FROM daily_price dp
            LEFT JOIN dropping_point dpp ON dp.dropping_point_id = dpp.id
            LEFT JOIN users u ON dp.created_by = u.user_id
            WHERE dp.effective_date = CURRENT_DATE
            ORDER BY dpp.location_name, dp.category
        `;
        res.status(200).json({ data: prices });
    } catch (error) {
        console.error("Error fetching today's prices:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Pickup Order Endpoints (Fixed)
app.post("/api/pickup-order", async (req, res) => {
    try {
        const { vendor_id, dropping_point_id, category, price, phone_number, quantity, comment, image } = req.body;

        if (!vendor_id || !dropping_point_id || !category || price === undefined || !phone_number || !quantity) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        await sql`
            INSERT INTO pickup_order (vendor_id, dropping_point_id, category, price, phone_number, quantity, comment, image)
            VALUES (${vendor_id}, ${dropping_point_id}, ${category}, ${price}, ${phone_number}, ${quantity}, ${comment}, ${image})
            RETURNING *
        `;

        res.status(201).json({ message: "Pickup order created successfully" });
    } catch (error) {
        console.error("Error creating pickup order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get vendor's pickup orders with dropping point details
app.get("/api/pickup-orders/:vendor_id", async (req, res) => {
    try {
        const { vendor_id } = req.params;

        if (!vendor_id) {
            return res.status(400).json({ message: "vendor_id is required" });
        }

        const orders = await sql`
            SELECT po.*, dp.location_name, u.name as vendor_name
            FROM pickup_order po
            LEFT JOIN dropping_point dp ON po.dropping_point_id = dp.id
            LEFT JOIN users u ON po.vendor_id = u.user_id
            WHERE po.vendor_id = ${vendor_id}
            ORDER BY po.created_at DESC
        `;

        res.status(200).json({ data: orders });
    } catch (error) {
        console.error("Error fetching pickup orders:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get all pickup orders with details (for managers/admins)
app.get("/api/pickup-orders", async (req, res) => {
    try {
        const orders = await sql`
            SELECT 
                po.*, 
                dp.location_name,
                v.name as vendor_name,
                m.name as assigned_manager_name
            FROM pickup_order po
            LEFT JOIN dropping_point dp ON po.dropping_point_id = dp.id
            LEFT JOIN users v ON po.vendor_id = v.user_id
            LEFT JOIN users m ON po.assigned_to = m.user_id
            ORDER BY po.created_at DESC
        `;  
        res.status(200).json({
            message: "Pickup orders fetched successfully",
            data: orders
        }); 
    } catch (error) {
        console.error("Error fetching pickup orders:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// NEW: Update pickup order status (for managers)
app.put("/api/pickup-order/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status, assigned_to } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const updated = await sql`
            UPDATE pickup_order
            SET 
                status = ${status},
                assigned_to = ${assigned_to},
                completed_at = ${status === 'completed' ? new Date() : null}
            WHERE id = ${id}
            RETURNING *
        `;

        if (!updated[0]) {
            return res.status(404).json({ message: "Pickup order not found" });
        }

        res.status(200).json({ message: "Pickup order updated successfully", data: updated[0] });
    } catch (error) {
        console.error("Error updating pickup order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// NEW: Order completion tracking
app.post("/api/order-completion", async (req, res) => {
    try {
        const { order_id, completed_by, completion_notes } = req.body;

        if (!order_id || !completed_by) {
            return res.status(400).json({ message: "Order ID and completed_by are required" });
        }

        await sql`
            INSERT INTO order_completion (order_id, completed_by, completion_notes)
            VALUES (${order_id}, ${completed_by}, ${completion_notes})
            RETURNING *
        `;

        res.status(201).json({ message: "Order completion recorded successfully" });
    } catch (error) {
        console.error("Error recording order completion:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await sql`SELECT * FROM users ORDER BY created_at DESC`;

    res.status(200).json({
      message: "Users fetched successfully",
      data: users
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/users/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const user = await sql`
      SELECT * FROM users WHERE user_id = ${user_id}
    `;

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User fetched successfully",
      data: user[0]
    });

  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/users/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { name, email } = req.body;

    if (!name && !email) {
      return res
        .status(400)
        .json({ message: "At least one field (name or email) is required" });
    }

    const updatedUser = await sql`
      UPDATE users
      SET 
        name = COALESCE(${name}, name),
        email = COALESCE(${email}, email)
      WHERE user_id = ${user_id}
      RETURNING *
    `;

    if (updatedUser.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser[0]
    });

  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/users/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const deletedUser = await sql`
      DELETE FROM users WHERE user_id = ${user_id} RETURNING *
    `;

    if (deletedUser.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User deleted successfully",
      deleted: deletedUser[0]
    });

  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { user_id, name, email, phone_number } = req.body;  
    if (!user_id || !name || !email) {
      return res.status(400).json({ message: "user_id, name, and email are required" });
    }

    const existingUser = await sql`
      SELECT * FROM users WHERE user_id = ${user_id} OR email = ${email}
    `;      
    if (existingUser.length > 0) {
      return res.status(409).json({ message: "User with this ID or email already exists" });
    } 

    const newUser = await sql`
      INSERT INTO users (user_id, name, email, phone_number)
      VALUES (${user_id}, ${name}, ${email}, ${phone_number})
      RETURNING *
    `;    
    res.status(201).json({
      message: "User created successfully",
      data: newUser[0]
    }); 
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Initialize DB and then start the server
initDB().then(()=>{
    app.listen(PORT,()=>{
        console.log("Country server is running on port ",PORT);
    });
});


// app.listen(PORT,()=>{
//     console.log("Country server is running on port ",PORT);
// });
//first api to create dropping_point (data insertion)

// Dropping Point Endpoints (Fixed)
// app.post("/api/dropping-point", async(req, res) => {
//     try {
//         const { location_name, address, created_by } = req.body; 
        
//         if (!location_name || !created_by) {
//             return res.status(400).json({ message: "Location name and created_by are required" });
//         }
        
//         await sql`
//             INSERT INTO dropping_point (location_name, address, created_by) 
//             VALUES (${location_name}, ${address}, ${created_by})
//             RETURNING *
//         `;
//         res.status(201).json({ message: "Dropping point created successfully" });

//     } catch (error) { 
//         console.error("Error creating dropping point:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }  
// });

// app.get("/api/dropping-points", async (req, res) => {
//     try {
//         const points = await sql`
//             SELECT dp.*, u.name as created_by_name 
//             FROM dropping_point dp
//             LEFT JOIN users u ON dp.created_by = u.user_id
//             ORDER BY dp.created_at DESC
//         `;  
//         res.status(200).json({
//             message: "Dropping points fetched successfully",
//             data: points
//         }); 
//     } catch (error) {
//         console.error("Error fetching dropping points:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });