'use client';

import { motion } from 'framer-motion';
import { CreditCard, TrendingUp, Copy } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface AccountCardProps {
  account: {
    id: string;
    accountNumber: string;
    accountType: string;
    accountName: string;
    balance: number;
  };
  index: number;
}

export function AccountCard({ account, index }: AccountCardProps) {
  const [copied, setCopied] = useState(false);
  const accountTypeColor = {
    CHECKING: 'from-blue-600 to-blue-700',
    SAVINGS: 'from-emerald-600 to-emerald-700',
    CREDIT: 'from-purple-600 to-purple-700',
  };

  const bgGradient = accountTypeColor[account.accountType as keyof typeof accountTypeColor] || 'from-gray-600 to-gray-700';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className={`bg-gradient-to-br ${bgGradient} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm mb-1">{account.accountName}</p>
            <div className="flex items-center gap-2">
              <p className="text-white/90 text-xs font-mono">{account.accountNumber}</p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(account.accountNumber);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  } catch (_) {}
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded bg-white/10 hover:bg-white/15 transition"
                aria-label="Copy account number"
                title={copied ? 'Copied!' : 'Copy'}
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-6">
          <p className="text-white/80 text-xs mb-1">Available Balance</p>
          <p className="text-3xl font-bold count-up">
            ${account.balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="mt-4 flex items-center text-white/60 text-xs">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span>{account.accountType}</span>
        </div>
      </div>
    </motion.div>
  );
}
