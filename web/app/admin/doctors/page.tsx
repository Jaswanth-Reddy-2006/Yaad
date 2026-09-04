'use client';

import React from 'react';

export default function AdminDoctorsPage() {
  const doctors = [
    { id: 'doc-1', name: 'Dr. A. K. Sharma', specialization: 'Neurology / Cognitive Health', license: 'MED-IN-88941', hospital: 'City Health Hospital', authorizedPatients: 3, status: 'Verified' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAF8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>Platform Doctor & Clinician Management</h1>
          <a href="/admin/dashboard" style={{ fontSize: '13px', color: '#7C3AED', fontWeight: '700', textDecoration: 'none' }}>← Back to Admin Dashboard</a>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 32px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0F172A' }}>Verified Healthcare Clinician Accounts</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px' }}>
                <th style={{ padding: '12px' }}>CLINICIAN NAME</th>
                <th style={{ padding: '12px' }}>SPECIALIZATION</th>
                <th style={{ padding: '12px' }}>LICENSE NO.</th>
                <th style={{ padding: '12px' }}>HOSPITAL AFFILIATION</th>
                <th style={{ padding: '12px' }}>PATIENTS</th>
                <th style={{ padding: '12px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 12px', fontWeight: '700', color: '#0F172A' }}>{doc.name}</td>
                  <td style={{ padding: '14px 12px', color: '#2563EB', fontWeight: '600' }}>{doc.specialization}</td>
                  <td style={{ padding: '14px 12px', color: '#64748B' }}>{doc.license}</td>
                  <td style={{ padding: '14px 12px', color: '#0F172A' }}>{doc.hospital}</td>
                  <td style={{ padding: '14px 12px', fontWeight: '700', color: '#2563EB' }}>{doc.authorizedPatients} Patients</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                      {doc.status}
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
