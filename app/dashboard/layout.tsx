import SideNav from '@/app/ui/dashboard/sidenav';
import UserInfo from '@/app/ui/dashboard/userinfo';
import { getUserIdFromSessionId } from '@/app/lib/actions';
import { unstable_noStore } from 'next/cache';
import { cookies } from 'next/headers'
import { createClient } from 'redis';
import { sql } from '@vercel/postgres'
import { redirect } from 'next/navigation';
const SESSION_ID_COOKIE_NAME = 'SESSION_ID';

async function getUserBalance(userId) {
    try {
        const money = await sql`
        SELECT balance
        FROM accounts
        WHERE user_id=${userId}
        `;
        console.log(money.rows[0])
        return money.rows[0].balance;
    } catch (error) {
        console.error('Database error. Fetching user money:', error)
        throw error;
    }

}   

export default async function Layout({children}: { children: React.ReactNode}) {
    const cookieStore = cookies()
    const sessionIdCookie = cookieStore.get(SESSION_ID_COOKIE_NAME)
    const redisClient = createClient(
        {
          url: process.env.KV_URL || 'redis://localhost:6379',
          socket: {
              tls: process.env.KV_USE_TLS ? true : false
          }
        }
      );
    redisClient.on('error', err => console.log('Redis Client Error', err));
    await redisClient.connect();
    const value = await redisClient.hGetAll(sessionIdCookie.value);
    await redisClient.quit();
    // check if cookie exists
    const currentUser = value.name;


    // get current money
    const userId = await getUserIdFromSessionId(sessionIdCookie.value)
    if(!userId) redirect("/");
    let userBalance = await getUserBalance(userId)
    unstable_noStore()

    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
            <div className="w-full flex-none md:w-64">
                <SideNav />
            </div>
            <div>
                <UserInfo currentUser={currentUser} userBalance={userBalance}/>
            </div>
            <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
        </div>
    );
}