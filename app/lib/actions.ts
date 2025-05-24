'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { base64URLEncode, sha256 } from '@/app/lib/utils';
import crypto from 'crypto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);
const { find } = require('geo-tz');
const SESSION_ID_COOKIE_NAME = 'SESSION_ID';
import { pool } from '@/app/lib/postgresConnection';
import { createRedisClient } from '@/app/lib/redisConnection';
import { createClient } from 'redis';

// Need to verify that datetime is in the future
const FormSchema = z.object({
  id: z.string(),
  latitude: z.coerce.number().refine(
    val => {
      return val <= 90 && val >= -90;
    },
    {
      message: 'Latitude must be between (inclusive) -90 degrees and 90 degrees'
    }
  ),
  longitude: z.coerce.number().refine(
    val => {
      return val <= 180 && val >= -180;
    },
    {
      message: 'Longitude must be between (inclusive) -180 degrees and 180 degrees'
    }
  ),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' })
    .lt(10000, { message: 'We do not support amount greater than or equal to $10,000 at this time.' }),
  status: z.enum(['submitted']),
  datetime: z.string(), // datetime must not be in the past for the intended location
  offset: z.coerce
    .number()
    .lt(720, { message: 'Offset cannot be greater than 12 hours behind' })
    .gt(-840, { message: 'Offset cannot be greater than 14 hours ahead' }) // this is how far UTC is from the local time. positive means UTC is ahead. negative means UTC is behind. in minutes
});

const CreateBet = FormSchema.omit({ id: true, status: true });

export type State = {
  errors?: {
    amount?: string[];
    latitude?: string[];
    longitude?: string[];
    offset?: string[];
    datetime?: string[];
  };
  message?: string | null;
};

export async function createBet(previousState: State, formData: FormData) {
  // get user id of session
  const cookieStore = cookies();
  const sessionId = cookieStore.get('SESSION_ID');
  if (!(sessionId && sessionId.value != '')) {
    redirect('/');
  }

  // can this user make this kind of bet?
  const userId = await getUserIdFromSessionId(sessionId.value); // Get user id from the request (How does this get passed to server side components)

  console.log('creating bet');

  if (formData.get('latitude') == '') formData.set('latitude', undefined);
  if (formData.get('longitude') == '') formData.set('longitude', undefined);

  const validatedFields = CreateBet.safeParse({
    amount: formData.get('amount'),
    latitude: formData.get('latitude'),
    longitude: formData.get('longitude'),
    datetime: formData.get('datetime-local'),
    offset: formData.get('offset')
  });
  if (!validatedFields.success) {
    console.error(validatedFields.error);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing or invalid fields. Failed to create bet'
    };
  }
  const { amount, latitude, longitude, datetime, offset } = validatedFields.data;
  const amountInCents = amount * 100;
  const now = dayjs.utc();

  const IANAtimezoneOfLocationBet = find(latitude, longitude);
  console.log(`IANAtimezoneOfLocationBet ${IANAtimezoneOfLocationBet}`);

  const utcExpirationDateTime = dayjs.tz(datetime, IANAtimezoneOfLocationBet).utc(); // expirationDateTime.add(offset, 'minute');

  console.log(`expected ISO utc date ${utcExpirationDateTime.toISOString()}`);

  // offset is minutes
  // cannot set a time in the past
  if (utcExpirationDateTime.diff(now) <= 0) {
    return {
      errors: { datetime: ['Please select a time further in the future.'] },
      message: 'Please select a time further in the future.'
    };
  }

  const client = await pool.connect();

  // convert to UTC
  try {
    await client.query('BEGIN');
    const account = await client.query(
      `
        SELECT balance from accounts WHERE user_id=$1;
        `,
      [userId]
    );
    // check if there is money in the account
    // There should only be 1 length row and it must have a balance
    const balance = account.rows[0].balance;
    if (balance < amountInCents) {
      return {
        errors: { amount: ['You do not have enough funds to place this bet right now.'] },
        message: 'You do not have enough funds to place this bet right now.'
      };
    }

    await client.query(
      `
        UPDATE accounts
        SET balance=$1
        WHERE user_id=$2;
        `,
      [balance - amountInCents, userId]
    );

    await client.query(
      `
        INSERT INTO bets (user_id, amount, status, date, expiration_date, location)
        VALUES           ($1, $2, $3, $4, $5, point($6,$7));
        `,
      [userId, amountInCents, 'submitted', now.toISOString(), utcExpirationDateTime.toISOString(), latitude, longitude]
    );
    await client.query('COMMIT');
  } catch (error) {
    console.error(error);
    await client.query('ROLLBACK');
    return {
      errors: error,
      message: `Database Error: Failed to Create Bet. ${error.toString()}`
    };
  } finally {
    await client.release();
  }
  revalidatePath('/dashboard/bets');
  redirect('/dashboard/bets');
}

