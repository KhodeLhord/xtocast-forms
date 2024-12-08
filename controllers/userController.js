import pool from '../db/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const createUser = async (req, res) => {
    const { email, phoneNumber, username,form_type ,form_uuid } = req.body;
    const isActive = true; // Default value for is_active
    const createdAt = new Date(); // Current timestamp for created_at
    const updatedAt = new Date(); // Current timestamp for updated_at

    // Generate serial number and pin
// Function to generate a 10-character serial number with uppercase letters and numbers
const generateSerialNumber = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let serial = '';
    for (let i = 0; i < 8; i++) {
      // Randomly choose between a letter and a number
      if (Math.random() > 0.5) {
        serial += letters.charAt(Math.floor(Math.random() * letters.length));
      } else {
        serial += Math.floor(Math.random() * 10);
      }
    }
    return serial;
  };
  
  // Function to generate a 6-digit PIN
  const generatePIN = () => {
    return Math.floor(100000 + Math.random() * 900000); // 6-digit number
  };
  
  // Example usage
  const serialNumber = generateSerialNumber(); // Generates something like 'A3B9X7'
  const pin = generatePIN(); // Generates something like '271203'
  
  console.log(`Serial: ${serialNumber}, PIN: ${pin}`);
  
    try {
        // Hash the PIN before storing it
        const hashedPin = await bcrypt.hash(String(pin), 10);

        console.log(hashedPin)

        const query = `
            INSERT INTO Users (serial_number, pin, email, phone_number, username, form_type, form_uuid,is_active, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.execute(query, [
            serialNumber,
            pin, // Store the hashed PIN
            email,
            phoneNumber,
            username,
            form_type,
            form_uuid,
            isActive,
            createdAt,
            updatedAt,
        ]);

        res.status(201).json({ 
            message: 'User created successfully', 
            userId: result.insertId, 
            serialNumber, 
            pin // Return the plain PIN for client-side usage (e.g., login)
        });
    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

// Fetch all users
export const getUsers = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, serial_number, is_active FROM Users');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};





const JWT_SECRET = 'your_jwt_secret_key'; // Replace with a more secure secret key

// Login route for serial number and PIN with token generation
export const loginUser = async (req, res) => {
    const { serialNumber, pin } = req.body;

    try {
        // Step 1: Retrieve user based on the serial number
        const [rows] = await pool.execute('SELECT id, pin,form_uuid FROM Users WHERE serial_number = ?', [serialNumber]);

        if (rows.length === 0) {
            // If no user with that serial number exists
            console.log('No user found with the given serial number.');
            return res.status(404).json({ error: 'Invalid serial number or PIN' });
        }

        const user = rows[0]; // Assign the first row to the user

        console.log("Entered PIN:", pin);
        console.log("Stored PIN:", user.pin);

        // Ensure they're both strings and trim any excess whitespace
        const userPinString = String(user.pin).trim();
        const enteredPinString = String(pin).trim();

        console.log("Trimmed Entered PIN:", enteredPinString);
        console.log("Trimmed Stored PIN:", userPinString);

        if (enteredPinString !== userPinString) {
            return res.status(401).json({ error: 'Invalid serial number or PIN' });
        }

        // Step 3: Generate JWT Token after successful login
        const token = jwt.sign(
            { userId: user.id, serialNumber: serialNumber }, // Payload
            JWT_SECRET, // Secret key
            { expiresIn: '1h' } // Token expiration time
        );

        // Step 4: Successful login with token
        res.status(200).json({
            message: 'Login successful',
            userId: user.id,
            serialNumber: serialNumber, // Optionally return the serial number
            token, // Return the JWT token
            formUuid: user.form_uuid
        });
        console.log('User logged in successfully', user.form_uuid);
    } catch (error) {
        console.error('Error logging in user:', error.message);
        res.status(500).json({ error: 'Failed to login user' });
    }
};


export const submitForm = async (req, res) => {
    const { uuid } = req.params; // Assuming user ID is included in the form data

    try {
        // Process form data (e.g., save to database)

        // Update `isUsed` to 1 for the user
        const query = `
            UPDATE Users
            SET is_used = 1
            WHERE serial_number = ?
        `;
        const [result] = await pool.execute(query, [uuid]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'Form submitted and isUsed updated successfully' });
        console.log( 'Form submitted and isUsed updated successfully', uuid );
    } catch (error) {
        console.error('Error submitting form:', error.message);
        res.status(500).json({ error: 'Failed to submit form and update isUsed' });
    }
};


export const checkIsUsed = async (req, res) => {
    const { uuid } = req.params; // User ID from route parameters

    try {
        const [rows] = await pool.execute('SELECT is_used FROM Users WHERE serial_number = ?', [uuid]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ isUsed: rows[0].is_used });
        console.log( 'User with UUID:', uuid, 'is used:', rows[0].is_used);
    } catch (error) {
        console.error('Error checking isUsed:', error.message);
        res.status(500).json({ error: 'Failed to check isUsed status' });
    }
};

export const getUserBySerialNumber = async (req, res) => {
    const { serial_number } = req.params; // Serial number from route parameters

    try {
        // SQL query to retrieve only user information by serial number
        const query = `
            SELECT 
                u.serial_number,
                u.username AS user_name,
                u.email
            FROM 
                Users u
            WHERE 
                u.serial_number = ?
        `;

        const [rows] = await pool.execute(query, [serial_number]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(rows[0]); // Return the first result (user data only)
    } catch (error) {
        console.error('Error retrieving user by serial number:', error.message);
        return res.status(500).json({ message: 'Database error', error: error.message });
    }
};
