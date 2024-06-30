import Form from '@/app/ui/bets/create-form';
import Breadcrumbs from '@/app/ui/bets/breadcrumbs';
import { cookies } from 'next/headers';


export default async function Page() {
    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                { label: 'My Bets', href: '/dashboard/bets' },
                {
                    label: 'Place new bet',
                    href: '/dashboard/bets/create',
                    active: true,
                },
                ]}
            />
            <Form></Form>
        </main>
    );
}