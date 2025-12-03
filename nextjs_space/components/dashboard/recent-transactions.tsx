'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Clock } from 'lucide-react';
import Link from 'next/link';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  timestamp: string;
  fromAccount?: any;
  toAccount?: any;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="banking-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
        <Link
          href="/transactions"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {transactions?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transactions yet</p>
        ) : (
          transactions?.slice(0, 5)?.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="transaction-item"
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className="p-2 bg-gray-50 rounded-lg">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${getTransactionColor(transaction.type)}`}>
                  {transaction.type === 'DEBIT' ? '-' : '+'}
                  ${transaction.amount?.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">{transaction.type}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
