'use client';

import React from 'react';

export default function AdminCaregiversPage() {
  const caregivers = [
    { id: 'cg-1', name: 'Priya Sharma', email: 'priya@mitracare.org', patientsCount: 3, relType: 'Family Member', status: 'Active' },
    { id: 'cg-2', name: 'Anil Kumar', email: 'anil@mitracare.org', patientsCount: 1, relType: 'Primary Caregiver', status: 'Active' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAF8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>Platform Caregiver Management</h1>
          <a href="/admin/dashboard" style={{ fontSize: '13px', color: '#7C3AED', fontWeight: '700', textDecoration: 'none' }}>← Back to Admin Dashboard</a>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 32px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0F172A' }}>Registered Caregiver Accounts</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px' }}>
                <th style={{ padding: '12px' }}>NAME</th>
                <th style={{ padding: '12px' }}>EMAIL</th>
                <th style={{ padding: '12px' }}>CONNECTED PATIENTS</th>
                <th style={{ padding: '12px' }}>RELATIONSHIP TYPE</th>
                <th style={{ padding: '12px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {caregivers.map((cg) => (
                <tr key={cg.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 12px', fontWeight: '700', color: '#0F172A' }}>{cg.name}</td>
                  <td style={{ padding: '14px 12px', color: '#64748B' }}>{cg.email}</td>
                  <td style={{ padding: '14px 12px', fontWeight: '700', color: '#16A34A' }}>{cg.patientsCount} Patients</td>
                  <td style={{ padding: '14px 12px', color: '#0F172A' }}>{cg.relType}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                      {cg.status}
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
