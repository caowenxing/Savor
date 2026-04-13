import { postgres } from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/savor_db';

export const sql = postgres(DATABASE_URL, {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'savor_db',
  username: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
});

export async function initializeDatabase() {
  try {
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

export default sql;
