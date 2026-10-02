import React, { useState } from 'react';
import { Patient, VitalsReading, MedicationOrder, LabOrder, CareTask, ClinicalNote } from '../types/caregrid';
import { 
  X, 
  Activity, 
  Pill, 
  TestTube2, 
  CheckSquare, 
  FileText, 
  LogOut, 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  Heart, 
  Wind, 
  Thermometer, 
  ShieldAlert,
  ArrowRight,
  Send
} from 'lucide-react';

interface PatientDetailDrawerProps {
  patient: Patient;
  onClose: () => void;
  onUpdatePatient: (updated: Patient) => void;
  onDischargePatient: (patientId: string) => void;
  onOpenSbar: (patient: Patient) => void;
}

export const PatientDetailDrawer: React.FC<PatientDetailDrawerProps> = ({
  patient,
  onClose,
  onUpdatePatient,
  onDischargePatient,
  onOpenSbar,
}) => {
  const [activeTab, setActiveTab] = useState<'vitals' | 'emar' | 'labs' | 'tasks' | 'notes' | 'discharge'>('vitals');

  // New Note state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [noteType, setNoteType] = useState<ClinicalNote['type']>('Progress Note');

  // New Vitals state
  const [newHr, setNewHr] = useState(patient.vitals.hr.toString());
  const [newBpSys, setNewBpSys] = useState(patient.vitals.bpSys.toString());
  const [newBpDia, setNewBpDia] = useState(patient.vitals.bpDia.toString());
  const [newSpo2, setNewSpo2] = useState(patient.vitals.spo2.toString());
  const [newRr, setNewRr] = useState(patient.vitals.respRate.toString());
  const [newTemp, setNewTemp] = useState(patient.vitals.tempF.toString());
  const [showAddVitals, setShowAddVitals] = useState(false);

  // New Med order state
  const [showAddMed, setShowAddMed] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDose, setMedDose] = useState('');
  const [medRoute, setMedRoute] = useState('IV');
  const [medFreq, setMedFreq] = useState('Q8H');
  const [medTime, setMedTime] = useState('14:00');

  // New Task state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskRole, setNewTaskRole] = useState('Staff RN');

  // Handle Administer Med
  const handleAdministerMed = (medId: string) => {
    const updatedMeds = patient.medications.map(m => {
      if (m.id === medId) {
        return {
          ...m,
          status: 'administered' as const,
          lastAdministered: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          administeredBy: patient.assignedNurse.split(',')[0],
        };
      }
      return m;
    });

    onUpdatePatient({
      ...patient,
      medications: updatedMeds,
    });
  };

  // Handle Hold Med
  const handleHoldMed = (medId: string) => {
    const updatedMeds = patient.medications.map(m => {
      if (m.id === medId) {
        return {
          ...m,
          status: 'held' as const,
        };
      }
      return m;
    });

    onUpdatePatient({
      ...patient,
      medications: updatedMeds,
    });
  };

  // Handle Add Medication
  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !medDose) return;

    const newMed: MedicationOrder = {
      id: `med-${Date.now()}`,
      name: medName,
      dose: medDose,
      route: medRoute,
      frequency: medFreq,
      scheduledTime: medTime,
      status: 'due',
    };

    onUpdatePatient({
      ...patient,
      medications: [...patient.medications, newMed],
    });

    setMedName('');
    setMedDose('');
    setShowAddMed(false);
  };

  // Handle Task Toggle
  const handleToggleTask = (taskId: string) => {
    const updatedTasks = patient.careTasks.map(t => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });

    onUpdatePatient({
      ...patient,
      careTasks: updatedTasks,
    });
  };

  // Handle Add Task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    const newTask: CareTask = {
      id: `tsk-${Date.now()}`,
      title: newTaskTitle,
      category: 'nursing',
      dueTime: 'Shift',
      completed: false,
      assignedRole: newTaskRole,
    };

    onUpdatePatient({
      ...patient,
      careTasks: [...patient.careTasks, newTask],
    });

    setNewTaskTitle('');
  };

  // Handle Save Manual Vitals
  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    const reading: VitalsReading = {
      hr: parseInt(newHr, 10) || 75,
      bpSys: parseInt(newBpSys, 10) || 120,
      bpDia: parseInt(newBpDia, 10) || 80,
      spo2: parseInt(newSpo2, 10) || 98,
      respRate: parseInt(newRr, 10) || 16,
      tempF: parseFloat(newTemp) || 98.6,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onUpdatePatient({
      ...patient,
      vitals: reading,
      vitalsHistory: [...patient.vitalsHistory, reading],
    });

    setShowAddVitals(false);
  };

  // Handle Add Clinical Note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !noteBody) return;

    const newNote: ClinicalNote = {
      id: `not-${Date.now()}`,
      author: patient.assignedNurse.split(',')[0],
      role: 'Registered Nurse',
      timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      title: noteTitle,
      body: noteBody,
      type: noteType,
    };

    onUpdatePatient({
      ...patient,
      notes: [newNote, ...patient.notes],
    });

    setNoteTitle('');
    setNoteBody('');
  };

  // Handle Milestone Toggle
  const handleToggleMilestone = (key: keyof Patient['dischargeMilestones']) => {
    const updatedMilestones = {
      ...patient.dischargeMilestones,
      [key]: !patient.dischargeMilestones[key],
    };

    onUpdatePatient({
      ...patient,
      dischargeMilestones: updatedMilestones,
    });
  };

  const allMilestonesComplete = Object.values(patient.dischargeMilestones).every(Boolean);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Clinical Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded">
                {patient.bedId}
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-400 font-medium">{patient.unit} Unit</span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs font-mono text-slate-400">{patient.mrn}</span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-300 font-semibold">{patient.codeStatus}</span>
              {patient.isolation !== 'None' && (
                <span className="text-xs text-amber-300 font-medium flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3" />
                  {patient.isolation} Iso
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <h2 className="text-xl font-bold text-white tracking-tight">{patient.name}</h2>
              <span className="text-sm text-slate-400">
                {patient.age}y / {patient.gender}
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-400">
                Admitted {patient.admitDate}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-1 font-medium italic">
              {patient.diagnosis}
            </p>

            {/* Allergies Highlight */}
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Allergies:
              </span>
              <span className="text-slate-300 font-mono">
                {patient.allergies.join(', ') || 'No Known Drug Allergies'}
              </span>
            </div>
          </div>

          {/* Right Header: Care Team & Action Buttons */}
          <div className="flex flex-col md:items-end justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenSbar(patient)}
                className="px-3 py-1.5 text-xs font-medium text-sky-300 bg-sky-950/40 border border-sky-800/60 rounded-lg hover:bg-sky-900/50 transition-colors flex items-center gap-1.5"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Export SBAR</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-slate-400 text-left md:text-right">
              <div>
                <span className="text-slate-500">Primary MD:</span>{' '}
                <span className="text-slate-200">{patient.primaryPhysician}</span>
              </div>
              <div className="mt-0.5">
                <span className="text-slate-500">Assigned RN:</span>{' '}
                <span className="text-slate-200">{patient.assignedNurse}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-800 bg-slate-950/40 px-4 sm:px-6">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto scrollbar-none py-2">
            {[
              { id: 'vitals', label: 'Telemetry & Vitals', icon: Activity },
              { id: 'emar', label: 'eMAR Medications', icon: Pill, count: patient.medications.filter(m => m.status === 'due').length },
              { id: 'labs', label: 'Labs & Diagnostics', icon: TestTube2, count: patient.labs.filter(l => l.priority === 'STAT' && l.status !== 'resulted').length },
              { id: 'tasks', label: 'Care Tasks', icon: CheckSquare, count: patient.careTasks.filter(t => !t.completed).length },
              { id: 'notes', label: 'Clinical Notes', icon: FileText },
              { id: 'discharge', label: 'Discharge Readiness', icon: LogOut },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 py-2 px-3 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-800 text-teal-300 font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="bg-teal-500/20 text-teal-300 text-[10px] font-mono px-1.5 py-0.2 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/50">
          {/* TAB 1: Vitals & Telemetry */}
          {activeTab === 'vitals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Continuous Hemodynamic Telemetry</h4>
                  <p className="text-xs text-slate-400">Live bedside monitor telemetry stream and recorded observations</p>
                </div>
                <button
                  onClick={() => setShowAddVitals(!showAddVitals)}
                  className="px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Record Vitals Check</span>
                </button>
              </div>

              {/* Add Vitals Inline Form */}
              {showAddVitals && (
                <form onSubmit={handleSaveVitals} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <h5 className="text-xs font-semibold text-slate-300">Enter Verified Clinical Observations</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">HR (bpm)</label>
                      <input
                        type="number"
                        value={newHr}
                        onChange={e => setNewHr(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">BP Systolic</label>
                      <input
                        type="number"
                        value={newBpSys}
                        onChange={e => setNewBpSys(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">BP Diastolic</label>
                      <input
                        type="number"
                        value={newBpDia}
                        onChange={e => setNewBpDia(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">SpO2 (%)</label>
                      <input
                        type="number"
                        value={newSpo2}
                        onChange={e => setNewSpo2(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Resp Rate</label>
                      <input
                        type="number"
                        value={newRr}
                        onChange={e => setNewRr(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Temp (°F)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newTemp}
                        onChange={e => setNewTemp(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddVitals(false)}
                      className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-teal-400 text-slate-950 font-semibold rounded text-xs"
                    >
                      Save to EHR
                    </button>
                  </div>
                </form>
              )}

              {/* Current Vitals Display */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Heart className="h-4 w-4 text-rose-400" /> Heart Rate
                    </span>
                    <span className="font-mono text-[11px]">bpm</span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-white mt-2">
                    {patient.vitals.hr}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Normal: 60-100</span>
                </div>

                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Blood Pressure</span>
                    <span className="font-mono text-[11px]">mmHg</span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-white mt-2">
                    {patient.vitals.bpSys}/{patient.vitals.bpDia}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Normal: &lt;120/80</span>
                </div>

                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Oxygen Saturation</span>
                    <span className="font-mono text-[11px]">SpO2</span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-teal-400 mt-2">
                    {patient.vitals.spo2}%
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Target: &gt;94%</span>
                </div>

                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Wind className="h-4 w-4 text-sky-400" /> Respiratory Rate
                    </span>
                    <span className="font-mono text-[11px]">/min</span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-white mt-2">
                    {patient.vitals.respRate}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Normal: 12-20</span>
                </div>

                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Thermometer className="h-4 w-4 text-amber-400" /> Body Temp
                    </span>
                    <span className="font-mono text-[11px]">°F</span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-white mt-2">
                    {patient.vitals.tempF}°
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Normal: 97.8-99.1</span>
                </div>
              </div>

              {/* Vitals History Trend Table */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-3 border-b border-slate-800 text-xs font-semibold text-slate-300">
                  Telemetry Trend Log
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900/60 text-slate-400 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="px-4 py-2">Timestamp</th>
                        <th className="px-4 py-2">Heart Rate</th>
                        <th className="px-4 py-2">Blood Pressure</th>
                        <th className="px-4 py-2">SpO2</th>
                        <th className="px-4 py-2">Resp Rate</th>
                        <th className="px-4 py-2">Temp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums text-slate-200">
                      {patient.vitalsHistory.map((h, i) => (
                        <tr key={i} className="hover:bg-slate-900/30">
                          <td className="px-4 py-2 text-slate-400">{h.timestamp}</td>
                          <td className="px-4 py-2 text-rose-300">{h.hr} bpm</td>
                          <td className="px-4 py-2">{h.bpSys}/{h.bpDia}</td>
                          <td className="px-4 py-2 text-teal-300">{h.spo2}%</td>
                          <td className="px-4 py-2">{h.respRate} /min</td>
                          <td className="px-4 py-2">{h.tempF}°F</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: eMAR */}
          {activeTab === 'emar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Electronic Medication Administration Record (eMAR)</h4>
                  <p className="text-xs text-slate-400">Scheduled pharmacotherapy, dose verification, and administration audit log</p>
                </div>
                <button
                  onClick={() => setShowAddMed(!showAddMed)}
                  className="px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Medication Order</span>
                </button>
              </div>

              {/* Add Medication Order Form */}
              {showAddMed && (
                <form onSubmit={handleAddMedication} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <h5 className="text-xs font-semibold text-slate-300">Order New Pharmacological Agent</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] text-slate-400 block mb-1">Medication Name</label>
                      <input
                        type="text"
                        value={medName}
                        onChange={e => setMedName(e.target.value)}
                        placeholder="e.g. Cefepime, Norepinephrine"
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Dosage</label>
                      <input
                        type="text"
                        value={medDose}
                        onChange={e => setMedDose(e.target.value)}
                        placeholder="e.g. 1 g IVPB"
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Route</label>
                      <select
                        value={medRoute}
                        onChange={e => setMedRoute(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                      >
                        <option value="IV">IV Push</option>
                        <option value="IVPB">IV Piggyback</option>
                        <option value="IV Continuous">IV Continuous</option>
                        <option value="PO">Oral (PO)</option>
                        <option value="SubQ">Subcutaneous</option>
                        <option value="Inhalation">Inhalation</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Frequency</label>
                      <input
                        type="text"
                        value={medFreq}
                        onChange={e => setMedFreq(e.target.value)}
                        placeholder="e.g. Q8H, Daily"
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMed(false)}
                      className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-teal-400 text-slate-950 font-semibold rounded text-xs"
                    >
                      Save Order
                    </button>
                  </div>
                </form>
              )}

              {/* Meds List */}
              <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl bg-slate-950/60 overflow-hidden">
                {patient.medications.map(med => (
                  <div key={med.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/30 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{med.name}</span>
                        <span className="text-xs text-slate-500">·</span>
                        <span className="text-xs font-mono text-teal-300">{med.dose}</span>
                        <span className="text-xs text-slate-500">·</span>
                        <span className="text-xs text-slate-400">{med.route}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span>Freq: {med.frequency}</span>
                        <span>·</span>
                        <span>Schedule: {med.scheduledTime}</span>
                        {med.lastAdministered && (
                          <>
                            <span>·</span>
                            <span className="text-slate-500">
                              Last given: {med.lastAdministered} by {med.administeredBy}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {med.status === 'administered' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" /> Administered
                        </span>
                      ) : med.status === 'held' ? (
                        <span className="text-xs font-medium text-amber-400">
                          Medication Held
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleHoldMed(med.id)}
                            className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 border border-slate-800 rounded hover:bg-slate-900"
                          >
                            Hold
                          </button>
                          <button
                            onClick={() => handleAdministerMed(med.id)}
                            className="px-3 py-1 bg-teal-400 hover:bg-teal-300 text-slate-950 font-semibold rounded text-xs transition-colors flex items-center gap-1"
                          >
                            <Pill className="h-3.5 w-3.5" />
                            <span>Administer Dose</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Labs & Diagnostics */}
          {activeTab === 'labs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Diagnostic Laboratory Orders & Results</h4>
                  <p className="text-xs text-slate-400">STAT cardiac biomarkers, arterial blood gas, panels, and microbiologic cultures</p>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl bg-slate-950/60 overflow-hidden divide-y divide-slate-800/80">
                {patient.labs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No active lab orders currently charted for this patient.
                  </div>
                ) : (
                  patient.labs.map(lab => (
                    <div key={lab.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${lab.priority === 'STAT' ? 'bg-rose-950/60 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-300'}`}>
                            {lab.priority}
                          </span>
                          <span className="text-sm font-semibold text-white">{lab.name}</span>
                          <span className="text-xs text-slate-500">·</span>
                          <span className="text-xs text-slate-400 font-mono">Ordered {lab.orderedAt}</span>
                        </div>
                        {lab.result ? (
                          <div className="mt-1.5 text-xs">
                            <span className="text-slate-400">Result: </span>
                            <span className={`font-mono font-medium ${lab.isAbnormal ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                              {lab.result}
                            </span>
                            {lab.normalRange && (
                              <span className="text-slate-500 text-[11px] ml-2 font-mono">
                                (Ref: {lab.normalRange})
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-amber-400 mt-1">Status: Specimen {lab.status} · Processing in laboratory</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Care Tasks */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Shift Nursing & Interdisciplinary Care Tasks</h4>
                  <p className="text-xs text-slate-400">Protocols, line maintenance, hourly assessments, and specialty consults</p>
                </div>
              </div>

              {/* Add task inline form */}
              <form onSubmit={handleAddTask} className="flex gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="Add specific care directive or assessment..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
                <select
                  value={newTaskRole}
                  onChange={e => setNewTaskRole(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
                >
                  <option value="Staff RN">Staff RN</option>
                  <option value="Charge RN">Charge RN</option>
                  <option value="RT">Respiratory Therapist</option>
                  <option value="Attending MD">Attending MD</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-teal-400 text-slate-950 font-semibold rounded-lg text-xs"
                >
                  Add Task
                </button>
              </form>

              {/* Task items */}
              <div className="border border-slate-800 rounded-xl bg-slate-950/60 divide-y divide-slate-800/80">
                {patient.careTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-900/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${task.completed ? 'bg-teal-500 border-teal-500 text-slate-950' : 'border-slate-700 bg-slate-900'}`}>
                        {task.completed && <CheckSquare className="h-3.5 w-3.5" />}
                      </div>
                      <span className={`text-xs ${task.completed ? 'line-through text-slate-500' : 'text-slate-200 font-medium'}`}>
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{task.assignedRole}</span>
                      <span>·</span>
                      <span className="font-mono">{task.dueTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Clinical Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Clinical Documentation & Rounds Notes</h4>
                  <p className="text-xs text-slate-400">Chronological history of attending rounds, nursing assessments, and specialist consults</p>
                </div>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={e => setNoteTitle(e.target.value)}
                    placeholder="Note Title (e.g. SBAR Nursing Shift Assessment, Extubation Readiness)"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                    required
                  />
                  <select
                    value={noteType}
                    onChange={e => setNoteType(e.target.value as ClinicalNote['type'])}
                    className="bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-300"
                  >
                    <option value="Progress Note">Progress Note</option>
                    <option value="Nursing Handoff">Nursing Handoff</option>
                    <option value="Consult">Specialist Consult</option>
                    <option value="Triage Assessment">Triage Assessment</option>
                  </select>
                </div>

                <textarea
                  rows={3}
                  value={noteBody}
                  onChange={e => setNoteBody(e.target.value)}
                  placeholder="Document clinical observations, hemodynamic stability, plan of care..."
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white"
                  required
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-teal-400 text-slate-950 font-semibold rounded text-xs flex items-center gap-1.5"
                  >
                    <Send className="h-3 w-3" />
                    <span>Sign & Chart Note</span>
                  </button>
                </div>
              </form>

              {/* Note Feed */}
              <div className="space-y-3">
                {patient.notes.map(note => (
                  <div key={note.id} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
                    <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{note.title}</span>
                        <span>·</span>
                        <span className="text-teal-400">{note.type}</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500">{note.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2.5 leading-relaxed whitespace-pre-line">
                      {note.body}
                    </p>
                    <div className="mt-3 pt-2 border-t border-slate-800/40 text-[11px] text-slate-500 flex items-center gap-1.5">
                      <span>Authored & Digitally Signed by</span>
                      <span className="text-slate-300 font-medium">{note.author}</span>
                      <span>({note.role})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Discharge Readiness */}
          {activeTab === 'discharge' && (
            <div className="space-y-6 max-w-2xl mx-auto py-2">
              <div className="text-center">
                <h4 className="text-base font-semibold text-white">Discharge Readiness & Care Transition Protocol</h4>
                <p className="text-xs text-slate-400 mt-1">Complete all 4 clinical gates before processing hospital discharge or unit transfer</p>
              </div>

              <div className="space-y-3 bg-slate-950/80 border border-slate-800 rounded-xl p-5">
                {[
                  {
                    key: 'clinicalClearance' as const,
                    title: '1. Attending Physician Clinical Clearance',
                    desc: 'Primary team confirms vital signs stability, oral intake tolerance, and afebrile status > 24 hours.',
                  },
                  {
                    key: 'medReconciliation' as const,
                    title: '2. Pharmacy Medication Reconciliation',
                    desc: 'Home prescriptions reviewed, discharge scripts e-prescribed, and patient medication teaching complete.',
                  },
                  {
                    key: 'transportScheduled' as const,
                    title: '3. Transportation & Social Work Coordination',
                    desc: 'Family pickup or medical transport vehicle confirmed with estimated time of departure.',
                  },
                  {
                    key: 'dischargeSummary' as const,
                    title: '4. Signed Discharge Summary & Instructions',
                    desc: 'Follow-up appointments booked and printed summary packet delivered to patient.',
                  },
                ].map(gate => {
                  const isDone = patient.dischargeMilestones[gate.key];
                  return (
                    <div
                      key={gate.key}
                      onClick={() => handleToggleMilestone(gate.key)}
                      className="p-3.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-lg flex items-start gap-3 cursor-pointer transition-colors"
                    >
                      <div className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center shrink-0 ${isDone ? 'bg-teal-500 border-teal-500 text-slate-950' : 'border-slate-700 bg-slate-950'}`}>
                        {isDone && <CheckSquare className="h-3.5 w-3.5" />}
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${isDone ? 'text-teal-300' : 'text-white'}`}>
                          {gate.title}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {gate.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex flex-col items-center gap-2">
                <button
                  disabled={!allMilestonesComplete}
                  onClick={() => onDischargePatient(patient.id)}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    allMilestonesComplete
                      ? 'bg-teal-400 hover:bg-teal-300 text-slate-950 shadow-lg cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                  }`}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Execute Patient Discharge & Release Bed ({patient.bedId})</span>
                </button>
                {!allMilestonesComplete && (
                  <span className="text-[11px] text-amber-400">
                    All 4 gates must be certified before releasing patient bed to cleaning queue.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
