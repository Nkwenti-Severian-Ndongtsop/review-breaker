'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/dashboard/header';
import { ArrowRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Account {
  id: string;
  accountNumber: string;
  accountType: string;
  accountName: string;
  balance: number;
}

export default function TransferPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountIdentifier: '',
    amount: '',
    description: '',
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

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, fromAccountId: data[0].id }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferring(true);
    setError('');

    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccountId: formData.fromAccountId,
          toAccountIdentifier: formData.toAccountIdentifier,
          amount: parseFloat(formData.amount),
          description: formData.description,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Transfer failed');
      } else {
        setSuccess(true);
        // Refresh accounts to show updated balances
        await fetchAccounts();
        // Reset form after delay
        setTimeout(() => {
          setSuccess(false);
          setFormData({
            fromAccountId: accounts[0]?.id || '',
            toAccountIdentifier: '',
            amount: '',
            description: '',
          });
        }, 3000);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setTransferring(false);
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

  const selectedAccount = accounts?.find((acc) => acc.id === formData.fromAccountId);

  return (
    <div className="min-h-screen">
      <Header userName={session?.user?.name || 'User'} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transfer Money</h1>
          <p className="text-gray-600">
            Send money between your accounts or to other users.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="banking-card p-12 text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-4">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Transfer Successful!
              </h2>
              <p className="text-gray-600 mb-6">
                Your transfer has been completed successfully.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Back to Dashboard
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="banking-card p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* From Account */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Account
                  </label>
                  <select
                    value={formData.fromAccountId}
                    onChange={(e) =>
                      setFormData({ ...formData, fromAccountId: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  >
                    {accounts?.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.accountName} - **** {account.accountNumber?.slice(-4)} - $
                        {account.balance?.toFixed(2)}
                      </option>
                    ))}
                  </select>
                  {selectedAccount && (
                    <p className="mt-2 text-sm text-gray-600">
                      Available Balance: ${selectedAccount.balance?.toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className="flex items-center justify-center">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <ArrowRight className="w-5 h-5 text-blue-600" />
                  </div>
                </div>

                {/* To Account */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Account (Account Number or Email)
                  </label>
                  <input
                    type="text"
                    value={formData.toAccountIdentifier}
                    onChange={(e) =>
                      setFormData({ ...formData, toAccountIdentifier: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter account number or email"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Enter the recipient's account number or email address
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="What's this transfer for?"
                    rows={3}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg"
                  >
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}

                {/* Submit Button */}
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={transferring}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                  >
                    {transferring ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-5 w-5" />
                        Processing...
                      </>
                    ) : (
                      'Transfer Now'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
