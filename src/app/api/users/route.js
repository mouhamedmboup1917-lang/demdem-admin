import { NextResponse } from 'next/server';
import { getUsers, banUser, unbanUser, deleteUser } from '@/lib/store';

export async function GET() {
  try {
    return NextResponse.json(getUsers());
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
