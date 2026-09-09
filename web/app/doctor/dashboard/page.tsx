'use client';

import React, { useState } from 'react';
import {
  Stethoscope,
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Menu,
  Brain,
  CheckCircle2,
  Clock,
  Download,
  Search,
  LogOut,
  Shield,
  ArrowUpRight,
  Filter
} from 'lucide-react';

export default function DoctorDashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'reports' | 'analytics' | 'alerts'>('overview');
  const [timeframe, setTimeframe] = useState<'7' | '30' | '90'>('30');
  const [patientSearch, setPatientSearch] = useState<string>('');
  const [reportSuccessMsg, setReportSuccessMsg] = useState<string | null>(null);

  const authorizedPatients = [
    { id: 'p-1', publicId: 'P-789', name: 'Amma', age: 75, status: 'Activity: Stable', sessions: 24, avgAccuracy: '81.4%', adherence: '86%', lastActive: '10:30 AM Today' },
    { id: 'p-2', publicId: 'P-456', name: 'Ravi', age: 78, status: 'Needs Attention', sessions: 18, avgAccuracy: '74.2%', adherence: '72%', lastActive: '9:45 AM Today' },
    { id: 'p-3', publicId: 'P-123', name: 'Lakshmi Patil', age: 80, status: 'Activity: Active', sessions: 28, avgAccuracy: '88.0%', adherence: '92%', lastActive: '11:00 AM Today' },
  ];

  const reports = [
    { id: 'rep-101', patient: 'Amma (P-789)', period: 'Last 30 Days', completed: 24, avgAcc: '81.4%', adherence: '84.5%', status: 'Available' },
    { id: 'rep-102', patient: 'Ravi (P-456)', period: 'Last 30 Days', completed: 18, avgAcc: '74.2%', adherence: '72.0%', status: 'Available' },
    { id: 'rep-103', patient: 'Lakshmi Patil (P-123)', period: 'Last 30 Days', completed: 28, avgAcc: '88.0%', adherence: '92.0%', status: 'Available' },
  ];

  const [clinicalFlags, setClinicalFlags] = useState([
    {
      id: 'flg-1',
      patient: 'Ravi (P-456)',
      title: 'Observed Cognitive Activity Dip',
      detail: 'Session accuracy dropped by 8% over the last 4 days. Morning memory recall routine was skipped twice.',
      severity: 'Moderate',
      loggedAt: 'Yesterday 4:15 PM',
      isAcknowledged: false
    }
  ]);

  const handleExportReport = (patientName: string) => {
    setReportSuccessMsg(`Clinical Progress Summary for ${patientName} generated successfully as PDF.`);
    setTimeout(() => setReportSuccessMsg(null), 4000);
  };

  const handleAcknowledgeFlag = (id: string) => {
    setClinicalFlags(prev => prev.map(f => f.id === id ? { ...f, isAcknowledged: true } : f));
  };

  const filteredPatients = authorizedPatients.filter(p =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.publicId.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const pendingFlagsCount = clinicalFlags.filter(f => !f.isAcknowledged).length;

  const navItems = [
    { id: 'overview', label: 'Clinical Overview', icon: LayoutDashboard },
    { id: 'patients', label: 'Authorized Patients', icon: Users, badge: authorizedPatients.length },
    { id: 'reports', label: 'Clinical Reports', icon: FileText },
    { id: 'analytics', label: 'Domain Analytics', icon: Brain },
    { id: 'alerts', label: 'Attention Flags', icon: AlertTriangle, badge: pendingFlagsCount },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#0F172A' }}>
      
      {/* ========================================================================= */}
      {/* 1. TOGGLABLE LEFT PANEL (CLINICAL SAAS SIDEBAR)                           */}
      {/* ========================================================================= */}
      <aside
        style={{
          width: sidebarCollapsed ? '76px' : '260px',
          minWidth: sidebarCollapsed ? '76px' : '260px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
          boxShadow: '2px 0 10px rgba(0, 0, 0, 0.02)',
          userSelect: 'none',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            height: '68px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
            padding: sidebarCollapsed ? '0' : '0 16px',
          }}
        >
          {!sidebarCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: '800',
                  fontSize: '18px',
                  boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
                  flexShrink: 0
                }}
              >
                <Stethoscope size={20} color="#FFFFFF" />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
                  MitraCare
                </div>
                <div style={{ fontSize: '11px', color: '#2563EB', fontWeight: '700', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                  Clinician Portal
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
              }}
              title="MitraCare Clinician Portal"
            >
              <Stethoscope size={20} color="#FFFFFF" />
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              color: '#64748B',
              display: sidebarCollapsed ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Collapsed Mode Quick Re-open button */}
        {sidebarCollapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px 0' }}>
            <button
              onClick={() => setSidebarCollapsed(false)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Expand Sidebar"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <div style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
          {!sidebarCollapsed && (
            <div style={{ padding: '0 10px 6px 10px', fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Clinical Menu
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: sidebarCollapsed ? '12px 0' : '10px 14px',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  borderRadius: '12px',
                  border: isActive ? '1px solid rgba(37, 99, 235, 0.25)' : '1px solid transparent',
                  backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                  color: isActive ? '#1D4ED8' : '#64748B',
                  fontWeight: isActive ? '800' : '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.18s ease',
                  textAlign: 'left',
                }}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? '#2563EB' : 'inherit' }}>
                  <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
                </div>

                {!sidebarCollapsed && (
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                )}

                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span
                    style={{
                      position: sidebarCollapsed ? 'absolute' : 'static',
                      top: sidebarCollapsed ? '6px' : 'auto',
                      right: sidebarCollapsed ? '8px' : 'auto',
                      backgroundColor: item.id === 'alerts' ? '#DC2626' : '#2563EB',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '2px 7px',
                      borderRadius: '10px',
                      lineHeight: '14px',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer: Doctor Account */}
        <div style={{ borderTop: '1px solid #F1F5F9', padding: '12px' }}>
          {!sidebarCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D4ED8', fontWeight: '800', fontSize: '13px' }}>
                  AK
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>Dr. A. K. Sharma</div>
                  <div style={{ fontSize: '11px', color: '#2563EB', fontWeight: '700' }}>Lead Neurologist</div>
                </div>
              </div>
              <a href="/login" title="Sign out" style={{ color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
                <LogOut size={16} />
              </a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D4ED8', fontWeight: '800', fontSize: '13px' }} title="Dr. A. K. Sharma">
                AK
              </div>
              <a href="/login" title="Sign out" style={{ color: '#94A3B8' }}>
                <LogOut size={16} />
              </a>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE & TOP HEADER                                            */}
      {/* ========================================================================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        
        {/* Top Header */}
        <header
          style={{
            height: '68px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            padding: '0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Left: Breadcrumbs & Toggle control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span style={{ color: '#94A3B8', fontWeight: '600' }}>Portal</span>
              <span style={{ color: '#CBD5E1' }}>/</span>
              <span style={{ color: '#64748B', fontWeight: '600' }}>Doctor & Clinician</span>
              <span style={{ color: '#CBD5E1' }}>/</span>
              <span style={{ color: '#0F172A', fontWeight: '800' }}>
                {navItems.find(i => i.id === activeTab)?.label}
              </span>
            </div>
          </div>

          {/* Right: Longitudinal Window & Fast Portals Link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#F8FAFC', padding: '4px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', padding: '0 6px' }}>WINDOW:</span>
              {(['7', '30', '90'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: timeframe === t ? '#2563EB' : 'transparent',
                    color: timeframe === t ? '#FFFFFF' : '#64748B',
                    fontWeight: '800',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  {t}D
                </button>
              ))}
            </div>

            <a href="/" style={{ fontSize: '13px', color: '#2563EB', fontWeight: '700', textDecoration: 'none' }}>
              ← Portals
            </a>
          </div>
        </header>

        {/* Workspace Body */}
        <main style={{ padding: '28px', maxWidth: '1360px', width: '100%', boxSizing: 'border-box', margin: '0 auto' }}>
          
          {/* Feedback Banner */}
          {reportSuccessMsg && (
            <div style={{ padding: '14px 20px', borderRadius: '14px', backgroundColor: '#EFF6FF', border: '1.5px solid #93C5FD', color: '#1D4ED8', fontWeight: '700', fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#2563EB" />
              <span>{reportSuccessMsg}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: CLINICAL OVERVIEW                                                  */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* METRIC SUMMARY TILES */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>AUTHORIZED PATIENTS</span>
                  <h2 style={{ margin: '8px 0 4px 0', fontSize: '28px', color: '#2563EB', fontWeight: '900' }}>3 Linked</h2>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Access verified via relationships</span>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>TOTAL SESSIONS ({timeframe}D)</span>
                  <h2 style={{ margin: '8px 0 4px 0', fontSize: '28px', color: '#16A34A', fontWeight: '900' }}>70 Sessions</h2>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Match Pair / Triplet / Recall</span>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>AGGREGATED ACCURACY</span>
                  <h2 style={{ margin: '8px 0 4px 0', fontSize: '28px', color: '#7C3AED', fontWeight: '900' }}>81.2%</h2>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Stable cross-domain baseline</span>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>ATTENTION FLAGS</span>
                  <h2 style={{ margin: '8px 0 4px 0', fontSize: '28px', color: pendingFlagsCount > 0 ? '#D97706' : '#16A34A', fontWeight: '900' }}>
                    {pendingFlagsCount} Active
                  </h2>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Observed activity variation</span>
                </div>
              </div>

              {/* AUTHORIZED PATIENTS PERFORMANCE TABLE */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#0F172A', fontSize: '18px', fontWeight: '900' }}>Authorized Patient Performance Summary</h3>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>Non-diagnostic longitudinal routine tracking</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('patients')}
                    style={{ fontSize: '13px', fontWeight: '800', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '6px 14px', borderRadius: '12px', border: '1px solid #BFDBFE', cursor: 'pointer' }}
                  >
                    View Patient Cards →
                  </button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px' }}>
                      <th style={{ padding: '12px' }}>PATIENT NAME</th>
                      <th style={{ padding: '12px' }}>AGE</th>
                      <th style={{ padding: '12px' }}>ACTIVITY STATUS</th>
                      <th style={{ padding: '12px' }}>SESSIONS ({timeframe}D)</th>
                      <th style={{ padding: '12px' }}>AVG ACCURACY</th>
                      <th style={{ padding: '12px' }}>LAST ACTIVE</th>
                      <th style={{ padding: '12px' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {authorizedPatients.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '14px 12px', fontWeight: '800', color: '#0F172A' }}>{p.name}</td>
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
                        <td style={{ padding: '14px 12px', fontWeight: '700' }}>{p.sessions}</td>
                        <td style={{ padding: '14px 12px', fontWeight: '800', color: '#2563EB' }}>{p.avgAccuracy}</td>
                        <td style={{ padding: '14px 12px', color: '#64748B' }}>{p.lastActive}</td>
                        <td style={{ padding: '14px 12px' }}>
                          <a href={`/doctor/patients/${p.id}`} style={{ color: '#2563EB', fontWeight: '800', textDecoration: 'none', fontSize: '13px' }}>
                            Analyze →
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* DOMAIN BREAKDOWN & SUMMARY */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#0F172A', fontSize: '18px', fontWeight: '900' }}>
                    Cognitive Domain Breakdown (Aggregated)
                  </h3>
                  {[
                    { domain: 'Memory Retention', score: 82, color: '#16A34A' },
                    { domain: 'Sustained Attention', score: 76, color: '#2563EB' },
                    { domain: 'Pattern Recognition', score: 79, color: '#7C3AED' },
                    { domain: 'Working Recall', score: 75, color: '#D97706' },
                  ].map((d) => (
                    <div key={d.domain} style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>
                        <span>{d.domain}</span>
                        <span style={{ color: d.color }}>{d.score}%</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${d.score}%`, backgroundColor: d.color, borderRadius: '4px' }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ backgroundColor: '#EFF6FF', padding: '24px', borderRadius: '20px', border: '1.5px solid #BFDBFE' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Shield size={20} color="#1E40AF" />
                    <h3 style={{ margin: 0, color: '#1E40AF', fontSize: '16px', fontWeight: '900' }}>Clinical Data Guideline</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#1E3A8A', lineHeight: '1.6' }}>
                    MitraCare tracks observed application game engagement, routine completion rates, and response accuracy. All analytics reflect patient interaction with non-diagnostic exercises and should be corroborated with clinical evaluations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: AUTHORIZED PATIENTS                                                */}
          {/* ========================================================================= */}
          {activeTab === 'patients' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '20px 24px', borderRadius: '20px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '420px' }}>
                  <Search size={18} color="#64748B" />
                  <input
                    type="text"
                    placeholder="Search patients by name or ID (e.g. Amma, P-123)..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>
                  Showing {filteredPatients.length} Authorized Patients
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {filteredPatients.map((p) => (
                  <div key={p.id} style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>{p.name}</h3>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>ID: {p.publicId} • Age {p.age}</span>
                      </div>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', backgroundColor: p.status.includes('Attention') ? '#FEF3C7' : '#DCFCE7', color: p.status.includes('Attention') ? '#D97706' : '#16A34A' }}>
                        {p.status}
                      </span>
                    </div>

                    <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '14px 0' }} />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '13px', marginBottom: '18px' }}>
                      <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '10px' }}>
                        <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '700' }}>AVG ACCURACY</span>
                        <strong style={{ color: '#2563EB', fontSize: '16px' }}>{p.avgAccuracy}</strong>
                      </div>
                      <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '10px' }}>
                        <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '700' }}>ADHERENCE</span>
                        <strong style={{ color: '#16A34A', fontSize: '16px' }}>{p.adherence}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <a
                        href={`/doctor/patients/${p.id}`}
                        style={{ flex: 1, textAlign: 'center', backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '10px', borderRadius: '12px', fontWeight: '800', fontSize: '13px', textDecoration: 'none', border: '1px solid #BFDBFE' }}
                      >
                        Deep Analysis →
                      </a>
                      <button
                        onClick={() => handleExportReport(p.name)}
                        style={{ backgroundColor: '#FFFFFF', color: '#64748B', padding: '10px 14px', borderRadius: '12px', border: '1px solid #CBD5E1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Download summary report"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CLINICAL REPORTS                                                   */}
          {/* ========================================================================= */}
          {activeTab === 'reports' && (
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>Generated Patient Progress Reports</h3>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Official summaries formatted for clinician reviews and patient charts</span>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px' }}>
                    <th style={{ padding: '12px' }}>REPORT ID</th>
                    <th style={{ padding: '12px' }}>PATIENT</th>
                    <th style={{ padding: '12px' }}>PERIOD</th>
                    <th style={{ padding: '12px' }}>SESSIONS</th>
                    <th style={{ padding: '12px' }}>AVG ACCURACY</th>
                    <th style={{ padding: '12px' }}>REMINDER ADHERENCE</th>
                    <th style={{ padding: '12px' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 12px', fontWeight: '800', color: '#2563EB' }}>{r.id}</td>
                      <td style={{ padding: '14px 12px', fontWeight: '800', color: '#0F172A' }}>{r.patient}</td>
                      <td style={{ padding: '14px 12px', color: '#64748B' }}>{r.period}</td>
                      <td style={{ padding: '14px 12px', fontWeight: '600' }}>{r.completed}</td>
                      <td style={{ padding: '14px 12px', fontWeight: '800', color: '#2563EB' }}>{r.avgAcc}</td>
                      <td style={{ padding: '14px 12px', fontWeight: '800', color: '#16A34A' }}>{r.adherence}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <button
                          onClick={() => handleExportReport(r.patient)}
                          style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Download size={13} />
                          <span>Export PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: DOMAIN ANALYTICS                                                   */}
          {/* ========================================================================= */}
          {activeTab === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>
                  Cognitive Domain Evaluation
                </h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748B' }}>
                  Aggregated performance benchmarks across all authorized patient sessions over the past {timeframe} days.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  {[
                    { title: 'Working Memory', score: '82%', desc: 'Match Pair exercise consistency', tag: 'Normal' },
                    { title: 'Visual Attention', score: '76%', desc: 'Visual search latency response', tag: 'Stable' },
                    { title: 'Pattern Recognition', score: '79%', desc: 'Triplet sequence completion', tag: 'Optimal' },
                    { title: 'Immediate Recall', score: '75%', desc: 'Delayed object recollection', tag: 'Attention Needed' },
                  ].map((card, idx) => (
                    <div key={idx} style={{ backgroundColor: '#F8FAFC', padding: '18px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>{card.title}</span>
                        <span style={{ fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '8px', backgroundColor: card.tag.includes('Attention') ? '#FEF3C7' : '#DCFCE7', color: card.tag.includes('Attention') ? '#D97706' : '#16A34A' }}>
                          {card.tag}
                        </span>
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '900', color: '#2563EB', margin: '8px 0 4px 0' }}>{card.score}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>{card.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: ATTENTION FLAGS & ALERTS                                           */}
          {/* ========================================================================= */}
          {activeTab === 'alerts' && (
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>Clinical Attention Flags</h3>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Patient performance variances detected across cognitive activities</span>
                </div>
                <span style={{ backgroundColor: pendingFlagsCount > 0 ? '#FEF2F2' : '#DCFCE7', color: pendingFlagsCount > 0 ? '#DC2626' : '#16A34A', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
                  {pendingFlagsCount} Pending Review
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {clinicalFlags.map((flg) => (
                  <div
                    key={flg.id}
                    style={{
                      padding: '18px 20px',
                      borderRadius: '16px',
                      backgroundColor: flg.isAcknowledged ? '#F8FAFC' : '#FEF2F2',
                      border: '1.5px solid',
                      borderColor: flg.isAcknowledged ? '#E2E8F0' : '#FCA5A5',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '16px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '900', color: flg.isAcknowledged ? '#475569' : '#991B1B', fontSize: '15px' }}>
                          {flg.patient} — {flg.title}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '8px', backgroundColor: '#DC2626', color: '#FFFFFF' }}>
                          {flg.severity}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: flg.isAcknowledged ? '#64748B' : '#7F1D1D', marginTop: '4px' }}>
                        {flg.detail}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                        Logged: {flg.loggedAt}
                      </div>
                    </div>

                    {!flg.isAcknowledged ? (
                      <button
                        onClick={() => handleAcknowledgeFlag(flg.id)}
                        style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #FCA5A5', color: '#991B1B', borderRadius: '12px', padding: '8px 16px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                      >
                        Acknowledge Flag
                      </button>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={14} />
                        Reviewed
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
