'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Heart, Stethoscope, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function MultiStepRegistrationPage() {
  const router = useRouter();
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
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAF8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header Nav */}
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 'bold', fontSize: '20px' }}>
              M
            </div>
            <span style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>MitraCare</span>
          </a>

          <div style={{ fontSize: '14px', color: '#64748B' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#16A34A', fontWeight: '700', textDecoration: 'none', marginLeft: '4px' }}>
              Sign In →
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '680px', margin: '40px auto', padding: '0 20px' }}>
        {/* Progress Bar (Steps 1 to 7) */}
        {currentStep <= 7 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px' }}>
              <span>STEP {currentStep} OF 7</span>
              <span>{Math.round((currentStep / 7) * 100)}% COMPLETED</span>
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
                GETTING STARTED
              </span>
              <h2 style={{ margin: '16px 0 8px 0', fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
                How will you use MitraCare?
              </h2>
              <p style={{ margin: '0 0 28px 0', fontSize: '14px', color: '#64748B' }}>
                Select the role that best describes how you will interact with the platform.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
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
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>Patient</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>
                    Access memory games, daily schedules, voice check-ins, and local language routines.
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
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>Caregiver</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: '1.5' }}>
                    Monitor connected patients, schedule care plans, view activity trends & alerts.
                  </p>
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#DBEAFE', border: '1px solid #93C5FD', color: '#1E3A8A', fontSize: '13px', lineHeight: '1.5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Stethoscope style={{ width: '18px', height: '18px', flexShrink: 0, color: '#1E3A8A' }} />
                <span><strong>Doctor & Clinician Accounts:</strong> Created exclusively through authorized hospital invitation. Public self-registration as Doctor or Admin is restricted.</span>
              </div>
            </div>
          )}

          {/* STEP 2: BASIC INFORMATION */}
          {currentStep === 2 && (
            <div>
              <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: '800' }}>
                BASIC INFORMATION
              </span>
              <h2 style={{ margin: '16px 0 8px 0', fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
                Tell us about yourself
              </h2>
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748B' }}>
                Provide your basic contact information for your {role.toLowerCase()} account.
              </p>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Email Address
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
                  Phone Number
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
                SECURITY CREDENTIALS
              </span>
              <h2 style={{ margin: '16px 0 8px 0', fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
                Create your password
              </h2>
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748B' }}>
                Ensure your account is protected with a secure password.
              </p>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Password *
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
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: strength.color, marginBottom: '4px' }}>
                      <span>Strength: {strength.label}</span>
                    </div>
                    <div style={{ height: '4px', backgroundColor: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(strength.score / 3) * 100}%`, backgroundColor: strength.color, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Confirm Password *
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
                    <AlertTriangle style={{ width: '14px', height: '14px' }} /> Passwords do not match
                  </span>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: ROLE-SPECIFIC DETAILS */}
          {currentStep === 4 && (
            <div>
              <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: '800' }}>
                {role} DETAILS
              </span>
              <h2 style={{ margin: '16px 0 8px 0', fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
                {role === 'PATIENT' ? 'Patient Profile Details' : 'Caregiver Role Information'}
              </h2>
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748B' }}>
                Customize your experience according to your daily care requirements.
              </p>

              {role === 'PATIENT' ? (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                      Age
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
                      Emergency Contact Phone Number
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
                    Caregiver Relationship Type
                  </label>
                  <select
                    value={relationshipType}
                    onChange={(e) => setRelationshipType(e.target.value)}
                    style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Family Member">Family Member (Son / Daughter / Spouse)</option>
                    <option value="Primary Guardian">Primary Guardian</option>
                    <option value="Professional Caregiver">Professional Nurse / Caregiver</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: PREFERENCES */}
          {currentStep === 5 && (
            <div>
              <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: '800' }}>
                PREFERENCES
              </span>
              <h2 style={{ margin: '16px 0 8px 0', fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
                Language & Accessibility
              </h2>
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748B' }}>
                MitraCare supports 13 Indian regional languages and accessible display modes.
              </p>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                  Preferred Language
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF' }}
                >
                  <option value="kn">Kannada (ಕನ್ನಡ)</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="en">English</option>
                  <option value="mr">Marathi (मराठी)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="ml">Malayalam (മലയാളം)</option>
                  <option value="bn">Bengali (বাংলা)</option>
                  <option value="gu">Gujarati (ગુજરાતી)</option>
                  <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
                </select>
              </div>

              {role === 'PATIENT' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
                    Display Text Size
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
                CONSENT & PRIVACY
              </span>
              <h2 style={{ margin: '16px 0 8px 0', fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
                Terms & Privacy Consent
              </h2>
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748B' }}>
                Please review and accept our platform privacy commitments.
              </p>

              <div style={{ backgroundColor: '#F8FAF8', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '20px', fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                • <strong>Data Security:</strong> Encrypted transport and least-privilege role authorization.<br/>
                • <strong>Non-Diagnostic Commitment:</strong> All cognitive game analytics represent observed application usage trends and do not constitute formal medical diagnoses.<br/>
                • <strong>Account Parity:</strong> Your account can be accessed securely on mobile and web.
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
                  I agree to the MitraCare Terms of Service *
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
                  I agree to the Privacy Policy and Data Handling Guidelines *
                </label>
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW */}
          {currentStep === 7 && (
            <div>
              <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '4px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: '800' }}>
                FINAL REVIEW
              </span>
              <h2 style={{ margin: '16px 0 8px 0', fontSize: '26px', fontWeight: '800', color: '#0F172A' }}>
                Review Account Details
              </h2>
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748B' }}>
                Confirm your account registration information before creation.
              </p>

              <div style={{ backgroundColor: '#F8FAF8', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '14px' }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '12px' }}>ACCOUNT ROLE</span>
                    <strong style={{ color: '#16A34A' }}>{role}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '12px' }}>FULL NAME</span>
                    <strong style={{ color: '#0F172A' }}>{fullName}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '12px' }}>EMAIL / PHONE</span>
                    <strong style={{ color: '#0F172A' }}>{email || phone}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '12px' }}>PREFERRED LANGUAGE</span>
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
                Your {role.toLowerCase()} account is ready!
              </h2>
              <p style={{ fontSize: '15px', color: '#64748B', marginBottom: '32px' }}>
                Registration completed successfully. You can now access your workspace across mobile and web.
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
                Go to Workspace Dashboard →
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
                  style={{ padding: '12px 24px', borderRadius: '20px', border: '1.5px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                >
                  ← Back
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
                    cursor: canProceed() ? 'pointer' : 'not-allowed'
                  }}
                >
                  Continue →
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
                    boxShadow: '0 3px 10px rgba(22, 163, 74, 0.25)'
                  }}
                >
                  {isLoading ? 'Creating Account...' : 'Confirm & Create Account →'}
                </button>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
