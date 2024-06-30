'use client';
import { redirect } from 'next/navigation'
import { login, logout } from '@/app/lib/actions';
import { cookies } from 'next/headers'
import { useContext } from 'react'
import AuthContext from '@/stores/authContext'

export default function Login() {

  const { user, setUser } = useContext(AuthContext)
  console.log(`inside login client component: got user from AuthContext ${user}`)


  let session = {user: user};

  return (
      <section>
        {user ? <pre>{JSON.stringify(session, null, 2)}</pre> : <form
          action={login}
        >
          {/* <input type="email" name="email" placeholder="Email" /> */}
          {/* <br /> */}
          <button type="submit">Login</button>
        </form>}
        {/* <form
          action={async () => {
            "use server";
            await logout();
            redirect("/");
          }}
        >
          <button type="submit">Logout</button>
        </form> */}
      </section>
  );
}

