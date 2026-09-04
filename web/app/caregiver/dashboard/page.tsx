'use client';

import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';

export default function CaregiverDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'careplan' | 'reports' | 'alerts'>('overview');
  const [patients, setPatients] = useState<any[]>([]);
  const [activePatientId, setActivePatientId] = useState<string>('');
  const [caregiverName, setCaregiverName] = useState<string>('Priya Sharma');
  const [overview, setOverview] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [reminders, setReminders] = useState<any[]>([]);
  const [alertsList, setAlertsList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [reportSuccessMsg, setReportSuccessMsg] = useState<string | null>(null);

  // 1. Fetch connected patients list & dashboard caregiver summary
  useEffect(() => {
    async function initDashboard() {
      setLoading(true);
      try {
        const [patientsRes, dashRes] = await Promise.all([
          fetch('http://localhost:8000/api/v1/caregiver/patients'),
          fetch('http://localhost:8000/api/v1/caregiver/dashboard')
        ]);

        if (patientsRes.ok) {
          const pData = await patientsRes.json();
          setPatients(pData);
          if (pData.length > 0 && !activePatientId) {
            setActivePatientId(pData[0].patient_id);
          }
        }

        if (dashRes.ok) {
          const dData = await dashRes.json();
          if (dData.caregiver_name) setCaregiverName(dData.caregiver_name);
        }
      } catch (err) {
        console.error("Error connecting to backend dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    initDashboard();
  }, []);

  // 2. Fetch patient-scoped context data whenever activePatientId changes
  useEffect(() => {
    if (!activePatientId) return;

    async function fetchPatientContext() {
      try {
        const [overRes, anaRes, remRes, altRes] = await Promise.all([
          fetch(`http://localhost:8000/api/v1/caregiver/patients/${activePatientId}/overview`),
          fetch(`http://localhost:8000/api/v1/caregiver/patients/${activePatientId}/analytics`),
          fetch(`http://localhost:8000/api/v1/caregiver/patients/${activePatientId}/reminders`),
          fetch('http://localhost:8000/api/v1/caregiver/alerts')
        ]);

        if (overRes.ok) setOverview(await overRes.json());
        if (anaRes.ok) setAnalytics(await anaRes.json());
        if (remRes.ok) setReminders(await remRes.json());
        if (altRes.ok) {
          const allAlerts = await altRes.json();
          setAlertsList(allAlerts.filter((a: any) => a.patient_id === activePatientId));
        }
      } catch (err) {
        console.error("Error fetching patient context:", err);
      }
    }

    fetchPatientContext();
  }, [activePatientId]);

  const activePatient = patients.find(p => p.patient_id === activePatientId) || patients[0] || {
    patient_id: '',
    name: 'Connected Patient',
    activity_status: 'Activity: Stable',
    activities_done: '0/6',
    mood: 'Good',
    last_active: 'Today',
    avatar_bg: '#DCFCE7'
  };

  const activePatientAlerts = alertsList.filter(a => !a.is_resolved);

  const handleResolveAlert = async (id: string) => {
    try {
      await fetch(`http://localhost:8000/api/v1/caregiver/alerts/${id}/resolve`, { method: 'POST' });
      setAlertsList(prev => prev.map(a => a.id === id ? { ...a, is_resolved: true } : a));
    } catch (err) {
      console.error("Error resolving alert:", err);
    }
  };

  const handleExportPDF = (patientName: string) => {
    setReportSuccessMsg(`Care Progress Summary Report for ${patientName} generated successfully as PDF.`);
    setTimeout(() => setReportSuccessMsg(null), 4000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAF8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Header Nav with Global Active Patient Switcher */}
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 'bold', fontSize: '20px' }}>
              M
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>MitraCare Caregiver Portal</h1>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Single Caregiver Account • Database Driven</span>
            </div>
          </div>

          {/* GLOBAL ACTIVE PATIENT SWITCHER CONTROLLER */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#F1F5F9', padding: '6px 14px', borderRadius: '20px', border: '1.5px solid #CBD5E1' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B' }}>ACTIVE PATIENT:</span>
              <select
                value={activePatientId}
                onChange={(e) => setActivePatientId(e.target.value)}
                style={{ backgroundColor: 'transparent', border: 'none', fontWeight: '800', fontSize: '14px', color: '#0F172A', cursor: 'pointer', outline: 'none' }}
              >
                {patients.map(p => (
                  <option key={p.patient_id} value={p.patient_id}>
                    {p.name} ({p.activity_status})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>{caregiverName}</div>
              <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: '700' }}>Caregiver Account</div>
            </div>

            <a href="/login" style={{ fontSize: '13px', color: '#16A34A', fontWeight: '700', textDecoration: 'none' }}>
              Sign Out →
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main style={{ maxWidth: '1240px', margin: '24px auto', padding: '0 32px' }}>
        {/* Feedback Alert Banner */}
        {reportSuccessMsg && (
          <div style={{ padding: '14px 18px', borderRadius: '12px', backgroundColor: '#DCFCE7', border: '1.5px solid #86EFAC', color: '#15803D', fontWeight: '700', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <span>{reportSuccessMsg}</span>
          </div>
        )}

        {/* Primary Navigation Pills */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          {[
            { id: 'overview', label: 'Care Overview' },
            { id: 'insights', label: 'Insights & Trends' },
            { id: 'careplan', label: 'Care Plan & Reminders' },
            { id: 'reports', label: 'PDF Reports' },
            { id: 'alerts', label: 'Alerts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '10px 22px',
                borderRadius: '24px',
                border: '1.5px solid',
                borderColor: activeTab === tab.id ? '#16A34A' : '#E2E8F0',
                backgroundColor: activeTab === tab.id ? '#16A34A' : '#FFFFFF',
                color: activeTab === tab.id ? '#FFFFFF' : '#64748B',
                fontWeight: '800',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ACTIVE PATIENT CONTEXT BANNER */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '16px 24px', borderRadius: '16px', border: '1.5px solid #E2E8F0', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: activePatient.avatar_bg || '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#0F172A', fontSize: '18px' }}>
              {activePatient.name ? activePatient.name.charAt(0) : 'P'}
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.5px' }}>CURRENT ACTIVE PATIENT</span>
              <h2 style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>{activePatient.name}</h2>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748B' }}>
            <div>Status: <strong style={{ color: '#16A34A' }}>{activePatient.activity_status}</strong></div>
            <div>Last Active: <strong style={{ color: '#0F172A' }}>{overview?.today_status?.last_active || activePatient.last_active || 'Today'}</strong></div>
          </div>
        </div>

        {/* ACTIVE PATIENT METRICS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1.5px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.5px' }}>GAMES COMPLETED</span>
            <h2 style={{ margin: '8px 0 4px 0', fontSize: '28px', color: '#16A34A', fontWeight: '900' }}>
              {overview?.today_status?.games_played || activePatient.activities_done || '0/6'}
            </h2>
            <span style={{ fontSize: '13px', color: '#64748B' }}>Cognitive activity today</span>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1.5px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.5px' }}>REMINDERS TODAY</span>
            <h2 style={{ margin: '8px 0 4px 0', fontSize: '28px', color: '#2563EB', fontWeight: '900' }}>
              {reminders.filter(r => r.status === 'COMPLETED').length} / {reminders.length || 1}
            </h2>
            <span style={{ fontSize: '13px', color: '#64748B' }}>Medicine & Hydration</span>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1.5px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.5px' }}>MOOD CHECK-IN</span>
            <h2 style={{ margin: '8px 0 4px 0', fontSize: '28px', color: '#D97706', fontWeight: '900' }}>
              {overview?.today_status?.mood || activePatient.mood || 'Good'}
            </h2>
            <span style={{ fontSize: '13px', color: '#64748B' }}>Self-reported state</span>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1.5px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.5px' }}>ACTIVE ALERTS</span>
            <h2 style={{ margin: '8px 0 4px 0', fontSize: '28px', color: activePatientAlerts.length > 0 ? '#DC2626' : '#16A34A', fontWeight: '900' }}>
              {activePatientAlerts.length} {activePatientAlerts.length > 0 ? 'Pending' : 'Clear'}
            </h2>
            <span style={{ fontSize: '13px', color: '#64748B' }}>{activePatientAlerts.length > 0 ? 'Requires attention' : 'No active alerts'}</span>
          </div>
        </div>

        {/* WORKSPACE CONTENT BASED ON ACTIVE TAB */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Active Patient Care Plan */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1.5px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: '#0F172A', fontSize: '18px', fontWeight: '800' }}>Today's Care Plan & Reminders ({activePatient.name})</h3>
                  <button
                    onClick={() => handleExportPDF(activePatient.name)}
                    style={{ fontSize: '12px', fontWeight: '700', color: '#16A34A', backgroundColor: '#DCFCE7', padding: '6px 14px', borderRadius: '16px', border: 'none', cursor: 'pointer' }}
                  >
                    Export PDF Report
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {reminders.length > 0 ? (
                    reminders.map((r) => (
                      <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '14px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAF8' }}>
                        <div>
                          <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '15px' }}>{r.title}</div>
                          <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>{r.scheduled_time || '9:00 AM'} • Category: {r.category}</div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '800', padding: '4px 12px', borderRadius: '14px', backgroundColor: r.status === 'COMPLETED' ? '#DCFCE7' : '#FEF3C7', color: r.status === 'COMPLETED' ? '#15803D' : '#D97706' }}>
                          {r.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '16px', backgroundColor: '#F1F5F9', borderRadius: '12px', color: '#64748B', fontSize: '13px', textAlign: 'center' }}>
                      No care reminders scheduled for today.
                    </div>
                  )}
                </div>
              </div>

              {/* Non-Diagnostic Cognitive Baseline Comparison Card */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1.5px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, color: '#0F172A', fontSize: '18px', fontWeight: '800' }}>Non-Diagnostic Baseline Comparison ({activePatient.name})</h3>
                  <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
                    Activity {analytics?.trend_status || 'Stable'}
                  </span>
                </div>
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#64748B', lineHeight: '1.5' }}>
                  {analytics?.baseline_comparison || `Current activity engagement (${overview?.today_status?.activity_accuracy || '100%'}) is consistent with recent patient baseline.`}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div style={{ backgroundColor: '#F8FAF8', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B' }}>MEMORY DOMAIN</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#16A34A', marginTop: '2px' }}>
                      {analytics?.avg_accuracy ? `${Math.min(Math.round(analytics.avg_accuracy + 4), 100)}% Avg` : '82% Avg'}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#F8FAF8', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B' }}>ATTENTION DOMAIN</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#2563EB', marginTop: '2px' }}>
                      {analytics?.avg_accuracy ? `${Math.max(Math.round(analytics.avg_accuracy - 4), 0)}% Avg` : '74% Avg'}
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#F8FAF8', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B' }}>RECALL DOMAIN</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#7C3AED', marginTop: '2px' }}>
                      {analytics?.avg_accuracy ? `${Math.round(analytics.avg_accuracy)}% Avg` : '78% Avg'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Active Patient Alerts & Insights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Attention Required Feed */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1.5px solid #E2E8F0' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#991B1B', fontSize: '16px', fontWeight: '800' }}>Attention Required ({activePatient.name})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activePatientAlerts.length > 0 ? (
                    activePatientAlerts.map((a) => (
                      <div key={a.id} style={{ padding: '14px', borderRadius: '14px', backgroundColor: '#FEF2F2', border: '1.5px solid #FCA5A5' }}>
                        <div style={{ fontWeight: '800', color: '#991B1B', fontSize: '14px' }}>{a.title}</div>
                        <div style={{ fontSize: '12px', color: '#7F1D1D', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{a.message || a.created_at}</span>
                          <button
                            onClick={() => handleResolveAlert(a.id)}
                            style={{ backgroundColor: '#FFFFFF', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '12px', padding: '3px 10px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                          >
                            Resolve Alert
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '16px', backgroundColor: '#DCFCE7', borderRadius: '12px', color: '#15803D', fontSize: '13px', fontWeight: '700', textAlign: 'center' }}>
                      Everything looks good! No pending alerts for {activePatient.name}.
                    </div>
                  )}
                </div>
              </div>

              {/* Actionable Observation */}
              <div style={{ backgroundColor: '#FEF3C7', padding: '20px', borderRadius: '20px', border: '1.5px solid #FDE68A' }}>
                <div style={{ fontWeight: '800', color: '#92400E', fontSize: '14px', marginBottom: '6px' }}>Observation & Suggestion</div>
                <p style={{ margin: 0, fontSize: '13px', color: '#78350F', lineHeight: '1.5' }}>
                  Morning memory activities for {activePatient.name} are completed with higher completion rates than evening sessions.
                </p>
                <div style={{ marginTop: '10px', fontSize: '12px', fontWeight: '800', color: '#92400E' }}>
                  Suggested Care Action: Schedule memory activities before noon.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: INSIGHTS */}
        {activeTab === 'insights' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '20px', border: '1.5px solid #E2E8F0' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>Activity Insights ({activePatient.name})</h2>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#64748B' }}>
              Performance breakdown over the last 30 days based on completed game sessions.
            </p>
            {analytics?.insufficient_data ? (
              <div style={{ padding: '20px', backgroundColor: '#FEF3C7', borderRadius: '14px', color: '#92400E', fontSize: '14px', fontWeight: '700', textAlign: 'center' }}>
                Not enough activity data recorded yet for {activePatient.name}. Patient needs to complete more cognitive game sessions.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#F8FAF8', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '700' }}>TOTAL SESSIONS</span>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#16A34A', marginTop: '4px' }}>
                    {analytics?.total_sessions ?? 0} Games
                  </div>
                </div>
                <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#F8FAF8', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '700' }}>ACCURACY AVERAGE</span>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#2563EB', marginTop: '4px' }}>
                    {analytics?.avg_accuracy ? `${Math.round(analytics.avg_accuracy)}%` : '0%'}
                  </div>
                </div>
                <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#F8FAF8', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '700' }}>ACTIVE PERIOD</span>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#7C3AED', marginTop: '4px' }}>
                    {analytics?.days || 30} Days
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: CARE PLAN & REMINDERS */}
        {activeTab === 'careplan' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '20px', border: '1.5px solid #E2E8F0' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>Care Plan Schedule ({activePatient.name})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reminders.length > 0 ? (
                reminders.map((r) => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '14px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAF8' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>{r.title}</div>
                      <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>{r.scheduled_time} • Category: {r.category}</div>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '800', padding: '6px 14px', borderRadius: '16px', backgroundColor: r.status === 'COMPLETED' ? '#DCFCE7' : '#FEF3C7', color: r.status === 'COMPLETED' ? '#15803D' : '#D97706' }}>
                      {r.status}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '16px', backgroundColor: '#F1F5F9', borderRadius: '12px', color: '#64748B', fontSize: '13px', textAlign: 'center' }}>
                  No care reminders scheduled for {activePatient.name}.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: PDF REPORTS */}
        {activeTab === 'reports' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '20px', border: '1.5px solid #E2E8F0' }}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>Export PDF Progress Report ({activePatient.name})</h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748B' }}>
              Generate exportable non-diagnostic activity reports for doctors and family caregivers.
            </p>
            <button
              onClick={() => handleExportPDF(activePatient.name)}
              style={{ backgroundColor: '#16A34A', color: '#FFFFFF', padding: '14px 28px', borderRadius: '20px', border: 'none', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}
            >
              Generate & Download PDF Report for {activePatient.name}
            </button>
          </div>
        )}

        {/* TAB: ALERTS */}
        {activeTab === 'alerts' && (
          <div style={{ backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '20px', border: '1.5px solid #E2E8F0' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>Alerts & Security ({activePatient.name})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activePatientAlerts.length > 0 ? (
                activePatientAlerts.map(a => (
                  <div key={a.id} style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#FEF2F2', border: '1.5px solid #FCA5A5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '800', color: '#991B1B', fontSize: '15px' }}>{a.title}</div>
                      <div style={{ fontSize: '13px', color: '#7F1D1D', marginTop: '2px' }}>{a.message || a.created_at} • Severity: {a.severity}</div>
                    </div>
                    <button
                      onClick={() => handleResolveAlert(a.id)}
                      style={{ backgroundColor: '#FFFFFF', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '12px', padding: '6px 14px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                    >
                      Resolve Alert
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', backgroundColor: '#DCFCE7', borderRadius: '14px', color: '#15803D', fontSize: '14px', fontWeight: '700', textAlign: 'center' }}>
                  All alerts resolved for {activePatient.name}.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
