
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const item = await prisma.belief.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const topics = Array.isArray(body.topics)
    ? body.topics.map((t: any) => String(t))
    : String(body.topics || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

  const updated = await prisma.belief.update({
    where: { id: params.id },
    data: {
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
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.belief.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
