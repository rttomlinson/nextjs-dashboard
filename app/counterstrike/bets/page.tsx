import { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserIdFromSessionId } from '@/app/lib/actions';
import { pool } from '@/app/lib/postgresConnection';
import { formatDateToLocalWithTime } from '@/app/lib/utils';
import ViewCounterStrikeBet from '@/app/ui/counterstrike/view-bet';

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

type CounterStrikeBet = {
  id: string;
  amount: number;
  created_time: string;
  bet_status: string;
  bet_outcome: string;
  winner_team_id: string;
  match_id: string;
  opponents: Team[];
  scheduled_at: string;
  match_status: string;
  tournament_id: string;
  tournament_slag: string;
};

async function getCounterStrikeBetsForUser(userId: string) {
  const client = await pool.connect();

  // Need to get match data so I can get the opponents
  // Need to get tournament data maybeee
  // Need to get team data from team_id

  try {
    const bets = await client.query(
      `
      SELECT
        counterstrike_bets.id,
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
    // console.log(bets.rows);
    return bets.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  } finally {
    await client.release();
  }
}

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
  const betsLength = Object.keys(bets).length;
  console.log(bets);

  // Switch to relational database since upcoming matches also won't exist

  // do some sorting

  // pending bets

  // submitted bets

  // completed bets

  // what were the outcomes

  // how much money is tied up in bets?

  return (
    <main>
      <h1 className={`mb-4 text-x1 md:text-2x1`}>You bets on CounterStrike Matches</h1>
      {betsLength ? <></> : <p>You haven't placed bets on any matches yet</p>}
      <Stack spacing={3}>
        {bets.map(bet => {
          // get team from opponents
          const teamThatWasBetOn: Team = bet.opponents.find(team => bet.team_id == team.id);
          return (
            <div key={bet.id}>
              <Stack spacing={4} alignItems="center">
                <ViewCounterStrikeBet
                  matchScheduledAt={formatDateToLocalWithTime(bet.scheduled_at).toString()}
                  tournamentSlug={bet.tournament_slug}
                  team1Acronym={bet.opponents[0].acronym}
                  team2Acronym={bet.opponents[1].acronym}
                  team1ImageUrl={bet.opponents[0].image_url}
                  team2ImageUrl={bet.opponents[1].image_url}
                  teamThatWasBetOnAcronym={teamThatWasBetOn.acronym}
                  teamThatWasBetOnImageUrl={teamThatWasBetOn.image_url}
                ></ViewCounterStrikeBet>
              </Stack>
            </div>
          );
        })}
      </Stack>
    </main>
  );
}
