'use client';

import React from 'react';
import Footer from '../components/Footer';
import Login from '@/app/ui/login';

// import Hero from '../components/Hero';
// import Content from '../components/Content';

export default function Index() {
  return (
    <>
      {/* <Hero /> */}
      <h1>Let's Bet</h1>
      <hr />
      <Login></Login>
      <Footer />
      {/* <Content /> */}
    </>
  );
}
