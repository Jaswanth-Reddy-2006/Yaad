import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Info, Camera, QrCode, CheckCircle2, ChevronDown } from 'lucide-react-native';
import { Typography } from '../../components/common/Typography';
import { CaregiverBottomNavBar } from '../../components/caregiver/CaregiverBottomNavBar';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useCaregiverStore } from '../../store/useCaregiverStore';

export default function ConnectPatientScreen() {
  const router = useRouter();
  const connectPatientStore = useCaregiverStore((state) => state.connectPatient);
  const isLoading = useCaregiverStore((state) => state.isLoading);

  const [patientName, setPatientName] = useState('');
  const [relationship, setRelationship] = useState('Family Member');
  const [notes, setNotes] = useState('');
  const [codeInputValue, setCodeInputValue] = useState('YAAD-789');
  const [isScanning, setIsScanning] = useState(false);

  const handleConnect = async () => {
    if (!codeInputValue.trim()) {
      Alert.alert('Missing Code', 'Please enter a valid 6-character patient code or scan QR.');
      return;
    }

    const cleanCode = codeInputValue.trim().toUpperCase();

    const success = await connectPatientStore(
      cleanCode,
      patientName || 'Connected Patient',
      relationship,
      notes
    );

    if (success) {
      Alert.alert('Connection Established!', 'You have successfully paired with your patient.', [
        { text: 'View Patient List', onPress: () => router.push('/caregiver/patients') },
      ]);
    }
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setCodeInputValue('YAAD-789');
      if (!patientName) setPatientName('Ramesh Kumar');
      setIsScanning(false);
      Alert.alert('QR Code Scanned!', 'Successfully verified patient pairing payload.');
    }, 600);
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Row */}
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backSquareBtn}>
            <ArrowLeft size={22} color="#0F172A" />
          </TouchableOpacity>
          <Typography size="xxl" weight="bold" color="#0F172A" style={{ marginLeft: SPACING.sm }}>
            Connect a New Patient
          </Typography>
        </View>

        {/* Mandatory Info Banner */}
        <View style={styles.mandatoryBanner}>
          <Info size={20} color="#6D28D9" style={{ marginRight: SPACING.sm }} />
          <View style={{ flex: 1 }}>
            <Typography size="xs" weight="bold" color="#6D28D9">
              Secure Relationship Pairing
            </Typography>
            <Typography size="xs" color="#581C87" style={{ marginTop: 2 }}>
              FastAPI verifies patient relationship before access is granted.
            </Typography>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Field 1: Patient Name */}
          <Typography size="sm" weight="bold" color="#0F172A">
            Patient's Name *
          </Typography>
          <TextInput
            placeholder="e.g., Amma or Ramesh Kumar"
            placeholderTextColor="#94A3B8"
            value={patientName}
            onChangeText={setPatientName}
            style={styles.inputField}
          />

          {/* Field 2: Relationship */}
          <Typography size="sm" weight="bold" color="#0F172A" style={{ marginTop: SPACING.md }}>
            Relationship Type *
          </Typography>
          <View style={styles.dropdownField}>
            <Typography size="base" color="#0F172A">
              {relationship}
            </Typography>
            <ChevronDown size={20} color="#94A3B8" />
          </View>

          {/* Field 3: Notes */}
          <Typography size="sm" weight="bold" color="#0F172A" style={{ marginTop: SPACING.md }}>
            Notes (Optional)
          </Typography>
          <TextInput
            placeholder="Any additional care notes..."
            placeholderTextColor="#94A3B8"
            value={notes}
            onChangeText={setNotes}
            style={[styles.inputField, { height: 74, textAlignVertical: 'top', paddingTop: 10 }]}
            multiline
          />
        </View>

        {/* Link with Patient Card */}
        <View style={styles.linkCard}>
          <Typography size="sm" weight="bold" color="#0F172A" align="center">
            Link with Patient
          </Typography>
          <Typography size="xs" color="#64748B" align="center" style={{ marginTop: 2 }}>
            Scan the QR code or enter the pairing code from the patient's mobile app.
          </Typography>

          {/* Camera Scan QR Code Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSimulateScan}
            style={styles.scanQrBtn}
          >
            <Camera size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Typography size="sm" weight="bold" color="#FFFFFF">
              {isScanning ? 'Reading QR Token...' : 'Scan Patient QR Code'}
            </Typography>
          </TouchableOpacity>

          <Typography size="xs" color="#94A3B8" align="center" style={{ marginVertical: SPACING.sm }}>
            OR ENTER PAIRING CODE
          </Typography>

          {/* Single Code Input Field */}
          <TextInput
            placeholder="e.g., YAAD-789"
            placeholderTextColor="#94A3B8"
            value={codeInputValue}
            onChangeText={setCodeInputValue}
            autoCapitalize="characters"
            style={styles.codeInputBox}
          />
        </View>

        {/* Connect Patient Primary Button */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleConnect}
          disabled={isLoading}
          style={styles.connectPatientBtn}
        >
          <Typography size="base" weight="bold" color="#FFFFFF">
            {isLoading ? 'Authorizing Relationship...' : 'Connect Patient →'}
          </Typography>
        </TouchableOpacity>
      </ScrollView>

      {/* Floating Caregiver Navigation */}
      <CaregiverBottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backSquareBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  mandatoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: '#C084FC',
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: SPACING.md,
  },
  inputField: {
    backgroundColor: '#F8FAF8',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    marginTop: SPACING.xs,
  },
  dropdownField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAF8',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    marginTop: SPACING.xs,
  },
  linkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  scanQrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.md,
  },
  codeInputBox: {
    backgroundColor: '#F8FAF8',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#16A34A',
    textAlign: 'center',
    letterSpacing: 3,
    marginTop: SPACING.xs,
  },
  connectPatientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
    marginTop: SPACING.lg,
    height: 52,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
});
