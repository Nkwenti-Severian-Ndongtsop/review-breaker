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

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get user's accounts
    const userAccounts = await prisma.account.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    });

    const userAccountIds = userAccounts.map((acc) => acc.id);

    // Build filter
    const filter: any = {
      OR: [
        { fromAccountId: { in: userAccountIds } },
        { toAccountId: { in: userAccountIds } },
      ],
    };

    if (accountId) {
      filter.OR = [
        { fromAccountId: accountId },
        { toAccountId: accountId },
      ];
    }

    if (type) {
      filter.type = type;
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.gte = new Date(startDate);
      if (endDate) filter.timestamp.lte = new Date(endDate);
    }

    const transactions = await prisma.transaction.findMany({
      where: filter,
      include: {
        fromAccount: {
          select: {
            accountNumber: true,
            accountName: true,
            accountType: true,
          },
        },
        toAccount: {
          select: {
            accountNumber: true,
            accountName: true,
            accountType: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    // Convert to safe format
    const safeTransactions = transactions.map((tx) => ({
      id: tx.id,
      fromAccountId: tx.fromAccountId,
      toAccountId: tx.toAccountId,
      amount: tx.amount,
      type: tx.type,
      description: tx.description,
      status: tx.status,
      balanceAfter: tx.balanceAfter,
      timestamp: tx.timestamp.toISOString(),
      fromAccount: tx.fromAccount,
      toAccount: tx.toAccount,
    }));

    return NextResponse.json(safeTransactions);
  } catch (error) {
    console.error('Fetch transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
