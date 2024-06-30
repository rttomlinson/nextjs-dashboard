'use client';
import { createContext, useState, useEffect } from 'react';

const AuthContext = createContext({
  user: null,
  setUser: user => user,
  login: () => {},
  logout: () => {},
  authReady: false
});

export const AuthContextProvider = ({ children, currentUser }) => {
  const [user, setUser] = useState(currentUser);
  const value = { user, setUser };

  console.log(`authcontextprovider: client component authcontextprovider ${user}`);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
