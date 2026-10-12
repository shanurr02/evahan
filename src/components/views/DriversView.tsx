import React, { useState } from 'react';
import {
  Search,
  Plus,
  Download,
  Eye,
} from 'lucide-react';
import { Driver } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { Drawer } from '../common/Drawer';
import { useToast } from '../common/Toast';

interface DriversViewProps {
  drivers: Driver[];
  onAddDriver: (driver: Driver) => void;
  onNavigateTab: (tab: any) => void;
}

export const DriversView: React.FC<DriversViewProps> = ({
  drivers,
  onAddDriver,
  onNavigateTab,
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add driver form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [license, setLicense] = useState('');
  const [expiry, setExpiry] = useState('2028-12-31');

  const filteredDrivers = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.assignedVehicleReg.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !license) return;

    const newDriver: Driver = {
      id: `d-${Date.now()}`,
      name,
      phone,
      licenseNumber: license,
      licenseExpiry: expiry,
      assignedVehicleReg: 'Unassigned',
      status: 'Active',
      safetyScore: 95,
      totalTrips: 0,
      experienceYears: 5,
      alarmsCount: 0,
      bloodGroup: 'B+',
      joinedDate: '2026-09-16',
    };

    onAddDriver(newDriver);
    setIsAddModalOpen(false);
    setName('');
    setPhone('');
    setLicense('');
    showToast('success', 'Driver Enrolled', `${newDriver.name} added with valid license verification.`);
  };

  return (
    <div className="space-y-4 text-zinc-100">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#1a2236] pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400">
            <span>Home</span>
            <span className="text-zinc-600">/</span>
            <span>Personnel</span>
            <span className="text-zinc-600">/</span>
            <span className="text-red-400">Drivers Roster</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-lg font-extrabold tracking-tight text-white">
              Driver Personnel & Safety Operations
            </h1>
            <span className="rounded bg-red-950/70 border border-red-800/60 px-2 py-0.2 text-[10px] font-bold text-red-400 font-mono-num">
              {drivers.length} Certified Drivers
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              showToast('success', 'Driver Scores Exported', 'Safety scorecards downloaded for RTO audit.')
            }
            className="flex items-center gap-1.5 rounded border border-[#222c42] bg-[#0f1526] px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:border-red-500/40 hover:text-white transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-red-400" />
            <span>Export Roster</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Enroll Driver</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#0d1322] p-2.5 rounded-lg border border-[#1b2336] shadow-sm max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search driver name, license, vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded border border-[#222c42] bg-[#0f1526] py-1 pl-8 pr-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* Drivers Table */}
      <div className="rounded-lg border border-[#1b2336] bg-[#0d1322] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1c263d] bg-[#0a0f1c] text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                <th className="py-2.5 px-3">Driver Name</th>
                <th className="py-2.5 px-3">Contact Phone</th>
                <th className="py-2.5 px-3">Commercial License No.</th>
                <th className="py-2.5 px-3">License Expiry</th>
                <th className="py-2.5 px-3">Assigned Asset</th>
                <th className="py-2.5 px-3">Safety Score</th>
                <th className="py-2.5 px-3">Trips</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151c2e]">
              {filteredDrivers.map((driver) => (
                <tr
                  key={driver.id}
                  onClick={() => setSelectedDriver(driver)}
                  className="cursor-pointer hover:bg-red-950/15 transition-colors"
                >
                  <td className="py-2 px-3 font-bold text-white flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-[#162035] border border-[#222c42] flex items-center justify-center font-bold text-red-400 text-[10px]">
                      {driver.name.charAt(0)}
                    </div>
                    <span>{driver.name}</span>
                  </td>
                  <td className="py-2 px-3 text-zinc-400 font-mono-num text-[11px]">{driver.phone}</td>
                  <td className="py-2 px-3 font-mono-num font-semibold text-zinc-200 text-[11px]">
                    {driver.licenseNumber}
                  </td>
                  <td className="py-2 px-3 font-mono-num text-zinc-400 text-[11px]">{driver.licenseExpiry}</td>
                  <td className="py-2 px-3 font-mono-num font-bold text-red-400 text-[11px]">
                    {driver.assignedVehicleReg}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`font-mono-num font-bold text-xs ${
                        driver.safetyScore >= 90
                          ? 'text-emerald-400'
                          : driver.safetyScore >= 80
                          ? 'text-amber-400'
                          : 'text-red-400'
                      }`}
                    >
                      {driver.safetyScore}%
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono-num text-zinc-300 text-[11px]">{driver.totalTrips}</td>
                  <td className="py-2 px-3">
                    <StatusBadge status={driver.status} size="sm" />
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDriver(driver);
                      }}
                      className="rounded border border-[#222c42] bg-[#0f1526] px-2 py-0.5 text-[10.5px] font-semibold text-red-400 hover:border-red-500/40 hover:text-white"
                    >
                      <Eye className="h-3 w-3 inline mr-1" />
                      Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Driver Detail Drawer */}
      {selectedDriver && (
        <Drawer
          isOpen={Boolean(selectedDriver)}
          onClose={() => setSelectedDriver(null)}
          title={selectedDriver.name}
          subtitle={`Commercial Heavy Vehicle Driver • ${selectedDriver.status}`}
          width="md"
        >
          <div className="space-y-4 text-xs">
            {/* Safety Score Card */}
            <div className="rounded border border-[#222c42] bg-[#090e1a] p-3">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400">
                  Driver Safety Score
                </span>
                <StatusBadge status={selectedDriver.status} size="sm" />
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold font-mono-num text-emerald-400">
                  {selectedDriver.safetyScore}%
                </span>
                <span className="text-zinc-400 text-[11px]">Tier 1 Safe Corridor Operator</span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-2 border border-[#1b2336] bg-[#090e1a] rounded p-3">
              <h4 className="font-bold text-red-400 uppercase text-[10.5px] tracking-wider">
                License & Personal Details
              </h4>
              <div className="grid grid-cols-2 gap-2 text-zinc-300 text-[11px]">
                <div>
                  <span className="text-zinc-500 text-[9.5px]">Contact Phone:</span>
                  <p className="font-semibold font-mono-num text-white">{selectedDriver.phone}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-[9.5px]">License Number:</span>
                  <p className="font-semibold font-mono-num text-white">{selectedDriver.licenseNumber}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-[9.5px]">License Expiry:</span>
                  <p className="font-semibold font-mono-num text-zinc-200">{selectedDriver.licenseExpiry}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-[9.5px]">Blood Group:</span>
                  <p className="font-semibold text-zinc-200">{selectedDriver.bloodGroup}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-[9.5px]">Experience:</span>
                  <p className="font-semibold text-zinc-200">{selectedDriver.experienceYears} Years</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-[9.5px]">Joined Date:</span>
                  <p className="font-semibold text-zinc-200">{selectedDriver.joinedDate}</p>
                </div>
              </div>
            </div>

            {/* Current Assignment */}
            <div className="rounded border border-red-950/80 bg-red-950/30 p-3">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-red-400">
                Currently Assigned Asset
              </span>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm font-bold font-mono-num text-white">
                  {selectedDriver.assignedVehicleReg}
                </span>
                <button
                  onClick={() => {
                    setSelectedDriver(null);
                    onNavigateTab('vehicles');
                  }}
                  className="text-[11px] font-bold text-red-400 hover:underline"
                >
                  View Vehicle →
                </button>
              </div>
            </div>

            {/* Safety Metrics breakdown */}
            <div className="space-y-1.5 border border-[#1b2336] bg-[#090e1a] rounded p-3 text-[11px]">
              <h4 className="font-bold text-red-400 uppercase text-[10.5px] tracking-wider mb-2">
                Driving Behavior Telemetry
              </h4>
              <div className="flex justify-between">
                <span className="text-zinc-400">Harsh Braking (30d):</span>
                <span className="font-bold font-mono-num text-white">1 incident</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Overspeeding Events:</span>
                <span className="font-bold font-mono-num text-amber-400">
                  {selectedDriver.alarmsCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Night Driving Adherence:</span>
                <span className="font-bold font-mono-num text-emerald-400">98% compliant</span>
              </div>
            </div>
          </div>
        </Drawer>
      )}

      {/* Add Driver Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Enroll Commercial Driver"
        subtitle="Register verified driver with transport license"
      >
        <form onSubmit={handleAddDriverSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-zinc-300 uppercase tracking-wider text-[10.5px]">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Chandra Sethi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-[#222c42] bg-[#090e1a] p-2 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-300 uppercase tracking-wider text-[10.5px]">
              Mobile Phone Number
            </label>
            <input
              type="text"
              required
              placeholder="+91 98XXX XXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded border border-[#222c42] bg-[#090e1a] p-2 font-mono-num text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-zinc-300 uppercase tracking-wider text-[10.5px]">
                Heavy License Number
              </label>
              <input
                type="text"
                required
                placeholder="OD-14-2020XXXX"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                className="mt-1 w-full rounded border border-[#222c42] bg-[#090e1a] p-2 font-mono-num text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-300 uppercase tracking-wider text-[10.5px]">
                License Expiry Date
              </label>
              <input
                type="date"
                required
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="mt-1 w-full rounded border border-[#222c42] bg-[#090e1a] p-2 font-mono-num text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-[#1c263d]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded border border-[#222c42] px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-[#121929]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs"
            >
              Enroll Driver
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
