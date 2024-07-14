'use client'
import { useState } from 'react'
import SideNav from '@/app/ui/dashboard/sidenav';
import UserInfo from '@/app/ui/dashboard/userinfo';
export default function SomeExtraData({currentUser, userBalance}) {

    const [recordStatus, updateRecordStatus] = useState(null)


    return (
        <main>
            <div className="w-full flex-none md:w-64">
                <SideNav updateRecordStatus={updateRecordStatus}/>
            </div>
            <div>
                <UserInfo currentUser={currentUser} userBalance={userBalance} recordStatus={recordStatus}/>
            </div>
        </main>
    )
}