import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Recreate __dirname for ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // This folder MUST exist in your Docker container (mapped to your local folder)
        cb(null, '/app/uploads');
    },
    filename: (req, file, cb) => {
        // Using a timestamp + random number to avoid collisions
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB guardrail
});