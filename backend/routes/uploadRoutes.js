
import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Upload route
router.post('/', upload.single('image'), (req, res) => {
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
