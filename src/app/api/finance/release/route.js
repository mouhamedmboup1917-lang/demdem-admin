import { NextResponse } from 'next/server';
import { processRelease } from '@/lib/store';

export async function POST(request) {
  try {
    const { escrowId, pin } = await request.json();
    if (!escrowId || !pin) {
      return NextResponse.json({ error: 'escrowId et pin requis' }, { status: 400 });
    }
    const data = processRelease(escrowId, pin);
    return NextResponse.json(data);
  } catch (e) {
    const status = e.message.includes('PIN') ? 403 : e.message.includes('introuvable') ? 404 : 500;
    return NextResponse.json({ error: e.message }, { status });
  }
}
