import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, ChevronDown, CheckCircle2, Plus, User, ArrowRight } from 'lucide-react-native';
import { Typography } from '../common/Typography';
import { useCaregiverStore } from '../../store/useCaregiverStore';
import { RADIUS, SPACING } from '../../constants/theme';

export const ActivePatientSwitcher: React.FC = () => {
  const router = useRouter();
  const { patients, activePatientId, setActivePatientId } = useCaregiverStore();
  const [modalVisible, setModalVisible] = useState(false);

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0] || {
    id: 'p-1',
    name: 'Amma',
    activityStatus: 'Activity: Stable',
    avatarBg: '#FEF3C7'
  };

  return (
    <>
      {/* Top Header Active Patient Selector Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
        style={styles.headerPillBtn}
      >
        <View style={[styles.avatarCircle, { backgroundColor: activePatient.avatarBg || '#FEF3C7' }]}>
          <User size={16} color="#0F172A" />
        </View>
        <View style={{ marginLeft: 6 }}>
          <Typography size="xs" color="#64748B" weight="medium">
            Active Patient
          </Typography>
          <Typography size="sm" color="#0F172A" weight="bold">
            {activePatient.name}
          </Typography>
        </View>
        <ChevronDown size={16} color="#64748B" style={{ marginLeft: 6 }} />
      </TouchableOpacity>

      {/* Switch Patient Selection Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Users size={20} color="#16A34A" style={{ marginRight: 8 }} />
                <Typography size="lg" weight="bold" color="#0F172A">
                  Switch Active Patient
                </Typography>
              </View>
              <Typography size="xs" color="#64748B" style={{ marginTop: 2 }}>
                Select a connected patient to switch application context.
              </Typography>
            </View>

            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              <View style={{ gap: SPACING.sm, marginVertical: SPACING.md }}>
                {patients.map((patient) => {
                  const isSelected = patient.id === activePatientId;
                  return (
                    <TouchableOpacity
                      key={patient.id}
                      activeOpacity={0.85}
                      onPress={() => {
                        setActivePatientId(patient.id);
                        setModalVisible(false);
                      }}
                      style={[
                        styles.patientSelectCard,
                        isSelected ? styles.selectedCard : null
                      ]}
                    >
                      <View style={[styles.avatarCircleLarge, { backgroundColor: patient.avatarBg || '#DCFCE7' }]}>
                        <User size={22} color="#0F172A" />
                      </View>

                      <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                        <Typography size="base" weight="bold" color="#0F172A">
                          {patient.name}
                        </Typography>
                        <Typography size="xs" color="#64748B" style={{ marginTop: 2 }}>
                          {patient.activityStatus}
                        </Typography>
                      </View>

                      {isSelected ? (
                        <View style={styles.activeTag}>
                          <CheckCircle2 size={14} color="#16A34A" style={{ marginRight: 4 }} />
                          <Typography size="xs" weight="bold" color="#16A34A">
                            Active
                          </Typography>
                        </View>
                      ) : (
                        <ArrowRight size={18} color="#94A3B8" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Add New Patient Action */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => {
                setModalVisible(false);
                router.push('/caregiver/connect-patient');
              }}
              style={styles.addPatientModalBtn}
            >
              <Plus size={18} color="#16A34A" style={{ marginRight: 6 }} />
              <Typography size="sm" weight="bold" color="#16A34A">
                Add New Patient
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ marginTop: 14, alignItems: 'center' }}
            >
              <Typography size="sm" weight="bold" color="#64748B">
                Close
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  headerPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.lg,
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: SPACING.sm,
  },
  patientSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF8',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  selectedCard: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  avatarCircleLarge: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  addPatientModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    marginTop: SPACING.xs,
  },
});
