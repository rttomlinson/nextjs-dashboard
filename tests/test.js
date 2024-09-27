import pg from 'pg';
import dayjs from 'dayjs';
import axios from 'axios';
var utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

// import { seed } from '../scripts/test-seed';
// import { dropSeed } from '../scripts/test-drop';

// async function initializeBetDatabase() {
//   // await seed();
// }

// async function clearBetDatabase() {
//   // await dropSeed();
// }

beforeAll(() => {
  // return initializeBetDatabase();
});

afterAll(() => {
  // return clearBetDatabase();
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

test('is just testing something', async () => {
  const { Client } = pg;
  const client = new Client({
    user: 'postgres',
    password: 'mysecretpassword',
    host: 'localhost',
    database: 'postgres'
  });
  try {
    const currentTime = dayjs.utc();
    const startOfDay = dayjs.utc().startOf('day');
    // get the start of the day
    const response = axios.get('https://api.pandascore.co/csgo/matches/upcoming?sort=scheduled_at', {
      headers: { Authorization: 'Bearer A1Nb8RYRdkN5TWaPTuxFmrY0f_Ya0FiI2-IZ_CDG0XIM_IKb3PE' }
    });
    console.log();
    // throw error if rowCount is not 1
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }

  expect(1).toBe(1);
});
