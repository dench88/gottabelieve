'use client';
import { useEffect, useState } from 'react';
import BeliefForm, { Belief } from '@/components/BeliefForm';

export default function BeliefApp() {
  const [items, setItems] = useState<Belief[]>([]);
  const [index, setIndex] = useState(0);
  const [showForm, setShowForm] = useState<null | 'add' | 'edit'>(null);
  const [adminToken, setAdminToken] = useState<string>('');

  useEffect(() => {
    const t = localStorage.getItem('adminToken') || '';
    setAdminToken(t);
    (async () => {
      const res = await fetch('/api/beliefs', { cache: 'no-store' });
      if (res.ok) setItems(await res.json());
    })();
  }, []);

  function saveToken(v: string) {
    setAdminToken(v);
    if (v) localStorage.setItem('adminToken', v);
    else localStorage.removeItem('adminToken');
  }

  async function api<T>(url: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);
    if (adminToken) headers.set('x-admin-token', adminToken);
    const res = await fetch(url, { ...init, headers, cache: 'no-store' });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  const current = items[index];

  function onAdded(b: Belief) {
    setItems(p => [...p, b]);
    setIndex(items.length);
    setShowForm(null);
  }
  function onUpdated(b: Belief) {
    setItems(p => p.map(x => x.id === b.id ? b : x));
    setShowForm(null);
  }
  async function onDelete() {
    if (!current?.id) return;
    if (!confirm('Delete this belief?')) return;
    await api(`/api/beliefs/${current.id}`, { method: 'DELETE' });
    setItems(p => p.filter(x => x.id !== current.id));
    setIndex(i => Math.max(0, Math.min(i, items.length - 2)));
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-4">
      {/* Admin token bar */}
      <div className="flex items-center justify-between gap-2 rounded border bg-slate-50 p-2">
        <div className="flex items-center gap-2">
          <input
            type="password"
            className="w-48 rounded border px-2 py-1"
            placeholder="Admin token"
            value={adminToken}
            onChange={e => saveToken(e.target.value)}
          />
          <span className="text-xs text-slate-500">
            {adminToken ? 'Admin mode' : 'Read-only'}
          </span>
        </div>
      </div>

      {/* ... your existing title/text/topics/details ... */}

      <div className="flex items-center justify-center gap-2 pt-2">
        <button className="rounded border px-3 py-2" onClick={() => setIndex(i => Math.max(0, i - 1))} disabled={index <= 0}>Previous</button>
        <button className="rounded border px-3 py-2" onClick={() => setIndex(i => Math.min(items.length - 1, i + 1))} disabled={index >= items.length - 1}>Next</button>
        <button className="rounded border px-3 py-2" onClick={() => setShowForm('edit')} disabled={!current || !adminToken}>Edit</button>
        <button className="rounded border px-3 py-2" onClick={onDelete} disabled={!current || !adminToken}>Delete</button>
        <button className="rounded bg-indigo-600 px-3 py-2 text-white" onClick={() => setShowForm('add')} disabled={!adminToken}>Add Belief</button>
      </div>

      {/* forms */}
      {showForm === 'add' && (<BeliefForm onCancel={() => setShowForm(null)} onSaved={onAdded} />)}
      {showForm === 'edit' && current && (<BeliefForm onCancel={() => setShowForm(null)} onSaved={onUpdated} initial={current} />)}
    </div>
  );
}
