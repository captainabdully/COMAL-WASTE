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
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import middleware


const app = express();
const PORT = process.env.PORT || 5001;

if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);

// Initialize database
await initDB();

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(apiLimiter);
app.use(cors({
  origin: (process.env.APP_ORIGINS || 'http://localhost:8080,http://localhost:5173').split(','),
  credentials: true
}));
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/user-roles', roleRoutes);
app.use('/api/dropping-point', droppingPointRoutes);
app.use('/api/daily-price', priceRoutes);
app.use('/api/pickup-order', orderRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/setup", setupRoutes);
app.use("/api/upload", uploadRoutes);

// Static files - Ensure absolute path and handle potential errors
const uploadsPath = path.resolve(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));




// Root route
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((err, _req, res, _next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON request body' });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'Image must be 5 MB or smaller' });
  }
  console.error('Unhandled request error:', err);
  return res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("my port:", process.env.PORT || 5001);
});

export default app;
