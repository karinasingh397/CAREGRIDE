import React from 'react';
import { Patient } from '../types/caregrid';
import { Heart, Activity, AlertTriangle, ChevronRight, FileText, Pill } from 'lucide-react';

interface PatientTableViewProps {
  patients: Patient[];
  onSelect: (patient: Patient) => void;
  onQuickAdministerMeds: (patient: Patient) => void;
  onOpenSbar: (patient: Patient) => void;
}

export const PatientTableView: React.FC<PatientTableViewProps> = ({
  patients,
  onSelect,
  onQuickAdministerMeds,
  onOpenSbar,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
            <tr>
              <th className="px-4 py-3">Bed / Unit</th>
              <th className="px-4 py-3">Patient Name / Demographics</th>
              <th className="px-4 py-3">Acuity</th>
              <th className="px-4 py-3">Primary Diagnosis</th>
              <th className="px-4 py-3">Telemetry Vitals (HR · BP · SpO2 · RR)</th>
              <th className="px-4 py-3">Due Meds / STAT</th>
              <th className="px-4 py-3">Care Team</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {patients.map(p => {
              const dueMeds = p.medications.filter(m => m.status === 'due');
              const statLabs = p.labs.filter(l => l.priority === 'STAT' && l.status !== 'resulted');
              const isCritical = p.acuity === 'critical';

              return (
                <tr
                  key={p.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isCritical ? 'bg-rose-950/10' : ''
                  }`}
                >
                  {/* Bed & Unit */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-mono font-bold text-white text-sm">{p.bedId}</div>
                    <span className="text-[11px] text-slate-500">{p.unit}</span>
                  </td>

                  {/* Patient Name */}
                  <td className="px-4 py-3">
                    <div
                      onClick={() => onSelect(p)}
                      className="font-semibold text-slate-100 hover:text-teal-300 cursor-pointer flex items-center gap-1"
                    >
                      {p.name}
                      <ChevronRight className="h-3 w-3 text-slate-500" />
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono">{p.mrn}</span>
                      <span>·</span>
                      <span>{p.age}y / {p.gender}</span>
                      <span>·</span>
                      <span className="text-slate-300 font-medium">{p.codeStatus}</span>
                    </div>
                  </td>

                  {/* Acuity */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`text-xs capitalize font-medium ${
                        p.acuity === 'critical'
                          ? 'text-rose-400 font-bold'
                          : p.acuity === 'high'
                          ? 'text-amber-400 font-semibold'
                          : p.acuity === 'moderate'
                          ? 'text-sky-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      L{p.acuityScore} · {p.acuity}
                    </span>
                    {p.fallRisk && (
                      <div className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
                        <AlertTriangle className="h-2.5 w-2.5" /> Fall Risk
                      </div>
                    )}
                  </td>

                  {/* Diagnosis */}
                  <td className="px-4 py-3 max-w-xs">
                    <p className="truncate text-slate-300 italic" title={p.diagnosis}>
                      {p.diagnosis}
                    </p>
                  </td>

                  {/* Vitals */}
                  <td className="px-4 py-3 whitespace-nowrap font-mono tabular-nums">
                    <div className="flex items-center gap-3">
                      <span className={p.vitals.hr > 115 || p.vitals.hr < 55 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                        {p.vitals.hr} bpm
                      </span>
                      <span>·</span>
                      <span className={p.vitals.bpSys > 160 || p.vitals.bpSys < 90 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                        {p.vitals.bpSys}/{p.vitals.bpDia}
                      </span>
                      <span>·</span>
                      <span className={p.vitals.spo2 < 93 ? 'text-rose-400 font-bold' : 'text-teal-300'}>
                        {p.vitals.spo2}%
                      </span>
                      <span>·</span>
                      <span>{p.vitals.respRate} /min</span>
                    </div>
                  </td>

                  {/* Due Meds / STAT Labs */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {dueMeds.length > 0 ? (
                        <span className="text-teal-300 font-medium">
                          {dueMeds.length} Meds
                        </span>
                      ) : (
                        <span className="text-slate-500">None due</span>
                      )}
                      {statLabs.length > 0 && (
                        <span className="text-rose-400 font-bold">
                          · {statLabs.length} STAT
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Care Team */}
                  <td className="px-4 py-3 whitespace-nowrap text-[11px] text-slate-400">
                    <div>RN: {p.assignedNurse.split(',')[0]}</div>
                    <div className="text-slate-500">MD: {p.primaryPhysician.split(',')[0]}</div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {dueMeds.length > 0 && (
                        <button
                          onClick={() => onQuickAdministerMeds(p)}
                          className="px-2.5 py-1 text-xs font-medium text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded"
                          title="Administer eMAR Meds"
                        >
                          eMAR
                        </button>
                      )}
                      <button
                        onClick={() => onOpenSbar(p)}
                        className="px-2 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 rounded"
                        title="SBAR Handover"
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onSelect(p)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white rounded transition-colors"
                      >
                        Chart
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
