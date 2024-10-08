'use client';

import { useFormState } from 'react-dom';
// import { useState, useRef, useEffect } from 'react';
import { placeCounterStrikeBet } from '@/app/lib/actions';
import { styled } from '@mui/material/styles';

import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import React from 'react';
import { useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

import Grid from '@mui/material/Grid2';

import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';
// import VolumeUp from '@mui/icons-material/VolumeUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const Input = styled(MuiInput)`
  width: 64px;
`;

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

const Item = styled(Box)(({ theme }) => ({
  backgroundColor: '#fff',
  // ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary
  // ...theme.applyStyles('dark', {
  //   backgroundColor: '#1A2027'
  // })
}));

export default function Form(props: {
  matchId: string;
  team1Id: string;
  team2Id: string;
  team1Acronym: string;
  team2Acronym: string;
  match: Match;
}) {
  // TODO: Make it so you can't specify the team nor the matchId directly
  const initialState = { errors: {}, message: null };
  const [state, dispatch] = useFormState(placeCounterStrikeBet, initialState);

  const defaultSelectedTeamLogoImage = 'team1LogoImage';
  const [selected, setSelected] = useState(defaultSelectedTeamLogoImage);

  // console.log(state);
  const matchId = props.matchId;

  const [value, setValue] = React.useState<number | string>(500);

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // setValue(event.target.value === '' ? 0 : Number(event.target.value));
    setValue(event.target.value === '' ? '' : Number(event.target.value));
  };

  // const handleBlur = () => {
  //   if (value < 0) {
  //     setValue(0);
  //   } else if (value > 100) {
  //     setValue(100);
  //   }
  // };

  return (
    <Paper key={matchId}>
      <Stack>
        <div>
          <b>Tournament:</b>{' '}
          {props.match.fully_qualified_tournament_name
            ? props.match.fully_qualified_tournament_name
            : props.match.tournament_slug}
        </div>
        <div>
          <b>Scheduled at:</b> {props.match.scheduled_at}
        </div>

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
          <form action={dispatch}>
            <input type="hidden" name="matchId" value={props.matchId} />

            <Grid container spacing={2}>
              <Box sx={{ width: '100%' }}>
                <Typography id="input-slider" gutterBottom>
                  Bet amount
                </Typography>
                <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                  <Grid>
                    <AttachMoneyIcon />
                  </Grid>
                  <Grid>
                    <Input
                      disabled={true}
                      value={value}
                      size="small"
                      onChange={handleInputChange}
                      // onBlur={handleBlur}
                      inputProps={{
                        step: 1,
                        min: 1,
                        max: 1000,
                        type: 'text',
                        'aria-labelledby': 'input-slider'
                      }}
                    />
                  </Grid>
                  <Grid size={6}>
                    <Slider
                      disabled={true}
                      value={typeof value === 'number' ? value : 0}
                      onChange={handleSliderChange}
                      aria-labelledby="input-slider"
                      step={10}
                      min={1}
                      max={1000}
                    />
                  </Grid>
                </Grid>
              </Box>
              <Grid size={12}>
                <Item>
                  <Stack direction="row" justifyContent="center" alignItems="center" spacing={4}>
                    <Stack alignItems="center">
                      {props.match.opponents[0].acronym}
                      <Paper id="team1Logo" elevation={selected == 'team1LogoImage' ? 0 : 0}>
                        <img
                          id="team1LogoImage"
                          src={props.match.opponents[0].image_url}
                          style={{ height: '50px' }}
                        ></img>
                      </Paper>
                    </Stack>
                    <div style={{ fontSize: '36px' }}>-</div>
                    <Stack alignItems="center">
                      {props.match.opponents[1].acronym}
                      <Paper id="team1Logo" elevation={selected == 'team2LogoImage' ? 0 : 0}>
                        <img
                          id="team2LogoImage"
                          src={props.match.opponents[1].image_url}
                          style={{ height: '50px' }}
                        ></img>
                      </Paper>
                    </Stack>
                  </Stack>
                </Item>
              </Grid>

              <Grid size={12} display="flex">
                <Item style={{ flexGrow: 1 }}>
                  <Button style={{ width: '100%' }} value="banana" type="submit" variant="contained" name="teamId">
                    Bet
                  </Button>
                </Item>
                <Item style={{ flexGrow: 1 }}>
                  <Button
                    style={{ width: '100%' }}
                    color="secondary"
                    value="pineapple"
                    type="submit"
                    variant="contained"
                    name="teamId"
                  >
                    Bet
                  </Button>
                </Item>
              </Grid>
            </Grid>
          </form>
        </div>
      </Stack>
    </Paper>
  );
}
