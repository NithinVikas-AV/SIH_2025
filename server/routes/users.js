// server/routes/users.js
const express = require('express');
const User = require('../models/User');

const router = express.Router();

// GET /api/users/volunteers - list volunteers with minimal fields
router.get('/volunteers', async (req, res) => {
  try {
    const volunteers = await User.findVolunteers();
    res.json({ volunteers });
  } catch (err) {
    console.error('Fetch volunteers error:', err);
    res.status(500).json({ message: err.message || 'Failed to fetch volunteers' });
  }
});

// GET /api/users/:id - get user by id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Find user error:', err);
    res.status(500).json({ message: err.message || 'Failed to find user' });
  }
});

// PUT /api/users/:id - update user profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate that the user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user
    const updatedUser = await User.updateUser(id, updateData);
    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: err.message || 'Failed to update user' });
  }
});

// GET /api/users/email/:email - get user by email
router.get('/email/:email', async (req, res) => {
  try {
    const user = await User.findByEmail(req.params.email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Find user by email error:', err);
    res.status(500).json({ message: err.message || 'Failed to find user' });
  }
});

module.exports = router;







