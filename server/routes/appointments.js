const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_me';
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user; // { userId, role }
    next();
  });
};

// POST /api/appointments
// Body: { counselor_user_id, start_time, mode }
// - start_time: ISO string (e.g. 2025-09-25T10:00:00Z or local without Z)
// - mode: 'online' | 'in-person'
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { counselor_user_id, start_time, mode } = req.body;

    if (!counselor_user_id || !start_time || !mode) {
      return res.status(400).json({ error: 'counselor_user_id, start_time and mode are required' });
    }

    // Validate mode matches DB constraint
    const normalizedMode = String(mode).toLowerCase();
    if (!['online', 'in-person'].includes(normalizedMode)) {
      return res.status(400).json({ error: "mode must be 'online' or 'in-person'" });
    }

    // Student id from token
    const student_user_id = req.user.userId; // JWT payload contains userId

    // Compute end_time = start_time + 1 hour
    const start = new Date(start_time);
    if (isNaN(start.getTime())) {
      return res.status(400).json({ error: 'Invalid start_time format' });
    }
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    // Optional: prevent double booking at the same slot for this counselor
    const conflictCheck = await db.query(
      `SELECT id FROM appointments WHERE counselor_user_id = $1 AND start_time = $2 AND status = 'scheduled' LIMIT 1`,
      [counselor_user_id, start.toISOString()]
    );
    if (conflictCheck.rows.length > 0) {
      return res.status(409).json({ error: 'This time slot is already booked' });
    }

    const insertQuery = `
      INSERT INTO appointments (counselor_user_id, student_user_id, start_time, end_time, mode, status)
      VALUES ($1, $2, $3, $4, $5, 'scheduled')
      RETURNING *
    `;
    const values = [counselor_user_id, student_user_id, start.toISOString(), end.toISOString(), normalizedMode];
    const result = await db.query(insertQuery, values);

    res.status(201).json({
      message: 'Appointment scheduled successfully',
      appointment: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// GET /api/appointments/my-schedule (for counselors to view their timetable)
// Returns scheduled appointments for the authenticated counselor with student names
router.get('/my-schedule', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Optional: enforce role check if required
    // if (req.user.role !== 'counselor') return res.status(403).json({ error: 'Forbidden' });

    const query = `
      SELECT a.id, a.start_time, a.end_time, a.mode, a.status,
             s.first_name AS student_first_name, s.last_name AS student_last_name
      FROM appointments a
      JOIN users s ON s.id = a.student_user_id
      WHERE a.counselor_user_id = $1
      ORDER BY a.start_time ASC
    `;

    const { rows } = await db.query(query, [userId]);
    const data = rows.map(r => ({
      id: r.id,
      start_time: r.start_time,
      end_time: r.end_time,
      mode: r.mode,
      status: r.status,
      student_name: `${r.student_first_name || ''} ${r.last_name || ''}`.trim(),
    }));

    res.json(data);
  } catch (error) {
    console.error('Error fetching my schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

module.exports = router;