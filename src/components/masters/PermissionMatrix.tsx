import React, { useState } from 'react';
import { Check, CheckSquare, Square } from 'lucide-react';

export interface PermissionRow {
  moduleId: string;
  moduleName: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
  reject: boolean;
  export: boolean;
}

const DEFAULT_MODULES = [
  { id: 'transport_ops', name: 'Transport Operations & Dispatches' },
  { id: 'fleet_mgmt', name: 'Fleet Management & Assets' },
  { id: 'trip_mgmt', name: 'Trip Management & Tracking' },
  { id: 'gps_telematics', name: 'GPS & Telematics Alarms' },
  { id: 'billing_acct', name: 'Billing, Invoicing & Accounts' },
  { id: 'maintenance', name: 'Maintenance & Spares Workshop' },
  { id: 'compliance', name: 'Compliance & Documents' },
  { id: 'masters_mgmt', name: 'Masters Configuration' },
  { id: 'reports', name: 'Reports & Analytics' },
  { id: 'settings', name: 'System Settings & Audit' },
];

interface PermissionMatrixProps {
  value?: Record<string, any>;
  onChange?: (val: Record<string, any>) => void;
  readOnly?: boolean;
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  value,
  onChange,
  readOnly = false,
}) => {
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>(() => {
    if (value && Object.keys(value).length > 0) {
      return value;
    }
    // Default matrix
    const initial: Record<string, Record<string, boolean>> = {};
    DEFAULT_MODULES.forEach((mod) => {
      initial[mod.id] = {
        view: true,
        create: mod.id !== 'settings',
        edit: mod.id !== 'settings',
        delete: false,
        approve: ['transport_ops', 'billing_acct', 'maintenance'].includes(mod.id),
        reject: ['transport_ops', 'billing_acct'].includes(mod.id),
        export: true,
      };
    });
    return initial;
  });

  const columns: { key: string; label: string }[] = [
    { key: 'view', label: 'View' },
    { key: 'create', label: 'Create' },
    { key: 'edit', label: 'Edit' },
    { key: 'delete', label: 'Delete' },
    { key: 'approve', label: 'Approve' },
    { key: 'reject', label: 'Reject' },
    { key: 'export', label: 'Export' },
  ];

  const handleToggle = (modId: string, colKey: string) => {
    if (readOnly) return;
    const currentVal = !!matrix[modId]?.[colKey];
    const updated = {
      ...matrix,
      [modId]: {
        ...(matrix[modId] || {}),
        [colKey]: !currentVal,
      },
    };
    setMatrix(updated);
    onChange?.(updated);
  };

  const handleToggleRow = (modId: string) => {
    if (readOnly) return;
    const row = matrix[modId] || {};
    const allChecked = columns.every((col) => !!row[col.key]);
    const newRow: Record<string, boolean> = {};
    columns.forEach((col) => {
      newRow[col.key] = !allChecked;
    });
    const updated = {
      ...matrix,
      [modId]: newRow,
    };
    setMatrix(updated);
    onChange?.(updated);
  };

  const handleToggleColumn = (colKey: string) => {
    if (readOnly) return;
    const allChecked = DEFAULT_MODULES.every((mod) => !!matrix[mod.id]?.[colKey]);
    const updated = { ...matrix };
    DEFAULT_MODULES.forEach((mod) => {
      updated[mod.id] = {
        ...(updated[mod.id] || {}),
        [colKey]: !allChecked,
      };
    });
    setMatrix(updated);
    onChange?.(updated);
  };

  return (
    <div className="w-full overflow-hidden rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0d]">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#111115] px-3.5 py-2">
        <div>
          <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
            Granular Module Permission Matrix
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Click column headers or row labels to toggle bulk access permissions.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-100/60 dark:bg-[#141418] text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
              <th className="px-3 py-2 text-left">Module Domain</th>
              {columns.map((col) => (
                <th key={col.key} className="px-2 py-2 text-center">
                  <button
                    type="button"
                    disabled={readOnly}
                    onClick={() => handleToggleColumn(col.key)}
                    className="hover:text-blue-700 dark:hover:text-red-400 hover:underline cursor-pointer"
                    title={`Toggle all ${col.label}`}
                  >
                    {col.label}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
            {DEFAULT_MODULES.map((mod) => {
              const row = matrix[mod.id] || {};
              const allRowChecked = columns.every((col) => !!row[col.key]);

              return (
                <tr
                  key={mod.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-[#15151c] transition-colors"
                >
                  <td className="px-3 py-2 font-medium text-slate-800 dark:text-zinc-200">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={readOnly}
                        onClick={() => handleToggleRow(mod.id)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                        title="Toggle row permissions"
                      >
                        {allRowChecked ? (
                          <CheckSquare className="h-3.5 w-3.5 text-blue-600 dark:text-red-500" />
                        ) : (
                          <Square className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <span className="text-[11.5px]">{mod.name}</span>
                    </div>
                  </td>
                  {columns.map((col) => {
                    const isChecked = !!row[col.key];
                    return (
                      <td key={col.key} className="px-2 py-2 text-center">
                        <button
                          type="button"
                          disabled={readOnly}
                          onClick={() => handleToggle(mod.id, col.key)}
                          className={`inline-flex h-5 w-5 items-center justify-center rounded border transition-all ${
                            isChecked
                              ? 'bg-blue-600 border-blue-600 text-white dark:bg-red-600 dark:border-red-600 shadow-xs'
                              : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-[#121216] text-transparent hover:border-slate-400 dark:hover:border-zinc-500'
                          }`}
                          aria-label={`${mod.name} ${col.label}`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
