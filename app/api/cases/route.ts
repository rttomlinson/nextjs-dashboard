import { NextRequest, NextResponse } from 'next/server';

import { cookies } from 'next/headers';
import { unstable_noStore } from 'next/cache';

const SESSION_ID_COOKIE_NAME = 'SESSION_ID';
import { createClient } from 'redis';
import { getUserIdFromSessionId, getUserBalance } from '@/app/lib/actions';
import { pool } from '@/app/lib/postgresConnection';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

import { cases, skins, blue, purple, pink, red, gold } from '@/public/data/revolution.js';

import { DEFAULT_WEIGHTS } from '@/public/data/weights.js';

async function getSessionData(sessionId) {
  try {
    const redisClient = createClient({
      url: process.env.KV_URL || 'redis://localhost:6379',
      socket: {
        tls: process.env.KV_USE_TLS ? true : false
      }
    });

    redisClient.on('error', err => console.log('Redis Client Error', err));
    await redisClient.connect();

    const value = await redisClient.hGetAll(sessionId);
    await redisClient.quit();
    console.log(value);
    // if session is not found then log user out
    return value.name;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function spinCases(userId) {
  const postgresClient = await pool.connect();
  try {
    await postgresClient.query('BEGIN');
    const account = await postgresClient.query(
      `
          SELECT balance from accounts WHERE user_id=$1;
          `,
      [userId]
    );
    // default cost to open a case is $2.5 USD
    const betAmount = 2.5;
    const betAmountInCents = betAmount * 100;
    const balance = account.rows[0].balance;
    if (balance < betAmountInCents) {
      throw Error('INSUFFICIENT_FUNDS');
    }

    // Get the next skin
    let weightFunction = Math.random();
    console.log('input weight: ', weightFunction);
    let color = DEFAULT_WEIGHTS(weightFunction);

    // Get the skin from the skins object
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

    let skinValue = skin.value;
    let amountWinnings = skinValue;

    let newBalance = balance - betAmountInCents;

    await postgresClient.query(
      `
          UPDATE accounts
          SET balance=$1
          WHERE user_id=$2;
          `,
      [newBalance, userId]
    );

    const now = dayjs.utc();

    // also insert into inventory
    await postgresClient.query(
      `
          INSERT INTO user_skins_inventory(user_id, skin_id, date)
          VALUES           ($1, $2, $3);
          `,
      [userId, skin['id'], now.toISOString()]
    );
    await postgresClient.query(
      `
          INSERT INTO case_spins(user_id, outcome, date, skin_id)
          VALUES           ($1, $2, $3, $4);
          `,
      [userId, skin['id'], now.toISOString(), skin['id']]
    );

    // Make calls to OpenFGA service to add relationships

    await postgresClient.query('COMMIT');
    return { result: skin, accountBalance: newBalance };
  } catch (error) {
    console.error(error);
    await postgresClient.query('ROLLBACK');

    // TODO: Catch on errors
    return {
      errors: error,
      message: `Database Error: Failed to Create Bet. ${error.toString()}`
    };
  } finally {
    await postgresClient.release();
  }
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionIdCookie = cookieStore.get(SESSION_ID_COOKIE_NAME);
  let currentUser;
  // console.log(sessionIdCookie);
  if (!(sessionIdCookie && sessionIdCookie.value != '')) {
    currentUser = null; // No user
  } else {
    currentUser = await getSessionData(sessionIdCookie.value);
    currentUser = currentUser ? currentUser : null;
  }
  let userId;
  if (currentUser) {
    userId = await getUserIdFromSessionId(sessionIdCookie.value);
  } else {
    return NextResponse.json({ error: 'Session ID not found. Reauthenciation recommended.' }, { status: 400 });
  }

  let userBalance = await getUserBalance(userId);
  unstable_noStore();

  try {
    // check if they have money
    const COST_TO_SPIN = 2.5;
    if (userBalance < COST_TO_SPIN) {
      return NextResponse.json({ error: 'INCIFFICIENT_FUNDS' }, { status: 400 });
    }

    const spinResult = await spinCases(userId);
    if ('errors' in spinResult) {
      throw Error(spinResult['message']);
    }
    // We want the server to tell the client what the results should be
    // let weightFunction = Math.random();
    // console.log('input weight: ', weightFunction);
    // let result = DEFAULT_WEIGHTS(weightFunction);
    // return updated account balance?

    console.log({ id: 123, result: spinResult['result'] });

    return NextResponse.json({ result: spinResult['result'], accountBalance: spinResult['accountBalance'] });
  } catch (err) {
    return NextResponse.json({ message: `Something happened: ${err}` }, { status: 500 });
  }
}
