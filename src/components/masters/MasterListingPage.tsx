import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Power,
  Copy,
  History,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ArrowUpDown,
  CheckSquare,
  Square,
  X,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { MasterMetadata, MasterRecord, TableColumnDefinition } from '../../types/masters';
import { MasterFormModal } from './MasterFormModal';
import { MasterDetailsDrawer } from './MasterDetailsDrawer';
import { MasterImportModal } from './MasterImportModal';

interface MasterListingPageProps {
  metadata: MasterMetadata;
  records: MasterRecord[];
  onAddRecord: (data: Partial<MasterRecord>) => void;
  onUpdateRecord: (id: string, data: Partial<MasterRecord>) => void;
  onDeleteRecord: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onDuplicateRecord?: (record: MasterRecord) => void;
  onBulkAction?: (action: 'activate' | 'deactivate' | 'delete', ids: string[]) => void;
  categoryName?: string;
  categoryCode?: string;
}

export const MasterListingPage: React.FC<MasterListingPageProps> = ({
  metadata,
  records,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onToggleStatus,
  onDuplicateRecord,
  onBulkAction,
  categoryName = 'Masters',
}) => {
  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Drawers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MasterRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<MasterRecord | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Active Row Action Menu Popover
  const [openActionRowId, setOpenActionRowId] = useState<string | null>(null);

  // Summary Metrics
  const totalCount = records.length;
  const activeCount = records.filter((r) => r.is_active).length;
  const inactiveCount = totalCount - activeCount;
  const verificationCount = records.filter(
    (r) => r.verification_status === 'Pending' || r.verification_status === 'Pending Verification'
  ).length;

  // Filtered & Sorted Records
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        // Status filter
        if (statusFilter === 'active' && !rec.is_active) return false;
        if (statusFilter === 'inactive' && rec.is_active) return false;

        // Branch filter
        if (selectedBranch !== 'all' && rec.branch && rec.branch !== selectedBranch) {
          return false;
        }

        // Search query across all keys
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCode = String(rec[metadata.identifierKey] || rec.code || '').toLowerCase().includes(q);
          const matchName = String(rec[metadata.nameKey] || rec.name || '').toLowerCase().includes(q);
          const matchAny = Object.values(rec).some(
            (v) => typeof v === 'string' && v.toLowerCase().includes(q)
          );
          if (!matchCode && !matchName && !matchAny) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [records, statusFilter, selectedBranch, searchQuery, sortField, sortDirection, metadata]);

  // Paginated Slice
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  // Sorting Handler
  const handleSort = (fieldKey: string) => {
    if (sortField === fieldKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(fieldKey);
      setSortDirection('asc');
    }
  };

  // Selection Handlers
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedRecords.map((r) => r.id));
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = metadata.columns.map((c) => `"${c.label}"`).join(',');
    const rows = filteredRecords.map((rec) =>
      metadata.columns
        .map((c) => {
          let val = rec[c.key];
          if (c.key === 'is_active') val = rec.is_active ? 'Active' : 'Inactive';
          if (val === undefined || val === null) val = '';
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${metadata.id}_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Form Save
  const handleSaveRecord = (formData: Partial<MasterRecord>, saveAndNew: boolean = false) => {
    if (editingRecord) {
      onUpdateRecord(editingRecord.id, formData);
    } else {
      onAddRecord(formData);
    }

    if (!saveAndNew) {
      setIsFormOpen(false);
      setEditingRecord(null);
    } else {
      setEditingRecord(null);
    }
  };

  // Format cell value
  const renderCellContent = (col: TableColumnDefinition, record: MasterRecord) => {
    const rawVal = record[col.key];

    if (col.format === 'badge') {
      if (col.key === 'is_active') {
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-semibold ${
              record.is_active
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                record.is_active ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-zinc-500'
              }`}
            />
            {record.is_active ? 'Active' : 'Inactive'}
          </span>
        );
      }

      const strVal = String(rawVal || '');
      let colorStyle = 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300';

      if (['Verified', 'Approved', 'Online'].includes(strVal)) {
        colorStyle = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400';
      } else if (['Pending', 'Warning', 'Hired'].includes(strVal)) {
        colorStyle = 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400';
      } else if (['Critical', 'Rejected', 'Offline', 'Expired'].includes(strVal)) {
        colorStyle = 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400';
      } else if (['Central Hub', 'Owned', 'Permanent', 'Enterprise Contract'].includes(strVal)) {
        colorStyle = 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400';
      }

      return (
        <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${colorStyle}`}>
          {strVal || '—'}
        </span>
      );
    }

    if (col.format === 'currency') {
      if (rawVal === undefined || rawVal === null || rawVal === '') return '—';
      return (
        <span className="font-mono-num font-semibold text-slate-900 dark:text-zinc-100">
          ₹{Number(rawVal).toLocaleString('en-IN')}
        </span>
      );
    }

    if (col.format === 'date') {
      if (!rawVal) return '—';
      return <span className="font-mono-num text-slate-700 dark:text-zinc-300">{rawVal}</span>;
    }

    if (col.format === 'boolean') {
      return rawVal ? (
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs">Yes</span>
      ) : (
        <span className="text-slate-400 dark:text-zinc-500 text-xs">No</span>
      );
    }

    if (col.format === 'masked' && typeof rawVal === 'string') {
      return (
        <span className="font-mono-num text-slate-600 dark:text-zinc-400">
          ••••••••{rawVal.slice(-4)}
        </span>
      );
    }

    if (col.format === 'phone') {
      return <span className="font-mono-num text-slate-700 dark:text-zinc-300">{rawVal || '—'}</span>;
    }

    if (col.format === 'email') {
      return <span className="text-slate-700 dark:text-zinc-300 truncate max-w-[160px] inline-block">{rawVal || '—'}</span>;
    }

    return (
      <span className="text-slate-800 dark:text-zinc-200 truncate inline-block max-w-[220px]">
        {rawVal !== undefined && rawVal !== null && rawVal !== '' ? String(rawVal) : '—'}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* 1. Header & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
            <span className="hover:text-slate-800 dark:hover:text-zinc-200">Masters</span>
            <span>/</span>
            <span className="hover:text-slate-800 dark:hover:text-zinc-200">{categoryName}</span>
            <span>/</span>
            <span className="font-semibold text-blue-600 dark:text-red-400">{metadata.name}</span>
          </nav>

          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              {metadata.name}
            </h1>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
              {totalCount} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 max-w-2xl">
            {metadata.shortDescription}
          </p>
        </div>

        {/* Right CTA buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {metadata.supportsImport && (
            <button
              type="button"
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-[#111116] dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors shadow-2xs cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
              <span>Import</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-[#111116] dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors shadow-2xs cursor-pointer"
            title="Export filtered records to CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingRecord(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white dark:bg-red-600 dark:hover:bg-red-700 px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add {metadata.singularName}</span>
          </button>
        </div>
      </div>

      {/* 2. Metric KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-[#0a0a0d] shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Total Records</span>
            <FileSpreadsheet className="h-4 w-4 text-blue-600 dark:text-red-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono-num text-slate-900 dark:text-zinc-100">
              {totalCount}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">configured</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-[#0a0a0d] shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Active Records</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono-num text-emerald-600 dark:text-emerald-400">
              {activeCount}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              {totalCount > 0 ? `${Math.round((activeCount / totalCount) * 100)}%` : '0%'}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-[#0a0a0d] shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-medium">Inactive Records</span>
            <Power className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono-num text-slate-600 dark:text-zinc-400">
              {inactiveCount}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">archived</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-[#0a0a0d] shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-medium">
              {metadata.supportsVerification ? 'Pending KYC' : 'Audit Ready'}
            </span>
            <ShieldCheck className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono-num text-amber-600 dark:text-amber-400">
              {metadata.supportsVerification ? verificationCount : '100%'}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              {metadata.supportsVerification ? 'needs review' : 'compliant'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-[#0a0a0d] sm:flex-row sm:items-center sm:justify-between shadow-2xs">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={`Search by ${metadata.identifierKey}, ${metadata.nameKey}, keyword...`}
            className="w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-slate-50/60 dark:bg-[#121216] pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#121216] focus:border-blue-600 dark:focus:border-red-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter buttons */}
          <div className="flex rounded-lg border border-slate-300 bg-slate-100/60 p-0.5 dark:border-zinc-700 dark:bg-[#141418]">
            {(['all', 'active', 'inactive'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-2xs dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {(searchQuery || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Bulk Action Floating Bar if rows selected */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-blue-50 border border-blue-200 px-4 py-2.5 text-xs dark:bg-blue-950/40 dark:border-blue-900/60 shadow-xs">
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-semibold">
            <span>{selectedIds.length} row(s) selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onBulkAction?.('activate', selectedIds)}
              className="rounded bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 px-2.5 py-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
            >
              Activate Selected
            </button>
            <button
              type="button"
              onClick={() => onBulkAction?.('deactivate', selectedIds)}
              className="rounded bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 px-2.5 py-1 font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
            >
              Deactivate Selected
            </button>
            <button
              type="button"
              onClick={() => {
                selectedIds.forEach((id) => onDeleteRecord(id));
                setSelectedIds([]);
              }}
              className="rounded bg-red-600 text-white px-2.5 py-1 font-semibold hover:bg-red-700 transition-colors"
            >
              Delete Selected
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-slate-500 hover:text-slate-700 dark:text-zinc-400 p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Data Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#0a0a0d] shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11.5px] font-bold text-slate-600 dark:border-zinc-800 dark:bg-[#111116] dark:text-zinc-300">
                {/* Select All Checkbox */}
                <th className="w-10 px-3.5 py-3 text-center">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    {selectedIds.length > 0 && selectedIds.length === paginatedRecords.length ? (
                      <CheckSquare className="h-4 w-4 text-blue-600 dark:text-red-500" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>

                {/* S.No */}
                <th className="w-12 px-2 py-3 text-center text-slate-400">#</th>

                {/* Master-specific columns */}
                {metadata.columns.map((col) => {
                  const isSorted = sortField === col.key;
                  return (
                    <th
                      key={col.key}
                      style={{ width: col.width }}
                      className="px-3.5 py-3 whitespace-nowrap"
                    >
                      {col.sortable !== false ? (
                        <button
                          type="button"
                          onClick={() => handleSort(col.key)}
                          className="group inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                        >
                          <span>{col.label}</span>
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="h-3.5 w-3.5 text-blue-600 dark:text-red-400" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-blue-600 dark:text-red-400" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                      ) : (
                        <span>{col.label}</span>
                      )}
                    </th>
                  );
                })}

                {/* Actions Column */}
                <th className="w-20 px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={metadata.columns.length + 3}
                    className="py-12 text-center text-slate-400 dark:text-zinc-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="h-7 w-7 text-slate-300 dark:text-zinc-600" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        No {metadata.name} records found
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {searchQuery
                          ? `No entries match "${searchQuery}". Try clearing filters.`
                          : 'Get started by creating your first record.'}
                      </p>
                      {!searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingRecord(null);
                            setIsFormOpen(true);
                          }}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-blue-700 dark:bg-red-600 dark:hover:bg-red-700 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add {metadata.singularName}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record, index) => {
                  const isSelected = selectedIds.includes(record.id);
                  const isMenuOpen = openActionRowId === record.id;
                  const serialNumber = (currentPage - 1) * pageSize + index + 1;

                  return (
                    <tr
                      key={record.id}
                      className={`transition-colors hover:bg-slate-50/70 dark:hover:bg-[#131318] ${
                        isSelected ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      {/* Select checkbox */}
                      <td className="px-3.5 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleSelectRow(record.id)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-blue-600 dark:text-red-500" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      {/* S.No */}
                      <td className="px-2 py-3 text-center font-mono-num text-slate-400 text-[11px]">
                        {serialNumber}
                      </td>

                      {/* Dynamic Columns */}
                      {metadata.columns.map((col) => (
                        <td
                          key={col.key}
                          className="px-3.5 py-3 text-xs"
                          onClick={() => setViewingRecord(record)}
                        >
                          {renderCellContent(col, record)}
                        </td>
                      ))}

                      {/* Action Menu */}
                      <td className="px-3 py-3 text-right relative">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingRecord(record)}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRecord(record);
                              setIsFormOpen(true);
                            }}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                            title="Edit Record"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionRowId(isMenuOpen ? null : record.id);
                              }}
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </button>

                            {/* Dropdown menu */}
                            {isMenuOpen && (
                              <div
                                className="absolute right-0 top-7 z-30 w-44 rounded-lg border border-slate-200 bg-white p-1 text-xs shadow-xl dark:border-zinc-800 dark:bg-[#141419]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setViewingRecord(record);
                                    setOpenActionRowId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left font-medium text-slate-700 hover:bg-slate-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                                >
                                  <Eye className="h-3.5 w-3.5 text-slate-400" />
                                  <span>View Details</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingRecord(record);
                                    setIsFormOpen(true);
                                    setOpenActionRowId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left font-medium text-slate-700 hover:bg-slate-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                                >
                                  <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                                  <span>Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    onToggleStatus(record.id);
                                    setOpenActionRowId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left font-medium text-slate-700 hover:bg-slate-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                                >
                                  <Power className="h-3.5 w-3.5 text-slate-400" />
                                  <span>{record.is_active ? 'Deactivate' : 'Activate'}</span>
                                </button>

                                {metadata.supportsDuplicate && onDuplicateRecord && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onDuplicateRecord(record);
                                      setOpenActionRowId(null);
                                    }}
                                    className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left font-medium text-slate-700 hover:bg-slate-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                                  >
                                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                                    <span>Duplicate</span>
                                  </button>
                                )}

                                <div className="my-1 border-t border-slate-100 dark:border-zinc-800" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeleteConfirmId(record.id);
                                    setOpenActionRowId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 6. Pagination Footer */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 px-4 py-3 bg-slate-50/60 dark:border-zinc-800 dark:bg-[#0e0e12] text-xs text-slate-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-[#141418] dark:text-zinc-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-slate-400 ml-2">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredRecords.length)} of{' '}
              {filteredRecords.length} records
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex h-7 w-7 items-center justify-center rounded border border-slate-300 dark:border-zinc-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <span className="px-2 font-semibold text-slate-800 dark:text-zinc-200 font-mono-num">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="flex h-7 w-7 items-center justify-center rounded border border-slate-300 dark:border-zinc-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-[#0e0e12] space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Delete {metadata.singularName}?
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  This action cannot be undone. All child records and references must be unlinked first.
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-[11.5px] text-amber-800 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-300">
              Tip: If this record is referenced in historical trips or transactions, consider <strong>Deactivating</strong> it instead of permanently deleting.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-md border border-slate-300 dark:border-zinc-700 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteRecord(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="rounded-md bg-red-600 text-white px-3.5 py-1.5 text-xs font-semibold hover:bg-red-700 shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <MasterFormModal
        metadata={metadata}
        record={editingRecord}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveRecord}
      />

      {/* View Details Drawer */}
      <MasterDetailsDrawer
        metadata={metadata}
        record={viewingRecord}
        isOpen={!!viewingRecord}
        onClose={() => setViewingRecord(null)}
        onEdit={(rec) => {
          setViewingRecord(null);
          setEditingRecord(rec);
          setIsFormOpen(true);
        }}
        onToggleStatus={(rec) => {
          onToggleStatus(rec.id);
          setViewingRecord((prev) => prev ? { ...prev, is_active: !prev.is_active } : null);
        }}
      />

      {/* CSV Import Modal */}
      <MasterImportModal
        metadata={metadata}
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={(newRows) => {
          newRows.forEach((row) => onAddRecord(row));
        }}
      />
    </div>
  );
};
