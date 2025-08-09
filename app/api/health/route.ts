export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const hostHint = (() => {
      try {
        const u = new URL(process.env.DATABASE_URL || '');
        return `${u.hostname}:${u.port || '(default)'}`;
      } catch { return null; }
    })();
    return NextResponse.json(
      { ok: false, error: e?.message || 'unknown', hostHint, hasDbUrl: !!process.env.DATABASE_URL },
      { status: 500 }
    );
  }
}
