import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// import { createClient } from 'redis';
const SESSION_ID_COOKIE_NAME = 'SESSION_ID';
// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (request.cookies.has(SESSION_ID_COOKIE_NAME)) {
    const mySpecialCookies = request.cookies.get(SESSION_ID_COOKIE_NAME);
    if (mySpecialCookies) {
      const sessionId = mySpecialCookies.value;
    }
  } else {
    console.log('session cookie not found');
  }

  console.log('hello middleware');
  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
};
