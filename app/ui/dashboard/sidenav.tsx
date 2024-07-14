'use client';
import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
// import AcmeLogo from '@/app/ui/acme-logo';
import { PowerIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useRouter, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
// import { signOut } from '@/auth';

import { useContext, useState } from 'react'
import AuthContext from '@/stores/authContext'

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat)

let getLocationPromise = (): Promise<GeolocationPosition> => {
  return new Promise(function (resolve, reject) {
      // Promisifying the geolocation API
      navigator.geolocation.getCurrentPosition(
          (position) => {
              resolve(position)
          }, (error) => {
              console.error(error)
              reject(error)
          })
  });
};



export default function SideNav({updateRecordStatus}) {

  const { user, setUser } = useContext(AuthContext)

  const router = useRouter();
  const onClick = () => {
    setUser(null);
    router.push('/auth/logout');
  }

  const recordLocation = async () => {
    const now = dayjs.utc();
        console.log(`before now: ${now}`)
        try {

            const position: GeolocationPosition = await getLocationPromise();
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            // const IANAtimezoneOfLocationBet = find(latitude, longitude);
            // console.log(`IANAtimezoneOfLocationBet ${IANAtimezoneOfLocationBet}`);

            const formData = new FormData()
            const response = await fetch('/api/locations', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    location: {
                        latitude: latitude,
                        longitude: longitude
                    },
                    time: {
                        epoch: 123,
                        timezone: ""
                    }
                }),
            })
            
            // Handle response if necessary
            const data = await response.json()
            console.log(data)
            const localNow = dayjs.utc().local().format('L LTS');
            updateRecordStatus({message: `Location recorded at ${localNow}`})


        } catch (err) {
            console.log("ERRRRRRRRRRRRRRR")
        }
    console.log("location recorded");
  }

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
        href="/"
      >
        <div className="w-32 text-white md:w-40">
          {/* <AcmeLogo /> */}
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        <button onClick={recordLocation} className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
          <MapPinIcon className="w-6" />
          <div className="hidden md:block">Record Location</div>
        </button>
        <button onClick={onClick} className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
          <PowerIcon className="w-6" />
          <div className="hidden md:block">Sign Out</div>
        </button>
      </div>
    </div>
  );
}
