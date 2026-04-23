import { NextResponse } from 'next/server';
import { processRefund } from '@/lib/store';

export async function POST(request) {
  try {
    const { escrowId } = await request.json();
    if (!escrowId) return NextResponse.json({ error: 'escrowId requis' }, { status: 400 });
    const data = processRefund(escrowId);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: e.message.includes('introuvable') ? 404 : 500 });
  }
}
