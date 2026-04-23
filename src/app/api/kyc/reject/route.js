import { NextResponse } from 'next/server';
import { rejectDriver } from '@/lib/store';

export async function POST(request) {
  try {
    const { driverId, reason } = await request.json();
    if (!driverId || !reason) return NextResponse.json({ error: 'driverId et reason requis' }, { status: 400 });
    const queue = rejectDriver(driverId, reason);
    return NextResponse.json(queue);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
