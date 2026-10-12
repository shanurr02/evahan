import React, { useState } from 'react';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { MasterMetadata, MasterRecord } from '../../types/masters';

interface MasterImportModalProps {
  metadata: MasterMetadata;
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedRecords: MasterRecord[]) => void;
}

export const MasterImportModal: React.FC<MasterImportModalProps> = ({
  metadata,
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importCompleted, setImportCompleted] = useState(false);

  if (!isOpen) return null;

  // Generate downloadable sample CSV template
  const handleDownloadTemplate = () => {
    const headers = metadata.columns.map((c) => c.key);
    const sampleRow = metadata.columns.map((c) => {
      if (c.key === 'code' || c.key === metadata.identifierKey) return `${metadata.codePrefix}-9901`;
      if (c.key === 'is_active') return 'true';
      return `Sample ${c.label}`;
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), sampleRow.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${metadata.id}_sample_import_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsParsing(true);
    setValidationErrors([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setValidationErrors(['File contains no data rows.']);
          setIsParsing(false);
          return;
        }

        const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
        const parsed: any[] = [];
        const errs: string[] = [];

        for (let i = 1; i < lines.length; i++) {
          const rowVals = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
          const record: any = {
            id: `imp-${Date.now()}-${i}`,
            is_active: true,
            created_at: new Date().toISOString(),
            created_by: 'CSV Importer',
            updated_at: new Date().toISOString(),
            updated_by: 'CSV Importer',
          };

          headers.forEach((h, idx) => {
            const val = rowVals[idx] || '';
            if (h === 'is_active') {
              record.is_active = val.toLowerCase() === 'true' || val === '1';
            } else {
              record[h] = val;
            }
          });

          // Validation check on identifier
          const idKey = metadata.identifierKey || 'code';
          if (!record[idKey]) {
            errs.push(`Row ${i}: Missing mandatory identifier column '${idKey}'`);
          }

          parsed.push(record);
        }

        setPreviewRows(parsed);
        setValidationErrors(errs);
      } catch (err: any) {
        setValidationErrors(['Failed to parse CSV file: ' + err.message]);
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (previewRows.length === 0 || validationErrors.length > 0) return;
    onImportSuccess(previewRows);
    setImportCompleted(true);
    setTimeout(() => {
      setImportCompleted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#09090c] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 dark:border-zinc-800 px-5 py-3.5 bg-slate-50/70 dark:bg-[#0e0e12]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <FileSpreadsheet className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Bulk Import {metadata.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Upload CSV or Excel data file with automatic column validation.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Sample template banner */}
          <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/70 dark:border-blue-900/40 dark:bg-blue-950/20 p-3.5">
            <div>
              <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300">
                Download Official CSV Template
              </h4>
              <p className="text-[11px] text-blue-700 dark:text-blue-400">
                Includes all required column headings and sample values for {metadata.singularName}.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Template</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          <div className="rounded-lg border-2 border-dashed border-slate-300 dark:border-zinc-700 p-6 text-center hover:border-blue-500 dark:hover:border-red-500 transition-colors bg-slate-50/50 dark:bg-[#111115]">
            <Upload className="mx-auto h-8 w-8 text-slate-400 dark:text-zinc-500" />
            <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-zinc-200">
              Drag & drop CSV file here, or browse
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
              Supports standard UTF-8 encoded .csv files up to 10MB
            </p>
            <label className="mt-3.5 inline-flex items-center gap-1.5 rounded-md border border-slate-300 dark:border-zinc-600 bg-white dark:bg-[#18181f] px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
              <span>Choose Local File</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {selectedFile && (
              <p className="mt-2 text-xs font-semibold text-blue-600 dark:text-red-400">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30 p-3.5 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-red-700 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span>Validation Issues ({validationErrors.length})</span>
              </div>
              <ul className="list-disc pl-5 text-[11px] text-red-600 dark:text-red-300 space-y-0.5">
                {validationErrors.slice(0, 5).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Table */}
          {previewRows.length > 0 && validationErrors.length === 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-zinc-300">
                  Data Preview ({previewRows.length} records ready)
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Structure Validated
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111116]">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 dark:bg-[#16161d] border-b border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400">
                    <tr>
                      <th className="p-2">#</th>
                      {metadata.columns.slice(0, 4).map((c) => (
                        <th key={c.key} className="p-2">{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                    {previewRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx}>
                        <td className="p-2 text-slate-400">{idx + 1}</td>
                        {metadata.columns.slice(0, 4).map((c) => (
                          <td key={c.key} className="p-2 text-slate-800 dark:text-zinc-200">
                            {row[c.key] ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-[#0e0e12] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 dark:border-zinc-700 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={previewRows.length === 0 || validationErrors.length > 0}
            onClick={handleExecuteImport}
            className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors ${
              previewRows.length > 0 && validationErrors.length === 0
                ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                : 'bg-slate-400 dark:bg-zinc-700 cursor-not-allowed opacity-60'
            }`}
          >
            {importCompleted ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Imported Successfully!</span>
              </>
            ) : (
              <>
                <ArrowRight className="h-3.5 w-3.5" />
                <span>Commit & Import {previewRows.length} Records</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
