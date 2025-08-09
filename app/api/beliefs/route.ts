export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    const topics = Array.isArray(body.topics)
      ? body.topics.map((t: any) => String(t))
      : String(body.topics || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    const newId =
      (globalThis as any).crypto?.randomUUID?.() ??
      Math.random().toString(36).slice(2);

    const created = await prisma.belief.create({
      data: {
        id: newId,
        title: String(body.title || ''),
        text: String(body.text || ''),
        topics,
        author: body.author ?? null,
        category: body.category ?? null,
        approvalDetails: body.approvalDetails ?? null,
        sourceDate: body.sourceDate ?? null,
        lastReviewDate: body.lastReviewDate ?? null,
        certainty: body.certainty ?? null,
        importance: body.importance ?? null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Save failed' }, { status: 500 });
  }
}
