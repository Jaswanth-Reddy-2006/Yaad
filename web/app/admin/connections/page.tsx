'use client';

import React from 'react';

export default function AdminConnectionsPage() {
  const connections = [
    { id: 'rel-101', caregiver: 'Priya Sharma', patient: 'Amma', code: 'YAAD-789', status: 'ACTIVE', pairedAt: '2026-08-14 10:30' },
    { id: 'rel-102', caregiver: 'Priya Sharma', patient: 'Ravi', code: 'YAAD-456', status: 'ACTIVE', pairedAt: '2026-08-16 11:15' },
    { id: 'rel-103', caregiver: 'Priya Sharma', patient: 'Lakshmi Patil', code: 'YAAD-123', status: 'ACTIVE', pairedAt: '2026-08-21 09:00' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAF8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>Connection Pairings Audit</h1>
          <a href="/admin/dashboard" style={{ fontSize: '13px', color: '#7C3AED', fontWeight: '700', textDecoration: 'none' }}>← Back to Admin Dashboard</a>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 32px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0F172A' }}>Cryptographically Verified Pairings</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px' }}>
                <th style={{ padding: '12px' }}>RELATIONSHIP ID</th>
                <th style={{ padding: '12px' }}>CAREGIVER</th>
                <th style={{ padding: '12px' }}>PATIENT</th>
                <th style={{ padding: '12px' }}>VERIFIED CODE</th>
                <th style={{ padding: '12px' }}>STATUS</th>
                <th style={{ padding: '12px' }}>PAIRED AT</th>
              </tr>
            </thead>
            <tbody>
              {connections.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 12px', fontWeight: '700', color: '#7C3AED' }}>{c.id}</td>
                  <td style={{ padding: '14px 12px', fontWeight: '700', color: '#0F172A' }}>{c.caregiver}</td>
                  <td style={{ padding: '14px 12px', color: '#0F172A' }}>{c.patient}</td>
                  <td style={{ padding: '14px 12px', fontWeight: '700', color: '#16A34A' }}>{c.code}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', color: '#64748B' }}>{c.pairedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
