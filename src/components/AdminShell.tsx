'use client';

export function AdminTopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="px-8 py-5 bg-white border-b border-gray-200">
      <h1 className="text-lg font-semibold text-navy">{title}</h1>
      {subtitle ? <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p> : null}
    </header>
  );
}

export function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">{label}</div>
      <div className="text-2xl font-semibold text-navy">{value}</div>
      {sub ? <div className="text-xs text-gray-400 mt-1">{sub}</div> : null}
    </div>
  );
}
