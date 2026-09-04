'use client';

import React from 'react';
import {
  ArrowRight,
  Calendar,
  Heart,
  Bell,
  Zap,
  Users,
  HeartHandshake,
  Stethoscope,
  Brain,
  Activity,
  Smartphone,
  ShieldCheck,
  Laptop,
  WifiOff,
  Clock,
  RefreshCw,
  Database,
  Lock,
  Shield,
  BarChart3,
  FileText,
  Mail,
  Phone,
  User,
  CheckCircle2
} from 'lucide-react';

export default function PixelPerfectLandingPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', color: '#0F172A', fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden' }}>
      {/* 1. Header Navigation */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #E2E8F0', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 'bold', fontSize: '20px' }}>
              M
            </div>
            <span style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>MitraCare</span>
          </div>

          <nav style={{ display: 'flex', gap: '28px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
            <a href="#about" style={{ textDecoration: 'none', color: 'inherit' }}>About</a>
            <a href="#how-it-works" style={{ textDecoration: 'none', color: 'inherit' }}>How It Works</a>
            <a href="#patients" style={{ textDecoration: 'none', color: 'inherit' }}>For Patients</a>
            <a href="#caregivers" style={{ textDecoration: 'none', color: 'inherit' }}>For Caregivers</a>
            <a href="#healthcare" style={{ textDecoration: 'none', color: 'inherit' }}>For Healthcare</a>
            <a href="#security" style={{ textDecoration: 'none', color: 'inherit' }}>Trust & Security</a>
          </nav>

          <a
            href="/login"
            style={{
              backgroundColor: '#16A34A',
              color: '#FFFFFF',
              padding: '10px 24px',
              borderRadius: '24px',
              fontWeight: '700',
              fontSize: '14px',
              textDecoration: 'none',
              boxShadow: '0 3px 10px rgba(22, 163, 74, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Sign In</span>
            <ArrowRight style={{ width: '16px', height: '16px' }} />
          </a>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section style={{ backgroundColor: '#F8FAF8', padding: '70px 32px 90px 32px', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          {/* Left Hero Text */}
          <div>
            <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px', display: 'inline-block', marginBottom: '20px' }}>
              Cognitive Wellness & Care Platform
            </span>
            <h1 style={{ fontSize: '50px', fontWeight: '900', color: '#0F172A', margin: '0 0 20px 0', lineHeight: '1.12', letterSpacing: '-1.2px' }}>
              Supporting Memory.<br />Supporting Daily Life.<br />
              <span style={{ color: '#16A34A' }}>Connecting People Who Care.</span>
            </h1>
            <p style={{ fontSize: '17px', color: '#64748B', lineHeight: '1.65', marginBottom: '36px', maxWidth: '540px' }}>
              MitraCare empowers elderly individuals with daily cognitive activities, voice-assisted routines, and multilingual support while giving caregivers and healthcare professionals clear, non-diagnostic visibility.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <a
                href="/login"
                style={{
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF',
                  padding: '16px 32px',
                  borderRadius: '30px',
                  fontWeight: '800',
                  fontSize: '15px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>Explore MitraCare Platform</span>
                <ArrowRight style={{ width: '18px', height: '18px' }} />
              </a>
              <a
                href="#how-it-works"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  padding: '16px 28px',
                  borderRadius: '30px',
                  fontWeight: '700',
                  fontSize: '15px',
                  textDecoration: 'none',
                  border: '1.5px solid #CBD5E1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>How It Works</span>
              </a>
            </div>
          </div>

          {/* Right Hero Interactive Graphic (Matching image media_1788458854745.png) */}
          <div style={{ position: 'relative', minHeight: '440px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Background Soft Green Circle Backdrop */}
            <div style={{ position: 'absolute', width: '380px', height: '380px', borderRadius: '50%', backgroundColor: '#DCFCE7', opacity: 0.8, zIndex: 0 }} />

            {/* Central Elderly Avatar / User Icon Container */}
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{ width: '260px', height: '260px', borderRadius: '50%', overflow: 'hidden', border: '6px solid #FFFFFF', boxShadow: '0 12px 32px rgba(0,0,0,0.1)', margin: '0 auto', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User style={{ width: '120px', height: '120px', color: '#059669' }} />
              </div>
            </div>

            {/* Floating Widget 1: Top Left - Daily Activities */}
            <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2, backgroundColor: '#FFFFFF', padding: '14px 18px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar style={{ width: '20px', height: '20px' }} />
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', display: 'block' }}>DAILY ACTIVITIES</span>
                <strong style={{ fontSize: '14px', color: '#0F172A' }}>Completed 8 / 10</strong>
              </div>
            </div>

            {/* Floating Widget 2: Top Right - Caregiver Profile */}
            <div style={{ position: 'absolute', top: '20px', right: '0px', zIndex: 2, backgroundColor: '#FFFFFF', padding: '12px 18px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#DBEAFE', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart style={{ width: '18px', height: '18px' }} />
              </div>
              <div>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', display: 'block' }}>CAREGIVER</span>
                <strong style={{ fontSize: '13px', color: '#0F172A' }}>Aarav Sharma</strong>
              </div>
            </div>

            {/* Floating Widget 3: Bottom Right - Today's Reminder */}
            <div style={{ position: 'absolute', bottom: '30px', right: '10px', zIndex: 2, backgroundColor: '#FFFFFF', padding: '14px 18px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell style={{ width: '20px', height: '20px' }} />
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', display: 'block' }}>TODAY'S REMINDER</span>
                <strong style={{ fontSize: '13px', color: '#0F172A' }}>Take Medicine 10:30 AM</strong>
              </div>
            </div>

            {/* Floating Widget 4: Bottom Left - Streak */}
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 2, backgroundColor: '#FFFFFF', padding: '12px 18px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap style={{ width: '18px', height: '18px' }} />
              </div>
              <div>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', display: 'block' }}>STREAK</span>
                <strong style={{ fontSize: '14px', color: '#16A34A' }}>12 Days</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Our Mission / Bridging Cognitive Care Gap Section */}
      <section id="about" style={{ padding: '90px 32px', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px' }}>
            OUR MISSION
          </span>
          <h2 style={{ fontSize: '38px', fontWeight: '900', color: '#0F172A', margin: '14px 0 10px 0', letterSpacing: '-0.5px' }}>
            Bridging the Cognitive Care Gap
          </h2>
          <p style={{ fontSize: '16px', color: '#64748B', maxWidth: '650px', margin: '0 auto' }}>
            A unified approach addressing the distinct challenges faced by patients, caregivers, and clinicians.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
          {/* Card 1: Elderly & Patients */}
          <div style={{ backgroundColor: '#F8FAF8', padding: '36px 32px', borderRadius: '24px', border: '1.5px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Users style={{ width: '26px', height: '26px' }} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 12px 0' }}>Elderly & Patients</h3>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.65', margin: 0 }}>
                Support with daily memory recall, confusion, and medication routines. MitraCare offers accessible games, voice check-ins, and local language interaction.
              </p>
            </div>
            <div style={{ marginTop: '28px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowRight style={{ width: '18px', height: '18px' }} />
              </div>
            </div>
          </div>

          {/* Card 2: Family Caregivers */}
          <div style={{ backgroundColor: '#F8FAF8', padding: '36px 32px', borderRadius: '24px', border: '1.5px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#F3E8FF', color: '#6B21A8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <HeartHandshake style={{ width: '26px', height: '26px' }} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 12px 0' }}>Family Caregivers</h3>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.65', margin: 0 }}>
                Face continuous worry and lack real-time visibility. MitraCare provides immediate status feeds, care plan scheduling, and dedicated alerts across mobile and web using one account.
              </p>
            </div>
            <div style={{ marginTop: '28px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#F3E8FF', color: '#6B21A8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowRight style={{ width: '18px', height: '18px' }} />
              </div>
            </div>
          </div>

          {/* Card 3: Clinicians & Doctors */}
          <div style={{ backgroundColor: '#F8FAF8', padding: '36px 32px', borderRadius: '24px', border: '1.5px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#DBEAFE', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Stethoscope style={{ width: '26px', height: '26px' }} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 12px 0' }}>Clinicians & Doctors</h3>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.65', margin: 0 }}>
                Need objective, longitudinal activity data rather than subjective anecdotal accounts. MitraCare provides evidence-based trend analytics and exportable reports.
              </p>
            </div>
            <div style={{ marginTop: '28px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#DBEAFE', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowRight style={{ width: '18px', height: '18px' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" style={{ backgroundColor: '#F8FAF8', padding: '90px 32px', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px' }}>
            HOW MITRACARE WORKS
          </span>
          <h2 style={{ fontSize: '38px', fontWeight: '900', color: '#0F172A', margin: '14px 0 50px 0', letterSpacing: '-0.5px' }}>
            End-to-end cognitive support and data flow
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
            {[
              { step: '1', icon: User, title: 'Patient', desc: 'Engages with accessible memory games & voice routines' },
              { step: '2', icon: Brain, title: 'Cognitive Activities', desc: 'Completes Match Pair, Topic Talk, Picture Recall & more' },
              { step: '3', icon: Bell, title: 'Daily Reminders', desc: 'Receives voice prompts for medicine & hydration' },
              { step: '4', icon: HeartHandshake, title: 'Caregiver Support', desc: 'Monitors status, care plans & real-time alerts' },
              { step: '5', icon: Activity, title: 'Doctor Analysis', desc: 'Reviews activity trends & performance metrics' },
            ].map((item) => {
              const IconComp = item.icon;
              return (
                <div key={item.step} style={{ backgroundColor: '#FFFFFF', padding: '28px 18px', borderRadius: '20px', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', textAlign: 'center', position: 'relative' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#16A34A', color: '#FFFFFF', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                    {item.step}
                  </div>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#F1F5F9', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                    <IconComp style={{ width: '24px', height: '24px' }} />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: '0 0 6px 0' }}>{item.title}</h3>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: '1.45' }}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. For Patients Section */}
      <section id="patients" style={{ padding: '90px 32px', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          <div>
            <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: '800' }}>
              FOR PATIENTS
            </span>
            <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#0F172A', margin: '14px 0 16px 0', letterSpacing: '-0.5px' }}>
              Accessible & Dignified Everyday Support
            </h2>
            <p style={{ fontSize: '15px', color: '#64748B', lineHeight: '1.65', marginBottom: '24px' }}>
              Designed specifically for elderly users with large touch targets, high-contrast themes, voice prompts, and zero overwhelming menus.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#334155', fontWeight: '600' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px', color: '#16A34A' }} />
                <span>Match Pair, Topic Talk & Remember Pictures games</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px', color: '#16A34A' }} />
                <span>Voice-assisted daily reminders for medication</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px', color: '#16A34A' }} />
                <span>Offline local storage — uninterrupted activities</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px', color: '#16A34A' }} />
                <span>Support for 13 Indian regional languages</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#F8FAF8', padding: '40px', borderRadius: '28px', border: '1.5px solid #E2E8F0', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '800', color: '#16A34A' }}>Patient Mobile App</h3>
            <div style={{ width: '90px', height: '90px', borderRadius: '24px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px auto' }}>
              <Smartphone style={{ width: '48px', height: '48px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <span style={{ padding: '6px 14px', borderRadius: '14px', backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '12px', fontWeight: '800' }}>React Native</span>
              <span style={{ padding: '6px 14px', borderRadius: '14px', backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '12px', fontWeight: '800' }}>Easy To Use</span>
              <span style={{ padding: '6px 14px', borderRadius: '14px', backgroundColor: '#DCFCE7', color: '#15803D', fontSize: '12px', fontWeight: '800' }}>Offline Supported</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. For Caregivers Section */}
      <section id="caregivers" style={{ padding: '0 32px 90px 32px', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#F3E8FF', padding: '48px 40px', borderRadius: '28px', border: '1.5px solid #C084FC', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '20px', backgroundColor: '#FFFFFF', color: '#6B21A8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <ShieldCheck style={{ width: '44px', height: '44px' }} />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: '800', color: '#6B21A8' }}>One Account Parity</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#581C87', fontWeight: '600' }}>
              Same caregiver account on Mobile & Web
            </p>
          </div>

          <div>
            <span style={{ backgroundColor: '#F3E8FF', color: '#6B21A8', padding: '4px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: '800' }}>
              FOR CAREGIVERS
            </span>
            <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#0F172A', margin: '14px 0 16px 0', letterSpacing: '-0.5px' }}>
              Real-Time Visibility & Peace of Mind
            </h2>
            <p style={{ fontSize: '15px', color: '#64748B', lineHeight: '1.65', marginBottom: '24px' }}>
              Caregivers use the same account on mobile and web to track daily status, schedule care plans, and respond to critical alerts.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#334155', fontWeight: '600' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px', color: '#6B21A8' }} />
                <span>Actionable "Who needs attention" daily status feed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px', color: '#6B21A8' }} />
                <span>Dedicated alerts for missed reminders & SOS events</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px', color: '#6B21A8' }} />
                <span>Care plan schedule builder (Morning / Afternoon / Evening)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px', color: '#6B21A8' }} />
                <span>Cryptographic one-click Patient QR pairing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. For Healthcare Section */}
      <section id="healthcare" style={{ padding: '0 32px 90px 32px', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          <div>
            <span style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '4px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: '800' }}>
              FOR HEALTHCARE
            </span>
            <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#0F172A', margin: '14px 0 16px 0', letterSpacing: '-0.5px' }}>
              Evidence-Based Activity Trends
            </h2>
            <p style={{ fontSize: '15px', color: '#64748B', lineHeight: '1.65', marginBottom: '24px' }}>
              Authorized neurologists and clinicians can track 30/90-day engagement metrics and generate objective reports.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#334155', fontWeight: '600' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px', color: '#1E40AF' }} />
                <span>Cognitive domain breakdown (Memory, Attention, Recall)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px', color: '#1E40AF' }} />
                <span>Reminder adherence percentage tracking</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px', color: '#1E40AF' }} />
                <span>Stricter non-diagnostic policy — objective reports only</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#DBEAFE', padding: '40px', borderRadius: '28px', border: '1.5px solid #93C5FD', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '800', color: '#1E40AF' }}>Doctor Analytics Portal</h3>
            <div style={{ width: '90px', height: '90px', borderRadius: '24px', backgroundColor: '#FFFFFF', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px auto' }}>
              <Laptop style={{ width: '48px', height: '48px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <span style={{ padding: '6px 14px', borderRadius: '14px', backgroundColor: '#FFFFFF', color: '#1E40AF', fontSize: '12px', fontWeight: '800' }}>Authorized Access</span>
              <span style={{ padding: '6px 14px', borderRadius: '14px', backgroundColor: '#FFFFFF', color: '#1E40AF', fontSize: '12px', fontWeight: '800' }}>Scope + PDF Reports</span>
              <span style={{ padding: '6px 14px', borderRadius: '14px', backgroundColor: '#FFFFFF', color: '#1E40AF', fontSize: '12px', fontWeight: '800' }}>Trend Analytics</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Low Connectivity Resilience Section */}
      <section style={{ backgroundColor: '#F8FAF8', padding: '90px 32px', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', padding: '4px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px' }}>
            LOW-CONNECTIVITY RESILIENCE
          </span>
          <h2 style={{ fontSize: '38px', fontWeight: '900', color: '#0F172A', margin: '14px 0 10px 0', letterSpacing: '-0.5px' }}>
            Built for Offline-First Environments
          </h2>
          <p style={{ fontSize: '16px', color: '#64748B', maxWidth: '700px', margin: '0 auto 48px auto' }}>
            Patient mobile applications continue operating even in zero-network regions. Data automatically syncs when connectivity returns.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', textAlign: 'left' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1.5px solid #E2E8F0' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <WifiOff style={{ width: '22px', height: '22px' }} />
              </div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#0F172A', fontWeight: '800' }}>Offline Operation</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>Local SQLite database caches games & reminders</p>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1.5px solid #E2E8F0' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Clock style={{ width: '22px', height: '22px' }} />
              </div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#0F172A', fontWeight: '800' }}>Uninterrupted Use</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>Patients play games and complete voice check-ins</p>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1.5px solid #E2E8F0' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <RefreshCw style={{ width: '22px', height: '22px' }} />
              </div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#0F172A', fontWeight: '800' }}>Auto Sync</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>Background synchronization resumes on connection</p>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1.5px solid #E2E8F0' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#F3E8FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Database style={{ width: '22px', height: '22px' }} />
              </div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#0F172A', fontWeight: '800' }}>Backend Storage</h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>FastAPI persists data into Neon PostgreSQL</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Security & Trust Section */}
      <section id="security" style={{ padding: '90px 32px', maxWidth: '1240px', margin: '0 auto', textAlign: 'center' }}>
        <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px' }}>
          SECURITY & TRUST
        </span>
        <h2 style={{ fontSize: '38px', fontWeight: '900', color: '#0F172A', margin: '14px 0 10px 0', letterSpacing: '-0.5px' }}>
          Security & Authorization Controls
        </h2>
        <p style={{ fontSize: '16px', color: '#64748B', maxWidth: '650px', margin: '0 auto 48px auto' }}>
          Strict security boundaries safeguarding patient data and system integrity.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', textAlign: 'left' }}>
          <div style={{ backgroundColor: '#F8FAF8', padding: '24px', borderRadius: '20px', border: '1.5px solid #E2E8F0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Lock style={{ width: '22px', height: '22px' }} />
            </div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#16A34A', fontWeight: '800' }}>Backend RBAC</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>FastAPI verifies roles on every request</p>
          </div>

          <div style={{ backgroundColor: '#F8FAF8', padding: '24px', borderRadius: '20px', border: '1.5px solid #E2E8F0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Shield style={{ width: '22px', height: '22px' }} />
            </div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#2563EB', fontWeight: '800' }}>IDOR Protection</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>Explicit caregiver & doctor relationship verification</p>
          </div>

          <div style={{ backgroundColor: '#F8FAF8', padding: '24px', borderRadius: '20px', border: '1.5px solid #E2E8F0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#F3E8FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <BarChart3 style={{ width: '22px', height: '22px' }} />
            </div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#7C3AED', fontWeight: '800' }}>Non-Diagnostic Policy</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>Objective metrics without medical diagnosis claims</p>
          </div>

          <div style={{ backgroundColor: '#F8FAF8', padding: '24px', borderRadius: '20px', border: '1.5px solid #E2E8F0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <FileText style={{ width: '22px', height: '22px' }} />
            </div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#D97706', fontWeight: '800' }}>Audit Logging</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>Comprehensive audit trail for admin & access actions</p>
          </div>
        </div>
      </section>

      {/* 10. Call to Action Banner */}
      <section style={{ backgroundColor: '#059669', color: '#FFFFFF', padding: '80px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
            <Heart style={{ width: '36px', height: '36px', color: '#FFFFFF' }} />
          </div>
          <h2 style={{ fontSize: '42px', fontWeight: '900', margin: '0 0 16px 0', letterSpacing: '-1px' }}>
            Ready to Explore MitraCare?
          </h2>
          <p style={{ fontSize: '18px', color: '#D1FAE5', marginBottom: '36px', opacity: 0.95 }}>
            Sign in to access your authorized Caregiver, Doctor, or Admin workspace.
          </p>
          <a
            href="/login"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#059669',
              padding: '16px 40px',
              borderRadius: '30px',
              fontWeight: '800',
              fontSize: '16px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
            }}
          >
            <span>Access Platform Sign In</span>
            <ArrowRight style={{ width: '18px', height: '18px' }} />
          </a>
        </div>
      </section>

      {/* 11. Footer */}
      <footer style={{ backgroundColor: '#0F172A', color: '#64748B', padding: '50px 32px', borderTop: '1px solid #1E293B', fontSize: '13px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#16A34A', color: '#FFFFFF', fontWeight: 'bold', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                M
              </div>
              <span style={{ color: '#FFFFFF', fontWeight: '800', fontSize: '20px' }}>MitraCare</span>
            </div>
            <p style={{ margin: '0 0 12px 0', color: '#94A3B8', fontSize: '13px' }}>Cognitive Wellness & Daily Care Companion</p>
            <p style={{ margin: 0, color: '#64748B', fontSize: '12px' }}>SIH PS 26003</p>
          </div>

          <div>
            <h5 style={{ color: '#FFFFFF', margin: '0 0 14px 0', fontSize: '14px', fontWeight: '700' }}>Platform</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="#about" style={{ color: '#94A3B8', textDecoration: 'none' }}>About</a>
              <a href="#how-it-works" style={{ color: '#94A3B8', textDecoration: 'none' }}>How It Works</a>
              <a href="#patients" style={{ color: '#94A3B8', textDecoration: 'none' }}>For Patients</a>
              <a href="#caregivers" style={{ color: '#94A3B8', textDecoration: 'none' }}>For Caregivers</a>
              <a href="#healthcare" style={{ color: '#94A3B8', textDecoration: 'none' }}>For Healthcare</a>
            </div>
          </div>

          <div>
            <h5 style={{ color: '#FFFFFF', margin: '0 0 14px 0', fontSize: '14px', fontWeight: '700' }}>Resources</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="#security" style={{ color: '#94A3B8', textDecoration: 'none' }}>Trust & Security</a>
              <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Terms of Service</a>
            </div>
          </div>

          <div>
            <h5 style={{ color: '#FFFFFF', margin: '0 0 14px 0', fontSize: '14px', fontWeight: '700' }}>Contact</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#94A3B8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail style={{ width: '14px', height: '14px' }} />
                <span>support@mitracare.in</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone style={{ width: '14px', height: '14px' }} />
                <span>+91 (1234) 567890</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1240px', margin: '40px auto 0 auto', paddingTop: '20px', borderTop: '1px solid #1E293B', textAlign: 'center', color: '#64748B', fontSize: '12px' }}>
          © 2026 MitraCare. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
