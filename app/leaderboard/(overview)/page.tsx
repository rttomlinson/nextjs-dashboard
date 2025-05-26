import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { unstable_noStore } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
const SESSION_ID_COOKIE_NAME = 'SESSION_ID';
import { getAllBalances, getApplicationUserSessionData } from '@/app/lib/actions';

const { createHash } = require('node:crypto');

export default async function Page() {
  const cookieStore = await cookies();
  const sessionIdCookie = cookieStore.get(SESSION_ID_COOKIE_NAME);
  if (!(sessionIdCookie && sessionIdCookie.value != '')) {
    redirect('/');
  }
  const value = await getApplicationUserSessionData(sessionIdCookie.value);
  if (!value['user_id']) {
    redirect('/');
  }
  const userId = value['user_id'];
  let balances = await getAllBalances();

  balances = balances.map((balance, iterator) => {
    const hash = createHash('sha256');

    hash.update(balance['user_id']);
    return {
      ...balance,
      ranking: iterator + 1,
      name: hash.digest('hex').substring(0, 12),
      isUser: balance['user_id'] == userId
    };
  });
  console.log(balances);
  unstable_noStore();

  return (
    <main>
      <h2>Leaderboard</h2>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 50 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Ranking</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {balances.map(row => (
              <TableRow
                key={row.ranking}
                sx={{
                  backgroundColor: row.isUser ? '#d1c4e9' : 'white',
                  '&:last-child td, &:last-child th': { border: 0 }
                }}
              >
                <TableCell component="th" scope="row">
                  {row.isUser ? <b>{row.ranking + ' (You)'}</b> : <span>{row.ranking}</span>}
                </TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>
                  {(row.balance / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </main>
  );
}
