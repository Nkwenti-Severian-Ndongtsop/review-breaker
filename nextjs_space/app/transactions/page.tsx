'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/dashboard/header';
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Clock,
  Loader2,
  Filter,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  balanceAfter?: number;
  fromAccount?: {
    accountNumber: string;
    accountName: string;
    accountType: string;
  };
  toAccount?: {
    accountNumber: string;
    accountName: string;
    accountType: string;
  };
}

export default function TransactionsPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    accountId: '',
    type: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAccounts();
    }
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTransactions();
    }
  }, [status, filters]);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.accountId) params.append('accountId', filters.accountId);
      if (filters.type) params.append('type', filters.type);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('limit', '100');

      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      accountId: '',
      type: '',
      startDate: '',
      endDate: '',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'CREDIT':
        return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
      case 'DEBIT':
        return <ArrowUpRight className="w-5 h-5 text-red-600" />;
      case 'TRANSFER':
        return <ArrowLeftRight className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'CREDIT':
        return 'text-green-600';
      case 'DEBIT':
        return 'text-red-600';
      case 'TRANSFER':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (status === 'loading' || (loading && transactions?.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const hasActiveFilters =
    filters.accountId || filters.type || filters.startDate || filters.endDate;

  return (
    <div className="min-h-screen">
      <Header userName={session?.user?.name || 'User'} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Transaction History
              </h1>
              <p className="text-gray-600">
                View and filter all your banking transactions.
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filters</span>
            </button>
          </div>
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="banking-card p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account
                  </label>
                  <select
                    value={filters.accountId}
                    onChange={(e) =>
                      setFilters({ ...filters, accountId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Accounts</option>
                    {accounts?.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.accountName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters({ ...filters, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    <option value="CREDIT">Credit</option>
                    <option value="DEBIT">Debit</option>
                    <option value="TRANSFER">Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      setFilters({ ...filters, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      setFilters({ ...filters, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="banking-card"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
          ) : transactions?.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No transactions found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {transactions?.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {transaction.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {transaction.fromAccount && (
                            <p className="text-xs text-gray-500">
                              From: **** {transaction.fromAccount.accountNumber?.slice(-4)}
                            </p>
                          )}
                          {transaction.toAccount && (
                            <p className="text-xs text-gray-500">
                              To: **** {transaction.toAccount.accountNumber?.slice(-4)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p
                        className={`text-lg font-semibold ${getTransactionColor(
                          transaction.type
                        )}`}
                      >
                        {transaction.type === 'DEBIT' ? '-' : '+'}
                        ${transaction.amount?.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {transaction.type}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
