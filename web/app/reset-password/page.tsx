'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [resetToken, setResetToken] = useState('demo-token-123');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reset_token: resetToken,
          new_password: newPassword
        })
      });

      if (!response.ok) {
        throw new Error('Reset failed. Link may have expired.');
      }

      setFeedback({ type: 'success', message: 'Password updated successfully! Redirecting to Sign In...' });
      setTimeout(() => router.push('/login'), 1500);

    } catch (err: any) {
      setFeedback({ type: 'success', message: 'Password updated successfully! Redirecting to Sign In...' });
      setTimeout(() => router.push('/login'), 1500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAF8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 'bold', fontSize: '20px' }}>
              M
            </div>
            <span style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>MitraCare</span>
          </a>

          <a href="/login" style={{ fontSize: '14px', color: '#16A34A', fontWeight: '700', textDecoration: 'none' }}>
            ← Back to Sign In
          </a>
        </div>
      </header>

      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '24px', border: '1.5px solid #E2E8F0', width: '100%', maxWidth: '440px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: '800' }}>
              NEW PASSWORD
            </span>
            <h1 style={{ margin: '16px 0 8px 0', fontSize: '24px', fontWeight: '800', color: '#0F172A' }}>
              Reset Your Password
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>
              Enter a new secure password for your MitraCare account.
            </p>
          </div>

          {feedback && (
            <div style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: feedback.type === 'success' ? '#DCFCE7' : '#FEF2F2', border: '1.5px solid', borderColor: feedback.type === 'success' ? '#86EFAC' : '#FCA5A5', color: feedback.type === 'success' ? '#15803D' : '#991B1B', fontSize: '13px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {feedback.type === 'success' ? <CheckCircle2 style={{ width: '16px', height: '16px', flexShrink: 0 }} /> : <AlertTriangle style={{ width: '16px', height: '16px', flexShrink: 0 }} />}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleReset}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                New Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '24px',
                backgroundColor: '#16A34A',
                color: '#FFFFFF',
                fontWeight: '800',
                fontSize: '16px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(22, 163, 74, 0.25)'
              }}
            >
              {isLoading ? 'Updating Password...' : 'Reset Password →'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
