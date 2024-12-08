import pool from '../db/db.js';

// Add a new transaction
export const createTransaction = async (req, res) => {
    const { serialNumber, pin, paymentId, amount ,phone_number} = req.body;

    try {
        const query = `
            INSERT INTO Transactions (serial_number, pin, payment_id, phone_number,amount, status) 
            VALUES (?, ?, ?, ?, ?, 'PENDING')
        `;
        const [result] = await pool.execute(query, [serialNumber, pin, paymentId, ,phone_number,amount]);
        res.status(201).json({ message: 'Transaction created successfully', transactionId: result.insertId });
    } catch (error) {
        console.error('Error creating transaction:', error.message);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
};

// Update transaction status
export const updateTransactionStatus = async (req, res) => {
    const { paymentId, status } = req.body;

    try {
        const query = `
            UPDATE Transactions 
            SET status = ? 
            WHERE payment_id = ?
        `;
        await pool.execute(query, [status, paymentId]);
        res.status(200).json({ message: 'Transaction status updated successfully' });
    } catch (error) {
        console.error('Error updating transaction status:', error.message);
        res.status(500).json({ error: 'Failed to update transaction status' });
    }
};
