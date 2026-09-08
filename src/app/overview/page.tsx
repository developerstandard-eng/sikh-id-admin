'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import { AdminTopBar, StatCard } from '@/components/AdminShell';
import { getStats } from '@/lib/adminApi';

interface Stats {
  totals: { total_users: number; avg_completion: number; complete_count: number; new_last_30_days: number };
  buckets: { bucket: string; count: number }[];
  topIndustries: { industry: string; count: number }[];
  topInterests: { interest_tag: string; count: number }[];
  emailStats: { email_type: string; count: number }[];
}

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStats().then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-10">
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <Link href="/login" className="text-saffron underline text-sm">Back to login</Link>
        </div>
      </div>
    );
  }

  const maxBucket = stats ? Math.max(...stats.buckets.map((b) => b.count), 1) : 1;
  const bucketOrder = ['0-29%', '30-59%', '60-99%', '100%'];

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 min-h-screen bg-[#f5f6f8]">
        <AdminTopBar title="Ecosystem overview" subtitle="Live snapshot of the Sikh ID member base across the whole network" />

        <main className="p-4 sm:p-6 lg:p-8">
          {!stats ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total members" value={stats.totals.total_users} />
                <StatCard label="Average completion" value={`${stats.totals.avg_completion || 0}%`} />
                <StatCard label="Fully complete profiles" value={stats.totals.complete_count} />
                <StatCard label="New in last 30 days" value={stats.totals.new_last_30_days} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-4">Completion distribution</div>
                  <div className="space-y-3">
                    {bucketOrder.map((label) => {
                      const found = stats.buckets.find((b) => b.bucket === label);
                      const count = found?.count || 0;
                      return (
                        <div key={label}>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{label}</span><span>{count}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-saffron rounded-full" style={{ width: `${(count / maxBucket) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-4">Emails sent — last 30 days</div>
                  {stats.emailStats.length === 0 ? (
                    <p className="text-sm text-gray-400">No emails sent yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {stats.emailStats.map((e) => (
                        <li key={e.email_type} className="flex justify-between text-sm">
                          <span className="text-navy">{e.email_type === 'auto_reminder' ? 'Automatic reminders' : 'Manual campaigns'}</span>
                          <span className="text-gray-500">{e.count}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link href="/campaigns" className="inline-block mt-4 text-xs text-saffron font-medium hover:underline">
                    Send a new campaign →
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">Top industries</div>
                  <ul className="space-y-2">
                    {stats.topIndustries.map((i) => (
                      <li key={i.industry} className="flex justify-between text-sm">
                        <span className="text-navy">{i.industry}</span><span className="text-gray-400">{i.count}</span>
                      </li>
                    ))}
                    {stats.topIndustries.length === 0 && <li className="text-sm text-gray-400">No data yet.</li>}
                  </ul>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">Top interests</div>
                  <ul className="space-y-2">
                    {stats.topInterests.map((i) => (
                      <li key={i.interest_tag} className="flex justify-between text-sm">
                        <span className="text-navy">{i.interest_tag}</span><span className="text-gray-400">{i.count}</span>
                      </li>
                    ))}
                    {stats.topInterests.length === 0 && <li className="text-sm text-gray-400">No data yet.</li>}
                  </ul>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
