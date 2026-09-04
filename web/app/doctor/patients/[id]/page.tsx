'use client';

import React, { useState } from 'react';

export const dynamic = 'force-dynamic';

export default function DoctorPatientAnalysisPage({ params }: { params: { id: string } }) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAF8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>Clinical Analysis: Amma (ID: P-789)</h1>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Age 75 • Authorized Doctor View</span>
          </div>
          <a href="/doctor/patients" style={{ fontSize: '13px', color: '#2563EB', fontWeight: '700', textDecoration: 'none' }}>← Back to Patient List</a>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 32px' }}>
        {/* Time Range Selector */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {(['7d', '30d', '90d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              style={{
                padding: '6px 16px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: timeRange === r ? '#2563EB' : '#FFFFFF',
                color: timeRange === r ? '#FFFFFF' : '#64748B',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Last {r.toUpperCase()}
            </button>
          ))}
        </div>

        {/* 4 METRIC CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B' }}>TOTAL SESSIONS</span>
            <h3 style={{ margin: '6px 0 0 0', fontSize: '24px', color: '#0F172A' }}>32 Completed</h3>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B' }}>AVG ACCURACY</span>
            <h3 style={{ margin: '6px 0 0 0', fontSize: '24px', color: '#2563EB' }}>81.4%</h3>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B' }}>ACTIVE DAYS</span>
            <h3 style={{ margin: '6px 0 0 0', fontSize: '24px', color: '#16A34A' }}>26 / 30 Days</h3>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B' }}>REMINDER ADHERENCE</span>
            <h3 style={{ margin: '6px 0 0 0', fontSize: '24px', color: '#D97706' }}>84.5%</h3>
          </div>
        </div>

        {/* COGNITIVE PERFORMANCE TREND & DOMAIN BREAKDOWN */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0F172A' }}>Weekly Performance Progression</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '180px', paddingTop: '20px' }}>
              {[
                { week: 'W1', score: 76 },
                { week: 'W2', score: 78.5 },
                { week: 'W3', score: 80.2 },
                { week: 'W4', score: 82.4 },
              ].map((item) => (
                <div key={item.week} style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ height: `${item.score}%`, backgroundColor: '#2563EB', borderRadius: '8px 8px 0 0', margin: '0 16px' }} />
                  <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginTop: '8px' }}>{item.week} ({item.score}%)</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0F172A' }}>Cognitive Domains</h3>
            {[
              { domain: 'Memory', score: 82 },
              { domain: 'Attention', score: 76 },
              { domain: 'Recognition', score: 79 },
              { domain: 'Recall', score: 75 },
            ].map((d) => (
              <div key={d.domain} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                  <span>{d.domain}</span>
                  <span style={{ color: '#2563EB' }}>{d.score}%</span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px' }}>
                  <div style={{ height: '100%', width: `${d.score}%`, backgroundColor: '#2563EB', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
