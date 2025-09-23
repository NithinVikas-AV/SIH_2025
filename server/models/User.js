// server/models/User.js
const db = require('../db');

class User {
  static async findVolunteers() {
    try {
      const query = `
        SELECT id, first_name, last_name
        FROM users
        WHERE LOWER(role) LIKE '%volunteer%'
        ORDER BY first_name ASC, last_name ASC
      `;
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      throw new Error('Failed to fetch volunteers: ' + error.message);
    }
  }

  static async findById(id) {
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error('Failed to find user: ' + error.message);
    }
  }

  // Add more methods as needed
}

module.exports = User;