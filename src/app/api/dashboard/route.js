export const dynamic = "force-static";
import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/store';

export async function GET() {
    try {
          return NextResponse.json(getDashboardStats());
    } catch (e) {
          return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
