import { Metadata } from 'next';
import { default as AddMoneyForm } from '@/app/ui/account/add-money-form';
import { default as ClaimDailyRewardForm } from '@/app/ui/account/claim-daily-reward';

export const metadata: Metadata = {
  title: 'Account'
};

export default async function Page() {
  return (
    <main>
      <h1 className={`mb-4 text-x1 md:text-2x1`}>Dashboard</h1>
      <h2>Your current balance is :</h2>
      <p>You can claim up to $500.00 per day.</p>
      <p>You have added $X.XX so far today.</p>
      <p>You timer resets at 00:00 UTC each day.</p>
      {/* <AddMoneyForm></AddMoneyForm> */}
      <ClaimDailyRewardForm></ClaimDailyRewardForm>
    </main>
  );
}
