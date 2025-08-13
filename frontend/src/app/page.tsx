'use client';

import React from 'react';
import Navbar from '@/components/Layout/Navbar';
import HomePage from '@/components/HomePage/HomePage';

export default function Home() {
  const handleDemoLogin = () => {
    // デモログインの処理をここに実装
    console.log('Demo login clicked');
  };

  return (
    <>
      <Navbar 
        isAuthenticated={false}
        onDemoLogin={handleDemoLogin}
      />
      <HomePage />
    </>
  );
}
