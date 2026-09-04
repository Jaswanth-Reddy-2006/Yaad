'use client';

import React, { useState } from 'react';

export default function DoctorPatientsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const patients = [
    { id: 'p-1', name: 'Amma', publicId: 'P-789', age: 75, status: 'Activity: Stable', sessions: 24, avgAccuracy: '81.4%', adherence: '86%', lastActive: '10:30 AM' },
    { id: 'p-2', name: 'Ravi', publicId: 'P-456', age: 78, status: 'Needs Attention', sessions: 18, avgAccuracy: '74.2%', adherence: '72%', lastActive: '9:45 AM' },
    { id: 'p-3', name: 'Lakshmi Patil', publicId: 'P-123', age: 80, status: 'Activity: Active', sessions: 28, avgAccuracy: '88.0%', adherence: '92%', lastActive: '11:00 AM' },
  ];

  const filtered = patients.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.publicId.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAF8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 'bold', fontSize: '18px' }}>
              🩺
            </div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>Authorized Patients</h1>
          </div>
          <a href="/doctor/dashboard" style={{ fontSize: '13px', color: '#2563EB', fontWeight: '700', textDecoration: 'none' }}>← Back to Dashboard</a>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 32px' }}>
        {/* Search */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search patient by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', maxWidth: '400px', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
          />
        </div>

        {/* Patients Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {filtered.map((p) => (
            <div key={p.id} style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#0F172A' }}>{p.name}</h3>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>ID: {p.publicId} • Age {p.age}</span>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', backgroundColor: p.status.includes('Attention') ? '#FEF3C7' : '#DCFCE7', color: p.status.includes('Attention') ? '#D97706' : '#16A34A' }}>
                  {p.status}
                </span>
              </div>

              <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '12px 0' }} />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '13px', marginBottom: '16px' }}>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>AVG ACCURACY</span>
                  <strong style={{ color: '#2563EB', fontSize: '16px' }}>{p.avgAccuracy}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>ADHERENCE</span>
                  <strong style={{ color: '#16A34A', fontSize: '16px' }}>{p.adherence}</strong>
                </div>
              </div>

              <a
                href={`/doctor/patients/${p.id}`}
                style={{ display: 'block', textAlign: 'center', backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '10px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', textDecoration: 'none' }}
              >
                View Detailed Analysis →
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
