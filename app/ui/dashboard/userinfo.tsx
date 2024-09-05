'use client';
export default function UserInfo({ currentUser, userBalance }) {
  return (
    <main>
      <h3>Hello, {currentUser}</h3>
      <p>
        Your current balance is {(userBalance / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
      </p>

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
