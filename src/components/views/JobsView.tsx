import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Download,
  Truck,
  MapPin,
  Clock,
  User,
  Radio,
  FileText,
  Calendar,
  Filter,
} from 'lucide-react';
import { Job, Vehicle, Driver, JobStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { Drawer } from '../common/Drawer';
import { useToast } from '../common/Toast';

interface JobsViewProps {
  jobs: Job[];
  vehicles: Vehicle[];
  drivers: Driver[];
  onCreateJob: (newJob: Job) => void;
  onNavigateTab: (tab: any) => void;
}

export const JobsView: React.FC<JobsViewProps> = ({
  jobs,
  vehicles,
  drivers,
  onCreateJob,
  onNavigateTab,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'All' | JobStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Job Form State
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || '');
  const [selectedDriverId, setSelectedDriverId] = useState(drivers[0]?.id || '');
  const [cargoType, setCargoType] = useState('Finished Industrial Steel Billets');
  const [cargoWeight, setCargoWeight] = useState(24.5);
  const [consignor, setConsignor] = useState('Steel Authority of India Ltd (SAIL)');
  const [consignee, setConsignee] = useState('Tata Projects Infrastructure Depot');
  const [eta, setEta] = useState('06:30 PM Today');
  const [notes, setNotes] = useState('');

  // Summary counts
  const totalCount = jobs.length;
  const runningCount = jobs.filter((j) => j.status === 'Running').length;
  const delayedCount = jobs.filter((j) => j.status === 'Delayed').length;
  const plannedCount = jobs.filter((j) => j.status === 'Planned').length;
  const completedCount = jobs.filter((j) => j.status === 'Completed').length;

  const filteredJobs = jobs.filter((j) => {
    const matchStatus = activeTab === 'All' || j.status === activeTab;
    const matchSearch =
      j.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.vehicleReg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.destination.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) {
      showToast('error', 'Validation Error', 'Origin and Destination are required');
      return;
    }

    const veh = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
    const drv = drivers.find((d) => d.id === selectedDriverId) || drivers[0];

    const newJob: Job = {
      id: `job-${Date.now()}`,
      jobNumber: `DISP-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleId: veh?.id || 'v-1',
      vehicleReg: veh?.regNumber || 'OD14AB1234',
      driverId: drv?.id || 'd-1',
      driverName: drv?.name || veh?.driverName || 'Sunil Kumar',
      origin,
      destination,
      plannedStartTime: 'Now',
      eta,
      status: 'Planned',
      distanceKm: 280,
      cargoType,
      cargoWeightTonnes: cargoWeight,
      cargoDescription: `${cargoWeight} MT ${cargoType}`,
      progress: 0,
    };

    onCreateJob(newJob);
    showToast('success', 'Dispatch Created', `Freight manifest ${newJob.jobNumber} created for ${newJob.vehicleReg}.`);
    setIsCreateModalOpen(false);
    setOrigin('');
    setDestination('');
  };

  const handleCompleteJob = (job: Job) => {
    job.status = 'Completed';
    job.progress = 100;
    showToast('success', 'Dispatch Completed', `${job.jobNumber} marked completed with electronic proof of delivery.`);
    setSelectedJob(null);
  };

  const handleExportCSV = () => {
    const headers = ['Job Number', 'Vehicle', 'Driver', 'Origin', 'Destination', 'Cargo', 'ETA', 'Status', 'Progress'];
    const rows = filteredJobs.map((j) => [
      j.jobNumber,
      j.vehicleReg,
      j.driverName,
      j.origin,
      j.destination,
      j.cargoDescription || 'Industrial Cargo',
      j.eta,
      j.status,
      `${j.progress}%`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((x) => `"${x}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dispatch-manifest-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Manifest Exported', 'CSV manifest downloaded successfully.');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <span>Home</span>
            <span className="text-slate-300 dark:text-zinc-600">/</span>
            <span>Operations</span>
            <span className="text-slate-300 dark:text-zinc-600">/</span>
            <span className="text-blue-600 dark:text-red-400 font-bold">Transport Operations</span>
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Trip Dispatch & Freight Orders
            </h1>
            <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-bold text-blue-700 font-mono-num dark:bg-red-950/70 dark:border-red-800/60 dark:text-red-400">
              {totalCount} Active Orders
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors dark:border-zinc-700 dark:bg-[#111116] dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
            <span>Export Manifest</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all dark:bg-red-600 dark:hover:bg-red-700 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Dispatch</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-[#0c0c10]">
          <span className="text-[10.5px] font-bold uppercase text-slate-500 dark:text-zinc-400">Total Dispatches</span>
          <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white font-mono-num">{totalCount}</div>
          <span className="text-[10px] text-slate-400">All registered trips</span>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 shadow-xs dark:border-blue-900/40 dark:bg-blue-950/20">
          <span className="text-[10.5px] font-bold uppercase text-blue-700 dark:text-blue-400">In Transit (Running)</span>
          <div className="mt-1 text-2xl font-black text-blue-700 dark:text-blue-300 font-mono-num">{runningCount}</div>
          <span className="text-[10px] text-blue-600/80 dark:text-blue-400">Live GPS telemetry active</span>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 shadow-xs dark:border-amber-900/40 dark:bg-amber-950/20">
          <span className="text-[10.5px] font-bold uppercase text-amber-700 dark:text-amber-400">Delayed / Bottleneck</span>
          <div className="mt-1 text-2xl font-black text-amber-700 dark:text-amber-300 font-mono-num">{delayedCount}</div>
          <span className="text-[10px] text-amber-600/80 dark:text-amber-400">Toll or dock hold-ups</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-[#0c0c10]">
          <span className="text-[10.5px] font-bold uppercase text-slate-500 dark:text-zinc-400">Planned / Staging</span>
          <div className="mt-1 text-2xl font-black text-slate-800 dark:text-zinc-200 font-mono-num">{plannedCount}</div>
          <span className="text-[10px] text-slate-400">Ready for dock departure</span>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 shadow-xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <span className="text-[10.5px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Completed (Delivered)</span>
          <div className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono-num">{completedCount}</div>
          <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400">ePOD confirmed</span>
        </div>
      </div>

      {/* Status Tabs and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs dark:bg-[#0e0e13] dark:border-zinc-800">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs">
          {(['All', 'Planned', 'Running', 'Delayed', 'Completed'] as const).map((tab) => {
            const count = tab === 'All' ? jobs.length : jobs.filter((j) => j.status === tab).length;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs dark:bg-red-600'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`rounded px-1.5 py-0.2 text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search job #, route, vehicle, driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-700 dark:bg-[#14141a] dark:text-white dark:placeholder:text-zinc-500"
          />
        </div>
      </div>

      {/* Jobs Data Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-zinc-800 dark:bg-[#0e0e13]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[10.5px] font-black uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-[#121218] dark:text-zinc-400">
                <th className="py-3 px-3.5">Dispatch / Job No</th>
                <th className="py-3 px-3.5">Assigned Asset</th>
                <th className="py-3 px-3.5">Driver</th>
                <th className="py-3 px-3.5">Origin Facility</th>
                <th className="py-3 px-3.5">Destination Hub</th>
                <th className="py-3 px-3.5">Departure</th>
                <th className="py-3 px-3.5">ETA</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Transit Progress</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 dark:text-zinc-500">
                    <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">No transport dispatches match your filter.</p>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className="cursor-pointer hover:bg-slate-50/80 transition-colors dark:hover:bg-zinc-800/40"
                  >
                    <td className="py-3 px-3.5 font-bold font-mono-num text-blue-700 dark:text-blue-400">
                      {job.jobNumber}
                    </td>
                    <td className="py-3 px-3.5 font-mono-num font-bold text-slate-800 dark:text-zinc-100">
                      {job.vehicleReg}
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 font-medium dark:text-zinc-200">{job.driverName}</td>
                    <td className="py-3 px-3.5 text-slate-600 max-w-[150px] truncate text-[11px] dark:text-zinc-400">
                      {job.origin}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 max-w-[150px] truncate text-[11px] dark:text-zinc-400">
                      {job.destination}
                    </td>
                    <td className="py-3 px-3.5 text-slate-500 text-[11px] dark:text-zinc-400">{job.plannedStartTime}</td>
                    <td className="py-3 px-3.5 font-semibold text-slate-800 dark:text-zinc-200">{job.eta}</td>
                    <td className="py-3 px-3.5">
                      <StatusBadge status={job.status} size="sm" />
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-18 rounded-full bg-slate-100 overflow-hidden dark:bg-zinc-800">
                          <div
                            className={`h-full rounded-full transition-all ${
                              job.status === 'Delayed'
                                ? 'bg-amber-500'
                                : job.status === 'Completed'
                                ? 'bg-emerald-500'
                                : 'bg-blue-600 dark:bg-red-500'
                            }`}
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <span className="font-mono-num font-bold text-[10.5px] text-slate-700 dark:text-zinc-300">
                          {job.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            onNavigateTab('realtime');
                          }}
                          title="Track Live on GPS Radar"
                          className="rounded-md border border-slate-200 bg-white p-1 text-slate-500 hover:border-blue-300 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-white"
                        >
                          <Radio className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10.5px] font-bold text-slate-700 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:text-white"
                        >
                          <Eye className="h-3 w-3 inline mr-1" />
                          View ePOD
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE DISPATCH MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Freight Dispatch Order"
        subtitle="Issue new transport consignment, assign commercial vehicle and dispatch driver"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-slate-800 dark:text-zinc-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Vehicle Assignment *
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.regNumber} ({v.model}) - {v.status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Driver Assignment *
              </label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.contact})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Consignor (Shipper)
              </label>
              <input
                type="text"
                value={consignor}
                onChange={(e) => setConsignor(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Consignee (Receiver)
              </label>
              <input
                type="text"
                value={consignee}
                onChange={(e) => setConsignee(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Origin / Loading Dock *
              </label>
              <input
                type="text"
                placeholder="e.g. RSP Plant Gate 3, Rourkela"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Destination / Unloading Hub *
              </label>
              <input
                type="text"
                placeholder="e.g. Central Depot, Bhubaneswar"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Cargo Description
              </label>
              <input
                type="text"
                value={cargoType}
                onChange={(e) => setCargoType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Net Weight (MT)
              </label>
              <input
                type="number"
                step="0.1"
                value={cargoWeight}
                onChange={(e) => setCargoWeight(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white font-mono-num"
              />
            </div>
            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Delivery Target ETA
              </label>
              <input
                type="text"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs dark:bg-red-600 dark:hover:bg-red-700 cursor-pointer"
            >
              Confirm & Dispatch
            </button>
          </div>
        </form>
      </Modal>

      {/* JOB DETAILS & ePOD DRAWER */}
      {selectedJob && (
        <Drawer
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          title={`Dispatch Order: ${selectedJob.jobNumber}`}
          subtitle={`Freight manifest for ${selectedJob.vehicleReg}`}
          width="lg"
        >
          <div className="space-y-4 text-slate-800 dark:text-zinc-200">
            {/* Top Status Banner */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-200 dark:bg-[#121218] dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedJob.status} size="md" />
                <span className="text-xs font-bold font-mono-num text-slate-700 dark:text-zinc-300">
                  {selectedJob.progress}% Completed
                </span>
              </div>
              {selectedJob.status !== 'Completed' && (
                <button
                  onClick={() => handleCompleteJob(selectedJob)}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                >
                  Mark Completed (ePOD)
                </button>
              )}
            </div>

            {/* Route Map Card */}
            <div className="rounded-xl border border-slate-200 p-3.5 bg-white space-y-3 dark:border-zinc-800 dark:bg-[#121218]">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Transit Corridor
              </span>
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center mt-1">
                  <div className="h-3 w-3 rounded-full bg-blue-600 dark:bg-red-500" />
                  <div className="h-10 w-0.5 bg-slate-200 dark:bg-zinc-700 my-0.5" />
                  <div className="h-3 w-3 rounded-full bg-emerald-600" />
                </div>
                <div className="space-y-3 flex-1 text-xs">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400">LOADING ORIGIN</div>
                    <div className="font-bold text-slate-900 dark:text-white">{selectedJob.origin}</div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Departure: {selectedJob.plannedStartTime}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400">DESTINATION HUB</div>
                    <div className="font-bold text-slate-900 dark:text-white">{selectedJob.destination}</div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400">Target ETA: {selectedJob.eta}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Asset & Personnel */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-3 bg-white dark:border-zinc-800 dark:bg-[#121218]">
                <div className="text-[10px] font-bold text-slate-400">COMMERCIAL ASSET</div>
                <div className="font-bold text-slate-900 dark:text-white mt-1 font-mono-num">{selectedJob.vehicleReg}</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">AIS-140 GPS Active</div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 bg-white dark:border-zinc-800 dark:bg-[#121218]">
                <div className="text-[10px] font-bold text-slate-400">DESIGNATED PILOT</div>
                <div className="font-bold text-slate-900 dark:text-white mt-1">{selectedJob.driverName}</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">Heavy Commercial Class</div>
              </div>
            </div>

            {/* Consignment Specs */}
            <div className="rounded-xl border border-slate-200 p-3.5 bg-white space-y-2 dark:border-zinc-800 dark:bg-[#121218]">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Consignment Details
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">Cargo Manifest:</span>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedJob.cargoDescription || 'Industrial Cargo'}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">e-Way Bill Reference:</span>
                  <p className="font-mono-num font-bold text-blue-600 dark:text-blue-400">EWB-2109884419</p>
                </div>
              </div>
            </div>

            {/* Electronic Proof of Delivery (ePOD) */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="h-4 w-4" />
                <span>Electronic Proof of Delivery (ePOD) Workflow</span>
              </div>
              <p className="text-[11px] text-emerald-700/80 mt-1 dark:text-emerald-400/80">
                Digital consignee signature, geofence timestamp at receiver dock, and weight bridge weighment slip attached.
              </p>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
};
