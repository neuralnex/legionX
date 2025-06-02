import type { Request, Response } from 'express';
import { Router } from 'express';
import { PinataService } from '../services/pinata.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router: Router = Router();
const pinataService = new PinataService();

// Upload metadata
router.post('/upload', authMiddleware, async (req: Request, res: Response) => {
    try {
        const metadata = req.body;
        const result = await pinataService.uploadMetadata(metadata);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload metadata' });
    }
});

// Get metadata
router.get('/metadata/:cid', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { cid } = req.params;
        const metadata = await pinataService.getMetadata(cid);
        res.json(metadata);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get metadata' });
    }
});

export default router; 