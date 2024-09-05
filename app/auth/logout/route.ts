import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
// import { useRouter } from 'next/router';
import { createClient } from 'redis';
const SESSION_ID_COOKIE_NAME = 'SESSION_ID';

export async function GET(request: Request) {
  const cookieStore = cookies();

  const sessionId = cookieStore.get(SESSION_ID_COOKIE_NAME);
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

  // also should delete the session from redis
  console.log('session deleted');
  revalidatePath('/'); //, 'layout');
  redirect('/');

  // return new Response('Deleted session', {
  //   status: 201
  // });
}
