import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Clock,
  MapPin,
  Download,
  Radio,
  Check,
  Siren,
} from 'lucide-react';
import { AlarmEvent } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useToast } from '../common/Toast';

interface AlarmsViewProps {
  alarms: AlarmEvent[];
  onAcknowledgeAlarm: (id: string) => void;
  onResolveAlarm: (id: string) => void;
  onNavigateTab: (tab: any) => void;
  onSelectVehicleByReg: (reg: string) => void;
}

export const AlarmsView: React.FC<AlarmsViewProps> = ({
  alarms,
  onAcknowledgeAlarm,
  onResolveAlarm,
  onNavigateTab,
  onSelectVehicleByReg,
}) => {
  const { showToast } = useToast();
  const [severityFilter, setSeverityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlarms = alarms.filter((a) => {
    const matchSev = severityFilter === 'All' || a.severity === severityFilter;
    const matchType = typeFilter === 'All' || a.type === typeFilter;
    const matchSearch =
      a.vehicleReg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.locationName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSev && matchType && matchSearch;
  });

  const criticalCount = alarms.filter((a) => a.severity === 'Critical' && a.status === 'Active').length;
  const highCount = alarms.filter((a) => a.severity === 'High' && a.status === 'Active').length;

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Vehicle Reg', 'Driver', 'Incident Type', 'Severity', 'Location', 'Speed', 'Status'];
    const rows = filteredAlarms.map((a) => [
      a.timestamp,
      a.vehicleReg,
      a.driverName,
      a.type,
      a.severity,
      a.locationName,
      a.speed ? `${a.speed} km/h` : 'N/A',
      a.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((x) => `"${x}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `incident-alarms-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Incidents Exported', 'Incident log CSV downloaded.');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <span>Home</span>
            <span className="text-slate-300 dark:text-zinc-600">/</span>
            <span>Safety & Security</span>
            <span className="text-slate-300 dark:text-zinc-600">/</span>
            <span className="text-rose-600 dark:text-red-400 font-bold">Alarm Center</span>
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Central Telematics Incident & Alarm Hub
            </h1>
            <span className="rounded-md bg-rose-50 border border-rose-200 text-rose-700 px-2 py-0.5 text-xs font-bold font-mono-num flex items-center gap-1.5 dark:bg-red-950/80 dark:border-red-800/80 dark:text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
              {criticalCount} Critical Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors dark:border-zinc-700 dark:bg-[#111116] dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
            <span>Export Incident Log</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5 shadow-xs dark:border-red-900/40 dark:bg-red-950/20">
          <span className="text-[10.5px] font-bold uppercase text-rose-700 dark:text-red-400">Critical Severity</span>
          <div className="mt-1 text-2xl font-black font-mono-num text-rose-700 dark:text-red-300">{criticalCount}</div>
          <span className="text-[10px] text-rose-600/80">Overspeed & Panic SOS</span>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 shadow-xs dark:border-amber-900/40 dark:bg-amber-950/20">
          <span className="text-[10.5px] font-bold uppercase text-amber-700 dark:text-amber-400">High Severity</span>
          <div className="mt-1 text-2xl font-black font-mono-num text-amber-700 dark:text-amber-300">{highCount}</div>
          <span className="text-[10px] text-amber-600/80">Harsh braking & geofence breaches</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-[#0c0c10]">
          <span className="text-[10.5px] font-bold uppercase text-slate-500 dark:text-zinc-400">Total Logged Today</span>
          <div className="mt-1 text-2xl font-black font-mono-num text-slate-900 dark:text-white">{alarms.length}</div>
          <span className="text-[10px] text-slate-400">AIS-140 incident events</span>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 shadow-xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <span className="text-[10.5px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Resolution Rate</span>
          <div className="mt-1 text-2xl font-black font-mono-num text-emerald-700 dark:text-emerald-300">
            {Math.round(((alarms.filter((a) => a.status === 'Resolved').length) / (alarms.length || 1)) * 100)}%
          </div>
          <span className="text-[10px] text-emerald-600/80">Acknowledged by control tower</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs dark:bg-[#0e0e13] dark:border-zinc-800">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['All', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`rounded-lg px-3 py-1.5 font-bold transition-all cursor-pointer ${
                severityFilter === sev
                  ? 'bg-blue-600 text-white shadow-xs dark:bg-red-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800/80 dark:text-zinc-300'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search registration, driver, type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
          />
        </div>
      </div>

      {/* Incident Alarms Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-zinc-800 dark:bg-[#0e0e13]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[10.5px] font-black uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-[#121218] dark:text-zinc-400">
                <th className="py-3 px-3.5">Severity</th>
                <th className="py-3 px-3.5">Incident Type</th>
                <th className="py-3 px-3.5">Asset Registration</th>
                <th className="py-3 px-3.5">Driver</th>
                <th className="py-3 px-3.5">Location / Highway</th>
                <th className="py-3 px-3.5">Recorded Speed</th>
                <th className="py-3 px-3.5">Time Triggered</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {filteredAlarms.map((alarm) => (
                <tr key={alarm.id} className="hover:bg-slate-50/80 transition-colors dark:hover:bg-zinc-800/40">
                  <td className="py-3 px-3.5">
                    <StatusBadge status={alarm.severity} size="sm" />
                  </td>
                  <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-white">{alarm.type}</td>
                  <td
                    className="py-3 px-3.5 font-bold font-mono-num text-blue-600 hover:underline cursor-pointer dark:text-blue-400"
                    onClick={() => {
                      onSelectVehicleByReg(alarm.vehicleReg);
                      onNavigateTab('realtime');
                    }}
                  >
                    {alarm.vehicleReg}
                  </td>
                  <td className="py-3 px-3.5 text-slate-700 font-medium dark:text-zinc-300">{alarm.driverName}</td>
                  <td className="py-3 px-3.5 text-slate-600 text-[11px] max-w-xs truncate dark:text-zinc-400">
                    {alarm.locationName}
                  </td>
                  <td className="py-3 px-3.5 font-mono-num font-bold text-slate-800 dark:text-zinc-200">
                    {alarm.speed ? `${alarm.speed} km/h` : '0 km/h'}
                  </td>
                  <td className="py-3 px-3.5 text-slate-500 text-[11px] font-mono-num">{alarm.timestamp}</td>
                  <td className="py-3 px-3.5">
                    <StatusBadge status={alarm.status} size="sm" />
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {alarm.status === 'Active' && (
                        <button
                          onClick={() => {
                            onAcknowledgeAlarm(alarm.id);
                            showToast('info', 'Alarm Acknowledged', `Tower operator assigned to ${alarm.vehicleReg}.`);
                          }}
                          className="rounded-lg bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10.5px] font-bold text-amber-700 hover:bg-amber-100 transition-colors dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300 cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      )}
                      {alarm.status !== 'Resolved' ? (
                        <button
                          onClick={() => {
                            onResolveAlarm(alarm.id);
                            showToast('success', 'Alarm Cleared', `Incident resolved for ${alarm.vehicleReg}.`);
                          }}
                          className="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 cursor-pointer"
                        >
                          <Check className="h-3 w-3 inline mr-1" />
                          Resolve
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10.5px] font-semibold">Cleared</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
