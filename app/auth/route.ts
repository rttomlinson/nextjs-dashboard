import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import fetch from 'node-fetch';
// import { MongoClient, ServerApiVersion } from 'mongodb';
import { createClient } from 'redis';
import * as jose from 'jose';
import crypto from 'crypto';
const SESSION_ID_COOKIE_NAME = 'SESSION_ID';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  console.log(searchParams.get('code'));
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
  form.append('redirect_uri', 'http://localhost:3000/auth');
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
    console.log(protectedHeader);

    const sessionId = crypto.randomUUID();

    // look up user in users table based on email

    const redisClient = createClient({
      url: process.env.KV_URL || 'redis://localhost:6379',
      socket: {
        tls: process.env.KV_USE_TLS ? true : false
      }
    });

    redisClient.on('error', err => console.log('Redis Client Error', err));

    await redisClient.connect();

    await redisClient.hSet(sessionId, {
      user_id: '410544b2-4001-4271-9855-fec4b6a6442a',
      name: payload['name'].toString(),
      email: payload['email'].toString()
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
  redirect('http://localhost:3000/dashboard');

  // need to catch errors here

  // const admin = process.env.BANANA_MONGODB_USERNAME;
  // const password = process.env.BANANA_MONGODB_PASSWORD;
  // // Check session
  // const uri = `mongodb://${admin}:${password}@localhost:27017`;
  // // const uri = `mongodb://localhost:27017`

  // const client = new MongoClient(uri, {
  //   serverApi: {
  //     version: ServerApiVersion.v1,
  //     strict: true,
  //     deprecationErrors: true
  //   }
  // });

  // async function run() {
  //   try {
  //     // Connect the client to the server (optional starting in v4.7)
  //     await client.connect();
  //     // Send a ping to confirm a successful connection
  //     const db = await client.db('admin');
  //     await db.command({ ping: 1 });
  //     console.log('Pinged your deployment. You successfully connected to MongoDB!');

  //     const bananaDB = client.db('banana');
  //     const myColl = bananaDB.collection('session');
  //     const sessionData = { sessionId: 'abc123' };
  //     await myColl.insertOne(sessionData);
  //     const mySessions = await myColl.find();

  //     for await (const doc of mySessions) {
  //       console.log(doc);
  //     }
  //   } finally {
  //     // Ensures that the client will close when you finish/error
  //     await client.close();
  //   }
  // }
  // run().catch(console.dir);
}
