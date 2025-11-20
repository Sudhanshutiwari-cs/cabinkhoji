'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BrowserQRCodeReader } from '@zxing/browser';
import { supabase } from '@/lib/supabase';

interface ScanResult {
  status: 'verified' | 'invalid' | 'pending' | 'rejected';
  message: string;
  passId?: string;
  studentId?: string;
  reason?: string;
  date?: string;
}

interface QRData {
  passId: string;
  studentId: string;
}

export default function GuardScanner() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);
  const lastScanTimeRef = useRef(0);
  const isScanningRef = useRef(false);

  const SCAN_COOLDOWN = 2000;

  // Check user role and authentication
  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.push('/login');
        return;
      }

      // Get user profile with role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        console.error('Profile not found:', profileError);
        router.push('/login');
        return;
      }

      if (profile.role !== 'guard') {
        console.warn('Unauthorized access attempt by role:', profile.role);
        router.push('/login');
        return;
      }

      setUserRole(profile.role);
      setLoading(false);
      
      // Start camera only after role verification
      startCamera();
    } catch (err) {
      console.error('Error checking user role:', err);
      router.push('/login');
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      setResult(null);
      setCameraReady(false);
      
      stopCamera();

      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            setScanning(true);
            setCameraReady(true);
            initializeScanner();
          }).catch((err: Error) => {
            setError('Failed to start camera: ' + err.message);
          });
        };

        videoRef.current.onerror = () => {
          setError('Camera error occurred');
        };
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Camera access denied. Please allow camera permissions and refresh.';
      setError(errorMessage);
      setScanning(false);
      setCameraReady(false);
    }
  };

  const initializeScanner = () => {
    if (!videoRef.current) return;

    try {
      codeReaderRef.current = new BrowserQRCodeReader();
      startContinuousScanning();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize scanner';
      setError(errorMessage);
    }
  };

  const startContinuousScanning = () => {
    if (!videoRef.current || !codeReaderRef.current || isScanningRef.current) return;

    isScanningRef.current = true;

    // Use decodeFromVideoDevice for continuous scanning
    codeReaderRef.current.decodeFromVideoDevice(
      null,
      videoRef.current,
      (result, error) => {
        if (result && isScanningRef.current) {
          processQRCode(result.getText());
        }
        
        // Don't log normal "not found" errors
        if (error && !error.message?.includes('NotFoundException') && isScanningRef.current) {
          console.debug('Scan error:', error);
        }
      }
    );
  };

  const processQRCode = async (data: string) => {
    const now = Date.now();
    if (now - lastScanTimeRef.current < SCAN_COOLDOWN) {
      return;
    }
    lastScanTimeRef.current = now;

    // Stop further scanning while processing
    isScanningRef.current = false;

    try {
      const qrData = JSON.parse(data);
      
      if (!qrData.passId) {
        setResult({
          status: 'invalid',
          message: 'Invalid QR code format'
        });
        return;
      }

      const { data: gatePass, error } = await supabase
        .from('gatepasses')
        .select('status, student_id, reason, date')
        .eq('id', qrData.passId)
        .single();

      if (error || !gatePass) {
        setResult({
          status: 'invalid',
          message: 'Pass not found in system'
        });
        return;
      }

      if (gatePass.status === 'approved') {
        setResult({
          status: 'verified',
          message: 'Access Granted',
          passId: qrData.passId,
          studentId: gatePass.student_id,
          reason: gatePass.reason,
          date: gatePass.date
        });
      } else if (gatePass.status === 'pending') {
        setResult({
          status: 'pending',
          message: 'Awaiting approval',
          passId: qrData.passId,
          studentId: gatePass.student_id,
          reason: gatePass.reason
        });
      } else if (gatePass.status === 'rejected') {
        setResult({
          status: 'rejected',
          message: 'Access denied',
          passId: qrData.passId,
          studentId: gatePass.student_id,
          reason: gatePass.reason
        });
      }

      stopCamera();

    } catch (err) {
      setResult({
        status: 'invalid',
        message: 'Invalid QR code'
      });
      // Restart scanning if there was an error
      if (cameraReady) {
        isScanningRef.current = true;
        startContinuousScanning();
      }
    }
  };

  const stopCamera = () => {
    isScanningRef.current = false;
    setScanning(false);

    // Stop ZXing scanner
    if (codeReaderRef.current) {
      // ZXing doesn't have a proper stop method, so we recreate the instance on next start
      codeReaderRef.current = null;
    }

    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraReady(false);
  };

  const resetScanner = () => {
    setResult(null);
    setError('');
    startCamera();
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <span className="text-2xl text-white">🔒</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-700">Verifying access...</h1>
          <p className="text-gray-500 mt-2">Checking permissions</p>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not guard (will redirect)
  if (userRole !== 'guard') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl text-white">📱</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gate Pass Scanner</h1>
          <p className="text-gray-600">Scan QR codes to verify student gate passes</p>
        </div>

        {/* Scanner Area */}
        <div className="bg-white rounded-2xl overflow-hidden mb-6 relative aspect-[4/5] border-2 border-gray-200 shadow-lg">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Camera Off State */}
          {!cameraReady && !result && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
              <div className="w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <span className="text-3xl">📷</span>
              </div>
              <p className="text-gray-700 text-lg font-medium mb-2">Starting Camera</p>
              <p className="text-gray-500 text-sm">Please allow camera permissions</p>
            </div>
          )}

          {/* Scanner Overlay */}
          {cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="border-3 border-blue-600 rounded-xl w-64 h-64 relative shadow-md bg-white/10">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 animate-scan rounded-full shadow-sm"></div>
                </div>
                
                {/* Corner accents */}
                <div className="absolute -top-2 -left-2 w-8 h-8 border-t-3 border-l-3 border-blue-600 rounded-tl-lg"></div>
                <div className="absolute -top-2 -right-2 w-8 h-8 border-t-3 border-r-3 border-blue-600 rounded-tr-lg"></div>
                <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-3 border-l-3 border-blue-600 rounded-bl-lg"></div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-3 border-r-3 border-blue-600 rounded-br-lg"></div>
              </div>
            </div>
          )}
        </div>

        {/* Status Indicator */}
        {cameraReady && !result && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Ready to scan
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-center">
            <div className="font-semibold mb-1">Camera Error</div>
            <p className="text-sm mb-3 opacity-90">{error}</p>
            <button
              onClick={startCamera}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Scan Result */}
        {result && (
          <div className={`p-6 rounded-xl text-center border-2 ${
            result.status === 'verified' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : result.status === 'invalid' 
              ? 'bg-red-50 border-red-200 text-red-800'
              : result.status === 'pending' 
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="text-5xl mb-4">
              {result.status === 'verified' && '✅'}
              {result.status === 'invalid' && '❌'}
              {result.status === 'pending' && '⏳'}
              {result.status === 'rejected' && '🚫'}
            </div>
            <div className="text-xl font-semibold mb-4">{result.message}</div>
            
            <div className="space-y-3 mb-6">
              {result.passId && (
                <div className="bg-white/50 p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Pass ID</p>
                  <p className="font-mono text-xs break-all text-gray-800">{result.passId}</p>
                </div>
              )}
              {result.reason && (
                <div className="bg-white/50 p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Reason</p>
                  <p className="text-sm text-gray-800">{result.reason}</p>
                </div>
              )}
              {result.date && (
                <div className="bg-white/50 p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="text-sm text-gray-800">{result.date}</p>
                </div>
              )}
            </div>

            <button
              onClick={resetScanner}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-sm"
            >
              Scan Another QR Code
            </button>
          </div>
        )}

        {/* Instructions */}
        {!result && cameraReady && (
          <div className="text-center mt-6">
            <div className="inline-grid grid-cols-1 gap-3 text-sm text-gray-600 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-center space-x-2">
                <span>🎯</span>
                <span>Position QR code within frame</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>💡</span>
                <span>Ensure good lighting</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span>📱</span>
                <span>Hold device steady</span>
              </div>
            </div>
          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0.8; }
          50% { opacity: 1; }
          100% { transform: translateY(256px); opacity: 0.8; }
        }
        .animate-scan {
          animation: scan 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}