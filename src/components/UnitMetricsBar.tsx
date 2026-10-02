import React from 'react';
import { Patient, BedLocation, HospitalUnit, StaffMember } from '../types/caregrid';
import { Bed, AlertCircle, Clock, CheckCircle, TrendingUp, HeartPulse } from 'lucide-react';

interface UnitMetricsBarProps {
  currentUnit: HospitalUnit;
  patients: Patient[];
  beds: BedLocation[];
  staff: StaffMember[];
}

export const UnitMetricsBar: React.FC<UnitMetricsBarProps> = ({
  currentUnit,
  patients,
  beds,
  staff,
}) => {
  const filteredBeds = currentUnit === 'ALL' ? beds : beds.filter(b => b.unit === currentUnit);
  const filteredPatients = currentUnit === 'ALL' ? patients : patients.filter(p => p.unit === currentUnit);

  const totalBeds = filteredBeds.length;
  const occupiedBeds = filteredPatients.length;
  const availableBeds = filteredBeds.filter(b => b.status === 'available').length;
  const cleaningBeds = filteredBeds.filter(b => b.status === 'cleaning').length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const criticalCount = filteredPatients.filter(p => p.acuity === 'critical').length;
  const highAcuityCount = filteredPatients.filter(p => p.acuity === 'high').length;

  const statOrdersCount = filteredPatients.reduce(
    (acc, p) => acc + p.labs.filter(l => l.priority === 'STAT' && l.status !== 'resulted').length,
    0
  );

  const pendingDischarges = filteredPatients.filter(
    p => p.dischargeMilestones.clinicalClearance || p.pendingTransfer
  ).length;

  // Active RN ratio check
  const activeNurses = staff.filter(s => 
    s.role.includes('Nurse') && (currentUnit === 'ALL' || s.unit === currentUnit)
  );
  const totalNurseCapacity = activeNurses.reduce((sum, n) => sum + n.maxCapacity, 0);
  const isRatioStrained = occupiedBeds > totalNurseCapacity && totalNurseCapacity > 0;

  return (
    <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
        {/* Metric 1: Census & Occupancy */}
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <Bed className="h-3.5 w-3.5 text-slate-500" />
            Unit Census
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono tabular-nums text-white">
              {occupiedBeds}/{totalBeds}
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({occupancyRate}%)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5">
            {availableBeds} free · {cleaningBeds} turnover
          </span>
        </div>

        {/* Metric 2: Critical Acuity */}
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
            Critical Acuity
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono tabular-nums text-rose-400">
              {criticalCount}
            </span>
            <span className="text-xs text-slate-400">
              + {highAcuityCount} Emergent
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5">
            Continuous telemetry active
          </span>
        </div>

        {/* Metric 3: Staffing Ratio */}
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <HeartPulse className="h-3.5 w-3.5 text-teal-400" />
            Nurse Ratio Status
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-xl font-bold font-mono tabular-nums ${isRatioStrained ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isRatioStrained ? 'Strained' : 'Compliant'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5">
            {activeNurses.length} RNs on shift
          </span>
        </div>

        {/* Metric 4: STAT Labs & Diagnostics */}
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            STAT Orders Pending
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono tabular-nums text-amber-300">
              {statOrdersCount}
            </span>
            <span className="text-xs text-slate-400">active</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5">
            High-sensitivity cardiac / ABG
          </span>
        </div>

        {/* Metric 5: Discharges / Transfers */}
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-sky-400" />
            Pending Transitions
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono tabular-nums text-sky-300">
              {pendingDischarges}
            </span>
            <span className="text-xs text-slate-400">cases</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5">
            Discharges & floor steps
          </span>
        </div>

        {/* Metric 6: Care Plan Progress */}
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
            Unit Efficiency
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono tabular-nums text-indigo-300">
              96.4%
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5">
            Care bundle adherence
          </span>
        </div>
      </div>
    </div>
  );
};
