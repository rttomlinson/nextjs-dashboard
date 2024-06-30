'use client';
import Image from 'next/image';
// import { UpdateBet, DeleteBet } from '@/app/ui/bets/buttons';
// import BetStatus from '@/app/ui/bets/status';
import { formatDateToLocal, formatDateToLocalWithTime, formatDateToLocalWithTimeAndCoordinates } from '@/app/lib/utils';

import Link from 'next/link'

export default function BetsTable({
  query,
  currentPage,
  bets
}: {
  query: string;
  currentPage: number;
  bets: any
}) {

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {bets?.map((bet) => (
              <div
                key={bet.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <Image
                        src={bet.image_url}
                        className="mr-2 rounded-full"
                        width={28}
                        height={28}
                        alt={`${bet.name}'s profile picture`}
                      />
                      <p>{bet.name}</p>
                    </div>
                    <p className="text-sm text-gray-500">{bet.email}</p>
                  </div>
                  {/* <BetStatus status={bet.status} /> */}
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">
                      {bet.amount}
                    </p>
                    <p>{formatDateToLocalWithTime(bet.created_time)}</p>
                  </div>
                  {/* <div className="flex justify-end gap-2">
                    <UpdateBet id={bet.id} />
                    <DeleteBet id={bet.id} />
                  </div> */}
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Customer
                </th>
                {/* <th scope="col" className="px-3 py-5 font-medium">
                  Email
                </th> */}
                <th scope="col" className="px-3 py-5 font-medium">
                  Amount
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Date
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Expiration Date
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Location (latitude, longitude)
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Outcome
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {bets?.map((bet) => (
                <tr
                  key={bet.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={bet.image_url}
                        className="rounded-full"
                        width={28}
                        height={28}
                        alt={`${bet.name}'s profile picture`}
                      />
                      <p>{bet.name}</p>
                    </div>
                  </td>
                  {/* <td className="whitespace-nowrap px-3 py-3">
                    {bet.email}
                  </td> */}
                  <td className="whitespace-nowrap px-3 py-3">
                    {bet.amount}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocalWithTime(bet.created_time)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocalWithTimeAndCoordinates(bet.expiration_date, bet.IANAtimezone)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {`${bet.location.x}, ${bet.location.y}`}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {bet.status}
                    {/* <BetStatus status={bet.status} /> */}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {bet.outcome || "-"}
                    {/* <BetStatus status={bet.outcome} /> */}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      {/* <UpdateBet id={bet.id} />
                      <DeleteBet id={bet.id} /> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex justify-left gap-4">
          <Link href="/dashboard/bets/create" className='flex h-10 items-center rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50'
>Create new bet</Link>
        </div>
      </div>
    </div>
  );
}
