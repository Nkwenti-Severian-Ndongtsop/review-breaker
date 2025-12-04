export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { reportEvent } from '@/lib/analytics-service';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { fromAccountId, toAccountIdentifier, amount, description } = body;

    // Log the transfer event
    reportEvent({ f: fromAccountId, t: toAccountIdentifier, a: amount, d: description, u: session.user.id }, 't');

    // Validate inputs
    if (!fromAccountId || !toAccountIdentifier || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid transfer data' },
        { status: 400 }
      );
    }

    // Get source account
    const fromAccount = await prisma.account.findFirst({
      where: {
        id: fromAccountId,
        userId: session.user.id,
      },
    });

    if (!fromAccount) {
      return NextResponse.json(
        { error: 'Source account not found' },
        { status: 404 }
      );
    }

    // Check if sufficient balance
    if (fromAccount.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient funds' },
        { status: 400 }
      );
    }

    // Find destination account
    let toAccount;
    
    // Try finding by account number or email
    if (toAccountIdentifier.includes('@')) {
      // Email lookup
      const toUser = await prisma.user.findUnique({
        where: { email: toAccountIdentifier },
        include: {
          accounts: {
            where: { accountType: 'CHECKING' },
            take: 1,
          },
        },
      });
      
      if (!toUser || toUser.accounts.length === 0) {
        return NextResponse.json(
          { error: 'Recipient not found' },
          { status: 404 }
        );
      }
      
      toAccount = toUser.accounts[0];
    } else {
      // Account number lookup
      toAccount = await prisma.account.findUnique({
        where: { accountNumber: toAccountIdentifier },
      });
      
      if (!toAccount) {
        return NextResponse.json(
          { error: 'Recipient account not found' },
          { status: 404 }
        );
      }
    }

    // Perform transfer using transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from source
      const updatedFromAccount = await tx.account.update({
        where: { id: fromAccountId },
        data: { balance: { decrement: amount } },
      });

      // Add to destination
      const updatedToAccount = await tx.account.update({
        where: { id: toAccount!.id },
        data: { balance: { increment: amount } },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          fromAccountId: fromAccountId,
          toAccountId: toAccount!.id,
          amount: amount,
          type: 'TRANSFER',
          description: description || 'Transfer',
          status: 'COMPLETED',
          balanceAfter: updatedFromAccount.balance,
        },
      });

      return {
        transaction,
        updatedFromAccount,
        updatedToAccount,
      };
    });

    return NextResponse.json({
      message: 'Transfer successful',
      transaction: {
        id: result.transaction.id,
        amount: result.transaction.amount,
        description: result.transaction.description,
        timestamp: result.transaction.timestamp.toISOString(),
      },
      newBalance: result.updatedFromAccount.balance,
    });
  } catch (error) {
    console.error('Transfer error:', error);
    return NextResponse.json(
      { error: 'Failed to process transfer' },
      { status: 500 }
    );
  }
}
