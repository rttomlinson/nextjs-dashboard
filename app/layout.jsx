
import './globals.css';
import { Container } from 'reactstrap';
import Footer from '../components/Footer';
import React from 'react';
// import { UserProvider } from '@auth0/nextjs-auth0/client';
import Login from '@/app/ui/login';
import { cookies } from 'next/headers'
const SESSION_ID_COOKIE_NAME = 'SESSION_ID';
import { AuthContextProvider } from '../stores/authContext'
import {NextUIProvider} from "@nextui-org/system";
import { createClient } from 'redis';

async function getSessionData(sessionId){
  try {
    const redisClient = createClient(
      {
        url: process.env.KV_URL || 'redis://localhost:6379',
        socket: {
            tls: process.env.KV_USE_TLS ? true : false
        }
      }
    );

    redisClient.on('error', err => console.log('Redis Client Error', err));
    await redisClient.connect();

    const value = await redisClient.hGetAll(sessionId);
    await redisClient.quit();
    // if session is not found then log user out
    return value.name;
  } catch (err) {
    console.log(err)
    return null
  }
}

export default function RootLayout({ children }) {

  // const [state, setState] = useState({loggedIn: false})
  // Is this a login attempt? (Is there an existing session?) Where should we redirect the user?
  console.log("inside RootLayout");
  const cookieStore = cookies()
  const sessionIdCookie = cookieStore.get(SESSION_ID_COOKIE_NAME)
  let currentUser;
  if (!(sessionIdCookie && sessionIdCookie.value != '')) {
    currentUser = null; // No user
  } else {
    currentUser = React.use(getSessionData(sessionIdCookie.value));
    currentUser = currentUser ? currentUser : null
  }
  console.log("i'm a server component")
  

  return (
    <html lang="en">
      <head>
        {/* <link
          rel="stylesheet"
          href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
          integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
          crossOrigin="anonymous"
        /> */}
        { /* <link rel="stylesheet" href="https://cdn.auth0.com/js/auth0-samples-theme/1.0/css/auth0-theme.min.css" /> */}
      </head>
      <body>
        <NextUIProvider>
          <AuthContextProvider currentUser={currentUser}>
            <main id="app" className="d-flex flex-column h-100" data-testid="layout">
              {/* <NavBar /> */}
              {/* <Container className="flex-grow-1 mt-5">{children}</Container> */}
              <h1>Top level layout</h1>
              <Container>{children}</Container>
            </main>
          </AuthContextProvider>

        </NextUIProvider>
        
      </body>
    </html>
  );
}
