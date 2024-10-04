import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import fetch from 'node-fetch';
// import { MongoClient, ServerApiVersion } from 'mongodb';
import { createClient } from 'redis';
import * as jose from 'jose';
import crypto from 'crypto';
const SESSION_ID_COOKIE_NAME = 'SESSION_ID';

import { pool } from '@/app/lib/postgresConnection';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  console.log(searchParams.get('code'));
  // Do we also verify state here?
  // state is for the server to check
  // Is it part of the same session?
  // code verifier is for the auth server to check
  // is it the same initiator? (can't use cookies here) - but is still a proxy for session
  console.log(searchParams.get('state'));
  console.log('inside /auth path');
  const cookieStore = cookies();
  const codeVerifier = cookieStore.get('my_special_cookies_code_verifier').value;
  console.log(`code verifier: ${codeVerifier}`);

  const form = new URLSearchParams();
  form.append('grant_type', 'authorization_code');
  form.append('client_id', 'C3YRvW2SPqgUMmo6i3t9YMXqeamaFfCH');
  // form.append('client_secret', '4CR88PQOJcT-LX6kMH677Vqy2kHNCortF9fNePXxCvbBEvHmZ')
  form.append('code_verifier', codeVerifier);
  form.append('code', searchParams.get('code'));
  const redirectUri = process.env.BASE_URL ? `${process.env.BASE_URL}/auth` : 'http://localhost:3000/auth';
  form.append('redirect_uri', redirectUri);
  const response = await fetch('https://dev-6zbkrgtguww4sp3s.us.auth0.com/oauth/token', {
    method: 'post',
    body: form,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  console.log(response);
  const data = await response.json();
  console.log('data response');
  console.log(data);
  const jwt = data['id_token'];

  const publicKeyResponse = await fetch('https://dev-6zbkrgtguww4sp3s.us.auth0.com/.well-known/jwks.json', {
    method: 'get'
  });
  const publicKeyData = await publicKeyResponse.json();

  const alg = 'RS256';
  const publicKey = await jose.importJWK(publicKeyData['keys'][0], alg);

  // iss: 'https://dev-6zbkrgtguww4sp3s.us.auth0.com/',
  // aud: 'C3YRvW2SPqgUMmo6i3t9YMXqeamaFfCH',

  try {
    const { payload, protectedHeader } = await jose.jwtVerify(jwt, publicKey, {
      issuer: 'https://dev-6zbkrgtguww4sp3s.us.auth0.com/',
      audience: 'C3YRvW2SPqgUMmo6i3t9YMXqeamaFfCH'
    });
    console.log(payload);
    // will just assume gmail?
    const email = payload?.email;
    const name = payload?.name;
    const picture = payload?.picture; // Need to download picture or something?
    // check if email is in users table
    const client = await pool.connect();

    let userId;

    try {
      await client.query('BEGIN');
      let text = `SELECT * FROM users WHERE email=$1`;
      const user = await client.query(text, [email]);

      // If user is not found in user db
      if (user.rowCount === 0) {
        // user not found. alert? create them?
        let addUser = `INSERT INTO users(name, email, image_url) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING RETURNING *;`;
        const newUser = await client.query(addUser, [name, email, picture ? picture : '/this-is-fine_custom.jpg']);
        userId = newUser.rows[0].id;
        // Flag to turn on and off
        // Also create new entry in the dailys table for them
        let addUserDailys = `INSERT INTO dailys(user_id) VALUES ($1) ON CONFLICT (id) DO NOTHING;`;
        const insertDailyValues = [userId];
        await client.query(addUserDailys, insertDailyValues);

        // Also need to create an account entry as a transaction
        const insertAccount = `INSERT INTO accounts(user_id, balance) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING;`;
        const insertAccountValues = [userId, 100];
        await client.query(insertAccount, insertAccountValues);
      } else if (user.rowCount > 1) {
        // Need to alert the authoriies
      } else {
        // We chilling cause user was found.
        // Return the user id
        userId = user.rows[0].id;
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
      throw err;
    } finally {
      await client.release();
    }

    // could check sub value (auth0, google-oauth2)

    console.log(protectedHeader);
    // probably need to do something to verify with header

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
      user_id: userId,
      name: payload['name'].toString(),
      email: payload['email'].toString(),
      image: payload['picture'].toString()
      // 'https://media.npr.org/assets/img/2023/01/14/this-is-fine_custom-dcb93e90c4e1548ffb16978a5a8d182270c872a9-s1100-c50.jpg'
    });
    const value = await redisClient.hGetAll(sessionId);
    await redisClient.quit();

    cookieStore.set(SESSION_ID_COOKIE_NAME, sessionId);
  } catch (error) {
    if (error.code == `ERR_JWT_CLAIM_VALIDATION_FAILED`) {
      console.log(`JWT CLAIM ${error.claim} with reason: ${error.reason}`);
      console.log('redirecting to landing page');
      redirect('/');
    }
  }
  console.log('everything looks good');
  let redirectUrl = process.env.BASE_URL ? `${process.env.BASE_URL}/dashboard` : 'http://localhost:3000/dashboard';
  redirect(redirectUrl);
}
