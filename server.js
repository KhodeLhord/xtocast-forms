import express from 'express';
import formsRoutes from './routes/formsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import organizerRoutes from './routes/organizerRoutes.js';
import { testConnection } from './db/db.js';
import cors from 'cors';
import https from 'https';



const app = express();


// Add this before defining your routes
app.use(
    cors({
      origin: 'https://forms-xtocast.netlify.app', // Allow requests from this origin
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], // Allowed methods
      allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
      credentials: true, // Allow cookies and credentials
    })
  );
// OR for a simple unrestricted setup (use carefully during development)
// app.use(cors());
// Middleware
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use('/api', formsRoutes);
app.use('/api/users', userRoutes);         // User-related endpoints
app.use('/api/transactions', transactionRoutes); // Transaction-related endpoints
app.use('/api', organizerRoutes);  

// Default Route
app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something went wrong!' });
});

app.post('/api/paystack/initialize', (req, res) => {
    const { email, amount } = req.body;

    if (!email || !amount) {
        return res.status(400).json({
            status: 'error',
            message: 'Email and amount are required.'
        });
    }

    const amountInKobo = amount * 100; // Convert to kobo

    const params = JSON.stringify({
        email: email,
        amount: amountInKobo
    });

    const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: '/transaction/initialize',
        method: 'POST',
        headers: {
            'Authorization': `Bearer sk_test_64e1abb9ae9cd2efeca7ebb09499e7a00c0fdb34`,
            'Content-Type': 'application/json'
        }
    };

    const request = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            const parsedData = JSON.parse(data);
            if (parsedData.status === true) {
                res.json({
                    status: 'success',
                    data: {
                        authorization_url: parsedData.data.authorization_url,
                        reference: parsedData.data.reference
                    }
                });
            } else {
                res.status(400).json({
                    status: 'error',
                    message: parsedData.message || 'Payment initialization failed.'
                });
            }
        });
    });

    request.on('error', (error) => {
        res.status(500).json({
            status: 'error',
            message: 'Internal server error.'
        });
    });

    request.write(params);
    request.end();
});


testConnection()

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
