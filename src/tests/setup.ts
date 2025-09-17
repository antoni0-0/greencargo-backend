import { config } from 'dotenv';

config({ path: '.env.test' });

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
process.env.DATABASE_PATH = process.env.DATABASE_PATH || ':memory:';

jest.setTimeout(10000);
