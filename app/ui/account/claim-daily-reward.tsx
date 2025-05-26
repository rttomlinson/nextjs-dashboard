'use client';
import { useActionState } from 'react';

import { claimDailyReward } from '@/app/lib/actions';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

export default function Form() {
  const initialState = { errors: {}, message: null };
  const [state, dispatch] = useActionState(claimDailyReward, initialState);
  return (
    <main>
      <form action={dispatch}>
        <Button variant="outlined" type="submit">
          Click me to claim your daily $500.
        </Button>
        <div id="dailys-reward-error" aria-live="polite" aria-atomic="true">
          {state.errors?.rewards &&
            state.errors?.rewards.map((error: string) => (
              <Alert key={error} severity="error">
                {error}
              </Alert>
            ))}
        </div>
      </form>
    </main>
  );
}
