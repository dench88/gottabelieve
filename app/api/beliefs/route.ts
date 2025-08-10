export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

export async function GET() {
  try {
    const items = await prisma.belief.findMany({ orderBy: { createdAt: 'asc' } });
    return NextResponse.json(items);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Error fetching beliefs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newId =
      (globalThis as any).crypto?.randomUUID?.() ??
      Math.random().toString(36).slice(2);

    const created = await prisma.belief.create({
      data: {
        id: newId,
        title: String(body.title ?? ''),
        text: String(body.text ?? ''),
        topics: toTopics(body.topics),
        author: toOptString(body.author),
        category: toOptString(body.category),
        approvalDetails: toOptString(body.approvalDetails),
        sourceDate: toOptString(body.sourceDate),
        lastReviewDate: toOptString(body.lastReviewDate),
        certainty: toOptFloat(body.certainty),
        importance: toOptFloat(body.importance),
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Save failed' }, { status: 500 });
  }
}
