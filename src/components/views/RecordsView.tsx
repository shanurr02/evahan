import React, { useState } from 'react';
import {
  FileText,
  Search,
  Upload,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  ShieldCheck,
  Calendar,
  XCircle,
  FileCheck,
} from 'lucide-react';
import { Vehicle } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

interface DocumentRecord {
  id: string;
  title: string;
  category: 'Registration (RC)' | 'Insurance' | 'Fitness' | 'National Permit' | 'PUC' | 'Tax Receipt';
  targetType: 'Vehicle' | 'Driver';
  targetName: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'Valid' | 'Expiring Soon' | 'Expired';
  fileSize: string;
}

const initialRecords: DocumentRecord[] = [
  {
    id: 'doc-1',
    title: 'Commercial Vehicle RC Smart Card',
    category: 'Registration (RC)',
    targetType: 'Vehicle',
    targetName: 'OD14AB1234',
    documentNumber: 'RC-OD14-2022-8819',
    issueDate: '2022-04-12',
    expiryDate: '2037-04-11',
    status: 'Valid',
    fileSize: '1.8 MB PDF',
  },
  {
    id: 'doc-2',
    title: 'National Transport Permit (All India)',
    category: 'National Permit',
    targetType: 'Vehicle',
    targetName: 'OD14AB1234',
    documentNumber: 'NP-IND-2024-991',
    issueDate: '2024-01-10',
    expiryDate: '2029-01-09',
    status: 'Valid',
    fileSize: '2.4 MB PDF',
  },
  {
    id: 'doc-3',
    title: 'Commercial Fleet Comprehensive Insurance',
    category: 'Insurance',
    targetType: 'Vehicle',
    targetName: 'OD14CD5678',
    documentNumber: 'POL-NEWIND-8812',
    issueDate: '2025-10-01',
    expiryDate: '2026-10-25',
    status: 'Expiring Soon',
    fileSize: '3.1 MB PDF',
  },
  {
    id: 'doc-4',
    title: 'Vehicle Roadworthiness Fitness Certificate',
    category: 'Fitness',
    targetType: 'Vehicle',
    targetName: 'JH01EF9012',
    documentNumber: 'FIT-RTO-RN-441',
    issueDate: '2025-08-15',
    expiryDate: '2026-08-14',
    status: 'Expired',
    fileSize: '1.2 MB PDF',
  },
  {
    id: 'doc-5',
    title: 'Pollution Under Control (PUC Certificate)',
    category: 'PUC',
    targetType: 'Vehicle',
    targetName: 'OD14AB1234',
    documentNumber: 'PUC-OD-90122',
    issueDate: '2026-04-01',
    expiryDate: '2026-10-18',
    status: 'Expiring Soon',
    fileSize: '650 KB PDF',
  },
  {
    id: 'doc-6',
    title: 'State Road Tax Token Certificate',
    category: 'Tax Receipt',
    targetType: 'Vehicle',
    targetName: 'BR01GH3456',
    documentNumber: 'TAX-BR-2026-44',
    issueDate: '2026-01-01',
    expiryDate: '2026-12-31',
    status: 'Valid',
    fileSize: '950 KB PDF',
  },
];

