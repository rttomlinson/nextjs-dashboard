'use client';
import Stack from '@mui/material/Stack';
// import Paper from '@mui/material/Paper';
import Form from '@/app/ui/counterstrike/place-bet';
// import { useState } from 'react';
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
  // const upcomingMatches = JSON.parse(upcomingMatchesJSON);
  // const [selected, setSelected] = useState(true);
  return (
    <Stack spacing={3}>
      {Object.keys(upcomingMatches)?.map(matchId => {
        const match: Match = upcomingMatches[matchId];
        return (
          <Form
            matchId={matchId}
            team1Id={match.opponents[0].id}
            team2Id={match.opponents[1].id}
            team1Acronym={match.opponents[0].acronym}
            team2Acronym={match.opponents[1].acronym}
            match={match}
          ></Form>
        );
      })}
    </Stack>
  );
}
