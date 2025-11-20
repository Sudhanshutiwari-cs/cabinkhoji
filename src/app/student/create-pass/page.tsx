'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function CreateGatePass() {
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [departmentHodId, setDepartmentHodId] = useState<string | null>(null);
  const router = useRouter();

  // Fetch the student's department and corresponding HOD ID
  useEffect(() => {
    const fetchDepartmentHod = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('Not authenticated');

        // First, get the student's department from their profile
        const { data: studentData, error: studentError } = await supabase
          .from('profiles')
          .select('department')
          .eq('id', userData.user.id)
          .single();

        if (studentError) throw studentError;

        if (studentData?.department) {
          // Then, find the HOD for the same department
          const { data: hodData, error: hodError } = await supabase
            .from('profiles')
            .select('id')
            .eq('department', studentData.department)
            .eq('role', 'hod')
            .single();

          if (hodError) throw hodError;
          setDepartmentHodId(hodData?.id);
        }
      } catch (error: any) {
        console.error('Error fetching department HOD:', error.message);
        alert('Error loading department information');
      }
    };

    fetchDepartmentHod();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!departmentHodId) {
      alert('Unable to determine department HOD. Please try again.');
      return;
    }

    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('gatepasses')
        .insert([
          {
            student_id: userData.user.id,
            reason,
            date,
            status: 'pending',
            hod_id: departmentHodId, // Add HOD ID to the gate pass
          },
        ]);

      if (error) throw error;

      router.push('/student/dashboard');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Gate Pass</h1>
        
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
              Reason
            </label>
            <textarea
              id="reason"
              required
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter the reason for your gate pass..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              id="date"
              required
              min={new Date().toISOString().split('T')[0]}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !departmentHodId}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Gate Pass'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}