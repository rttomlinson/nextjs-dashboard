import UserInfo from '@/app/ui/dashboard/userinfo';

import { getUserIdFromSessionId, getUserBalance } from '@/app/lib/actions';
import { unstable_noStore } from 'next/cache';
import { cookies } from 'next/headers';
import { createRedisClient } from '@/app/lib/redisConnection';

import { redirect } from 'next/navigation';
const SESSION_ID_COOKIE_NAME = 'SESSION_ID';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionIdCookie = cookieStore.get(SESSION_ID_COOKIE_NAME);
  if (!(sessionIdCookie && sessionIdCookie.value != '')) {
    redirect('/');
  }
  const redisClient = await createRedisClient();
  let value;
  try {
    await redisClient.connect();
    value = await redisClient.hGetAll(sessionIdCookie.value);
    if (!value['user_id']) {
      redirect('/');
    }
  } finally {
    await redisClient.quit();
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
