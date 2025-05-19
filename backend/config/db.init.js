/**
 * Database initialization script
 * Run this script to create the database and tables
 */

const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Create a connection to PostgreSQL server (not to specific database)
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'postgres' // Connect to default postgres database
});

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    // Check if database exists
    const dbCheckResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME]
    );
    
    // Create database if it doesn't exist
    if (dbCheckResult.rowCount === 0) {
      console.log(`Creating database: ${process.env.DB_NAME}`);
      await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`Database ${process.env.DB_NAME} created successfully`);
    } else {
      console.log(`Database ${process.env.DB_NAME} already exists`);
    }
    
    // Close connection to postgres database
    await client.release();
    await pool.end();
    
    // Connect to the newly created database
    const appPool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    const appClient = await appPool.connect();
    
    // Read and execute SQL file
    const sqlFilePath = path.join(__dirname, 'init.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Executing SQL script...');
    await appClient.query(sqlScript);
    console.log('Database tables created successfully');
    
    await appClient.release();
    await appPool.end();
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    if (client) {
      client.release();
    }
  }
}

initDatabase().then(() => {
  console.log('Database initialization completed');
}).catch(err => {
  console.error('Database initialization failed:', err);
});