export type CounterStrikeBetState = {
  errors?: {
    amount?: string[];
  };
  message?: string | null;
};
type Match = {
  id: string;
  tournament_id: string;
  tournament_slug: string;
  scheduled_at: string;
  opponents: Team[];
  fully_qualified_tournament_name: string;
};

type Team = {
  id: string;
  acronym: string;
  image_url: string;
};
export async function placeCounterStrikeBet(previousState: CounterStrikeBetState, formData: FormData) {
  // get user id of session
  const cookieStore = cookies();
  const sessionId = cookieStore.get('SESSION_ID');
  if (!(sessionId && sessionId.value != '')) {
    redirect('/');
  }

  const matchId = formData.get('matchId');
  const teamId = formData.get('teamId');
  // can this user make this kind of bet?
  const userId = await getUserIdFromSessionId(sessionId.value);

  // Get matchInfo from "cache" (Need to consider how to make this a little better)

  const postgresClient = await pool.connect();
  try {
    await postgresClient.query('BEGIN');
    const account = await postgresClient.query(
      `
        SELECT balance from accounts WHERE user_id=$1;
        `,
      [userId]
    );
    // Hard-code $500 USD bet size
    // 50000 cents
    const betAmount = 500;
    const betAmountInCents = 500 * 100;
    const balance = account.rows[0].balance;
    const now = dayjs.utc();
    if (balance < betAmount * 100) {
      await postgresClient.query('COMMIT');
      return {
        errors: {
          amount: [
            `You tried to place a bet for $${betAmount}, but you do not have enough funds to place this bet right now.`
          ]
        },
        message: 'You do not have enough funds to place this bet right now.'
      };
    }

    // look for the match by id
    const match = await postgresClient.query(
      `SELECT upcoming_matches->$1 as match FROM upcoming_counterstrike_matches LIMIT 1;`,
      [matchId]
    );
    if (match.rowCount == 0) {
      // something is wrong with the db or the updating script
      return {
        errors: {
          amount: [
            `You tried to place a bet on a match that is no longer open. Try refreshing your page. Match with ID: ${matchId} is missing from UpcomingMatches table`
          ]
        },
        message: `You tried to place a bet on a match that is no longer open. Try refreshing your page. Match with ID: ${matchId} is missing from UpcomingMatches table`
      };
      // TODO: Also send an audit log
      // throw new Error(`Match with ID: ${matchId} is missing from UpcomingMatches table`);
    }
    let upcomingMatch: Match = match.rows[0]['match'];

    await postgresClient.query(
      `
        UPDATE accounts
        SET balance=$1
        WHERE user_id=$2;
        `,
      [balance - betAmountInCents, userId]
    );

    await postgresClient.query(
      `
        INSERT INTO counterstrike_bets (user_id, amount, status, team_id, match_id, date)
        VALUES           ($1, $2, $3, $4, $5, $6);
        `,
      [userId, betAmountInCents, 'submitted', teamId, matchId, now.toISOString()]
    );

    // if fully_qualified_tournament_name is null then use fallback
    await postgresClient.query(
      `
        INSERT INTO counterstrike_matches(match_id, tournament_id, tournament_slug, scheduled_at, opponents, status, fully_qualified_tournament_name)
        VALUES           ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (match_id) DO NOTHING;
        `,
      [
        matchId,
        upcomingMatch.tournament_id,
        upcomingMatch.tournament_slug,
        upcomingMatch.scheduled_at,
        JSON.stringify(upcomingMatch.opponents),
        'not_started',
        upcomingMatch.fully_qualified_tournament_name
      ]
    );

    // Make calls to OpenFGA service to add relationships

    await postgresClient.query('COMMIT');
  } catch (error) {
    console.error(error);
    await postgresClient.query('ROLLBACK');
    return {
      errors: error,
      message: `Database Error: Failed to Create Bet. ${error.toString()}`
    };
  } finally {
    await postgresClient.release();
  }
  // Maybe return that bet was successful
  return {
    errors: {},
    message: 'Bet successfully placed'
  };
}

