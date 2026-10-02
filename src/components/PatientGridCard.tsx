import React from 'react';
import { Patient } from '../types/caregrid';
import { 
  Heart, 
  Wind, 
  Thermometer, 
  Activity, 
  AlertTriangle, 
  Clock, 
  Pill, 
  TestTube2, 
  FileText,
  User,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface PatientGridCardProps {
  patient: Patient;
  onSelect: (patient: Patient) => void;
  onQuickAdministerMeds: (patient: Patient) => void;
  onOpenSbar: (patient: Patient) => void;
}

export const PatientGridCard: React.FC<PatientGridCardProps> = ({
  patient,
  onSelect,
  onQuickAdministerMeds,
  onOpenSbar,
}) => {
  const { vitals } = patient;

  // Vitals threshold checks
  const isHrCritical = vitals.hr < 50 || vitals.hr > 120;
  const isBpCritical = vitals.bpSys < 90 || vitals.bpSys > 170 || vitals.bpDia > 105;
  const isSpo2Critical = vitals.spo2 < 92;
  const isRespCritical = vitals.respRate < 10 || vitals.respRate > 28;
  const isTempCritical = vitals.tempF > 101.5 || vitals.tempF < 96.0;

  const hasCriticalVital = isHrCritical || isBpCritical || isSpo2Critical || isRespCritical || isTempCritical;

  const dueMeds = patient.medications.filter(m => m.status === 'due');
  const statLabs = patient.labs.filter(l => l.priority === 'STAT' && l.status !== 'resulted');
  const pendingTasks = patient.careTasks.filter(t => !t.completed);

  // Border & accent by acuity
  const getCardBorder = () => {
    if (patient.acuity === 'critical') return 'border-rose-700/80 bg-slate-900/90 hover:border-rose-500';
    if (patient.acuity === 'high') return 'border-amber-700/60 bg-slate-900/90 hover:border-amber-500';
    if (patient.acuity === 'moderate') return 'border-sky-800/60 bg-slate-900/90 hover:border-sky-600';
    return 'border-slate-800 bg-slate-900/80 hover:border-slate-700';
  };

  const getAcuityColor = () => {
    if (patient.acuity === 'critical') return 'text-rose-400 font-semibold';
    if (patient.acuity === 'high') return 'text-amber-400 font-medium';
    if (patient.acuity === 'moderate') return 'text-sky-400';
    return 'text-emerald-400';
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-lg ${getCardBorder()}`}
    >
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-start justify-between gap-2">
          {/* Bed & Acuity */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-white tracking-tight">
                {patient.bedId}
              </span>
              <span className="text-xs text-slate-600">/</span>
              <span className="text-xs text-slate-400 font-medium">{patient.unit}</span>
              <span className="text-xs text-slate-600">·</span>
              <span className={`text-xs uppercase tracking-wider ${getAcuityColor()}`}>
                Level {patient.acuityScore} ({patient.acuity})
              </span>
            </div>
            {/* Patient Name & Demographics */}
            <h3 
              onClick={() => onSelect(patient)}
              className="text-base font-semibold text-slate-100 hover:text-teal-300 cursor-pointer mt-1 flex items-center gap-1.5 transition-colors"
            >
              {patient.name}
              <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />
            </h3>
            {/* Metadata (Clean typography, no pill enclosures) */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span className="font-mono">{patient.mrn}</span>
              <span aria-hidden="true">·</span>
              <span>{patient.age}y / {patient.gender}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300 font-medium">{patient.codeStatus}</span>
            </div>
          </div>

          {/* Isolation & Risk Flags */}
          <div className="flex flex-col items-end gap-1">
            {patient.isolation !== 'None' && (
              <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5" />
                {patient.isolation} Iso
              </span>
            )}
            {patient.fallRisk && (
              <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Fall Risk
              </span>
            )}
          </div>
        </div>

        {/* Diagnosis */}
        <p className="text-xs text-slate-300 mt-2.5 line-clamp-1 italic">
          {patient.diagnosis}
        </p>

        {/* Primary Care Team */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <User className="h-3 w-3 text-slate-500 shrink-0" />
            <span className="truncate">RN: {patient.assignedNurse.split(',')[0]}</span>
          </div>
          <span className="text-[11px] text-slate-500 truncate">
            {patient.primaryPhysician.split(',')[0]}
          </span>
        </div>
      </div>

      {/* Vitals Telemetry Grid (Tabular Numerals & High Contrast) */}
      <div className={`p-4 bg-slate-950/60 border-b border-slate-800/80 ${hasCriticalVital ? 'bg-rose-950/20' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-medium">
            <Activity className="h-3.5 w-3.5 text-teal-400" />
            Live Telemetry
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {vitals.timestamp}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 text-center">
          {/* Heart Rate */}
          <div className={`p-2 rounded-lg border ${isHrCritical ? 'bg-rose-950/40 border-rose-700/60' : 'bg-slate-900/80 border-slate-800'}`}>
            <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Heart className={`h-3 w-3 ${isHrCritical ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
              HR
            </span>
            <div className={`text-base font-bold font-mono tabular-nums mt-0.5 ${isHrCritical ? 'text-rose-400' : 'text-slate-100'}`}>
              {vitals.hr}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">bpm</span>
          </div>

          {/* Blood Pressure */}
          <div className={`p-2 rounded-lg border ${isBpCritical ? 'bg-rose-950/40 border-rose-700/60' : 'bg-slate-900/80 border-slate-800'}`}>
            <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              BP
            </span>
            <div className={`text-xs sm:text-sm font-bold font-mono tabular-nums mt-1 ${isBpCritical ? 'text-rose-400' : 'text-slate-100'}`}>
              {vitals.bpSys}/{vitals.bpDia}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">mmHg</span>
          </div>

          {/* SpO2 */}
          <div className={`p-2 rounded-lg border ${isSpo2Critical ? 'bg-rose-950/40 border-rose-700/60' : 'bg-slate-900/80 border-slate-800'}`}>
            <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              SpO2
            </span>
            <div className={`text-base font-bold font-mono tabular-nums mt-0.5 ${isSpo2Critical ? 'text-rose-400' : 'text-teal-400'}`}>
              {vitals.spo2}%
            </div>
            <span className="text-[10px] text-slate-500 font-mono">O2 Sat</span>
          </div>

          {/* Resp Rate */}
          <div className={`p-2 rounded-lg border ${isRespCritical ? 'bg-rose-950/40 border-rose-700/60' : 'bg-slate-900/80 border-slate-800'}`}>
            <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Wind className="h-3 w-3 text-slate-500" />
              RR
            </span>
            <div className={`text-base font-bold font-mono tabular-nums mt-0.5 ${isRespCritical ? 'text-rose-400' : 'text-slate-100'}`}>
              {vitals.respRate}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">/min</span>
          </div>

          {/* Temp */}
          <div className={`p-2 rounded-lg border ${isTempCritical ? 'bg-rose-950/40 border-rose-700/60' : 'bg-slate-900/80 border-slate-800'}`}>
            <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Thermometer className="h-3 w-3 text-slate-500" />
              Temp
            </span>
            <div className={`text-sm font-bold font-mono tabular-nums mt-1 ${isTempCritical ? 'text-rose-400' : 'text-slate-100'}`}>
              {vitals.tempF}°
            </div>
            <span className="text-[10px] text-slate-500 font-mono">°F</span>
          </div>
        </div>
      </div>

      {/* Orders & Care Bundle Progress Bar */}
      <div className="px-4 py-3 bg-slate-900/90 text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-3">
            {/* Meds Due */}
            <span className={`inline-flex items-center gap-1 ${dueMeds.length > 0 ? 'text-teal-300 font-medium' : 'text-slate-500'}`}>
              <Pill className="h-3.5 w-3.5" />
              {dueMeds.length} Med{dueMeds.length !== 1 ? 's' : ''} Due
            </span>
            {/* STAT Labs */}
            {statLabs.length > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-300 font-medium">
                <TestTube2 className="h-3.5 w-3.5" />
                {statLabs.length} STAT Lab
              </span>
            )}
          </div>
          <span className="text-slate-500 font-mono">
            {pendingTasks.length} task{pendingTasks.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2">
        <button
          onClick={() => onSelect(patient)}
          className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          <span>Open Chart</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        {dueMeds.length > 0 && (
          <button
            onClick={() => onQuickAdministerMeds(patient)}
            className="py-1.5 px-3 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
            title="Administer scheduled medications"
          >
            <Pill className="h-3.5 w-3.5" />
            <span>eMAR</span>
          </button>
        )}

        <button
          onClick={() => onOpenSbar(patient)}
          className="py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs rounded-lg transition-colors"
          title="Generate SBAR Handover"
        >
          <FileText className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
