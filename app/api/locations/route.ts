import { NextRequest, NextResponse } from 'next/server';

import React from 'react';
import { cookies } from 'next/headers';
const SESSION_ID_COOKIE_NAME = 'SESSION_ID';
import { createClient } from 'redis';
import { getUserIdFromSessionId } from '@/app/lib/actions';

import { pool } from '@/app/lib/postgresConnection';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
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

export async function POST(request: NextRequest) {
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

  const payload = await request.json();

  // get current utc time
  const now = dayjs.utc().unix();
  const latitude = payload.location?.latitude;
  const longitude = payload.location?.longitude;
  console.log(`latitude ${latitude}`);
  console.log(`longitude ${longitude}`);
  console.log(`now: ${now}`);
  const client = await pool.connect();

  try {
    let text = `UPDATE bets
          SET outcome = 'won'
          WHERE user_id=$1
          AND ST_Distance(ST_MakePoint(location[1], location[0])::geography,
                ST_MakePoint($2, $3)::geography) < 100
          AND TO_TIMESTAMP($4) >= expiration_date - INTERVAL '15 minute' -- minus 15 mins i.e. can't be before 15 mins early -- 
          AND TO_TIMESTAMP($4) <= expiration_date + INTERVAL '30 minute'  -- minus 30 mins i.e. can't be after --
        `;
    // is the user's bet
    // distance is within 100 meters
    // time is not after the bet
    // time is not greater than 30 minutes before the event
    // status is ?

    let values = [userId, longitude, latitude, now];

    const updateBets = await client.query(text, values);

    // console.log(updateBets.rowCount);
  } catch (err) {
    console.error(err);
  } finally {
    await client.release();
  }

  return NextResponse.json({ deez: 'gotem' });
}
