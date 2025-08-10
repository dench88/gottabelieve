export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type AnyRec = Record<string, any>;

function toArray(x: any): string[] {
  if (Array.isArray(x)) return x.map(String);
  if (!x) return [];
  return String(x).split(',').map(s => s.trim()).filter(Boolean);
}

function normalize(r: AnyRec) {
  // maps legacy keys -> new fields; keeps strings only
  return {
    id: r.id ? String(r.id) : undefined,
    title: String(r.title ?? ''),
    text: String(r.text ?? ''),
    topics: toArray(r.topic ?? r.topics),
    author: r.author ?? null,
    category: r.category ?? null,
    approvalDetails: r.approval_details ?? r.approvalDetails ?? null,
    sourceDate: r.source_date ?? r.sourceDate ?? null,
    lastReviewDate: r.last_review_date ?? r.lastReviewDate ?? null,
    certainty: r.certainty ?? null,
    importance: r.importance ?? null,
  };
}

export async function POST(req: Request) {
  try {
    // Optional admin token
    const wantToken = !!process.env.ADMIN_TOKEN;
    const gotToken = req.headers.get('x-admin-token') || '';
    if (wantToken && gotToken !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawText = await req.text();
    const raw = JSON.parse(rawText);

    const items: AnyRec[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.items)
      ? raw.items
      : (() => { throw new Error('Expected a JSON array or {items:[...]}'); })();

    let imported = 0;
    for (const rec of items) {
      const n = normalize(rec);
      const id = n.id ?? ((globalThis as any).crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));

      await prisma.belief.upsert({
        where: { id },
        update: {
          title: n.title, text: n.text, topics: n.topics,
          author: n.author, category: n.category, approvalDetails: n.approvalDetails,
          sourceDate: n.sourceDate, lastReviewDate: n.lastReviewDate,
          certainty: n.certainty, importance: n.importance,
        },
        create: {
          id,
          title: n.title, text: n.text, topics: n.topics,
          author: n.author, category: n.category, approvalDetails: n.approvalDetails,
          sourceDate: n.sourceDate, lastReviewDate: n.lastReviewDate,
          certainty: n.certainty, importance: n.importance,
        },
      });

      imported += 1;
    }

    return NextResponse.json({ ok: true, imported });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Import failed' }, { status: 400 });
  }
}