export type ClaimDailyRewardsState = {
  errors?: {
    system_error?: string[];
    rewards?: string[];
  };
  message?: string | null;
};
export async function claimDailyReward(previousState: ClaimDailyRewardsState, formData: FormData) {
  // get user id of session
  const cookieStore = cookies();
  const sessionId = cookieStore.get('SESSION_ID');
  if (!(sessionId && sessionId.value != '')) {
    redirect('/');
  }
  // can this user make this kind of bet?
  const userId = await getUserIdFromSessionId(sessionId.value);

  const currentTimeUTC = dayjs.utc();
  const startOfDay = dayjs.utc().startOf('day');

  const fiveHundredUSD = 500;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Check when they last added money - is it within the 24 hour period of utc?
    const data = await client.query(
      `
      SELECT time_of_last_claimed_reward from dailys WHERE user_id=$1;
      `,
      [userId]
    );
    if (data.rowCount != 1) {
      //TODO:
      // Log an Administrative error
      //throw new Error('Your account does not have a dailys record. Please contact an Administrator.');
      console.error('Your account does not have a dailys record. Please contact an Administrator.');
      return {
        errors: { system_error: ['Your account does not have a dailys record. Please contact an Administrator.'] },
        message: `'Your account does not have a dailys record. Please contact an Administrator.'`
      };
    }
    const lastReward = dayjs(data.rows[0].time_of_last_claimed_reward).utc();

    if (lastReward.diff(startOfDay) >= 0) {
      // positive means the reward was claimed after the start of the current day
      // This catches the edge-case that the lastReward was right at the startOfDay
      // reward has already been claimed
      await client.query('COMMIT');

      return {
        errors: { rewards: ['Daily reward has already been claimed.'] },
        message: `Daily reward has already been claimed.`
      };
    } else {
      // update the time_of_last_claimed_reward to now()

      await client.query(
        `
        UPDATE dailys
        SET time_of_last_claimed_reward = (timezone('utc', now()))
        WHERE user_id=$1;
        `,
        [userId]
      );

      // Go ahead and add more money

      await client.query(
        `
        UPDATE accounts
        SET balance = balance + $1
        WHERE user_id=$2;
        `,
        [fiveHundredUSD * 100, userId]
      );
      await client.query('COMMIT');
    }
  } catch (error) {
    console.error(error);
    await client.query('ROLLBACK');
    return {
      errors: { system_error: ['Database error'] },
      message: `Database Error: Failed to claim daily reward. ${error.toString()}`
    };
  } finally {
    await client.release();
  }
  revalidatePath('/account');
  return {
    errors: {},
    message: null
  };
}

export async function getUserBalance(userId) {
  const client = await pool.connect();

  try {
    const money = await client.query(
      `
        SELECT balance
        FROM accounts
        WHERE user_id=$1
        `,
      [userId]
    );
    return money.rows[0].balance;
  } catch (error) {
    console.error('Database error. Fetching user money:', error);
    throw error;
  } finally {
    await client.release();
  }
}

export async function getAllBalances() {
  const client = await pool.connect();

  try {
    const money = await client.query(
      `
        SELECT user_id, balance
        FROM accounts
        ORDER BY balance DESC
        LIMIT 50
        `
    );
    return money.rows;
  } catch (error) {
    console.error('Database error. Fetching balances:', error);
    throw error;
  } finally {
    await client.release();
  }
}

