'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminShell';
import { listSegments, previewSegment, createSegment, deleteSegment } from '@/lib/adminApi';

const INTERESTS = [
  'Business & Entrepreneurship', 'Investment', 'Careers', 'Education', 'Charity & Seva',
  'Sikh History & Heritage', 'Sikh Community', 'Networking', 'Matrimony', 'Travel',
  'Technology', 'Leadership', 'Media & Entertainment', 'Sport', 'Young Professionals',
];
const PLATFORMS = [
  'The Sikh Directory', 'The Sikh Awards', 'The Sikh 100', 'The Sikh Match',
  'The Sikh Alert', 'The Sikh Billionaires Club', 'The Sikh Watch', 'The Sikh Consultancy',
];
const INDUSTRIES = ['Finance', 'Technology', 'Property', 'Healthcare', 'Education', 'Legal', 'Retail', 'Other'];

interface Segment { id: number; name: string; description: string | null; filter_json: any; created_at: string; }

function MultiChip({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (o: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const checked = selected.includes(o);
        return (
          <button
            type="button" key={o} onClick={() => onToggle(o)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              checked ? 'bg-saffron/10 border-saffron text-navy font-medium' : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [completionMin, setCompletionMin] = useState('');
  const [completionMax, setCompletionMax] = useState('');
  const [industries, setIndustries] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [groupPrefs, setGroupPrefs] = useState<string[]>([]);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) =>
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

  const buildFilter = () => {
    const filter: any = {};
    if (completionMin) filter.completion_min = Number(completionMin);
    if (completionMax) filter.completion_max = Number(completionMax);
    if (industries.length) filter.industries = industries;
    if (interests.length) filter.interests = interests;
    if (groupPrefs.length) filter.group_preferences = groupPrefs;
    return filter;
  };

  const loadSegments = () => listSegments().then(setSegments).catch((e) => setError(e.message));
  useEffect(() => { loadSegments(); }, []);

  const runPreview = async () => {
    setError(null);
    try {
      const res = await previewSegment(buildFilter());
      setPreviewCount(res.count);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const save = async () => {
    if (!name) { setError('Give the segment a name first.'); return; }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await createSegment({ name, description, filter: buildFilter() });
      setMessage(`Segment "${name}" saved.`);
      setName(''); setDescription(''); setCompletionMin(''); setCompletionMax('');
      setIndustries([]); setInterests([]); setGroupPrefs([]); setPreviewCount(null);
      loadSegments();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    await deleteSegment(id);
    loadSegments();
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 min-h-screen bg-[#f5f6f8]">
        <AdminTopBar title="Segments" subtitle="Build reusable filters — segments re-evaluate live against current member data" />

        <main className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Builder */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-navy mb-4">Build a new segment</h2>

            <label className="block mb-4">
              <span className="block text-xs font-medium text-navy mb-1">Segment name</span>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Under 50%, joined 30+ days ago"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
            </label>
            <label className="block mb-5">
              <span className="block text-xs font-medium text-navy mb-1">Description (optional)</span>
              <input value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <label>
                <span className="block text-xs font-medium text-navy mb-1">Completion min %</span>
                <input value={completionMin} onChange={(e) => setCompletionMin(e.target.value)} type="number" min={0} max={100}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
              </label>
              <label>
                <span className="block text-xs font-medium text-navy mb-1">Completion max %</span>
                <input value={completionMax} onChange={(e) => setCompletionMax(e.target.value)} type="number" min={0} max={100}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
              </label>
            </div>

            <div className="mb-5">
              <span className="block text-xs font-medium text-navy mb-2">Industry</span>
              <MultiChip options={INDUSTRIES} selected={industries} onToggle={(v) => toggle(industries, setIndustries, v)} />
            </div>
            <div className="mb-5">
              <span className="block text-xs font-medium text-navy mb-2">Interests</span>
              <MultiChip options={INTERESTS} selected={interests} onToggle={(v) => toggle(interests, setInterests, v)} />
            </div>
            <div className="mb-6">
              <span className="block text-xs font-medium text-navy mb-2">Opted into platform</span>
              <MultiChip options={PLATFORMS} selected={groupPrefs} onToggle={(v) => toggle(groupPrefs, setGroupPrefs, v)} />
            </div>

            {error ? <p className="text-sm text-red-600 mb-3">{error}</p> : null}
            {message ? <p className="text-sm text-green-600 mb-3">{message}</p> : null}

            <div className="flex flex-wrap items-center gap-3">
              <button onClick={runPreview} className="text-sm border border-gray-300 px-4 py-2.5 rounded-lg hover:border-navy">
                Preview count
              </button>
              {previewCount !== null ? (
                <span className="text-sm text-navy font-medium">{previewCount} members match</span>
              ) : null}
              <div className="flex-1 hidden sm:block" />
              <button onClick={save} disabled={saving} className="bg-saffron text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-saffron-dark disabled:opacity-60">
                {saving ? 'Saving...' : 'Save segment'}
              </button>
            </div>
          </div>

          {/* Saved segments */}
          <div>
            <h2 className="text-sm font-semibold text-navy mb-4">Saved segments</h2>
            <div className="space-y-3">
              {segments.length === 0 ? (
                <p className="text-sm text-gray-400">No segments saved yet — build one on the left.</p>
              ) : (
                segments.map((s) => (
                  <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-navy">{s.name}</div>
                        {s.description ? <div className="text-xs text-gray-400 mt-0.5">{s.description}</div> : null}
                      </div>
                      <button onClick={() => remove(s.id)} className="text-xs text-gray-400 hover:text-red-600">Delete</button>
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
