// import { Card } from '@/app/ui/dashboard/cards';
// import RevenueChart from '@/app/ui/dashboard/revenue-chart';
// import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
// import { lusitana } from '@/app/ui/fonts';
// import { fetchLatestInvoices, fetchCardData } from '@/app/lib/data';
// import { Suspense } from 'react';
// import { RevenueChartSkeleton, LatestInvoicesSkeleton, CardsSkeleton } from '@/app/ui/skeletons';
// import CardWrapper from '@/app/ui/dashboard/cards';
import { getUserIdFromSessionId } from '@/app/lib/actions';
import { Metadata } from 'next';
import { unstable_noStore } from 'next/cache';
import { cookies } from 'next/headers'
import { createClient } from 'redis';
import { sql } from '@vercel/postgres'
const SESSION_ID_COOKIE_NAME = 'SESSION_ID';


export const metadata: Metadata = {
    title: "Dashboard"
};

// async function getUserBalance(userId) {
//     try {
//         const money = await sql`
//         SELECT balance
//         FROM accounts
//         WHERE user_id=${userId}
//         `;
//         console.log(money.rows[0])
//         return money.rows[0].balance;
//     } catch (error) {
//         console.error('Database error. Fetching user money:', error)
//         throw error;
//     }

// }

export default async function Page() {
    // const latestInvoices = await fetchLatestInvoices();
    // const cookieStore = cookies()
    // const sessionIdCookie = cookieStore.get(SESSION_ID_COOKIE_NAME)
    // const redisClient = createClient();
    // redisClient.on('error', err => console.log('Redis Client Error', err));
    // await redisClient.connect();
    // const value = await redisClient.hGetAll(sessionIdCookie.value);
    // await redisClient.quit();
    // // check if cookie exists
    // const currentUser = value.name;


    // // get current money
    // const userId = await getUserIdFromSessionId(sessionIdCookie.value)
    // let userBalance = await getUserBalance(userId)
    // unstable_noStore()

    return (
        <main>
            <h1 className={`mb-4 text-x1 md:text-2x1`}>Dashboard</h1>
            <h2>Nothing to show right now. ;(</h2>
            {/* <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Suspense fallback={<CardsSkeleton />}>
                    <CardWrapper/>
                </Suspense>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
                <Suspense fallback={<RevenueChartSkeleton />}>
                    <RevenueChart />
                </Suspense>
                <Suspense fallback={<LatestInvoicesSkeleton />}>
                    <LatestInvoices />
                </Suspense>
            </div> */}
        </main>
    );
}