import React, { useState } from 'react';
import {
  X,
  Edit2,
  Power,
  Clock,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  ShieldCheck,
  History,
  Copy,
} from 'lucide-react';
import { MasterMetadata, MasterRecord } from '../../types/masters';

interface MasterDetailsDrawerProps {
  metadata: MasterMetadata;
  record: MasterRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (record: MasterRecord) => void;
  onToggleStatus: (record: MasterRecord) => void;
}

export const MasterDetailsDrawer: React.FC<MasterDetailsDrawerProps> = ({
  metadata,
  record,
  isOpen,
  onClose,
  onEdit,
  onToggleStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'audit'>('details');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !record) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const codeVal = record[metadata.identifierKey] || record.code || record.id;
  const nameVal = record[metadata.nameKey] || record.name || codeVal;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl h-full bg-white dark:bg-[#09090c] border-l border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col">
        {/* Drawer Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 dark:border-zinc-800 p-5 bg-slate-50/80 dark:bg-[#0e0e12]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 dark:bg-red-600/15 dark:text-red-400 font-bold text-sm">
              {metadata.codePrefix}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  {nameVal}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10.5px] font-semibold ${
                    record.is_active
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  {record.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 font-mono-num">
                <span>{codeVal}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(String(codeVal), 'code')}
                  className="hover:text-slate-800 dark:hover:text-zinc-200 cursor-pointer"
                  title="Copy Code"
                >
                  <Copy className="h-3 w-3" />
                </button>
                {copiedKey === 'code' && (
                  <span className="text-[10px] text-emerald-600 font-semibold">Copied!</span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 dark:border-zinc-800 px-5 bg-white dark:bg-[#09090c]">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600 dark:border-red-500 dark:text-red-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            Field Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-600 dark:border-red-500 dark:text-red-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            Audit History & Metadata
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeTab === 'details' ? (
            metadata.formSections.map((section) => (
              <div key={section.id} className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 border-b border-slate-100 dark:border-zinc-800/80 pb-1.5">
                  {section.title}
                </h4>
                <div className="grid grid-cols-2 gap-3.5">
                  {section.fields.map((field) => {
                    const rawVal = record[field.name];
                    const isMasked = field.mask && rawVal;
                    let displayVal: React.ReactNode = rawVal ?? '—';

                    if (typeof rawVal === 'boolean') {
                      displayVal = rawVal ? 'Yes' : 'No';
                    } else if (isMasked && typeof rawVal === 'string') {
                      displayVal = `••••••••${rawVal.slice(-4)}`;
                    } else if (field.type === 'permission_matrix') {
                      displayVal = (
                        <span className="text-[11px] text-blue-600 dark:text-red-400 font-semibold">
                          Custom Matrix Configured ({Object.keys(rawVal || {}).length} modules)
                        </span>
                      );
                    }

                    return (
                      <div
                        key={field.name}
                        className={field.type === 'textarea' ? 'col-span-2' : ''}
                      >
                        <span className="block text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                          {field.label}
                        </span>
                        <span className="mt-0.5 block text-xs font-semibold text-slate-900 dark:text-zinc-100 break-words">
                          {displayVal}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 dark:border-zinc-800 p-4 bg-slate-50/50 dark:bg-[#111116] space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  Record Metadata
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 text-[11px]">System Record ID:</span>
                    <p className="font-mono-num text-slate-800 dark:text-zinc-200 font-semibold">{record.id}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Lifecycle Status:</span>
                    <p className="text-slate-800 dark:text-zinc-200 font-semibold">{record.is_active ? 'Active' : 'Inactive'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Created At:</span>
                    <p className="font-mono-num text-slate-800 dark:text-zinc-200">{record.created_at ? new Date(record.created_at).toLocaleString() : '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Created By:</span>
                    <p className="text-slate-800 dark:text-zinc-200">{record.created_by || 'System'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Last Updated At:</span>
                    <p className="font-mono-num text-slate-800 dark:text-zinc-200">{record.updated_at ? new Date(record.updated_at).toLocaleString() : '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Last Updated By:</span>
                    <p className="text-slate-800 dark:text-zinc-200">{record.updated_by || 'System'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Activity Audit Trail
                </h4>
                <div className="space-y-2">
                  <div className="relative pl-6 pb-4 border-l-2 border-slate-200 dark:border-zinc-800">
                    <span className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-blue-600 dark:bg-red-500" />
                    <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                      Record Updated & Validated
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Modified by {record.updated_by || 'System'} on {record.updated_at ? new Date(record.updated_at).toLocaleDateString() : 'Recent'}
                    </p>
                  </div>
                  <div className="relative pl-6 border-l-2 border-slate-200 dark:border-zinc-800">
                    <span className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-emerald-500" />
                    <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                      Initial Master Record Created
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Authored by {record.created_by || 'Super Admin'} on {record.created_at ? new Date(record.created_at).toLocaleDateString() : 'Initial'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="flex shrink-0 items-center justify-between border-t border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-[#0e0e12] p-4">
          <button
            type="button"
            onClick={() => onToggleStatus(record)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold border transition-colors cursor-pointer ${
              record.is_active
                ? 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 dark:border-amber-800/80 dark:bg-amber-950/30 dark:text-amber-400'
                : 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-800/80 dark:bg-emerald-950/30 dark:text-emerald-400'
            }`}
          >
            <Power className="h-3.5 w-3.5" />
            <span>{record.is_active ? 'Deactivate Record' : 'Activate Record'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 dark:border-zinc-700 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onEdit(record)}
              className="flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white dark:bg-red-600 dark:hover:bg-red-700 px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Record</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
