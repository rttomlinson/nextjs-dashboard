import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres', // default process.env.PGUSER
  password: process.env.POSTGRES_PASSWORD || 'mysecretpassword', //default process.env.PGPASSWORD
  host: process.env.POSTGRES_HOST || 'localhost', // default process.env.PGHOST
  port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432, // default process.env.PGPORT
  database: process.env.POSTGRES_DATABASE || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
