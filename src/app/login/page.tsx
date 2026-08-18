'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAdminKey, getStats } from '@/lib/adminApi';

export default function AdminLoginPage() {
  const router = useRouter();
  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAdminKey(key);
    try {
      await getStats(); // validates the key against the API before letting them in
      router.push('/overview');
    } catch (err: any) {
      setError('That admin key was rejected. Check ADMIN_API_KEY on the backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm">
        <div className="text-2xl font-bold text-navy mb-1">
          Sikh ID <span className="text-saffron">Admin</span>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Enter the admin API key configured in the backend's <code className="bg-gray-100 px-1 rounded">.env</code> as <code className="bg-gray-100 px-1 rounded">ADMIN_API_KEY</code>.
        </p>
        <form onSubmit={submit}>
          <label className="block mb-6">
            <span className="block text-sm font-medium text-navy mb-1.5">Admin key</span>
            <input
              type="password" required value={key} onChange={(e) => setKey(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40"
            />
          </label>
          {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}
          <button
            type="submit" disabled={loading}
            className="w-full bg-saffron text-white text-sm font-medium py-2.5 rounded-lg hover:bg-saffron-dark transition-colors disabled:opacity-60"
          >
            {loading ? 'Checking...' : 'Enter admin dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
