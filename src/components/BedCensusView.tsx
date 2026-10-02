import React from 'react';
import { BedLocation, HospitalUnit, Patient } from '../types/caregrid';
import { Bed, UserPlus, Sparkles, Activity } from 'lucide-react';

interface BedCensusViewProps {
  beds: BedLocation[];
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onAdmitToBed: (bed: BedLocation) => void;
  onMarkCleaned: (bedId: string) => void;
}

const UNITS: Exclude<HospitalUnit, 'ALL'>[] = [
  'ICU',
  'ED',
  'CARDIOLOGY',
  'MED_SURG',
  'PEDIATRICS',
  'POST_OP',
];

export const BedCensusView: React.FC<BedCensusViewProps> = ({
  beds,
  patients,
  onSelectPatient,
  onAdmitToBed,
  onMarkCleaned,
}) => {
  return (
    <div className="space-y-6">
      {UNITS.map(unit => {
        const unitBeds = beds.filter(b => b.unit === unit);
        if (unitBeds.length === 0) return null;

        const occupiedCount = unitBeds.filter(b => b.status === 'occupied').length;
        const total = unitBeds.length;

        return (
          <div key={unit} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            {/* Unit Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">{unit} Unit Floor Matrix</h3>
                <span className="text-xs text-slate-400">
                  {unit === 'ICU' && 'Intensive Care Unit (1:2 Ratio Target)'}
                  {unit === 'ED' && 'Emergency Department & Trauma Bays'}
                  {unit === 'CARDIOLOGY' && 'Step-Down & Telemetry Floor'}
                  {unit === 'MED_SURG' && 'Medical Surgical Acute Care'}
                  {unit === 'PEDIATRICS' && 'Pediatric Acute Floor'}
                  {unit === 'POST_OP' && 'Post-Anesthesia Care Unit (PACU)'}
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm font-bold text-teal-400">
                  {occupiedCount} / {total} Beds Occupied
                </span>
                <span className="text-xs text-slate-500 block">
                  {Math.round((occupiedCount / total) * 100)}% Capacity
                </span>
              </div>
            </div>

            {/* Beds Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {unitBeds.map(bed => {
                const patient = patients.find(p => p.bedId === bed.bedId);

                if (patient) {
                  const getAcuityColor = () => {
                    if (patient.acuity === 'critical') return 'border-rose-700/80 bg-rose-950/20';
                    if (patient.acuity === 'high') return 'border-amber-700/60 bg-amber-950/20';
                    if (patient.acuity === 'moderate') return 'border-sky-800/60 bg-sky-950/20';
                    return 'border-slate-800 bg-slate-950/60';
                  };

                  return (
                    <div
                      key={bed.bedId}
                      onClick={() => onSelectPatient(patient)}
                      className={`p-4 rounded-xl border cursor-pointer hover:border-teal-500/80 transition-all ${getAcuityColor()}`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-white text-sm">{bed.bedId}</span>
                        <span className="font-mono text-[11px] text-teal-300">
                          HR {patient.vitals.hr} · SpO2 {patient.vitals.spo2}%
                        </span>
                      </div>

                      <div className="mt-2">
                        <span className="font-semibold text-slate-100 text-xs sm:text-sm block truncate">
                          {patient.name}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                          {patient.diagnosis}
                        </span>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span>RN: {patient.assignedNurse.split(' ')[0]}</span>
                        <span className="text-teal-400 font-medium flex items-center gap-1">
                          <Activity className="h-3 w-3" /> View Chart
                        </span>
                      </div>
                    </div>
                  );
                }

                // Empty / Cleaning bed
                return (
                  <div
                    key={bed.bedId}
                    className="p-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-slate-400">{bed.bedId}</span>
                        <span className="text-[11px] text-slate-500 capitalize">{bed.status}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        {bed.status === 'cleaning' ? 'Cleaning in progress' : 'Ready for admission'}
                      </p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-900">
                      {bed.status === 'cleaning' ? (
                        <button
                          onClick={() => onMarkCleaned(bed.bedId)}
                          className="w-full py-1.5 text-xs text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded flex items-center justify-center gap-1"
                        >
                          <Sparkles className="h-3 w-3" /> Ready
                        </button>
                      ) : (
                        <button
                          onClick={() => onAdmitToBed(bed)}
                          className="w-full py-1.5 text-xs text-slate-950 font-semibold bg-teal-400 hover:bg-teal-300 rounded flex items-center justify-center gap-1"
                        >
                          <UserPlus className="h-3 w-3" /> Admit
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
