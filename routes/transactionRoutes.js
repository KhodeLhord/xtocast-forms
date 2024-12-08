import express from 'express';
import { createTransaction, updateTransactionStatus } from '../controllers/transactionController.js';

const router = express.Router();

router.post('/', createTransaction);        // Create a new transaction
router.put('/status', updateTransactionStatus); // Update transaction status

export default router;
