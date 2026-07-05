import express from 'express';
import { 
  validateIdGame, 
  createTransaction, 
  midtransNotification, 
  getTransactionStatus, 
  getUserTransactions,
  getSpendingStats,
  simulatePaymentSuccess
} from '../controllers/paymentController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/validate-id', validateIdGame);
router.post('/create-transaction', optionalProtect, createTransaction);
router.post('/notification', midtransNotification);
router.get('/status/:orderId', getTransactionStatus);
router.post('/simulate-success/:orderId', simulatePaymentSuccess);
router.get('/my-transactions', protect, getUserTransactions);
router.get('/spending-stats', protect, getSpendingStats);

export default router;
