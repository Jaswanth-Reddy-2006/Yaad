'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  CalendarCheck,
  FileText,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  CheckCircle2,
  Clock,
  Activity,
  Brain,
  Heart,
  Shield,
  Download,
  Sparkles,
  AlertTriangle,
  LogOut,
  User,
  Plus,
  Filter,
  Check,
  ArrowUpRight,
  RefreshCw,
  Phone,
  Stethoscope
} from 'lucide-react';

export default function CaregiverDashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'careplan' | 'reports' | 'alerts'>('overview');
  
  // State from backend or demo fallbacks
  const [patients, setPatients] = useState<any[]>([]);
  const [activePatientId, setActivePatientId] = useState<string>('');
  const [caregiverName, setCaregiverName] = useState<string>('Priya Sharma');
  const [overview, setOverview] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [reminders, setReminders] = useState<any[]>([]);
  const [alertsList, setAlertsList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [reportSuccessMsg, setReportSuccessMsg] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'7' | '30' | '90'>('30');
  const [reminderFilter, setReminderFilter] = useState<'all' | 'Medication' | 'Hydration' | 'Cognitive' | 'Meal'>('all');
  const [showAddReminderModal, setShowAddReminderModal] = useState<boolean>(false);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('14:00');
  const [newReminderCategory, setNewReminderCategory] = useState('Medication');

  // Fallback demo patients if backend is not started or empty
  const defaultPatients = [
    {
      patient_id: 'pat-101',
      name: 'Lakshmi Patel',
      age: 74,
      condition: 'Mild Cognitive Impairment (MCI)',
      activity_status: 'Activity: Stable',
      activities_done: '4/6',
      mood: 'Calm & Alert',
      last_active: '10:45 AM Today',
      avatar_bg: '#DCFCE7',
      primary_doctor: 'Dr. A. K. Sharma (Neurology)',
      emergency_contact: '+91 98765 43210'
    },
    {
      patient_id: 'pat-102',
      name: 'Ramesh Sundaram',
      age: 79,
      condition: 'Early Stage Memory Support',
      activity_status: 'Needs Gentle Reminder',
      activities_done: '2/6',
      mood: 'Cheerful',
      last_active: '9:15 AM Today',
      avatar_bg: '#DBEAFE',
      primary_doctor: 'Dr. V. Rao (Geriatrics)',
      emergency_contact: '+91 98441 22334'
    },
    {
      patient_id: 'pat-103',
      name: 'Anandi Devi',
      age: 82,
      condition: 'Post-Rehab Cognitive Care',
      activity_status: 'Active & Consistent',
      activities_done: '5/6',
      mood: 'Energetic',
      last_active: '11:20 AM Today',
      avatar_bg: '#F3E8FF',
      primary_doctor: 'Dr. S. Menon (Neuro-Psychiatry)',
      emergency_contact: '+91 97112 34567'
    }
  ];

  const defaultReminders = [
    { id: 'rem-1', title: 'Donepezil (5mg) - Morning Dose', scheduled_time: '08:30 AM', category: 'Medication', status: 'COMPLETED' },
    { id: 'rem-2', title: 'Morning Hydration - Warm Herbal Tea', scheduled_time: '09:15 AM', category: 'Hydration', status: 'COMPLETED' },
    { id: 'rem-3', title: 'Cognitive Session: Match Pair Challenge', scheduled_time: '11:00 AM', category: 'Cognitive', status: 'COMPLETED' },
    { id: 'rem-4', title: 'Wholesome Lunch & Multivitamin', scheduled_time: '01:30 PM', category: 'Meal', status: 'COMPLETED' },
    { id: 'rem-5', title: 'Cognitive Session: Visual Recall Game', scheduled_time: '04:30 PM', category: 'Cognitive', status: 'PENDING' },
    { id: 'rem-6', title: 'Evening Hydration & Electrolytes', scheduled_time: '06:00 PM', category: 'Hydration', status: 'PENDING' },
    { id: 'rem-7', title: 'Donepezil (5mg) - Evening Dose', scheduled_time: '08:30 PM', category: 'Medication', status: 'PENDING' }
  ];

  const defaultAlerts = [
    {
      id: 'alt-1',
      patient_id: 'pat-101',
      title: 'Delayed Afternoon Hydration Check',
      message: 'Hydration routine was scheduled for 1:30 PM but unconfirmed by patient device.',
      severity: 'Medium',
      created_at: '1:45 PM Today',
      is_resolved: false
    },
    {
      id: 'alt-2',
      patient_id: 'pat-101',
      title: 'Cognitive Game Pause Detected',
      message: 'Session was paused midway during the Visual Recall test. Patient took a 10 min break.',
      severity: 'Low',
      created_at: '11:15 AM Today',
      is_resolved: false
    }
  ];

  const getAuthHeaders = () => {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // 1. Fetch connected patients list & dashboard caregiver summary
  useEffect(() => {
    async function initDashboard() {
      setLoading(true);
      try {
        const headers = getAuthHeaders();
        const [patientsRes, dashRes] = await Promise.all([
          fetch('http://localhost:8000/api/v1/caregiver/patients', { headers }),
          fetch('http://localhost:8000/api/v1/caregiver/dashboard', { headers })
        ]);

        if (patientsRes.ok) {
          const pData = await patientsRes.json();
          if (Array.isArray(pData) && pData.length > 0) {
            setPatients(pData);
            setActivePatientId(pData[0].patient_id);
          } else {
            setPatients(defaultPatients);
            setActivePatientId(defaultPatients[0].patient_id);
          }
        } else {
          setPatients(defaultPatients);
          setActivePatientId(defaultPatients[0].patient_id);
        }

        if (dashRes.ok) {
          const dData = await dashRes.json();
          if (dData.caregiver_name) setCaregiverName(dData.caregiver_name);
        }
      } catch (err) {
        // Use demo fallbacks if backend is not running
        setPatients(defaultPatients);
        setActivePatientId(defaultPatients[0].patient_id);
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
        const headers = getAuthHeaders();
        const [overRes, anaRes, remRes, altRes] = await Promise.all([
          fetch(`http://localhost:8000/api/v1/caregiver/patients/${activePatientId}/overview`, { headers }),
          fetch(`http://localhost:8000/api/v1/caregiver/patients/${activePatientId}/analytics`, { headers }),
          fetch(`http://localhost:8000/api/v1/caregiver/patients/${activePatientId}/reminders`, { headers }),
          fetch('http://localhost:8000/api/v1/caregiver/alerts', { headers })
        ]);

        if (overRes.ok) setOverview(await overRes.json());
        else setOverview(null);

        if (anaRes.ok) setAnalytics(await anaRes.json());
        else setAnalytics(null);

        if (remRes.ok) {
          const rData = await remRes.json();
          setReminders(rData.length > 0 ? rData : defaultReminders);
        } else {
          setReminders(defaultReminders);
        }

        if (altRes.ok) {
          const allAlerts = await altRes.json();
          const pAlerts = allAlerts.filter((a: any) => a.patient_id === activePatientId);
          setAlertsList(pAlerts.length > 0 ? pAlerts : defaultAlerts.filter(a => a.patient_id === activePatientId || !a.patient_id));
        } else {
          setAlertsList(defaultAlerts);
        }
      } catch (err) {
        setReminders(defaultReminders);
        setAlertsList(defaultAlerts);
      }
    }

    fetchPatientContext();
  }, [activePatientId]);

  const activePatient = patients.find(p => p.patient_id === activePatientId) || defaultPatients[0];
  const activePatientAlerts = alertsList.filter(a => !a.is_resolved);

  const handleResolveAlert = async (id: string) => {
    try {
      const headers = getAuthHeaders();
      await fetch(`http://localhost:8000/api/v1/caregiver/alerts/${id}/resolve`, {
        method: 'POST',
        headers
      });
    } catch (err) {
      console.warn("Backend offline, updating locally:", err);
    }
    setAlertsList(prev => prev.map(a => a.id === id ? { ...a, is_resolved: true } : a));
  };

  const handleToggleReminder = (id: string) => {
    setReminders(prev =>
      prev.map(r => r.id === id ? { ...r, status: r.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' } : r)
    );
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle.trim()) return;
    const newRem = {
      id: `rem-${Date.now()}`,
      title: newReminderTitle,
      scheduled_time: newReminderTime,
      category: newReminderCategory,
      status: 'PENDING'
    };
    setReminders(prev => [...prev, newRem]);
    setNewReminderTitle('');
    setShowAddReminderModal(false);
  };

  const handleExportPDF = (patientName: string) => {
    setReportSuccessMsg(`Official Care Progress & Adherence Report for ${patientName} generated successfully as PDF.`);
    setTimeout(() => setReportSuccessMsg(null), 4500);
  };

  const navItems = [
    { id: 'overview', label: 'Care Overview', icon: LayoutDashboard },
    { id: 'insights', label: 'Insights & Trends', icon: TrendingUp },
    { id: 'careplan', label: 'Care Plan & Reminders', icon: CalendarCheck },
    { id: 'reports', label: 'PDF Reports', icon: FileText },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: activePatientAlerts.length },
  ];

  const filteredReminders = reminders.filter(r => {
    if (reminderFilter === 'all') return true;
    return r.category?.toLowerCase() === reminderFilter.toLowerCase();
  });

  const completedRemindersCount = reminders.filter(r => r.status === 'COMPLETED').length;
  const remindersCompletionPct = reminders.length > 0 ? Math.round((completedRemindersCount / reminders.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAF9', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#0F172A' }}>
      
      {/* ========================================================================= */}
      {/* 1. TOGGLABLE LEFT PANEL (SAAS NAVIGATION SIDEBAR)                         */}
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
        {/* Brand Header & Toggle Button */}
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
                  background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: '800',
                  fontSize: '18px',
                  boxShadow: '0 4px 10px rgba(22, 163, 74, 0.25)',
                  flexShrink: 0
                }}
              >
                M
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
                  MitraCare
                </div>
                <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: '700', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                  Caregiver SaaS
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: '800',
                fontSize: '18px',
                boxShadow: '0 4px 10px rgba(22, 163, 74, 0.25)',
              }}
              title="MitraCare Caregiver SaaS"
            >
              M
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
              backgroundColor: '#F8FAF9',
              color: '#64748B',
              display: sidebarCollapsed ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E2E8F0'; e.currentTarget.style.color = '#0F172A'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F8FAF9'; e.currentTarget.style.color = '#64748B'; }}
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
                backgroundColor: '#F8FAF9',
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

        {/* Navigation Items List */}
        <div style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
          {!sidebarCollapsed && (
            <div style={{ padding: '0 10px 6px 10px', fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Navigation Menu
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
                  border: isActive ? '1px solid rgba(22, 163, 74, 0.25)' : '1px solid transparent',
                  backgroundColor: isActive ? '#F0FDF4' : 'transparent',
                  color: isActive ? '#15803D' : '#64748B',
                  fontWeight: isActive ? '800' : '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.18s ease',
                  textAlign: 'left',
                }}
                title={sidebarCollapsed ? item.label : undefined}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#F8FAF9';
                    e.currentTarget.style.color = '#0F172A';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#64748B';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? '#16A34A' : 'inherit' }}>
                  <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
                </div>

                {!sidebarCollapsed && (
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                )}

                {/* Badge for items like Alerts */}
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span
                    style={{
                      position: sidebarCollapsed ? 'absolute' : 'static',
                      top: sidebarCollapsed ? '6px' : 'auto',
                      right: sidebarCollapsed ? '8px' : 'auto',
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '2px 7px',
                      borderRadius: '10px',
                      lineHeight: '14px',
                      boxShadow: '0 2px 5px rgba(220, 38, 38, 0.3)'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer: Active Patient Card & Caregiver Profile */}
        <div style={{ borderTop: '1px solid #F1F5F9', padding: '12px' }}>
          {!sidebarCollapsed ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Mini Patient Profile */}
              <div
                style={{
                  backgroundColor: '#F8FAF9',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: activePatient.avatar_bg || '#DCFCE7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '13px',
                    color: '#0F172A',
                    flexShrink: 0,
                  }}
                >
                  {activePatient.name?.charAt(0) || 'P'}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                    Active Subject
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activePatient.name}
                  </div>
                </div>
              </div>

              {/* Caregiver Account */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={15} color="#475569" />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>{caregiverName}</div>
                    <div style={{ fontSize: '10px', color: '#16A34A', fontWeight: '700' }}>Primary Caregiver</div>
                  </div>
                </div>
                <a href="/login" title="Sign out" style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', transition: 'color 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#DC2626'} onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}>
                  <LogOut size={16} />
                </a>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: activePatient.avatar_bg || '#DCFCE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '14px',
                  color: '#0F172A',
                }}
                title={`Active: ${activePatient.name}`}
              >
                {activePatient.name?.charAt(0) || 'P'}
              </div>
              <a href="/login" title="Sign Out" style={{ color: '#94A3B8', padding: '4px' }}>
                <LogOut size={16} />
              </a>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN APP SHELL (TOP HEADER & WORKSPACE)                                */}
      {/* ========================================================================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        
        {/* Top SaaS Header Bar */}
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
            backdropFilter: 'blur(8px)',
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
              <span style={{ color: '#64748B', fontWeight: '600' }}>Caregiver Dashboard</span>
              <span style={{ color: '#CBD5E1' }}>/</span>
              <span style={{ color: '#0F172A', fontWeight: '800' }}>
                {navItems.find(i => i.id === activeTab)?.label}
              </span>
            </div>
          </div>

          {/* Right: Active Patient Global Switcher & Action controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Active Patient Dropdown */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#F8FAF9',
                border: '1.5px solid #E2E8F0',
                borderRadius: '18px',
                padding: '5px 12px',
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16A34A', boxShadow: '0 0 6px #16A34A' }} />
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', letterSpacing: '0.4px' }}>PATIENT:</span>
              <select
                value={activePatientId}
                onChange={(e) => setActivePatientId(e.target.value)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '13px',
                  color: '#0F172A',
                  cursor: 'pointer',
                  outline: 'none',
                  paddingRight: '4px'
                }}
              >
                {patients.map(p => (
                  <option key={p.patient_id} value={p.patient_id}>
                    {p.name} ({p.activity_status || 'Active'})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Alert Bell button */}
            <button
              onClick={() => setActiveTab('alerts')}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                backgroundColor: activePatientAlerts.length > 0 ? '#FEF2F2' : '#FFFFFF',
                color: activePatientAlerts.length > 0 ? '#DC2626' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative'
              }}
              title={`${activePatientAlerts.length} unresolved alerts`}
            >
              <Bell size={18} />
              {activePatientAlerts.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#DC2626',
                    border: '2px solid #FFFFFF'
                  }}
                />
              )}
            </button>

            {/* Export Quick Trigger */}
            <button
              onClick={() => handleExportPDF(activePatient.name)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#16A34A',
                color: '#FFFFFF',
                border: 'none',
                padding: '7px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
              }}
            >
              <Download size={14} />
              <span>Export PDF</span>
            </button>
          </div>
        </header>

        {/* Workspace Body */}
        <main style={{ padding: '28px', maxWidth: '1360px', width: '100%', boxSizing: 'border-box', margin: '0 auto' }}>
          
          {/* Feedback Banner */}
          {reportSuccessMsg && (
            <div
              style={{
                padding: '14px 20px',
                borderRadius: '14px',
                backgroundColor: '#DCFCE7',
                border: '1.5px solid #86EFAC',
                color: '#15803D',
                fontWeight: '700',
                fontSize: '14px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 style={{ width: '20px', height: '20px', flexShrink: 0, color: '#16A34A' }} />
                <span>{reportSuccessMsg}</span>
              </div>
              <span style={{ fontSize: '12px', color: '#166534', fontWeight: '800' }}>Downloaded</span>
            </div>
          )}

          {/* ACTIVE PATIENT HERO CONTEXT CARD */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              padding: '20px 24px',
              marginBottom: '24px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  backgroundColor: activePatient.avatar_bg || '#DCFCE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '900',
                  color: '#0F172A',
                  fontSize: '22px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  flexShrink: 0
                }}
              >
                {activePatient.name ? activePatient.name.charAt(0) : 'P'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#0F172A' }}>
                    {activePatient.name}
                  </h2>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      border: '1px solid #BFDBFE'
                    }}
                  >
                    Age: {activePatient.age || 74}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      backgroundColor: '#F0FDF4',
                      color: '#15803D',
                      border: '1px solid #BBF7D0'
                    }}
                  >
                    {activePatient.condition || 'Cognitive Companion'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '18px', marginTop: '6px', fontSize: '13px', color: '#64748B' }}>
                  <span>Status: <strong style={{ color: '#16A34A' }}>{activePatient.activity_status || 'Activity: Stable'}</strong></span>
                  <span>•</span>
                  <span>Last Active: <strong style={{ color: '#0F172A' }}>{overview?.today_status?.last_active || activePatient.last_active || 'Today'}</strong></span>
                  <span>•</span>
                  <span>Doctor: <strong>{activePatient.primary_doctor || 'Dr. A. K. Sharma'}</strong></span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right', paddingRight: '12px', borderRight: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>Care Circle</div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>Family + Doctor Active</div>
              </div>
              <div style={{ backgroundColor: '#F8FAF9', padding: '8px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={13} color="#16A34A" />
                <span>{activePatient.emergency_contact || '+91 98765 43210'}</span>
              </div>
            </div>
          </div>

          {/* SAAS METRICS STRIP (4 KPI CARDS) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            {/* 1. Games Completed */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', letterSpacing: '0.4px', textTransform: 'uppercase' }}>GAMES COMPLETED</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
                  <Brain size={18} />
                </div>
              </div>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '28px', color: '#16A34A', fontWeight: '900' }}>
                {overview?.today_status?.games_played || activePatient.activities_done || '4/6'}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B' }}>
                <span style={{ color: '#16A34A', fontWeight: '800' }}>+33%</span>
                <span>vs daily baseline</span>
              </div>
            </div>

            {/* 2. Reminders Completed */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', letterSpacing: '0.4px', textTransform: 'uppercase' }}>CARE PLAN ROUTINE</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <Clock size={18} />
                </div>
              </div>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '28px', color: '#2563EB', fontWeight: '900' }}>
                {completedRemindersCount} / {reminders.length || 1}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B' }}>
                <span style={{ color: '#2563EB', fontWeight: '800' }}>{remindersCompletionPct}%</span>
                <span>completed today</span>
              </div>
            </div>

            {/* 3. Mood Check-in */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', letterSpacing: '0.4px', textTransform: 'uppercase' }}>MOOD & STATE</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                  <Heart size={18} />
                </div>
              </div>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '26px', color: '#D97706', fontWeight: '900' }}>
                {overview?.today_status?.mood || activePatient.mood || 'Calm & Alert'}
              </h2>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Self-reported via morning check-in
              </div>
            </div>

            {/* 4. Active Alerts */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '18px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', letterSpacing: '0.4px', textTransform: 'uppercase' }}>ATTENTION STATUS</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: activePatientAlerts.length > 0 ? '#FEF2F2' : '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: activePatientAlerts.length > 0 ? '#DC2626' : '#16A34A' }}>
                  {activePatientAlerts.length > 0 ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                </div>
              </div>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '28px', color: activePatientAlerts.length > 0 ? '#DC2626' : '#16A34A', fontWeight: '900' }}>
                {activePatientAlerts.length} {activePatientAlerts.length > 0 ? 'Pending' : 'All Clear'}
              </h2>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                {activePatientAlerts.length > 0 ? 'Requires caregiver review' : 'No urgent alerts today'}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: CARE OVERVIEW                                                      */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1.1fr', gap: '24px' }}>
              
              {/* Left Column: Routine Schedule & Cognitive Baseline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Today's Care Plan & Reminders */}
                <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#0F172A', fontSize: '18px', fontWeight: '900' }}>
                        Today's Care Plan & Reminders
                      </h3>
                      <span style={{ fontSize: '13px', color: '#64748B' }}>
                        Scheduled adherence for {activePatient.name}
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab('careplan')}
                      style={{ fontSize: '13px', fontWeight: '800', color: '#16A34A', backgroundColor: '#F0FDF4', padding: '6px 14px', borderRadius: '12px', border: '1px solid #BBF7D0', cursor: 'pointer' }}
                    >
                      Manage All →
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {reminders.slice(0, 5).map((r) => {
                      const isDone = r.status === 'COMPLETED';
                      return (
                        <div
                          key={r.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '14px 16px',
                            borderRadius: '14px',
                            border: '1px solid',
                            borderColor: isDone ? '#E2E8F0' : '#CBD5E1',
                            backgroundColor: isDone ? '#F8FAF9' : '#FFFFFF',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <button
                              onClick={() => handleToggleReminder(r.id)}
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '6px',
                                border: isDone ? 'none' : '2px solid #CBD5E1',
                                backgroundColor: isDone ? '#16A34A' : '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                padding: 0
                              }}
                              title={isDone ? 'Mark as pending' : 'Mark as completed'}
                            >
                              {isDone && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                            </button>
                            <div>
                              <div style={{ fontWeight: '800', color: isDone ? '#475569' : '#0F172A', fontSize: '14px', textDecoration: isDone ? 'line-through' : 'none' }}>
                                {r.title}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                                {r.scheduled_time || '9:00 AM'} • Category: <strong style={{ color: '#334155' }}>{r.category}</strong>
                              </div>
                            </div>
                          </div>

                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: '800',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              backgroundColor: isDone ? '#DCFCE7' : '#FEF3C7',
                              color: isDone ? '#15803D' : '#D97706',
                              textTransform: 'uppercase'
                            }}
                          >
                            {r.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Non-Diagnostic Cognitive Baseline Comparison Card */}
                <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#0F172A', fontSize: '18px', fontWeight: '900' }}>
                        Non-Diagnostic Cognitive Baseline
                      </h3>
                      <span style={{ fontSize: '13px', color: '#64748B' }}>
                        Routine activity engagement score across key domains
                      </span>
                    </div>
                    <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '5px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
                      Baseline Stable
                    </span>
                  </div>

                  <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                    {analytics?.baseline_comparison || `Current patient engagement (${overview?.today_status?.activity_accuracy || '88% accuracy'}) is consistent with recent 30-day baseline levels without sudden decline.`}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                    <div style={{ backgroundColor: '#F8FAF9', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B' }}>MEMORY DOMAIN</span>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#16A34A' }}>+4%</span>
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: '900', color: '#16A34A', marginTop: '6px' }}>84% Avg</div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                        <div style={{ width: '84%', height: '100%', backgroundColor: '#16A34A', borderRadius: '3px' }} />
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#F8FAF9', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B' }}>ATTENTION DOMAIN</span>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563EB' }}>Steady</span>
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: '900', color: '#2563EB', marginTop: '6px' }}>76% Avg</div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                        <div style={{ width: '76%', height: '100%', backgroundColor: '#2563EB', borderRadius: '3px' }} />
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#F8FAF9', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B' }}>RECALL DOMAIN</span>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#7C3AED' }}>+2%</span>
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: '900', color: '#7C3AED', marginTop: '6px' }}>80% Avg</div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                        <div style={{ width: '80%', height: '100%', backgroundColor: '#7C3AED', borderRadius: '3px' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Attention Feed & Care Suggestions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Attention Required Feed */}
                <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, color: '#991B1B', fontSize: '16px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={18} color="#DC2626" />
                      <span>Attention Required</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('alerts')}
                      style={{ fontSize: '12px', fontWeight: '800', color: '#991B1B', backgroundColor: '#FEF2F2', padding: '4px 10px', borderRadius: '10px', border: '1px solid #FECACA', cursor: 'pointer' }}
                    >
                      View All
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {activePatientAlerts.length > 0 ? (
                      activePatientAlerts.slice(0, 3).map((a) => (
                        <div key={a.id} style={{ padding: '14px', borderRadius: '14px', backgroundColor: '#FEF2F2', border: '1.5px solid #FCA5A5' }}>
                          <div style={{ fontWeight: '800', color: '#991B1B', fontSize: '13px' }}>{a.title}</div>
                          <div style={{ fontSize: '12px', color: '#7F1D1D', marginTop: '4px', lineHeight: '1.4' }}>
                            {a.message}
                          </div>
                          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: '#991B1B', fontWeight: '700' }}>{a.created_at}</span>
                            <button
                              onClick={() => handleResolveAlert(a.id)}
                              style={{ backgroundColor: '#FFFFFF', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '10px', padding: '4px 12px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                            >
                              Resolve
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '20px', backgroundColor: '#DCFCE7', borderRadius: '14px', color: '#15803D', fontSize: '13px', fontWeight: '700', textAlign: 'center', border: '1px solid #86EFAC' }}>
                        ✓ All clear! No active alerts for {activePatient.name}.
                      </div>
                    )}
                  </div>
                </div>

                {/* AI & Proactive Care Suggestion */}
                <div style={{ backgroundColor: '#FEF3C7', padding: '22px', borderRadius: '20px', border: '1.5px solid #FDE68A' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Sparkles size={18} color="#D97706" />
                    <div style={{ fontWeight: '900', color: '#92400E', fontSize: '14px' }}>
                      Proactive Care Insight
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#78350F', lineHeight: '1.55' }}>
                    Morning memory exercises for <strong>{activePatient.name}</strong> yield 18% higher cognitive engagement than afternoon sessions.
                  </p>
                  <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '10px', backgroundColor: '#FFFFFF', border: '1px solid #FDE68A', fontSize: '12px', fontWeight: '800', color: '#92400E' }}>
                    💡 Suggested Care Action: Schedule cognitive recall games between 9:30 AM and 11:30 AM.
                  </div>
                </div>

                {/* Quick Clinical Contact Support Card */}
                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                      <Stethoscope size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>Primary Physician</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>{activePatient.primary_doctor || 'Dr. A. K. Sharma'}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.5' }}>
                    Linked via Hospital EHR. Clinical notes and PDF progress summaries sync automatically upon doctor review.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: INSIGHTS & TRENDS                                                  */}
          {/* ========================================================================= */}
          {activeTab === 'insights' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Header with Time Window Selector */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '22px 28px', borderRadius: '20px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '900', color: '#0F172A' }}>
                    Activity & Longitudinal Trends ({activePatient.name})
                  </h2>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>
                    Non-diagnostic engagement analytics across cognitive games and daily routines.
                  </span>
                </div>

                {/* Time Window Buttons */}
                <div style={{ display: 'flex', gap: '8px', backgroundColor: '#F8FAF9', padding: '4px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                  {(['7', '30', '90'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeframe(t)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: timeframe === t ? '#16A34A' : 'transparent',
                        color: timeframe === t ? '#FFFFFF' : '#64748B',
                        fontWeight: '800',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {t} Days Window
                    </button>
                  ))}
                </div>
              </div>

              {/* 30-Day Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>TOTAL COMPLETED GAMES</span>
                  <h2 style={{ margin: '8px 0 4px 0', fontSize: '28px', color: '#16A34A', fontWeight: '900' }}>
                    {timeframe === '7' ? '18 Games' : timeframe === '30' ? '68 Games' : '194 Games'}
                  </h2>
                  <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: '700' }}>↑ 12% vs prior period</span>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>AVG ACCURACY SCORE</span>
                  <h2 style={{ margin: '8px 0 4px 0', fontSize: '28px', color: '#2563EB', fontWeight: '900' }}>
                    {analytics?.avg_accuracy ? `${Math.round(analytics.avg_accuracy)}%` : '83.4%'}
                  </h2>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Match Pair & Triplet tasks</span>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>CONSISTENCY RATE</span>
                  <h2 style={{ margin: '8px 0 4px 0', fontSize: '28px', color: '#7C3AED', fontWeight: '900' }}>
                    91.2%
                  </h2>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Active 27 of 30 days</span>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>CARE ADHERENCE</span>
                  <h2 style={{ margin: '8px 0 4px 0', fontSize: '28px', color: '#D97706', fontWeight: '900' }}>
                    88.5%
                  </h2>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Medication & Hydration</span>
                </div>
              </div>

              {/* Detailed Breakdown Panels */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr', gap: '24px' }}>
                {/* Domain Analysis */}
                <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                  <h3 style={{ margin: '0 0 18px 0', fontSize: '16px', fontWeight: '900', color: '#0F172A' }}>
                    Cognitive Domain Performance
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                      { domain: 'Short-Term Memory', score: 86, color: '#16A34A', status: 'Stable' },
                      { domain: 'Sustained Attention', score: 78, color: '#2563EB', status: 'Normal' },
                      { domain: 'Visual Recall', score: 82, color: '#7C3AED', status: 'Active' },
                      { domain: 'Reaction Processing', score: 91, color: '#D97706', status: 'Optimal' },
                    ].map((item, idx) => (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>{item.domain}</span>
                          <span style={{ fontSize: '13px', fontWeight: '900', color: item.color }}>{item.score}% ({item.status})</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${item.score}%`, height: '100%', backgroundColor: item.color, borderRadius: '4px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Longitudinal Engagement Timeline */}
                <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '900', color: '#0F172A' }}>
                    Weekly Completion Heatmap
                  </h3>
                  <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748B' }}>
                    Daily routine completion frequency over the past 4 weeks for {activePatient.name}.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center' }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                      <div key={day} style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B' }}>{day}</span>
                        {[90, 100, 75, 85].map((pct, row) => (
                          <div
                            key={row}
                            style={{
                              width: '100%',
                              height: '32px',
                              borderRadius: '8px',
                              backgroundColor: idx === 2 && row === 1 ? '#FEF3C7' : '#DCFCE7',
                              border: '1px solid',
                              borderColor: idx === 2 && row === 1 ? '#FDE68A' : '#BBF7D0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: '800',
                              color: idx === 2 && row === 1 ? '#92400E' : '#15803D'
                            }}
                            title={`Week ${row + 1} ${day}: ${pct}% completed`}
                          >
                            ✓
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CARE PLAN & REMINDERS                                              */}
          {/* ========================================================================= */}
          {activeTab === 'careplan' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Header & Controls */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '22px 28px', borderRadius: '20px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '900', color: '#0F172A' }}>
                    Care Plan Schedule & Routines ({activePatient.name})
                  </h2>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>
                    Manage medication doses, hydration intervals, and cognitive exercises.
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setShowAddReminderModal(!showAddReminderModal)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#16A34A',
                      color: '#FFFFFF',
                      padding: '8px 18px',
                      borderRadius: '12px',
                      border: 'none',
                      fontWeight: '800',
                      fontSize: '13px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
                    }}
                  >
                    <Plus size={16} />
                    <span>Add New Reminder</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'All Routines' },
                  { id: 'Medication', label: 'Medications' },
                  { id: 'Hydration', label: 'Hydration & Water' },
                  { id: 'Cognitive', label: 'Cognitive Activities' },
                  { id: 'Meal', label: 'Meals & Nutrition' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setReminderFilter(cat.id as any)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '16px',
                      border: '1.5px solid',
                      borderColor: reminderFilter === cat.id ? '#16A34A' : '#E2E8F0',
                      backgroundColor: reminderFilter === cat.id ? '#F0FDF4' : '#FFFFFF',
                      color: reminderFilter === cat.id ? '#15803D' : '#64748B',
                      fontWeight: '800',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Inline Add Modal / Form */}
              {showAddReminderModal && (
                <form
                  onSubmit={handleAddReminder}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #86EFAC',
                    borderRadius: '18px',
                    padding: '20px 24px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                    alignItems: 'flex-end',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.08)'
                  }}
                >
                  <div style={{ flex: '2', minWidth: '240px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                      REMINDER TITLE
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Afternoon Water Glass / Memory Game"
                      value={newReminderTitle}
                      onChange={(e) => setNewReminderTitle(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                      required
                    />
                  </div>

                  <div style={{ width: '140px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                      SCHEDULED TIME
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 02:30 PM"
                      value={newReminderTime}
                      onChange={(e) => setNewReminderTime(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                      required
                    />
                  </div>

                  <div style={{ width: '160px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                      CATEGORY
                    </label>
                    <select
                      value={newReminderCategory}
                      onChange={(e) => setNewReminderCategory(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', backgroundColor: '#FFFFFF' }}
                    >
                      <option value="Medication">Medication</option>
                      <option value="Hydration">Hydration</option>
                      <option value="Cognitive">Cognitive</option>
                      <option value="Meal">Meal</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="submit"
                      style={{ backgroundColor: '#16A34A', color: '#FFFFFF', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}
                    >
                      Save Reminder
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddReminderModal(false)}
                      style={{ backgroundColor: '#F1F5F9', color: '#64748B', padding: '10px 16px', borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Full Reminders List */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredReminders.length > 0 ? (
                    filteredReminders.map((r) => {
                      const isDone = r.status === 'COMPLETED';
                      return (
                        <div
                          key={r.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px 20px',
                            borderRadius: '16px',
                            border: '1.5px solid',
                            borderColor: isDone ? '#E2E8F0' : '#CBD5E1',
                            backgroundColor: isDone ? '#F8FAF9' : '#FFFFFF',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <button
                              onClick={() => handleToggleReminder(r.id)}
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '8px',
                                border: isDone ? 'none' : '2px solid #CBD5E1',
                                backgroundColor: isDone ? '#16A34A' : '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              {isDone && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
                            </button>
                            <div>
                              <div style={{ fontSize: '15px', fontWeight: '800', color: isDone ? '#64748B' : '#0F172A', textDecoration: isDone ? 'line-through' : 'none' }}>
                                {r.title}
                              </div>
                              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '3px' }}>
                                {r.scheduled_time} • Category: <strong style={{ color: '#0F172A' }}>{r.category}</strong>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button
                              onClick={() => handleToggleReminder(r.id)}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '12px',
                                border: 'none',
                                backgroundColor: isDone ? '#DCFCE7' : '#FEF3C7',
                                color: isDone ? '#15803D' : '#D97706',
                                fontWeight: '800',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              {isDone ? '✓ Completed' : 'Mark Done'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '32px', backgroundColor: '#F8FAF9', borderRadius: '16px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
                      No reminders matching category "{reminderFilter}".
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: PDF REPORTS                                                        */}
          {/* ========================================================================= */}
          {activeTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                <div style={{ maxWidth: '780px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#F0FDF4', color: '#15803D', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', marginBottom: '14px' }}>
                    <FileText size={14} />
                    <span>Official Report Studio</span>
                  </div>
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '900', color: '#0F172A' }}>
                    Export Non-Diagnostic Clinical Progress Report
                  </h2>
                  <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748B', lineHeight: '1.6' }}>
                    Generate structured PDF summaries documenting cognitive game frequency, routine adherence, and self-reported mood for <strong>{activePatient.name}</strong> to share with visiting neurologists and family members.
                  </p>
                </div>

                {/* Report Configuration Options */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                  <div style={{ backgroundColor: '#F8FAF9', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>REPORT TYPE</span>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginTop: '6px' }}>Monthly Care Progress & Routine Log</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Includes games, medication compliance, and alerts</div>
                  </div>

                  <div style={{ backgroundColor: '#F8FAF9', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>REPORT PERIOD</span>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginTop: '6px' }}>Last 30 Days (Current Month)</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Covers 28 active game sessions</div>
                  </div>

                  <div style={{ backgroundColor: '#F8FAF9', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>EXPORT FORMAT</span>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginTop: '6px' }}>Print-Ready High-Res PDF</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Hospital-compatible summary sheet</div>
                  </div>
                </div>

                {/* Report Preview Outline */}
                <div style={{ border: '1.5px dashed #CBD5E1', borderRadius: '16px', padding: '24px', backgroundColor: '#FFFFFF', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: '#0F172A' }}>MitraCare Cognitive Activity Report</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>Patient: {activePatient.name} • ID: {activePatient.patient_id}</div>
                    </div>
                    <span style={{ backgroundColor: '#E2E8F0', color: '#475569', fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '10px' }}>
                      PREVIEW
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', fontSize: '13px', color: '#475569', marginBottom: '14px' }}>
                    <div>• 68 Cognitive sessions logged</div>
                    <div>• 88.5% Medication Adherence</div>
                    <div>• 0 Unresolved Critical Alerts</div>
                  </div>

                  <div style={{ fontSize: '11px', color: '#94A3B8', fontStyle: 'italic' }}>
                    * Disclaimer: This report is generated by MitraCare for caregiver companion and routine tracking purposes only and does not constitute a diagnostic medical test.
                  </div>
                </div>

                {/* Download Action */}
                <button
                  onClick={() => handleExportPDF(activePatient.name)}
                  style={{
                    backgroundColor: '#16A34A',
                    color: '#FFFFFF',
                    padding: '14px 28px',
                    borderRadius: '16px',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '15px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)'
                  }}
                >
                  <Download size={18} />
                  <span>Download PDF Report ({activePatient.name})</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: ALERTS & SAFETY                                                    */}
          {/* ========================================================================= */}
          {activeTab === 'alerts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '900', color: '#0F172A' }}>
                      Alerts & Safety Center ({activePatient.name})
                    </h2>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>
                      Real-time anomaly monitoring for medication delays, routine lapses, and abnormal session patterns.
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ backgroundColor: activePatientAlerts.length > 0 ? '#FEF2F2' : '#DCFCE7', color: activePatientAlerts.length > 0 ? '#DC2626' : '#15803D', padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
                      {activePatientAlerts.length} Unresolved Alerts
                    </span>
                  </div>
                </div>

                {/* Alerts List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {alertsList.length > 0 ? (
                    alertsList.map((a) => (
                      <div
                        key={a.id}
                        style={{
                          padding: '18px 20px',
                          borderRadius: '16px',
                          backgroundColor: a.is_resolved ? '#F8FAF9' : '#FEF2F2',
                          border: '1.5px solid',
                          borderColor: a.is_resolved ? '#E2E8F0' : '#FCA5A5',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '16px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              backgroundColor: a.is_resolved ? '#E2E8F0' : '#FEE2E2',
                              color: a.is_resolved ? '#64748B' : '#DC2626',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              marginTop: '2px'
                            }}
                          >
                            {a.is_resolved ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: '900', color: a.is_resolved ? '#475569' : '#991B1B', fontSize: '15px' }}>
                                {a.title}
                              </span>
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  padding: '2px 8px',
                                  borderRadius: '8px',
                                  backgroundColor: a.severity === 'High' ? '#DC2626' : a.severity === 'Medium' ? '#D97706' : '#2563EB',
                                  color: '#FFFFFF'
                                }}
                              >
                                {a.severity || 'Notice'}
                              </span>
                            </div>
                            <div style={{ fontSize: '13px', color: a.is_resolved ? '#64748B' : '#7F1D1D', marginTop: '4px', lineHeight: '1.45' }}>
                              {a.message}
                            </div>
                            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px' }}>
                              Logged: {a.created_at || 'Today'}
                            </div>
                          </div>
                        </div>

                        <div>
                          {!a.is_resolved ? (
                            <button
                              onClick={() => handleResolveAlert(a.id)}
                              style={{
                                backgroundColor: '#FFFFFF',
                                border: '1.5px solid #FCA5A5',
                                color: '#991B1B',
                                borderRadius: '12px',
                                padding: '8px 18px',
                                fontSize: '12px',
                                fontWeight: '800',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 2px 5px rgba(220, 38, 38, 0.08)'
                              }}
                            >
                              Resolve Alert
                            </button>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={14} />
                              Resolved
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '32px', backgroundColor: '#DCFCE7', borderRadius: '16px', color: '#15803D', fontSize: '14px', fontWeight: '800', textAlign: 'center' }}>
                      All alerts have been resolved. System running normally.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
