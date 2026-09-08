'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminShell';
import { listUsers, deleteUser } from '@/lib/adminApi';

interface UserRow {
  id: number; sikh_id: string; full_name: string; email: string;
  country: string | null; profile_completion: number; source_site: string | null; created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [minC, setMinC] = useState('');
  const [maxC, setMaxC] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { pageSize: '50' };
      if (search) params.search = search;
      if (minC) params.completion_min = minC;
      if (maxC) params.completion_max = maxC;
      const data = await listUsers(params);
      setUsers(data.users);
      setTotal(data.total);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (u: UserRow) => {
    const confirmed = window.confirm(
      `Permanently delete ${u.full_name} (${u.sikh_id})? This removes their account and profile data — it can't be undone.`
    );
    if (!confirmed) return;

    setDeletingId(u.id);
    try {
      await deleteUser(u.id);
      setUsers((prev) => prev.filter((row) => row.id !== u.id));
      setTotal((prev) => prev - 1);
    } catch (e: any) {
      alert(e.message || 'Failed to delete member.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 min-h-screen bg-[#f5f6f8]">
        <AdminTopBar title="Members" subtitle={`${total} members across the Sikh Group network`} />

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-wrap items-end gap-3 mb-5">
            <label className="flex-1 min-w-[220px]">
              <span className="block text-xs font-medium text-navy mb-1">Search name, email, or Sikh ID</span>
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && load()}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm"
                placeholder="e.g. Navdeep, TSG-10001, name@email.com"
              />
            </label>
            <label className="w-20 sm:w-24">
              <span className="block text-xs font-medium text-navy mb-1">Min %</span>
              <input value={minC} onChange={(e) => setMinC(e.target.value)} type="number" min={0} max={100}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
            </label>
            <label className="w-20 sm:w-24">
              <span className="block text-xs font-medium text-navy mb-1">Max %</span>
              <input value={maxC} onChange={(e) => setMaxC(e.target.value)} type="number" min={0} max={100}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
            </label>
            <button onClick={load} className="bg-saffron text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-saffron-dark">
              Filter
            </button>
          </div>

          {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}

          {loading ? (
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-6 text-center text-gray-400 text-sm">Loading...</div>
          ) : users.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-6 text-center text-gray-400 text-sm">No members match this filter.</div>
          ) : (
            <>
              {/* Below sm: one card per member — a side-by-side table would force
                  columns too narrow to read on a phone, no matter how it's scaled. */}
              <div className="sm:hidden bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {users.map((u) => (
                  <div key={u.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-navy truncate">{u.full_name}</div>
                        <div className="text-xs text-gray-400">{u.sikh_id}</div>
                      </div>
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={deletingId === u.id}
                        className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50 shrink-0"
                      >
                        {deletingId === u.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 break-all">{u.email}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {u.country || '—'} &middot; via {u.source_site || '—'}
                    </div>
                    <div className="flex items-center gap-2 mt-2.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-saffron" style={{ width: `${u.profile_completion}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 shrink-0">{u.profile_completion}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm min-w-[720px]">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                      <th className="px-5 py-3 font-medium">Name</th>
                      <th className="px-5 py-3 font-medium">Sikh ID</th>
                      <th className="px-5 py-3 font-medium">Email</th>
                      <th className="px-5 py-3 font-medium">Country</th>
                      <th className="px-5 py-3 font-medium">Signed up via</th>
                      <th className="px-5 py-3 font-medium">Completion</th>
                      <th className="px-5 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium text-navy">{u.full_name}</td>
                        <td className="px-5 py-3 text-gray-500">{u.sikh_id}</td>
                        <td className="px-5 py-3 text-gray-500">{u.email}</td>
                        <td className="px-5 py-3 text-gray-500">{u.country || '—'}</td>
                        <td className="px-5 py-3 text-gray-500">{u.source_site || '—'}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-saffron" style={{ width: `${u.profile_completion}%` }} />
                            </div>
                            <span className="text-xs text-gray-500">{u.profile_completion}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={deletingId === u.id}
                            className="text-xs text-red-600 hover:text-red-700 hover:underline disabled:opacity-50 disabled:no-underline"
                          >
                            {deletingId === u.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <p className="text-xs text-gray-400 mt-3">Showing up to 50 results. Refine the search for more specific results.</p>
        </main>
      </div>
    </div>
  );
}
