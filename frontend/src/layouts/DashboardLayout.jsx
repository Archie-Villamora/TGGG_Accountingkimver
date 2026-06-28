import React, { useRef, useState, useEffect } from 'react';
import PublicNavigation from '../pages/dashboards/Public_Dashboard/PublicNavigation';
import Sidebar from './Sidebar';
import { getSidebarConfig } from './sidebarConfig';
import AnnouncementBar from '../components/AnnouncementBar';

export default function DashboardLayout({
  user,
  currentPage,
  onNavigate,
  onLogout,
  children,
  hideSidebar = false,
  className = '',
}) {
  const sidebarSections = getSidebarConfig(user?.role);
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(112); // Default pt-28 fallback
  
  const isSidebarDriven =
    user?.role === 'bim_specialist' ||
    user?.role === 'junior_architect' ||
    user?.role === 'site_engineer' ||
    user?.role === 'site_coordinator' ||
    user?.role === 'intern' ||
    user?.role === 'ceo' ||
    user?.role === 'studio_head';

  const showSidebar = !hideSidebar && isSidebarDriven;

  const defaults = {
    ceo: 'ceo-dashboard',
    studio_head: 'approvals',
    accounting: 'dashboard',
    site_engineer: 'attendance',
    site_coordinator: 'attendance',
    bim_specialist: 'attendance',
    junior_architect: 'attendance',
    intern: 'attendance',
    employee: 'attendance',
  };
  const isLandingPage = currentPage === defaults[user?.role] || (user?.role === 'accounting' && currentPage === 'dashboard');

  useEffect(() => {
    if (!headerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeaderHeight(entry.target.offsetHeight);
      }
    });
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#00273C] relative">
      <div ref={headerRef} className="fixed top-0 left-0 w-full z-50 flex flex-col">
        <AnnouncementBar user={user} />
        <PublicNavigation
          onNavigate={onNavigate}
          currentPage={currentPage}
          user={user}
          onLogout={onLogout}
          fixed={false}
        />
      </div>

      <div className="relative px-3 sm:px-6 pb-10" style={{ paddingTop: `calc(${headerHeight}px + 2rem)` }}>
        <div className={`w-full flex flex-col lg:flex-row gap-6 ${className}`}>
          {showSidebar && sidebarSections && sidebarSections.length > 0 && (
            <aside className="w-64 shrink-0 hidden lg:block">
              <Sidebar
                sections={sidebarSections}
                currentPage={currentPage}
                onNavigate={onNavigate}
                role={user?.role}
              />
            </aside>
          )}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
