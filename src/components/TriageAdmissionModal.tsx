import React, { useState } from 'react';
import { BedLocation, HospitalUnit, Patient, StaffMember, AcuitySeverity, IsolationType, ResuscitationCode } from '../types/caregrid';
import { X, UserPlus, Heart, ShieldAlert } from 'lucide-react';

interface TriageAdmissionModalProps {
  beds: BedLocation[];
  staff: StaffMember[];
  preselectedBed?: BedLocation | null;
  onClose: () => void;
  onAdmit: (newPatient: Patient) => void;
}

export const TriageAdmissionModal: React.FC<TriageAdmissionModalProps> = ({
  beds,
  staff,
  preselectedBed,
  onClose,
  onAdmit,
}) => {
  const availableBeds = beds.filter(b => b.status === 'available' || b.bedId === preselectedBed?.bedId);

  const [name, setName] = useState('');
  const [age, setAge] = useState('52');
  const [gender, setGender] = useState<'M' | 'F' | 'Other'>('M');
  const [selectedBedId, setSelectedBedId] = useState(preselectedBed ? preselectedBed.bedId : availableBeds[0]?.bedId || '');
  const [diagnosis, setDiagnosis] = useState('');
  const [acuity, setAcuity] = useState<AcuitySeverity>('high');
  const [acuityScore, setAcuityScore] = useState<number>(2);
  const [isolation, setIsolation] = useState<IsolationType>('None');
  const [codeStatus, setCodeStatus] = useState<ResuscitationCode>('Full Code');
  const [fallRisk, setFallRisk] = useState<boolean>(true);
  const [allergies, setAllergies] = useState<string>('NKDA');

  // Vitals
  const [hr, setHr] = useState('88');
  const [bpSys, setBpSys] = useState('126');
  const [bpDia, setBpDia] = useState('78');
  const [spo2, setSpo2] = useState('96');
  const [rr, setRr] = useState('18');
  const [temp, setTemp] = useState('98.6');

  // Staff Assignment
  const nurses = staff.filter(s => s.role.includes('Nurse'));
  const doctors = staff.filter(s => s.role.includes('Physician'));
  const [assignedNurse, setAssignedNurse] = useState(nurses[0]?.name || 'Sarah Jenkins, RN');
  const [primaryPhysician, setPrimaryPhysician] = useState(doctors[0]?.name || 'Dr. Marcus Webb, MD');

  const selectedBedObj = beds.find(b => b.bedId === selectedBedId);
  const unit = (selectedBedObj?.unit || 'ICU') as Exclude<HospitalUnit, 'ALL'>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !diagnosis || !selectedBedId) return;

    const mrn = `MRN-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const admitDate = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newPatient: Patient = {
      id: `pt-${Date.now()}`,
      mrn,
      name,
      age: parseInt(age, 10) || 50,
      gender,
      unit,
      bedId: selectedBedId,
      bedStatus: 'occupied',
      admitDate,
      diagnosis,
      primaryPhysician,
      assignedNurse,
      acuity,
      acuityScore,
      isolation,
      fallRisk,
      codeStatus,
      allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
      vitals: {
        hr: parseInt(hr, 10) || 80,
        bpSys: parseInt(bpSys, 10) || 120,
        bpDia: parseInt(bpDia, 10) || 80,
        spo2: parseInt(spo2, 10) || 98,
        respRate: parseInt(rr, 10) || 16,
        tempF: parseFloat(temp) || 98.6,
        timestamp: 'Just now',
      },
      vitalsHistory: [
        {
          hr: parseInt(hr, 10) || 80,
          bpSys: parseInt(bpSys, 10) || 120,
          bpDia: parseInt(bpDia, 10) || 80,
          spo2: parseInt(spo2, 10) || 98,
          respRate: parseInt(rr, 10) || 16,
          tempF: parseFloat(temp) || 98.6,
          timestamp: 'Intake',
        }
      ],
      medications: [],
      labs: [],
      careTasks: [
        { id: `tsk-${Date.now()}-1`, title: 'Complete comprehensive admission nursing assessment', category: 'nursing', dueTime: 'Within 2h', completed: false, assignedRole: 'Staff RN' },
        { id: `tsk-${Date.now()}-2`, title: 'Verify telemetry lead placement & continuous strip print', category: 'nursing', dueTime: 'Immediate', completed: true, assignedRole: 'Staff RN' },
      ],
      notes: [
        {
          id: `not-${Date.now()}`,
          author: assignedNurse.split(',')[0],
          role: 'Staff RN',
          timestamp: admitDate,
          title: 'Emergency Admission & Triage Intake Note',
          body: `Patient admitted to ${selectedBedId} with ${diagnosis}. Triage Acuity Level ${acuityScore} (${acuity}). Vital signs stable on intake. Primary orders acknowledged.`,
          type: 'Triage Assessment',
        }
      ],
      dischargeMilestones: {
        medReconciliation: false,
        clinicalClearance: false,
        transportScheduled: false,
        dischargeSummary: false,
      },
    };

    onAdmit(newPatient);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Clinical Triage & Bed Admission</h3>
              <p className="text-xs text-slate-400">Register new patient intake, bed allocation, and baseline telemetry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Demographics & Bed */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              1. Patient Demographics & Bed Allocation
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] text-slate-300 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Julian Hayes"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Assign Hospital Bed</label>
                <select
                  value={selectedBedId}
                  onChange={e => setSelectedBedId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-teal-300 font-mono focus:outline-none focus:border-teal-500"
                  required
                >
                  {availableBeds.length === 0 ? (
                    <option value="">No beds currently available</option>
                  ) : (
                    availableBeds.map(b => (
                      <option key={b.bedId} value={b.bedId}>
                        {b.bedId} ({b.unit})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Age (Years)</label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as 'M' | 'F' | 'Other')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300"
                >
                  <option value="M">Male (M)</option>
                  <option value="F">Female (F)</option>
                  <option value="Other">Other / Non-Binary</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Code Status</label>
                <select
                  value={codeStatus}
                  onChange={e => setCodeStatus(e.target.value as ResuscitationCode)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300"
                >
                  <option value="Full Code">Full Code</option>
                  <option value="DNR">DNR (Do Not Resuscitate)</option>
                  <option value="DNI">DNI (Do Not Intubate)</option>
                  <option value="Comfort Care">Comfort Care</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Assessment & Diagnosis */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              2. Clinical Triage & Acuity Scoring
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] text-slate-300 block mb-1">Admitting Diagnosis / Chief Complaint</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Pancreatitis / Epigastric Pain radiating to back"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Acuity Severity</label>
                <select
                  value={acuity}
                  onChange={e => {
                    const val = e.target.value as AcuitySeverity;
                    setAcuity(val);
                    if (val === 'critical') setAcuityScore(1);
                    else if (val === 'high') setAcuityScore(2);
                    else if (val === 'moderate') setAcuityScore(3);
                    else setAcuityScore(4);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300"
                >
                  <option value="critical">Level 1 - Critical (Immediate resuscitation)</option>
                  <option value="high">Level 2 - High / Emergent</option>
                  <option value="moderate">Level 3 - Moderate / Urgent</option>
                  <option value="stable">Level 4 - Stable / Less-Urgent</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Infection Isolation</label>
                <select
                  value={isolation}
                  onChange={e => setIsolation(e.target.value as IsolationType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300"
                >
                  <option value="None">None (Standard Precautions)</option>
                  <option value="Contact">Contact Isolation</option>
                  <option value="Droplet">Droplet Isolation</option>
                  <option value="Airborne">Airborne Isolation</option>
                  <option value="Reverse">Neutropenic / Reverse</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Allergies (comma-separated)</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={e => setAllergies(e.target.value)}
                  placeholder="NKDA, Penicillin, Latex"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="fallRisk"
                  checked={fallRisk}
                  onChange={e => setFallRisk(e.target.checked)}
                  className="h-4 w-4 rounded bg-slate-950 border-slate-700 text-teal-400 focus:ring-0"
                />
                <label htmlFor="fallRisk" className="text-xs text-slate-300 cursor-pointer">
                  High Fall Risk (Bed alarm required)
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Baseline Vitals */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-rose-400" />
              3. Baseline Clinical Vitals (Bedside Monitor)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">HR (bpm)</label>
                <input
                  type="number"
                  value={hr}
                  onChange={e => setHr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white text-center font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">BP Sys</label>
                <input
                  type="number"
                  value={bpSys}
                  onChange={e => setBpSys(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white text-center font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">BP Dia</label>
                <input
                  type="number"
                  value={bpDia}
                  onChange={e => setBpDia(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white text-center font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">SpO2 (%)</label>
                <input
                  type="number"
                  value={spo2}
                  onChange={e => setSpo2(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-teal-300 text-center font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Resp Rate</label>
                <input
                  type="number"
                  value={rr}
                  onChange={e => setRr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white text-center font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Temp (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  value={temp}
                  onChange={e => setTemp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white text-center font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 4: Primary Care Team Assignment */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              4. Primary Care Team Assignment
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Primary Staff Nurse (RN)</label>
                <select
                  value={assignedNurse}
                  onChange={e => setAssignedNurse(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300"
                >
                  {nurses.map(n => (
                    <option key={n.id} value={n.name}>
                      {n.name} ({n.unit} - {n.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">Attending Physician (MD)</label>
                <select
                  value={primaryPhysician}
                  onChange={e => setPrimaryPhysician(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300"
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.unit})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer Submit Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name || !diagnosis || !selectedBedId}
              className="px-5 py-2 bg-teal-400 hover:bg-teal-300 disabled:opacity-50 text-slate-950 font-semibold rounded-lg text-xs transition-colors shadow-md flex items-center gap-1.5"
            >
              <UserPlus className="h-4 w-4" />
              <span>Complete Admission to {selectedBedId || 'Unit'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
