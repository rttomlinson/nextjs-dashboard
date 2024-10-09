import { Metadata } from 'next';

import UpcomingMatchesTable from '@/app/ui/counterstrike/place-bets-area';
import { unstable_noStore as noStore } from 'next/cache';
import { createRedisClient } from '@/app/lib/redisConnection';

export const metadata: Metadata = {
  title: 'CounterStrike'
};

export type Match = {
  id: string;
  tournament_id: string;
  tournament_slug: string;
  scheduled_at: string;
  opponents: Team[];
  fully_qualified_tournament_name: string;
};

export type Team = {
  id: string;
  acronym: string;
  image_url: string;
};

// Get upcoming matches

async function getUpcomingSAndATierMatches() {
  const redisClient = await createRedisClient();
  try {
    await redisClient.connect();
    let upcomingMatches = (await redisClient.json.get(process.env.UPCOMING_MATCHES_KEY)) as { [key: string]: Match };
    return upcomingMatches;
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    await redisClient.quit();
  }
}

export default async function Page() {
  let upcomingMatches: { [key: string]: Match } = await getUpcomingSAndATierMatches();
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
    <main suppressHydrationWarning={true}>
      <h1 className={`mb-4 text-x1 md:text-2x1`}>Upcoming CounterStrike Matches</h1>
      <h3>Bet on series outcomes</h3>
      {upcomingMatchesCount.length ? <></> : <p>No upcoming matches</p>}
      <UpcomingMatchesTable upcomingMatches={upcomingMatches}></UpcomingMatchesTable>
    </main>
  );
}
