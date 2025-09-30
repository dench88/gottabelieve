
'use client';

import { useEffect, useMemo, useState } from 'react';
import BeliefForm, { Belief } from './BeliefForm';

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: 'no-store', ...init });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function BeliefApp() {
  const [items, setItems] = useState<Belief[]>([]);
  const [index, setIndex] = useState(0);
  const [showForm, setShowForm] = useState<null | 'add' | 'edit'>(null);

  // Load all beliefs on mount
  useEffect(() => {
    api<Belief[]>('/api/beliefs').then(setItems).catch((e) => console.error(e));
  }, []);

  const current = items[index];

  function onAdded(b: Belief) {
    setItems((prev) => [...prev, b]);
    setIndex(items.length);
    setShowForm(null);
  }

  function onUpdated(b: Belief) {
    setItems((prev) => prev.map((x) => (x.id === b.id ? b : x)));
    setShowForm(null);
  }

  async function onDelete() {
    if (!current?.id) return;
    if (!confirm('Delete this belief?')) return;
    await api(`/api/beliefs/${current.id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((x) => x.id !== current.id));
    setIndex((i) => Math.max(0, Math.min(i, items.length - 2)));
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-4">
      {/* Title above text */}
      <h2 className="text-2xl font-semibold">{current?.title ?? ''}</h2>

      {/* Text in box, strip leading CR/LF */}
      <div className="belief-box whitespace-pre-wrap h-40 overflow-y-auto rounded border p-2">
        {(current?.text ?? '').replace(/^\r?\n+/, '')}
      </div>


      {/* Topics under text, each on its own line */}
      <div>
        <div className="text-sm text-slate-500">Topics</div>
        <div className="text-sm">
          {(current?.topics ?? []).join(", ")}
        </div>
      </div>

      {/* Details, each on its own line */}
      {current && (
        <div className="grid grid-cols-1 gap-1 text-sm">
          <div><span className="font-medium">Category:</span> {current.category ?? ''}</div>
          <div><span className="font-medium">Approval details:</span> {current.approvalDetails ?? ''}</div>
          <div><span className="font-medium">Author:</span> {current.author ?? ''}</div>
          <div><span className="font-medium">Source date:</span> {current.sourceDate ?? ''}</div>
          <div><span className="font-medium">Last review date:</span> {current.lastReviewDate ?? ''}</div>
          <div><span className="font-medium">Certainty:</span> {current.certainty ?? ''}</div>
          <div><span className="font-medium">Importance:</span> {current.importance ?? ''}</div>
        </div>
      )}

      {/* Buttons cluster */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <button className="rounded border px-3 py-2"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index <= 0}>Previous</button>
        <button className="rounded border px-3 py-2"
                onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
                disabled={index >= items.length - 1}>Next</button>
        <button className="rounded border px-3 py-2"
                onClick={() => setShowForm('edit')}
                disabled={!current}>Edit</button>
        <button className="rounded border px-3 py-2" onClick={onDelete} disabled={!current}>Delete</button>
        <button className="rounded bg-indigo-600 px-3 py-2 text-white" onClick={() => setShowForm('add')}>Add Belief</button>
      </div>

      <div className="text-center text-xs text-slate-500">
        Card {items.length ? index + 1 : 0} of {items.length} • ID: {current?.id ?? '—'}
      </div>

      {showForm === 'add' && (
        <BeliefForm onCancel={() => setShowForm(null)} onSaved={onAdded} />
      )}
      {showForm === 'edit' && current && (
        <BeliefForm onCancel={() => setShowForm(null)} onSaved={onUpdated} initial={current} />
      )}
    </div>
  );
}
