'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminShell';
import { listHukamnamaAdmin, publishHukamnama, deleteHukamnama } from '@/lib/adminApi';

interface HukamRow {
  id: number; hukam_date: string; gurmukhi_text: string | null; transliteration: string | null;
  english_translation: string | null; source_name: string; source_url: string | null; is_active: number;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function HukamnamaPage() {
  const [entries, setEntries] = useState<HukamRow[]>([]);
  const [form, setForm] = useState({
    hukam_date: todayISO(), gurmukhi_text: '', transliteration: '', english_translation: '',
    source_name: 'Sri Darbar Sahib, Amritsar', source_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = () => listHukamnamaAdmin().then(setEntries).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.hukam_date || (!form.gurmukhi_text && !form.english_translation)) {
      setError('Provide a date and at least the Gurmukhi text or an English translation.');
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await publishHukamnama(form);
      setMessage(`Hukamnama for ${form.hukam_date} published — it will flash on member dashboards today.`);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const loadForEdit = (h: HukamRow) => {
    setForm({
      hukam_date: h.hukam_date.slice(0, 10),
      gurmukhi_text: h.gurmukhi_text || '',
      transliteration: h.transliteration || '',
      english_translation: h.english_translation || '',
      source_name: h.source_name,
      source_url: h.source_url || '',
    });
    setMessage(null);
  };

  const remove = async (id: number) => { await deleteHukamnama(id); load(); };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 min-h-screen bg-[#f5f6f8]">
        <AdminTopBar title="Hukamnama" subtitle="Publish the day's reading — flashes as a banner on every member dashboard" />

        <main className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3.5 py-2.5 mb-5 leading-relaxed">
              This publishes what members see verbatim — paste in the actual day's reading
              (typically sourced from Sri Darbar Sahib's own daily broadcast or publication),
              not generated text. Keep the source attribution accurate.
            </div>

            <label className="block mb-4">
              <span className="block text-xs font-medium text-navy mb-1">Date</span>
              <input type="date" value={form.hukam_date} onChange={(e) => setForm({ ...form, hukam_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
            </label>

            <label className="block mb-4">
              <span className="block text-xs font-medium text-navy mb-1">Gurmukhi text</span>
              <textarea value={form.gurmukhi_text} onChange={(e) => setForm({ ...form, gurmukhi_text: e.target.value })} rows={3}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
            </label>

            <label className="block mb-4">
              <span className="block text-xs font-medium text-navy mb-1">Transliteration (optional)</span>
              <textarea value={form.transliteration} onChange={(e) => setForm({ ...form, transliteration: e.target.value })} rows={2}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
            </label>

            <label className="block mb-4">
              <span className="block text-xs font-medium text-navy mb-1">English translation</span>
              <textarea value={form.english_translation} onChange={(e) => setForm({ ...form, english_translation: e.target.value })} rows={3}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <label>
                <span className="block text-xs font-medium text-navy mb-1">Source name</span>
                <input value={form.source_name} onChange={(e) => setForm({ ...form, source_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
              </label>
              <label>
                <span className="block text-xs font-medium text-navy mb-1">Source link (optional)</span>
                <input value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
              </label>
            </div>

            {error ? <p className="text-sm text-red-600 mb-3">{error}</p> : null}
            {message ? <p className="text-sm text-green-600 mb-3">{message}</p> : null}

            <button onClick={submit} disabled={saving} className="bg-saffron text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-saffron-dark disabled:opacity-60">
              {saving ? 'Publishing...' : 'Publish for this date'}
            </button>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-navy mb-4">Recent entries</h2>
            <div className="space-y-3">
              {entries.length === 0 ? (
                <p className="text-sm text-gray-400">Nothing published yet.</p>
              ) : (
                entries.map((h) => (
                  <div key={h.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-navy">
                          {new Date(h.hukam_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {h.english_translation || h.gurmukhi_text}
                        </div>
                        <div className="text-[11px] text-gray-300 mt-1">{h.source_name}</div>
                      </div>
                      <div className="flex gap-3 text-xs shrink-0 ml-3">
                        <button onClick={() => loadForEdit(h)} className="text-gray-500 hover:text-navy">Edit</button>
                        <button onClick={() => remove(h.id)} className="text-gray-400 hover:text-red-600">Delete</button>
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
