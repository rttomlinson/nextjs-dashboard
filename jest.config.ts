import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './'
});

/** @type {import('jest').Config} */
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  verbose: true,
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/$1'
  },
  setupFiles: ['<rootDir>/tests/environment.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
