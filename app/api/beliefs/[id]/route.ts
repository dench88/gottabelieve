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

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const item = await prisma.belief.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await prisma.belief.update({
      where: { id: params.id },
      data: {
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
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Update failed' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.belief.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
