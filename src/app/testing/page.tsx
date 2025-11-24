'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // adjust path if needed
import { useRouter } from 'next/navigation';

export default function TestGoogleLogin() {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session || null);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://fasuynajpxrybermitpy.supabase.co/auth/v1/callback'
,
      },
    });

    if (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Google OAuth Test</h1>

      {!session ? (
        <button
          onClick={handleGoogleLogin}
          style={{
            padding: '12px 20px',
            background: '#4285F4',
            color: 'white',
            borderRadius: 8,
            border: 0,
            cursor: 'pointer',
            marginTop: 20,
          }}
        >
          {loading ? 'Redirecting...' : 'Login with Google'}
        </button>
      ) : (
        <>
          <p>Logged in as:</p>
          <pre>{JSON.stringify(session.user, null, 2)}</pre>
          <button
            onClick={handleLogout}
            style={{
              padding: '12px 20px',
              background: '#e53935',
              color: 'white',
              borderRadius: 8,
              border: 0,
              cursor: 'pointer',
              marginTop: 20,
            }}
          >
            Logout
          </button>
        </>
      )}
    </div>
  );
}
