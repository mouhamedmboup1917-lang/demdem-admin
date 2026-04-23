import { NextResponse } from 'next/server';
import { getKycQueue } from '@/lib/store';

export async function GET() {
  try {
    return NextResponse.json(getKycQueue());
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
