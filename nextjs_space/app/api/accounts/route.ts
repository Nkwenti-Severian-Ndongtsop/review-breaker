export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accounts = await prisma.account.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' },
    });

    // Convert to safe format
    const safeAccounts = accounts.map((account) => ({
      id: account.id,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      accountName: account.accountName,
      balance: account.balance,
      createdAt: account.createdAt.toISOString(),
    }));

    return NextResponse.json(safeAccounts);
  } catch (error) {
    console.error('Fetch accounts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}
