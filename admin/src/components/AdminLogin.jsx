import React, { useState } from 'react';
import { loginAdminApi } from '../lib/api';
import { BRAND_INFO } from '../constants/brand';
import { Lock, Mail, ArrowLeft, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const result = await loginAdminApi(email, password);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMsg(result.error || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToStore = () => {
    window.location.href = BRAND_INFO.storefrontUrl;
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-brand-logo">
            <span className="logo-diya">🪔</span>
            <div>
              <div className="logo-telugu">భ్రమరాంబిక హోమ్ ఫుడ్స్</div>
              <div className="logo-main">Bramarambika</div>
              <div className="logo-tag">KITCHEN ADMIN PORTAL</div>
            </div>
          </div>
          <h2 className="admin-login-title">Owner & Staff Login</h2>
          <p className="admin-login-subtitle">
            Secure portal to manage orders, dispatch parcels, and update store pricing.
          </p>
        </div>

        {errorMsg && (
          <div className="admin-error-banner" role="alert">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="admin-input-group">
            <label htmlFor="admin-email">Admin Email Address</label>
            <div className="admin-input-wrap">
              <Mail size={16} className="input-icon" />
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourkitchen.com"
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          <div className="admin-input-group">
            <label htmlFor="admin-password">Password</label>
            <div className="admin-input-wrap">
              <Lock size={16} className="input-icon" />
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your admin password"
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="admin-btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin-icon" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Log In to Kitchen Portal</span>
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <button
            type="button"
            onClick={handleGoToStore}
            className="admin-back-btn"
          >
            <ArrowLeft size={14} />
            <span>Go to Customer Storefront</span>
          </button>
        </div>
      </div>
    </div>
  );
}
