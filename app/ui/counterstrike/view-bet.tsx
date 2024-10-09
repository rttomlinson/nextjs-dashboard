'use client';

import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import { formatDateToLocalWithTime } from '@/app/lib/utils';

export default function ViewCounterStrikeBet({
  matchScheduledAt,
  tournamentSlug,
  team1Acronym,
  team2Acronym,
  team1ImageUrl,
  team2ImageUrl,
  teamThatWasBetOnAcronym,
  teamThatWasBetOnImageUrl,
  fullyQualifiedTournamentName
}: {
  matchScheduledAt: string;
  tournamentSlug: string;
  team1Acronym: string;
  team2Acronym: string;
  team1ImageUrl: string;
  team2ImageUrl: string;
  teamThatWasBetOnAcronym: string;
  teamThatWasBetOnImageUrl: string;
  fullyQualifiedTournamentName: string;
}) {
  return (
    <Paper>
      <div>
        <b>Tournament:</b> {fullyQualifiedTournamentName ? fullyQualifiedTournamentName : tournamentSlug}
      </div>
      <div>
        <b>Scheduled at:</b> {formatDateToLocalWithTime(matchScheduledAt)}
      </div>
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={4}>
        <Stack alignItems="center">
          {team1Acronym}
          <img src={team1ImageUrl} style={{ height: '50px' }}></img>
        </Stack>
        <div style={{ fontSize: '36px' }}>-</div>
        <Stack alignItems="center">
          {team2Acronym}
          <img src={team2ImageUrl} style={{ height: '50px' }}></img>
        </Stack>
      </Stack>
      You bet on {teamThatWasBetOnAcronym} to take the series
      <img src={teamThatWasBetOnImageUrl} style={{ height: '50px' }}></img>
    </Paper>
  );
}
