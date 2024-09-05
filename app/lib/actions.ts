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
  amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),
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
      errors: { datetime: ['Expiration time cannot be in the past.'] },
      message: 'Expiration time cannot be in the past.'
    };
  }

  const client = await pool.connect();
  // convert to UTC
  try {
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
      error: error,
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
  // console.log(cookieStore);

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
  // const userId = value['user_id'];
  // console.log(`user_id: ${userId}`);
  await redisClient.quit();
  // if sessionId is not found, then an empty object is returned
  // if (Object.keys(value) == 0) {
  //   return null;
  // }
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
