import React, { useState } from 'react';
import { X, GitBranch, Terminal, Copy, Check, ExternalLink, CheckCircle2, BookOpen } from 'lucide-react';

interface GitRepoModalProps {
  onClose: () => void;
}

export const GitRepoModal: React.FC<GitRepoModalProps> = ({ onClose }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const ghCliCommand = `gh repo create CareGrid --public --source=. --push`;
  const gitStandardCommand = `git remote add origin https://github.com/YOUR_USERNAME/CareGrid.git\ngit branch -M main\ngit push -u origin main`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">CareGrid Repository & GitHub Sync</h3>
              <p className="text-xs text-slate-400">Repository: CareGrid · Ready with README, Architecture & Workflows</p>
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
          {/* Status Banner */}
          <div className="p-4 bg-teal-950/30 border border-teal-800/50 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-teal-200">Repository Initialized & Committed Locally</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                All source code, clinical data models, telemetry simulators, and an exhaustive <strong className="text-white">README.md</strong> with Mermaid diagrams, ASCII architectures, and clinical workflows are staged and committed on the <code className="text-teal-300 font-mono">main</code> branch.
              </p>
            </div>
          </div>

          {/* Quick Push Method 1: GitHub CLI */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-teal-400" />
                Option 1: One-Line Push via GitHub CLI (Recommended)
              </span>
              <button
                onClick={() => copyToClipboard(ghCliCommand, 'gh')}
                className="text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                {copiedCmd === 'gh' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copiedCmd === 'gh' ? 'Copied' : 'Copy Command'}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 select-all">
              {ghCliCommand}
            </div>
            <p className="text-[11px] text-slate-500">
              Creates the public repo <strong>CareGrid</strong> on your GitHub account and pushes all codes in one step.
            </p>
          </div>

          {/* Method 2: Standard Git Remote */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-sky-400" />
                Option 2: Push to an Existing GitHub Repo URL
              </span>
              <button
                onClick={() => copyToClipboard(gitStandardCommand, 'git')}
                className="text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                {copiedCmd === 'git' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copiedCmd === 'git' ? 'Copied' : 'Copy Commands'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 overflow-x-auto select-all">
              {gitStandardCommand}
            </pre>
          </div>

          {/* Included Documentation Highlights */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
            <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-teal-400" />
              Included Diagrams & Documentation in README.md
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li><strong>Clinical Care Workflow Diagram</strong>: Emergency triage, admission, bed placement, eMAR administration, and discharge milestones.</li>
              <li><strong>System Architecture Diagram</strong>: Frontend state layer, telemetry simulation engine, EHR chart drawer, and alert dispatch pipeline.</li>
              <li><strong>Telemetry & Vitals Data Flow</strong>: Continuous vital threshold monitoring and rapid response trigger mechanisms.</li>
              <li><strong>Care Team Staffing Matrix</strong>: Nurse-to-patient ratio enforcement and clinical roles specification.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono">Repo Name: CareGrid</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
