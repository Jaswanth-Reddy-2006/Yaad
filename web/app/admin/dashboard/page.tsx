'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  HeartHandshake,
  Stethoscope,
  Link2,
  Lock,
  Server,
  ChevronLeft,
  ChevronRight,
  Menu,
  Plus,
  LogOut,
  CheckCircle2,
  Activity,
  Database,
  Search,
  ExternalLink,
  Shield
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'patients' | 'caregivers' | 'doctors' | 'connections' | 'audit' | 'system'
  >('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data across admin domains
  const patients = [
    { id: 'p-1', publicId: 'USR-PAT-001', name: 'Amma', age: 75, lang: 'Kannada (kn)', created: '2026-08-12', status: 'Active' },
    { id: 'p-2', publicId: 'USR-PAT-002', name: 'Ravi', age: 78, lang: 'Hindi (hi)', created: '2026-08-15', status: 'Active' },
    { id: 'p-3', publicId: 'USR-PAT-003', name: 'Lakshmi Patil', age: 80, lang: 'Marathi (mr)', created: '2026-08-20', status: 'Active' },
  ];

  const caregivers = [
    { id: 'cg-1', name: 'Priya Sharma', email: 'priya@mitracare.org', patientsCount: 3, relType: 'Family Member', status: 'Active' },
    { id: 'cg-2', name: 'Anil Kumar', email: 'anil@mitracare.org', patientsCount: 1, relType: 'Primary Caregiver', status: 'Active' },
  ];

  const doctors = [
    { id: 'doc-1', name: 'Dr. A. K. Sharma', email: 'doctor@mitracare.org', specialty: 'Neurology', hospital: 'Apollo Neuro Center', status: 'Verified' },
    { id: 'doc-2', name: 'Dr. V. Rao', email: 'v.rao@geriatrics.org', specialty: 'Geriatric Care', hospital: 'Manipal Hospital', status: 'Verified' },
    { id: 'doc-3', name: 'Dr. S. Menon', email: 's.menon@mindcare.in', specialty: 'Neuro-Psychiatry', hospital: 'NIMHANS Allied', status: 'Verified' },
  ];

  const connections = [
    { id: 'rel-101', caregiver: 'Priya Sharma', patient: 'Amma', code: 'YAAD-789', status: 'ACTIVE', pairedAt: '2026-08-14 10:30' },
    { id: 'rel-102', caregiver: 'Priya Sharma', patient: 'Ravi', code: 'YAAD-456', status: 'ACTIVE', pairedAt: '2026-08-16 11:15' },
    { id: 'rel-103', caregiver: 'Priya Sharma', patient: 'Lakshmi Patil', code: 'YAAD-123', status: 'ACTIVE', pairedAt: '2026-08-21 09:00' },
  ];

  const auditLogs = [
    { id: 'aud-1', actor: 'caregiver@mitracare.org', action: 'PATIENT_OVERVIEW_READ', target: 'P-123', status: 'SUCCESS', ip: '192.168.1.14', time: '5 mins ago' },
    { id: 'aud-2', actor: 'doctor@mitracare.org', action: 'REPORT_EXPORT_PDF', target: 'P-789', status: 'SUCCESS', ip: '10.0.4.22', time: '18 mins ago' },
    { id: 'aud-3', actor: 'admin@mitracare.org', action: 'RBAC_ROLE_VERIFY', target: 'USR-PAT-002', status: 'SUCCESS', ip: '127.0.0.1', time: '1 hour ago' },
    { id: 'aud-4', actor: 'priya@mitracare.org', action: 'ALERT_RESOLVE_ACTION', target: 'ALT-101', status: 'SUCCESS', ip: '192.168.1.14', time: '2 hours ago' },
  ];

  const navItems = [
    { id: 'overview', label: 'System Overview', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients Directory', icon: Users, badge: patients.length },
    { id: 'caregivers', label: 'Caregivers Directory', icon: HeartHandshake, badge: caregivers.length },
    { id: 'doctors', label: 'Doctors & Clinicians', icon: Stethoscope, badge: doctors.length },
    { id: 'connections', label: 'Connection Audits', icon: Link2, badge: connections.length },
    { id: 'audit', label: 'Security Audit Logs', icon: Lock },
    { id: 'system', label: 'System Health & DB', icon: Server },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FAF5FF', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#0F172A' }}>
      
      {/* ========================================================================= */}
      {/* 1. TOGGLABLE LEFT PANEL (OPS SAAS SIDEBAR)                                */}
      {/* ========================================================================= */}
      <aside
        style={{
          width: sidebarCollapsed ? '76px' : '260px',
          minWidth: sidebarCollapsed ? '76px' : '260px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E9D5FF',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
          boxShadow: '2px 0 10px rgba(107, 33, 168, 0.03)',
          userSelect: 'none',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            height: '68px',
            borderBottom: '1px solid #F3E8FF',
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
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: '800',
                  boxShadow: '0 4px 10px rgba(124, 58, 237, 0.25)',
                  flexShrink: 0
                }}
              >
                <ShieldCheck size={20} color="#FFFFFF" />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
                  MitraCare
                </div>
                <div style={{ fontSize: '11px', color: '#7C3AED', fontWeight: '700', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                  Platform Ops
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 10px rgba(124, 58, 237, 0.25)',
              }}
              title="MitraCare Platform Ops"
            >
              <ShieldCheck size={20} color="#FFFFFF" />
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              border: '1px solid #E9D5FF',
              backgroundColor: '#FAF5FF',
              color: '#6B21A8',
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
                border: '1px solid #E9D5FF',
                backgroundColor: '#FAF5FF',
                color: '#6B21A8',
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
            <div style={{ padding: '0 10px 6px 10px', fontSize: '11px', fontWeight: '800', color: '#A855F7', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Operations Menu
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
                  border: isActive ? '1px solid rgba(124, 58, 237, 0.25)' : '1px solid transparent',
                  backgroundColor: isActive ? '#F3E8FF' : 'transparent',
                  color: isActive ? '#6B21A8' : '#64748B',
                  fontWeight: isActive ? '800' : '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.18s ease',
                  textAlign: 'left',
                }}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? '#7C3AED' : 'inherit' }}>
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
                      backgroundColor: '#7C3AED',
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

        {/* Sidebar Footer: Admin Profile */}
        <div style={{ borderTop: '1px solid #F3E8FF', padding: '12px' }}>
          {!sidebarCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#E9D5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B21A8', fontWeight: '800', fontSize: '13px' }}>
                  SA
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>Super Admin</div>
                  <div style={{ fontSize: '11px', color: '#7C3AED', fontWeight: '700' }}>Platform Ops Root</div>
                </div>
              </div>
              <a href="/login" title="Sign out" style={{ color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
                <LogOut size={16} />
              </a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#E9D5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B21A8', fontWeight: '800', fontSize: '13px' }} title="Super Admin">
                SA
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
              <span style={{ color: '#64748B', fontWeight: '600' }}>Platform Administration</span>
              <span style={{ color: '#CBD5E1' }}>/</span>
              <span style={{ color: '#0F172A', fontWeight: '800' }}>
                {navItems.find(i => i.id === activeTab)?.label}
              </span>
            </div>
          </div>

          {/* Right: Actions & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#F0FDF4', padding: '5px 12px', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#15803D' }}>All Systems Healthy</span>
            </div>

            <a
              href="/admin/users/create"
              style={{
                backgroundColor: '#7C3AED',
                color: '#FFFFFF',
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '800',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)'
              }}
            >
              <Plus size={15} />
              <span>Provision Account</span>
            </a>

            <a href="/" style={{ fontSize: '13px', color: '#7C3AED', fontWeight: '700', textDecoration: 'none' }}>
              ← Portals
            </a>
          </div>
        </header>

        {/* Workspace Body */}
        <main style={{ padding: '28px', maxWidth: '1360px', width: '100%', boxSizing: 'border-box', margin: '0 auto' }}>
          
          {/* ========================================================================= */}
          {/* TAB 1: SYSTEM OVERVIEW                                                    */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* METRICS SUMMARY GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>TOTAL PATIENTS</span>
                  <h2 style={{ margin: '8px 0 4px 0', fontSize: '28px', color: '#16A34A', fontWeight: '900' }}>3 Active</h2>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Registered profiles</span>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>TOTAL CAREGIVERS</span>
                  <h2 style={{ margin: '8px 0 4px 0', fontSize: '28px', color: '#2563EB', fontWeight: '900' }}>4 Users</h2>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Mobile & Web sessions</span>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>ACTIVE CONNECTIONS</span>
                  <h2 style={{ margin: '8px 0 4px 0', fontSize: '28px', color: '#7C3AED', fontWeight: '900' }}>3 Pairings</h2>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>QR / Code Verified</span>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>GAME SESSIONS</span>
                  <h2 style={{ margin: '8px 0 4px 0', fontSize: '28px', color: '#D97706', fontWeight: '900' }}>3,160 Total</h2>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Match Pair / Triplet</span>
                </div>
              </div>

              {/* SYSTEM STATUS & AGGREGATED USAGE */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1.1fr', gap: '24px' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>Activity Session Usage (Aggregated)</h3>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>Last 30 Days</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { name: 'Match the Pair Challenge', count: '1,420 sessions', pct: '45%', color: '#16A34A' },
                      { name: 'Match the Triplet Challenge', count: '980 sessions', pct: '31%', color: '#2563EB' },
                      { name: 'Visual Picture Memory', count: '760 sessions', pct: '24%', color: '#7C3AED' },
                    ].map((g) => (
                      <div key={g.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                        <div>
                          <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '14px' }}>{g.name}</div>
                          <div style={{ width: '220px', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                            <div style={{ width: g.pct, height: '100%', backgroundColor: g.color }} />
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '15px', fontWeight: '900', color: g.color }}>{g.count}</span>
                          <span style={{ fontSize: '12px', color: '#64748B', marginLeft: '8px', fontWeight: '700' }}>({g.pct})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ backgroundColor: '#F3E8FF', padding: '24px', borderRadius: '20px', border: '1px solid #D8B4FE' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <ShieldCheck size={20} color="#6B21A8" />
                    <h3 style={{ margin: 0, color: '#6B21A8', fontSize: '17px', fontWeight: '900' }}>Platform Operational Status</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#581C87' }}>
                    <div style={{ backgroundColor: '#FFFFFF', padding: '10px 14px', borderRadius: '10px' }}>
                      • <strong>FastAPI Backend</strong>: Operational (Port 8000)
                    </div>
                    <div style={{ backgroundColor: '#FFFFFF', padding: '10px 14px', borderRadius: '10px' }}>
                      • <strong>Neon PostgreSQL</strong>: Connected & Healthy
                    </div>
                    <div style={{ backgroundColor: '#FFFFFF', padding: '10px 14px', borderRadius: '10px' }}>
                      • <strong>Active Web Sessions</strong>: 42 Connected
                    </div>
                    <div style={{ backgroundColor: '#FFFFFF', padding: '10px 14px', borderRadius: '10px' }}>
                      • <strong>RBAC & IDOR Enforcement</strong>: Active
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PATIENTS DIRECTORY                                                 */}
          {/* ========================================================================= */}
          {activeTab === 'patients' && (
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>Registered Patient Profiles</h3>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Multi-lingual profile registration & platform identifier records</span>
                </div>
              </div>

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
                      <td style={{ padding: '14px 12px', fontWeight: '800', color: '#7C3AED' }}>{p.publicId}</td>
                      <td style={{ padding: '14px 12px', fontWeight: '800', color: '#0F172A' }}>{p.name}</td>
                      <td style={{ padding: '14px 12px', color: '#64748B' }}>{p.age}</td>
                      <td style={{ padding: '14px 12px', color: '#0F172A', fontWeight: '600' }}>{p.lang}</td>
                      <td style={{ padding: '14px 12px', color: '#64748B' }}>{p.created}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CAREGIVERS DIRECTORY                                               */}
          {/* ========================================================================= */}
          {activeTab === 'caregivers' && (
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>Registered Caregiver Accounts</h3>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Family and primary caregiver portals connected to patients</span>
                </div>
              </div>

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
                      <td style={{ padding: '14px 12px', fontWeight: '800', color: '#0F172A' }}>{cg.name}</td>
                      <td style={{ padding: '14px 12px', color: '#64748B' }}>{cg.email}</td>
                      <td style={{ padding: '14px 12px', fontWeight: '800', color: '#16A34A' }}>{cg.patientsCount} Patients</td>
                      <td style={{ padding: '14px 12px', color: '#0F172A' }}>{cg.relType}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
                          {cg.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: DOCTORS & CLINICIANS                                               */}
          {/* ========================================================================= */}
          {activeTab === 'doctors' && (
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>Authorized Clinicians</h3>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Medical practitioners with clinical access permissions</span>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px' }}>
                    <th style={{ padding: '12px' }}>DOCTOR NAME</th>
                    <th style={{ padding: '12px' }}>EMAIL</th>
                    <th style={{ padding: '12px' }}>SPECIALTY</th>
                    <th style={{ padding: '12px' }}>HOSPITAL / CLINIC</th>
                    <th style={{ padding: '12px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((d) => (
                    <tr key={d.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 12px', fontWeight: '800', color: '#0F172A' }}>{d.name}</td>
                      <td style={{ padding: '14px 12px', color: '#64748B' }}>{d.email}</td>
                      <td style={{ padding: '14px 12px', fontWeight: '800', color: '#2563EB' }}>{d.specialty}</td>
                      <td style={{ padding: '14px 12px', color: '#475569' }}>{d.hospital}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: CONNECTION AUDITS                                                  */}
          {/* ========================================================================= */}
          {activeTab === 'connections' && (
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>Cryptographically Verified Pairings</h3>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>QR and One-Time Pairing Code authentication records</span>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px' }}>
                    <th style={{ padding: '12px' }}>RELATIONSHIP ID</th>
                    <th style={{ padding: '12px' }}>CAREGIVER</th>
                    <th style={{ padding: '12px' }}>PATIENT</th>
                    <th style={{ padding: '12px' }}>VERIFIED CODE</th>
                    <th style={{ padding: '12px' }}>STATUS</th>
                    <th style={{ padding: '12px' }}>PAIRED AT</th>
                  </tr>
                </thead>
                <tbody>
                  {connections.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 12px', fontWeight: '800', color: '#7C3AED' }}>{c.id}</td>
                      <td style={{ padding: '14px 12px', fontWeight: '800', color: '#0F172A' }}>{c.caregiver}</td>
                      <td style={{ padding: '14px 12px', color: '#0F172A' }}>{c.patient}</td>
                      <td style={{ padding: '14px 12px', fontWeight: '800', color: '#16A34A' }}>{c.code}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', color: '#64748B' }}>{c.pairedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: SECURITY AUDIT LOGS                                                */}
          {/* ========================================================================= */}
          {activeTab === 'audit' && (
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>Security & Access Audit Trail</h3>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Immutable security event records (JWT validation, RBAC checks, data access)</span>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px' }}>
                    <th style={{ padding: '12px' }}>LOG ID</th>
                    <th style={{ padding: '12px' }}>ACTOR</th>
                    <th style={{ padding: '12px' }}>ACTION</th>
                    <th style={{ padding: '12px' }}>TARGET</th>
                    <th style={{ padding: '12px' }}>IP ADDRESS</th>
                    <th style={{ padding: '12px' }}>STATUS</th>
                    <th style={{ padding: '12px' }}>TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 12px', fontWeight: '800', color: '#7C3AED' }}>{log.id}</td>
                      <td style={{ padding: '14px 12px', fontWeight: '700', color: '#0F172A' }}>{log.actor}</td>
                      <td style={{ padding: '14px 12px', color: '#2563EB', fontWeight: '800', fontSize: '12px' }}>{log.action}</td>
                      <td style={{ padding: '14px 12px', color: '#64748B' }}>{log.target}</td>
                      <td style={{ padding: '14px 12px', color: '#64748B', fontSize: '13px' }}>{log.ip}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>
                          {log.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', color: '#94A3B8', fontSize: '12px' }}>{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: SYSTEM HEALTH & DB                                                 */}
          {/* ========================================================================= */}
          {activeTab === 'system' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>
                  Infrastructure & Microservices Health
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  {[
                    { name: 'FastAPI REST Server', port: '8000', status: 'Online', uptime: '99.98%', latency: '24ms', color: '#16A34A' },
                    { name: 'Neon Cloud PostgreSQL', port: '5432', status: 'Healthy', uptime: '100%', latency: '42ms', color: '#16A34A' },
                    { name: 'JWT & OAuth Engine', port: 'Internal', status: 'Enforcing', uptime: '99.99%', latency: '2ms', color: '#2563EB' },
                    { name: 'Push & Alerts Worker', port: 'Daemon', status: 'Active', uptime: '99.94%', latency: '12ms', color: '#7C3AED' },
                  ].map((srv, idx) => (
                    <div key={idx} style={{ padding: '18px', borderRadius: '14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '800', color: '#0F172A', fontSize: '14px' }}>{srv.name}</span>
                        <span style={{ backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '8px' }}>
                          {srv.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>Port / Bind: <strong>{srv.port}</strong></div>
                        <div>Uptime: <strong>{srv.uptime}</strong></div>
                        <div>P95 Latency: <strong style={{ color: srv.color }}>{srv.latency}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
