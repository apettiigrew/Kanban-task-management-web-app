import { Pool } from 'pg';

if (!process.env.POSTGRES_USER) throw new Error('POSTGRES_USER is not defined');
if (!process.env.POSTGRES_HOST) throw new Error('POSTGRES_HOST is not defined');
if (!process.env.POSTGRES_DATABASE) throw new Error('POSTGRES_DATABASE is not defined');
if (!process.env.POSTGRES_PASSWORD) throw new Error('POSTGRES_PASSWORD is not defined');
if (!process.env.POSTGRES_PORT) throw new Error('POSTGRES_PORT is not defined');

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT),
});

export default pool;