'use client';

import React, { useState } from 'react';
import { Stethoscope } from 'lucide-react';

export default function DoctorDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'reports'>('overview');
  const [timeframe, setTimeframe] = useState<'7' | '30' | '90'>('30');

  const authorizedPatients = [
    { id: 'p-1', name: 'Amma (ID: P-789)', age: 75, status: 'Activity: Stable', sessions: 24, avgAccuracy: '81.4%', lastActive: '10:30 AM' },
    { id: 'p-2', name: 'Ravi (ID: P-456)', age: 78, status: 'Needs Attention', sessions: 18, avgAccuracy: '74.2%', lastActive: '9:45 AM' },
    { id: 'p-3', name: 'Lakshmi Patil (ID: P-123)', age: 80, status: 'Activity: Active', sessions: 28, avgAccuracy: '88.0%', lastActive: '11:00 AM' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAF8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Doctor Header Nav (Blue Theme) */}
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Stethoscope size={20} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>Doctor & Clinician Portal</h1>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Evidence-Based Cognitive Activity & Adherence Analytics</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#1E40AF' }}>Dr. A. K. Sharma (Neurologist)</span>
            <a href="/" style={{ fontSize: '13px', color: '#2563EB', fontWeight: '700', textDecoration: 'none' }}>← Portals</a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 32px' }}>
        {/* Navigation Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <a href="/doctor/dashboard" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
              Overview
            </button>
          </a>
          <a href="/doctor/patients" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', backgroundColor: '#FFFFFF', color: '#64748B', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
              Authorized Patients
            </button>
          </a>
          <a href="/doctor/reports" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', backgroundColor: '#FFFFFF', color: '#64748B', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
              Clinical Activity Reports
            </button>
          </a>
        </div>

        {/* Longitudinal Window Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '12px 20px', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>Longitudinal Monitoring Window:</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['7', '30', '90'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: timeframe === t ? '#2563EB' : '#CBD5E1',
                  backgroundColor: timeframe === t ? '#EFF6FF' : '#FFFFFF',
                  color: timeframe === t ? '#2563EB' : '#64748B',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {t} Days Window
              </button>
            ))}
          </div>
        </div>

        {/* METRIC SUMMARY TILES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', letterSpacing: '0.5px' }}>AUTHORIZED PATIENTS</span>
            <h2 style={{ margin: '8px 0 4px 0', fontSize: '28px', color: '#2563EB' }}>3 Linked</h2>
            <span style={{ fontSize: '13px', color: '#64748B' }}>Access verified via relationships</span>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', letterSpacing: '0.5px' }}>TOTAL SESSIONS (30D)</span>
            <h2 style={{ margin: '8px 0 4px 0', fontSize: '28px', color: '#16A34A' }}>70 Sessions</h2>
            <span style={{ fontSize: '13px', color: '#64748B' }}>Match Pair / Triplet / Recall</span>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', letterSpacing: '0.5px' }}>AVG ACCURACY</span>
            <h2 style={{ margin: '8px 0 4px 0', fontSize: '28px', color: '#7C3AED' }}>81.2%</h2>
            <span style={{ fontSize: '13px', color: '#64748B' }}>Stable cross-domain performance</span>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', letterSpacing: '0.5px' }}>ATTENTION INDICATORS</span>
            <h2 style={{ margin: '8px 0 4px 0', fontSize: '28px', color: '#D97706' }}>1 Flag</h2>
            <span style={{ fontSize: '13px', color: '#64748B' }}>Observed activity dip</span>
          </div>
        </div>

        {/* AUTHORIZED PATIENTS PERFORMANCE TABLE */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#0F172A', fontSize: '18px' }}>Authorized Patient Performance Summary</h3>
            <span style={{ fontSize: '13px', color: '#64748B' }}>Non-Diagnostic Activity Metrics</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px' }}>
                <th style={{ padding: '12px' }}>PATIENT NAME</th>
                <th style={{ padding: '12px' }}>AGE</th>
                <th style={{ padding: '12px' }}>ACTIVITY STATUS</th>
                <th style={{ padding: '12px' }}>SESSIONS (30D)</th>
                <th style={{ padding: '12px' }}>AVG ACCURACY</th>
                <th style={{ padding: '12px' }}>LAST ACTIVE</th>
                <th style={{ padding: '12px' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {authorizedPatients.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 12px', fontWeight: '700', color: '#0F172A' }}>{p.name}</td>
                  <td style={{ padding: '14px 12px', color: '#64748B' }}>{p.age}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '700',
                      backgroundColor: p.status.includes('Attention') ? '#FEF3C7' : '#DCFCE7',
                      color: p.status.includes('Attention') ? '#D97706' : '#16A34A'
                    }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', fontWeight: '600' }}>{p.sessions}</td>
                  <td style={{ padding: '14px 12px', fontWeight: '700', color: '#2563EB' }}>{p.avgAccuracy}</td>
                  <td style={{ padding: '14px 12px', color: '#64748B' }}>{p.lastActive}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <a href={`/doctor/patients/${p.id}`} style={{ color: '#2563EB', fontWeight: '700', textDecoration: 'none', fontSize: '13px' }}>
                      Analyze →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* DOMAIN BREAKDOWN & SUMMARY */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#0F172A', fontSize: '18px' }}>Cognitive Domain Breakdown (Aggregated)</h3>
            {[
              { domain: 'Memory', score: 82 },
              { domain: 'Attention', score: 76 },
              { domain: 'Recognition', score: 79 },
              { domain: 'Recall', score: 75 },
            ].map((d) => (
              <div key={d.domain} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                  <span>{d.domain}</span>
                  <span style={{ color: '#2563EB' }}>{d.score}%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${d.score}%`, backgroundColor: '#2563EB', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: '#DBEAFE', padding: '24px', borderRadius: '16px', border: '1px solid #93C5FD' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#1E40AF', fontSize: '18px', fontWeight: '800' }}>Clinical Data Guideline</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#1E3A8A', lineHeight: '1.6' }}>
              MitraCare tracks observed application game engagement, completion rates, and response accuracy. All analytics reflect patient interaction with memory games and reminders. They do not constitute formal medical diagnoses.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
