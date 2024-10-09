'use client';

import Box from '@mui/material/Box';

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
    <Box>
      <div>
        <b>Tournament:</b> {fullyQualifiedTournamentName ? fullyQualifiedTournamentName : tournamentSlug}
      </div>
      <div>
        <b>Scheduled at:</b> {matchScheduledAt}
      </div>
      <img src={team1ImageUrl} style={{ height: '50px' }}></img>
      <div style={{ fontSize: '36px' }}>-</div>
      <img src={team2ImageUrl} style={{ height: '50px' }}></img>
      Bet was canceled. Money has been refunded.
    </Box>
  );
}
