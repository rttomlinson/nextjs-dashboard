import { getUserBalance, getApplicationUserSessionData } from '@/app/lib/actions';
import { unstable_noStore } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import Cases from '@/app/ui/cases';

const SESSION_ID_COOKIE_NAME = 'SESSION_ID';

export default async function Page() {
  const cookieStore = await cookies();
  const sessionIdCookie = cookieStore.get(SESSION_ID_COOKIE_NAME);
  if (!(sessionIdCookie && sessionIdCookie.value != '')) {
    redirect('/');
  }

  const value = await getApplicationUserSessionData(sessionIdCookie.value);
  if (!value['user_id']) {
    redirect('/');
  }
  const userId = value['user_id'];
  let userBalance = await getUserBalance(userId);
  unstable_noStore();

  return (
    <div className="">
      <Cases userBalance={userBalance} />
    </div>
  );
}
