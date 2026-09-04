'use client';

import React from 'react';

export default function DoctorReportsPage() {
  const reports = [
    { id: 'rep-101', patient: 'Amma (P-789)', period: 'Last 30 Days', completed: 24, avgAcc: '81.4%', adherence: '84.5%', status: 'Available' },
    { id: 'rep-102', patient: 'Ravi (P-456)', period: 'Last 30 Days', completed: 18, avgAcc: '74.2%', adherence: '72.0%', status: 'Available' },
    { id: 'rep-103', patient: 'Lakshmi Patil (P-123)', period: 'Last 30 Days', completed: 28, avgAcc: '88.0%', adherence: '92.0%', status: 'Available' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAF8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>Clinical Activity Reports</h1>
          <a href="/doctor/dashboard" style={{ fontSize: '13px', color: '#2563EB', fontWeight: '700', textDecoration: 'none' }}>← Back to Doctor Dashboard</a>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 32px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0F172A' }}>Generated Patient Progress Reports</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px' }}>
                <th style={{ padding: '12px' }}>REPORT ID</th>
                <th style={{ padding: '12px' }}>PATIENT</th>
                <th style={{ padding: '12px' }}>PERIOD</th>
                <th style={{ padding: '12px' }}>SESSIONS</th>
                <th style={{ padding: '12px' }}>AVG ACCURACY</th>
                <th style={{ padding: '12px' }}>REMINDER ADHERENCE</th>
                <th style={{ padding: '12px' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 12px', fontWeight: '700', color: '#2563EB' }}>{r.id}</td>
                  <td style={{ padding: '14px 12px', fontWeight: '700', color: '#0F172A' }}>{r.patient}</td>
                  <td style={{ padding: '14px 12px', color: '#64748B' }}>{r.period}</td>
                  <td style={{ padding: '14px 12px', fontWeight: '600' }}>{r.completed}</td>
                  <td style={{ padding: '14px 12px', fontWeight: '700', color: '#2563EB' }}>{r.avgAcc}</td>
                  <td style={{ padding: '14px 12px', fontWeight: '700', color: '#16A34A' }}>{r.adherence}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <button
                      onClick={() => alert(`Report ${r.id} exported for ${r.patient}.`)}
                      style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', border: 'none', padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Download PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
