'use client';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Form from '@/app/ui/counterstrike/place-bet';

import dayjs from 'dayjs';
dayjs.extend(utc);
import utc from 'dayjs/plugin/utc';

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

export default function UpcomingMatchesTable({ upcomingMatches }: { upcomingMatches: { [key: string]: Match } }) {
  // Sort by ascending scheduled_at time
  let upcomingMatchesKeys: string[] = Object.keys(upcomingMatches);
  upcomingMatchesKeys.sort((a, b) => {
    let aTime = dayjs(upcomingMatches[a].scheduled_at);
    let bTime = dayjs(upcomingMatches[b].scheduled_at);
    if (aTime.isBefore(bTime)) return -1;
    else return 1;
  });

  return (
    <Stack spacing={3}>
      {upcomingMatchesKeys.map(matchId => {
        const match: Match = upcomingMatches[matchId];
        return (
          <Paper key={matchId}>
            <Form
              key={matchId}
              matchId={matchId}
              team1Id={match.opponents[0].id}
              team2Id={match.opponents[1].id}
              team1Acronym={match.opponents[0].acronym}
              team2Acronym={match.opponents[1].acronym}
              match={match}
            ></Form>
          </Paper>
        );
      })}
    </Stack>
  );
}
