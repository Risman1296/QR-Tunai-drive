'use client';
import dynamic from 'next/dynamic';

export const ClientContent = dynamic(
    () => import('./home-page-client').then(mod => mod.HomePageClient),
    { ssr: false }
);
