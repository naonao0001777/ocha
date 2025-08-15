'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function Admin() {
  const router = useRouter();
  React.useEffect(() => {
    router.replace('/profile');
  }, [router]);
  return null;
}