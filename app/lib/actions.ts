'use server';
// import { sql } from '@vercel/postgres';
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

const FormSchema = z.object({
  id: z.string(),
  // userId: z.string(),
  latitude: z.union([
    z.coerce.number().gte(-90, { message: 'Latitude must be greater than or equal to -90 degrees' }),
    z.coerce.number().lte(90, { message: 'Latitude must be less than or equal to 90 degrees' })
  ]),
  longitude: z.union([
    z.coerce.number().gte(-180, { message: 'Longitude must be greater than or equal to -180 degrees' }),
    z.coerce.number().lte(180, { message: 'Longitude must be less than or equal to 180 degrees' })
  ]),
  amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),
  // date: z.string(),
  // duration: z.coerce.number(), // need to verify that expirationDate is after createDate
  status: z.enum(['placed', 'open', 'closed', 'reconciled']),
  datetime: z.string(),
  offset: z.coerce
    .number()
    .lt(720, { message: 'Offset cannot be greater than 12 hours behind' })
    .gt(-840, { message: 'Offset cannot be greater than 14 hours ahead' }) // this is how far UTC is from the local time. positive means UTC is ahead. negative means UTC is behind. in minutes
});

const CreateBet = FormSchema.omit({ id: true, status: true });

export type State = {
  errors?: {
    amount?: string[];
    // duration?: string[];
    latitude?: string[];
    longitude?: string[];
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

  const validatedFields = CreateBet.safeParse({
    amount: formData.get('amount'),
    latitude: formData.get('latitude'),
    longitude: formData.get('longitude'),
    // duration: formData.get('duration'),
    datetime: formData.get('datetime-local'),
    offset: formData.get('offset')
  });
  if (!validatedFields.success) {
    console.error(validatedFields.error);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Bet'
    };
  }
  const { amount, latitude, longitude, datetime, offset } = validatedFields.data;
  console.log('show datetime');
  console.log(datetime);

  const amountInCents = amount * 100;
  const now = dayjs.utc();
  // offset is minutes
  // cannot set a time in the past
  // const expirationDateTime = dayjs.utc(datetime);

  const IANAtimezoneOfLocationBet = find(latitude, longitude);
  console.log(`IANAtimezoneOfLocationBet ${IANAtimezoneOfLocationBet}`);

  const utcExpirationDateTime = dayjs.tz(datetime, IANAtimezoneOfLocationBet).utc(); // expirationDateTime.add(offset, 'minute');

  console.log(`expected ISO utc date ${utcExpirationDateTime.toISOString()}`);
  const client = await pool.connect();
  // convert to UTC
  try {
    await client.query(
      `
        INSERT INTO bets (user_id,   amount,           status, date,                            expiration_date,                 location)
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
  const userId = value['user_id'];
  console.log(`user_id: ${userId}`);
  await redisClient.quit();

  return userId;
}

export async function recordLocation(formData: FormData) {
  console.log("i'm server");

  const rawFormData = {};
}