export const RecordsView: React.FC<{ vehicles: Vehicle[] }> = ({ vehicles }) => {
  const { showToast } = useToast();
  const [records, setRecords] = useState<DocumentRecord[]>(initialRecords);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Upload modal state
  const [title, setTitle] = useState('');
  const [targetVehicle, setTargetVehicle] = useState(vehicles[0]?.regNumber || 'OD14AB1234');
  const [category, setCategory] = useState<DocumentRecord['category']>('Insurance');
  const [docNumber, setDocNumber] = useState('');
  const [expiry, setExpiry] = useState('2027-09-30');

  const validCount = records.filter((r) => r.status === 'Valid').length;
  const expiringCount = records.filter((r) => r.status === 'Expiring Soon').length;
  const expiredCount = records.filter((r) => r.status === 'Expired').length;

  const filteredRecords = records.filter((r) => {
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchCat = categoryFilter === 'All' || r.category === categoryFilter;
    const matchSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.documentNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchCat && matchSearch;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !docNumber) {
      showToast('error', 'Missing Information', 'Document Title and Number are mandatory.');
      return;
    }

    const newDoc: DocumentRecord = {
      id: `doc-${Date.now()}`,
      title,
      category,
      targetType: 'Vehicle',
      targetName: targetVehicle,
      documentNumber: docNumber,
      issueDate: '2026-09-16',
      expiryDate: expiry,
      status: 'Valid',
      fileSize: '1.5 MB PDF',
    };

    setRecords([newDoc, ...records]);
    setIsUploadOpen(false);
    setTitle('');
    setDocNumber('');
    showToast('success', 'Document Uploaded', `${newDoc.title} securely archived for ${newDoc.targetName}.`);
  };

  const handleExportCSV = () => {
    const headers = ['Document Title', 'Category', 'Target Asset', 'Doc Number', 'Issue Date', 'Expiry Date', 'Status'];
    const rows = filteredRecords.map((r) => [
      r.title,
      r.category,
      r.targetName,
      r.documentNumber,
      r.issueDate,
      r.expiryDate,
      r.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((x) => `"${x}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `compliance-registry-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Registry Exported', 'Compliance documents list downloaded as CSV.');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <span>Home</span>
            <span className="text-slate-300 dark:text-zinc-600">/</span>
            <span>Compliance & Legal</span>
            <span className="text-slate-300 dark:text-zinc-600">/</span>
            <span className="text-blue-600 dark:text-red-400 font-bold">Compliance & Documents</span>
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Fleet Regulatory Document Vault
            </h1>
            <span className="rounded-md bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 text-xs font-bold font-mono-num dark:bg-red-950/70 dark:border-red-800/60 dark:text-red-400">
              {records.length} Documents Encrypted
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors dark:border-zinc-700 dark:bg-[#111116] dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
            <span>Export Registry</span>
          </button>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all dark:bg-red-600 dark:hover:bg-red-700 cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Certificate</span>
          </button>
        </div>
      </div>

      {/* Compliance Overview Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 flex items-center justify-between shadow-xs dark:border-emerald-800/60 dark:bg-emerald-950/30">
          <div>
            <span className="text-[10.5px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
              Compliant & Verified
            </span>
            <div className="mt-0.5 text-2xl font-black font-mono-num text-emerald-800 dark:text-emerald-300">
              {validCount} Documents
            </div>
            <p className="text-[10px] text-emerald-600">Parivahan Vahan Sync verified</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 flex items-center justify-between shadow-xs dark:border-amber-800/60 dark:bg-amber-950/30">
          <div>
            <span className="text-[10.5px] font-bold uppercase text-amber-700 dark:text-amber-400">
              Expiring Soon (30 Days)
            </span>
            <div className="mt-0.5 text-2xl font-black font-mono-num text-amber-800 dark:text-amber-300">
              {expiringCount} Certificates
            </div>
            <p className="text-[10px] text-amber-600">Action recommended for renewal</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5 flex items-center justify-between shadow-xs dark:border-red-800/60 dark:bg-red-950/30">
          <div>
            <span className="text-[10.5px] font-bold uppercase text-rose-700 dark:text-red-400">
              Expired / Urgent Fine Risk
            </span>
            <div className="mt-0.5 text-2xl font-black font-mono-num text-rose-800 dark:text-red-300">
              {expiredCount} Overdue
            </div>
            <p className="text-[10px] text-rose-600">Immediate RTO Challan hazard</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 dark:bg-red-900/50 dark:text-red-300">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs dark:bg-[#0e0e13] dark:border-zinc-800">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['All', 'Valid', 'Expiring Soon', 'Expired'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3 py-1.5 font-bold transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-xs dark:bg-red-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800/80 dark:text-zinc-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search certificate, vehicle plate, policy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
          />
        </div>
      </div>

      {/* Document Records Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-zinc-800 dark:bg-[#0e0e13]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[10.5px] font-black uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-[#121218] dark:text-zinc-400">
                <th className="py-3 px-3.5">Document Title</th>
                <th className="py-3 px-3.5">Category</th>
                <th className="py-3 px-3.5">Target Asset</th>
                <th className="py-3 px-3.5">Certificate / Policy #</th>
                <th className="py-3 px-3.5">Issue Date</th>
                <th className="py-3 px-3.5">Expiry Date</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {filteredRecords.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors dark:hover:bg-zinc-800/40">
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 dark:bg-blue-950/40 dark:text-blue-400">
                        <FileCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{doc.title}</div>
                        <div className="text-[10px] text-slate-400">{doc.fileSize}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3.5 font-semibold text-slate-700 dark:text-zinc-300">{doc.category}</td>
                  <td className="py-3 px-3.5 font-mono-num font-bold text-slate-900 dark:text-white">{doc.targetName}</td>
                  <td className="py-3 px-3.5 font-mono-num text-slate-500 dark:text-zinc-400 text-[11px]">{doc.documentNumber}</td>
                  <td className="py-3 px-3.5 text-slate-500 text-[11px]">{doc.issueDate}</td>
                  <td className="py-3 px-3.5 font-semibold text-slate-800 font-mono-num dark:text-zinc-200">{doc.expiryDate}</td>
                  <td className="py-3 px-3.5">
                    <StatusBadge status={doc.status} size="sm" />
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <button
                      onClick={() =>
                        showToast('info', 'Document Downloaded', `Decrypted copy of ${doc.title} retrieved.`)
                      }
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:bg-slate-50 transition-colors dark:border-zinc-700 dark:bg-zinc-800 dark:text-blue-400 cursor-pointer"
                    >
                      <Download className="h-3 w-3 inline mr-1" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPLOAD MODAL */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Deposit Regulatory Certificate"
        subtitle="Upload certified copy for RTO compliance tracking & automated renewal alerts"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-3">
          <div>
            <label className="text-[10.5px] font-bold uppercase text-slate-500">Document Title *</label>
            <input
              type="text"
              placeholder="e.g. Commercial Vehicle Fitness Certificate"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10.5px] font-bold uppercase text-slate-500">Compliance Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              >
                <option value="Registration (RC)">Registration (RC)</option>
                <option value="Insurance">Comprehensive Insurance</option>
                <option value="Fitness">Fitness Certificate</option>
                <option value="National Permit">National Permit (NP)</option>
                <option value="PUC">Pollution Under Control (PUC)</option>
                <option value="Tax Receipt">State Road Tax Receipt</option>
              </select>
            </div>

            <div>
              <label className="text-[10.5px] font-bold uppercase text-slate-500">Target Vehicle *</label>
              <select
                value={targetVehicle}
                onChange={(e) => setTargetVehicle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.regNumber}>
                    {v.regNumber} ({v.model})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10.5px] font-bold uppercase text-slate-500">Document / Policy Number *</label>
              <input
                type="text"
                placeholder="e.g. POL-88192-2026"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-mono-num text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10.5px] font-bold uppercase text-slate-500">Expiry Date *</label>
              <input
                type="date"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              />
            </div>
          </div>

          {/* Drag & Drop zone */}
          <div className="rounded-xl border-2 border-dashed border-slate-200 p-4 text-center dark:border-zinc-700">
            <Upload className="h-6 w-6 mx-auto text-slate-400 mb-1" />
            <p className="text-xs font-bold text-slate-700 dark:text-zinc-200">Drag & drop scanned PDF or image</p>
            <span className="text-[10.5px] text-slate-400">PDF, JPG, PNG up to 10 MB</span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs"
            >
              Deposit Document
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
