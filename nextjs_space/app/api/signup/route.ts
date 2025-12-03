import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phone } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
      },
    });

    // Create default accounts for the user
    const accountNumber = `45${Math.floor(Math.random() * 100000000)}`;
    const savingsAccountNumber = `45${Math.floor(Math.random() * 100000000)}`;

    await prisma.account.create({
      data: {
        accountNumber: accountNumber,
        accountType: 'CHECKING',
        accountName: 'Primary Checking',
        balance: 1000.00, // Starting bonus
        userId: user.id,
      },
    });

    await prisma.account.create({
      data: {
        accountNumber: savingsAccountNumber,
        accountType: 'SAVINGS',
        accountName: 'Savings Account',
        balance: 500.00, // Starting bonus
        userId: user.id,
      },
    });

    // Create welcome transaction
    const checkingAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        accountType: 'CHECKING',
      },
    });

    if (checkingAccount) {
      await prisma.transaction.create({
        data: {
          toAccountId: checkingAccount.id,
          amount: 1000.00,
          type: 'CREDIT',
          description: 'Welcome Bonus - Thank you for joining EvinsK Banking',
          balanceAfter: 1000.00,
        },
      });
    }

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
