'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';
import { ScrollToTop } from './scroll-to-top';
import { AnnouncementBar } from './announcement-bar';
import { ModernFooter } from './modern-footer';
import { SponsorBanner } from './sponsor-banner';
import { useMemo } from 'react';

export function ModernLayout({ children }: { children: React.ReactNode }) {
  // Generate snowflakes - optimized for better performance
  const snowflakes = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 15 + 15}s`,
      animationDelay: `${Math.random() * 15}s`,
      size: Math.random() * 6 + 3,
      opacity: Math.random() * 0.4 + 0.1,
    }));
  }, []);

  return (
    <div className="min-h-screen relative" style={{ background: "var(--background)" }}>
      {/* Snowfall Effect */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="absolute animate-snowfall"
            style={{
              left: flake.left,
              top: '-20px',
              animationDuration: flake.animationDuration,
              animationDelay: flake.animationDelay,
              opacity: flake.opacity,
            }}
          >
            <svg
              width={flake.size}
              height={flake.size}
              viewBox="0 0 24 24"
              fill="white"
              className="drop-shadow-sm"
            >
              <path d="M12 0L12 24M0 12L24 12M3.5 3.5L20.5 20.5M20.5 3.5L3.5 20.5" 
                stroke="white" 
                strokeWidth="1.5" 
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="12" cy="12" r="2" fill="white" />
            </svg>
          </div>
        ))}
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />
      </div>

      <Sidebar />
      <main className="md:ml-72 transition-all duration-300 relative z-10">
        <AnnouncementBar />
        <Header />
        <div className="min-h-screen p-4 md:p-6">
          <SponsorBanner />
          {children}
        </div>
        <ModernFooter />
      </main>
      
      <ScrollToTop />
    </div>
  );
}