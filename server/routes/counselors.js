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

// GET /api/counselors
// Fetch all active counselors with profile snippets when current_availability is true
router.get('/', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id AS user_id,
        u.first_name,
        u.last_name,
        cp.specialization,
        cp.experience_years,
        cp.languages_spoken,
        cp.current_availability
      FROM users u
      JOIN counselor_profiles cp ON cp.user_id = u.id
      WHERE LOWER(u.role) = 'counselor' AND COALESCE(cp.current_availability, false) = true
      ORDER BY u.first_name ASC, u.last_name ASC
    `;

    const { rows } = await db.query(query);

    const counselors = rows.map(r => ({
      user_id: r.user_id,
      name: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
      specialization: r.specialization || [],
      experience_years: r.experience_years || 0,
      languages_spoken: r.languages_spoken || [],
      current_availability: !!r.current_availability,
    }));

    res.json(counselors);
  } catch (error) {
    console.error('Error fetching counselors:', error);
    res.status(500).json({ error: 'Failed to fetch counselors' });
  }
});

// Helper: generate 1-hour start slots from a "HH:MM-HH:MM" range string
function generateHourlySlotsForRange(dateStr, rangeStr) {
  const [startStr, endStr] = rangeStr.split('-').map(s => s.trim());
  if (!startStr || !endStr) return [];

  const toDate = (timeStr) => new Date(`${dateStr}T${timeStr}:00`);
  const start = toDate(startStr);
  const end = toDate(endStr);

  const slots = [];
  const cursor = new Date(start);
  while (cursor < end) {
    // Only include start times where the next +1h fits within end
    const next = new Date(cursor.getTime() + 60 * 60 * 1000);
    if (next <= end) {
      const hh = String(cursor.getHours()).padStart(2, '0');
      const mm = String(cursor.getMinutes()).padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }
    cursor.setHours(cursor.getHours() + 1);
  }
  return slots;
}

// Helper: parse schedule for a given weekday into slots
function generateSlotsFromSchedule(dateStr, daySchedule) {
  if (!daySchedule) return [];
  const normalized = String(daySchedule).trim();
  if (!normalized || /^off$/i.test(normalized)) return [];

  const ranges = normalized.split(',').map(s => s.trim()).filter(Boolean);
  const all = [];
  for (const range of ranges) {
    all.push(...generateHourlySlotsForRange(dateStr, range));
  }
  return all;
}

// GET /api/counselors/:counselor_id/availability?date=YYYY-MM-DD
router.get('/:counselor_id/availability', authenticateToken, async (req, res) => {
  try {
    const { counselor_id } = req.params; // UUID of users.id
    const { date } = req.query; // YYYY-MM-DD

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Query param "date" (YYYY-MM-DD) is required' });
    }

    // Fetch availability schedule for counselor
    const profQuery = `
      SELECT cp.availability_schedule
      FROM counselor_profiles cp
      WHERE cp.user_id = $1
      LIMIT 1
    `;
    const profResult = await db.query(profQuery, [counselor_id]);
    if (profResult.rows.length === 0) {
      return res.status(404).json({ error: 'Counselor profile not found' });
    }

    const schedule = profResult.rows[0].availability_schedule || {};

    // Determine weekday name (monday..sunday) based on provided date (local server time)
    const dt = new Date(`${date}T00:00:00`);
    const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const dayName = dayNames[dt.getDay()];

    const daySchedule = schedule[dayName];
    const generatedSlots = generateSlotsFromSchedule(date, daySchedule);

    if (generatedSlots.length === 0) {
      return res.json([]);
    }

    // Fetch already booked start_time for this counselor and date (only scheduled)
    const bookedQuery = `
      SELECT start_time 
      FROM appointments 
      WHERE counselor_user_id = $1 
        AND start_time::date = $2::date 
        AND status = 'scheduled'
    `;
    const bookedResult = await db.query(bookedQuery, [counselor_id, date]);

    const bookedSet = new Set(
      bookedResult.rows.map(r => {
        const d = new Date(r.start_time);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
      })
    );

    const available = generatedSlots.filter(t => !bookedSet.has(t));
    res.json(available);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

module.exports = router;