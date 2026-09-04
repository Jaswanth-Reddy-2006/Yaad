'use client';

import React from 'react';

export default function AdminPatientsPage() {
  const patients = [
    { id: 'p-1', publicId: 'USR-PAT-001', name: 'Amma', age: 75, lang: 'Kannada (kn)', created: '2026-08-12', status: 'Active' },
    { id: 'p-2', publicId: 'USR-PAT-002', name: 'Ravi', age: 78, lang: 'Hindi (hi)', created: '2026-08-15', status: 'Active' },
    { id: 'p-3', publicId: 'USR-PAT-003', name: 'Lakshmi Patil', age: 80, lang: 'Marathi (mr)', created: '2026-08-20', status: 'Active' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAF8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>Platform Patient Management</h1>
          <a href="/admin/dashboard" style={{ fontSize: '13px', color: '#7C3AED', fontWeight: '700', textDecoration: 'none' }}>← Back to Admin Dashboard</a>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 32px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0F172A' }}>Registered Patient Profiles</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px' }}>
                <th style={{ padding: '12px' }}>PUBLIC ID</th>
                <th style={{ padding: '12px' }}>DISPLAY NAME</th>
                <th style={{ padding: '12px' }}>AGE</th>
                <th style={{ padding: '12px' }}>PREFERRED LANGUAGE</th>
                <th style={{ padding: '12px' }}>REGISTERED</th>
                <th style={{ padding: '12px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 12px', fontWeight: '700', color: '#7C3AED' }}>{p.publicId}</td>
                  <td style={{ padding: '14px 12px', fontWeight: '700', color: '#0F172A' }}>{p.name}</td>
                  <td style={{ padding: '14px 12px', color: '#64748B' }}>{p.age}</td>
                  <td style={{ padding: '14px 12px', color: '#0F172A' }}>{p.lang}</td>
                  <td style={{ padding: '14px 12px', color: '#64748B' }}>{p.created}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                      {p.status}
                    </span>
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
