
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all beliefs
export async function GET() {
  const items = await prisma.belief.findMany({ orderBy: { createdAt: 'asc' } });
  return NextResponse.json(items);
}

// CREATE a belief
export async function POST(req: Request) {
  const body = await req.json();
  // sanitize topics to array
  const topics = Array.isArray(body.topics)
    ? body.topics.map((t: any) => String(t))
    : String(body.topics || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

  const created = await prisma.belief.create({
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
  return NextResponse.json(created, { status: 201 });
}
