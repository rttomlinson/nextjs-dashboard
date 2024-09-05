import UserInfo from '@/app/ui/dashboard/userinfo';

import { getUserIdFromSessionId } from '@/app/lib/actions';
import { unstable_noStore } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from 'redis';
import { pool } from '@/app/lib/postgresConnection';

import { redirect } from 'next/navigation';
import { json } from 'express';
const SESSION_ID_COOKIE_NAME = 'SESSION_ID';

async function getUserBalance(userId) {
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
    console.log(money.rows[0]);
    return money.rows[0].balance;
  } catch (error) {
    console.error('Database error. Fetching user money:', error);
    throw error;
  } finally {
    await client.release();
  }
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const sessionIdCookie = cookieStore.get(SESSION_ID_COOKIE_NAME);
  if (!(sessionIdCookie && sessionIdCookie.value != '')) {
    redirect('/');
  }

  const redisClient = createClient({
    url: process.env.KV_URL || 'redis://localhost:6379',
    socket: {
      tls: process.env.KV_USE_TLS ? true : false
    }
  });
  redisClient.on('error', err => console.log('Redis Client Error', err));
  await redisClient.connect();
  const value = await redisClient.hGetAll(sessionIdCookie.value);
  await redisClient.quit();
  // const obj = {
  //     user_id: '410544b2-4001-4271-9855-fec4b6a6442a',
  //     name: 'user@user.com',
  //     email: 'user@user.com'
  // }
  if (!value['user_id']) {
    redirect('/');
  }

  const currentUser = value.name;
  // get current money
  const userId = await getUserIdFromSessionId(sessionIdCookie.value);
  if (!userId) redirect('/');
  let userBalance = await getUserBalance(userId);
  unstable_noStore();

  return (
    <div className="">
      <UserInfo currentUser={currentUser} userBalance={userBalance} />
      {children}
    </div>
  );
}
