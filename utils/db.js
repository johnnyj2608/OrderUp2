require('dotenv').config();

const { Client } = require('pg');

const connectToDb = async () => {
  const client = new Client({
    connectionString: process.env.DB_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database!');
    return client;
  } catch (err) {
    console.error('Error connecting to the database:', err.stack);
    throw err;
  }
};

module.exports = { connectToDb };
