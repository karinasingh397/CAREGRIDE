import React, { useState } from 'react';
import { Patient } from '../types/caregrid';
import { X, ShieldAlert, HeartPulse, CheckSquare, Clock, AlertTriangle, Radio } from 'lucide-react';

interface EmergencyAlertModalProps {
  patients: Patient[];
  onClose: () => void;
  onTriggerCode: (patientId: string, codeType: 'Code Blue' | 'Rapid Response') => void;
}

export const EmergencyAlertModal: React.FC<EmergencyAlertModalProps> = ({
  patients,
  onClose,
  onTriggerCode,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [codeType, setCodeType] = useState<'Code Blue' | 'Rapid Response'>('Rapid Response');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Rapid Response protocol checklist items
  const [checklist, setChecklist] = useState<{ id: string; label: string; done: boolean }[]>([
    { id: '1', label: 'Call Rapid Response / Code Blue Team & announce unit/room', done: true },
    { id: '2', label: 'Bring Crash Cart & Defibrillator pads to bedside', done: true },
    { id: '3', label: 'Assign Team Leader (Physician) & Recorder (RN)', done: false },
    { id: '4', label: 'Secure Bag-Valve-Mask ventilation & High-Flow O2', done: false },
    { id: '5', label: 'Establish second large-bore IV access (18G or Central)', done: false },
    { id: '6', label: 'Check immediate point-of-care blood glucose (Accu-Chek)', done: false },
    { id: '7', label: 'Draw STAT Vitals, ABG, and Troponin labs', done: false },
  ]);

  const toggleCheck = (id: string) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleStartSim = () => {
    setIsTimerRunning(true);
    onTriggerCode(selectedPatientId, codeType);
  };

  const patient = patients.find(p => p.id === selectedPatientId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-rose-800/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-rose-900/60 bg-rose-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-rose-600/20 border border-rose-600/40 flex items-center justify-center text-rose-400">
              <ShieldAlert className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Emergency Response Protocol</h3>
              <p className="text-xs text-rose-300">Rapid Response Team (RRT) & ACLS Code Blue Command</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Target Patient Selector */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Select Patient in Distress</span>
              <span>Hospital Bed Allocation</span>
            </div>
            <select
              value={selectedPatientId}
              onChange={e => setSelectedPatientId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.bedId} · {p.name} ({p.unit} - {p.diagnosis}) - Current HR: {p.vitals.hr} | BP: {p.vitals.bpSys}/{p.vitals.bpDia}
                </option>
              ))}
            </select>

            {patient && (
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span className="text-slate-300 font-medium">Code Status: {patient.codeStatus}</span>
                <span className="font-mono text-rose-400">SpO2: {patient.vitals.spo2}% · HR: {patient.vitals.hr} bpm</span>
              </div>
            )}
          </div>

          {/* Code Type Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setCodeType('Rapid Response')}
              className={`p-3 rounded-xl border text-left transition-all ${
                codeType === 'Rapid Response'
                  ? 'bg-amber-950/40 border-amber-500/80 text-amber-200 ring-1 ring-amber-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-sm">
                <HeartPulse className="h-4 w-4 text-amber-400" />
                <span>Rapid Response</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Acute clinical deterioration, telemetry rhythm change, or respiratory failure before cardiac arrest.
              </p>
            </button>

            <button
              onClick={() => setCodeType('Code Blue')}
              className={`p-3 rounded-xl border text-left transition-all ${
                codeType === 'Code Blue'
                  ? 'bg-rose-950/50 border-rose-500 text-rose-100 ring-1 ring-rose-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-sm">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                <span>Code Blue (ACLS)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Full cardiopulmonary arrest, loss of pulse, apnea, or unresponsiveness requiring ACLS.
              </p>
            </button>
          </div>

          {/* Action Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">ACLS / RRT Protocol Checklist</span>
              <span>{checklist.filter(c => c.done).length}/{checklist.length} Completed</span>
            </div>

            <div className="border border-slate-800 rounded-xl bg-slate-950/60 divide-y divide-slate-800/80">
              {checklist.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className="p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-900/40 transition-colors"
                >
                  <div
                    className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                      item.done
                        ? 'bg-rose-600 border-rose-600 text-white'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {item.done && <CheckSquare className="h-3 w-3" />}
                  </div>
                  <span className={`text-xs ${item.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Trigger Alert Button */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-rose-400 animate-ping" />
              Notifies Unit Staff & Overhead Paging
            </span>

            <button
              onClick={handleStartSim}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Broadcast {codeType} for {patient?.bedId || 'Unit'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
