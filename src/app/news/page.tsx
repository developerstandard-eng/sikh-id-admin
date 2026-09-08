'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminShell';
import { listNewsAdmin, createNews, updateNews, deleteNews } from '@/lib/adminApi';

interface NewsRow {
  id: number; title: string; body: string; category: string;
  cta_label: string | null; cta_url: string | null; status: string; published_at: string;
}

const CATEGORIES = ['news', 'update', 'announcement', 'press'];

const emptyForm = { title: '', body: '', category: 'news', cta_label: '', cta_url: '', status: 'published' };

export default function NewsPage() {
  const [items, setItems] = useState<NewsRow[]>([]);
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => listNewsAdmin().then(setItems).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.title || !form.body) { setError('Title and body are required.'); return; }
    setSaving(true);
    setError(null);
    try {
      if (editingId) await updateNews(editingId, form);
      else await createNews(form);
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const edit = (n: NewsRow) => {
    setEditingId(n.id);
    setForm({ title: n.title, body: n.body, category: n.category, cta_label: n.cta_label || '', cta_url: n.cta_url || '', status: n.status });
  };
  const cancelEdit = () => { setEditingId(null); setForm(emptyForm); };
  const remove = async (id: number) => { await deleteNews(id); load(); };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 min-h-screen bg-[#f5f6f8]">
        <AdminTopBar title="News corner" subtitle="Updates, announcements and press shown in the member dashboard's news feed" />

        <main className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-navy mb-4">{editingId ? 'Edit post' : 'Write a post'}</h2>

            <label className="block mb-4">
              <span className="block text-xs font-medium text-navy mb-1">Title</span>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
            </label>

            <label className="block mb-4">
              <span className="block text-xs font-medium text-navy mb-1">Body</span>
              <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={5}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <label>
                <span className="block text-xs font-medium text-navy mb-1">Category</span>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm bg-white capitalize">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label>
                <span className="block text-xs font-medium text-navy mb-1">Status</span>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm bg-white">
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <label>
                <span className="block text-xs font-medium text-navy mb-1">Button label (optional)</span>
                <input value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
              </label>
              <label>
                <span className="block text-xs font-medium text-navy mb-1">Button link</span>
                <input value={form.cta_url} onChange={(e) => setForm({ ...form, cta_url: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
              </label>
            </div>

            {error ? <p className="text-sm text-red-600 mb-3">{error}</p> : null}

            <div className="flex gap-3">
              <button onClick={submit} disabled={saving} className="bg-saffron text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-saffron-dark disabled:opacity-60">
                {saving ? 'Saving...' : editingId ? 'Save changes' : 'Publish post'}
              </button>
              {editingId ? <button onClick={cancelEdit} className="text-sm text-gray-500">Cancel</button> : null}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-navy mb-4">All posts</h2>
            <div className="space-y-3">
              {items.length === 0 ? (
                <p className="text-sm text-gray-400">No posts yet.</p>
              ) : (
                items.map((n) => (
                  <div key={n.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-navy">{n.title}</span>
                          <span className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded capitalize">{n.category}</span>
                          {n.status !== 'published' ? (
                            <span className="text-[10px] uppercase tracking-wide bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">{n.status}</span>
                          ) : null}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 line-clamp-2">{n.body}</div>
                      </div>
                      <div className="flex gap-3 text-xs shrink-0 ml-3">
                        <button onClick={() => edit(n)} className="text-gray-500 hover:text-navy">Edit</button>
                        <button onClick={() => remove(n.id)} className="text-gray-400 hover:text-red-600">Delete</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
