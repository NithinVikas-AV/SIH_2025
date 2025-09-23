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

module.exports = router;





