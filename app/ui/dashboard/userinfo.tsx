'use client'
export default function UserInfo({currentUser, userBalance, recordStatus}) {

    return (
        <main>
            <h1 className={`mb-4 text-x1 md:text-2x1`}>User</h1>
            <h2>Hello, {currentUser}</h2>
            <h3>Your current balance is {(userBalance / 100).toLocaleString("en-US", { style: "currency", currency: "USD"})}</h3>
            
            <h3>{recordStatus?.message}</h3>

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
            )
}