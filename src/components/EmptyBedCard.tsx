import React from 'react';
import { BedLocation } from '../types/caregrid';
import { Bed, Sparkles, UserPlus, Lock } from 'lucide-react';

interface EmptyBedCardProps {
  bed: BedLocation;
  onAdmitToBed: (bed: BedLocation) => void;
  onMarkCleaned: (bedId: string) => void;
}

export const EmptyBedCard: React.FC<EmptyBedCardProps> = ({
  bed,
  onAdmitToBed,
  onMarkCleaned,
}) => {
  return (
    <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-4 flex flex-col justify-between h-full min-h-[260px] hover:border-slate-700 transition-colors">
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-300">{bed.bedId}</span>
            <span>·</span>
            <span>{bed.unit}</span>
          </div>
          <span className="capitalize text-slate-400">
            {bed.status === 'cleaning' && 'Turnover / Cleaning'}
            {bed.status === 'available' && 'Ready for Admission'}
            {bed.status === 'reserved' && 'Bed Reserved'}
          </span>
        </div>

        <div className="my-8 flex flex-col items-center justify-center text-center">
          <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-600 mb-2">
            {bed.status === 'cleaning' && <Sparkles className="h-5 w-5 text-amber-500/80 animate-spin" />}
            {bed.status === 'available' && <Bed className="h-5 w-5 text-teal-400" />}
            {bed.status === 'reserved' && <Lock className="h-5 w-5 text-slate-500" />}
          </div>
          <p className="text-sm font-medium text-slate-300">
            {bed.status === 'cleaning' && 'Environmental Services Cleaning'}
            {bed.status === 'available' && 'Bed Available & Sanitized'}
            {bed.status === 'reserved' && 'Inbound Transfer Reserved'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {bed.status === 'cleaning' && 'Terminal disinfection protocol in progress'}
            {bed.status === 'available' && 'Awaiting triage intake or emergency transfer'}
            {bed.status === 'reserved' && 'Held for scheduled surgical admission'}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-900 flex items-center gap-2">
        {bed.status === 'cleaning' ? (
          <button
            onClick={() => onMarkCleaned(bed.bedId)}
            className="w-full py-2 px-3 text-xs font-medium text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Mark Cleaned & Ready</span>
          </button>
        ) : (
          <button
            onClick={() => onAdmitToBed(bed)}
            className="w-full py-2 px-3 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Admit Patient Here</span>
          </button>
        )}
      </div>
    </div>
  );
};
