import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronDown, CheckCircle2, Plus, User, ArrowRight, X } from 'lucide-react-native';
import { useCaregiverStore } from '../../store/useCaregiverStore';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { PatientStatusBadge } from '../common/PatientStatusBadge';

export const ActivePatientSwitcher: React.FC = () => {
  const router = useRouter();
  const { patients, activePatientId, setActivePatientId } = useCaregiverStore();
  const [modalVisible, setModalVisible] = useState(false);

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0] || {
    id: 'p-1',
    name: 'Amma',
    avatarBg: '#DCFCE7',
  };

  return (
    <>
      {/* Top Header Active Patient Dropdown Trigger */}
      <TouchableOpacity
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Active Patient: ${activePatient.name}`}
        onPress={() => setModalVisible(true)}
        style={styles.dropdownTrigger}
      >
        <View style={[styles.avatarCircle, { backgroundColor: activePatient.avatarBg || '#DCFCE7' }]}>
          <User size={13} color="#12803A" />
        </View>
        <View style={styles.textGroup}>
          <Text style={styles.subLabel}>PATIENT</Text>
          <Text style={styles.patientName} numberOfLines={1}>
            {activePatient.name}
          </Text>
        </View>
        <ChevronDown size={14} color="#64748B" style={{ marginLeft: 4 }} />
      </TouchableOpacity>

      {/* Switch Patient Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Patient</Text>
                <Text style={styles.modalSubtitle}>Switch active care context</Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.patientList} showsVerticalScrollIndicator={false}>
              {patients.map((patient) => {
                const isSelected = patient.id === (activePatientId || activePatient.id);
                return (
                  <TouchableOpacity
                    key={patient.id}
                    activeOpacity={0.8}
                    onPress={() => {
                      setActivePatientId(patient.id);
                      setModalVisible(false);
                    }}
                    style={[
                      styles.patientItem,
                      isSelected && styles.patientItemSelected,
                    ]}
                  >
                    <View style={[styles.avatarCircleLarge, { backgroundColor: patient.avatarBg || '#DCFCE7' }]}>
                      <User size={18} color="#12803A" />
                    </View>

                    <View style={styles.patientItemDetails}>
                      <Text style={styles.patientItemName}>{patient.name}</Text>
                      <View style={{ marginTop: 2 }}>
                        <PatientStatusBadge status="STABLE" size="sm" />
                      </View>
                    </View>

                    {isSelected ? (
                      <View style={styles.activeCheckBadge}>
                        <CheckCircle2 size={14} color="#16A34A" />
                        <Text style={styles.activeCheckText}>Active</Text>
                      </View>
                    ) : (
                      <ArrowRight size={16} color="#94A3B8" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Add New Patient Action */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setModalVisible(false);
                router.push('/caregiver/connect-patient');
              }}
              style={styles.addPatientBtn}
            >
              <Plus size={16} color="#16A34A" style={{ marginRight: 6 }} />
              <Text style={styles.addPatientBtnText}>+ Add Another Patient</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#E2E8E5',
    minHeight: 36,
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  textGroup: {
    justifyContent: 'center',
  },
  subLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    lineHeight: 11,
    letterSpacing: 0.4,
  },
  patientName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 14,
    maxWidth: 90,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F3',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  patientList: {
    maxHeight: 260,
    marginVertical: SPACING.sm,
  },
  patientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: '#F7FAF8',
    marginBottom: SPACING.xs,
    borderWidth: 1.5,
    borderColor: '#E2E8E5',
  },
  patientItemSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#16A34A',
  },
  avatarCircleLarge: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientItemDetails: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  patientItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  activeCheckBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  activeCheckText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
    marginLeft: 3,
  },
  addPatientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F3',
    paddingVertical: 11,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: '#E2E8E5',
  },
  addPatientBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },
});
