import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import MobileBottomNav from '../MobileBottomNav';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pb-24 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Layout;