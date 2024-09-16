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
  currentUser = JSON.parse(currentUser);
  console.log(`authcontextprovider before update`);
  console.log(currentUser);
  const [user, setUser] = useState(currentUser);
  const value = { user, setUser };

  console.log(`authcontextprovider after update`);
  console.log(user);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
