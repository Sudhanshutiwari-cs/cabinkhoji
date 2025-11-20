'use client';

import { 
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  PlusIcon,
  QrCodeIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { GatePass } from '@/types';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
}

interface Profile {
  id: string;
  role: string;
  student_id?: string;
}

export default function StudentDashboard() {
  const [gatePasses, setGatePasses] = useState<GatePass[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const router = useRouter();

  const fetchGatePasses = useCallback(async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('gatepasses')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGatePasses(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      // eslint-disable-next-line no-console
      console.error('Error fetching gate passes:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkUserAndFetchData = useCallback(async () => {
    try {
      // 1️⃣ Check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace('/login');
        return;
      }

      setUser(user as User);

      // 2️⃣ Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData) {
        router.replace('/login');
        return;
      }

      setProfile(profileData);

      // 3️⃣ Role check
      if (profileData.role !== 'student') {
        router.replace('/login');
        return;
      }

      // 4️⃣ Fetch gate passes
      await fetchGatePasses(profileData.student_id || user.id);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      // eslint-disable-next-line no-console
      console.error('Error in checkUserAndFetchData:', errorMessage);
      router.replace('/login');
    }
  }, [router, fetchGatePasses]);

  useEffect(() => {
    checkUserAndFetchData();
  }, [checkUserAndFetchData]);

  const filteredPasses = gatePasses.filter(pass => 
    filter === 'all' || pass.status === filter
  );

  const getStatusConfig = (status: string) => {
    const config = {
      approved: { 
        color: 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircleIcon,
        label: 'Approved'
      },
      rejected: { 
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: XCircleIcon,
        label: 'Rejected'
      },
      pending: { 
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: ClockIcon,
        label: 'Pending'
      }
    };
    return config[status as keyof typeof config] || config.pending;
  };

  const getStats = () => {
    const total = gatePasses.length;
    const approved = gatePasses.filter(p => p.status === 'approved').length;
    const pending = gatePasses.filter(p => p.status === 'pending').length;
    const rejected = gatePasses.filter(p => p.status === 'rejected').length;

    return { total, approved, pending, rejected };
  };

  const getUserName = () => {
    if (!user) return 'Student';
    
    return user.user_metadata?.full_name || 
           user.user_metadata?.name || 
           user.email?.split('@')[0] || 
           'Student';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const stats = getStats();

  // Show loading state while checking authentication and role
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            {/* Welcome Skeleton */}
            <div className="h-12 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If no user or profile, don't render the dashboard
  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {getUserName()}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Welcome to your gate pass dashboard. Here's an overview of your requests.
          </p>
        </div>

        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gate Pass Dashboard</h2>
            <p className="text-gray-600 mt-2">Manage and track your gate pass requests</p>
          </div>
          <Link
            href="/student/create-pass"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl mt-4 sm:mt-0"
          >
            <PlusIcon className="w-5 h-5" />
            New Gate Pass
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <XCircleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all' as const, label: 'All Requests', count: stats.total },
            { key: 'pending' as const, label: 'Pending', count: stats.pending },
            { key: 'approved' as const, label: 'Approved', count: stats.approved },
            { key: 'rejected' as const, label: 'Rejected', count: stats.rejected },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === key
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Gate Passes List */}
        <div className="space-y-4">
          {filteredPasses.map((pass) => {
            const statusConfig = getStatusConfig(pass.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div
                key={pass.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {pass.reason}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {statusConfig.label}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          <span>Date: {new Date(pass.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4" />
                          <span>Created: {new Date(pass.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {pass.status === 'approved' && (
                        <Link
                          href={`/student/pass/${pass.id}`}
                          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <QrCodeIcon className="w-4 h-4" />
                          QR Code
                        </Link>
                      )}
                      <Link
                        href={`/student/pass/${pass.id}`}
                        className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredPasses.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="max-w-md mx-auto">
                <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No gate passes found
                </h3>
                <p className="text-gray-600 mb-6">
                  {filter === 'all' 
                    ? "You haven't created any gate pass requests yet."
                    : `No ${filter} gate pass requests found.`
                  }
                </p>
                {filter !== 'all' && (
                  <button
                    onClick={() => setFilter('all')}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    View all requests
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}