'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAF8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Admin Header Nav (Purple Theme) */}
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>Platform Administration</h1>
              <span style={{ fontSize: '12px', color: '#64748B' }}>MitraCare Operations, Security Audit & Aggregated System Metrics</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a href="/admin/users/create" style={{ backgroundColor: '#7C3AED', color: '#FFFFFF', padding: '8px 16px', borderRadius: '18px', fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>
              + Provision Account
            </a>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#6B21A8' }}>Super Admin (Ops)</span>
            <a href="/" style={{ fontSize: '13px', color: '#7C3AED', fontWeight: '700', textDecoration: 'none' }}>← Portals</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 32px' }}>
        {/* Admin Navigation Pills */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <a href="/admin/dashboard" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '8px 18px', borderRadius: '20px', border: 'none', backgroundColor: '#7C3AED', color: '#FFFFFF', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
              Overview
            </button>
          </a>
          <a href="/admin/patients" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '8px 18px', borderRadius: '20px', border: 'none', backgroundColor: '#FFFFFF', color: '#64748B', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
              Patients
            </button>
          </a>
          <a href="/admin/caregivers" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '8px 18px', borderRadius: '20px', border: 'none', backgroundColor: '#FFFFFF', color: '#64748B', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
              Caregivers
            </button>
          </a>
          <a href="/admin/doctors" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '8px 18px', borderRadius: '20px', border: 'none', backgroundColor: '#FFFFFF', color: '#64748B', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
              Doctors
            </button>
          </a>
          <a href="/admin/connections" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '8px 18px', borderRadius: '20px', border: 'none', backgroundColor: '#FFFFFF', color: '#64748B', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
              Connection Audits
            </button>
          </a>
          <a href="/admin/audit" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '8px 18px', borderRadius: '20px', border: 'none', backgroundColor: '#FFFFFF', color: '#64748B', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
              Security Audit Logs
            </button>
          </a>
          <a href="/admin/system" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '8px 18px', borderRadius: '20px', border: 'none', backgroundColor: '#FFFFFF', color: '#64748B', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
              System Health
            </button>
          </a>
        </div>

        {/* METRICS SUMMARY GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B' }}>TOTAL PATIENTS</span>
            <h2 style={{ margin: '8px 0 4px 0', fontSize: '28px', color: '#16A34A' }}>3 Active</h2>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Registered profiles</span>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B' }}>TOTAL CAREGIVERS</span>
            <h2 style={{ margin: '8px 0 4px 0', fontSize: '28px', color: '#2563EB' }}>4 Users</h2>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Mobile & Web sessions</span>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B' }}>ACTIVE CONNECTIONS</span>
            <h2 style={{ margin: '8px 0 4px 0', fontSize: '28px', color: '#7C3AED' }}>3 Relationships</h2>
            <span style={{ fontSize: '12px', color: '#64748B' }}>QR / Code Verified</span>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B' }}>GAME SESSIONS</span>
            <h2 style={{ margin: '8px 0 4px 0', fontSize: '28px', color: '#D97706' }}>3,160 Total</h2>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Match Pair / Triplet</span>
          </div>
        </div>

        {/* SYSTEM STATUS & AGGREGATED USAGE */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0F172A' }}>Activity Session Usage (Aggregated)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'Match the Pair', count: '1,420 sessions', pct: '45%' },
                { name: 'Match the Triplet', count: '980 sessions', pct: '31%' },
                { name: 'Remember Pictures', count: '760 sessions', pct: '24%' },
              ].map((g) => (
                <div key={g.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '10px', backgroundColor: '#F8FAF8', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontWeight: '700', color: '#0F172A', fontSize: '14px' }}>{g.name}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#7C3AED' }}>{g.count}</span>
                    <span style={{ fontSize: '12px', color: '#64748B', marginLeft: '8px' }}>({g.pct})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: '#F3E8FF', padding: '24px', borderRadius: '16px', border: '1px solid #C084FC' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#6B21A8', fontSize: '18px', fontWeight: '800' }}>Platform Operational Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#581C87' }}>
              <div>• <strong>FastAPI Backend</strong>: Operational (Port 8000)</div>
              <div>• <strong>Neon PostgreSQL</strong>: Connected & Healthy</div>
              <div>• <strong>Active Web Sessions</strong>: 42 Connected</div>
              <div>• <strong>RBAC & IDOR Enforcement</strong>: Active</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
