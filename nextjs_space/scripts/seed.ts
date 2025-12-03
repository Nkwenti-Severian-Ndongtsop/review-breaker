import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Hash passwords
  const hashedPassword1 = await bcrypt.hash('johndoe123', 10);
  const hashedPassword2 = await bcrypt.hash('password123', 10);
  const hashedPassword3 = await bcrypt.hash('demo2024', 10);

  // Create test/admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'john@doe.com',
      password: hashedPassword1,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-555-0100',
    },
  });

  // Create demo user 1
  const user1 = await prisma.user.create({
    data: {
      email: 'sarah.johnson@email.com',
      password: hashedPassword2,
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1-555-0101',
    },
  });

  // Create demo user 2
  const user2 = await prisma.user.create({
    data: {
      email: 'michael.chen@email.com',
      password: hashedPassword3,
      firstName: 'Michael',
      lastName: 'Chen',
      phone: '+1-555-0102',
    },
  });

  // Create accounts for admin user
  const adminChecking = await prisma.account.create({
    data: {
      accountNumber: '4500001000',
      accountType: 'CHECKING',
      accountName: 'Primary Checking',
      balance: 15420.50,
      userId: adminUser.id,
    },
  });

  const adminSavings = await prisma.account.create({
    data: {
      accountNumber: '4500001001',
      accountType: 'SAVINGS',
      accountName: 'High Yield Savings',
      balance: 48750.00,
      userId: adminUser.id,
    },
  });

  // Create accounts for user 1
  const user1Checking = await prisma.account.create({
    data: {
      accountNumber: '4500002000',
      accountType: 'CHECKING',
      accountName: 'Personal Checking',
      balance: 8520.75,
      userId: user1.id,
    },
  });

  const user1Savings = await prisma.account.create({
    data: {
      accountNumber: '4500002001',
      accountType: 'SAVINGS',
      accountName: 'Emergency Fund',
      balance: 25000.00,
      userId: user1.id,
    },
  });

  // Create accounts for user 2
  const user2Checking = await prisma.account.create({
    data: {
      accountNumber: '4500003000',
      accountType: 'CHECKING',
      accountName: 'Business Checking',
      balance: 42100.30,
      userId: user2.id,
    },
  });

  const user2Savings = await prisma.account.create({
    data: {
      accountNumber: '4500003001',
      accountType: 'SAVINGS',
      accountName: 'Investment Savings',
      balance: 67890.50,
      userId: user2.id,
    },
  });

  console.log('✅ Users and accounts created');

  // Create transactions for admin user
  const adminTransactions: any[] = [
    {
      fromAccountId: null,
      toAccountId: adminChecking.id,
      amount: 3500.00,
      type: 'CREDIT',
      description: 'Salary Deposit - Direct Deposit',
      balanceAfter: 15420.50,
      timestamp: new Date('2024-11-25T09:00:00'),
    },
    {
      fromAccountId: adminChecking.id,
      toAccountId: null,
      amount: 1250.00,
      type: 'DEBIT',
      description: 'Rent Payment - November',
      balanceAfter: 14170.50,
      timestamp: new Date('2024-11-20T14:30:00'),
    },
    {
      fromAccountId: adminChecking.id,
      toAccountId: adminSavings.id,
      amount: 1000.00,
      type: 'TRANSFER',
      description: 'Monthly Savings Transfer',
      balanceAfter: 13170.50,
      timestamp: new Date('2024-11-15T10:00:00'),
    },
    {
      fromAccountId: adminChecking.id,
      toAccountId: null,
      amount: 85.50,
      type: 'DEBIT',
      description: 'Grocery Store Purchase',
      balanceAfter: 13085.00,
      timestamp: new Date('2024-11-18T16:45:00'),
    },
    {
      fromAccountId: adminChecking.id,
      toAccountId: null,
      amount: 45.00,
      type: 'DEBIT',
      description: 'Gas Station',
      balanceAfter: 13040.00,
      timestamp: new Date('2024-11-17T08:20:00'),
    },
    {
      fromAccountId: null,
      toAccountId: adminSavings.id,
      amount: 250.00,
      type: 'CREDIT',
      description: 'Interest Payment',
      balanceAfter: 48750.00,
      timestamp: new Date('2024-11-01T00:00:00'),
    },
    {
      fromAccountId: adminChecking.id,
      toAccountId: null,
      amount: 120.00,
      type: 'DEBIT',
      description: 'Electric Bill Payment',
      balanceAfter: 12920.00,
      timestamp: new Date('2024-11-10T11:00:00'),
    },
    {
      fromAccountId: adminChecking.id,
      toAccountId: null,
      amount: 75.00,
      type: 'DEBIT',
      description: 'Internet Service',
      balanceAfter: 12845.00,
      timestamp: new Date('2024-11-08T09:30:00'),
    },
    {
      fromAccountId: null,
      toAccountId: adminChecking.id,
      amount: 150.00,
      type: 'CREDIT',
      description: 'Freelance Work Payment',
      balanceAfter: 12995.00,
      timestamp: new Date('2024-11-12T15:00:00'),
    },
    {
      fromAccountId: adminChecking.id,
      toAccountId: user1Checking.id,
      amount: 200.00,
      type: 'TRANSFER',
      description: 'Birthday Gift',
      balanceAfter: 12795.00,
      timestamp: new Date('2024-11-14T12:00:00'),
    },
  ];

  // Create transactions for user 1
  const user1Transactions: any[] = [
    {
      fromAccountId: null,
      toAccountId: user1Checking.id,
      amount: 2800.00,
      type: 'CREDIT',
      description: 'Payroll Deposit',
      balanceAfter: 8520.75,
      timestamp: new Date('2024-11-26T07:00:00'),
    },
    {
      fromAccountId: user1Checking.id,
      toAccountId: null,
      amount: 950.00,
      type: 'DEBIT',
      description: 'Rent Payment',
      balanceAfter: 7570.75,
      timestamp: new Date('2024-11-22T10:00:00'),
    },
    {
      fromAccountId: adminChecking.id,
      toAccountId: user1Checking.id,
      amount: 200.00,
      type: 'CREDIT',
      description: 'Birthday Gift',
      balanceAfter: 7770.75,
      timestamp: new Date('2024-11-14T12:00:00'),
    },
    {
      fromAccountId: user1Checking.id,
      toAccountId: user1Savings.id,
      amount: 500.00,
      type: 'TRANSFER',
      description: 'Monthly Savings',
      balanceAfter: 7270.75,
      timestamp: new Date('2024-11-16T09:00:00'),
    },
  ];

  // Create transactions for user 2
  const user2Transactions: any[] = [
    {
      fromAccountId: null,
      toAccountId: user2Checking.id,
      amount: 8500.00,
      type: 'CREDIT',
      description: 'Client Payment - Invoice #1024',
      balanceAfter: 42100.30,
      timestamp: new Date('2024-11-24T11:30:00'),
    },
    {
      fromAccountId: user2Checking.id,
      toAccountId: null,
      amount: 2200.00,
      type: 'DEBIT',
      description: 'Office Rent',
      balanceAfter: 39900.30,
      timestamp: new Date('2024-11-19T14:00:00'),
    },
    {
      fromAccountId: user2Checking.id,
      toAccountId: user2Savings.id,
      amount: 3000.00,
      type: 'TRANSFER',
      description: 'Business Savings',
      balanceAfter: 36900.30,
      timestamp: new Date('2024-11-13T16:00:00'),
    },
  ];

  // Insert all transactions
  await prisma.transaction.createMany({
    data: [...adminTransactions, ...user1Transactions, ...user2Transactions] as any,
  });

  console.log('✅ Transactions created');
  console.log('🎉 Seeding completed successfully!');
  console.log('\n📧 Test Accounts:');
  console.log('   - john@doe.com / johndoe123 (Admin)');
  console.log('   - sarah.johnson@email.com / password123');
  console.log('   - michael.chen@email.com / demo2024');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
