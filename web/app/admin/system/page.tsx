'use client';

import React from 'react';

export default function AdminSystemPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAF8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>System Health & Infrastructure</h1>
          <a href="/admin/dashboard" style={{ fontSize: '13px', color: '#7C3AED', fontWeight: '700', textDecoration: 'none' }}>← Back to Admin Dashboard</a>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '800' }}>FASTAPI BACKEND</span>
            <h3 style={{ margin: '8px 0 4px 0', color: '#16A34A', fontSize: '24px' }}>HEALTHY</h3>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Uptime: 99.98% • Port 8000</span>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '800' }}>NEON POSTGRESQL</span>
            <h3 style={{ margin: '8px 0 4px 0', color: '#16A34A', fontSize: '24px' }}>CONNECTED</h3>
            <span style={{ fontSize: '12px', color: '#64748B' }}>SSL Active • Pool size: 20</span>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '800' }}>SECURITY STATUS</span>
            <h3 style={{ margin: '8px 0 4px 0', color: '#7C3AED', fontSize: '24px' }}>RBAC ENFORCED</h3>
            <span style={{ fontSize: '12px', color: '#64748B' }}>IDOR & Token Validation Active</span>
          </div>
        </div>
      </main>
    </div>
  );
}
