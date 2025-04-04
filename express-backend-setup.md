
# Express Backend Setup Guide

This guide explains how to set up an Express.js backend to work with your BankWise frontend application.

## Requirements

- Node.js (v14 or later)
- npm or yarn

## Setup Steps

1. Create a new directory for your backend:

```bash
mkdir bankwise-backend
cd bankwise-backend
```

2. Initialize the project:

```bash
npm init -y
```

3. Install required dependencies:

```bash
npm install express cors dotenv jsonwebtoken bcrypt mongoose express-validator
```

4. Create a basic server structure:

```
bankwise-backend/
├── .env                  # Environment variables
├── package.json         
├── server.js            # Main server file
└── src/
    ├── config/          # Configuration files
    ├── controllers/     # Route controllers
    ├── middleware/      # Custom middleware
    ├── models/          # Database models
    └── routes/          # API routes
```

5. Create a `.env` file with the following variables:

```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

6. Create a basic `server.js` file:

```javascript
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const accountRoutes = require('./src/routes/account.routes');
const transactionRoutes = require('./src/routes/transaction.routes');
const beneficiaryRoutes = require('./src/routes/beneficiary.routes');
const billRoutes = require('./src/routes/bill.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', accountRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/bills', billRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

7. Create the auth route handler in `/src/routes/auth.routes.js`:

```javascript
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Mock user for demo purposes (in production, use a database)
const mockUser = {
  id: '1',
  username: 'demo',
  password: '$2b$10$X/JVk1fLPnAYrX.Npi5Z.eMK/ZfOZmRBEl1o8e7VNFzlmW4RpvX1q', // hashed 'password'
  name: 'Anass Bourourou',
  email: 'anassbr01@gmail.com',
  phone: '0607810824',
  city: 'Casablanca',
  country: 'Maroc',
  address: 'Bouskoura'
};

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // In production, fetch user from database
    if (username !== mockUser.username) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Compare password
    const isMatch = await bcrypt.compare(password, mockUser.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: mockUser.id, username: mockUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return user info and token
    const { password: _, ...userWithoutPassword } = mockUser;
    
    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      // In production, fetch user from database using decoded.id
      const { password, ...userWithoutPassword } = mockUser;
      
      res.json({ user: userWithoutPassword });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      // In production, update user in database
      // For demo, just return the updated data
      const updatedUser = {
        ...mockUser,
        ...req.body,
        password: mockUser.password // Don't update password this way
      };
      
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    // In production, create user in database
    // For demo, just return success
    res.json({
      user: {
        id: '2',
        username: req.body.email,
        name: req.body.name,
        email: req.body.email
      },
      token: jwt.sign(
        { id: '2', username: req.body.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      )
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  // JWT is stateless, so no server-side action is needed for logout
  // The frontend will remove the token
  res.json({ success: true });
});

// Reset password route
router.post('/reset-password', (req, res) => {
  // In production, implement real password reset
  // For demo, just return success
  res.json({ success: true });
});

module.exports = router;
```

8. Start your backend server:

```bash
node server.js
```

## Connecting with your frontend

1. Make sure your frontend is configured to use the backend API URL. In development:

```
VITE_API_URL=http://localhost:3000/api
```

2. For production, update this to your deployed backend URL.

## Further Development

This is a basic setup. For a complete banking application, you'll need to implement:

1. All the API endpoints that match your frontend requirements
2. Proper database models using Mongoose
3. Robust authentication and authorization
4. Data validation and error handling
5. Proper security measures for financial data

Remember to never store sensitive financial information without proper security measures in place.
