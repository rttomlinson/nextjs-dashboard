'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { base64URLEncode, sha256 } from '@/app/lib/utils';
import crypto from 'crypto';
import { createClient } from 'redis';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);
const { find } = require('geo-tz');
const SESSION_ID_COOKIE_NAME = 'SESSION_ID';
import { pool } from '@/app/lib/postgresConnection';
import { client } from '@/app/lib/redisConnection';

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
  } catch (error) {
    console.log(error);
    return {
      errors: error,
      message: `Database Error: Failed to Create Bet. ${error.toString()}`
    };
  } finally {
    await client.release();
  }
  console.log('created bet');
  revalidatePath('/dashboard/bets');
  redirect('/dashboard/bets');
}

export async function login(formData: FormData) {
  const codeVerifier = base64URLEncode(crypto.randomBytes(32));

  const cookieStore = cookies();
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
  // redirect(`https://${yourDomain}/authorize`)
  redirect(url);
}

// export async function addMoneyToAccount(previousState: State, formData: FormData) {
//   // get user id of session
//   const cookieStore = cookies();
//   const sessionId = cookieStore.get('SESSION_ID');
//   if (!(sessionId && sessionId.value != '')) {
//     redirect('/');
//   }
//   // can this user make this kind of bet?
//   const userId = await getUserIdFromSessionId(sessionId.value); // Get user id from the request (How does this get passed to server side components)

//   console.log('aww yee adding money');

//   // Check when they last added money

//   // Go ahead and add more money
//   const fiveHundredUSD = 500;
//   const client = await pool.connect();
//   try {
//     await client.query(
//       `
//         UPDATE accounts
//         SET balance = balance + $1
//         WHERE user_id=$2;
//         `,
//       [fiveHundredUSD * 100, userId]
//     );
//   } catch (error) {
//     console.log(error);
//     return {
//       errors: error,
//       message: `Database Error: Failed to Create Bet. ${error.toString()}`
//     };
//   } finally {
//     await client.release();
//   }
//   revalidatePath('/account');
//   redirect('/account');
//   return previousState; // Because TS is dumb
// }

export async function claimDailyReward(previousState: State, formData: FormData) {
  // get user id of session
  const cookieStore = cookies();
  const sessionId = cookieStore.get('SESSION_ID');
  if (!(sessionId && sessionId.value != '')) {
    redirect('/');
  }
  // can this user make this kind of bet?
  const userId = await getUserIdFromSessionId(sessionId.value); // Get user id from the request (How does this get passed to server side components)

  console.log('aww yee trying to add money');

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
    console.log(error);
    await client.query('ROLLBACK');
    return {
      errors: { system_error: ['Database error'] },
      message: `Database Error: Failed to claim daily reward. ${error.toString()}`
    };
  } finally {
    await client.release();
  }
  revalidatePath('/account');
  redirect('/account');
  return previousState; // Because TS is dumb
}

export async function logout() {
  const cookieStore = cookies();
  const sessionId = cookieStore.get('SESSION_ID');
  if (!(sessionId && sessionId.value != '')) {
    redirect('/');
  }

  cookieStore.delete(SESSION_ID_COOKIE_NAME);
  const redisClient = createClient({
    url: process.env.KV_URL || 'redis://localhost:6379',
    socket: {
      tls: process.env.KV_USE_TLS ? true : false
    }
  });

  redisClient.on('error', err => console.log('Redis Client Error', err));

  await redisClient.connect();

  await redisClient.del(sessionId.value);
  await redisClient.quit();
  console.log('logging out');
}

export async function getUserIdFromSessionId(sessionId: string) {
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
  if (!value['user_id']) {
    return null;
  }

  return value['user_id'];
  // return userId;
}

async function getSessionData(sessionId) {
  const redisClient = client;
  await redisClient.connect();
  try {
    const value = await redisClient.hGetAll(sessionId);
    // if sessionId is not found, then an null object is returned
    if (!value['user_id']) {
      return null;
    }
    return value;
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    await client.quit();
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
  console.log("i'm server");

  const rawFormData = {};
}
