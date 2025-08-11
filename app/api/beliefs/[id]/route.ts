export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function requireAdmin(req: Request) {
  const want = process.env.ADMIN_TOKEN;
  if (!want) return true;
  return req.headers.get('x-admin-token') === want;
}

// PUBLIC READ
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const item = await prisma.belief.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

// TOKEN REQUIRED FOR UPDATE/DELETE
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const updated = await prisma.belief.update({
      where: { id: params.id },
      data: {
        title: String(body.title ?? ''),
        text: String(body.text ?? ''),
        topics: Array.isArray(body.topics) ? body.topics.map(String) : [],
        author: body.author ?? null,
        category: body.category ?? null,
        approvalDetails: body.approvalDetails ?? null,
        sourceDate: body.sourceDate ?? null,
        lastReviewDate: body.lastReviewDate ?? null,
        certainty: body.certainty === '' ? null : Number(body.certainty),
        importance: body.importance === '' ? null : Number(body.importance),
      },
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Update failed' }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await prisma.belief.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
