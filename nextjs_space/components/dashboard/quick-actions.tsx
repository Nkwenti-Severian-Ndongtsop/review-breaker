'use client';

import { motion } from 'framer-motion';
import { Send, History, User, Settings } from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  const actions = [
    {
      icon: Send,
      label: 'Transfer Money',
      href: '/transfer',
      color: 'from-blue-600 to-blue-700',
    },
    {
      icon: History,
      label: 'Transactions',
      href: '/transactions',
      color: 'from-emerald-600 to-emerald-700',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Link key={action.label} href={action.href}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className={`bg-gradient-to-br ${action.color} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-[1.02]`}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{action.label}</p>
                  <p className="text-white/70 text-sm">Quick access</p>
                </div>
              </div>
            </motion.div>
          </Link>
        );
      })}
    </motion.div>
  );
}
