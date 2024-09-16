'use client';
import { login, logout } from '@/app/lib/actions';
import { useContext } from 'react';
import AuthContext from '@/stores/authContext';
import Button from '@mui/material/Button';

export default function Login() {
  const { user, setUser } = useContext(AuthContext);
  console.log(`inside login client component: got user from AuthContext ${user}`);

  let session = { user: user };

  return (
    <section>
      {user ? (
        <pre>{JSON.stringify(session, null, 2)}</pre>
      ) : (
        <Button variant="outlined" color="inherit" onClick={() => login(new FormData())}>
          Login
        </Button>
        // <form action={login}>
        //   <button type="submit">Login</button>
        // </form>
      )}
    </section>
  );
}
