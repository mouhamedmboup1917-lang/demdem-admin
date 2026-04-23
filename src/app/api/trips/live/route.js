import { NextResponse } from 'next/server';
import { getLiveDrivers } from '@/lib/store';

export async function GET() {
  try {
    return NextResponse.json(getLiveDrivers());
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
