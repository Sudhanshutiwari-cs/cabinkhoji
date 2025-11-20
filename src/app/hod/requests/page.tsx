'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { GatePass } from '@/types';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFilter, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiUser, 
  FiBook, 
  FiCalendar,
  FiHash,
  FiMessageSquare,
  FiRefreshCw,
  FiAlertCircle,
  FiDownload,
  FiAward
} from 'react-icons/fi';

interface Profile {
  id: string;
  name: string;
  roll: string;
  department: string;
  role: 'student' | 'hod' | 'guard';
  created_at: string;
}

interface GatePassWithStudent extends GatePass {
  student: {
    name: string;
    roll: string;
    department: string;
  };
  hod_id: string;
}

export default function HODRequests() {
  const [gatePasses, setGatePasses] = useState<GatePassWithStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userDepartment, setUserDepartment] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    checkUserRoleAndDepartment();
  }, []);

  useEffect(() => {
    if (userRole === 'hod' && userId) {
      fetchGatePasses();
    }
  }, [userRole, userId, filter]);

  const checkUserRoleAndDepartment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUnauthorized(true);
        setDebugInfo('No user found in authentication');
        return;
      }

      console.log('Current user ID:', user.id);
      setUserId(user.id);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, department, name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setDebugInfo(`Profile error: ${error.message}`);
        setUnauthorized(true);
        return;
      }

      console.log('User profile:', profile);

      if (!profile || profile.role !== 'hod') {
        console.log('Unauthorized: User is not HOD');
        setDebugInfo(`User role is: ${profile?.role}, expected: hod`);
        setUnauthorized(true);
        return;
      }

      setUserRole(profile.role);
      setUserDepartment(profile.department);
      setDebugInfo(`Authenticated as HOD: ${profile.name}, Department: ${profile.department}`);
      
    } catch (error) {
      console.error('Error checking user role:', error);
      setDebugInfo(`Error: ${error}`);
      setUnauthorized(true);
    }
  };

  const fetchGatePasses = async () => {
    try {
      setLoading(true);
      console.log('Fetching gate passes for HOD ID:', userId);

      // Fetch gate passes assigned to this HOD using hod_id column
      let query = supabase
        .from('gatepasses')
        .select(`
          *,
          student:profiles!student_id (
            name,
            roll,
            department
          )
        `)
        .eq('hod_id', userId)
        .order('created_at', { ascending: false });

      // Apply status filter
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase query error:', error);
        setDebugInfo(prev => prev + ` | Query error: ${error.message}`);
        throw error;
      }

      console.log('Fetched gate passes for HOD:', data);
      setGatePasses(data || []);
      setDebugInfo(prev => prev + ` | Found ${data?.length} passes for HOD`);
      
    } catch (error: any) {
      console.error('Error fetching gate passes:', error.message);
      if (error.details) {
        console.error('Error details:', error.details);
        setDebugInfo(prev => prev + ` | Details: ${error.details}`);
      }
      if (error.hint) {
        console.error('Error hint:', error.hint);
        setDebugInfo(prev => prev + ` | Hint: ${error.hint}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (passId: string, studentId: string) => {
    try {
      const qrData = {
        passId,
        studentId,
        timestamp: new Date().toISOString(),
        department: userDepartment
      };

      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#2563eb',
          light: '#ffffff'
        }
      });

      const response = await fetch(qrCodeDataURL);
      const blob = await response.blob();

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('qr-codes')
        .upload(`${passId}.png`, blob, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('qr-codes')
        .getPublicUrl(`${passId}.png`);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  };

  const handleApprove = async (passId: string, studentId: string) => {
    try {
      setProcessing(passId);
      
      const qrUrl = await generateQRCode(passId, studentId);

      const { error } = await supabase
        .from('gatepasses')
        .update({
          status: 'approved',
          qr_url: qrUrl
        })
        .eq('id', passId)
        .eq('hod_id', userId);

      if (error) throw error;

      showNotification('Gate pass approved successfully! QR code generated.', 'success');
      fetchGatePasses();
    } catch (error: any) {
      console.error('Approval error:', error);
      showNotification('Error approving gate pass: ' + error.message, 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (passId: string) => {
    try {
      setProcessing(passId);
      
      const { error } = await supabase
        .from('gatepasses')
        .update({ 
          status: 'rejected',
          qr_url: null
        })
        .eq('id', passId)
        .eq('hod_id', userId);

      if (error) throw error;

      showNotification('Gate pass rejected.', 'warning');
      fetchGatePasses();
    } catch (error: any) {
      console.error('Rejection error:', error);
      showNotification('Error rejecting gate pass: ' + error.message, 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleUndo = async (passId: string) => {
    try {
      setProcessing(passId);
      
      const { error } = await supabase
        .from('gatepasses')
        .update({ 
          status: 'pending',
          qr_url: null
        })
        .eq('id', passId)
        .eq('hod_id', userId);

      if (error) throw error;

      showNotification('Gate pass status reset to pending.', 'info');
      fetchGatePasses();
    } catch (error: any) {
      console.error('Undo error:', error);
      showNotification('Error resetting gate pass: ' + error.message, 'error');
    } finally {
      setProcessing(null);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    alert(message);
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { 
        color: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        icon: FiClock,
        label: 'Pending Review'
      },
      approved: { 
        color: 'bg-green-50 text-green-800 border-green-200',
        icon: FiCheckCircle,
        label: 'Approved'
      },
      rejected: { 
        color: 'bg-red-50 text-red-800 border-red-200',
        icon: FiXCircle,
        label: 'Rejected'
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const downloadQRCode = async (qrUrl: string, studentName: string) => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `gate-pass-${studentName.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      showNotification('Error downloading QR code', 'error');
    }
  };

  const filteredPasses = gatePasses.filter(pass => {
    if (filter === 'all') return true;
    return pass.status === filter;
  });

  // Debug information component
 

  // Unauthorized access
  if (unauthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            This section is restricted to Head of Department (HOD) only. 
          </p>
          <div className="bg-gray-100 p-3 rounded-lg mb-4 text-left">
            <p className="text-sm text-gray-700"><strong>Debug Info:</strong> {debugInfo}</p>
            <p className="text-sm text-gray-700"><strong>Your Role:</strong> {userRole || 'Not set'}</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Go to Dashboard
            </button>
            <button
              onClick={checkUserRoleAndDepartment}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Retry Access Check
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading && !gatePasses.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">

          
          {/* Header Skeleton */}
          <div className="animate-pulse mb-8">
            <div className="h-8 bg-gray-300 rounded-lg w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
            
            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
          
          {/* Filter Skeleton */}
          <div className="animate-pulse mb-8">
            <div className="h-10 bg-gray-300 rounded-lg w-48 mb-4"></div>
          </div>
          
          {/* Content Skeleton */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-2xl mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Debug Info - Remove in production */}
 

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FiAward className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Gate Pass Requests
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {userDepartment ? `${userDepartment.toUpperCase()} Department - HOD Portal` : 'HOD Portal'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <div className="text-right">
                <p className="text-sm text-gray-600">Assigned Requests</p>
                <p className="font-semibold text-gray-900">
                  {gatePasses.length} total
                </p>
              </div>
              <button
                onClick={fetchGatePasses}
                disabled={loading}
                className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { status: 'pending', count: gatePasses.filter(p => p.status === 'pending').length },
              { status: 'approved', count: gatePasses.filter(p => p.status === 'approved').length },
              { status: 'rejected', count: gatePasses.filter(p => p.status === 'rejected').length }
            ].map((stat, index) => {
              const config = getStatusConfig(stat.status);
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={stat.status}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{config.label}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stat.count}</p>
                      <p className="text-xs text-gray-500 mt-1">Assigned to you</p>
                    </div>
                    <div className={`p-3 rounded-xl ${config.color.replace('bg-', 'bg-').split(' ')[0]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center space-x-2 text-gray-600 mr-4">
              <FiFilter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter by status:</span>
            </div>
            {(['all', 'pending', 'approved', 'rejected'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                  filter === filterType
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                <span>{filterType.charAt(0).toUpperCase() + filterType.slice(1)}</span>
                {filterType !== 'all' && (
                  <span className="px-2 py-1 text-xs bg-white/20 rounded-full">
                    {gatePasses.filter(p => p.status === filterType).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Gate Pass List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {filteredPasses.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMessageSquare className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No gate pass requests found
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-4">
                  {userId === '3123631e-455c-49d8-9ab3-8ca24aaae20b' 
                    ? "You should see one gate pass with ID: b544640a-0992-4747-baaf-7adfd7088cc8"
                    : "No gate pass requests are currently assigned to your HOD account."
                  }
                </p>
                <div className="space-y-3">
                  <button
                    onClick={fetchGatePasses}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Check Again
                  </button>
                  <button
                    onClick={() => {
                      console.log('Current user ID:', userId);
                      console.log('Expected HOD ID:', '3123631e-455c-49d8-9ab3-8ca24aaae20b');
                      console.log('Gate passes:', gatePasses);
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors ml-2"
                  >
                    Debug Console
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.ul
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="divide-y divide-gray-200"
              >
                {filteredPasses.map((pass, index) => {
                  const statusConfig = getStatusConfig(pass.status);
                  const StatusIcon = statusConfig.icon;
                  const student = pass.student;
                  
                  return (
                    <motion.li
                      key={pass.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                          {/* Student Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                  <FiUser className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {student?.name || 'Unknown Student'}
                                  </h3>
                                  <p className="text-gray-500 text-sm">
                                    Roll No: {student?.roll || 'N/A'}
                                  </p>
                                </div>
                              </div>
                              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${statusConfig.color}`}>
                                <StatusIcon className="w-4 h-4" />
                                <span className="text-sm font-medium">{statusConfig.label}</span>
                              </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                              <div className="flex items-center space-x-2 text-gray-600">
                                <FiBook className="w-4 h-4" />
                                <span className="text-sm">Roll: <strong className="text-gray-900">{student?.roll || 'N/A'}</strong></span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-600">
                                <FiBook className="w-4 h-4" />
                                <span className="text-sm">Dept: <strong className="text-gray-900">{student?.department || 'N/A'}</strong></span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-600">
                                <FiCalendar className="w-4 h-4" />
                                <span className="text-sm">Date: <strong className="text-gray-900">{new Date(pass.date).toLocaleDateString()}</strong></span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-600">
                                <FiHash className="w-4 h-4" />
                                <span className="text-sm">ID: <strong className="text-gray-900 font-mono text-xs">{pass.id}</strong></span>
                              </div>
                            </div>

                            {/* Reason */}
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">Reason for Request:</p>
                              <p className="text-gray-900 bg-gray-50 rounded-lg p-3 border">{pass.reason}</p>
                            </div>

                            {/* Dates */}
                            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                              <span>Submitted: {new Date(pass.created_at).toLocaleString()}</span>
                            </div>

                            {/* QR Code Info */}
                            {pass.qr_url && (
                              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 text-green-800">
                                    <FiCheckCircle className="w-4 h-4" />
                                    <span className="text-sm font-medium">QR Code Generated</span>
                                  </div>
                                  <button
                                    onClick={() => downloadQRCode(pass.qr_url!, student?.name)}
                                    className="flex items-center space-x-1 text-green-700 hover:text-green-800 text-sm font-medium px-3 py-1 rounded-lg bg-green-100 hover:bg-green-200 transition-colors"
                                  >
                                    <FiDownload className="w-3 h-3" />
                                    <span>Download</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col space-y-3 min-w-[140px]">
                            {pass.status === 'pending' && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleApprove(pass.id, pass.student_id)}
                                  disabled={processing === pass.id}
                                  className="bg-green-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-green-500/25"
                                >
                                  {processing === pass.id ? (
                                    <div className="flex items-center justify-center space-x-2">
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      <span>Approving...</span>
                                    </div>
                                  ) : (
                                    'Approve Request'
                                  )}
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleReject(pass.id)}
                                  disabled={processing === pass.id}
                                  className="bg-red-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  {processing === pass.id ? 'Rejecting...' : 'Reject Request'}
                                </motion.button>
                              </>
                            )}
                            
                            {(pass.status === 'approved' || pass.status === 'rejected') && (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleUndo(pass.id)}
                                disabled={processing === pass.id}
                                className="bg-gray-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {processing === pass.id ? 'Resetting...' : 'Reset to Pending'}
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}