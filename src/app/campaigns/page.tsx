'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminShell';
import { listSegments, getSegmentMembers, sendCampaign } from '@/lib/adminApi';

interface Segment { id: number; name: string; }

export default function CampaignsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [segmentId, setSegmentId] = useState<number | ''>('');
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [ctaLabel, setCtaLabel] = useState('Open Sikh ID');
  const [ctaUrl, setCtaUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listSegments().then(setSegments).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!segmentId) { setMemberCount(null); return; }
    getSegmentMembers(Number(segmentId)).then((r) => setMemberCount(r.count)).catch(() => setMemberCount(null));
  }, [segmentId]);

  const submit = async () => {
    if (!segmentId || !subject || !bodyHtml) {
      setError('Choose a segment, subject, and message body first.');
      return;
    }
    setSending(true);
    setError(null);
    setResult(null);
    try {
      const res = await sendCampaign({
        segmentId: Number(segmentId), subject, bodyHtml,
        ctaLabel: ctaLabel || undefined, ctaUrl: ctaUrl || undefined,
      });
      setResult(`Queued ${res.queued} emails to "${res.segment}".`);
      setSubject(''); setBodyHtml('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 min-h-screen bg-[#f5f6f8]">
        <AdminTopBar title="Campaigns" subtitle="Send a manual email to any saved segment — re-evaluated live at send time" />

        <main className="p-8 max-w-2xl">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block mb-5">
              <span className="block text-xs font-medium text-navy mb-1">Segment</span>
              <select
                value={segmentId} onChange={(e) => setSegmentId(e.target.value ? Number(e.target.value) : '')}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm bg-white"
              >
                <option value="">Select a segment...</option>
                {segments.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {memberCount !== null ? (
                <span className="block text-xs text-gray-400 mt-1">{memberCount} members will receive this email.</span>
              ) : null}
              {segments.length === 0 ? (
                <span className="block text-xs text-gray-400 mt-1">No segments saved yet — create one on the Segments page first.</span>
              ) : null}
            </label>

            <label className="block mb-5">
              <span className="block text-xs font-medium text-navy mb-1">Subject line</span>
              <input value={subject} onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
            </label>

            <label className="block mb-5">
              <span className="block text-xs font-medium text-navy mb-1">Message body (HTML)</span>
              <textarea value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)} rows={6}
                placeholder="<p>Hi there — here's what's new in the Sikh Group ecosystem...</p>"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm font-mono text-xs" />
            </label>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <label>
                <span className="block text-xs font-medium text-navy mb-1">Button label</span>
                <input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
              </label>
              <label>
                <span className="block text-xs font-medium text-navy mb-1">Button link</span>
                <input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://..."
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
              </label>
            </div>

            {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}
            {result ? <p className="text-sm text-green-600 mb-4">{result}</p> : null}

            <button
              onClick={submit} disabled={sending}
              className="bg-saffron text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-saffron-dark disabled:opacity-60"
            >
              {sending ? 'Queuing...' : 'Send campaign'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
