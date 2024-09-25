import { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserIdFromSessionId } from '@/app/lib/actions';
import { pool } from '@/app/lib/postgresConnection';
import { formatDateToLocalWithTime } from '@/app/lib/utils';

export const metadata: Metadata = {
  title: 'Your CounterStrike Bets'
};

type Match = {
  id: string;
  tournament_id: string;
  tournament_slug: string;
  scheduled_at: string;
  opponents: Team[];
};

type Team = {
  id: string;
  acronym: string;
  image_url: string;
};

type CounterStrikeBet = {};

async function getCounterStrikeBetsForUser(userId: string) {
  const client = await pool.connect();

  // Need to get match data so I can get the opponents
  // Need to get tournament data maybeee
  // Need to get team data from team_id

  try {
    const bets = await client.query(
      `
      SELECT
        counterstrike_bets.amount,
        counterstrike_bets.date as created_time,
        counterstrike_bets.status as bet_status,
        counterstrike_bets.outcome,
        counterstrike_bets.team_id,
        counterstrike_bets.match_id,
        counterstrike_matches.opponents,
        counterstrike_matches.scheduled_at,
        counterstrike_matches.status as match_status,
        counterstrike_matches.tournament_id,
        counterstrike_matches.tournament_slug
      FROM counterstrike_bets
      JOIN counterstrike_matches ON counterstrike_bets.match_id=counterstrike_matches.match_id
      WHERE counterstrike_bets.user_id=$1
      ORDER BY counterstrike_bets.date DESC
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

// Get placed matches
// import { createClient } from 'redis';
// const redisUrl = process.env.KV_URL || 'redis://localhost:6379';
// const client = createClient({
//   url: redisUrl,
//   socket: {
//     tls: process.env.KV_USE_TLS ? true : false
//   }
// });
export default async function Page() {
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
  const bets = await getCounterStrikeBetsForUser(userId);

  console.log(bets);

  // Switch to relational database since upcoming matches also won't exist

  return (
    <main>
      <h1 className={`mb-4 text-x1 md:text-2x1`}>You bets on CounterStrike Matches</h1>
      {bets ? <></> : <p>You haven't placed bets on any matches yet</p>}
      <Stack spacing={3}>
        {bets.map(bet => {
          // get team from opponents
          const teamThatWasBetOn = bet.opponents.find(team => bet.team_id == team.id);
          bet.opponents;
          return (
            <div>
              <Stack spacing={4} alignItems="center">
                <Paper>
                  <div>Tournament name: {bet.tournament_slug}</div>
                  <div>Scheduled at: {formatDateToLocalWithTime(bet.scheduled_at)}</div>
                  <Stack direction="row" justifyContent="center" alignItems="center" spacing={4}>
                    <Stack alignItems="center">
                      {bet.opponents[0].acronym}
                      <Paper>
                        <img src={bet.opponents[0].image_url} style={{ height: '50px' }}></img>
                      </Paper>
                    </Stack>
                    <div>VS</div>
                    <Stack alignItems="center">
                      {bet.opponents[1].acronym}
                      <Paper>
                        <img src={bet.opponents[1].image_url} style={{ height: '50px' }}></img>
                      </Paper>
                    </Stack>
                  </Stack>
                  You bet on {teamThatWasBetOn.acronym} to take the series
                  <img src={teamThatWasBetOn.image_url} style={{ height: '50px' }}></img>
                </Paper>
              </Stack>
            </div>
          );
        })}
      </Stack>
    </main>
  );
}
