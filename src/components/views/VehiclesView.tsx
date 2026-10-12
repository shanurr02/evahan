import React, { useState, useMemo } from 'react';
import {
  Truck,
  Plus,
  Search,
  Download,
  Eye,
  UserCheck,
  Cpu,
  FileText,
  AlertTriangle,
  History,
  Briefcase,
  Wrench,
  Fuel,
  Siren,
  Layers,
  Radio,
  Clock,
  Gauge,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { Vehicle, Driver } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

interface VehiclesViewProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  selectedVehicle: Vehicle | null;
  onSelectVehicle: (vehicle: Vehicle | null) => void;
  onNavigateTab: (tab: any) => void;
  onAddVehicle: (newVehicle: Partial<Vehicle>) => void;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({
  vehicles,
  drivers,
  selectedVehicle,
  onSelectVehicle,
  onNavigateTab,
  onAddVehicle,
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [groupFilter, setGroupFilter] = useState('All');
  const [detailTab, setDetailTab] = useState<
    'summary' | 'realtime' | 'history' | 'jobs' | 'maintenance' | 'fuel' | 'documents' | 'alarms'
  >('summary');

  // Add vehicle modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newReg, setNewReg] = useState('');
  const [newModel, setNewModel] = useState('Tata 1612 Heavy Truck');
  const [newGroup, setNewGroup] = useState('Rourkela North');
  const [newDriverId, setNewDriverId] = useState(drivers[0]?.id || '');
  const [newFuelType, setNewFuelType] = useState<'Diesel' | 'CNG' | 'Electric'>('Diesel');

  // Driver Assignment modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningVehicle, setAssigningVehicle] = useState<Vehicle | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');

  const runningCount = vehicles.filter((v) => v.status === 'Running').length;
  const idleCount = vehicles.filter((v) => v.status === 'Idle').length;
  const parkedCount = vehicles.filter((v) => v.status === 'Parked').length;
  const compliantCount = vehicles.filter((v) => v.documentsStatus === 'Valid').length;

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchSearch =
        v.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.driverName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'All' || v.status === statusFilter;
      const matchGroup = groupFilter === 'All' || v.group === groupFilter;
      return matchSearch && matchStatus && matchGroup;
    });
  }, [vehicles, searchQuery, statusFilter, groupFilter]);

  const groups = useMemo(() => {
    return ['All', ...Array.from(new Set(vehicles.map((v) => v.group)))];
  }, [vehicles]);

  const handleCreateVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReg) return;
    const assignedDriver = drivers.find((d) => d.id === newDriverId);

    const vehicle: Partial<Vehicle> = {
      regNumber: newReg.toUpperCase(),
      model: newModel,
      make: newModel.split(' ')[0],
      year: 2024,
      group: newGroup,
      fuelType: newFuelType,
      driverId: newDriverId,
      driverName: assignedDriver ? assignedDriver.name : 'Unassigned',
      deviceId: `FC-TEL-${Math.floor(1000 + Math.random() * 9000)}`,
      deviceType: 'OBD-II Telematics Pro',
      deviceStatus: 'Working',
      status: 'Parked',
      speed: 0,
      heading: 0,
      lat: 22.2492,
      lng: 84.8828,
      locationName: `${newGroup} Fleet Depot Yard`,
      ignition: 'OFF',
      batteryVoltage: 24.2,
      fuelLevel: 85,
      odometer: 12000,
      todayDistance: 0,
      todayRunningTime: '0h 00m',
      todayIdleTime: '0m',
      todayStopTime: '0m',
      avgSpeed: 0,
      mileage: 4.8,
      lastUpdated: 'Just now',
      activeAlarmsCount: 0,
      documentsStatus: 'Valid',
      dailyUtilization: 0,
    };

    onAddVehicle(vehicle);
    setIsAddModalOpen(false);
    setNewReg('');
    showToast('success', 'Vehicle Enrolled', `Asset ${vehicle.regNumber} registered to fleet.`);
  };

  const handleAssignDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningVehicle) return;
    const drv = drivers.find((d) => d.id === selectedDriverId);
    if (drv) {
      assigningVehicle.driverId = drv.id;
      assigningVehicle.driverName = drv.name;
      showToast('success', 'Driver Assigned', `${drv.name} assigned to ${assigningVehicle.regNumber}.`);
    }
    setIsAssignModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = [
      'Registration',
      'Model',
      'Hub Group',
      'Fuel Type',
      'Driver Name',
      'Device ID',
      'Status',
      'Odometer',
      'Fuel Level',
    ];
    const rows = filteredVehicles.map((v) => [
      v.regNumber,
      v.model,
      v.group,
      v.fuelType,
      v.driverName,
      v.deviceId,
      v.status,
      v.odometer,
      `${v.fuelLevel}%`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((x) => `"${x}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fleet-roster-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Roster Exported', 'Fleet roster CSV downloaded.');
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <span>Home</span>
            <span className="text-slate-300 dark:text-zinc-600">/</span>
            <span>Fleet Operations</span>
            <span className="text-slate-300 dark:text-zinc-600">/</span>
            <span className="text-blue-600 dark:text-red-400 font-bold">Fleet Management</span>
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Fleet Asset Registry & Telematics
            </h1>
            <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-bold text-blue-700 font-mono-num dark:bg-red-950/70 dark:border-red-800/60 dark:text-red-400">
              {vehicles.length} Units Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors dark:border-zinc-700 dark:bg-[#111116] dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
            <span>Export Roster</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all dark:bg-red-600 dark:hover:bg-red-700 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Enroll Asset</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-[#0c0c10]">
          <span className="text-[10.5px] font-bold uppercase text-slate-500 dark:text-zinc-400">Total Fleet Size</span>
          <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white font-mono-num">{vehicles.length}</div>
          <span className="text-[10px] text-slate-400">Heavy multi-axle & trailers</span>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 shadow-xs dark:border-blue-900/40 dark:bg-blue-950/20">
          <span className="text-[10.5px] font-bold uppercase text-blue-700 dark:text-blue-400">On Road (In Transit)</span>
          <div className="mt-1 text-2xl font-black text-blue-700 dark:text-blue-300 font-mono-num">{runningCount}</div>
          <span className="text-[10px] text-blue-600/80">Active high-speed corridors</span>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 shadow-xs dark:border-amber-900/40 dark:bg-amber-950/20">
          <span className="text-[10.5px] font-bold uppercase text-amber-700 dark:text-amber-400">Idling at Docks</span>
          <div className="mt-1 text-2xl font-black text-amber-700 dark:text-amber-300 font-mono-num">{idleCount}</div>
          <span className="text-[10px] text-amber-600/80">Ignition ON stationary</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-[#0c0c10]">
          <span className="text-[10.5px] font-bold uppercase text-slate-500 dark:text-zinc-400">Parked / Depot Yard</span>
          <div className="mt-1 text-2xl font-black text-slate-800 dark:text-zinc-200 font-mono-num">{parkedCount}</div>
          <span className="text-[10px] text-slate-400">Available for next dispatch</span>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 shadow-xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <span className="text-[10.5px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Compliant Documents</span>
          <div className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono-num">{compliantCount}</div>
          <span className="text-[10px] text-emerald-600/80">RTO certificates valid</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs dark:bg-[#0e0e13] dark:border-zinc-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search registration, driver, chassis model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-bold text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
          >
            <option value="All">All Statuses</option>
            <option value="Running">Running</option>
            <option value="Idle">Idle</option>
            <option value="Parked">Parked</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-bold text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
          >
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vehicles Main Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-zinc-800 dark:bg-[#0e0e13]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[10.5px] font-black uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-[#121218] dark:text-zinc-400">
                <th className="py-3 px-3.5">Registration</th>
                <th className="py-3 px-3.5">Make & Model</th>
                <th className="py-3 px-3.5">Depot Hub</th>
                <th className="py-3 px-3.5">Fuel Type</th>
                <th className="py-3 px-3.5">Assigned Pilot</th>
                <th className="py-3 px-3.5">AIS-140 GPS Device</th>
                <th className="py-3 px-3.5">Live Status</th>
                <th className="py-3 px-3.5">Compliance</th>
                <th className="py-3 px-3.5">Last Telemetry</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {filteredVehicles.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => onSelectVehicle(v)}
                  className="cursor-pointer hover:bg-slate-50/80 transition-colors dark:hover:bg-zinc-800/40"
                >
                  <td className="py-3 px-3.5 font-bold text-blue-700 font-mono-num dark:text-blue-400">
                    {v.regNumber}
                  </td>
                  <td className="py-3 px-3.5 text-slate-800 font-bold dark:text-zinc-200">{v.model}</td>
                  <td className="py-3 px-3.5 text-slate-600 dark:text-zinc-400">{v.group}</td>
                  <td className="py-3 px-3.5">
                    <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10.5px] font-bold text-slate-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300">
                      {v.fuelType}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 font-semibold text-slate-800 dark:text-zinc-200">{v.driverName}</td>
                  <td className="py-3 px-3.5">
                    <div className="font-mono-num text-[11px] font-bold text-slate-700 dark:text-zinc-300">{v.deviceId}</div>
                    <span className="text-[10px] text-slate-400">{v.deviceType}</span>
                  </td>
                  <td className="py-3 px-3.5">
                    <StatusBadge status={v.status} size="sm" />
                  </td>
                  <td className="py-3 px-3.5">
                    <StatusBadge status={v.documentsStatus} size="sm" />
                  </td>
                  <td className="py-3 px-3.5 text-slate-500 text-[11px] dark:text-zinc-400">{v.lastUpdated}</td>
                  <td className="py-3 px-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectVehicle(v)}
                        className="rounded-lg border border-slate-200 bg-white p-1 text-slate-600 hover:text-blue-600 hover:border-blue-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        title="View Full Detail"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setAssigningVehicle(v);
                          setSelectedDriverId(v.driverId);
                          setIsAssignModalOpen(true);
                        }}
                        className="rounded-lg border border-slate-200 bg-white p-1 text-slate-600 hover:text-blue-600 hover:border-blue-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        title="Reassign Driver"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          onSelectVehicle(v);
                          onNavigateTab('realtime');
                        }}
                        className="rounded-lg border border-slate-200 bg-white p-1 text-slate-600 hover:text-blue-600 hover:border-blue-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        title="Track Live Radar"
                      >
                        <Radio className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VEHICLE DETAIL MODAL */}
      {selectedVehicle && (
        <Modal
          isOpen={Boolean(selectedVehicle)}
          onClose={() => onSelectVehicle(null)}
          title={`Asset: ${selectedVehicle.regNumber}`}
          subtitle={`${selectedVehicle.model} • ${selectedVehicle.group} • Driver: ${selectedVehicle.driverName}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-slate-800 dark:text-zinc-200">
            {/* Quick Status Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 dark:bg-zinc-800/80 dark:border-zinc-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Telemetry Status</span>
                <div className="mt-0.5"><StatusBadge status={selectedVehicle.status} size="sm" /></div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 dark:bg-zinc-800/80 dark:border-zinc-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Odometer</span>
                <div className="mt-0.5 font-bold font-mono-num text-sm text-slate-900 dark:text-white">
                  {selectedVehicle.odometer?.toLocaleString()} km
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 dark:bg-zinc-800/80 dark:border-zinc-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Fuel Level</span>
                <div className="mt-0.5 font-bold font-mono-num text-sm text-blue-600">
                  {selectedVehicle.fuelLevel}% ({Math.round(((selectedVehicle.fuelLevel || 50) / 100) * 350)} L)
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 dark:bg-zinc-800/80 dark:border-zinc-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Battery Voltage</span>
                <div className="mt-0.5 font-bold font-mono-num text-sm text-emerald-600">
                  {selectedVehicle.batteryVoltage} V (Normal)
                </div>
              </div>
            </div>

            {/* Location & Speed */}
            <div className="rounded-xl border border-slate-200 p-3.5 space-y-2 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live GPS Location</span>
                <span className="text-xs font-mono-num font-bold text-slate-700 dark:text-zinc-300">
                  {selectedVehicle.lat.toFixed(4)}° N, {selectedVehicle.lng.toFixed(4)}° E
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedVehicle.locationName}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-zinc-800">
                <span>Speed: <strong className="text-slate-800 dark:text-zinc-200">{selectedVehicle.speed} km/h</strong></span>
                <span>Ignition: <strong className="text-slate-800 dark:text-zinc-200">{selectedVehicle.ignition}</strong></span>
                <span>Last Ping: <strong>{selectedVehicle.lastUpdated}</strong></span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
              <button
                onClick={() => {
                  onNavigateTab('realtime');
                }}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs"
              >
                Open in Real-time GPS Radar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ENROLL ASSET MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Enroll New Commercial Vehicle"
        subtitle="Register heavy commercial chassis into fleet ERP database"
      >
        <form onSubmit={handleCreateVehicleSubmit} className="space-y-3">
          <div>
            <label className="text-[10.5px] font-bold uppercase text-slate-500">Registration Number *</label>
            <input
              type="text"
              placeholder="e.g. OD14XY9988"
              value={newReg}
              onChange={(e) => setNewReg(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-mono-num font-bold uppercase text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10.5px] font-bold uppercase text-slate-500">Make & Model *</label>
              <input
                type="text"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10.5px] font-bold uppercase text-slate-500">Operating Depot *</label>
              <select
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              >
                <option value="Rourkela North">Rourkela North Hub</option>
                <option value="Bhubaneswar Central">Bhubaneswar Central DC</option>
                <option value="Jharsuguda Yard">Jharsuguda Smelter Yard</option>
                <option value="Patna Logistics">Patna FMCG Stockyard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10.5px] font-bold uppercase text-slate-500">Fuel Type *</label>
              <select
                value={newFuelType}
                onChange={(e) => setNewFuelType(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              >
                <option value="Diesel">High Speed Diesel (HSD)</option>
                <option value="CNG">Compressed Natural Gas (CNG)</option>
                <option value="Electric">Commercial EV Battery</option>
              </select>
            </div>
            <div>
              <label className="text-[10.5px] font-bold uppercase text-slate-500">Assigned Driver</label>
              <select
                value={newDriverId}
                onChange={(e) => setNewDriverId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs"
            >
              Enroll Vehicle
            </button>
          </div>
        </form>
      </Modal>

      {/* REASSIGN DRIVER MODAL */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Reassign Commercial Pilot"
        subtitle={`Select licensed commercial driver for ${assigningVehicle?.regNumber}`}
      >
        <form onSubmit={handleAssignDriverSubmit} className="space-y-3">
          <div>
            <label className="text-[10.5px] font-bold uppercase text-slate-500">Commercial Pilot *</label>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.contact}) - License: {d.licenseNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
