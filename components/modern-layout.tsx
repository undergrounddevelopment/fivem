'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';
import { ScrollToTop } from './scroll-to-top';
import { AnnouncementBar } from './announcement-bar';
import { ModernFooter } from './modern-footer';
import { SponsorBanner } from './sponsor-banner';
import { useState, useEffect } from 'react';

export function ModernLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen relative safe-area-all" style={{ background: "var(--background)" }}>
      <Sidebar />
      <main className="md:ml-72 transition-all duration-300 relative z-10 main-content-responsive">
        <AnnouncementBar />
        <Header />
        <div className="min-h-screen container-responsive">
          <div className="p-3 sm:p-4 md:p-6">
            <SponsorBanner />
          </div>
          {children}
        </div>
        <ModernFooter />
      </main>

      <ScrollToTop />
    </div>
  );
}
