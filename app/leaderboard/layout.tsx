import UserInfo from '@/app/ui/dashboard/userinfo';

import { getUserBalance, getApplicationUserSessionData } from '@/app/lib/actions';
import { unstable_noStore } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
const SESSION_ID_COOKIE_NAME = 'SESSION_ID';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const sessionIdCookie = cookieStore.get(SESSION_ID_COOKIE_NAME);
  if (!(sessionIdCookie && sessionIdCookie.value != '')) {
    redirect('/');
  }
  const value = await getApplicationUserSessionData(sessionIdCookie.value);
  if (!value['user_id']) {
    redirect('/');
  }
  const userId = value['user_id'];
  const currentUser = value['name'];
  unstable_noStore();

  return <div>{children}</div>;
}
