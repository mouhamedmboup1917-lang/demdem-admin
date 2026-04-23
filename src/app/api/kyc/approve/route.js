import { NextResponse } from 'next/server';
import { approveDriver } from '@/lib/store';

export async function POST(request) {
  try {
    const { driverId } = await request.json();
    if (!driverId) return NextResponse.json({ error: 'driverId requis' }, { status: 400 });
    const queue = approveDriver(driverId);
    return NextResponse.json(queue);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
