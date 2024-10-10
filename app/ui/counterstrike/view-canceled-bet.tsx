'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { formatDateToLocalWithTime } from '@/app/lib/utils';
export default function ViewCanceledCounterStrikeBet({
  matchScheduledAt,
  tournamentSlug,
  team1Acronym,
  team2Acronym,
  team1ImageUrl,
  team2ImageUrl,
  teamThatWasBetOnAcronym,
  teamThatWasBetOnImageUrl,
  // teamThatWonAcronym,
  // teamThatWonImageUrl,
  // betOutcome
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
      <div> Match was canceled. Money has been refunded.</div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Matchup</TableCell>
              <TableCell align="right">Prediction</TableCell>
              <TableCell align="right">Winner</TableCell>
              <TableCell align="right">Bet outcome</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th" scope="row">
                <Stack direction="row" spacing={4}>
                  <Stack>
                    {team1Acronym}
                    <img src={team1ImageUrl} style={{ height: '50px' }} alt={team1Acronym} title={team1Acronym}></img>
                  </Stack>
                  <div style={{ fontSize: '36px' }}>-</div>
                  <Stack>
                    {team2Acronym}
                    <img src={team2ImageUrl} style={{ height: '50px' }} alt={team2Acronym} title={team2Acronym}></img>
                  </Stack>
                </Stack>
              </TableCell>
              <TableCell align="right">
                <Stack>
                  <div>
                    <img
                      src={teamThatWasBetOnImageUrl}
                      style={{ height: '50px' }}
                      alt={teamThatWasBetOnAcronym}
                      title={teamThatWasBetOnAcronym}
                    ></img>
                  </div>
                </Stack>
              </TableCell>
              <TableCell align="right">
                <Stack>
                  <div style={{ fontSize: '36px' }}>-</div>
                </Stack>
              </TableCell>
              <TableCell align="right">
                <Stack>
                  <div>
                    <b style={{ color: 'orange' }}>canceled</b>
                  </div>
                </Stack>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
