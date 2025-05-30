import { Router } from 'express';
import { PinataService } from '../services/pinata';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const pinataService = new PinataService();

// Protected routes
router.use(authMiddleware);

// Upload metadata
router.post('/upload', async (req, res) => {
  try {
    const metadata = req.body;
    const ipfsHash = await pinataService.uploadMetadata(metadata);
    res.json({ ipfsHash, gatewayUrl: `${process.env.PINATA_GATEWAY}/ipfs/${ipfsHash}` });
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    res.status(500).json({ error: 'Failed to upload to IPFS' });
  }
});

export default router; 