'use client';

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

  return (
    <aside className="w-60 bg-navy text-white flex flex-col shrink-0 min-h-screen">
      <div className="px-6 pt-6 pb-5 border-b border-white/10">
        <div className="text-xs tracking-wide text-white/50 uppercase">The Sikh Group</div>
        <div className="text-xl font-bold mt-1">
          Sikh ID <span className="text-saffron">Admin</span>
        </div>
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
  );
}
