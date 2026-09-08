'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminShell';
import { listEventsAdmin, createEvent, updateEvent, deleteEvent } from '@/lib/adminApi';

interface EventRow {
  id: number; title: string; description: string | null; event_type: string;
  location: string | null; is_virtual: number; event_date: string; event_time: string | null;
  cta_label: string | null; cta_url: string | null; status: string;
}

const TYPES = [
  { value: 'community', label: 'Community' },
  { value: 'business', label: 'Business' },
  { value: 'award', label: 'Awards' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'other', label: 'Other' },
];

const emptyForm = {
  title: '', description: '', event_type: 'community', location: '', is_virtual: false,
  event_date: '', event_time: '', cta_label: '', cta_url: '', status: 'published',
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => listEventsAdmin().then(setEvents).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.title || !form.event_date) { setError('Title and date are required.'); return; }
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await updateEvent(editingId, form);
      } else {
        await createEvent(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const edit = (ev: EventRow) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title, description: ev.description || '', event_type: ev.event_type,
      location: ev.location || '', is_virtual: !!ev.is_virtual, event_date: ev.event_date?.slice(0, 10),
      event_time: ev.event_time || '', cta_label: ev.cta_label || '', cta_url: ev.cta_url || '', status: ev.status,
    });
  };

  const cancelEdit = () => { setEditingId(null); setForm(emptyForm); };

  const remove = async (id: number) => { await deleteEvent(id); load(); };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 min-h-screen bg-[#f5f6f8]">
        <AdminTopBar title="Events" subtitle="Community, business, award and webinar events shown on member dashboards" />

        <main className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-navy mb-4">{editingId ? 'Edit event' : 'Create an event'}</h2>

            <label className="block mb-4">
              <span className="block text-xs font-medium text-navy mb-1">Title</span>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
            </label>

            <label className="block mb-4">
              <span className="block text-xs font-medium text-navy mb-1">Description</span>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <label>
                <span className="block text-xs font-medium text-navy mb-1">Type</span>
                <select value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm bg-white">
                  {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </label>
              <label>
                <span className="block text-xs font-medium text-navy mb-1">Status</span>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm bg-white">
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <label>
                <span className="block text-xs font-medium text-navy mb-1">Date</span>
                <input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
              </label>
              <label>
                <span className="block text-xs font-medium text-navy mb-1">Time</span>
                <input placeholder="e.g. 6:00 PM" value={form.event_time} onChange={(e) => setForm({ ...form, event_time: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
              </label>
            </div>

            <label className="flex items-center gap-2 mb-4 text-sm">
              <input type="checkbox" checked={form.is_virtual} onChange={(e) => setForm({ ...form, is_virtual: e.target.checked })} />
              Virtual event
            </label>

            <label className="block mb-4">
              <span className="block text-xs font-medium text-navy mb-1">{form.is_virtual ? 'Meeting link' : 'Location'}</span>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <label>
                <span className="block text-xs font-medium text-navy mb-1">Button label</span>
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
                {saving ? 'Saving...' : editingId ? 'Save changes' : 'Create event'}
              </button>
              {editingId ? <button onClick={cancelEdit} className="text-sm text-gray-500">Cancel</button> : null}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-navy mb-4">All events</h2>
            <div className="space-y-3">
              {events.length === 0 ? (
                <p className="text-sm text-gray-400">No events yet — create one on the left.</p>
              ) : (
                events.map((ev) => (
                  <div key={ev.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-navy">{ev.title}</span>
                          <span className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{ev.event_type}</span>
                          {ev.status !== 'published' ? (
                            <span className="text-[10px] uppercase tracking-wide bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">{ev.status}</span>
                          ) : null}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(ev.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          {ev.event_time ? ` · ${ev.event_time}` : ''}
                          {ev.location ? ` · ${ev.location}` : ''}
                        </div>
                      </div>
                      <div className="flex gap-3 text-xs">
                        <button onClick={() => edit(ev)} className="text-gray-500 hover:text-navy">Edit</button>
                        <button onClick={() => remove(ev.id)} className="text-gray-400 hover:text-red-600">Delete</button>
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