export async function login(formData: FormData) {
  const cookieStore = cookies();

  // Does a session already exist?
  const sessionId = cookieStore.get('USER_SESSION_ID');
  if (!(sessionId && sessionId.value != '')) {
    // create a new session
    const sessionId = crypto.randomUUID();
    const redisClient = createClient({
      url: process.env.KV_URL || 'redis://localhost:6379',
      socket: {
        tls: process.env.KV_USE_TLS ? true : false
      }
    });
    redisClient.on('error', err => console.log('Redis Client Error', err));
    await redisClient.connect();
    await redisClient.hSet(sessionId, {
      placeholder: 'banana'
      // 'https://media.npr.org/assets/img/2023/01/14/this-is-fine_custom-dcb93e90c4e1548ffb16978a5a8d182270c872a9-s1100-c50.jpg'
    });
    const value = await redisClient.hGetAll(sessionId);
    await redisClient.quit();

    cookieStore.set('USER_SESSION_ID', sessionId);
  }

  const codeVerifier = base64URLEncode(crypto.randomBytes(32));
  // Instead of storing this as a cookie, we should store it in the session data
  cookieStore.set('my_special_cookies_code_verifier', codeVerifier, {
    path: '/'
  });

  const challenge = base64URLEncode(sha256(codeVerifier));

  // Generate a code_challenge from the code_verifier that will be sent to Auth0 to request an authorization_code.
  // const challenge = Buffer.from(ap + "hellozzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz").toString('base64');
  console.log(`code challenge: ${challenge}`);

  const codeChallenge = challenge;
  // 'code_challenge' must be between 43 and 128 characters long
  // code_challenge' must only contain unreserved characters
  const yourDomain = 'dev-6zbkrgtguww4sp3s.us.auth0.com';
  const yourClientId = 'C3YRvW2SPqgUMmo6i3t9YMXqeamaFfCH';
  const yourCallbackUrl = process.env.BASE_URL ? `${process.env.BASE_URL}/auth` : 'http://localhost:3000/auth';
  const apiAudience = 'https://dev-6zbkrgtguww4sp3s.us.auth0.com/api/v2/';
  // how to generate state?
  const state = 'myspecialstate';
  const scopes = 'openid profile email offline_access';

  let url =
    `https://${yourDomain}/authorize?response_type=code` +
    `&code_challenge=${codeChallenge}` +
    `&code_challenge_method=S256` +
    `&client_id=${yourClientId}` +
    `&redirect_uri=${yourCallbackUrl}` +
    `&scope=${scopes}` +
    `&audience=${apiAudience}` +
    `&state=${state}`;
  redirect(url);
}

export async function logout() {
  const cookieStore = cookies();
  const sessionId = cookieStore.get('SESSION_ID');
  if (!(sessionId && sessionId.value != '')) {
    redirect('/');
  }

  cookieStore.delete(SESSION_ID_COOKIE_NAME);
  const redisClient = await createRedisClient();
  try {
    await redisClient.connect();
    await redisClient.del(sessionId.value);
  } finally {
    await redisClient.quit();
  }
}

export async function getUserIdFromSessionId(sessionId: string) {
  const redisClient = await createRedisClient();
  try {
    await redisClient.connect();

    const value = await redisClient.hGetAll(sessionId);
    if (!value['user_id']) {
      return null;
    }

    return value['user_id'];
  } finally {
    await redisClient.quit();
  }
}

async function getSessionData(sessionId) {
  const redisClient = await createRedisClient();
  try {
    await redisClient.connect();

    const value = await redisClient.hGetAll(sessionId);
    // if sessionId is not found, then an null object is returned
    if (!value['user_id']) {
      return null;
    }
    return value;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    await redisClient.quit();
  }
}

export async function getApplicationUserSessionData(sessionId) {
  const redisClient = await createRedisClient();
  try {
    await redisClient.connect();
    const value = await redisClient.hGetAll(sessionId);
    // if sessionId is not found, then an null object is returned
    if (!value['user_id']) {
      return null;
    }
    return value;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    await redisClient.quit();
  }
}

export async function getUser() {
  const cookieStore = cookies();
  const sessionIdCookie = cookieStore.get(SESSION_ID_COOKIE_NAME);
  let currentUser = null;

  let userProfileImage = null;
  if (!(sessionIdCookie && sessionIdCookie.value != '')) {
    currentUser = null; // No user
  } else {
    currentUser = await getSessionData(sessionIdCookie.value);
    userProfileImage = currentUser?.image || 'some placeholder images';
    currentUser = currentUser ? currentUser : null;
  }
  return { currentUser, userProfileImage };
}

export async function recordLocation(formData: FormData) {
  const rawFormData = {};
}

// verify jwt for session

// get inventory items
export async function getInventoryItems(userId) {
  const client = await pool.connect();
  try {
    const inventory = await client.query(
      `
        SELECT weapon_skins.price, weapon_skins.name as skin_name,
        weapon_skins.fill_style, weapon_skins.image_url,
        user_skins_inventory.date as acquired_date,
        weapon_skins.rarity
        FROM user_skins_inventory
        INNER JOIN weapon_skins ON weapon_skins.skin_id = user_skins_inventory.skin_id
        WHERE user_id=$1
        ORDER BY user_skins_inventory.date DESC;
        `,
      [userId]
    );
    return inventory.rows;
  } catch (error) {
    console.error('Database error. Fetching user inventory:', error);
    throw error;
  } finally {
    await client.release();
  }
}
