import React, { useState, useEffect } from 'react';
import { HospitalUnit, TelemetryAlert } from '../types/caregrid';
import { 
  Activity, 
  Bell, 
  ShieldAlert, 
  UserPlus, 
  Users, 
  FileText, 
  GitBranch, 
  CheckCircle2, 
  AlertTriangle,
  Radio
} from 'lucide-react';

interface HeaderProps {
  currentUnit: HospitalUnit;
  onSelectUnit: (unit: HospitalUnit) => void;
  alerts: TelemetryAlert[];
  onAcknowledgeAlert: (id: string) => void;
  onOpenTriageModal: () => void;
  onOpenCodeBlueModal: () => void;
  onOpenStaffModal: () => void;
  onOpenSbarModal: () => void;
  onOpenGitModal: () => void;
  isLiveTelemetry: boolean;
  onToggleTelemetry: () => void;
}

const UNIT_TABS: { id: HospitalUnit; label: string; count?: number }[] = [
  { id: 'ALL', label: 'All Hospital Units' },
  { id: 'ICU', label: 'ICU' },
  { id: 'ED', label: 'Emergency (ED)' },
  { id: 'CARDIOLOGY', label: 'Cardiology / Telemetry' },
  { id: 'MED_SURG', label: 'Med-Surg' },
  { id: 'PEDIATRICS', label: 'Pediatrics' },
  { id: 'POST_OP', label: 'PACU / Post-Op' },
];

export const Header: React.FC<HeaderProps> = ({
  currentUnit,
  onSelectUnit,
  alerts,
  onAcknowledgeAlert,
  onOpenTriageModal,
  onOpenCodeBlueModal,
  onOpenStaffModal,
  onOpenSbarModal,
  onOpenGitModal,
  isLiveTelemetry,
  onToggleTelemetry,
}) => {
  const [time, setTime] = useState<string>('');
  const [showAlertDropdown, setShowAlertDropdown] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & System Status */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">CareGrid</span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs font-medium text-slate-400">Clinical Workflow & Telemetry</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono tabular-nums text-slate-300">{time || '00:00:00'}</span>
              <span>·</span>
              <button 
                onClick={onToggleTelemetry}
                className="inline-flex items-center gap-1.5 text-xs hover:text-teal-300 transition-colors focus:outline-none"
                title="Toggle live vital telemetry simulator"
              >
                <Radio className={`h-3 w-3 ${isLiveTelemetry ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                <span className={isLiveTelemetry ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                  {isLiveTelemetry ? 'Telemetry Active' : 'Telemetry Paused'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Git Repo Setup & Status Button */}
          <button
            onClick={onOpenGitModal}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
            title="GitHub Repository & Push Instructions"
          >
            <GitBranch className="h-3.5 w-3.5 text-slate-400" />
            <span>CareGrid Repo</span>
          </button>

          {/* SBAR Handover Button */}
          <button
            onClick={onOpenSbarModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
          >
            <FileText className="h-3.5 w-3.5 text-sky-400" />
            <span className="hidden sm:inline">SBAR</span> Handover
          </button>

          {/* Staff Roster & Ratios Button */}
          <button
            onClick={onOpenStaffModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
          >
            <Users className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Staff</span> Roster
          </button>

          {/* Rapid Response Code Blue Trigger */}
          <button
            onClick={onOpenCodeBlueModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/50 rounded-lg transition-all"
            title="Simulate / Trigger Rapid Response or Code Blue"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
            <span>Rapid Response</span>
          </button>

          {/* Admit / Triage Patient */}
          <button
            onClick={onOpenTriageModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors shadow-sm"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Triage & Admit</span>
          </button>

          {/* Alerts Bell */}
          <div className="relative">
            <button
              onClick={() => setShowAlertDropdown(!showAlertDropdown)}
              className="relative p-2 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg transition-colors"
              title="Clinical Telemetry Alerts"
            >
              <Bell className="h-4 w-4" />
              {unacknowledgedAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                  {unacknowledgedAlerts.length}
                </span>
              )}
            </button>

            {/* Alerts Dropdown Drawer */}
            {showAlertDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">Clinical Telemetry Alerts</span>
                  <span>{unacknowledgedAlerts.length} Active</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 my-1">
                  {alerts.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      All telemetry thresholds normal. No active alerts.
                    </div>
                  ) : (
                    alerts.slice(0, 8).map(alert => (
                      <div
                        key={alert.id}
                        className={`p-2.5 transition-colors ${
                          alert.acknowledged ? 'opacity-50' : 'bg-slate-950/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {alert.severity === 'critical' ? (
                              <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                            ) : (
                              <Activity className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            )}
                            <span className="text-xs font-semibold text-slate-200">
                              {alert.bedId} · {alert.patientName}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-500">{alert.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-snug">{alert.message}</p>
                        {!alert.acknowledged && (
                          <div className="mt-2 flex justify-end">
                            <button
                              onClick={() => onAcknowledgeAlert(alert.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-400 hover:text-teal-300"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Acknowledge
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unit Filter Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none" aria-label="Hospital Units">
          {UNIT_TABS.map(tab => {
            const isActive = currentUnit === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectUnit(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-teal-300 font-semibold shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
