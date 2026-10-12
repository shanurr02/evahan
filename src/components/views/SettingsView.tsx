import React, { useState } from 'react';
import {
  Building2,
  Users,
  MapPin,
  Cpu,
  Save,
  Plus,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Radio,
  Server,
  Trash2,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

export const SettingsView: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'groups' | 'geofences' | 'users' | 'devices'>('profile');

  // Tenant state
  const [tenantName, setTenantName] = useState('Steel Logistics India Pvt Ltd');
  const [gstin, setGstin] = useState('21AAACS1234F1Z8');
  const [address, setAddress] = useState('Sector 4 Industrial Estate, Rourkela, Odisha 769004');
  const [aisCert, setAisCert] = useState('AIS-140/ARAI/2024/7789');

  // Depots
  const [depots, setDepots] = useState([
    { id: 'dep-1', name: 'Rourkela North Hub', address: 'Sector 4 RSP Industrial Zone', vehicles: 8, manager: 'Debashis Das' },
    { id: 'dep-2', name: 'Bhubaneswar Central DC', address: 'Rasulgarh Freight Terminal', vehicles: 6, manager: 'Alok Mohanty' },
    { id: 'dep-3', name: 'Jharsuguda Smelter Yard', address: 'Vedanta Industrial Bypass', vehicles: 4, manager: 'Sunil Patnaik' },
  ]);

  // Geofences
  const [geofences, setGeofences] = useState([
    { id: 'geo-1', name: 'Rourkela Steel Plant (RSP) Stockyard', type: 'Polygon', radius: '1,200m', alerts: 'Entry & Exit' },
    { id: 'geo-2', name: 'Bhubaneswar Central Hub (DC)', type: 'Circle', radius: '800m', alerts: 'Entry & Exit' },
    { id: 'geo-3', name: 'Vedanta Smelter Jharsuguda', type: 'Polygon', radius: '1,500m', alerts: 'Entry & Exit' },
    { id: 'geo-4', name: 'Patna FMCG Stockyard', type: 'Circle', radius: '500m', alerts: 'Entry, Exit & Stoppage > 30m' },
  ]);

  // Users
  const [users, setUsers] = useState([
    { id: 'u-1', name: 'Alok Mohanty', email: 'alok@fleetcommand.in', role: 'Super Admin', status: 'Active' },
    { id: 'u-2', name: 'Sunil Patnaik', email: 'sunil.p@fleetcommand.in', role: 'Fleet Dispatcher', status: 'Active' },
    { id: 'u-3', name: 'Priya Rath', email: 'priya.r@fleetcommand.in', role: 'Safety Compliance Officer', status: 'Active' },
    { id: 'u-4', name: 'Debashis Das', email: 'debashis@fleetcommand.in', role: 'Depot Manager', status: 'Active' },
  ]);

  // Modals
  const [isAddGeofenceOpen, setIsAddGeofenceOpen] = useState(false);
  const [newGeoName, setNewGeoName] = useState('');
  const [newGeoType, setNewGeoType] = useState('Circle');

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Dispatcher');

  const handleSaveProfile = () => {
    showToast('success', 'Profile Updated', 'Organization legal profile and GST credentials synchronized.');
  };

  const handleAddGeofence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGeoName) return;
    const newG = {
      id: `geo-${Date.now()}`,
      name: newGeoName,
      type: newGeoType,
      radius: '800m',
      alerts: 'Entry & Exit',
    };
    setGeofences([...geofences, newG]);
    setIsAddGeofenceOpen(false);
    setNewGeoName('');
    showToast('success', 'Geofence Created', `Virtual boundary ${newG.name} registered.`);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    const newU = {
      id: `u-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: 'Active',
    };
    setUsers([...users, newU]);
    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    showToast('success', 'User Invited', `Credentials dispatched to ${newU.email}.`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <span>Home</span>
            <span className="text-slate-300 dark:text-zinc-600">/</span>
            <span>Administration</span>
            <span className="text-slate-300 dark:text-zinc-600">/</span>
            <span className="text-blue-600 dark:text-red-400 font-bold">Settings</span>
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Enterprise Configuration & System Settings
            </h1>
            <span className="rounded-md bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 text-xs font-mono-num font-semibold dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300">
              Tenant: steel-logistics-od
            </span>
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-all dark:bg-red-600 dark:hover:bg-red-700 cursor-pointer"
        >
          <Save className="h-3.5 w-3.5" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-1 text-xs font-bold dark:border-zinc-800">
        {[
          { id: 'profile', label: 'Organization Profile', icon: Building2 },
          { id: 'groups', label: 'Depots & Hubs', icon: MapPin },
          { id: 'geofences', label: 'Geofences & Depots', icon: Globe },
          { id: 'users', label: 'Users & RBAC Access', icon: Users },
          { id: 'devices', label: 'Telematics & AIS-140 Server', icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 whitespace-nowrap text-xs transition-colors cursor-pointer ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:border-red-500 dark:text-red-400 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. ORGANIZATION PROFILE */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs dark:border-zinc-800 dark:bg-[#0e0e13]">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider dark:text-white">
              Legal Logistics Enterprise Profile
            </h3>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] dark:text-zinc-300">
                Registered Company Name *
              </label>
              <input
                type="text"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] dark:text-zinc-300">
                  GSTIN Number *
                </label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono-num font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] dark:text-zinc-300">
                  ARAI AIS-140 Certificate Ref
                </label>
                <input
                  type="text"
                  value={aisCert}
                  onChange={(e) => setAisCert(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono-num text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] dark:text-zinc-300">
                Corporate Headquarters Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveProfile}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs dark:bg-red-600 cursor-pointer"
              >
                Save Organization Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DEPOTS & HUBS */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {depots.map((dep) => (
              <div
                key={dep.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2 dark:border-zinc-800 dark:bg-[#0e0e13]"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs dark:bg-blue-950/40 dark:text-blue-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{dep.name}</h4>
                    <span className="text-[10px] text-slate-400">{dep.vehicles} Assigned Trucks</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">{dep.address}</p>
                <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] dark:border-zinc-800">
                  <span className="text-slate-400">Depot Head:</span>
                  <span className="font-bold text-slate-700 dark:text-zinc-200">{dep.manager}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. GEOFENCES */}
      {activeTab === 'geofences' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">Virtual boundary triggers for automated arrival and departure alerts</p>
            <button
              onClick={() => setIsAddGeofenceOpen(true)}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs dark:bg-red-600 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 inline mr-1" />
              Add Geofence Hub
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-zinc-800 dark:bg-[#0e0e13]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[10.5px] font-black uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-[#121218] dark:text-zinc-400">
                  <th className="py-3 px-3.5">Hub / Geofence Name</th>
                  <th className="py-3 px-3.5">Boundary Geometry</th>
                  <th className="py-3 px-3.5">Buffer Radius</th>
                  <th className="py-3 px-3.5">Event Triggers</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {geofences.map((geo) => (
                  <tr key={geo.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40">
                    <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-white">{geo.name}</td>
                    <td className="py-3 px-3.5 font-semibold text-slate-600 dark:text-zinc-300">{geo.type}</td>
                    <td className="py-3 px-3.5 font-mono-num text-slate-500">{geo.radius}</td>
                    <td className="py-3 px-3.5">
                      <span className="rounded bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10.5px] font-bold dark:bg-emerald-950/60 dark:text-emerald-400">
                        {geo.alerts}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <button
                        onClick={() => {
                          setGeofences(geofences.filter((g) => g.id !== geo.id));
                          showToast('info', 'Geofence Removed', `${geo.name} deleted.`);
                        }}
                        className="text-rose-600 hover:text-rose-700 text-xs font-semibold cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. USERS & RBAC */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">Manage dispatchers, safety compliance officers, and role permissions</p>
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs dark:bg-red-600 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 inline mr-1" />
              Invite Team Member
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-zinc-800 dark:bg-[#0e0e13]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[10.5px] font-black uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-[#121218] dark:text-zinc-400">
                  <th className="py-3 px-3.5">User Full Name</th>
                  <th className="py-3 px-3.5">Email Address</th>
                  <th className="py-3 px-3.5">Assigned Role</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {users.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40">
                    <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-white">{usr.name}</td>
                    <td className="py-3 px-3.5 font-mono-num text-slate-600 dark:text-zinc-300">{usr.email}</td>
                    <td className="py-3 px-3.5">
                      <span className="rounded bg-blue-50 text-blue-700 px-2 py-0.5 text-[10.5px] font-bold dark:bg-blue-950/60 dark:text-blue-400">
                        {usr.role}
                      </span>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="rounded bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10.5px] font-bold dark:bg-emerald-950/60 dark:text-emerald-400">
                        {usr.status}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <button
                        onClick={() => showToast('info', 'Permissions Opened', `Configuring RBAC for ${usr.name}`)}
                        className="text-blue-600 hover:text-blue-700 font-bold text-xs cursor-pointer"
                      >
                        Edit Access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TELEMATICS & AIS-140 */}
      {activeTab === 'devices' && (
        <div className="max-w-2xl space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs dark:border-zinc-800 dark:bg-[#0e0e13]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-950/40 dark:text-emerald-400">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm dark:text-white">MoRTH AIS-140 Gateway Webhook</h3>
                <p className="text-xs text-slate-400">National vehicle tracking telemetry pipeline</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] dark:text-zinc-300">
                  TCP Telemetry Stream Port
                </label>
                <input
                  type="text"
                  readOnly
                  value="tcp://ais140.fleetcommand.in:5023"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono-num font-bold text-slate-700 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] dark:text-zinc-300">
                  Live Emergency Response Support System (ERSS-112) Integration
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Connected & Transmitting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD GEOFENCE MODAL */}
      <Modal
        isOpen={isAddGeofenceOpen}
        onClose={() => setIsAddGeofenceOpen(false)}
        title="Add Virtual Geofence Boundary"
        subtitle="Specify freight terminal or loading hub geofence"
      >
        <form onSubmit={handleAddGeofence} className="space-y-3">
          <div>
            <label className="text-[10.5px] font-bold uppercase text-slate-500">Hub / Geofence Name *</label>
            <input
              type="text"
              placeholder="e.g. Keonjhar Iron Ore Dispatch Gate"
              value={newGeoName}
              onChange={(e) => setNewGeoName(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
            />
          </div>

          <div>
            <label className="text-[10.5px] font-bold uppercase text-slate-500">Geometry Type *</label>
            <select
              value={newGeoType}
              onChange={(e) => setNewGeoType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
            >
              <option value="Circle">Radial Circle (800m Buffer)</option>
              <option value="Polygon">Corridor Polygon (Multi-point)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsAddGeofenceOpen(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs"
            >
              Create Geofence
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD USER MODAL */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Invite Enterprise Team Member"
        subtitle="Assign role-based access for logistics management"
      >
        <form onSubmit={handleAddUser} className="space-y-3">
          <div>
            <label className="text-[10.5px] font-bold uppercase text-slate-500">Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Rajesh Sahoo"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
            />
          </div>

          <div>
            <label className="text-[10.5px] font-bold uppercase text-slate-500">Email Address *</label>
            <input
              type="email"
              placeholder="e.g. rajesh@steelcommand.in"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
            />
          </div>

          <div>
            <label className="text-[10.5px] font-bold uppercase text-slate-500">Role & Permission *</label>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold text-slate-800 dark:border-zinc-700 dark:bg-[#14141a] dark:text-white"
            >
              <option value="Fleet Dispatcher">Fleet Dispatcher</option>
              <option value="Depot Manager">Depot Manager</option>
              <option value="Safety Officer">Safety Officer</option>
              <option value="Billing Executive">Billing Executive</option>
              <option value="Super Admin">Super Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsAddUserOpen(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
