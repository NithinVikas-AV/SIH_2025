// server/routes/auth.js
const express = require('express');
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (user) => {
  const jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_me';
  return jwt.sign(
    { userId: user.id, role: user.role },
    jwtSecret,
    { expiresIn: '1h' } // Token expires in 1 hour
  );
};

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('--- SERVER: Received login request with email:', email); 

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = rows[0];

    // Compare submitted password with the stored bcrypt hash
    if (!user.password_hash) {
      console.error('User has no password_hash stored');
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login.' });
  }
});

// Legacy Google Sign-In endpoint (keeping for backward compatibility)
router.post('/google', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ message: 'Google token is required.' });
  }
  
  try {
    // Get user info using the access token
    const googleResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo', 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    const { email, name, sub } = googleResponse.data;
    
    if (!email) {
      return res.status(400).json({ message: 'Invalid Google token.' });
    }
    
    // Check if user exists in our database
    let { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;
    
    if (rows.length === 0) {
      // User doesn't exist, create a new one
      // Default to 'student' role for new Google sign-ins
      const role = 'student';
      const firstName = name ? name.split(' ')[0] : 'Google User';
      
      // Create a random password for the user (they'll use Google to sign in)
      const randomPassword = Math.random().toString(36).slice(-10);
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      
      const result = await db.query(
        'INSERT INTO users (email, password_hash, first_name, role, google_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [email, passwordHash, firstName, role, sub]
      );
      
      user = result.rows[0];
    } else {
      user = rows[0];
      
      // Update Google ID if not already set
      if (!user.google_id) {
        await db.query('UPDATE users SET google_id = $1 WHERE id = $2', [sub, user.id]);
      }
    }
    
    // Generate token
    const jwtToken = generateToken(user);
    
    res.json({
      message: 'Google login successful!',
      token: jwtToken,
      user: {
        id: user.id,
        firstName: user.first_name,
        role: user.role,
      },
    });
    
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'An error occurred during Google login.' });
  }
});

// Google OAuth Callback endpoint
router.post('/google/callback', async (req, res) => {
  const { code, redirect_uri, state } = req.body;
  
  if (!code) {
    return res.status(400).json({ message: 'Authorization code is required.' });
  }
  
  // Verify state parameter to prevent CSRF attacks
  if (state && state !== 'nambik-auth-state') {
    console.warn('State parameter mismatch in Google callback, possible CSRF attack');
    // Continue anyway but log the warning
  }
  
  try {
    // Exchange the authorization code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri,
      grant_type: 'authorization_code'
    });
    
    const { access_token } = tokenResponse.data;
    
    if (!access_token) {
      return res.status(400).json({ message: 'Failed to obtain access token from Google.' });
    }
    
    // Get user info using the access token
    const googleResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo', 
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    
    const { email, name, sub } = googleResponse.data;
    
    if (!email) {
      return res.status(400).json({ message: 'Invalid Google token or email not provided.' });
    }
    
    // Check if user exists in our database
    let { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;
    
    if (rows.length === 0) {
      // User doesn't exist, create a new one
      // Default to 'student' role for new Google sign-ins
      const role = 'student';
      const firstName = name ? name.split(' ')[0] : 'Google User';
      
      // Create a random password for the user (they'll use Google to sign in)
      const randomPassword = Math.random().toString(36).slice(-10);
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      
      const result = await db.query(
        'INSERT INTO users (email, password_hash, first_name, role, google_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [email, passwordHash, firstName, role, sub]
      );
      
      user = result.rows[0];
    } else {
      user = rows[0];
      
      // Update Google ID if not already set
      if (!user.google_id) {
        await db.query('UPDATE users SET google_id = $1 WHERE id = $2', [sub, user.id]);
      }
    }
    
    // Generate token
    const jwtToken = generateToken(user);
    
    res.json({
      message: 'Google login successful!',
      token: jwtToken,
      user: {
        id: user.id,
        firstName: user.first_name,
        role: user.role,
      },
    });
    
  } catch (error) {
    console.error('Google callback error:', error);
    res.status(500).json({ 
      message: 'An error occurred during Google authentication.',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;

// Development helper: create a test user if running locally
if (process.env.NODE_ENV !== 'production') {
  router.post('/seed-test-user', async (req, res) => {
    try {
      const testEmail = req.body.email || 'test@local';
      const plainPassword = req.body.password || 'Password123';
      const role = req.body.role || 'student';

      // Check if user exists
      const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [testEmail]);
      if (rows.length > 0) {
        return res.json({ message: 'Test user already exists', user: { email: testEmail, role } });
      }

      const bcrypt = require('bcryptjs');
      const hashed = await bcrypt.hash(plainPassword, 10);

      await db.query(
        'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5)',
        [testEmail, hashed, 'Dev', 'User', role]
      );

      res.json({ message: 'Test user created', user: { email: testEmail, role }, password: plainPassword });
    } catch (err) {
      console.error('Seed test user error:', err);
      res.status(500).json({ message: 'Failed to create test user', error: err.message || err });
    }
  });
}