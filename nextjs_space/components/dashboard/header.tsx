'use client';

import { motion } from 'framer-motion';
import { Building2, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

interface HeaderProps {
  userName?: string;
}

export function Header({ userName }: HeaderProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">EvinsK Banking</span>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">Welcome back,</p>
              <p className="text-xs text-gray-600">{userName}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
