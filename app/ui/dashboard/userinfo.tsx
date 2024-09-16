'use client';
import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation';

import { unstable_noStore } from 'next/cache';

export default function UserInfo({ currentUser, userBalance }) {
  const router = useRouter();
  unstable_noStore();

  return (
    <main>
      <h3>Hello, {currentUser}</h3>
      <p>
        Your current balance is {(userBalance / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
      </p>
      {userBalance === 0 ? (
        <div>
          <p>You have no monies</p>
          <Button variant="outlined" onClick={() => router.push('/account')}>
            Click here to add more money!!!
          </Button>
        </div>
      ) : (
        <></>
      )}

      {/* <h3>{recordStatus?.message}</h3> */}

      {/* <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Suspense fallback={<CardsSkeleton />}>
                    <CardWrapper/>
                </Suspense>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
                <Suspense fallback={<RevenueChartSkeleton />}>
                    <RevenueChart />
                </Suspense>
                <Suspense fallback={<LatestInvoicesSkeleton />}>
                    <LatestInvoices />
                </Suspense>
            </div> */}
    </main>
  );
}
