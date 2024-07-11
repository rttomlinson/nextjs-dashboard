'use client';
import Form from '@/app/ui/bets/create-form';
import Breadcrumbs from '@/app/ui/bets/breadcrumbs';
import { cookies } from 'next/headers';
import { Button } from '@/app/ui/button'
// import { recordLocation } from '@/app/lib/actions'
import React, { FormEvent, useState } from 'react'
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat)

// const { find } = require('geo-tz');

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

export default function Page() {

    const [recordStatus, updateRecordStatus] = useState(null)
    
    async function onClick() {

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
    }

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                {
                    label: 'Record your location',
                    href: '/dashboard/locations',
                    active: true,
                },
                ]}
            />
            <h3>{recordStatus?.message}</h3>
            {/* <React.Suspense fallback="Loading..."> */}
            <Button onClick={onClick}>Record Location</Button>
            {/* </React.Suspense> */}
            {/* <form onSubmit={onSubmit}>
                <Button type="submit">
                    Record Location
                </Button> 
            </form> */}
        </main>
    );
}