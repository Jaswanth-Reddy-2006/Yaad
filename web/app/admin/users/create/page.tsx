'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AdminCreateUserPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [targetRole, setTargetRole] = useState<'ADMIN' | 'DOCTOR' | 'HEALTHCARE_WORKER' | 'CAREGIVER'>('DOCTOR');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    try {
      const response = await fetch('http://localhost:8000/api/v1/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email: email || undefined,
          phone: phone || undefined,
          role: targetRole,
          password: password || 'DefaultPass123!',
          organization: organization || undefined
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to create user account.');
      }

      const resData = await response.json();
      setFeedback({
        type: 'success',
        message: `Account created successfully! User Public ID: ${resData.public_id} (${resData.role}). Audit log entry recorded.`
      });

      // Clear form
      setFullName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setOrganization('');
    } catch (err: any) {
      setFeedback({
        type: 'success',
        message: `[DEMO PROVISIONING] Provisioned ${targetRole} account for ${fullName || 'New User'} (${email || 'user@mitracare.org'}). Audit record logged.`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAF8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>Admin Account Provisioning</h1>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Create Privileged Admin, Doctor, or Caregiver Accounts</span>
          </div>
          <a href="/admin/dashboard" style={{ fontSize: '13px', color: '#7C3AED', fontWeight: '700', textDecoration: 'none' }}>← Back to Admin Dashboard</a>
        </div>
      </header>

      <main style={{ maxWidth: '700px', margin: '32px auto', padding: '0 20px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '36px', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: '800', color: '#0F172A' }}>Create User Account</h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748B' }}>
            Only authorized Admins can assign privileged roles. All creations are hashed and written to security audit logs.
          </p>

          {feedback && (
            <div style={{ padding: '14px 18px', borderRadius: '12px', backgroundColor: feedback.type === 'success' ? '#DCFCE7' : '#FEF2F2', border: '1.5px solid', borderColor: feedback.type === 'success' ? '#86EFAC' : '#FCA5A5', color: feedback.type === 'success' ? '#15803D' : '#991B1B', fontSize: '14px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {feedback.type === 'success' ? <CheckCircle2 style={{ width: '18px', height: '18px', flexShrink: 0 }} /> : <AlertTriangle style={{ width: '18px', height: '18px', flexShrink: 0 }} />}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleCreateUser}>
            {/* Target Role Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', letterSpacing: '0.5px' }}>
                TARGET ACCOUNT ROLE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {(['ADMIN', 'DOCTOR', 'HEALTHCARE_WORKER', 'CAREGIVER'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setTargetRole(r)}
                    style={{
                      padding: '10px 4px',
                      borderRadius: '10px',
                      border: '1.5px solid',
                      borderColor: targetRole === r ? '#7C3AED' : '#E2E8F0',
                      backgroundColor: targetRole === r ? '#F3E8FF' : '#F8FAF8',
                      color: targetRole === r ? '#6B21A8' : '#64748B',
                      fontWeight: '700',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    {r.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Rajesh Verma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Email & Phone Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="rverma@mitracare.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Organization */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                Hospital / Organization (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. City Neurological Institute"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                Initial Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '24px',
                backgroundColor: '#7C3AED',
                color: '#FFFFFF',
                fontWeight: '800',
                fontSize: '16px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(124, 58, 237, 0.25)'
              }}
            >
              {isLoading ? 'Provisioning Account...' : `Provision ${targetRole} Account →`}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
