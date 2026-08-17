
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsPath = path.resolve(__dirname, '../uploads');

// The uploads directory is intentionally not tracked by Git, so ensure it
// exists after every fresh checkout or deployment.
fs.mkdirSync(uploadsPath, { recursive: true });

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
            return cb(new Error('Only JPEG, PNG, and WebP images are supported'));
        }
        cb(null, true);
    }
});

// Upload route
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Return the filename/path that can be stored in the DB
    // Assuming files are served from /uploads
    res.status(200).json({
        message: 'File uploaded successfully',
        filename: req.file.filename,
        imageUrl: `/uploads/${req.file.filename}`
    });
});

export default router;
