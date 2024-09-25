'use client';

import { useFormState } from 'react-dom';
import { useState, useRef, useEffect } from 'react';
import { placeCounterStrikeBet } from '@/app/lib/actions';

import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';

import React from 'react';

import Button from '@mui/material/Button';

export default function Form(props: { matchId: string; team1Id: string; team2Id: string }) {
  // TODO: Make it so you can't specify the team nor the matchId directly
  const initialState = { errors: {}, message: null };
  const [state, dispatch] = useFormState(placeCounterStrikeBet, initialState);
  console.log(state);

  return (
    <div>
      {state.message && Object.keys(state.errors).length === 0 ? (
        <Alert icon={<CheckIcon fontSize="inherit" />} severity="success">
          Bet was successfully placed.
        </Alert>
      ) : state.errors?.amount ? (
        <Alert icon={<CheckIcon fontSize="inherit" />} severity="error">
          {state.errors?.amount}
        </Alert>
      ) : (
        <></>
      )}
      <div style={{ display: 'flex' }}>
        <form action={dispatch} style={{ display: 'flex', justifyContent: 'center' }}>
          <input type="hidden" name="matchId" value={props.matchId} />
          <input type="hidden" name="teamId" value={props.team1Id} />
          <Button type="submit" variant="contained">
            Bet that team1 takes the series
          </Button>
        </form>
        <form action={dispatch} style={{ display: 'flex', justifyContent: 'center' }}>
          <input type="hidden" name="matchId" value={props.matchId} />
          <input type="hidden" name="teamId" value={props.team2Id} />
          <Button type="submit" variant="contained">
            Bet that team2 takes the series
          </Button>
        </form>
      </div>
    </div>
  );
}
