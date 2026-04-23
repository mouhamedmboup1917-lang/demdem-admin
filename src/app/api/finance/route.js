import { NextResponse } from 'next/server';
import { getFinanceState } from '@/lib/store';

export async function GET() {
  try {
    const data = getFinanceState();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
