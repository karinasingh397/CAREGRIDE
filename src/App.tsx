import React, { useState, useEffect, useMemo } from 'react';
import { 
  HospitalUnit, 
  Patient, 
  BedLocation, 
  StaffMember, 
  TelemetryAlert, 
  AcuitySeverity, 
  IsolationType 
} from './types/caregrid';
import { INITIAL_BEDS, INITIAL_PATIENTS, INITIAL_STAFF } from './data/initialData';
import { Header } from './components/Header';
import { UnitMetricsBar } from './components/UnitMetricsBar';
import { CareGridToolbar } from './components/CareGridToolbar';
import { PatientGridCard } from './components/PatientGridCard';
import { EmptyBedCard } from './components/EmptyBedCard';
import { PatientTableView } from './components/PatientTableView';
import { BedCensusView } from './components/BedCensusView';
import { PatientDetailDrawer } from './components/PatientDetailDrawer';
import { TriageAdmissionModal } from './components/TriageAdmissionModal';
import { EmergencyAlertModal } from './components/EmergencyAlertModal';
import { StaffRosterModal } from './components/StaffRosterModal';
import { SbarExportModal } from './components/SbarExportModal';
import { GitRepoModal } from './components/GitRepoModal';

export default function App() {
  // Core Clinical State
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [beds, setBeds] = useState<BedLocation[]>(INITIAL_BEDS);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);

  // Initial Alert Seed
  const [alerts, setAlerts] = useState<TelemetryAlert[]>([
    {
      id: 'alt-1',
      patientId: 'pt-101',
      patientName: 'Eleanor Vance',
      bedId: 'ICU-01',
      type: 'critical_vital',
      message: 'Septic shock tachycardia: HR 118 bpm, MAP 65 on Levophed titration',
      timestamp: '10:45',
      severity: 'critical',
      acknowledged: false,
    },
    {
      id: 'alt-2',
      patientId: 'pt-103',
      patientName: 'Mateo Morales',
      bedId: 'ED-BAY-01',
      type: 'stat_lab',
      message: 'STAT Hs-Troponin resulted: 142 ng/L. Cardiac Cath Lab activated.',
      timestamp: '10:05',
      severity: 'critical',
      acknowledged: false,
    },
    {
      id: 'alt-3',
      patientId: 'pt-104',
      patientName: 'Aisha Al-Mansoor',
      bedId: 'ED-BAY-02',
      type: 'critical_vital',
      message: 'Severe Bronchospasm: SpO2 91% on room air, RR 30/min',
      timestamp: '10:15',
      severity: 'warning',
      acknowledged: false,
    },
  ]);

  // UI Filtering & Navigation State
  const [currentUnit, setCurrentUnit] = useState<HospitalUnit>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAcuity, setSelectedAcuity] = useState<AcuitySeverity | 'ALL'>('ALL');
  const [selectedIsolation, setSelectedIsolation] = useState<IsolationType | 'ALL'>('ALL');
  const [fallRiskOnly, setFallRiskOnly] = useState<boolean>(false);
  const [medsDueOnly, setMedsDueOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'census'>('grid');

  // Modals & Drawers
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isTriageModalOpen, setIsTriageModalOpen] = useState<boolean>(false);
  const [preselectedBed, setPreselectedBed] = useState<BedLocation | null>(null);
  const [isCodeBlueModalOpen, setIsCodeBlueModalOpen] = useState<boolean>(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState<boolean>(false);
  const [isSbarModalOpen, setIsSbarModalOpen] = useState<boolean>(false);
  const [isGitModalOpen, setIsGitModalOpen] = useState<boolean>(false);
  const [sbarInitialPatient, setSbarInitialPatient] = useState<Patient | null>(null);

  // Live Telemetry Simulation Engine
  const [isLiveTelemetry, setIsLiveTelemetry] = useState<boolean>(true);

  useEffect(() => {
    if (!isLiveTelemetry) return;

    const interval = setInterval(() => {
      setPatients(prevPatients =>
        prevPatients.map(pt => {
          // Subtle physiological variation
          const hrDelta = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
          const spo2Delta = Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0;
          const newHr = Math.max(45, Math.min(180, pt.vitals.hr + hrDelta));
          const newSpo2 = Math.max(88, Math.min(100, pt.vitals.spo2 + spo2Delta));

          const updatedVitals = {
            ...pt.vitals,
            hr: newHr,
            spo2: newSpo2,
            timestamp: 'Just now',
          };

          return {
            ...pt,
            vitals: updatedVitals,
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isLiveTelemetry]);

  // Filtering Logic
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      if (currentUnit !== 'ALL' && p.unit !== currentUnit) return false;
      if (selectedAcuity !== 'ALL' && p.acuity !== selectedAcuity) return false;
      if (selectedIsolation !== 'ALL' && p.isolation !== selectedIsolation) return false;
      if (fallRiskOnly && !p.fallRisk) return false;
      if (medsDueOnly && !p.medications.some(m => m.status === 'due')) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesMrn = p.mrn.toLowerCase().includes(q);
        const matchesBed = p.bedId.toLowerCase().includes(q);
        const matchesDiag = p.diagnosis.toLowerCase().includes(q);
        const matchesPhysician = p.primaryPhysician.toLowerCase().includes(q);
        const matchesNurse = p.assignedNurse.toLowerCase().includes(q);
        if (!matchesName && !matchesMrn && !matchesBed && !matchesDiag && !matchesPhysician && !matchesNurse) {
          return false;
        }
      }

      return true;
    });
  }, [patients, currentUnit, selectedAcuity, selectedIsolation, fallRiskOnly, medsDueOnly, searchQuery]);

  // Unit Beds for Grid Display
  const unitBeds = useMemo(() => {
    const list = currentUnit === 'ALL' ? beds : beds.filter(b => b.unit === currentUnit);
    return list;
  }, [beds, currentUnit]);

  // Alert acknowledgment
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, acknowledged: true } : a)));
  };

  // Patient Intake / Admission
  const handleAdmitPatient = (newPatient: Patient) => {
    setPatients(prev => [newPatient, ...prev]);
    setBeds(prev =>
      prev.map(b => (b.bedId === newPatient.bedId ? { ...b, status: 'occupied', currentPatientId: newPatient.id } : b))
    );
    setIsTriageModalOpen(false);
    setPreselectedBed(null);

    // Add admission alert
    const newAlert: TelemetryAlert = {
      id: `alt-${Date.now()}`,
      patientId: newPatient.id,
      patientName: newPatient.name,
      bedId: newPatient.bedId,
      type: 'info',
      message: `Patient admitted to ${newPatient.bedId} (${newPatient.unit}): ${newPatient.diagnosis}`,
      timestamp: 'Just now',
      severity: newPatient.acuity === 'critical' ? 'critical' : 'info',
      acknowledged: false,
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  // Patient Discharge Execution
  const handleDischargePatient = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    setPatients(prev => prev.filter(p => p.id !== patientId));
    setBeds(prev =>
      prev.map(b => (b.bedId === patient.bedId ? { ...b, status: 'cleaning', currentPatientId: undefined } : b))
    );
    if (selectedPatient?.id === patientId) {
      setSelectedPatient(null);
    }

    const dischargeAlert: TelemetryAlert = {
      id: `alt-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      bedId: patient.bedId,
      type: 'info',
      message: `Patient discharged. Bed ${patient.bedId} queued for Environmental Cleaning.`,
      timestamp: 'Just now',
      severity: 'info',
      acknowledged: false,
    };
    setAlerts(prev => [dischargeAlert, ...prev]);
  };

  // Mark Bed Cleaned
  const handleMarkCleaned = (bedId: string) => {
    setBeds(prev =>
      prev.map(b => (b.bedId === bedId ? { ...b, status: 'available' } : b))
    );
  };

  // Open Bed Admission directly
  const handleOpenAdmitToBed = (bed: BedLocation) => {
    setPreselectedBed(bed);
    setIsTriageModalOpen(true);
  };

  // Patient Updates (from Drawer)
  const handleUpdatePatient = (updated: Patient) => {
    setPatients(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    if (selectedPatient?.id === updated.id) {
      setSelectedPatient(updated);
    }
  };

  // Quick Administer Due Meds
  const handleQuickAdministerMeds = (patient: Patient) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedMeds = patient.medications.map(m => {
      if (m.status === 'due') {
        return {
          ...m,
          status: 'administered' as const,
          lastAdministered: nowTime,
          administeredBy: patient.assignedNurse.split(',')[0],
        };
      }
      return m;
    });

    const updatedPatient: Patient = {
      ...patient,
      medications: updatedMeds,
    };

    handleUpdatePatient(updatedPatient);
  };

  // Emergency Code Trigger
  const handleTriggerCode = (patientId: string, codeType: 'Code Blue' | 'Rapid Response') => {
    const target = patients.find(p => p.id === patientId);
    if (!target) return;

    const newAlert: TelemetryAlert = {
      id: `alt-${Date.now()}`,
      patientId: target.id,
      patientName: target.name,
      bedId: target.bedId,
      type: 'code_event',
      message: `EMERGENCY ${codeType.toUpperCase()} triggered for ${target.bedId} (${target.name}) - ${target.unit}`,
      timestamp: 'Just now',
      severity: 'critical',
      acknowledged: false,
    };

    setAlerts(prev => [newAlert, ...prev]);
    setIsCodeBlueModalOpen(false);
  };

  // Nurse Reassignment
  const handleReassignPatient = (patientId: string, newNurseName: string) => {
    setPatients(prev =>
      prev.map(p => {
        if (p.id === patientId) {
          return { ...p, assignedNurse: newNurseName };
        }
        return p;
      })
    );
    setIsStaffModalOpen(false);
  };

  // Open SBAR modal for specific patient
  const handleOpenSbarForPatient = (patient: Patient) => {
    setSbarInitialPatient(patient);
    setIsSbarModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500/20 selection:text-teal-200">
      {/* Top Header */}
      <Header
        currentUnit={currentUnit}
        onSelectUnit={setCurrentUnit}
        alerts={alerts}
        onAcknowledgeAlert={handleAcknowledgeAlert}
        onOpenTriageModal={() => {
          setPreselectedBed(null);
          setIsTriageModalOpen(true);
        }}
        onOpenCodeBlueModal={() => setIsCodeBlueModalOpen(true)}
        onOpenStaffModal={() => setIsStaffModalOpen(true)}
        onOpenSbarModal={() => {
          setSbarInitialPatient(null);
          setIsSbarModalOpen(true);
        }}
        onOpenGitModal={() => setIsGitModalOpen(true)}
        isLiveTelemetry={isLiveTelemetry}
        onToggleTelemetry={() => setIsLiveTelemetry(!isLiveTelemetry)}
      />

      {/* Hospital Unit Operational Census & Staffing Metrics */}
      <UnitMetricsBar
        currentUnit={currentUnit}
        patients={patients}
        beds={beds}
        staff={staff}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Filters & View Switch Toolbar */}
        <CareGridToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedAcuity={selectedAcuity}
          onAcuityChange={setSelectedAcuity}
          selectedIsolation={selectedIsolation}
          onIsolationChange={setSelectedIsolation}
          fallRiskOnly={fallRiskOnly}
          onToggleFallRisk={() => setFallRiskOnly(!fallRiskOnly)}
          medsDueOnly={medsDueOnly}
          onToggleMedsDue={() => setMedsDueOnly(!medsDueOnly)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFilteredCount={filteredPatients.length}
        />

        {/* Dynamic View Display */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Show matching patients */}
              {filteredPatients.map(patient => (
                <PatientGridCard
                  key={patient.id}
                  patient={patient}
                  onSelect={setSelectedPatient}
                  onQuickAdministerMeds={handleQuickAdministerMeds}
                  onOpenSbar={handleOpenSbarForPatient}
                />
              ))}

              {/* Show unoccupied beds if no text search filter active */}
              {!searchQuery && selectedAcuity === 'ALL' && selectedIsolation === 'ALL' && !fallRiskOnly && !medsDueOnly && (
                unitBeds
                  .filter(b => b.status !== 'occupied')
                  .map(bed => (
                    <EmptyBedCard
                      key={bed.bedId}
                      bed={bed}
                      onAdmitToBed={handleOpenAdmitToBed}
                      onMarkCleaned={handleMarkCleaned}
                    />
                  ))
              )}
            </div>
          )}

          {viewMode === 'table' && (
            <PatientTableView
              patients={filteredPatients}
              onSelect={setSelectedPatient}
              onQuickAdministerMeds={handleQuickAdministerMeds}
              onOpenSbar={handleOpenSbarForPatient}
            />
          )}

          {viewMode === 'census' && (
            <BedCensusView
              beds={beds}
              patients={patients}
              onSelectPatient={setSelectedPatient}
              onAdmitToBed={handleOpenAdmitToBed}
              onMarkCleaned={handleMarkCleaned}
            />
          )}
        </div>
      </main>

      {/* Patient Detail & EHR Drawer */}
      {selectedPatient && (
        <PatientDetailDrawer
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onUpdatePatient={handleUpdatePatient}
          onDischargePatient={handleDischargePatient}
          onOpenSbar={handleOpenSbarForPatient}
        />
      )}

      {/* Clinical Triage & Bed Admission Modal */}
      {isTriageModalOpen && (
        <TriageAdmissionModal
          beds={beds}
          staff={staff}
          preselectedBed={preselectedBed}
          onClose={() => {
            setIsTriageModalOpen(false);
            setPreselectedBed(null);
          }}
          onAdmit={handleAdmitPatient}
        />
      )}

      {/* Emergency Rapid Response / Code Blue Modal */}
      {isCodeBlueModalOpen && (
        <EmergencyAlertModal
          patients={patients}
          onClose={() => setIsCodeBlueModalOpen(false)}
          onTriggerCode={handleTriggerCode}
        />
      )}

      {/* Care Team Roster & Ratio Monitoring Modal */}
      {isStaffModalOpen && (
        <StaffRosterModal
          staff={staff}
          patients={patients}
          onClose={() => setIsStaffModalOpen(false)}
          onReassignPatient={handleReassignPatient}
        />
      )}

      {/* SBAR Handover Report Modal */}
      {isSbarModalOpen && (
        <SbarExportModal
          patients={patients}
          initialPatient={sbarInitialPatient}
          onClose={() => {
            setIsSbarModalOpen(false);
            setSbarInitialPatient(null);
          }}
        />
      )}

      {/* Git Repository & Push Guide Modal */}
      {isGitModalOpen && (
        <GitRepoModal onClose={() => setIsGitModalOpen(false)} />
      )}
    </div>
  );
}
