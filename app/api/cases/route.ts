import { NextRequest, NextResponse } from 'next/server';

// import React from 'react';
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

// This is also consistent with order for now
const skins = [
  'broken_fang_case',
  'imperial_plaid_gloves',
  'atheris_awp',
  'asiimov_ak',
  'lore_bayonet_knife',
  'stonewash_bayonet_knife',
  'printstream_deagle',
  'pulse_famas',
  'desolate_space_m4a4',
  'thor_negev'
];

// winnings in cents
const skinsToAmount = {
  broken_fang_case: 100,
  imperial_plaid_gloves: 20000,
  atheris_awp: 2000,
  asiimov_ak: 5000,
  lore_bayonet_knife: 15000,
  stonewash_bayonet_knife: 10000,
  printstream_deagle: 1500,
  pulse_famas: 1000,
  desolate_space_m4a4: 1000,
  thor_negev: 1000
};

const DEFAULT_WEIGHTS = x => {
  if (x < 0.75) {
    return 'broken_fang_case';
  } else if (x >= 0.75 && x < 0.8) {
    return 'atheris_awp';
  } else if (x >= 0.8 && x < 0.82) {
    return 'imperial_plaid_gloves';
  } else if (x >= 0.82 && x < 0.84) {
    return 'asiimov_ak';
  } else if (x >= 0.84 && x < 0.86) {
    return 'lore_bayonet_knife';
  } else if (x >= 0.86 && x < 0.88) {
    return 'stonewash_bayonet_knife';
  } else if (x >= 0.88 && x < 0.9) {
    return 'printstream_deagle';
  } else if (x >= 0.9 && x < 0.92) {
    return 'pulse_famas';
  } else if (x >= 0.92 && x < 0.94) {
    return 'desolate_space_m4a4';
  } else if (x >= 0.94 && x < 1) {
    return 'thor_negev';
  }
};

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
    // default cost to spin is $5 USD
    const betAmount = 5;
    const betAmountInCents = betAmount * 100;
    const balance = account.rows[0].balance;
    if (balance < betAmountInCents) {
      throw Error('INSUFFICIENT_FUNDS');
    }

    // Get the next skin
    let weightFunction = Math.random();
    console.log('input weight: ', weightFunction);
    let result = DEFAULT_WEIGHTS(weightFunction);

    let amountWinnings = skinsToAmount[result];

    let netWinnings = amountWinnings - betAmountInCents;

    await postgresClient.query(
      `
          UPDATE accounts
          SET balance=$1
          WHERE user_id=$2;
          `,
      [balance + netWinnings, userId]
    );

    const now = dayjs.utc();

    await postgresClient.query(
      `
          INSERT INTO case_spins(user_id, outcome, date)
          VALUES           ($1, $2, $3);
          `,
      [userId, result, now.toISOString()]
    );

    // Make calls to OpenFGA service to add relationships

    await postgresClient.query('COMMIT');
    return { result: result, accountBalance: balance + netWinnings };
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
  const cookieStore = cookies();
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
    const COST_TO_SPIN = 5;
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
