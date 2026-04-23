import { NextResponse } from 'next/server';
import { banUser, unbanUser, deleteUser } from '@/lib/store';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const action = url.pathname.split('/').pop(); // 'ban' or 'unban'

    if (action === 'ban') {
      return NextResponse.json(banUser(id));
    } else if (action === 'unban') {
      return NextResponse.json(unbanUser(id));
    }
    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    return NextResponse.json(deleteUser(id));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
}
