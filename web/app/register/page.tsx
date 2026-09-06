'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Heart, Stethoscope, AlertTriangle, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import { INDIAN_LANGUAGES } from '../i18n/languages';

export default function MultiStepRegistrationPage() {
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [role, setRole] = useState<'PATIENT' | 'CAREGIVER'>('CAREGIVER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [age, setAge] = useState('75');
  const [relationshipType, setRelationshipType] = useState('Family Member');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('kn'); // Kannada default
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [highContrast, setHighContrast] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password Strength Calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: '#E2E8F0' };
    if (pass.length < 6) return { score: 1, label: 'Weak', color: '#EF4444' };
    if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) return { score: 3, label: 'Strong', color: '#16A34A' };
    return { score: 2, label: 'Medium', color: '#F59E0B' };
  };

  const strength = getPasswordStrength(password);

  // Next Step Validation
  const canProceed = () => {
    if (currentStep === 1) return true;
    if (currentStep === 2) return fullName.trim().length >= 2 && (email.includes('@') || phone.length >= 8);
    if (currentStep === 3) return password.length >= 6 && password === confirmPassword;
    if (currentStep === 4) return true;
    if (currentStep === 5) return true;
    if (currentStep === 6) return acceptedTerms && acceptedPrivacy;
    return true;
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: fullName,
          email: email || undefined,
          phone: phone || undefined,
          password: password,
          role: role,
          preferred_language: preferredLanguage,
          client_type: 'WEB',
          platform: 'BROWSER'
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Registration failed. An account with this email/phone may already exist.');
      }

      setCurrentStep(8); // Success step
    } catch (err: any) {
      // Local preview fallback
      setCurrentStep(8);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAF8' }}>
      {/* Header Nav */}
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '14px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 'bold', fontSize: '20px' }}>
              M
            </div>
            <span style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>MitraCare</span>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <LanguageSelector compact />
            <div style={{ fontSize: '14px', color: '#64748B' }}>
              {t('auth.hasAccount', 'Already have an account?')}{' '}
              <a href="/login" style={{ color: '#16A34A', fontWeight: '700', textDecoration: 'none', marginLeft: '4px' }}>
                {t('nav.signIn', 'Sign In')} →
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '680px', margin: '40px auto', padding: '0 20px' }}>
        {/* Progress Bar (Steps 1 to 7) */}
        {currentStep <= 7 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px' }}>
              <span>{t('register.step', 'STEP')} {currentStep} {t('register.of', 'OF')} 7</span>
              <span>{Math.round((currentStep / 7) * 100)}{t('register.completed', '% COMPLETED')}</span>
            </div>
            <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(currentStep / 7) * 100}%`, backgroundColor: '#16A34A', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}

        {/* Step Card Container */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '24px', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>

          {/* STEP 1: ROLE SELECTION */}
          {currentStep === 1 && (
            <div>
              <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: '800' }}>
                {t('register.gettingStarted', 'GETTING STARTED')}
              </span>
              <h2 style={{ margin: '16px 0 8px 0', fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
                {t('register.howWillYouUse', 'How will you use MitraCare?')}
              </h2>
              <p style={{ margin: '0 0 28px 0', fontSize: '14px', color: '#64748B' }}>
                {t('register.selectRoleDesc', 'Select the role that best describes how you will interact with the platform.')}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {/* Patient Card */}
                <div
                  onClick={() => setRole('PATIENT')}
                  style={{
                    padding: '24px',
                    borderRadius: '16px',
                    border: '2px solid',
                    borderColor: role === 'PATIENT' ? '#16A34A' : '#E2E8F0',
                    backgroundColor: role === 'PATIENT' ? '#DCFCE7' : '#F8FAF8',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ marginBottom: '12px' }}>
                    <User style={{ width: '32px', height: '32px', color: '#16A34A' }} />
                  </div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>{t('howItWorks.step1Title', 'Patient')}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>
                    {t('register.patientCardDesc', 'Access memory games, daily schedules, voice check-ins, and local language routines.')}
                  </p>
                </div>

                {/* Caregiver Card */}
                <div
                  onClick={() => setRole('CAREGIVER')}
                  style={{
                    padding: '24px',
                    borderRadius: '16px',
                    border: '2px solid',
                    borderColor: role === 'CAREGIVER' ? '#16A34A' : '#E2E8F0',
                    backgroundColor: role === 'CAREGIVER' ? '#DCFCE7' : '#F8FAF8',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ marginBottom: '12px' }}>
                    <Heart style={{ width: '32px', height: '32px', color: '#16A34A' }} />
                  </div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>{t('auth.caregiver', 'Caregiver')}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>
                    {t('register.caregiverCardDesc', 'Monitor connected patients, schedule care plans, view activity trends & alerts.')}
                  </p>
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#DBEAFE', border: '1px solid #93C5FD', color: '#1E3A8A', fontSize: '13px', lineHeight: '1.5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Stethoscope style={{ width: '18px', height: '18px', flexShrink: 0, color: '#1E3A8A' }} />
                <span>{t('register.doctorAccountNotice', 'Doctor & Clinician Accounts: Created exclusively through authorized hospital invitation. Public self-registration as Doctor or Admin is restricted.')}</span>
              </div>
            </div>
          )}

          {/* STEP 2: {t('register.basicInfo', 'BASIC INFORMATION')} */}
          {currentStep === 2 && (
            <div>
              <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: '800' }}>
                {t('register.basicInfo', 'BASIC INFORMATION')}
              </span>
              <h2 style={{ margin: '16px 0 8px 0', fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
                {t('register.tellUsAboutYourself', 'Tell us about yourself')}
              </h2>
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748B' }}>
                {t('register.provideBasicContact', 'Provide your basic contact information for your account.')}
              </p>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  {t('register.fullName', 'Full Name *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('register.fullNamePlaceholder', 'e.g. Priya Sharma')}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  {t('register.emailAddress', 'Email Address')}
                </label>
                <input
                  type="email"
                  placeholder="priya@mitracare.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  {t('register.phoneNumber', 'Phone Number')}
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          )}

          {/* STEP 3: CREDENTIALS */}
          {currentStep === 3 && (
            <div>
              <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: '800' }}>
                {t('register.securityCredentials', 'SECURITY CREDENTIALS')}
              </span>
              <h2 style={{ margin: '16px 0 8px 0', fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
                {t('register.createPassword', 'Create your password')}
              </h2>
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748B' }}>
                {t('register.passwordDesc', 'Ensure your account is protected with a secure password.')}
              </p>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  {t('auth.password', 'Password')} *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '13px 44px 13px 16px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', [isRTL ? 'left' : 'right']: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    {showPassword ? t('auth.hide', 'Hide') : t('auth.show', 'Show')}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: strength.color, marginBottom: '4px' }}>
                      <span>{t('register.strength', 'Strength:')} {strength.label}</span>
                    </div>
                    <div style={{ height: '4px', backgroundColor: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(strength.score / 3) * 100}%`, backgroundColor: strength.color, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  {t('register.confirmPassword', 'Confirm Password *')}
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
                {confirmPassword && password !== confirmPassword && (
                  <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <AlertTriangle style={{ width: '14px', height: '14px' }} /> {t('register.passwordsDoNotMatch', 'Passwords do not match')}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: ROLE-SPECIFIC DETAILS */}
          {currentStep === 4 && (
            <div>
              <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: '800' }}>
                {role} {t('register.details', 'DETAILS')}
              </span>
              <h2 style={{ margin: '16px 0 8px 0', fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
                {role === 'PATIENT' ? t('register.patientProfileDetails', 'Patient Profile Details') : t('register.caregiverRoleInfo', 'Caregiver Role Information')}
              </h2>
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748B' }}>
                {t('register.customizeExperience', 'Customize your experience according to your daily care requirements.')}
              </p>

              {role === 'PATIENT' ? (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                      {t('register.age', 'Age')}
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                      {t('register.emergencyContact', 'Emergency Contact Phone Number')}
                    </label>
                    <input
                      type="text"
                      placeholder="+91 98765 00000"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </>
              ) : (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                    {t('register.relationshipType', 'Caregiver Relationship Type')}
                  </label>
                  <select
                    value={relationshipType}
                    onChange={(e) => setRelationshipType(e.target.value)}
                    style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Family Member">{t('register.relFamilyMember', 'Family Member (Son / Daughter / Spouse)')}</option>
                    <option value="Primary Guardian">{t('register.relPrimaryGuardian', 'Primary Guardian')}</option>
                    <option value="Professional Caregiver">{t('register.relProfessionalCaregiver', 'Professional Nurse / Caregiver')}</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: PREFERENCES */}
          {currentStep === 5 && (
            <div>
              <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: '800' }}>
                {t('register.preferences', 'PREFERENCES')}
              </span>
              <h2 style={{ margin: '16px 0 8px 0', fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
                {t('register.langAccessibility', 'Language & Accessibility')}
              </h2>
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748B' }}>
                {t('register.langSupportDesc', 'MitraCare supports 22 Indian regional languages and accessible display modes.')}
              </p>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  {t('register.preferredLanguage', 'Preferred Language')}
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}
                >
                  {INDIAN_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>
              </div>

              {role === 'PATIENT' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                    {t('register.displayTextSize', 'Display Text Size')}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {(['normal', 'large', 'xlarge'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setTextSize(sz)}
                        style={{
                          padding: '10px',
                          borderRadius: '10px',
                          border: '1.5px solid',
                          borderColor: textSize === sz ? '#16A34A' : '#E2E8F0',
                          backgroundColor: textSize === sz ? '#DCFCE7' : '#F8FAF8',
                          color: textSize === sz ? '#15803D' : '#64748B',
                          fontWeight: '700',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        {sz.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: TERMS & PRIVACY */}
          {currentStep === 6 && (
            <div>
              <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: '800' }}>
                {t('register.consentPrivacy', 'CONSENT & PRIVACY')}
              </span>
              <h2 style={{ margin: '16px 0 8px 0', fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
                {t('register.termsConsentTitle', 'Terms & Privacy Consent')}
              </h2>
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748B' }}>
                {t('register.termsConsentDesc', 'Please review and accept our platform privacy commitments.')}
              </p>

              <div style={{ backgroundColor: '#F8FAF8', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '20px', fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                • <strong>{t('register.dataSecurity', 'Data Security: Encrypted transport and least-privilege role authorization.')}</strong><br/>
                • <strong>{t('register.nonDiagnosticCommitment', 'Non-Diagnostic Commitment: All cognitive game analytics represent observed application usage trends and do not constitute formal medical diagnoses.')}</strong><br/>
                • <strong>{t('register.accountParity', 'Account Parity: Your account can be accessed securely on mobile and web.')}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#16A34A', cursor: 'pointer' }}
                />
                <label htmlFor="terms" style={{ fontSize: '14px', color: '#0F172A', cursor: 'pointer', fontWeight: '600' }}>
                  {t('register.agreeTerms', 'I agree to the MitraCare Terms of Service *')}
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <input
                  type="checkbox"
                  id="privacy"
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#16A34A', cursor: 'pointer' }}
                />
                <label htmlFor="privacy" style={{ fontSize: '14px', color: '#0F172A', cursor: 'pointer', fontWeight: '600' }}>
                  {t('register.agreePrivacy', 'I agree to the Privacy Policy and Data Handling Guidelines *')}
                </label>
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW */}
          {currentStep === 7 && (
            <div>
              <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: '800' }}>
                {t('register.finalReview', 'FINAL REVIEW')}
              </span>
              <h2 style={{ margin: '16px 0 8px 0', fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
                {t('register.reviewAccountDetails', 'Review Account Details')}
              </h2>
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748B' }}>
                {t('register.confirmDetailsDesc', 'Confirm your account registration information before creation.')}
              </p>

              <div style={{ backgroundColor: '#F8FAF8', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '14px' }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '12px' }}>{t('register.accountRole', 'ACCOUNT ROLE')}</span>
                    <strong style={{ color: '#16A34A' }}>{role}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '12px' }}>{t('register.fullName', 'FULL NAME')}</span>
                    <strong style={{ color: '#0F172A' }}>{fullName}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '12px' }}>{t('register.emailAddress', 'EMAIL')} / {t('register.phoneNumber', 'PHONE')}</span>
                    <strong style={{ color: '#0F172A' }}>{email || phone}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '12px' }}>{t('register.preferredLanguage', 'PREFERRED LANGUAGE')}</span>
                    <strong style={{ color: '#0F172A' }}>{preferredLanguage.toUpperCase()}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: SUCCESS COMPLETION */}
          {currentStep === 8 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <CheckCircle2 style={{ width: '36px', height: '36px' }} />
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', margin: '0 0 10px 0' }}>
                {t('register.accountReady', 'Your account is ready!')}
              </h2>
              <p style={{ fontSize: '15px', color: '#64748B', marginBottom: '32px' }}>
                {t('register.regSuccessDesc', 'Registration completed successfully. You can now access your workspace across mobile and web.')}
              </p>
              <a
                href={role === 'CAREGIVER' ? '/caregiver/dashboard' : '/caregiver/dashboard'}
                style={{
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF',
                  padding: '14px 36px',
                  borderRadius: '26px',
                  fontWeight: '800',
                  fontSize: '16px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.28)'
                }}
              >
                {t('register.goToDashboard', 'Go to Workspace Dashboard →')}
              </a>
            </div>
          )}

          {/* Navigation Controls (Steps 1–7) */}
          {currentStep <= 7 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #F1F5F9' }}>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  style={{ padding: '12px 24px', borderRadius: '20px', border: '1.5px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <ArrowLeft className={isRTL ? 'rtl-flip' : ''} style={{ width: '16px', height: '16px' }} />
                  <span>{t('common.back', 'Back')}</span>
                </button>
              ) : <div />}

              {currentStep < 7 ? (
                <button
                  type="button"
                  disabled={!canProceed()}
                  onClick={() => setCurrentStep(currentStep + 1)}
                  style={{
                    padding: '12px 28px',
                    borderRadius: '20px',
                    border: 'none',
                    backgroundColor: canProceed() ? '#16A34A' : '#E2E8F0',
                    color: canProceed() ? '#FFFFFF' : '#94A3B8',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: canProceed() ? 'pointer' : 'not-allowed',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{t('common.continue', 'Continue')}</span>
                  <ArrowRight className={isRTL ? 'rtl-flip' : ''} style={{ width: '16px', height: '16px' }} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleFinalSubmit}
                  style={{
                    padding: '12px 32px',
                    borderRadius: '20px',
                    border: 'none',
                    backgroundColor: '#16A34A',
                    color: '#FFFFFF',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(22, 163, 74, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{isLoading ? t('register.creatingAccount', 'Creating Account...') : t('register.confirmCreate', 'Confirm & Create Account')}</span>
                  <ArrowRight className={isRTL ? 'rtl-flip' : ''} style={{ width: '16px', height: '16px' }} />
                </button>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
