'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearAdminKey } from '@/lib/adminApi';

const NAV = [
  { label: 'Overview', href: '/overview' },
  { label: 'Members', href: '/users' },
  { label: 'Segments', href: '/segments' },
  { label: 'Campaigns', href: '/campaigns' },
  { label: 'Events', href: '/events' },
  { label: 'News corner', href: '/news' },
  { label: 'Hukamnama', href: '/hukamnama' },
  { label: 'Nominations', href: '/nominations' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  // Below lg the sidebar is an off-canvas drawer toggled by the hamburger
  // button; at lg+ it's always-visible and static, same as before this was added.
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-30 w-10 h-10 rounded-lg bg-navy text-white flex items-center justify-center shadow-md"
        aria-label="Open menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>

      {open ? (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
      ) : null}

      <aside
        className={`w-72 max-w-[85vw] lg:w-60 lg:max-w-none bg-navy text-white flex flex-col shrink-0 min-h-screen fixed inset-y-0 left-0 z-50 overflow-y-auto transform transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 pt-6 pb-5 border-b border-white/10 flex items-start justify-between">
          <div>
            <div className="text-xs tracking-wide text-white/50 uppercase">The Sikh Group</div>
            <div className="text-xl font-bold mt-1">
              Sikh ID <span className="text-saffron">Admin</span>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-white/60 hover:text-white p-1 -mr-1 -mt-1" aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active ? 'bg-saffron text-white font-medium' : 'text-white/80 hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4">
          <button
            onClick={() => { clearAdminKey(); router.push('/login'); }}
            className="w-full text-xs border border-white/20 rounded-md py-2 text-white/70 hover:bg-white/5"
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
