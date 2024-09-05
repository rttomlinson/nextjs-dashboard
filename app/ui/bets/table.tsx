'use client';
import Image from 'next/image';
// import { UpdateBet, DeleteBet } from '@/app/ui/bets/buttons';
// import BetStatus from '@/app/ui/bets/status';
import { formatDateToLocal, formatDateToLocalWithTime, formatDateToLocalWithTimeAndCoordinates } from '@/app/lib/utils';

// import Link from 'next/link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';

function createData(name: string, calories: number, fat: number, carbs: number, protein: number) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9)
];

export default function BetsTable({ query, currentPage, bets }: { query: string; currentPage: number; bets: any }) {
  return (
    <section>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Amount</TableCell>
              <TableCell align="right">Submitted Date</TableCell>
              <TableCell align="right">Expiration Date</TableCell>
              <TableCell align="right">Location (latitude, longitude)</TableCell>
              <TableCell align="right">Status</TableCell>
              <TableCell align="right">Outcome</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bets?.map(bet => (
              <TableRow key={bet.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell align="right">
                  {(bet.amount / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </TableCell>
                <TableCell align="right">{formatDateToLocalWithTime(bet.created_time)}</TableCell>
                <TableCell align="right">{formatDateToLocalWithTime(bet.expiration_date)}</TableCell>
                <TableCell align="right">{`${bet.location.x}, ${bet.location.y}`}</TableCell>
                <TableCell align="right">{bet.status}</TableCell>
                <TableCell align="right">{bet.outcome}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button href="/dashboard/bets/create">Create new bet</Button>
    </section>
  );
}
