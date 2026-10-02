export type HospitalUnit = 'ALL' | 'ICU' | 'ED' | 'CARDIOLOGY' | 'MED_SURG' | 'PEDIATRICS' | 'POST_OP';

export type AcuitySeverity = 'critical' | 'high' | 'moderate' | 'stable';

export type IsolationType = 'None' | 'Contact' | 'Droplet' | 'Airborne' | 'Reverse';

export type ResuscitationCode = 'Full Code' | 'DNR' | 'DNI' | 'Comfort Care';

export type BedStatus = 'occupied' | 'cleaning' | 'available' | 'reserved';

export interface VitalsReading {
  hr: number; // bpm (60-100 normal)
  bpSys: number; // mmHg (90-120 normal)
  bpDia: number; // mmHg (60-80 normal)
  spo2: number; // % (95-100 normal)
  respRate: number; // breaths/min (12-20 normal)
  tempF: number; // Fahrenheit (97.8 - 99.1 normal)
  timestamp: string;
}

export interface MedicationOrder {
  id: string;
  name: string;
  dose: string;
  route: string; // IV, PO, SubQ, Inhalation
  frequency: string; // Q4H, Q8H, BID, PRN, ONCE
  scheduledTime: string;
  status: 'due' | 'administered' | 'held' | 'overdue';
  lastAdministered?: string;
  administeredBy?: string;
}

export interface LabOrder {
  id: string;
  name: string;
  priority: 'STAT' | 'Urgent' | 'Routine';
  orderedAt: string;
  status: 'pending' | 'collected' | 'resulted';
  result?: string;
  normalRange?: string;
  isAbnormal?: boolean;
}

export interface CareTask {
  id: string;
  title: string;
  category: 'nursing' | 'physician' | 'respiratory' | 'dietary';
  dueTime: string;
  completed: boolean;
  assignedRole: string;
}

export interface ClinicalNote {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  title: string;
  body: string;
  type: 'Progress Note' | 'Consult' | 'Nursing Handoff' | 'Triage Assessment';
}

export interface DischargeMilestones {
  medReconciliation: boolean;
  clinicalClearance: boolean;
  transportScheduled: boolean;
  dischargeSummary: boolean;
}

export interface Patient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  unit: Exclude<HospitalUnit, 'ALL'>;
  bedId: string;
  bedStatus: BedStatus;
  admitDate: string;
  diagnosis: string;
  primaryPhysician: string;
  assignedNurse: string;
  acuity: AcuitySeverity;
  acuityScore: number; // 1 (most critical) to 5 (least)
  isolation: IsolationType;
  fallRisk: boolean;
  codeStatus: ResuscitationCode;
  vitals: VitalsReading;
  vitalsHistory: VitalsReading[];
  allergies: string[];
  medications: MedicationOrder[];
  labs: LabOrder[];
  careTasks: CareTask[];
  notes: ClinicalNote[];
  dischargeMilestones: DischargeMilestones;
  pendingTransfer?: Exclude<HospitalUnit, 'ALL'>;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Attending Physician' | 'Resident' | 'Charge Nurse' | 'Staff RN' | 'Respiratory Therapist' | 'Clinical Pharmacist';
  unit: Exclude<HospitalUnit, 'ALL'>;
  shift: 'Day (07:00-19:00)' | 'Night (19:00-07:00)';
  activePatientIds: string[];
  maxCapacity: number;
}

export interface TelemetryAlert {
  id: string;
  patientId: string;
  patientName: string;
  bedId: string;
  type: 'critical_vital' | 'stat_lab' | 'fall_risk' | 'med_overdue' | 'code_event' | 'info';
  message: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
  acknowledged: boolean;
}

export interface BedLocation {
  bedId: string;
  unit: Exclude<HospitalUnit, 'ALL'>;
  status: BedStatus;
  currentPatientId?: string;
}
