import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  name: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  schema: process.env.DB_SCHEMA || 'public',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
}));
