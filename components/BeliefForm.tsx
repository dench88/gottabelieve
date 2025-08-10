'use client';

import { useState } from 'react';

export type Belief = {
  id?: string;
  title: string;
  text: string;
  topics: string[];
  author?: string | null;
  category?: string | null;
  approvalDetails?: string | null;
  sourceDate?: string | null;
  lastReviewDate?: string | null;
  certainty?: number | null;   // ← floats now
  importance?: number | null;  // ← floats now
};

type Props = {
  initial?: Belief;
  onCancel: () => void;
  onSaved: (b: Belief) => void;
};

// Local form state lets the number inputs be '' while typing
type FormState =
  Omit<Belief, 'certainty' | 'importance'> & { certainty: number | ''; importance: number | '' };

export default function BeliefForm({ initial, onCancel, onSaved }: Props) {
  const [form, setForm] = useState<FormState>({
    title: initial?.title ?? '',
    text: (initial?.text ?? '').replace(/^\r?\n+/, ''),
    topics: initial?.topics ?? [],
    author: initial?.author ?? '',
    category: initial?.category ?? '',
    approvalDetails: initial?.approvalDetails ?? '',
    sourceDate: initial?.sourceDate ?? '',
    lastReviewDate: initial?.lastReviewDate ?? '',
    certainty: typeof initial?.certainty === 'number' ? initial!.certainty! : '',
    importance: typeof initial?.importance === 'number' ? initial!.importance! : '',
  });

  const isEdit = Boolean(initial?.id);

  async function submit() {
    const payload: Belief = {
      ...form,
      certainty: form.certainty === '' ? null : form.certainty,
      importance: form.importance === '' ? null : form.importance,
    } as Belief;

    const endpoint = isEdit ? `/api/beliefs/${initial!.id}` : '/api/beliefs';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      alert(msg || 'Save failed');
      return;
    }
    const data = await res.json();
    onSaved(data);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-4 shadow-xl">
        <h3 className="mb-2 text-lg font-semibold">{isEdit ? 'Edit Belief' : 'Add Belief'}</h3>

        <div className="grid grid-cols-1 gap-3">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Title</span>
            <input className="rounded border px-3 py-2" value={form.title}
                   onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Text</span>
            <textarea className="h-32 rounded border px-3 py-2"
                      value={form.text}
                      onChange={(e) => setForm({ ...form, text: e.target.value })} />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Topics (one per line)</span>
            <textarea className="h-20 rounded border px-3 py-2"
                      value={form.topics.join('\n')}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          topics: e.target.value.split('\n').map(s => s.trim()).filter(Boolean),
                        })
                      } />
          </label>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-sm font-medium">Category</span>
              <input className="rounded border px-3 py-2" value={form.category ?? ''}
                     onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Approval details</span>
              <input className="rounded border px-3 py-2" value={form.approvalDetails ?? ''}
                     onChange={(e) => setForm({ ...form, approvalDetails: e.target.value })} />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Author</span>
              <input className="rounded border px-3 py-2" value={form.author ?? ''}
                     onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Source date</span>
              <input className="rounded border px-3 py-2" value={form.sourceDate ?? ''}
                     onChange={(e) => setForm({ ...form, sourceDate: e.target.value })} />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Last review date</span>
              <input className="rounded border px-3 py-2" value={form.lastReviewDate ?? ''}
                     onChange={(e) => setForm({ ...form, lastReviewDate: e.target.value })} />
            </label>

            {/* Floats */}
            <label className="grid gap-1">
              <span className="text-sm font-medium">Certainty</span>
              <input
                type="number" step="0.01" inputMode="decimal"
                className="rounded border px-3 py-2"
                value={form.certainty}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm({ ...form, certainty: v === '' ? '' : Number(v) });
                }}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-medium">Importance</span>
              <input
                type="number" step="0.01" inputMode="decimal"
                className="rounded border px-3 py-2"
                value={form.importance}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm({ ...form, importance: v === '' ? '' : Number(v) });
                }}
              />
            </label>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button className="rounded border px-3 py-2" onClick={onCancel}>Cancel</button>
            <button className="rounded bg-indigo-600 px-3 py-2 text-white" onClick={submit}>
              {isEdit ? 'Save changes' : 'Add belief'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
