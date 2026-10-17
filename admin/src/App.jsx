import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { getStoredAdminUser, getAdminToken, clearAdminSession } from './lib/api';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import './admin.css';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check local backend admin session token
    const storedUser = getStoredAdminUser();
    const storedToken = getAdminToken();

    if (storedUser && storedToken) {
      setSession({ user: storedUser });
      setLoading(false);
      return;
    }

    // 2. Check existing Supabase session (fallback)
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session: sbSession } }) => {
        if (sbSession?.user) {
          setSession(sbSession);
        }
        setLoading(false);
      }).catch(() => setLoading(false));

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, sbSession) => {
        if (sbSession?.user) {
          setSession(sbSession);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    clearAdminSession();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    setSession(null);
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-spinner" />
        <p>Verifying secure admin credentials...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <AdminLogin
        onLoginSuccess={(user) => setSession({ user })}
      />
    );
  }

  return (
    <AdminDashboard
      user={session.user}
      onLogout={handleLogout}
    />
  );
}
