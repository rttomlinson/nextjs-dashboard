'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import { formatDateToLocalWithTime } from '@/app/lib/utils';
export default function ViewCanceledCounterStrikeBet({
  matchScheduledAt,
  tournamentSlug,
  // team1Acronym,
  // team2Acronym,
  team1ImageUrl,
  team2ImageUrl,
  // teamThatWasBetOnAcronym,
  // teamThatWasBetOnImageUrl,
  // teamThatWonAcronym,
  // teamThatWonImageUrl,
  // betOutcome
  fullyQualifiedTournamentName
}: {
  matchScheduledAt: string;
  tournamentSlug: string;
  // team1Acronym: string;
  // team2Acronym: string;
  team1ImageUrl: string;
  team2ImageUrl: string;
  // teamThatWasBetOnAcronym: string;
  // teamThatWasBetOnImageUrl: string;
  // teamThatWonAcronym: string;
  // teamThatWonImageUrl: string;
  // betOutcome: string;
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
      <img src={team1ImageUrl} style={{ height: '50px' }}></img>
      <div style={{ fontSize: '36px' }}>-</div>
      <img src={team2ImageUrl} style={{ height: '50px' }}></img>
      Match was canceled. Money has been refunded.
    </Paper>
  );
}
