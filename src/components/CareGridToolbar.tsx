import React from 'react';
import { AcuitySeverity, IsolationType } from '../types/caregrid';
import { Search, LayoutGrid, List, SlidersHorizontal, AlertTriangle, Pill } from 'lucide-react';

interface CareGridToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedAcuity: AcuitySeverity | 'ALL';
  onAcuityChange: (acuity: AcuitySeverity | 'ALL') => void;
  selectedIsolation: IsolationType | 'ALL';
  onIsolationChange: (isolation: IsolationType | 'ALL') => void;
  fallRiskOnly: boolean;
  onToggleFallRisk: () => void;
  medsDueOnly: boolean;
  onToggleMedsDue: () => void;
  viewMode: 'grid' | 'table' | 'census';
  onViewModeChange: (mode: 'grid' | 'table' | 'census') => void;
  totalFilteredCount: number;
}

export const CareGridToolbar: React.FC<CareGridToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedAcuity,
  onAcuityChange,
  selectedIsolation,
  onIsolationChange,
  fallRiskOnly,
  onToggleFallRisk,
  medsDueOnly,
  onToggleMedsDue,
  viewMode,
  onViewModeChange,
  totalFilteredCount,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search & Active Patient Counter */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Search by Patient Name, MRN, Bed ID, Diagnosis..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono tabular-nums whitespace-nowrap">
            {totalFilteredCount} matching
          </span>
        </div>

        {/* Filters & View Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Acuity Filter Segmented Control */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg">
            {(['ALL', 'critical', 'high', 'moderate', 'stable'] as const).map(level => {
              const active = selectedAcuity === level;
              return (
                <button
                  key={level}
                  onClick={() => onAcuityChange(level)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                    active
                      ? 'bg-slate-800 text-teal-300 font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {level === 'ALL' ? 'All Acuity' : level}
                </button>
              );
            })}
          </div>

          {/* Isolation Filter */}
          <div className="relative">
            <select
              value={selectedIsolation}
              onChange={e => onIsolationChange(e.target.value as IsolationType | 'ALL')}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="ALL">Isolation: All</option>
              <option value="None">Standard / None</option>
              <option value="Contact">Contact Isolation</option>
              <option value="Droplet">Droplet Isolation</option>
              <option value="Airborne">Airborne Isolation</option>
            </select>
          </div>

          {/* Quick Toggle: Fall Risk */}
          <button
            onClick={onToggleFallRisk}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              fallRiskOnly
                ? 'bg-amber-950/40 border-amber-600/70 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            <span>Fall Risk</span>
          </button>

          {/* Quick Toggle: Meds Due */}
          <button
            onClick={onToggleMedsDue}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              medsDueOnly
                ? 'bg-teal-950/40 border-teal-600/70 text-teal-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Pill className="h-3 w-3" />
            <span>Meds Due</span>
          </button>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-slate-800 text-teal-300'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Bed Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-slate-800 text-teal-300'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Clinical Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('census')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'census'
                  ? 'bg-slate-800 text-teal-300'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Unit Census & Bed Map"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
