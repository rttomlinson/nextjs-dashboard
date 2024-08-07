// import SideNav from '@/app/ui/dashboard/sidenav';
// import UserInfo from '@/app/ui/dashboard/userinfo';
import SomeExtraData from '@/app/ui/dashboard/someextradata';
import { getUserIdFromSessionId } from '@/app/lib/actions';
import { unstable_noStore } from 'next/cache';
import { cookies } from 'next/headers'
import { createClient } from 'redis';
// import { sql } from '@vercel/postgres'
import { pool } from '@/app/lib/postgresConnection';



import { redirect } from 'next/navigation';
const SESSION_ID_COOKIE_NAME = 'SESSION_ID';

async function getUserBalance(userId) {
    
    const client = await pool.connect();
    
    try {
        const money = await client.query(`
        SELECT balance
        FROM accounts
        WHERE user_id=$1
        `, [userId]);
        console.log(money.rows[0])
        return money.rows[0].balance;
    } catch (error) {
        console.error('Database error. Fetching user money:', error)
        throw error;
    } finally {
        await client.release();
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
            <SomeExtraData currentUser={currentUser} userBalance={userBalance}/>
            {/* <div className="w-full flex-none md:w-64">
                <SideNav updateRecordStatus={updateRecordStatus}/>
            </div>
            <div>
                <UserInfo currentUser={currentUser} userBalance={userBalance} recordStatus={recordStatus}/>
            </div> */}
            <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
        </div>
    );
}