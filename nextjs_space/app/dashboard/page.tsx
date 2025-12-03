'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/dashboard/header';
import { AccountCard } from '@/components/dashboard/account-card';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Loader2, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

interface Account {
  id: string;
  accountNumber: string;
  accountType: string;
  accountName: string;
  balance: number;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  timestamp: string;
  fromAccount?: any;
  toAccount?: any;
}

export default function DashboardPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      // Fetch accounts
      const accountsRes = await fetch('/api/accounts');
      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setAccounts(accountsData);
        
        // Calculate total balance
        const total = accountsData.reduce((sum: number, acc: Account) => sum + acc.balance, 0);
        setTotalBalance(total);
      }

      // Fetch recent transactions
      const transactionsRes = await fetch('/api/transactions?limit=10');
      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header userName={session?.user?.name || 'User'} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">
            Manage your finances with ease and security.
          </p>
        </motion.div>

        {/* Total Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="banking-gradient text-white p-8 rounded-2xl shadow-2xl mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-2">Total Balance</p>
              <p className="text-5xl font-bold count-up">
                ${totalBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-white/60 text-sm mt-2">
                Across {accounts?.length} account{accounts?.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
              <Wallet className="w-12 h-12" />
            </div>
          </div>
        </motion.div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {accounts?.map((account, index) => (
            <AccountCard key={account.id} account={account} index={index} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions />
        </div>

        {/* Recent Transactions */}
        <RecentTransactions transactions={transactions} />
      </main>
    </div>
  );
}
