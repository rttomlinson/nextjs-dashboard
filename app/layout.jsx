import { Container } from 'reactstrap';
import React from 'react';
import { AuthContextProvider } from '../stores/authContext';

import { getUser } from '@/app/lib/actions';
// import HeaderMenu from '@/app/ui/dashboard/header-menu';
import Sidenav from '@/app/ui/dashboard/sidenav';

export default function RootLayout({ children }) {
  console.log('inside RootLayout');
  let currentUser = null;
  let userProfileImage = null;

  let userInfo = React.use(getUser());

  currentUser = userInfo['currentUser'];
  userProfileImage = currentUser?.image || 'some placeholder images';
  currentUser = currentUser ? currentUser : null;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
        />
      </head>
      <body>
        <AuthContextProvider currentUser={JSON.stringify(currentUser)}>
          {/* <HeaderMenu /> */}
          <Sidenav>{children}</Sidenav>
          {/* <Container>{children}</Container> */}
        </AuthContextProvider>
      </body>
    </html>
  );
}
