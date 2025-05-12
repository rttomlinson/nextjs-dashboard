import pg from 'pg';
import dayjs from 'dayjs';
import axios from 'axios';
var utc = require('dayjs/plugin/utc');
import { DEFAULT_WEIGHTS } from '@/public/data/weights.js';
import { blue, purple, pink, red, gold } from '@/public/data/revolution.js';

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
    let weightFunction = Math.random();
    let color = DEFAULT_WEIGHTS(weightFunction);
    let skin;

    if (color === 'blue') {
      skin = blue[Math.floor(Math.random() * blue.length)];
    }
    if (color === 'purple') {
      skin = purple[Math.floor(Math.random() * purple.length)];
    }
    if (color === 'pink') {
      skin = pink[Math.floor(Math.random() * pink.length)];
    }
    if (color === 'red') {
      skin = red[Math.floor(Math.random() * red.length)];
    }
    if (color === 'gold') {
      skin = gold[Math.floor(Math.random() * gold.length)];
    }
    console.log(skin);

    // throw error if rowCount is not 1
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }

  expect(1).toBe(1);
});
