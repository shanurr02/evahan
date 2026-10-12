import React, { useState } from 'react';
import {
  Download,
  BarChart3,
  Clock,
  Fuel,
  Users,
  CheckCircle2,
  Calendar,
  Filter,
  FileSpreadsheet,
  FileText,
  Mail,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { Vehicle, Driver } from '../../types';
import { useToast } from '../common/Toast';

export const ReportsView: React.FC<{ vehicles: Vehicle[]; drivers: Driver[] }> = ({
  vehicles,
  drivers,
}) => {
  const { showToast } = useToast();
  const [selectedReport, setSelectedReport] = useState('utilization');
  const [dateRange, setDateRange] = useState('Last 7 Days (10 Sep - 16 Sep 2026)');
  const [selectedDepot, setSelectedDepot] = useState('All Depots');

  const reportTypes = [
    {
      id: 'utilization',
      title: 'Asset Utilization & Distance',
      desc: 'Operational uptime, daily running vs idle hours, and kilometer accumulation per chassis.',
      icon: BarChart3,
      badge: 'High Impact',
    },
    {
      id: 'stoppage',
      title: 'Stoppage & Unscheduled Halts',
      desc: 'Dock bottlenecks, highway hold-up durations, and engine idle fuel waste.',
      icon: Clock,
      badge: 'Loss Prevention',
    },
    {
      id: 'fuel',
      title: 'Fuel Economy & Pilferage Audit',
      desc: 'Liters dispensed, fuel drop anomalies, and km/liter performance benchmarking.',
      icon: Fuel,
      badge: 'Cost Control',
    },
    {
      id: 'safety',
      title: 'Driver Safety & Violation Scorecard',
      desc: 'Harsh braking, overspeeding incidents, continuous driving hours & RTO safety score.',
      icon: Users,
      badge: 'Compliance',
    },
  ];

  // Mock chart data based on selected report
  const utilizationData = [
    { name: 'Mon', km: 2420, runningHrs: 68, idleHrs: 12 },
    { name: 'Tue', km: 2780, runningHrs: 74, idleHrs: 15 },
    { name: 'Wed', km: 3120, runningHrs: 82, idleHrs: 18 },
    { name: 'Thu', km: 2950, runningHrs: 79, idleHrs: 14 },
    { name: 'Fri', km: 3340, runningHrs: 88, idleHrs: 11 },
    { name: 'Sat', km: 2890, runningHrs: 76, idleHrs: 16 },
    { name: 'Sun', km: 2150, runningHrs: 58, idleHrs: 9 },
  ];

  const fuelData = [
    { name: 'OD14AB1234', mileage: 4.2, fuelSpent: 420, expected: 4.0 },
    { name: 'OD14CD5678', mileage: 3.8, fuelSpent: 390, expected: 3.9 },
    { name: 'JH01EF9012', mileage: 4.4, fuelSpent: 460, expected: 4.1 },
    { name: 'BR01GH3456', mileage: 3.6, fuelSpent: 310, expected: 3.8 },
  ];

  const handleGenerate = (format: string) => {
    const reportTitle = reportTypes.find((r) => r.id === selectedReport)?.title;
    showToast(
      'success',
      `Report Generated (${format})`,
      `Compiled "${reportTitle}" for ${dateRange}. File download started.`
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <span>Home</span>
            <span className="text-slate-300 dark:text-zinc-600">/</span>
            <span>Business Intelligence</span>
            <span className="text-slate-300 dark:text-zinc-600">/</span>
            <span className="text-blue-600 dark:text-red-400 font-bold">Reports & Analytics</span>
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Fleet Telematics & Executive BI Reporting
            </h1>
            <span className="rounded-md bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 text-xs font-bold font-mono-num dark:bg-red-950/70 dark:border-red-800/60 dark:text-red-400">
              AIS-140 Compliant Telematics
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleGenerate('Excel (.xlsx)')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors dark:border-zinc-700 dark:bg-[#111116] dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>Excel (.XLSX)</span>
          </button>
          <button
            onClick={() => handleGenerate('PDF Executive')}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all dark:bg-red-600 dark:hover:bg-red-700 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* Report Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {reportTypes.map((rep) => {
          const Icon = rep.icon;
          const isSelected = selectedReport === rep.id;

          return (
            <div
              key={rep.id}
              onClick={() => setSelectedReport(rep.id)}
              className={`rounded-xl border p-4 transition-all cursor-pointer shadow-xs ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 dark:border-red-600 dark:bg-red-950/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 dark:border-zinc-800 dark:bg-[#0c0c10] dark:hover:bg-zinc-800/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                    isSelected
                      ? 'bg-blue-600 text-white dark:bg-red-600'
                      : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-[10px] font-bold uppercase rounded px-1.5 py-0.5 bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {rep.badge}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">{rep.title}</h3>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed dark:text-zinc-400">{rep.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Filter Options Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs dark:bg-[#0e0e13] dark:border-zinc-800">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <Calendar className="h-4 w-4" />
            <span>Date Range:</span>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
          >
            <option>Today (Live Real-Time)</option>
            <option>Last 7 Days (10 Sep - 16 Sep 2026)</option>
            <option>Month to Date (1 Sep - 16 Sep 2026)</option>
            <option>Previous Month (August 2026)</option>
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <Filter className="h-4 w-4" />
            <span>Depot Hub:</span>
          </div>
          <select
            value={selectedDepot}
            onChange={(e) => setSelectedDepot(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
          >
            <option>All Depots</option>
            <option>Rourkela North Hub</option>
            <option>Bhubaneswar DC</option>
            <option>Jharsuguda Yard</option>
            <option>Patna FMCG Stockyard</option>
          </select>
        </div>
      </div>

      {/* Report Dynamic Analytics Canvas */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-4 dark:border-zinc-800 dark:bg-[#0e0e13]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              {reportTypes.find((r) => r.id === selectedReport)?.title} - Interactive Visualization
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Showing compiled metrics for {dateRange}</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md dark:bg-emerald-950/60 dark:text-emerald-400">
            Validated by Telematics Engine
          </span>
        </div>

        {selectedReport === 'utilization' && (
          <div className="space-y-3">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilizationData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="km" fill="#2563eb" name="Kilometers Traversed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2 text-center border-t border-slate-100 dark:border-zinc-800">
              <div>
                <span className="text-[10.5px] font-bold text-slate-400 uppercase">Total Distance</span>
                <p className="text-lg font-black font-mono-num text-slate-900 dark:text-white">19,650 km</p>
              </div>
              <div>
                <span className="text-[10.5px] font-bold text-slate-400 uppercase">Avg Daily Fleet Running</span>
                <p className="text-lg font-black font-mono-num text-blue-600">75.1 Hours</p>
              </div>
              <div>
                <span className="text-[10.5px] font-bold text-slate-400 uppercase">Idle Ratio</span>
                <p className="text-lg font-black font-mono-num text-amber-600">14.8% (Target &lt; 15%)</p>
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'fuel' && (
          <div className="space-y-3">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fuelData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="mileage" fill="#10b981" name="Actual Mileage (km/L)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expected" fill="#94a3b8" name="Manufacturer Target" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2 text-center border-t border-slate-100 dark:border-zinc-800">
              <div>
                <span className="text-[10.5px] font-bold text-slate-400 uppercase">Total Fuel Dispensed</span>
                <p className="text-lg font-black font-mono-num text-slate-900 dark:text-white">1,580 Liters</p>
              </div>
              <div>
                <span className="text-[10.5px] font-bold text-slate-400 uppercase">Average Heavy Mileage</span>
                <p className="text-lg font-black font-mono-num text-emerald-600">4.0 km/L</p>
              </div>
              <div>
                <span className="text-[10.5px] font-bold text-slate-400 uppercase">Suspected Drainage</span>
                <p className="text-lg font-black font-mono-num text-slate-500">0 Liters (Audit Clear)</p>
              </div>
            </div>
          </div>
        )}

        {selectedReport !== 'utilization' && selectedReport !== 'fuel' && (
          <div className="py-12 text-center text-slate-400">
            <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-40 text-blue-600" />
            <p className="font-bold text-sm text-slate-700 dark:text-zinc-300">
              {reportTypes.find((r) => r.id === selectedReport)?.title} Ready
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Select date range and click Export above to download full breakdown with raw telematics logs.
            </p>
          </div>
        )}
      </div>

      {/* Automated Email Digest Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 dark:border-zinc-800 dark:bg-[#0e0e13]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-950/40 dark:text-blue-400">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white">Automated Daily Dispatch & Telematics Email Digest</h3>
            <p className="text-[11px] text-slate-400">Scheduled delivery every morning at 08:00 AM to management team</p>
          </div>
        </div>

        <button
          onClick={() => showToast('success', 'Email Scheduled', 'Automated report dispatch confirmed.')}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 cursor-pointer"
        >
          Configure Scheduled Delivery
        </button>
      </div>
    </div>
  );
};
