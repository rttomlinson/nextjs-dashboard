import { NextRequest, NextResponse } from 'next/server';

// import React from 'react';
import { cookies } from 'next/headers';
const SESSION_ID_COOKIE_NAME = 'SESSION_ID';
import { createClient } from 'redis';
import { getUserIdFromSessionId } from '@/app/lib/actions';

// import { pool } from '@/app/lib/postgresConnection';

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

export type Match = {
  id: string;
  tournament_id: string;
  tournament_slug: string;
  scheduled_at: string;
  opponents: Team[];
};

export type Team = {
  id: string;
  acronym: string;
  image_url: string;
};

async function getUpcomingCounterStrikeMatches() {
  let client;
  try {
    client = createClient({
      url: process.env.KV_URL || 'redis://localhost:6379',
      socket: {
        tls: process.env.KV_USE_TLS ? true : false
      }
    });

    client.on('error', err => console.log('Redis Client Error', err));
    await client.connect();

    let upcomingMatches = (await client.json.get('upcomingmatches')) as Match;
    return upcomingMatches;
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    await client.quit();
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
  try {
    const upcomingCounterStrikeMatches = await getUpcomingCounterStrikeMatches();
    return NextResponse.json(upcomingCounterStrikeMatches);
  } catch (err) {
    return NextResponse.json({ message: `Something happened: ${err}` }, { status: 500 });
  }
}
