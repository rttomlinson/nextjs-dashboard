'use client';

import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';

export default function ViewCompletedCounterStrikeBet({
  matchScheduledAt,
  tournamentSlug,
  team1Acronym,
  team2Acronym,
  team1ImageUrl,
  team2ImageUrl,
  teamThatWasBetOnAcronym,
  teamThatWasBetOnImageUrl,
  teamThatWonAcronym,
  teamThatWonImageUrl,
  betOutcome
}: {
  matchScheduledAt: string;
  tournamentSlug: string;
  team1Acronym: string;
  team2Acronym: string;
  team1ImageUrl: string;
  team2ImageUrl: string;
  teamThatWasBetOnAcronym: string;
  teamThatWasBetOnImageUrl: string;
  teamThatWonAcronym: string;
  teamThatWonImageUrl: string;
  betOutcome: string;
}) {
  return (
    <Paper>
      <div>Tournament name: {tournamentSlug}</div>
      <div>Scheduled at: {matchScheduledAt}</div>
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={4}>
        <Stack alignItems="center">
          {team1Acronym}
          <Paper>
            <img src={team1ImageUrl} style={{ height: '50px' }}></img>
          </Paper>
        </Stack>
        <div style={{ fontSize: '36px' }}>-</div>
        <Stack alignItems="center">
          {team2Acronym}
          <Paper>
            <img src={team2ImageUrl} style={{ height: '50px' }}></img>
          </Paper>
        </Stack>
      </Stack>
      <div>
        You bet on {teamThatWasBetOnAcronym} to take the series
        <img src={teamThatWasBetOnImageUrl} style={{ height: '50px' }}></img>
      </div>
      <div>
        {teamThatWonAcronym} took the series
        <img src={teamThatWonImageUrl} style={{ height: '50px' }}></img>
      </div>
      Bet was {betOutcome}
    </Paper>
  );
}
