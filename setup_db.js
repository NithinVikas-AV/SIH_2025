const fs = require('fs');
const db = require('./server/db');

async function setupDatabase() {
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('./database_setup.sql', 'utf8');

    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log('Executing database setup...');

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await db.query(statement);
      }
    }

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    process.exit();
  }
}

setupDatabase();