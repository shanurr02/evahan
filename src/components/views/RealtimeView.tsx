import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  Search,
  MapPin,
  ZoomIn,
  ZoomOut,
  Compass,
  History,
  Briefcase,
  Siren,
  Truck,
  Eye,
  Layers,
  Radio,
  Maximize2,
  RotateCcw,
  Sliders,
  Shield,
  Tag,
  Route,
  Activity,
  Crosshair,
  Flame,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';
import { Vehicle } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Drawer } from '../common/Drawer';

interface RealtimeViewProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  onSelectVehicle: (vehicle: Vehicle | null) => void;
  onNavigateTab: (tab: any) => void;
  isLive: boolean;
}

export const RealtimeView: React.FC<RealtimeViewProps> = ({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  onNavigateTab,
  isLive,
}) => {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [groupFilter, setGroupFilter] = useState<string>('All');

  // Map Controls State
  const [mapTheme, setMapTheme] = useState<'dark' | 'tactical' | 'satellite'>('dark');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Layer Toggles
  const [showGeofences, setShowGeofences] = useState<boolean>(true);
  const [showRouteTrails, setShowRouteTrails] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showRadarSweep, setShowRadarSweep] = useState<boolean>(true);
  const [showAlarmsOnly, setShowAlarmsOnly] = useState<boolean>(false);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Filtered vehicles for left roster and map
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch =
        v.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
      const matchesGroup = groupFilter === 'All' || v.group === groupFilter;
      const matchesAlarm = !showAlarmsOnly || (v.activeAlarmsCount && v.activeAlarmsCount > 0);
      return matchesSearch && matchesStatus && matchesGroup && matchesAlarm;
    });
  }, [vehicles, searchQuery, statusFilter, groupFilter, showAlarmsOnly]);

  // Unique groups
  const groups = useMemo(() => {
    return ['All', ...Array.from(new Set(vehicles.map((v) => v.group)))];
  }, [vehicles]);

  // Coordinates projection for Indian freight corridor (Lat: 20 to 26, Lng: 83.5 to 87)
  const minLat = 20.0;
  const maxLat = 26.0;
  const minLng = 83.5;
  const maxLng = 87.0;

  const projectCoord = useCallback((lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 800 + 50;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 500 + 50;
    return { x, y };
  }, [minLat, maxLat, minLng, maxLng]);

  // Highway corridors data
  const corridors = [
    { name: 'NH-143 Rourkela - Keonjhar - Bhubaneswar', path: 'M 350 330 L 450 370 L 550 480' },
    { name: 'NH-49 Jharsuguda - Sambalpur - Cuttack', path: 'M 170 380 L 260 410 L 520 460' },
    { name: 'NH-20 Ranchi - Jamshedpur - Barbil', path: 'M 440 240 L 610 290 L 500 360' },
    { name: 'NH-22 / NH-31 Patna - Gaya - Ranchi Corridor', path: 'M 410 70 L 420 140 L 440 240' },
  ];

  // Geofence zones
  const geofences = [
    { name: 'Rourkela Steel Plant Hub', x: 350, y: 325, r: 42, color: 'rgba(239, 68, 68, 0.18)', stroke: '#ef4444' },
    { name: 'Bhubaneswar Central Hub', x: 550, y: 480, r: 45, color: 'rgba(16, 185, 129, 0.15)', stroke: '#10b981' },
    { name: 'Vedanta Smelter Jharsuguda', x: 170, y: 380, r: 38, color: 'rgba(245, 158, 11, 0.15)', stroke: '#f59e0b' },
    { name: 'Patna FMCG Stockyard', x: 410, y: 70, r: 40, color: 'rgba(239, 68, 68, 0.15)', stroke: '#ef4444' },
  ];

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 2.5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(Number((prev - 0.25).toFixed(2)), 0.6));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Center on selected vehicle or all fleet
  const handleFocusSelected = () => {
    if (selectedVehicle) {
      const { x, y } = projectCoord(selectedVehicle.lat, selectedVehicle.lng);
      setPanOffset({
        x: (450 - x) * zoomLevel,
        y: (300 - y) * zoomLevel,
      });
    } else if (vehicles.length > 0) {
      handleResetView();
    }
  };

  // Mouse drag to pan map
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoomLevel((prev) => {
      const next = Math.min(Math.max(prev + delta, 0.6), 2.5);
      return Number(next.toFixed(2));
    });
  };

  return (
    <div className="flex h-[calc(100vh-5.8rem)] flex-col lg:flex-row overflow-hidden rounded-lg border border-[#1f1f26] bg-[#000000] shadow-2xl text-zinc-100">
      {/* 1. LEFT PANEL: Fleet Roster & Filters */}
      <div className="flex w-full flex-col border-b border-[#1f1f26] bg-[#050507] lg:w-80 lg:shrink-0 lg:border-r lg:border-b-0">
        {/* Panel Header */}
        <div className="border-b border-[#1f1f26] p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                Fleet Roster
              </h2>
              <span className="rounded bg-red-950/80 border border-red-800/80 px-1.5 py-0.2 text-[10px] font-bold text-red-400">
                {filteredVehicles.length}/{vehicles.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isLive ? 'Live 5s' : 'Paused'}</span>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search reg, driver, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded border border-[#262632] bg-[#0a0a0d] py-1 pl-8 pr-2.5 text-xs text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="mt-2 flex items-center gap-1 overflow-x-auto pb-0.5 text-[10px]">
            {['All', 'Running', 'Idle', 'Parked', 'Inactive'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded px-2 py-0.5 font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-xs'
                    : 'bg-[#0f0f13] text-zinc-400 hover:text-white border border-[#22222a]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Group Filter & Quick Alarms Toggle */}
          <div className="mt-2 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 flex-1">
              <span className="text-[10px] font-semibold text-zinc-400">Group:</span>
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="flex-1 rounded border border-[#262632] bg-[#0a0a0d] py-0.5 px-2 text-[11px] font-medium text-zinc-200 focus:outline-none focus:border-red-500"
              >
                {groups.map((g) => (
                  <option key={g} value={g} className="bg-[#0a0a0d]">
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowAlarmsOnly(!showAlarmsOnly)}
              title="Show only vehicles with active alarms"
              className={`flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold border transition-colors ${
                showAlarmsOnly
                  ? 'bg-red-950/80 border-red-600 text-red-300'
                  : 'bg-[#0f0f13] border-[#22222a] text-zinc-400 hover:text-white'
              }`}
            >
              <Siren className="h-3 w-3 text-red-400" />
              <span>Alarms</span>
            </button>
          </div>
        </div>

        {/* Vehicle List Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#181820]">
          {filteredVehicles.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No assets match the selected filters.
            </div>
          ) : (
            filteredVehicles.map((v) => {
              const isSelected = selectedVehicle?.id === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => onSelectVehicle(v)}
                  className={`p-2.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-red-950/40 border-l-2 border-red-500'
                      : 'hover:bg-[#0c0c10] border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono-num text-xs">
                      {v.regNumber}
                    </span>
                    <StatusBadge status={v.status} size="sm" />
                  </div>

                  <div className="mt-0.5 flex items-center justify-between text-[10px] text-zinc-400">
                    <span className="truncate max-w-[130px]">{v.model}</span>
                    <span className="font-semibold text-zinc-300">{v.group}</span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[10.5px]">
                    <span className="font-medium text-zinc-300 truncate max-w-[110px]">{v.driverName}</span>
                    <div className="flex items-center gap-1.5 font-mono-num font-semibold">
                      <span className={v.speed > 0 ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                        {v.speed} km/h
                      </span>
                      <span className="text-zinc-600">|</span>
                      <span className="text-zinc-400">{v.todayDistance} km</span>
                    </div>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[9.5px] text-zinc-500">
                    <span className="truncate max-w-[160px]">{v.locationName}</span>
                    <span>{v.lastUpdated}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. CENTER PANEL: Tactical Black & Red Map Canvas */}
      <div className="relative flex-1 bg-[#000000] overflow-hidden flex flex-col">
        {/* Top-Left Telemetry Info Pill */}
        <div className="absolute top-3 left-3 z-20 pointer-events-auto">
          <div className="rounded-lg border border-[#202026] bg-[#050507]/90 px-3 py-1.5 shadow-xl backdrop-blur-md flex items-center gap-2.5 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="font-extrabold text-white text-[11px] tracking-wide">
              Eastern Freight Corridor
            </span>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-400 font-mono-num text-[10.5px]">
              {vehicles.filter((v) => v.speed > 0).length} Moving • {vehicles.length} Tracked
            </span>
            <span className="rounded bg-red-950/80 border border-red-800/80 text-red-400 px-1.5 py-0.2 text-[9px] font-mono-num font-bold">
              AIS-140 SECURE
            </span>
          </div>
        </div>

        {/* FLOATING BLACK & RED MAP CONTROL CONSOLE */}
        <div className="absolute top-3 right-3 z-30 pointer-events-auto flex flex-col gap-2 max-w-[285px] select-none">
          <div className="rounded-lg border border-[#22222a] bg-[#050507]/95 shadow-2xl shadow-black/90 backdrop-blur-md transition-all overflow-hidden">
            {/* Console Title Bar */}
            <div className="flex items-center justify-between border-b border-[#1c1c24] px-3 py-2 bg-[#09090d]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />
                <div className="flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-red-500" />
                  <span className="font-extrabold text-white text-[11px] uppercase tracking-wider">
                    Map Controls
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
                  title={isControlsCollapsed ? 'Expand panel' : 'Collapse panel'}
                  className="rounded border border-[#22222a] p-1 text-zinc-400 hover:border-red-500/50 hover:bg-red-950/30 hover:text-red-300 transition-colors"
                >
                  {isControlsCollapsed ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronUp className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Console Body */}
            {!isControlsCollapsed ? (
              <div className="p-3 space-y-3 text-xs">
                {/* 1. Zoom & Orientation Controls */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    <span>Navigation & Scale</span>
                    <span className="font-mono-num font-bold text-red-400 bg-black/60 px-1.5 py-0.2 rounded border border-[#202026]">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      onClick={handleZoomIn}
                      title="Zoom In (+25%)"
                      className="flex h-7 items-center justify-center gap-1 rounded border border-[#22222a] bg-[#0c0c10] text-zinc-200 hover:border-red-500 hover:bg-red-950/40 hover:text-white transition-all active:scale-95 shadow-xs"
                    >
                      <ZoomIn className="h-3.5 w-3.5 text-red-400" />
                      <span className="text-[10px] font-bold">+</span>
                    </button>

                    <button
                      onClick={handleZoomOut}
                      title="Zoom Out (-25%)"
                      className="flex h-7 items-center justify-center gap-1 rounded border border-[#22222a] bg-[#0c0c10] text-zinc-200 hover:border-red-500 hover:bg-red-950/40 hover:text-white transition-all active:scale-95 shadow-xs"
                    >
                      <ZoomOut className="h-3.5 w-3.5 text-red-400" />
                      <span className="text-[10px] font-bold">-</span>
                    </button>

                    <button
                      onClick={handleResetView}
                      title="Recenter Map & Reset Zoom"
                      className="flex h-7 items-center justify-center gap-1 rounded border border-[#22222a] bg-[#0c0c10] text-zinc-200 hover:border-red-500 hover:bg-red-950/40 hover:text-white transition-all active:scale-95 shadow-xs"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-red-400" />
                      <span className="text-[9.5px] font-semibold">1:1</span>
                    </button>

                    <button
                      onClick={handleFocusSelected}
                      title={selectedVehicle ? `Lock Camera on ${selectedVehicle.regNumber}` : 'Center on fleet'}
                      className={`flex h-7 items-center justify-center gap-1 rounded border transition-all active:scale-95 shadow-xs ${
                        selectedVehicle
                          ? 'border-red-500 bg-red-950/50 text-red-300 font-bold'
                          : 'border-[#22222a] bg-[#0c0c10] text-zinc-200 hover:border-red-500 hover:bg-red-950/40'
                      }`}
                    >
                      <Crosshair className="h-3.5 w-3.5 text-red-400" />
                      <span className="text-[9.5px] font-semibold">Lock</span>
                    </button>
                  </div>
                </div>

                {/* 2. Base Map Theme Matrix */}
                <div className="pt-2 border-t border-[#181820]">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    <span>Base Grid Matrix</span>
                    <Layers className="h-3 w-3 text-red-500" />
                  </div>

                  <div className="grid grid-cols-3 gap-1 p-0.5 rounded border border-[#202026] bg-[#08080b]">
                    {(
                      [
                        { id: 'dark', label: 'Obsidian' },
                        { id: 'tactical', label: 'Tactical' },
                        { id: 'satellite', label: 'Recon' },
                      ] as const
                    ).map((t) => {
                      const isActive = mapTheme === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setMapTheme(t.id)}
                          className={`rounded py-1 text-[10.5px] font-bold transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-xs shadow-red-950'
                              : 'text-zinc-400 hover:text-white hover:bg-[#121218]'
                          }`}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Layer Feature Toggles */}
                <div className="pt-2 border-t border-[#181820] space-y-1.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Telemetry Overlays
                  </span>

                  {/* Geofences Toggle */}
                  <button
                    onClick={() => setShowGeofences(!showGeofences)}
                    className={`w-full flex items-center justify-between rounded border px-2.5 py-1.5 transition-all text-[11px] ${
                      showGeofences
                        ? 'border-red-500/50 bg-red-950/30 text-white font-bold'
                        : 'border-[#202026] bg-[#0c0c10] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className={`h-3.5 w-3.5 ${showGeofences ? 'text-red-400' : 'text-zinc-500'}`} />
                      <span>Geofences & Depots</span>
                    </div>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        showGeofences ? 'bg-red-500 shadow-[0_0_6px_#ef4444]' : 'bg-zinc-600'
                      }`}
                    />
                  </button>

                  {/* Highway Routes Toggle */}
                  <button
                    onClick={() => setShowRouteTrails(!showRouteTrails)}
                    className={`w-full flex items-center justify-between rounded border px-2.5 py-1.5 transition-all text-[11px] ${
                      showRouteTrails
                        ? 'border-red-500/50 bg-red-950/30 text-white font-bold'
                        : 'border-[#202026] bg-[#0c0c10] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Route className={`h-3.5 w-3.5 ${showRouteTrails ? 'text-red-400' : 'text-zinc-500'}`} />
                      <span>Freight Corridors</span>
                    </div>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        showRouteTrails ? 'bg-red-500 shadow-[0_0_6px_#ef4444]' : 'bg-zinc-600'
                      }`}
                    />
                  </button>

                  {/* Vehicle Tag Labels Toggle */}
                  <button
                    onClick={() => setShowLabels(!showLabels)}
                    className={`w-full flex items-center justify-between rounded border px-2.5 py-1.5 transition-all text-[11px] ${
                      showLabels
                        ? 'border-red-500/50 bg-red-950/30 text-white font-bold'
                        : 'border-[#202026] bg-[#0c0c10] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Tag className={`h-3.5 w-3.5 ${showLabels ? 'text-red-400' : 'text-zinc-500'}`} />
                      <span>Vehicle Plate Tags</span>
                    </div>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        showLabels ? 'bg-red-500 shadow-[0_0_6px_#ef4444]' : 'bg-zinc-600'
                      }`}
                    />
                  </button>

                  {/* Radar Sweep Effect Toggle */}
                  <button
                    onClick={() => setShowRadarSweep(!showRadarSweep)}
                    className={`w-full flex items-center justify-between rounded border px-2.5 py-1.5 transition-all text-[11px] ${
                      showRadarSweep
                        ? 'border-red-500/50 bg-red-950/30 text-white font-bold'
                        : 'border-[#202026] bg-[#0c0c10] text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Radio className={`h-3.5 w-3.5 ${showRadarSweep ? 'text-red-400' : 'text-zinc-500'}`} />
                      <span>AIS-140 Radar Beam</span>
                    </div>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        showRadarSweep ? 'bg-red-500 shadow-[0_0_6px_#ef4444]' : 'bg-zinc-600'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ) : (
              /* Compact Collapsed Floating Bar */
              <div className="p-1.5 flex items-center gap-1.5">
                <button
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="p-1.5 rounded border border-[#22222a] bg-[#0c0c10] text-zinc-300 hover:border-red-500 hover:text-white"
                >
                  <ZoomIn className="h-3.5 w-3.5 text-red-400" />
                </button>
                <button
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="p-1.5 rounded border border-[#22222a] bg-[#0c0c10] text-zinc-300 hover:border-red-500 hover:text-white"
                >
                  <ZoomOut className="h-3.5 w-3.5 text-red-400" />
                </button>
                <button
                  onClick={handleResetView}
                  title="Reset View"
                  className="p-1.5 rounded border border-[#22222a] bg-[#0c0c10] text-zinc-300 hover:border-red-500 hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-red-400" />
                </button>
                <div className="h-4 w-px bg-[#22222a]" />
                <span className="font-mono-num text-[10px] font-bold text-red-400 px-1">
                  {Math.round(zoomLevel * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Map Vector Canvas (Interactive Pan & Zoom) */}
        <div
          className={`flex-1 relative flex items-center justify-center bg-[#000000] text-zinc-100 overflow-hidden select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          <svg
            ref={svgRef}
            viewBox="0 0 900 600"
            className="w-full h-full object-contain"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            {/* High-Contrast Grid & Radar Patterns */}
            <defs>
              <pattern id="mapGridDark" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#14141c" strokeWidth="0.8" />
              </pattern>
              <pattern id="mapGridTactical" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#181822" strokeWidth="0.9" />
                <circle cx="15" cy="15" r="0.75" fill="#ef4444" opacity="0.3" />
              </pattern>

              {/* Gradient for radar sweep */}
              <linearGradient id="radarSweepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#ef4444" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Background Map Canvas with Pan & Zoom Group */}
            <g
              transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
              style={{ transformOrigin: '450px 300px', transition: isDragging ? 'none' : 'transform 0.15s ease-out' }}
            >
              {/* Solid Background Grid */}
              <rect
                width="900"
                height="600"
                fill={mapTheme === 'tactical' ? 'url(#mapGridTactical)' : 'url(#mapGridDark)'}
              />

              {/* Tactical Landmass */}
              <path
                d="M 120 180 Q 280 150 480 90 T 780 140 L 760 520 Q 520 560 300 520 Z"
                fill={
                  mapTheme === 'tactical'
                    ? '#07070a'
                    : mapTheme === 'satellite'
                    ? '#04060b'
                    : '#08080c'
                }
                stroke={mapTheme === 'tactical' ? '#262636' : '#1a1a24'}
                strokeWidth="1.5"
              />

              {/* Radar Sweep Arc Animation centered at Rourkela HQ */}
              {showRadarSweep && (
                <g transform="translate(350, 325)">
                  <circle r="90" fill="none" stroke="#ef4444" strokeWidth="0.8" opacity="0.25" strokeDasharray="3 3" />
                  <circle r="180" fill="none" stroke="#ef4444" strokeWidth="0.8" opacity="0.18" strokeDasharray="4 4" />
                  <circle r="270" fill="none" stroke="#ef4444" strokeWidth="0.8" opacity="0.12" strokeDasharray="6 6" />

                  {/* Sweep Cone */}
                  <path
                    d="M 0 0 L 250 -60 A 260 260 0 0 1 230 110 Z"
                    fill="url(#radarSweepGradient)"
                    className="origin-center"
                    style={{
                      transformOrigin: '0px 0px',
                      animation: 'spin 8s linear infinite',
                    }}
                  />
                </g>
              )}

              {/* Freight Corridors (Highways) */}
              {showRouteTrails &&
                corridors.map((c, i) => (
                  <g key={i}>
                    <path
                      d={c.path}
                      fill="none"
                      stroke="#22222e"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d={c.path}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1.6"
                      strokeDasharray="7 4"
                      opacity="0.9"
                    />
                  </g>
                ))}

              {/* Geofence Polygons */}
              {showGeofences &&
                geofences.map((geo, idx) => (
                  <g key={idx}>
                    <circle
                      cx={geo.x}
                      cy={geo.y}
                      r={geo.r}
                      fill={geo.color}
                      stroke={geo.stroke}
                      strokeWidth="1.3"
                      strokeDasharray="4 3"
                    />
                    <text
                      x={geo.x}
                      y={geo.y + geo.r + 13}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      fill="#a1a1aa"
                      fontFamily="Inter, sans-serif"
                    >
                      {geo.name}
                    </text>
                  </g>
                ))}

              {/* Major Logistics Hub Labels */}
              <g fontSize="10" fontWeight="bold" fill="#d4d4d8" fontFamily="Inter, sans-serif">
                <text x="350" y="310" textAnchor="middle">
                  Rourkela (HQ)
                </text>
                <text x="170" y="365" textAnchor="middle">
                  Jharsuguda
                </text>
                <text x="550" y="465" textAnchor="middle">
                  Bhubaneswar
                </text>
                <text x="440" y="225" textAnchor="middle">
                  Ranchi
                </text>
                <text x="410" y="55" textAnchor="middle">
                  Patna
                </text>
                <text x="610" y="275" textAnchor="middle">
                  Jamshedpur
                </text>
              </g>

              {/* Vehicle Markers */}
              {filteredVehicles.map((v) => {
                const { x, y } = projectCoord(v.lat, v.lng);
                const isSelected = selectedVehicle?.id === v.id;

                const statusColor =
                  v.status === 'Running'
                    ? '#10b981'
                    : v.status === 'Idle'
                    ? '#f59e0b'
                    : v.status === 'Parked'
                    ? '#71717a'
                    : '#ef4444';

                return (
                  <g
                    key={v.id}
                    transform={`translate(${x}, ${y})`}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVehicle(v);
                    }}
                  >
                    {/* Selected Halo Pulse */}
                    {isSelected && (
                      <circle
                        r="18"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        className="animate-ping"
                      />
                    )}

                    {/* Active Alarm Flashing Halo */}
                    {v.activeAlarmsCount && v.activeAlarmsCount > 0 && (
                      <circle
                        r="14"
                        fill="rgba(239, 68, 68, 0.25)"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                        className="animate-pulse"
                      />
                    )}

                    {/* Main Status Vehicle Dot */}
                    <circle
                      r="6.5"
                      fill={statusColor}
                      stroke="#000000"
                      strokeWidth="2"
                      className="shadow-lg shadow-black"
                    />

                    {/* Directional heading arrowhead if running */}
                    {v.speed > 0 && (
                      <polygon
                        points="0,-13 -3.5,-8.5 3.5,-8.5"
                        fill={statusColor}
                        transform={`rotate(${v.heading})`}
                      />
                    )}

                    {/* Center Pinpoint */}
                    <circle r="2.2" fill="#ffffff" />

                    {/* Asset Callout Registration Label */}
                    {showLabels && (
                      <g transform="translate(0, -17)">
                        <rect
                          x="-36"
                          y="-13"
                          width="72"
                          height="15"
                          rx="3"
                          fill={isSelected ? '#170406' : '#08080c'}
                          stroke={isSelected ? '#ef4444' : '#22222c'}
                          strokeWidth={isSelected ? '1.5' : '1'}
                          className="shadow-md shadow-black"
                        />
                        <text
                          x="0"
                          y="-3"
                          textAnchor="middle"
                          fontSize="8.5"
                          fontWeight="bold"
                          fontFamily="JetBrains Mono, monospace"
                          fill={isSelected ? '#fca5a5' : '#e4e4e7'}
                        >
                          {v.regNumber}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Bottom Left Status Radar Legend */}
          <div className="absolute bottom-3 left-3 rounded-lg border border-[#202026] bg-[#050507]/95 p-2.5 shadow-xl backdrop-blur-md text-[10px] space-y-1.5 z-20 pointer-events-auto">
            <div className="font-bold uppercase tracking-wider text-zinc-400 mb-0.5 flex items-center justify-between gap-3">
              <span>Status Radar Legend</span>
              <span className="text-[9px] text-red-400 font-mono-num">2.5s Sync</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                <span className="text-zinc-300">Running (&gt;0 km/h)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-zinc-300">Idle (Ign ON)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-zinc-400" />
                <span className="text-zinc-300">Parked (Ign OFF)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
                <span className="text-zinc-300">Alarm / Offline</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RIGHT PANEL: Selected Vehicle Telemetry Drawer */}
      {selectedVehicle && (
        <Drawer
          isOpen={Boolean(selectedVehicle)}
          onClose={() => onSelectVehicle(null)}
          title={selectedVehicle.regNumber}
          subtitle={`${selectedVehicle.model} • ${selectedVehicle.group}`}
          width="md"
        >
          <div className="space-y-4 text-xs">
            {/* Primary Status Card */}
            <div className="rounded border border-[#202026] bg-[#08080c] p-3">
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedVehicle.status} size="md" />
                <span className="text-[10.5px] text-zinc-400 font-mono-num">
                  Updated {selectedVehicle.lastUpdated}
                </span>
              </div>

              {/* Speedometer Gauge Representation */}
              <div className="mt-3 flex items-center justify-between border-t border-[#181820] pt-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Current Speed
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-extrabold text-white font-mono-num">
                      {selectedVehicle.speed}
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-400">km/h</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Engine Ignition
                  </span>
                  <div className="mt-0.5 flex items-center justify-end gap-1.5">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        selectedVehicle.ignition === 'ON' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                      }`}
                    />
                    <span className="font-bold text-white font-mono-num text-xs">
                      {selectedVehicle.ignition}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Quick Actions
              </span>
              <div className="mt-1 grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onNavigateTab('history')}
                  className="flex items-center justify-center gap-1.5 rounded border border-[#22222a] bg-[#0c0c10] p-1.5 font-semibold text-zinc-200 hover:border-red-500 hover:text-white transition-colors"
                >
                  <History className="h-3.5 w-3.5 text-red-400" />
                  <span>History</span>
                </button>
                <button
                  onClick={() => onNavigateTab('vehicles')}
                  className="flex items-center justify-center gap-1.5 rounded border border-[#22222a] bg-[#0c0c10] p-1.5 font-semibold text-zinc-200 hover:border-red-500 hover:text-white transition-colors"
                >
                  <Truck className="h-3.5 w-3.5 text-red-400" />
                  <span>Specs</span>
                </button>
                <button
                  onClick={() => onNavigateTab('jobs')}
                  className="flex items-center justify-center gap-1.5 rounded border border-[#22222a] bg-[#0c0c10] p-1.5 font-semibold text-zinc-200 hover:border-red-500 hover:text-white transition-colors"
                >
                  <Briefcase className="h-3.5 w-3.5 text-red-400" />
                  <span>Jobs</span>
                </button>
                <button
                  onClick={() => onNavigateTab('alarms')}
                  className="flex items-center justify-center gap-1.5 rounded border border-red-900/60 bg-red-950/40 p-1.5 font-semibold text-red-300 hover:bg-red-900/50 transition-colors"
                >
                  <Siren className="h-3.5 w-3.5 text-red-400" />
                  <span>Alarms ({selectedVehicle.activeAlarmsCount || 0})</span>
                </button>
              </div>
            </div>

            {/* Telemetry Details Grid */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Live Telemetry Parameters
              </span>

              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <div className="rounded border border-[#1f1f26] bg-[#08080c] p-2">
                  <span className="text-zinc-500 text-[9.5px]">Assigned Driver</span>
                  <div className="font-bold text-white mt-0.5 text-[11px] truncate">
                    {selectedVehicle.driverName}
                  </div>
                </div>
                <div className="rounded border border-[#1f1f26] bg-[#08080c] p-2">
                  <span className="text-zinc-500 text-[9.5px]">Today Distance</span>
                  <div className="font-bold text-white mt-0.5 font-mono-num text-[11px]">
                    {selectedVehicle.todayDistance} km
                  </div>
                </div>
                <div className="rounded border border-[#1f1f26] bg-[#08080c] p-2">
                  <span className="text-zinc-500 text-[9.5px]">Running Time</span>
                  <div className="font-bold text-white mt-0.5 font-mono-num text-[11px]">
                    {selectedVehicle.todayRunningTime}
                  </div>
                </div>
                <div className="rounded border border-[#1f1f26] bg-[#08080c] p-2">
                  <span className="text-zinc-500 text-[9.5px]">Idle Time</span>
                  <div className="font-bold text-white mt-0.5 font-mono-num text-[11px]">
                    {selectedVehicle.todayIdleTime}
                  </div>
                </div>
                <div className="rounded border border-[#1f1f26] bg-[#08080c] p-2">
                  <span className="text-zinc-500 text-[9.5px]">Fuel Level</span>
                  <div className="font-bold text-white mt-0.5 font-mono-num text-[11px]">
                    {selectedVehicle.fuelLevel}%
                  </div>
                </div>
                <div className="rounded border border-[#1f1f26] bg-[#08080c] p-2">
                  <span className="text-zinc-500 text-[9.5px]">Odometer</span>
                  <div className="font-bold text-white mt-0.5 font-mono-num text-[11px]">
                    {selectedVehicle.odometer?.toLocaleString()} km
                  </div>
                </div>
              </div>
            </div>

            {/* Location & GPS Info */}
            <div className="rounded border border-[#202026] bg-[#08080c] p-2.5 space-y-1">
              <div className="flex items-center gap-1.5 text-red-400 font-bold text-[11px]">
                <MapPin className="h-3.5 w-3.5" />
                <span>Geographic Position</span>
              </div>
              <p className="text-zinc-200 font-medium text-[11px]">{selectedVehicle.locationName}</p>
              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono-num pt-1 border-t border-[#181820]">
                <span>Lat: {selectedVehicle.lat.toFixed(4)}° N</span>
                <span>Lng: {selectedVehicle.lng.toFixed(4)}° E</span>
              </div>
            </div>

            {/* Hardware & CANBus Device Info */}
            <div className="rounded border border-[#202026] bg-[#08080c] p-2.5 space-y-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-semibold">Device ID:</span>
                <span className="font-mono-num font-bold text-zinc-200">{selectedVehicle.deviceId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-semibold">Battery Voltage:</span>
                <span className="font-mono-num font-bold text-zinc-200">
                  {selectedVehicle.batteryVoltage} V
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-semibold">Device Health:</span>
                <StatusBadge status={selectedVehicle.deviceStatus} size="sm" />
              </div>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
};
