// 'use client';
import { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';

export const metadata: Metadata = {
  title: 'Banana'
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

// Get upcoming matches
import { createClient } from 'redis';
const redisUrl = process.env.KV_URL || 'redis://localhost:6379';
const client = createClient({
  url: redisUrl,
  socket: {
    tls: process.env.KV_USE_TLS ? true : false
  }
});
export default async function Page() {
  let upcomingmatches;
  try {
    await client.connect();
    upcomingmatches = (await client.json.get('upcomingmatches')) as Match;
    // if sessionId is not found, then an null object is returned
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    await client.quit();
  }

  return (
    <main>
      <h1 className={`mb-4 text-x1 md:text-2x1`}>Banana</h1>
      {upcomingmatches ? <></> : <p>No upcoming matches</p>}
      <Stack spacing={3}>
        {Object.keys(upcomingmatches).map(match_id => {
          const match = upcomingmatches[match_id];
          return (
            <div>
              <Stack spacing={4} alignItems="center">
                <Paper>
                  <div>Tournament name: {match.tournament_slug}</div>
                  <div>Scheduled at: {match.scheduled_at}</div>
                  <Stack direction="row" justifyContent="center" alignItems="center" spacing={4}>
                    <Stack alignItems="center">
                      {match.opponents[0].acronym}
                      <Paper>
                        <img src={match.opponents[0].image_url} style={{ height: '50px' }}></img>
                      </Paper>
                    </Stack>
                    <div>VS</div>
                    <Stack alignItems="center">
                      {match.opponents[1].acronym}
                      <Paper>
                        <img src={match.opponents[1].image_url} style={{ height: '50px' }}></img>
                      </Paper>
                    </Stack>
                  </Stack>
                  <Stack useFlexGap>
                    <Button variant="contained">Bet on this match</Button>
                  </Stack>
                </Paper>
              </Stack>
            </div>
          );
        })}
      </Stack>
    </main>
  );
}
