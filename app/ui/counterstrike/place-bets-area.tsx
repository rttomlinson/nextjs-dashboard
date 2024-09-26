'use client';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Form from '@/app/ui/counterstrike/place-bet';

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
export default function UpcomingMatchesTable({ upcomingMatches }: { upcomingMatches: { [key: string]: Match } }) {
  // const upcomingMatches = JSON.parse(upcomingMatchesJSON);
  return (
    <Stack spacing={3}>
      {Object.keys(upcomingMatches)?.map(matchId => {
        const match: Match = upcomingMatches[matchId];
        return (
          <div key={matchId}>
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
                <Stack>
                  <Form matchId={matchId} team1Id={match.opponents[0].id} team2Id={match.opponents[1].id}></Form>
                </Stack>
              </Paper>
            </Stack>
          </div>
        );
      })}
    </Stack>
  );
}
