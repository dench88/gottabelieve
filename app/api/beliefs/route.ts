export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function requireAdmin(req: Request) {
  const want = process.env.ADMIN_TOKEN;
  if (!want) return true;
  return req.headers.get('x-admin-token') === want;
}

const toTopics = (x: any): string[] =>
  Array.isArray(x) ? x.map(String) : String(x || '').split(',').map(s => s.trim()).filter(Boolean);
const toOptFloat = (v: any): number | null => (v === '' || v == null ? null : (Number.isFinite(Number(v)) ? Number(v) : null));
const toOptString = (v: any): string | null => (v == null ? null : (String(v).trim() || null));

// READS MUST BE PUBLIC
export async function GET() {
  const items = await prisma.belief.findMany({ orderBy: { createdAt: 'asc' } });
  return NextResponse.json(items);
}

// WRITES REQUIRE TOKEN
export async function POST(req: Request) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const id = (globalThis as any).crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
    const created = await prisma.belief.create({
      data: {
        id,
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
