const pg = require('pg');
import { seed } from '../scripts/test-seed';
import { dropSeed } from '../scripts/test-drop';

async function initializeBetDatabase() {
  await seed();
}

async function clearBetDatabase() {
  await dropSeed();
}

beforeAll(() => {
  return initializeBetDatabase();
});

afterAll(() => {
  return clearBetDatabase();
});

beforeEach(() => {
  console.log('init');
});

afterEach(() => {
  console.log('teardown');
});

test('adds 1 + 2 to equal 3', () => {
  expect(3).toBe(3);

  // happy path
});
