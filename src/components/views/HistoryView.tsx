import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Calendar,
  Truck,
  MapPin,
  Clock,
  Gauge,
  Fuel,
  Navigation,
} from 'lucide-react';
import { Vehicle } from '../../types';
import { tripPlaybackWaypoints } from '../../mockData';
import { useToast } from '../common/Toast';

interface HistoryViewProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
}) => {
  const { showToast } = useToast();
  const currentVehicle = selectedVehicle || vehicles[0];

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const waypoints = tripPlaybackWaypoints;

  // Auto playback loop
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      const interval = 1400 / playbackSpeed;
      timer = setInterval(() => {
        setPlaybackIndex((prev) => {
          if (prev >= waypoints.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, interval);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, waypoints.length]);

  const activePoint = waypoints[playbackIndex];

  // Map coordinates projection for playback path
  const projectCoord = (lat: number, lng: number) => {
    const minLat = 20.0;
    const maxLat = 22.5;
    const minLng = 84.5;
    const maxLng = 86.2;
    const x = ((lng - minLng) / (maxLng - minLng)) * 700 + 50;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 380 + 40;
    return { x, y };
  };

  const pathString = waypoints
    .map((pt, i) => {
      const { x, y } = projectCoord(pt.lat, pt.lng);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const currentMarkerCoord = projectCoord(activePoint.lat, activePoint.lng);

  return (
    <div className="space-y-4">
      {/* Header with Breadcrumb & Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <span>Home</span>
            <span className="text-slate-300 dark:text-zinc-600">/</span>
            <span>Trips</span>
            <span className="text-slate-300 dark:text-zinc-600">/</span>
            <span className="text-blue-600 dark:text-red-400 font-bold">Trip Management</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 mt-1 dark:text-white">
            Trip Route Telemetry Playback
          </h1>
          <p className="text-xs text-slate-400">
            Replay historical corridor transits, speed spikes, halts, and geofence events.
          </p>
        </div>

        {/* Vehicle and Date selector */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={currentVehicle?.id}
            onChange={(e) => {
              const v = vehicles.find((item) => item.id === e.target.value);
              if (v) {
                onSelectVehicle(v);
                setPlaybackIndex(0);
                setIsPlaying(false);
              }
            }}
            className="rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs font-bold text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.regNumber} ({v.model})
              </option>
            ))}
          </select>

          <button
            onClick={() =>
              showToast('success', 'Trip Export Completed', 'GPX & KML raw trace downloaded.')
            }
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors dark:border-zinc-700 dark:bg-[#111116] dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400" />
            <span>Export GPX / KML</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards of this Trip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-[#0c0c10]">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Distance</span>
          <div className="mt-0.5 text-base font-black font-mono-num text-slate-900 dark:text-white">340.5 km</div>
          <span className="text-[9.5px] text-slate-400">Highway NH-143</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-[#0c0c10]">
          <span className="text-[10px] font-bold uppercase text-slate-400">Running Time</span>
          <div className="mt-0.5 text-base font-black font-mono-num text-emerald-600 dark:text-emerald-400">5h 45m</div>
          <span className="text-[9.5px] text-slate-400">In continuous transit</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-[#0c0c10]">
          <span className="text-[10px] font-bold uppercase text-slate-400">Idle Duration</span>
          <div className="mt-0.5 text-base font-black font-mono-num text-amber-600 dark:text-amber-400">42m</div>
          <span className="text-[9.5px] text-slate-400">Ignition ON at halts</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-[#0c0c10]">
          <span className="text-[10px] font-bold uppercase text-slate-400">Stop Duration</span>
          <div className="mt-0.5 text-base font-black font-mono-num text-slate-700 dark:text-zinc-300">1h 12m</div>
          <span className="text-[9.5px] text-slate-400">Docks & Toll Plazas</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-[#0c0c10]">
          <span className="text-[10px] font-bold uppercase text-slate-400">Average Speed</span>
          <div className="mt-0.5 text-base font-black font-mono-num text-slate-900 dark:text-white">52 km/h</div>
          <span className="text-[9.5px] text-slate-400">Within speed limits</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-[#0c0c10]">
          <span className="text-[10px] font-bold uppercase text-slate-400">Max Speed</span>
          <div className="mt-0.5 text-base font-black font-mono-num text-rose-600 dark:text-red-400">68 km/h</div>
          <span className="text-[9.5px] text-slate-400">Keonjhar Bypass</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-[#0c0c10]">
          <span className="text-[10px] font-bold uppercase text-slate-400">Fuel Expended</span>
          <div className="mt-0.5 text-base font-black font-mono-num text-blue-600 dark:text-blue-400">84.2 L</div>
          <span className="text-[9.5px] text-slate-400">Mileage 4.04 km/L</span>
        </div>
      </div>

      {/* Main Map Playback Canvas */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-zinc-800 dark:bg-[#0a0a0e]">
        <div className="relative h-96 w-full bg-slate-950 overflow-hidden">
          {/* Subtle Grid Map Backdrop */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:30px_30px]" />

          {/* SVG Route Visualization */}
          <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 800 450">
            {/* Route glow path */}
            <path d={pathString} fill="none" stroke="#2563eb" strokeWidth="6" strokeOpacity="0.3" />
            <path d={pathString} fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="6 3" />

            {/* Waypoint dots */}
            {waypoints.map((pt, i) => {
              const { x, y } = projectCoord(pt.lat, pt.lng);
              const isPassed = i <= playbackIndex;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={i === 0 || i === waypoints.length - 1 ? 6 : 3.5}
                  fill={
                    i === 0
                      ? '#10b981'
                      : i === waypoints.length - 1
                      ? '#ef4444'
                      : isPassed
                      ? '#3b82f6'
                      : '#64748b'
                  }
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              );
            })}

            {/* Current Animated Moving Vehicle Marker */}
            <circle
              cx={currentMarkerCoord.x}
              cy={currentMarkerCoord.y}
              r="14"
              fill="#2563eb"
              fillOpacity="0.25"
              className="animate-ping"
            />
            <circle
              cx={currentMarkerCoord.x}
              cy={currentMarkerCoord.y}
              r="7"
              fill="#2563eb"
              stroke="#ffffff"
              strokeWidth="2.5"
            />
          </svg>

          {/* Floating Waypoint Telemetry Tag */}
          <div className="absolute top-4 left-4 rounded-xl border border-slate-700 bg-slate-900/90 backdrop-blur-md p-3 text-white shadow-xl max-w-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-xs font-mono-num">{activePoint.time}</span>
              <span className="text-[10px] text-slate-400">Waypoint #{playbackIndex + 1}</span>
            </div>
            <div className="font-extrabold text-xs">{activePoint.event}</div>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-[11px] font-mono-num">
              <div>Speed: <span className="text-emerald-400 font-bold">{activePoint.speed} km/h</span></div>
              <div>Ignition: <span className="text-blue-400 font-bold">{activePoint.speed > 0 ? 'ON' : 'OFF'}</span></div>
            </div>
          </div>
        </div>

        {/* Playback Controls & Timeline Scrubber */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-3 dark:bg-[#0e0e13] dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer dark:bg-red-600 dark:hover:bg-red-700"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>

              <button
                onClick={() => {
                  setPlaybackIndex(0);
                  setIsPlaying(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                title="Reset to departure"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-0.5 text-xs font-bold dark:border-zinc-700">
                {[1, 2, 4].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`rounded px-2 py-1 transition-colors cursor-pointer ${
                      playbackSpeed === spd
                        ? 'bg-blue-600 text-white dark:bg-red-600'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-zinc-400'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs font-bold font-mono-num text-slate-500 dark:text-zinc-400">
              {playbackIndex + 1} / {waypoints.length} Track Points
            </span>
          </div>

          {/* Timeline Scrubber */}
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max={waypoints.length - 1}
              value={playbackIndex}
              onChange={(e) => {
                setPlaybackIndex(Number(e.target.value));
                setIsPlaying(false);
              }}
              className="w-full accent-blue-600 dark:accent-red-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10.5px] text-slate-400">
              <span>{waypoints[0]?.time} (Keonjhar Ore Mine)</span>
              <span>{waypoints[waypoints.length - 1]?.time} (Rourkela Steel Plant)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
