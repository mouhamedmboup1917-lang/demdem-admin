import { NextResponse } from 'next/server';
import { getWithdrawals, processWithdrawal } from '@/lib/store';

export async function GET() {
  try {
    return NextResponse.json(getWithdrawals());
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { withdrawalId, action } = await request.json();
    if (!withdrawalId || !['validate', 'refuse'].includes(action)) {
      return NextResponse.json({ error: 'withdrawalId et action (validate|refuse) requis' }, { status: 400 });
    }
    const result = processWithdrawal(withdrawalId, action);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: e.message.includes('déjà') ? 409 : 500 });
  }
}
