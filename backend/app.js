import 'dotenv/config';
import express from 'express';
import cors from 'cors';
// import swaggerUi from 'swagger-ui-express';
import { initDB } from './config/db.js';
//  import { verifyToken } from "../middleware/verifyToken.js";

// Import routes
import userRoutes from './routes/userRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import droppingPointRoutes from './routes/droppingPointRoutes.js';
import priceRoutes from './routes/priceRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from "./routes/authRoutes.js";
import setupRoutes from "./routes/setupRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import middleware


const app = express();
const PORT = process.env.PORT || 5001;

// Initialize database
await initDB();

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:8081',
    'exp://localhost:8081',
    'http://192.168.1.11:8081',
    'exp://192.168.1.11:8081',
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/user-roles', roleRoutes);
app.use('/api/dropping-point', droppingPointRoutes);
app.use('/api/daily-price', priceRoutes);
app.use('/api/pickup-order', orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/setup", setupRoutes);
app.use("/api/upload", uploadRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));




// Root route
app.get('/', (req, res) => {
  res.send("Developing a backend server for country data");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("my port:", process.env.PORT || 5001);
});

export default app;