'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { GatePass } from '@/types';
import QRCode from 'qrcode';

export default function GatePassQR() {
  const params = useParams();
  const [gatePass, setGatePass] = useState<GatePass | null>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchGatePass();
    }
  }, [params.id]);

  const fetchGatePass = async () => {
    try {
      const { data, error } = await supabase
        .from('gatepasses')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setGatePass(data);

      if (data.qr_url) {
        // Generate QR code from existing URL
        const qrData = {
          passId: data.id,
          studentId: data.student_id,
        };
        const qrImage = await QRCode.toDataURL(JSON.stringify(qrData));
        setQrCode(qrImage);
      }
    } catch (error: any) {
      console.error('Error fetching gate pass:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!gatePass) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-red-600">Gate pass not found</div>
      </div>
    );
  }

  if (gatePass.status !== 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-yellow-600">
          This gate pass is {gatePass.status}. QR code will be available after approval.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Gate Pass QR Code</h1>
        
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-2">Reason: {gatePass.reason}</p>
          <p className="text-gray-600 mb-4">Date: {new Date(gatePass.date).toLocaleDateString()}</p>
        </div>

        {qrCode && (
          <div className="flex justify-center mb-6">
            <img src={qrCode} alt="QR Code" className="w-64 h-64" />
          </div>
        )}

        <div className="text-center text-sm text-gray-500">
          Show this QR code to the guard when exiting/entering the campus
        </div>
      </div>
    </div>
  );
}