// 'use client';
import { Metadata } from 'next';
// import Stack from '@mui/material/Stack';
// import Paper from '@mui/material/Paper';
// import Form from '@/app/ui/counterstrike/place-bet';
import UpcomingMatchesTable from '@/app/ui/counterstrike/place-bets-area';
import { unstable_noStore as noStore } from 'next/cache';

export const metadata: Metadata = {
  title: 'CounterStrike'
};

export type Match = {
  id: string;
  tournament_id: string;
  tournament_slug: string;
  scheduled_at: string;
  opponents: Team[];
};

export type Team = {
  id: string;
  acronym: string;
  image_url: string;
};

// Get upcoming matches
import { createClient } from 'redis';

async function getUpcomingSAndATierMatches() {
  const redisUrl = process.env.KV_URL || 'redis://localhost:6379';
  const client = createClient({
    url: redisUrl,
    socket: {
      tls: process.env.KV_USE_TLS ? true : false
    }
  });
  try {
    await client.connect();
    let upcomingMatches = (await client.json.get('upcomingmatches')) as Match;
    return upcomingMatches;
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    await client.quit();
  }
}

export default async function Page() {
  let upcomingMatches = await getUpcomingSAndATierMatches();
  // await new Promise(function (resolve, reject) {
  //   setTimeout(() => {
  //     console.log('Delayed for 5 second.');
  //     resolve(1);
  //   }, 5000);
  // });
  console.log(upcomingMatches);
  const upcomingMatchesCount = Object.keys(upcomingMatches);
  noStore();

  return (
    <main>
      <h1 className={`mb-4 text-x1 md:text-2x1`}>Upcoming CounterStrike Matches</h1>
      {upcomingMatchesCount.length ? <></> : <p>No upcoming matches</p>}
      <UpcomingMatchesTable upcomingMatches={upcomingMatches}></UpcomingMatchesTable>
    </main>
  );
}
