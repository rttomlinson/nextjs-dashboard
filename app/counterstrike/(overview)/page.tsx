import { Metadata } from 'next';

import UpcomingMatchesTable from '@/app/ui/counterstrike/place-bets-area';
import { unstable_noStore as noStore } from 'next/cache';
import { pool } from '@/app/lib/postgresConnection';

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
  const client = await pool.connect();
  try {
    const matches = await client.query(`SELECT upcoming_matches FROM upcoming_counterstrike_matches LIMIT 1;`);
    if (matches.rowCount == 0) {
      // something is wrong with the db or the updating script
      throw new Error('For some reason the upcoming_matches database is completely empty');
    }
    return matches.rows[0]['upcoming_matches'];
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    await client.release();
  }
}

export default async function Page() {
  let upcomingMatches: { [key: string]: Match } = await getUpcomingSAndATierMatches();
  // console.log(upcomingMatches);
  const upcomingMatchesCount = Object.keys(upcomingMatches);
  noStore();

  return (
    <main>
      <h1 className={`mb-4 text-x1 md:text-2x1`}>Upcoming CounterStrike Matches</h1>
      <h3>Bet on series outcomes</h3>
      {upcomingMatchesCount.length ? <></> : <p>No upcoming matches</p>}
      <UpcomingMatchesTable upcomingMatches={upcomingMatches}></UpcomingMatchesTable>
    </main>
  );
}
