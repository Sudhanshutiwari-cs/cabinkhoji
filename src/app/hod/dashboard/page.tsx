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
  FiAward,
  FiLogOut,
  FiUsers,
  FiList,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface Profile {
  id: string;
  name: string;
  roll: string;
  department: string;
  role: 'student' | 'hod' | 'guard';
  created_at: string;
  year: number;
}

interface GatePassWithStudent extends GatePass {
  student: {
    id: string;
    name: string;
    roll: string;
    department: string;
    role: 'student' | 'hod' | 'guard';
    created_at: string;
    year: number;
  };
  hod_id: string;
}

interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
}

interface QRCodeData {
  passId: string;
  studentId: string;
  timestamp: string;
  department: string | null;
}

interface Student {
  id: string;
  name: string;
  roll: string;
  department: string;
  role: string;
  created_at: string;
  year: number;
}

type ViewMode = 'gatepasses' | 'students';

export default function HODRequests() {
  const router = useRouter();
  const [gatePasses, setGatePasses] = useState<GatePassWithStudent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userDepartment, setUserDepartment] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('gatepasses');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [promoteDemoteLoading, setPromoteDemoteLoading] = useState<string | null>(null);

  useEffect(() => {
    checkUserRoleAndDepartment();
  }, []);

  useEffect(() => {
    if (userRole === 'hod' && userId && userDepartment) {
      if (viewMode === 'gatepasses') {
        fetchGatePasses();
      } else {
        fetchStudents();
      }
    }
  }, [userRole, userId, userDepartment, filter, viewMode, selectedYear]);

  const checkUserRoleAndDepartment = async (): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUnauthorized(true);
        setDebugInfo('No user found in authentication');
        router.push('/login');
        return;
      }

      setUserId(user.id);
      console.log('User ID:', user.id);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, department, name, year')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Profile error:', error);
        setDebugInfo(`Profile error: ${error.message}`);
        setUnauthorized(true);
        router.push('/login');
        return;
      }

      console.log('Profile data:', profile);

      if (!profile || profile.role !== 'hod') {
        setDebugInfo(`User role is: ${profile?.role}, expected: hod`);
        setUnauthorized(true);
        router.push('/login');
        return;
      }

      setUserRole(profile.role);
      setUserDepartment(profile.department);
      setDebugInfo(`Authenticated as HOD: ${profile.name}, Department: ${profile.department}`);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Authentication error:', error);
      setDebugInfo(`Error: ${errorMessage}`);
      setUnauthorized(true);
      router.push('/login');
    }
  };

  const fetchGatePasses = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('Fetching gate passes for HOD:', userId, 'Department:', userDepartment);

      // First, let's try to get all gate passes to see what's available
      const { data: allPasses, error: allError } = await supabase
        .from('gatepasses')
        .select('*')
        .order('created_at', { ascending: false });

      if (allError) {
        console.error('Error fetching all gate passes:', allError);
        setDebugInfo(prev => prev + ` | All passes error: ${allError.message}`);
      } else {
        console.log('All gate passes:', allPasses);
      }

      // Try multiple query approaches to find what works
      let query = supabase
        .from('gatepasses')
        .select(`
          *,
          student:profiles!student_id (
            name,
            roll,
            department,
            year
          )
        `)
        .order('created_at', { ascending: false });

      // Approach 1: Filter by HOD's department through student relationship
      if (userDepartment) {
        query = query.eq('student.department', userDepartment);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Gate passes query error:', error);
        setDebugInfo(prev => prev + ` | Query error: ${error.message}`);
        
        // If the first approach fails, try a different approach
        await fetchGatePassesAlternative();
        return;
      }

      console.log('Filtered gate passes:', data);
      setGatePasses(data || []);
      setDebugInfo(prev => prev + ` | Found ${data?.length} passes for department ${userDepartment}`);
      
    } catch (error: unknown) {
      const err = error as SupabaseError;
      console.error('Unexpected error:', error);
      if (err.details) {
        setDebugInfo(prev => prev + ` | Details: ${err.details}`);
      }
      if (err.hint) {
        setDebugInfo(prev => prev + ` | Hint: ${err.hint}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchGatePassesAlternative = async (): Promise<void> => {
    try {
      console.log('Trying alternative gate pass fetch approach...');
      
      // Alternative approach: Get students first, then their gate passes
      const { data: departmentStudents, error: studentsError } = await supabase
        .from('profiles')
        .select('id')
        .eq('department', userDepartment)
        .eq('role', 'student');

      if (studentsError) {
        console.error('Error fetching department students:', studentsError);
        return;
      }

      if (!departmentStudents || departmentStudents.length === 0) {
        console.log('No students found in department:', userDepartment);
        setGatePasses([]);
        return;
      }

      const studentIds = departmentStudents.map(student => student.id);
      console.log('Student IDs in department:', studentIds);

      const { data: passes, error: passesError } = await supabase
        .from('gatepasses')
        .select(`
          *,
          student:profiles!student_id (
            name,
            roll,
            department,
            year
          )
        `)
        .in('student_id', studentIds)
        .order('created_at', { ascending: false });

      if (passesError) {
        console.error('Error fetching passes for students:', passesError);
        return;
      }

      console.log('Gate passes via student IDs:', passes);
      setGatePasses(passes || []);
      setDebugInfo(prev => prev + ` | Alternative approach found ${passes?.length} passes`);
      
    } catch (error) {
      console.error('Alternative approach error:', error);
    }
  };
const fetchStudents = async (): Promise<void> => {
  try {
    setStudentsLoading(true);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('department', userDepartment)
      .eq('role', 'student')
      .order('year', { ascending: false })
      .order('roll', { ascending: true });

    if (error) {
      console.error('Students query error:', error);
      setDebugInfo(prev => prev + ` | Students query error: ${error.message}`);
      throw error;
    }

    // Convert year from string to number for local state
    const studentsWithNumberYear = (data || []).map(student => ({
      ...student,
      year: parseInt(student.year || '1', 10) // Convert string to number, default to 1 if null
    }));

    console.log('Department students:', studentsWithNumberYear);
    setStudents(studentsWithNumberYear);
    setDebugInfo(prev => prev + ` | Found ${data?.length} students`);
    
  } catch (error: unknown) {
    const err = error as SupabaseError;
    console.error('Students fetch error:', error);
    if (err.details) {
      setDebugInfo(prev => prev + ` | Details: ${err.details}`);
    }
    if (err.hint) {
      setDebugInfo(prev => prev + ` | Hint: ${err.hint}`);
    }
  } finally {
    setStudentsLoading(false);
  }
};

  const handlePromoteStudent = async (studentId: string, currentYear: number): Promise<void> => {
  try {
    setPromoteDemoteLoading(studentId);
    
    console.log('Promoting student:', studentId, 'Current year:', currentYear, 'Type:', typeof currentYear);
    
    // Check if student is already at maximum year
    if (currentYear >= 4) {
      showNotification('Student is already in the final year (Year 4) and cannot be promoted further.', 'warning');
      return;
    }
    
    const newYear = currentYear + 1;
    
    console.log('New year will be:', newYear);
    
    // Convert to string since the database expects text
    const newYearString = String(newYear);
    
    const { error } = await supabase
      .from('profiles')
      .update({ year: newYearString })
      .eq('id', studentId);

    if (error) throw error;

    showNotification(`Student promoted to Year ${newYear} successfully!`, 'success');
    
    // Update local state - keep as number for local state
    setStudents(prev => prev.map(student => 
      student.id === studentId ? { ...student, year: newYear } : student
    ));
    
  } catch (error: unknown) {
    const err = error as SupabaseError;
    
    // Handle specific constraint violation
    if (err.message.includes('profiles_year_check')) {
      showNotification('Cannot promote student: Year value must be between 1 and 4.', 'error');
    } else {
      showNotification('Error promoting student: ' + err.message, 'error');
    }
  } finally {
    setPromoteDemoteLoading(null);
  }
};

const handleDemoteStudent = async (studentId: string, currentYear: number): Promise<void> => {
  try {
    setPromoteDemoteLoading(studentId);
    
    // Check if student is already at minimum year
    if (currentYear <= 1) {
      showNotification('Student is already in Year 1 and cannot be demoted further.', 'warning');
      return;
    }
    
    const newYear = currentYear - 1;
    
    // Convert to string since the database expects text
    const newYearString = String(newYear);
    
    const { error } = await supabase
      .from('profiles')
      .update({ year: newYearString })
      .eq('id', studentId);

    if (error) throw error;

    showNotification(`Student demoted to Year ${newYear} successfully!`, 'warning');
    
    // Update local state - keep as number for local state
    setStudents(prev => prev.map(student => 
      student.id === studentId ? { ...student, year: newYear } : student
    ));
    
  } catch (error: unknown) {
    const err = error as SupabaseError;
    
    // Handle specific constraint violation
    if (err.message.includes('profiles_year_check')) {
      showNotification('Cannot demote student: Year value must be between 1 and 4.', 'error');
    } else {
      showNotification('Error demoting student: ' + err.message, 'error');
    }
  } finally {
    setPromoteDemoteLoading(null);
  }
};

  const handleLogout = async (): Promise<void> => {
    try {
      setLogoutLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setUserRole(null);
      setUserDepartment(null);
      setUserId(null);
      setGatePasses([]);
      setStudents([]);
      
      router.replace('/login');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error logging out:', errorMessage);
      alert('Failed to logout. Please try again.');
    } finally {
      setLogoutLoading(false);
    }
  };

  const generateQRCode = async (passId: string, studentId: string): Promise<string> => {
    try {
      const qrData: QRCodeData = {
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

      const { error: uploadError } = await supabase.storage
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`QR code generation failed: ${errorMessage}`);
    }
  };

  const handleApprove = async (passId: string, studentId: string): Promise<void> => {
    try {
      setProcessing(passId);
      
      const qrUrl = await generateQRCode(passId, studentId);

      const { error } = await supabase
        .from('gatepasses')
        .update({
          status: 'approved',
          qr_url: qrUrl,
          hod_id: userId
        })
        .eq('id', passId);

      if (error) throw error;

      showNotification('Gate pass approved successfully! QR code generated.', 'success');
      fetchGatePasses();
    } catch (error: unknown) {
      const err = error as SupabaseError;
      showNotification('Error approving gate pass: ' + err.message, 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (passId: string): Promise<void> => {
    try {
      setProcessing(passId);
      
      const { error } = await supabase
        .from('gatepasses')
        .update({ 
          status: 'rejected',
          qr_url: null,
          hod_id: userId
        })
        .eq('id', passId);

      if (error) throw error;

      showNotification('Gate pass rejected.', 'warning');
      fetchGatePasses();
    } catch (error: unknown) {
      const err = error as SupabaseError;
      showNotification('Error rejecting gate pass: ' + err.message, 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleUndo = async (passId: string): Promise<void> => {
    try {
      setProcessing(passId);
      
      const { error } = await supabase
        .from('gatepasses')
        .update({ 
          status: 'pending',
          qr_url: null,
          hod_id: null
        })
        .eq('id', passId);

      if (error) throw error;

      showNotification('Gate pass status reset to pending.', 'info');
      fetchGatePasses();
    } catch (error: unknown) {
      const err = error as SupabaseError;
      showNotification('Error resetting gate pass: ' + err.message, 'error');
    } finally {
      setProcessing(null);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info'): void => {
    alert(`${type.toUpperCase()}: ${message}`);
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

  const downloadQRCode = async (qrUrl: string, studentName?: string): Promise<void> => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `gate-pass-${(studentName || 'unknown').replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: unknown) {
      showNotification('Error downloading QR code', 'error');
    }
  };

  const filteredPasses = gatePasses.filter(pass => {
    if (filter === 'all') return true;
    return pass.status === filter;
  });

  const availableYears = Array.from(new Set(students.map(student => student.year).filter(year => year != null))).sort((a, b) => b - a);

  const filteredStudents = selectedYear === 'all' 
    ? students 
    : students.filter(student => student.year === selectedYear);

  const DebugPanel = () => (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <h3 className="font-semibold mb-2">Debug Information:</h3>
      <p className="text-sm"><strong>User ID:</strong> {userId}</p>
      <p className="text-sm"><strong>User Role:</strong> {userRole}</p>
      <p className="text-sm"><strong>Department:</strong> {userDepartment}</p>
      <p className="text-sm"><strong>Gate Passes Count:</strong> {gatePasses.length}</p>
      <p className="text-sm"><strong>Students Count:</strong> {students.length}</p>
      <p className="text-sm"><strong>View Mode:</strong> {viewMode}</p>
      <p className="text-sm"><strong>Debug Info:</strong> {debugInfo}</p>
    </div>
  );

  if (loading && !userRole && !unauthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

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
            {userRole === 'hod' 
              ? 'Redirecting to dashboard...' 
              : 'Please log in to access this page.'}
          </p>
          <div className="bg-gray-100 p-3 rounded-lg mb-4 text-left">
            <p className="text-sm text-gray-700"><strong>Debug Info:</strong> {debugInfo}</p>
            <p className="text-sm text-gray-700"><strong>Your Role:</strong> {userRole || 'Not set'}</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => router.push(userRole === 'hod' ? '/dashboard' : '/login')}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              {userRole === 'hod' ? 'Go to Dashboard' : 'Go to Login'}
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

  if (loading && !gatePasses.length && viewMode === 'gatepasses') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse mb-8">
            <div className="h-8 bg-gray-300 rounded-lg w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
          <div className="animate-pulse mb-8">
            <div className="h-10 bg-gray-300 rounded-lg w-48 mb-4"></div>
          </div>
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
        
        <DebugPanel />

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
                    {viewMode === 'gatepasses' ? 'Gate Pass Requests' : 'Department Students'}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {userDepartment ? `${userDepartment.toUpperCase()} Department - HOD Portal` : 'HOD Portal'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {viewMode === 'gatepasses' ? 'Assigned Requests' : 'Total Students'}
                </p>
                <p className="font-semibold text-gray-900">
                  {viewMode === 'gatepasses' ? gatePasses.length : students.length} total
                </p>
              </div>
              <button
                onClick={viewMode === 'gatepasses' ? fetchGatePasses : fetchStudents}
                disabled={loading || studentsLoading}
                className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <FiRefreshCw className={`w-4 h-4 ${(loading || studentsLoading) ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <FiLogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">
                  {logoutLoading ? 'Logging out...' : 'Logout'}
                </span>
                <span className="sm:hidden">
                  {logoutLoading ? '...' : 'Logout'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setViewMode('gatepasses')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                viewMode === 'gatepasses'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FiList className="w-4 h-4" />
              <span>Gate Pass Requests</span>
            </button>
            <button
              onClick={() => setViewMode('students')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                viewMode === 'students'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FiUsers className="w-4 h-4" />
              <span>View Students</span>
            </button>
          </div>

          {viewMode === 'gatepasses' && (
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
          )}

          {viewMode === 'students' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{students.length}</p>
                    <p className="text-xs text-gray-500 mt-1">All Years</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                    <FiUsers className="w-6 h-6" />
                  </div>
                </div>
              </motion.div>
              
              {availableYears.map((year, index) => (
                <motion.div
                  key={year}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index + 1) * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Batch {year}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {students.filter(s => s.year === year).length}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Students</p>
                    </div>
                    <div className="p-3 rounded-xl bg-green-100 text-green-600">
                      <FiUser className="w-6 h-6" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {viewMode === 'gatepasses' && (
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
        )}

        {viewMode === 'students' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center space-x-2 text-gray-600 mr-4">
                <FiFilter className="w-4 h-4" />
                <span className="text-sm font-medium">Filter by year:</span>
              </div>
              <button
                onClick={() => setSelectedYear('all')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                  selectedYear === 'all'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                <span>All Years</span>
                <span className="px-2 py-1 text-xs bg-white/20 rounded-full">
                  {students.length}
                </span>
              </button>
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                    selectedYear === year
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  <span>Batch {year}</span>
                  <span className="px-2 py-1 text-xs bg-white/20 rounded-full">
                    {students.filter(s => s.year === year).length}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {viewMode === 'gatepasses' ? (
              filteredPasses.length === 0 ? (
                <motion.div
                  key="empty-gatepasses"
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
                    {gatePasses.length === 0 
                      ? "No gate pass requests found for your department. Check the debug panel above for details."
                      : "No gate passes match the current filter."
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
                      onClick={() => setFilter('all')}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors ml-2"
                    >
                      Show All
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.ul
                  key="gatepass-list"
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
                                      Roll No: {student?.roll || 'N/A'} | Year: {student?.year || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${statusConfig.color}`}>
                                  <StatusIcon className="w-4 h-4" />
                                  <span className="text-sm font-medium">{statusConfig.label}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <FiBook className="w-4 h-4" />
                                  <span className="text-sm">Roll: <strong className="text-gray-900">{student?.roll || 'N/A'}</strong></span>
                                </div>
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <FiBook className="w-4 h-4" />
                                  <span className="text-sm">Year: <strong className="text-gray-900">{student?.year || 'N/A'}</strong></span>
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

                              <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Reason for Request:</p>
                                <p className="text-gray-900 bg-gray-50 rounded-lg p-3 border">{pass.reason}</p>
                              </div>

                              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                <span>Submitted: {new Date(pass.created_at).toLocaleString()}</span>
                              </div>

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
              )
            ) : (
              filteredStudents.length === 0 ? (
                <motion.div
                  key="empty-students"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-16"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiUsers className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No students found
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto mb-4">
                    {studentsLoading 
                      ? "Loading students..."
                      : "No students found in your department."
                    }
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={fetchStudents}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {studentsLoading ? 'Loading...' : 'Refresh Students'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="students-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="divide-y divide-gray-200"
                >
                  {filteredStudents.map((student, index) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50 transition-colors duration-200 p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <FiUser className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {student.name}
                            </h3>
                            <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-600">
                              <span className="flex items-center space-x-1">
                                <FiBook className="w-4 h-4" />
                                <span>Roll: <strong>{student.roll}</strong></span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <FiCalendar className="w-4 h-4" />
                                <span>Year: <strong>{student.year}</strong></span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <FiHash className="w-4 h-4" />
                                <span>ID: <strong className="font-mono text-xs">{student.id}</strong></span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right mr-4">
                            <div className="text-sm text-gray-500">
                              Joined: {new Date(student.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-lg font-bold text-blue-600">
                              Year {student.year}
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handlePromoteStudent(student.id, student.year)}
                              disabled={promoteDemoteLoading === student.id}
                              className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                              title="Promote to next year"
                            >
                              {promoteDemoteLoading === student.id ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <FiArrowUp className="w-4 h-4" />
                              )}
                              <span>Promote</span>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDemoteStudent(student.id, student.year)}
                              disabled={promoteDemoteLoading === student.id || student.year <= 1}
                              className="flex items-center space-x-2 bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors"
                              title="Demote to previous year"
                            >
                              {promoteDemoteLoading === student.id ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <FiArrowDown className="w-4 h-4" />
                              )}
                              <span>Demote</span>
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}