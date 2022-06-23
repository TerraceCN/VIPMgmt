import 'dotenv/config';

function requireEnv(name: string) {
  if (!process.env[name]) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return process.env[name];
}

export const HTTP_PORT = parseInt(process.env.HTTP_PORT || '3000');

export const JWT_SECRET = requireEnv('JWT_SECRET');

export const DB_URL = process.env.DB_URL || 'sqlite://./database.db';

export const SMTP_SERVER = requireEnv('SMTP_SERVER');
export const SMTP_USERNAME = requireEnv('SMTP_USERNAME');
export const SMTP_PASSWORD = requireEnv('SMTP_PASSWORD');

export const FRONT_URL = requireEnv('FRONT_URL');
