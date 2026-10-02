import React, { useState } from 'react';
import { Patient } from '../types/caregrid';
import { X, FileText, Copy, Check, Download } from 'lucide-react';

interface SbarExportModalProps {
  patients: Patient[];
  initialPatient?: Patient | null;
  onClose: () => void;
}

export const SbarExportModal: React.FC<SbarExportModalProps> = ({
  patients,
  initialPatient,
  onClose,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialPatient?.id || patients[0]?.id || ''
  );
  const [copied, setCopied] = useState(false);

  const patient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const generateSbarText = (p: Patient) => {
    if (!p) return '';
    const pendingLabs = p.labs.filter(l => l.status !== 'resulted');
    const dueMeds = p.medications.filter(m => m.status === 'due');

    return `==================================================================
CAREGRID CLINICAL SBAR HANDOVER REPORT
Generated: ${new Date().toLocaleString()}
==================================================================

[S] SITUATION
Patient: ${p.name} (MRN: ${p.mrn})
Bed: ${p.bedId} | Unit: ${p.unit}
Age/Gender: ${p.age}y / ${p.gender}
Code Status: ${p.codeStatus}
Acuity: Level ${p.acuityScore} (${p.acuity.toUpperCase()})
Isolation: ${p.isolation}
Fall Risk: ${p.fallRisk ? 'YES (High Risk)' : 'Standard'}
Attending MD: ${p.primaryPhysician}
Primary RN: ${p.assignedNurse}

[B] BACKGROUND
Admit Date: ${p.admitDate}
Primary Diagnosis: ${p.diagnosis}
Allergies: ${p.allergies.join(', ') || 'NKDA'}
Clinical Summary:
${p.notes[0]?.body || 'Patient hospitalized with acute exacerbation. Hemodynamics stabilized.'}

[A] ASSESSMENT
Latest Vitals (${p.vitals.timestamp}):
· Heart Rate: ${p.vitals.hr} bpm
· Blood Pressure: ${p.vitals.bpSys}/${p.vitals.bpDia} mmHg
· SpO2: ${p.vitals.spo2}%
· Resp Rate: ${p.vitals.respRate} /min
· Temp: ${p.vitals.tempF} °F
Active Orders & Due Meds:
${dueMeds.length > 0 ? dueMeds.map(m => `· [DUE] ${m.name} (${m.dose}) scheduled for ${m.scheduledTime}`).join('\n') : '· All scheduled shift medications administered.'}
Pending Diagnostics:
${pendingLabs.length > 0 ? pendingLabs.map(l => `· [${l.priority}] ${l.name} (Status: ${l.status})`).join('\n') : '· All pending laboratory specimens resulted.'}

[R] RECOMMENDATION & PLAN
· Maintain telemetry parameters. Alert provider if HR > 120 or SBP < 90.
· Outstanding Care Tasks:
${p.careTasks.filter(t => !t.completed).map(t => `  - ${t.title} (${t.assignedRole})`).join('\n') || '  - Routine nursing maintenance'}
· Discharge Readiness: ${Object.values(p.dischargeMilestones).filter(Boolean).length}/4 Gates Complete.
==================================================================`;
  };

  const sbarContent = patient ? generateSbarText(patient) : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(sbarContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([sbarContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SBAR_${patient?.bedId}_${patient?.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">SBAR Clinical Handover Report</h3>
              <p className="text-xs text-slate-400">Situation · Background · Assessment · Recommendation</p>
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
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {/* Patient Selector */}
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400 whitespace-nowrap">Select Patient:</label>
            <select
              value={selectedPatientId}
              onChange={e => setSelectedPatientId(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.bedId} · {p.name} ({p.unit} - {p.diagnosis})
                </option>
              ))}
            </select>
          </div>

          {/* Formatted Text Box */}
          <div className="relative">
            <pre className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[50vh]">
              {sbarContent}
            </pre>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-500">
              Standardized Joint Commission compliant handover template
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Save .txt</span>
              </button>
              <button
                onClick={handleCopy}
                className="px-4 py-1.5 bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy SBAR Report'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
