'use client';

import React from 'react';

export default function AdminAuditPage() {
  const auditLogs = [
    { id: 'log-801', user: 'USR-CG-101', action: 'PATIENT_CONNECTED', resource: 'patient:p-1', details: 'Caregiver paired with Amma via QR token', time: '2026-09-03 10:30:14' },
    { id: 'log-802', user: 'USR-CG-101', action: 'REMINDER_CREATED', resource: 'reminder:rem-1', details: 'Created Morning Medicine reminder', time: '2026-09-03 10:32:05' },
    { id: 'log-803', user: 'USR-DOC-201', action: 'PATIENT_REPORT_VIEWED', resource: 'patient:p-1', details: 'Dr. Sharma viewed 30-day activity report', time: '2026-09-03 11:00:22' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAF8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>Security Audit Logs</h1>
          <a href="/admin/dashboard" style={{ fontSize: '13px', color: '#7C3AED', fontWeight: '700', textDecoration: 'none' }}>← Back to Admin Dashboard</a>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 32px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0F172A' }}>Platform Action Audit Stream</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px' }}>
                <th style={{ padding: '12px' }}>LOG ID</th>
                <th style={{ padding: '12px' }}>USER ID</th>
                <th style={{ padding: '12px' }}>ACTION</th>
                <th style={{ padding: '12px' }}>RESOURCE</th>
                <th style={{ padding: '12px' }}>DETAILS</th>
                <th style={{ padding: '12px' }}>TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((l) => (
                <tr key={l.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 12px', fontWeight: '700', color: '#7C3AED' }}>{l.id}</td>
                  <td style={{ padding: '14px 12px', color: '#64748B' }}>{l.user}</td>
                  <td style={{ padding: '14px 12px', fontWeight: '700', color: '#16A34A' }}>{l.action}</td>
                  <td style={{ padding: '14px 12px', color: '#0F172A' }}>{l.resource}</td>
                  <td style={{ padding: '14px 12px', color: '#64748B' }}>{l.details}</td>
                  <td style={{ padding: '14px 12px', color: '#64748B' }}>{l.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
