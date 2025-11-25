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

  static async updateUser(id, updateData) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      // Build dynamic query based on provided fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          fields.push(`${key} = $${paramCount}`);
          values.push(updateData[key]);
          paramCount++;
        }
      });

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(id);
      const query = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;
      
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      throw new Error('Failed to update user: ' + error.message);
    }
  }

  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const { rows } = await db.query(query, [email]);
      return rows[0];
    } catch (error) {
      throw new Error('Failed to find user by email: ' + error.message);
    }
  }

  // Add more methods as needed
}

module.exports = User;