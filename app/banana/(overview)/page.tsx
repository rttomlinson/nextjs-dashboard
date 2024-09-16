// 'use client';
import { Metadata } from 'next';
import Button from '@mui/material/Button';
import Form from '@/app/ui/account/add-money-form';

export const metadata: Metadata = {
  title: 'Banana'
};

export default async function Page() {
  return (
    <main>
      <h1 className={`mb-4 text-x1 md:text-2x1`}>Banana</h1>
      <h2>Your current balance is :</h2>
      <p>You can claim up to $500.00 per day.</p>
      <p>You have added $X.XX so far today.</p>
      <p>You timer resets at 00:00 UTC.</p>
      <Form></Form>
      {/* <Button variant="outlined" onClick={() => alert('Adding money for realz ;)')}>
        Click here to add $500.00 to your account
      </Button> */}
    </main>
  );
}
