'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminShell';
import {
  listNominations, getNomination,
  listNominationForms, getNominationForm, saveNominationForm, deleteNominationForm,
} from '@/lib/adminApi';

interface FormField {
  key: string; label: string; type: string; required: boolean; options?: string[];
}
interface NominationForm {
  id?: number; site_domain: string; title: string; fields_json: FormField[]; is_active: boolean;
  updated_at?: string; submission_count?: number;
}
interface NominationRow {
  id: number; site_domain: string; data: Record<string, string>; created_at: string; form_title: string;
  user_id: number; submitted_by_name: string; submitted_by_email: string; submitted_by_sikh_id: string;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Phone' },
  { value: 'textarea', label: 'Long text' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
  { value: 'url', label: 'Website / URL' },
];

const emptyField = (): FormField => ({ key: '', label: '', type: 'text', required: false, options: [] });

export default function NominationsPage() {
  const [tab, setTab] = useState<'submissions' | 'builder'>('submissions');

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 min-h-screen bg-[#f5f6f8]">
        <AdminTopBar title="Nominations" subtitle="Nomination submissions from every site, and each site's form fields" />

        <div className="px-4 sm:px-8 pt-6">
          <div className="inline-flex bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setTab('submissions')}
              className={`px-4 py-1.5 text-sm rounded-md ${tab === 'submissions' ? 'bg-saffron text-white font-medium' : 'text-gray-500'}`}
            >
              Submissions
            </button>
            <button
              onClick={() => setTab('builder')}
              className={`px-4 py-1.5 text-sm rounded-md ${tab === 'builder' ? 'bg-saffron text-white font-medium' : 'text-gray-500'}`}
            >
              Form builder
            </button>
          </div>
        </div>

        <main className="p-4 sm:p-6 lg:p-8 pt-6">
          {tab === 'submissions' ? <SubmissionsTab /> : <BuilderTab />}
        </main>
      </div>
    </div>
  );
}

function SubmissionsTab() {
  const [rows, setRows] = useState<NominationRow[]>([]);
  const [sites, setSites] = useState<string[]>([]);
  const [siteFilter, setSiteFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const pageSize = 25;

  useEffect(() => {
    listNominationForms().then((forms: NominationForm[]) => setSites(forms.map((f) => f.site_domain))).catch(() => {});
  }, []);

  const load = () => {
    const params: Record<string, string | number> = { page, pageSize };
    if (siteFilter) params.site_domain = siteFilter;
    listNominations(params)
      .then((res) => { setRows(res.nominations); setTotal(res.total); })
      .catch((e) => setError(e.message));
  };
  useEffect(() => { load(); }, [page, siteFilter]);

  const openDetail = async (id: number) => {
    try {
      setDetail(await getNomination(id));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <select
          value={siteFilter}
          onChange={(e) => { setSiteFilter(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3.5 py-2 text-sm bg-white"
        >
          <option value="">All sites</option>
          {sites.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs text-gray-400">{total} submission{total === 1 ? '' : 's'}</span>
      </div>

      {error ? <p className="text-sm text-red-600 mb-3">{error}</p> : null}

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-200">
              <th className="px-5 py-3 font-medium">Submitted by</th>
              <th className="px-5 py-3 font-medium">Site</th>
              <th className="px-5 py-3 font-medium">Form</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">No nominations yet.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 last:border-0">
                <td className="px-5 py-3">
                  <div className="font-medium text-navy">{r.submitted_by_name}</div>
                  <div className="text-xs text-gray-400">{r.submitted_by_email} &middot; {r.submitted_by_sikh_id}</div>
                </td>
                <td className="px-5 py-3 text-gray-500">{r.site_domain}</td>
                <td className="px-5 py-3 text-gray-500">{r.form_title}</td>
                <td className="px-5 py-3 text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => openDetail(r.id)} className="text-xs text-saffron font-medium hover:underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center gap-3 mt-4 text-sm">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40">Prev</button>
          <span className="text-gray-500">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40">Next</button>
        </div>
      ) : null}

      {detail ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 sm:p-6 z-50" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-navy">{detail.form_title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {detail.submitted_by_name} &middot; {detail.submitted_by_email} &middot; {detail.submitted_by_sikh_id}
                </p>
                <p className="text-xs text-gray-400">{detail.site_domain} &middot; {new Date(detail.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-navy text-lg leading-none">&times;</button>
            </div>
            <dl className="space-y-3">
              {detail.fields_json.filter((f: FormField) => detail.data[f.key]).map((f: FormField) => (
                <div key={f.key}>
                  <dt className="text-[11px] uppercase tracking-wide text-gray-400">{f.label}</dt>
                  <dd className="text-sm text-navy whitespace-pre-wrap">{detail.data[f.key]}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BuilderTab() {
  const [sites, setSites] = useState<NominationForm[]>([]);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [newSiteDomain, setNewSiteDomain] = useState('');
  const [form, setForm] = useState<NominationForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSites = () => listNominationForms().then(setSites).catch((e) => setError(e.message));
  useEffect(() => { loadSites(); }, []);

  const openSite = async (siteDomain: string) => {
    setError(null);
    try {
      const existing = await getNominationForm(siteDomain).catch(() => null);
      setSelectedSite(siteDomain);
      setForm(existing || { site_domain: siteDomain, title: 'To Nominate', fields_json: [emptyField()], is_active: true });
    } catch (e: any) {
      setError(e.message);
    }
  };

  const startNewSite = () => {
    const domain = newSiteDomain.trim();
    if (!domain) return;
    setNewSiteDomain('');
    openSite(domain);
  };

  const updateField = (i: number, patch: Partial<FormField>) => {
    if (!form) return;
    const fields = [...form.fields_json];
    fields[i] = { ...fields[i], ...patch };
    setForm({ ...form, fields_json: fields });
  };
  const removeField = (i: number) => {
    if (!form) return;
    setForm({ ...form, fields_json: form.fields_json.filter((_, idx) => idx !== i) });
  };
  const moveField = (i: number, dir: -1 | 1) => {
    if (!form) return;
    const fields = [...form.fields_json];
    const j = i + dir;
    if (j < 0 || j >= fields.length) return;
    [fields[i], fields[j]] = [fields[j], fields[i]];
    setForm({ ...form, fields_json: fields });
  };
  const addField = () => {
    if (!form) return;
    setForm({ ...form, fields_json: [...form.fields_json, emptyField()] });
  };

  const save = async () => {
    if (!form) return;
    if (!form.title.trim()) { setError('Title is required.'); return; }
    for (const f of form.fields_json) {
      if (!f.key.trim() || !f.label.trim()) { setError('Every field needs a key and a label.'); return; }
    }
    setSaving(true);
    setError(null);
    try {
      await saveNominationForm(form.site_domain, { title: form.title, fields: form.fields_json, is_active: form.is_active });
      await loadSites();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!form || !confirm(`Delete the nomination form for ${form.site_domain}? Past submissions are kept.`)) return;
    await deleteNominationForm(form.site_domain);
    setForm(null);
    setSelectedSite(null);
    loadSites();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div>
        <h2 className="text-sm font-semibold text-navy mb-4">Sites</h2>
        <div className="space-y-2 mb-5">
          {sites.length === 0 ? (
            <p className="text-sm text-gray-400">No forms configured yet.</p>
          ) : sites.map((s) => (
            <button
              key={s.site_domain}
              onClick={() => openSite(s.site_domain)}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm border ${
                selectedSite === s.site_domain ? 'border-saffron bg-saffron/5 text-navy font-medium' : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{s.site_domain}</span>
                {!s.is_active ? <span className="text-[10px] uppercase bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">off</span> : null}
              </div>
              <div className="text-xs text-gray-400">{s.submission_count ?? 0} submission{s.submission_count === 1 ? '' : 's'}</div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <span className="block text-xs font-medium text-navy mb-2">Add a new site</span>
          <div className="flex gap-2">
            <input
              value={newSiteDomain}
              onChange={(e) => setNewSiteDomain(e.target.value)}
              placeholder="example.com"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <button onClick={startNewSite} className="bg-navy text-white text-xs font-medium px-3.5 py-2 rounded-lg">Add</button>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Must match a domain in ALLOWED_SITE_DOMAINS on the backend.</p>
        </div>
      </div>

      <div className="lg:col-span-2">
        {!form ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
            Select a site on the left, or add a new one, to build its nomination form.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-navy">{form.site_domain}</h2>
              <label className="flex items-center gap-2 text-xs text-gray-500">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                Active on site
              </label>
            </div>

            <label className="block mb-5">
              <span className="block text-xs font-medium text-navy mb-1">Form title</span>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm" />
            </label>

            <span className="block text-xs font-medium text-navy mb-2">Fields</span>
            <div className="space-y-3 mb-4">
              {form.fields_json.map((f, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center mb-2">
                    <input
                      value={f.label}
                      onChange={(e) => updateField(i, { label: e.target.value })}
                      placeholder="Label, e.g. Nominee's Company"
                      className="sm:col-span-5 border border-gray-300 rounded-md px-2.5 py-1.5 text-sm"
                    />
                    <input
                      value={f.key}
                      onChange={(e) => updateField(i, { key: e.target.value.trim().replace(/\s+/g, '_') })}
                      placeholder="key"
                      className="sm:col-span-3 border border-gray-300 rounded-md px-2.5 py-1.5 text-sm font-mono text-xs"
                    />
                    <select
                      value={f.type}
                      onChange={(e) => updateField(i, { type: e.target.value })}
                      className="sm:col-span-2 border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white"
                    >
                      {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <div className="sm:col-span-2 flex justify-end gap-3 sm:gap-1.5 text-xs">
                      <button onClick={() => moveField(i, -1)} className="text-gray-400 hover:text-navy">&uarr;</button>
                      <button onClick={() => moveField(i, 1)} className="text-gray-400 hover:text-navy">&darr;</button>
                      <button onClick={() => removeField(i)} className="text-gray-400 hover:text-red-600">&times;</button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs text-gray-500">
                      <input type="checkbox" checked={f.required} onChange={(e) => updateField(i, { required: e.target.checked })} />
                      Required
                    </label>
                    {f.type === 'select' ? (
                      <input
                        value={(f.options || []).join(', ')}
                        onChange={(e) => updateField(i, { options: e.target.value.split(',').map((o) => o.trim()).filter(Boolean) })}
                        placeholder="Options, comma separated"
                        className="flex-1 border border-gray-300 rounded-md px-2.5 py-1.5 text-xs"
                      />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={addField} className="text-xs text-saffron font-medium mb-6 hover:underline">+ Add field</button>

            {error ? <p className="text-sm text-red-600 mb-3">{error}</p> : null}

            <div className="flex items-center justify-between">
              <button onClick={save} disabled={saving} className="bg-saffron text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-saffron-dark disabled:opacity-60">
                {saving ? 'Saving...' : 'Save form'}
              </button>
              <button onClick={remove} className="text-xs text-gray-400 hover:text-red-600">Delete this site's form</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
