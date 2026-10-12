import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Calendar,
  Truck,
  Disc,
  Activity,
  Check,
} from 'lucide-react';
import { Reminder, Vehicle } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

interface RemindersViewProps {
  reminders: Reminder[];
  vehicles: Vehicle[];
  onAddReminder: (reminder: Reminder) => void;
  onResolveReminder: (id: string) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  vehicles,
  onAddReminder,
  onResolveReminder,
}) => {
  const { showToast } = useToast();
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Reminder state
  const [title, setTitle] = useState('');
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '');
  const [type, setType] = useState<'Service' | 'Insurance' | 'Fitness' | 'Permit' | 'PUC'>('Service');
  const [dueDate, setDueDate] = useState('2026-10-15');
  const [dueKm, setDueKm] = useState(150000);
  const [serviceCenter, setServiceCenter] = useState('Tata Authorized Heavy Workshop, Rourkela');
  const [estCost, setEstCost] = useState('12500');

  const urgentCount = reminders.filter((r) => r.status === 'Urgent' || r.status === 'Overdue').length;
  const upcomingCount = reminders.filter((r) => r.status === 'Upcoming' || r.status === 'Due Soon').length;
  const completedCount = reminders.filter((r) => r.status === 'Completed').length;

  const filteredReminders = reminders.filter((r) => {
    const matchType = filterType === 'All' || r.type === filterType || r.category === filterType;
    const itemTitle = r.title || r.category || '';
    const matchSearch =
      itemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vehicleReg.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      showToast('error', 'Validation Error', 'Task description is required.');
      return;
    }
    const v = vehicles.find((item) => item.id === vehicleId) || vehicles[0];

    const newRem: Reminder = {
      id: `rem-${Date.now()}`,
      vehicleId: v.id,
      vehicleReg: v.regNumber,
      title,
      type,
      dueDate,
      dueKm,
      status: 'Upcoming',
      priority: 'Medium',
      description: `Workshop order at ${serviceCenter}. Est ₹${estCost}.`,
    };

    onAddReminder(newRem);
    setIsModalOpen(false);
    setTitle('');
    showToast('success', 'Work Order Created', `${title} scheduled for ${v.regNumber}.`);
  };

  const handleExportCSV = () => {
    const headers = ['Vehicle Reg', 'Service Task', 'Category', 'Due Date', 'Due Odometer', 'Priority', 'Status'];
    const rows = filteredReminders.map((r) => [
      r.vehicleReg,
      r.title || r.category,
      r.type,
      r.dueDate,
      r.dueKm || 'N/A',
      r.priority,
      r.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((x) => `"${x}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `maintenance-schedule-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Schedule Exported', 'Maintenance schedule downloaded as CSV.');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <span>Home</span>
            <span className="text-slate-300 dark:text-zinc-600">/</span>
            <span>Workshop & Fleet Health</span>
            <span className="text-slate-300 dark:text-zinc-600">/</span>
            <span className="text-blue-600 dark:text-red-400 font-bold">Maintenance</span>
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Preventive Maintenance & Workshop Orders
            </h1>
            <span className="rounded-md bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 text-xs font-bold font-mono-num dark:bg-amber-950/80 dark:border-amber-800/80 dark:text-amber-400">
              {urgentCount} Urgent Work Orders
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors dark:border-zinc-700 dark:bg-[#111116] dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
            <span>Export Schedule</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all dark:bg-red-600 dark:hover:bg-red-700 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Schedule Service</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-[#0c0c10]">
          <span className="text-[10.5px] font-bold uppercase text-slate-500 dark:text-zinc-400">Total Work Orders</span>
          <div className="mt-1 text-2xl font-black font-mono-num text-slate-900 dark:text-white">
            {reminders.length}
          </div>
          <span className="text-[10px] text-slate-400">Preventive & breakdown</span>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5 shadow-xs dark:border-red-900/40 dark:bg-red-950/20">
          <span className="text-[10.5px] font-bold uppercase text-rose-700 dark:text-red-400">Overdue / Urgent</span>
          <div className="mt-1 text-2xl font-black font-mono-num text-rose-700 dark:text-red-300">
            {urgentCount}
          </div>
          <span className="text-[10px] text-rose-600">Immediate workshop routing</span>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 shadow-xs dark:border-blue-900/40 dark:bg-blue-950/20">
          <span className="text-[10.5px] font-bold uppercase text-blue-700 dark:text-blue-400">Scheduled (Next 30D)</span>
          <div className="mt-1 text-2xl font-black font-mono-num text-blue-700 dark:text-blue-300">
            {upcomingCount}
          </div>
          <span className="text-[10px] text-blue-600">Lube & filter service cycles</span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 shadow-xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <span className="text-[10.5px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Fleet Health Index</span>
          <div className="mt-1 text-2xl font-black font-mono-num text-emerald-700 dark:text-emerald-300">
            96.4%
          </div>
          <span className="text-[10px] text-emerald-600">Zero critical roadside stalls</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs dark:bg-[#0e0e13] dark:border-zinc-800">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['All', 'Service', 'Tyres', 'Insurance', 'Fitness'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`rounded-lg px-3 py-1.5 font-bold transition-all cursor-pointer ${
                filterType === f
                  ? 'bg-blue-600 text-white shadow-xs dark:bg-red-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800/80 dark:text-zinc-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search service task, vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
          />
        </div>
      </div>

      {/* Reminders / Work Orders Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-zinc-800 dark:bg-[#0e0e13]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[10.5px] font-black uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-[#121218] dark:text-zinc-400">
                <th className="py-3 px-3.5">Asset Registration</th>
                <th className="py-3 px-3.5">Maintenance Task</th>
                <th className="py-3 px-3.5">Category</th>
                <th className="py-3 px-3.5">Target Due Date</th>
                <th className="py-3 px-3.5">Target Odometer</th>
                <th className="py-3 px-3.5">Priority</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {filteredReminders.map((rem) => (
                <tr key={rem.id} className="hover:bg-slate-50/80 transition-colors dark:hover:bg-zinc-800/40">
                  <td className="py-3 px-3.5 font-bold font-mono-num text-slate-900 dark:text-white">
                    {rem.vehicleReg}
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-slate-800 dark:text-zinc-200">
                      {rem.title || rem.category}
                    </div>
                    {rem.description && (
                      <div className="text-[10.5px] text-slate-400 truncate max-w-xs">{rem.description}</div>
                    )}
                  </td>
                  <td className="py-3 px-3.5 font-semibold text-slate-600 dark:text-zinc-300">{rem.type}</td>
                  <td className="py-3 px-3.5 font-mono-num text-slate-500 text-[11px]">{rem.dueDate}</td>
                  <td className="py-3 px-3.5 font-mono-num font-semibold text-slate-700 dark:text-zinc-300">
                    {rem.dueKm ? `${rem.dueKm.toLocaleString()} km` : 'Calendar'}
                  </td>
                  <td className="py-3 px-3.5">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        rem.priority === 'High'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          : rem.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}
                    >
                      {rem.priority}
                    </span>
                  </td>
                  <td className="py-3 px-3.5">
                    <StatusBadge status={rem.status} size="sm" />
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    {rem.status !== 'Completed' ? (
                      <button
                        onClick={() => {
                          onResolveReminder(rem.id);
                          showToast('success', 'Resolved', `${rem.title} marked completed.`);
                        }}
                        className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 cursor-pointer"
                      >
                        <Check className="h-3 w-3 inline mr-1" />
                        Complete
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px] font-semibold">Done</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SCHEDULE SERVICE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Preventive Maintenance"
        subtitle="Book workshop service order, oil change or component replacement"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3">
          <div>
            <label className="text-[10.5px] font-bold uppercase text-slate-500">Service Work Order Title *</label>
            <input
              type="text"
              placeholder="e.g. Engine 50,000 km Major Lube & Valve Inspection"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10.5px] font-bold uppercase text-slate-500">Target Vehicle *</label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.regNumber} ({v.model})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10.5px] font-bold uppercase text-slate-500">Service Category *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              >
                <option value="Service">Scheduled Preventive Service</option>
                <option value="Tyres">Tyre Retreading / Rotation</option>
                <option value="Fitness">RTO Fitness Pre-Inspection</option>
                <option value="Insurance">Insurance Renewal</option>
                <option value="PUC">Pollution Testing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10.5px] font-bold uppercase text-slate-500">Target Date *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10.5px] font-bold uppercase text-slate-500">Odometer Trigger (km)</label>
              <input
                type="number"
                value={dueKm}
                onChange={(e) => setDueKm(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-mono-num text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[10.5px] font-bold uppercase text-slate-500">Authorized Workshop Center</label>
            <input
              type="text"
              value={serviceCenter}
              onChange={(e) => setServiceCenter(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs"
            >
              Issue Work Order
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
