'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Sparkles, LogOut, Loader2, Crown, XCircle, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  isVerified: boolean;
  isAdmin: boolean;
  plan: string;
  subscriptionStatus: string | null;
  createdAt: string;
}

const planOptions = [
  { value: 'FREE', label: 'Free' },
  { value: 'PRO_MONTHLY', label: 'Pro Monthly' },
  { value: 'PRO_YEARLY', label: 'Pro Yearly' },
  { value: 'BUSINESS_MONTHLY', label: 'Business Monthly' },
  { value: 'BUSINESS_YEARLY', label: 'Business Yearly' },
];

export default function AdminPage() {
  const router = useRouter();
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: editingUser.plan,
          subscriptionStatus: editingUser.subscriptionStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      // Update local state
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      setEditingUser(null);
    } catch (err) {
      console.error('Failed to update user:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getPlanName = (plan: string) => {
    return t(`planNames.${plan}` as any) || plan;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="border-b bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Admin Dashboard</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-violet-600 dark:text-gray-400"
            >
              {tc('dashboard')}
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4" />
              {tc('logout')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Users ({users.length})</h1>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-xl border dark:border-gray-800">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Plan</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Verified</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Joined</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {users.map(user => (
                <tr key={user.id} className="bg-white dark:bg-gray-900">
                  <td className="px-4 py-3 text-sm">
                    {user.email}
                    {user.isAdmin && (
                      <Crown className="ml-2 inline h-4 w-4 text-amber-500" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{getPlanName(user.plan)}</td>
                  <td className="px-4 py-3 text-sm">
                    {user.subscriptionStatus ? (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                        user.subscriptionStatus === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                          : user.subscriptionStatus === 'cancelled'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'
                      }`}>
                        {user.subscriptionStatus === 'active' && <CheckCircle className="h-3 w-3" />}
                        {user.subscriptionStatus === 'cancelled' && <XCircle className="h-3 w-3" />}
                        {user.subscriptionStatus}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {user.isVerified ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditingUser({ ...user })}
                      className="text-sm text-violet-600 hover:underline"
                    >
                      {tc('edit')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-lg font-bold">{tc('edit')} User</h2>
            <p className="mt-1 text-sm text-gray-500">{editingUser.email}</p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Plan</label>
                <select
                  value={editingUser.plan}
                  onChange={(e) => setEditingUser({ ...editingUser, plan: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
                >
                  {planOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Subscription Status</label>
                <select
                  value={editingUser.subscriptionStatus || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, subscriptionStatus: e.target.value || null })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
                >
                  <option value="">None</option>
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                {tc('cancel')}
              </button>
              <button
                onClick={handleSaveUser}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {tc('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
