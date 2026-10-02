import React, { useState } from 'react';
import { StaffMember, Patient } from '../types/caregrid';
import { X, Users, HeartPulse, UserCheck, AlertTriangle, ArrowRight } from 'lucide-react';

interface StaffRosterModalProps {
  staff: StaffMember[];
  patients: Patient[];
  onClose: () => void;
  onReassignPatient: (patientId: string, newNurseName: string) => void;
}

export const StaffRosterModal: React.FC<StaffRosterModalProps> = ({
  staff,
  patients,
  onClose,
  onReassignPatient,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [targetNurseName, setTargetNurseName] = useState(staff.find(s => s.role.includes('Nurse'))?.name || '');

  const nurses = staff.filter(s => s.role.includes('Nurse'));
  const physicians = staff.filter(s => s.role.includes('Physician'));

  const handleReassign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !targetNurseName) return;
    onReassignPatient(selectedPatientId, targetNurseName);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Care Team Roster & Nurse-to-Patient Ratio</h3>
              <p className="text-xs text-slate-400">California & ANA safe nurse-to-patient acuity and staffing balance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          {/* Quick Reassignment Tool */}
          <form onSubmit={handleReassign} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-teal-400" />
              Dynamic Patient Reassignment
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Select Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={e => setSelectedPatientId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.bedId} · {p.name} (Cur: {p.assignedNurse.split(',')[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Transfer Primary Care to RN</label>
                <select
                  value={targetNurseName}
                  onChange={e => setTargetNurseName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                >
                  {nurses.map(n => (
                    <option key={n.id} value={n.name}>
                      {n.name} ({n.unit} - Max: {n.maxCapacity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Reassign Patient</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </form>

          {/* Nurses Grid with Ratio Progress Bars */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Registered Nurses & Ratio Load
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {nurses.map(nurse => {
                const assigned = patients.filter(p => p.assignedNurse.includes(nurse.name.split(',')[0]));
                const count = assigned.length;
                const isOverloaded = count > nurse.maxCapacity;
                const percent = Math.min(100, Math.round((count / nurse.maxCapacity) * 100));

                return (
                  <div
                    key={nurse.id}
                    className={`p-4 rounded-xl border bg-slate-950/60 ${
                      isOverloaded ? 'border-amber-600/70 bg-amber-950/20' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-xs sm:text-sm">{nurse.name}</span>
                          <span className="text-[11px] text-teal-400 font-mono">[{nurse.unit}]</span>
                        </div>
                        <span className="text-[11px] text-slate-400">{nurse.role} · {nurse.shift}</span>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-mono font-bold ${isOverloaded ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {count} / {nurse.maxCapacity} Patients
                        </span>
                        <div className="text-[10px] text-slate-500">
                          {isOverloaded ? 'Ratio Exceeded' : 'Ratio Safe'}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-3">
                      <div
                        className={`h-full transition-all ${
                          isOverloaded ? 'bg-amber-500' : 'bg-teal-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    {/* Patients Assigned */}
                    <div className="mt-3 pt-2 border-t border-slate-900 text-xs text-slate-400 flex flex-wrap gap-1.5 items-center">
                      <span className="text-slate-500">Beds:</span>
                      {assigned.length === 0 ? (
                        <span className="text-slate-600 italic">None assigned</span>
                      ) : (
                        assigned.map(p => (
                          <span key={p.id} className="font-mono text-slate-300 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                            {p.bedId} ({p.name.split(' ')[0]})
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attending Physicians */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Attending Physicians on Duty
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {physicians.map(doc => {
                const assigned = patients.filter(p => p.primaryPhysician.includes(doc.name.split(',')[0]));
                return (
                  <div key={doc.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <span className="font-semibold text-white text-xs block">{doc.name}</span>
                    <span className="text-[11px] text-slate-400">{doc.unit} · {doc.role}</span>
                    <div className="mt-2 text-xs text-slate-300 font-mono">
                      {assigned.length} Patients Under Primary Care
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
