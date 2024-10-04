import { NextRequest, NextResponse } from 'next/server';

import { cookies } from 'next/headers';
const SESSION_ID_COOKIE_NAME = 'SESSION_ID';
import { getApplicationUserSessionData } from '@/app/lib/actions';

import { pool } from '@/app/lib/postgresConnection';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const sessionIdCookie = cookieStore.get(SESSION_ID_COOKIE_NAME);
  if (!(sessionIdCookie && sessionIdCookie.value != '')) {
    return NextResponse.json({ error: 'Session not found. Reauthenciation recommended.' }, { status: 400 });
  }
  const sessionData = await getApplicationUserSessionData(sessionIdCookie.value);
  let userId = sessionData?.userId;
  if (!userId) {
    return NextResponse.json({ error: 'Session not found. Reauthenciation recommended.' }, { status: 400 });
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
    return NextResponse.json({ error: 'Something bad happened on the server.' }, { status: 500 });
  } finally {
    await client.release();
  }

  return NextResponse.json({}, { status: 201 });
}
