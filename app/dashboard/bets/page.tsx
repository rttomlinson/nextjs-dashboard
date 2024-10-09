import { Metadata } from 'next';
import Table from '@/app/ui/bets/table';
import { getUserIdFromSessionId } from '@/app/lib/actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { unstable_noStore as noStore } from 'next/cache';
import { pool } from '@/app/lib/postgresConnection';

const { find } = require('geo-tz');

export const metadata: Metadata = {
  title: 'Bets'
};

export type BetsTable = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  image_url: string;
  created_time: string;
  expiration_date: string;
  amount: number;
  status: 'pending' | 'open' | 'closed' | 'reconciled';
  location: { x: string; y: string };
  outcome: string | null;
};

async function fetchFilteredBets(userId: string) {
  const client = await pool.connect();

  try {
    const bets = await client.query(
      `
      SELECT
        bets.id,
        bets.amount,
        bets.date as created_time,
        bets.expiration_date as expiration_date,
        bets.location,
        bets.status,
        bets.user_id,
        users.name,
        users.email,
        users.image_url,
        bets.outcome
      FROM bets
      JOIN users ON bets.user_id = users.id
      WHERE bets.user_id=$1
      ORDER BY bets.date DESC
      LIMIT 20
    `,
      [userId]
    );
    console.log(bets.rows);
    return bets.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  } finally {
    await client.release();
  }
}

export default async function Page({
  searchParams
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  const cookieStore = cookies();
  const sessionId = cookieStore.get('SESSION_ID');

  // undefined means that SESSION_ID cookie not found
  if (!sessionId) {
    redirect('/');
    // else if it is defined but is an empty string
  } else if (sessionId?.value == '') {
    redirect('/');
  }
  const userId = await getUserIdFromSessionId(sessionId.value);
  // get user id from session id
  let bets = await fetchFilteredBets(userId);
  //update each bet with iana based on coordinates
  bets = bets.map(bet => {
    return {
      ...bet,
      IANAtimezone: find(bet.location.x, bet.location.y)[0]
    };
  });
  noStore();
  //   const totalPages = await fetchInvoicesPages(query);
  return (
    <div>
      <h1>Bets</h1>
      {/* <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}> */}
      <Table query={query} currentPage={currentPage} bets={bets} />
      {/* </Suspense> */}
      {/* <div className="mt-5 flex w-full justify-center"><Pagination totalPages={totalPages} /></div> */}
    </div>
  );
}
