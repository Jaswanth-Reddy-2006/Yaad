'use client';

import React, { useState } from 'react';
import { Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      await fetch('http://localhost:8000/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() })
      });

      setFeedback('If an account matching the provided identifier exists, password recovery instructions have been sent.');
    } catch (err) {
      setFeedback('If an account matching the provided identifier exists, password recovery instructions have been sent.');
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
              ACCOUNT RECOVERY
            </span>
            <h1 style={{ margin: '16px 0 8px 0', fontSize: '24px', fontWeight: '800', color: '#0F172A' }}>
              Forgot Your Password?
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>
              Enter your email address or phone number to receive recovery instructions.
            </p>
          </div>

          {feedback && (
            <div style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: '#DCFCE7', border: '1.5px solid #86EFAC', color: '#15803D', fontSize: '13px', fontWeight: '700', marginBottom: '24px', lineHeight: '1.5', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} />
              <span>{feedback}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                Email address or Phone number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. user@mitracare.org"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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
              {isLoading ? 'Sending Request...' : 'Send Recovery Instructions →'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
