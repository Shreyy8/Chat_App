import { config } from '../config';
import { connectDatabase, disconnectDatabase } from '../config/database';

// Set test environment
process.env.NODE_ENV = 'test';

beforeAll(async () => {
  // Connect to test database
  await connectDatabase();
});

afterAll(async () => {
  // Disconnect from test database
  await disconnectDatabase();
});

// Global test timeout
jest.setTimeout(10000);
