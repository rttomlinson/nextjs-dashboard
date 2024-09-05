import Form from '@/app/ui/bets/create-form';

import { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Create bet'
};

export default async function Page() {
  return (
    <main>
      <h1>Create bet</h1>
      <Form></Form>
    </main>
  );
}
