import pg from 'pg';
import dayjs from 'dayjs';
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
    database: 'betsapp'
  });
  try {
    const currentTime = dayjs.utc();
    const startOfDay = dayjs.utc().startOf('day');
    // get the start of the day

    await client.connect();

    const lastDailyRewardClaim = 1; //Need this from db - Time with timezone and should be in UTC

    const userId = 'aaaabcb2-4001-4271-9855-fec4b6aaaaaa';
    const data = await client.query(
      `
      SELECT time_of_last_claimed_reward from dailys WHERE user_id=$1;
      `,
      [userId]
    );

    // Will need to parse it with dayjs.utc();

    // If the user is requesting the daily reward after the start of the day
    // why do we need to check this?

    // If the last time a user claimed a reward was at or after the start of the day, we deny the claim
    if (lastDailyRewardClaim >= startOfDay) {
    } else {
      // otherwise we can grant the user the reward, and update the lastDailyRewardClaim to the currentTime
    }
    console.log(data.rows[0].time_of_last_claimed_reward);

    const lastReward = dayjs(data.rows[0].time_of_last_claimed_reward).utc();

    // if this value is "before" the beginning of the day, then we give the reward.
    if (dayjs(data.rows[0].time_of_last_claimed_reward).utc().isBefore(startOfDay)) {
      // update the time_of_last_claimed_reward to now()
    } else {
      // reward has already been claimed
    }
    console.log();
    // throw error if rowCount is not 1
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }

  expect(1).toBe(1);
});
