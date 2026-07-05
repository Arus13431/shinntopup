import express from 'express';
import { chatSupport, aiRecommend } from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', chatSupport);
router.post('/recommend', aiRecommend);

export default router;
