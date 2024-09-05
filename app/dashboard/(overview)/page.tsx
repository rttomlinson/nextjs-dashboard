import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard'
};

export default async function Page() {
  return (
    <main>
      <h1 className={`mb-4 text-x1 md:text-2x1`}>Dashboard</h1>
      <h2>Nothing to show right now. ;(</h2>
    </main>
  );
}
