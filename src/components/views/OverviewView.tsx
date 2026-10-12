import React, { useState, useMemo } from 'react';
import {
  Truck,
  PlayCircle,
  Clock,
  Square,
  AlertOctagon,
  Percent,
  Navigation,
  Gauge,
  Siren,
  Fuel,
  Activity,
  SlidersHorizontal,
  Download,
  ArrowUpDown,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Radio,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Vehicle, AlarmEvent } from '../../types';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import { useToast } from '../common/Toast';

interface OverviewViewProps {
  vehicles: Vehicle[];
  alarms?: AlarmEvent[];
  onSelectVehicle: (vehicle: Vehicle) => void;
  onNavigateTab: (tab: any) => void;
  dateRange?: string;
  jobs?: any[];
  reminders?: any[];
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  vehicles = [],
  alarms = [],
  onSelectVehicle,
  onNavigateTab,
  dateRange = 'Today (Live)',
}) => {
  const { showToast } = useToast();
  const [tableSearch, setTableSearch] = useState('');
  const [tableStatusFilter, setTableStatusFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<keyof Vehicle>('todayDistance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const itemsPerPage = 6;

  // Widget visibility state
  const [visibleWidgets, setVisibleWidgets] = useState({
    runningStatus: true,
    dailyUtilization: true,
    deviceStatus: true,
    driverAssignment: true,
    topAlarms: true,
    alarmTrend: true,
    fuelConsumption: true,
    groupDistribution: true,
    modelType: true,
    distanceAnalysis: true,
  });

  // High-level KPIs
  const totalVehicles = vehicles.length;
  const runningVehicles = vehicles.filter((v) => v.status === 'Running').length;
  const idleVehicles = vehicles.filter((v) => v.status === 'Idle').length;
  const parkedVehicles = vehicles.filter((v) => v.status === 'Parked').length;
  const inactiveVehicles = vehicles.filter((v) => v.status === 'Inactive').length;

  const totalDistance = vehicles.reduce((sum, v) => sum + v.todayDistance, 0).toFixed(1);
  const avgUtilization = Math.round(
    vehicles.reduce((sum, v) => sum + (v.dailyUtilization || 0), 0) / (totalVehicles || 1)
  );
  const avgSpeed = Math.round(
    vehicles.filter((v) => v.status === 'Running').reduce((sum, v) => sum + v.speed, 0) /
      (runningVehicles || 1)
  );
  const totalAlarmsCount = alarms.length;
  const totalFuelLiters = 845;
  const avgMileage = (
    vehicles.reduce((sum, v) => sum + (v.mileage || 0), 0) / (totalVehicles || 1)
  ).toFixed(1);

  // Status donut chart data
  const statusChartData = [
    { name: 'Running', value: runningVehicles, color: '#10b981' },
    { name: 'Idle', value: idleVehicles, color: '#f59e0b' },
    { name: 'Parked', value: parkedVehicles, color: '#64748b' },
    { name: 'Inactive', value: inactiveVehicles, color: '#ef4444' },
  ];

  // Daily Utilization time series
  const utilizationTrendData = [
    { day: 'Mon', rate: 74, target: 80 },
    { day: 'Tue', rate: 82, target: 80 },
    { day: 'Wed', rate: 85, target: 80 },
    { day: 'Thu', rate: 79, target: 80 },
    { day: 'Fri', rate: 91, target: 80 },
    { day: 'Sat', rate: 88, target: 80 },
    { day: 'Sun (Now)', rate: avgUtilization, target: 80 },
  ];

  // Alarm Trend data
  const alarmTrendData = [
    { time: '00:00', overspeed: 0, idling: 1 },
    { time: '04:00', overspeed: 1, idling: 0 },
    { time: '08:00', overspeed: 3, idling: 2 },
    { time: '12:00', overspeed: 2, idling: 3 },
    { time: '16:00', overspeed: 4, idling: 1 },
    { time: '20:00', overspeed: 1, idling: 2 },
  ];

  // Group Distribution
  const groupData = [
    { group: 'Rourkela North', count: 2, running: 1 },
    { group: 'Jharsuguda Core', count: 1, running: 1 },
    { group: 'Patna Freight', count: 2, running: 0 },
    { group: 'Ranchi Industrial', count: 2, running: 1 },
    { group: 'Bhubaneswar Port', count: 2, running: 1 },
  ];

  // Model breakdown
  const modelData = [
    { model: 'Tata 1612 LPT', count: 2 },
    { model: 'BharatBenz 2523R', count: 2 },
    { model: 'Eicher 16T Pro', count: 2 },
    { model: 'Ashok Leyland 1618', count: 2 },
  ];

  // Fuel consumption by group
  const fuelByGroup = [
    { name: 'Rourkela', fuel: 245, cost: '₹22,600' },
    { name: 'Jharsuguda', fuel: 215, cost: '₹19,850' },
    { name: 'Ranchi', fuel: 198, cost: '₹18,300' },
    { name: 'Patna', fuel: 110, cost: '₹10,200' },
    { name: 'Bhubaneswar', fuel: 77, cost: '₹7,150' },
  ];

  // Distance brackets
  const distanceBrackets = [
    { bracket: '< 50 km', vehicles: 1 },
    { bracket: '50-100 km', vehicles: 2 },
    { bracket: '100-200 km', vehicles: 3 },
    { bracket: '> 200 km', vehicles: 2 },
  ];

  // Top 5 vehicles with most alarms
  const vehiclesWithAlarms = useMemo(() => {
    return [...vehicles]
      .sort((a, b) => (b.activeAlarmsCount || 0) - (a.activeAlarmsCount || 0))
      .slice(0, 5);
  }, [vehicles]);

  // Filter & sort performance table
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((v) => {
        const matchesSearch =
          v.regNumber.toLowerCase().includes(tableSearch.toLowerCase()) ||
          v.driverName.toLowerCase().includes(tableSearch.toLowerCase()) ||
          v.group.toLowerCase().includes(tableSearch.toLowerCase());
        const matchesStatus =
          tableStatusFilter === 'All' || v.status === tableStatusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
        return sortOrder === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [vehicles, tableSearch, tableStatusFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportTable = () => {
    showToast(
      'success',
      'Telemetry CSV Export Ready',
      `Exported ${filteredVehicles.length} performance records for ${dateRange}.`
    );
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <span>Fleet</span>
            <span className="text-slate-300 dark:text-zinc-600">/</span>
            <span className="text-blue-600 dark:text-red-400 font-bold">Dashboard Tower</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Fleet Operations Dashboard
            </h1>
            <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-bold text-blue-700 animate-pulse dark:bg-red-950/70 dark:border-red-800/60 dark:text-red-400">
              LIVE MONITOR
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Realtime telemetry, efficiency metrics & operational compliance for{' '}
            <span className="font-semibold text-slate-700 dark:text-zinc-300">{dateRange}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('realtime')}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all dark:bg-red-600 dark:hover:bg-red-700 cursor-pointer"
          >
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span>Open Radar Map</span>
          </button>

          <button
            onClick={() => setShowCustomizer(!showCustomizer)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors dark:border-zinc-700 dark:bg-[#111116] dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer shadow-2xs"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
            <span>Layout</span>
          </button>
        </div>
      </div>

      {/* Widget Customizer drawer / dropdown */}
      {showCustomizer && (
        <div className="rounded-lg border border-red-900/40 bg-[#120a13] p-3 transition-all">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10.5px] font-bold uppercase tracking-wider text-red-400">
              Customize Telemetry Dashboard Panels
            </h3>
            <button
              onClick={() => setShowCustomizer(false)}
              className="text-[11px] font-bold text-red-400 hover:underline"
            >
              Done
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-1.5 text-xs">
            {Object.entries(visibleWidgets).map(([key, visible]) => (
              <label
                key={key}
                className="flex items-center gap-2 rounded bg-[#0b0f1a] p-1.5 border border-[#1e263c] cursor-pointer hover:border-red-500/40"
              >
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={(e) =>
                    setVisibleWidgets((prev) => ({ ...prev, [key]: e.target.checked }))
                  }
                  className="rounded text-red-600 focus:ring-red-500/30"
                />
                <span className="capitalize text-zinc-300 text-[10.5px] truncate">
                  {key.replace(/([A-Z])/g, ' $1')}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 14 COMPACT KPI CARDS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400">
            Fleet Telemetry Key Performance Indicators (14 Critical Tiles)
          </h2>
          <span className="text-[10px] text-zinc-500">Compact high-density stream</span>
        </div>

        {/* Row 1: Fleet Count & Operational Status */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <KpiCard
            icon={Truck}
            label="Total Units"
            value={totalVehicles}
            unit="assets"
            trend={{ value: '100%', positive: true, label: 'online' }}
            context="Across 5 Hubs"
            color="red"
            onClick={() => onNavigateTab('vehicles')}
          />
          <KpiCard
            icon={PlayCircle}
            label="Running"
            value={runningVehicles}
            unit="active"
            trend={{ value: `${Math.round((runningVehicles / totalVehicles) * 100)}%`, positive: true, label: 'transit' }}
            context="Speed > 0 km/h"
            color="emerald"
            onClick={() => onNavigateTab('realtime')}
          />
          <KpiCard
            icon={Clock}
            label="Idle Halts"
            value={idleVehicles}
            unit="halted"
            trend={{ value: `${idleVehicles} units`, positive: false, label: 'ign on' }}
            context="Halts & Tolls"
            color="amber"
            onClick={() => onNavigateTab('realtime')}
          />
          <KpiCard
            icon={Square}
            label="Parked / Stopped"
            value={parkedVehicles}
            unit="docked"
            trend={{ value: `${parkedVehicles} units`, positive: true, neutral: true, label: 'ign off' }}
            context="Depots & Bays"
            color="slate"
            onClick={() => onNavigateTab('vehicles')}
          />
          <KpiCard
            icon={AlertOctagon}
            label="Grounded / Inactive"
            value={inactiveVehicles}
            unit="repair"
            trend={{ value: '1 workshop', positive: false, label: 'offline' }}
            context="Bay 4 maintenance"
            color="rose"
            onClick={() => onNavigateTab('alarms')}
          />
        </div>

        {/* Row 2: Operational Efficiency & Dynamics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <KpiCard
            icon={Percent}
            label="Utilisation"
            value={avgUtilization}
            unit="%"
            trend={{ value: '+5.4%', positive: true }}
            context="SLA Target: 80%"
            color="emerald"
            onClick={() => onNavigateTab('reports')}
          />
          <KpiCard
            icon={Navigation}
            label="Today Distance"
            value={totalDistance}
            unit="km"
            trend={{ value: '+12.8%', positive: true }}
            context="Aggregated"
            color="red"
            onClick={() => onNavigateTab('reports')}
          />
          <KpiCard
            icon={Gauge}
            label="Average Speed"
            value={avgSpeed}
            unit="km/h"
            trend={{ value: 'Norm: 50-60', positive: true, neutral: true }}
            context="Corridor lanes"
            color="red"
            onClick={() => onNavigateTab('realtime')}
          />
          <KpiCard
            icon={Siren}
            label="Active Alarms"
            value={totalAlarmsCount}
            unit="alerts"
            trend={{ value: '2 Critical', positive: false }}
            context="Overspeed / SOS"
            color="red"
            onClick={() => onNavigateTab('alarms')}
          />
          <KpiCard
            icon={Fuel}
            label="Fuel Consumed"
            value={totalFuelLiters}
            unit="L"
            trend={{ value: '₹78,400 est.', positive: true, neutral: true }}
            context="HSD Fuel"
            color="amber"
            onClick={() => onNavigateTab('finance')}
          />
        </div>

        {/* Row 3: Averages & Maintenance Uptime */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <KpiCard
            icon={Activity}
            label="Average Mileage"
            value={avgMileage}
            unit="km/L"
            trend={{ value: '+0.3 km/L', positive: true }}
            context="Heavy rigid"
            color="emerald"
            onClick={() => onNavigateTab('finance')}
          />
          <KpiCard
            icon={Clock}
            label="Telemetry Uptime"
            value="98.4"
            unit="%"
            trend={{ value: '+0.8%', positive: true }}
            context="AIS-140 feed"
            color="red"
            onClick={() => onNavigateTab('settings')}
          />
          <KpiCard
            icon={Clock}
            label="Average Idling"
            value="34"
            unit="mins"
            trend={{ value: '-8 mins', positive: true }}
            context="Within tolerance"
            color="amber"
            onClick={() => onNavigateTab('reports')}
          />
          <KpiCard
            icon={Square}
            label="Average Stoppage"
            value="1h 48m"
            unit=""
            trend={{ value: 'Scheduled', positive: true, neutral: true }}
            context="Per trip loop"
            color="slate"
            onClick={() => onNavigateTab('reports')}
          />
        </div>
      </div>

      {/* DASHBOARD CHARTS SECTION */}
      <div className="space-y-4">
        <h2 className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400">
          Telemetry & Operational Analytics
        </h2>

        {/* Row 1: Running Status Donut + Daily Utilization Line Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {visibleWidgets.runningStatus && (
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-[#1b2336] dark:bg-[#0d1322]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-[#1c263d]">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    1. Running Status Breakdown
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-400">Active fleet partition allocation</p>
                </div>
                <button
                  onClick={() => onNavigateTab('realtime')}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 dark:text-red-400 cursor-pointer"
                >
                  <span>Radar</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>

              <div className="mt-2 h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val} vehicles`, 'Status']}
                      contentStyle={{
                        backgroundColor: '#0d1322',
                        borderColor: '#222c42',
                        color: '#fff',
                        borderRadius: '6px',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-1 grid grid-cols-2 gap-1 text-[11px] border-t border-slate-100 dark:border-[#1a2338] pt-2">
                {statusChartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between px-1 py-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-500 dark:text-zinc-400">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono-num dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {visibleWidgets.dailyUtilization && (
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-[#1b2336] dark:bg-[#0d1322] lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-[#1c263d]">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    2. Daily Fleet Utilisation (% Rate)
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-400">Actual daily running vs 80% SLA target</p>
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-red-500" />
                    <span className="text-zinc-300">Achieved %</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-zinc-600" />
                    <span className="text-zinc-400">SLA Target (80%)</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={utilizationTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#182136" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#808ea0' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#808ea0' }} unit="%" />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Utilisation']}
                      contentStyle={{
                        backgroundColor: '#0d1322',
                        borderColor: '#222c42',
                        color: '#fff',
                        borderRadius: '6px',
                        fontSize: '11px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="#ef4444"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#ef4444' }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#475569"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Row 2: Device Status, Driver Assignment & Top 5 Alarms */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {visibleWidgets.deviceStatus && (
            <div className="rounded-lg border border-[#1b2336] bg-[#0d1322] p-3 shadow-sm">
              <div className="border-b border-[#1c263d] pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  3. Telematics Device Health
                </h3>
                <p className="text-[10px] text-zinc-400">OBD-II & CANBus hardware status</p>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-md bg-emerald-950/40 p-2 border border-emerald-800/40">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="font-semibold text-emerald-300 text-[11px]">Working & Transmitting</span>
                  </div>
                  <span className="font-bold text-emerald-400 font-mono-num text-xs">7 units</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-red-950/40 p-2 border border-red-800/50">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-3.5 w-3.5 text-red-400" />
                    <span className="font-semibold text-red-300 text-[11px]">Not Working (Offline)</span>
                  </div>
                  <span className="font-bold text-red-400 font-mono-num text-xs">1 unit</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-[#121929] p-2 border border-[#222c42]">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="font-semibold text-zinc-400 text-[11px]">Decommissioned / Spares</span>
                  </div>
                  <span className="font-bold text-zinc-400 font-mono-num text-xs">0 units</span>
                </div>
              </div>
            </div>
          )}

          {visibleWidgets.driverAssignment && (
            <div className="rounded-lg border border-[#1b2336] bg-[#0d1322] p-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#1c263d] pb-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    4. Driver Assignment
                  </h3>
                  <p className="text-[10px] text-zinc-400">Roster pairing & availability</p>
                </div>
                <button
                  onClick={() => onNavigateTab('drivers')}
                  className="text-[11px] font-semibold text-red-400 hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-md bg-red-950/30 p-2 border border-red-900/40">
                  <div>
                    <div className="font-semibold text-zinc-200 text-[11px]">Assigned on Duty</div>
                    <div className="text-[10px] text-red-400">8 active certified drivers</div>
                  </div>
                  <span className="font-bold text-red-400 font-mono-num text-sm">100%</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-[#121929] p-2 border border-[#222c42]">
                  <div>
                    <div className="font-semibold text-zinc-300 text-[11px]">Reserve Standby Pool</div>
                    <div className="text-[10px] text-zinc-500">Depot standby reserve</div>
                  </div>
                  <span className="font-bold text-zinc-400 font-mono-num text-sm">2 units</span>
                </div>
              </div>
            </div>
          )}

          {visibleWidgets.topAlarms && (
            <div className="rounded-lg border border-[#1b2336] bg-[#0d1322] p-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#1c263d] pb-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    5. Most Alarmed Vehicles
                  </h3>
                  <p className="text-[10px] text-zinc-400">Top units requiring intervention</p>
                </div>
                <button
                  onClick={() => onNavigateTab('alarms')}
                  className="text-[11px] font-semibold text-red-400 hover:underline"
                >
                  Log
                </button>
              </div>

              <div className="mt-2 divide-y divide-[#172033] text-xs">
                {vehiclesWithAlarms.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => onSelectVehicle(v)}
                    className="flex items-center justify-between py-1.5 cursor-pointer hover:bg-red-950/20 px-1 rounded transition-colors"
                  >
                    <div>
                      <span className="font-bold text-white font-mono-num text-[11px]">{v.regNumber}</span>
                      <span className="block text-[9.5px] text-zinc-500">{v.driverName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9.5px] font-bold ${
                          (v.activeAlarmsCount || 0) > 1
                            ? 'bg-red-950/80 text-red-400 border border-red-800/60'
                            : (v.activeAlarmsCount || 0) === 1
                            ? 'bg-amber-950/70 text-amber-400 border border-amber-800/50'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {v.activeAlarmsCount || 0} alert{(v.activeAlarmsCount || 0) === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Row 3: Alarm Trend & Fuel Consumption */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {visibleWidgets.alarmTrend && (
            <div className="rounded-lg border border-[#1b2336] bg-[#0d1322] p-3 shadow-sm">
              <div className="border-b border-[#1c263d] pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  6. Alarm Distribution Across Shifts
                </h3>
                <p className="text-[10px] text-zinc-400">Overspeed vs Excessive Idling counts</p>
              </div>

              <div className="mt-2 h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={alarmTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#182136" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#808ea0' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#808ea0' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0d1322',
                        borderColor: '#222c42',
                        color: '#fff',
                        borderRadius: '6px',
                        fontSize: '11px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
                    <Bar dataKey="overspeed" name="Overspeeding" fill="#ef4444" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="idling" name="Excessive Idling" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {visibleWidgets.fuelConsumption && (
            <div className="rounded-lg border border-[#1b2336] bg-[#0d1322] p-3 shadow-sm">
              <div className="border-b border-[#1c263d] pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  7. Fuel Consumption by Hub Group
                </h3>
                <p className="text-[10px] text-zinc-400">Liters consumed in current shift</p>
              </div>

              <div className="mt-2 h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={fuelByGroup}
                    margin={{ top: 5, right: 20, left: 30, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#182136" />
                    <XAxis type="number" unit=" L" tick={{ fontSize: 10, fill: '#808ea0' }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#808ea0' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0d1322',
                        borderColor: '#222c42',
                        color: '#fff',
                        borderRadius: '6px',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="fuel" name="Liters Diesel" fill="#dc2626" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Row 4: Group Distribution, Model Type & Distance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {visibleWidgets.groupDistribution && (
            <div className="rounded-lg border border-[#1b2336] bg-[#0d1322] p-3 shadow-sm">
              <div className="border-b border-[#1c263d] pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  8. Group-Wise Fleet Distribution
                </h3>
                <p className="text-[10px] text-zinc-400">Branch depot asset allocation</p>
              </div>
              <div className="mt-2 space-y-1.5 text-xs">
                {groupData.map((g) => (
                  <div key={g.group} className="flex items-center justify-between border-b border-[#151c2c] pb-1">
                    <span className="font-semibold text-zinc-300 text-[11px]">{g.group}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500">{g.count} units</span>
                      <span className="rounded bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 text-[9.5px] font-bold text-emerald-400">
                        {g.running} Run
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {visibleWidgets.modelType && (
            <div className="rounded-lg border border-[#1b2336] bg-[#0d1322] p-3 shadow-sm">
              <div className="border-b border-[#1c263d] pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  9. Model Type Breakdown
                </h3>
                <p className="text-[10px] text-zinc-400">Commercial chassis mix</p>
              </div>
              <div className="mt-2 space-y-1.5 text-xs">
                {modelData.map((m) => (
                  <div key={m.model} className="flex items-center justify-between border-b border-[#151c2c] pb-1">
                    <span className="font-semibold text-zinc-300 text-[11px]">{m.model}</span>
                    <span className="rounded bg-[#121929] border border-[#222c42] px-1.5 py-0.5 text-zinc-200 font-bold font-mono-num text-[10px]">
                      {m.count} units
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {visibleWidgets.distanceAnalysis && (
            <div className="rounded-lg border border-[#1b2336] bg-[#0d1322] p-3 shadow-sm">
              <div className="border-b border-[#1c263d] pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  10. Shift Distance Brackets
                </h3>
                <p className="text-[10px] text-zinc-400">Km ranges completed per unit</p>
              </div>
              <div className="mt-2 space-y-2 text-xs">
                {distanceBrackets.map((b) => (
                  <div key={b.bracket} className="flex items-center justify-between border-b border-[#151c2c] pb-1">
                    <span className="font-semibold text-zinc-300 text-[11px]">{b.bracket}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-[#161f30] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full"
                          style={{ width: `${(b.vehicles / (totalVehicles || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="font-bold text-white font-mono-num text-[11px]">{b.vehicles}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 11. VEHICLES PERFORMANCE TABLE */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-[#1b2336] dark:bg-[#0d1322]">
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 p-3.5 border-b border-slate-200 bg-slate-50/80 dark:border-[#1c263d] dark:bg-[#090e1a]">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider dark:text-white">
              11. Vehicles Performance & Telematics Log
            </h3>
            <p className="text-[10.5px] text-slate-500 dark:text-zinc-400">
              Complete live telemetry metrics for all {filteredVehicles.length} assets
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Filter by reg/driver..."
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white py-1 pl-8 pr-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:border-[#222c42] dark:bg-[#0f1526] dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <select
              value={tableStatusFilter}
              onChange={(e) => {
                setTableStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white py-1 px-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 dark:border-[#222c42] dark:bg-[#0f1526] dark:text-zinc-200"
            >
              <option value="All">All Statuses</option>
              <option value="Running">Running</option>
              <option value="Idle">Idle</option>
              <option value="Parked">Parked</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* Export Button */}
            <button
              onClick={handleExportTable}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors dark:border-[#222c42] dark:bg-[#0f1526] dark:text-zinc-200 cursor-pointer"
            >
              <Download className="h-3 w-3 text-slate-500 dark:text-red-400" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:border-[#1c263d] dark:bg-[#0a0f1c] dark:text-zinc-400">
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-red-400"
                  onClick={() => {
                    setSortField('regNumber');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Vehicle</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Group</th>
                <th className="py-2.5 px-3">Status</th>
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-red-400"
                  onClick={() => {
                    setSortField('todayDistance');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Distance (km)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Running Time</th>
                <th className="py-2.5 px-3">Idle Time</th>
                <th className="py-2.5 px-3">Stop Time</th>
                <th className="py-2.5 px-3">Avg Speed</th>
                <th className="py-2.5 px-3">Mileage</th>
                <th className="py-2.5 px-3">Driver</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#151c2e]">
              {paginatedVehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  onClick={() => onSelectVehicle(vehicle)}
                  className="cursor-pointer hover:bg-slate-50/80 transition-colors dark:hover:bg-red-950/15"
                >
                  <td className="py-2.5 px-3 font-bold text-blue-700 font-mono-num dark:text-white">
                    <div>
                      <span>{vehicle.regNumber}</span>
                      <span className="block text-[10px] font-normal text-slate-400 dark:text-zinc-500">{vehicle.model}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium dark:text-zinc-300">{vehicle.group}</td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={vehicle.status} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 font-black font-mono-num text-slate-900 dark:text-white">
                    {vehicle.todayDistance} km
                  </td>
                  <td className="py-2.5 px-3 font-mono-num text-slate-600 dark:text-zinc-300">{vehicle.todayRunningTime}</td>
                  <td className="py-2.5 px-3 font-mono-num text-slate-600 dark:text-zinc-300">{vehicle.todayIdleTime}</td>
                  <td className="py-2.5 px-3 font-mono-num text-slate-600 dark:text-zinc-300">{vehicle.todayStopTime}</td>
                  <td className="py-2.5 px-3 font-mono-num text-slate-900 font-bold dark:text-white">
                    {vehicle.avgSpeed} km/h
                  </td>
                  <td className="py-2.5 px-3 font-mono-num text-emerald-600 font-bold dark:text-white">
                    {vehicle.mileage > 0 ? `${vehicle.mileage} km/L` : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">{vehicle.driverName}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectVehicle(vehicle);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-blue-600 hover:bg-slate-50 shadow-2xs dark:border-red-800/40 dark:bg-red-950/40 dark:text-red-400 cursor-pointer"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[#1c263d] px-3 py-2 text-[11px] text-zinc-400">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredVehicles.length)} of{' '}
            {filteredVehicles.length} assets
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="rounded p-1 border border-[#222c42] disabled:opacity-30 hover:bg-[#121929]"
            >
              <ChevronLeft className="h-3.5 w-3.5 text-zinc-300" />
            </button>
            <span className="px-2 font-bold font-mono-num text-zinc-200">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="rounded p-1 border border-[#222c42] disabled:opacity-30 hover:bg-[#121929]"
            >
              <ChevronRight className="h-3.5 w-3.5 text-zinc-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
