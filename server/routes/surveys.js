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
    req.user = user;
    next();
  });
};

// Get available survey types
router.get('/types', authenticateToken, async (req, res) => {
  try {
    const query = 'SELECT DISTINCT survey_type FROM survey_questions ORDER BY survey_type';
    const result = await db.query(query);
    const surveyTypes = result.rows.map(row => row.survey_type);
    res.json(surveyTypes);
  } catch (error) {
    console.error('Error fetching survey types:', error);
    res.status(500).json({ error: 'Failed to fetch survey types' });
  }
});

// Get questions for a specific survey type
router.get('/questions/:surveyType', authenticateToken, async (req, res) => {
  try {
    const { surveyType } = req.params;
    const query = 'SELECT question_id, question_order, question_text, options FROM survey_questions WHERE survey_type = $1 ORDER BY question_order';
    const result = await db.query(query, [surveyType]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Survey type not found' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Submit survey responses
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { user_id, survey_type, responses } = req.body;

    // Calculate total score
    let total_score = 0;
    for (const response of responses) {
      // Ensure selected_option is a number before adding
      total_score += Number(response.selected_option) || 0;
    }

    let severity_level = 'N/A'; // Default value
    let flagged_for_followup = false;

    // --- MODIFICATION START ---
    // Determine severity level based on survey type

    if (survey_type === 'GAD-7') {
      if (total_score <= 4) {
        severity_level = 'minimal anxiety';
      } else if (total_score <= 9) {
        severity_level = 'mild anxiety';
      } else if (total_score <= 14) {
        severity_level = 'moderate anxiety';
        // A score of 10 or more on the GAD-7 often warrants follow-up
        flagged_for_followup = true;
      } else {
        severity_level = 'severe anxiety';
        flagged_for_followup = true;
      }
    } else if (survey_type === 'PHQ-9') {
      // Added logic for PHQ-9 scoring
      if (total_score <= 4) {
        severity_level = 'Minimal depression';
      } else if (total_score <= 9) {
        severity_level = 'Mild depression';
      } else if (total_score <= 14) {
        severity_level = 'Moderate depression';
        flagged_for_followup = true; // Flag for follow-up at moderate or higher
      } else if (total_score <= 19) {
        severity_level = 'Moderately severe depression';
        flagged_for_followup = true;
      } else {
        severity_level = 'Severe depression';
        flagged_for_followup = true;
      }
    }
    // --- MODIFICATION END ---


    // Prepare answers as JSONB
    const answers = responses.reduce((acc, response) => {
      acc[response.question_id] = response.selected_option;
      return acc;
    }, {});

    // Insert into survey_submissions
    const query = `
      INSERT INTO survey_submissions (user_id, survey_type, answers, total_score, severity_level, flagged_for_followup, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
    const values = [user_id, survey_type, JSON.stringify(answers), total_score, severity_level, flagged_for_followup];
    const result = await db.query(query, values);

    // Return a consistent response structure for the frontend
    res.status(201).json({
      message: 'Survey submitted successfully',
      submission: result.rows[0],
      total: total_score,
      severity_level,
      flagged_for_followup
    });
  } catch (error) {
    console.error('Error submitting survey:', error);
    res.status(500).json({ error: 'Failed to submit survey' });
  }
});

module.exports = router;
