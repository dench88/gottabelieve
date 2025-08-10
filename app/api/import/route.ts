export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type AnyRec = Record<string, any>;

const toTopics = (x: any): string[] => {
  if (Array.isArray(x)) return x.map((t) => String(t));
  if (!x) return [];
  return String(x).split(',').map((s) => s.trim()).filter(Boolean);
};
const toOptFloat = (v: any): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const toOptString = (v: any): string | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
};

function normalize(r: AnyRec) {
  return {
    id: r.id ? String(r.id) : undefined,
    title: String(r.title ?? ''),
    text: String(r.text ?? ''),
    topics: toTopics(r.topic ?? r.topics),
    author: toOptString(r.author),
    category: toOptString(r.category),
    approvalDetails: toOptString(r.approval_details ?? r.approvalDetails),
    sourceDate: toOptString(r.source_date ?? r.sourceDate),
    lastReviewDate: toOptString(r.last_review_date ?? r.lastReviewDate),
    certainty: toOptFloat(r.certainty),
    importance: toOptFloat(r.importance),
  };
}

export async function POST(req: Request) {
  try {
    // Optional protection
    if (process.env.ADMIN_TOKEN) {
      const tok = req.headers.get('x-admin-token') || '';
      if (tok !== process.env.ADMIN_TOKEN) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const text = await req.text();
    const raw = JSON.parse(text);
    const items: AnyRec[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.items)
      ? raw.items
      : (() => {
          throw new Error('Expected a JSON array or {items:[...]}');
        })();

    let imported = 0;
    for (const rec of items) {
      const n = normalize(rec);
      const id =
        n.id ??
        ((globalThis as any).crypto?.randomUUID?.() ??
          Math.random().toString(36).slice(2));

      // Remove id from the spread object to avoid duplicate key
      const { id: _drop, ...rest } = n;

      await prisma.belief.upsert({
        where: { id },
        update: { ...rest },
        create: { id, ...rest },
      });

      imported += 1;
    }

    return NextResponse.json({ ok: true, imported });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Import failed' }, { status: 400 });
  }
}
