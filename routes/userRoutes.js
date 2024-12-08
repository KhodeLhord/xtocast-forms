import express from 'express';
import { createUser, getUsers, loginUser,submitForm,checkIsUsed,getUserBySerialNumber } from '../controllers/userController.js';

const router = express.Router();

router.post('/', createUser); // Create a new user
router.post('/login', loginUser); // Create a new user
router.get('/', getUsers);    // Get all users
router.get('/:serial_number', getUserBySerialNumber);    // Get all users
router.patch('/:uuid/update-is-used', submitForm);

router.get('/:uuid/check-is-used', checkIsUsed);



export default router;
