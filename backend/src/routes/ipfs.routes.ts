import type { Request, Response } from 'express';
import { Router } from 'express';
import multer from 'multer';
import { PinataService } from '../services/pinata.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router: Router = Router();
const pinataService = new PinataService();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common AI model file types
    const allowedTypes = [
      'application/json',
      'application/octet-stream',
      'application/zip',
      'application/x-zip-compressed',
      'model/onnx',
      'model/pytorch',
      'model/tensorflow'
    ];
    
    if (allowedTypes.includes(file.mimetype) || 
        file.originalname.match(/\.(json|pkl|h5|pt|onnx|zip|model|bin)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only AI model files are allowed.'));
    }
  }
});

// Upload model file
router.post('/upload-file', authMiddleware, upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const result = await pinataService.uploadFile(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        res.json({
            success: true,
            cid: result.cid,
            ipfsHash: result.ipfsHash,
            pinSize: result.pinSize,
            gatewayUrl: `ipfs://${result.cid}`
        });
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Upload metadata
router.post('/upload-metadata', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { modelMetadata, imageCid, options } = req.body;
        const result = await pinataService.uploadNFTMetadata(modelMetadata, imageCid, options);
        res.json({
            success: true,
            cid: result.cid,
            ipfsHash: result.ipfsHash,
            pinSize: result.pinSize,
            gatewayUrl: `ipfs://${result.cid}`
        });
    } catch (error) {
        console.error('Metadata upload error:', error);
        res.status(500).json({ error: 'Failed to upload metadata' });
    }
});

// Retrieve file
router.get('/file/:cid', async (req: Request, res: Response) => {
    try {
        const { cid } = req.params;
        const result = await pinataService.retrieveFile(cid);
        res.json({
            success: true,
            data: result.data,
            contentType: result.contentType,
            cid: cid
        });
    } catch (error) {
        console.error('File retrieval error:', error);
        res.status(500).json({ error: 'Failed to retrieve file' });
    }
});

// Retrieve metadata
router.get('/metadata/:cid', async (req: Request, res: Response) => {
    try {
        const { cid } = req.params;
        const result = await pinataService.retrieveNFTMetadata(cid);
        res.json({
            success: true,
            metadata: result.data,
            cid: cid
        });
    } catch (error) {
        console.error('Metadata retrieval error:', error);
        res.status(500).json({ error: 'Failed to retrieve metadata' });
    }
});

export default router; 