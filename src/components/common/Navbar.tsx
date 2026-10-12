import React, { useState } from 'react';
import {
  Building2,
  Search,
  Calendar,
  Filter,
  Radio,
  Bell,
  HelpCircle,
  Menu,
  ChevronDown,
  LogOut,
  X,
  Sun,
  Moon,
  Plus,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { TenantInfo, UserProfile, Alarm, NavigationTab } from '../../types';
import { MasterType } from '../../types/masters';
import { MASTER_DEFINITIONS } from '../../data/masterDefinitions';

export interface NavbarProps {
  tenants?: TenantInfo[];
  currentTenantId?: string;
  currentTenant?: TenantInfo;
  onSelectTenant?: (tenant: any) => void;
  user?: UserProfile;
  currentTab?: NavigationTab;
  activeMaster?: MasterType | null;
  onSelectMaster?: (master: MasterType | null) => void;
  onLogout?: () => void;
  onToggleMobileSidebar?: () => void;
  isLive?: boolean;
  onToggleLive?: () => void;
  alarms?: Alarm[];
  activeAlarmsCount?: number;
  onOpenAlarms?: () => void;
  onGlobalSearch?: (query: string) => void;
  onOpenHelpModal?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onQuickAddNew?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  tenants = [],
  currentTenantId,
  currentTenant,
  onSelectTenant,
  user,
  currentTab = 'overview',
  activeMaster,
  onLogout = () => {},
  onToggleMobileSidebar,
  isLive = true,
  onToggleLive,
  alarms = [],
  activeAlarmsCount,
  onOpenAlarms,
  onGlobalSearch,
  onOpenHelpModal,
  theme = 'light',
  onToggleTheme,
  onQuickAddNew,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const effectiveTenant =
    currentTenant ||
    tenants.find((t) => t.id === currentTenantId) ||
    tenants[0] || {
      id: 'tenant-1',
      name: 'Steel Logistics India',
      region: 'Odisha Freight Corridor',
      fleetSize: 18,
    };

  const effectiveUser = user || {
    name: 'Alok Mohanty',
    email: 'alok@fleetcommand.in',
    role: 'Fleet Commander',
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onGlobalSearch) {
      onGlobalSearch(searchQuery);
    }
  };

  const unreadAlarms = alarms.filter((a) => a.status === 'Active' || (a.status as any) === 'Open');
  const alarmBadgeNum = activeAlarmsCount !== undefined ? activeAlarmsCount : unreadAlarms.length;

  // Breadcrumbs text resolution
  const getTabTitle = (tab?: string) => {
    switch (tab) {
      case 'overview':
        return 'Dashboard';
      case 'jobs':
        return 'Transport Operations';
      case 'vehicles':
        return 'Fleet Management';
      case 'history':
        return 'Trip Management';
      case 'realtime':
        return 'GPS Tracking';
      case 'finance':
        return 'Billing & Accounting';
      case 'reminders':
        return 'Maintenance';
      case 'records':
        return 'Compliance & Documents';
      case 'masters':
        return activeMaster ? MASTER_DEFINITIONS[activeMaster]?.name : 'Masters Management';
      case 'reports':
        return 'Reports & Analytics';
      case 'settings':
        return 'Settings';
      default:
        return 'Overview';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-3 sm:px-5 backdrop-blur-md dark:border-zinc-800 dark:bg-[#07070a]/95">
      {/* Left section: Mobile menu + Page Title / Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white lg:hidden cursor-pointer"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Tenant Selector */}
        <div className="relative">
          <button
            onClick={() => setShowTenantDropdown(!showTenantDropdown)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-zinc-700 dark:bg-[#121217] dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-red-400" />
            <span className="max-w-[120px] truncate sm:max-w-[180px] text-[11.5px] font-bold">
              {effectiveTenant.name}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400 dark:text-zinc-400" />
          </button>

          {showTenantDropdown && (
            <div className="absolute left-0 mt-1.5 w-72 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl z-50 dark:border-zinc-800 dark:bg-[#0e0e12]">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-red-400">
                Operating Partition
              </div>
              <div className="mt-1 space-y-1">
                {tenants.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTenant?.(t);
                      setShowTenantDropdown(false);
                    }}
                    className={`flex w-full items-start justify-between rounded-lg p-2 text-left text-xs transition-colors cursor-pointer ${
                      t.id === effectiveTenant.id
                        ? 'bg-blue-50 text-blue-700 font-bold dark:bg-red-950/40 dark:text-red-400'
                        : 'text-slate-700 hover:bg-slate-50 dark:text-zinc-300 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-[10.5px] text-slate-500 dark:text-zinc-400">{t.region}</div>
                    </div>
                    <span className="rounded bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[9.5px] font-bold text-slate-600 dark:text-zinc-300">
                      {t.fleetSize} units
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Breadcrumb path */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-500 pl-1">
          <span className="text-slate-300 dark:text-zinc-700">|</span>
          <span className="font-medium text-slate-700 dark:text-zinc-300">
            {getTabTitle(currentTab)}
          </span>
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search vehicle reg (OD14), route, customer, master..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 pl-8.5 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-hidden dark:border-zinc-700 dark:bg-[#121217] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-red-500 dark:focus:bg-[#14141a] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Right section: Theme Toggle, Quick Add, Alarms, Help, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Quick Add Button if provided */}
        {onQuickAddNew && (
          <button
            type="button"
            onClick={onQuickAddNew}
            className="hidden sm:flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white dark:bg-red-600 dark:hover:bg-red-700 px-2.5 py-1 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Create New Master Entry"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add New</span>
          </button>
        )}

        {/* Theme Switcher Toggle */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light ERP Theme' : 'Switch to Dark Command Center'}
          >
            {theme === 'dark' ? (
              <Sun className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-slate-600" />
            )}
          </button>
        )}

        {/* Help icon */}
        <button
          type="button"
          onClick={() => setShowHelpModal(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          title="Masters ERP Guidelines & Help"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>

        {/* Notifications / Alarms */}
        <div className="relative">
          <button
            onClick={() => {
              if (onOpenAlarms) {
                onOpenAlarms();
              } else {
                setShowNotifications(!showNotifications);
              }
            }}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors cursor-pointer"
            title="Active Operational Alarms"
          >
            <Bell className="h-3.5 w-3.5" />
            {alarmBadgeNum > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-xs">
                {alarmBadgeNum}
              </span>
            )}
          </button>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 p-1 pr-2 hover:bg-slate-50 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white font-bold text-[11px] dark:bg-red-600">
              {effectiveUser.name.charAt(0)}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[11px] font-bold leading-tight text-slate-900 dark:text-zinc-100">
                {effectiveUser.name}
              </span>
              <span className="text-[9.5px] font-semibold text-blue-600 dark:text-red-400">
                {effectiveUser.role}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-1.5 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl z-50 dark:border-zinc-800 dark:bg-[#0e0e12]">
              <div className="border-b border-slate-100 px-2.5 py-1.5 dark:border-zinc-800">
                <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">{effectiveUser.name}</div>
                <div className="text-[10.5px] text-slate-500 dark:text-zinc-400">{effectiveUser.email}</div>
                <div className="mt-1 inline-block rounded bg-blue-50 px-1.5 py-0.5 text-[9.5px] font-bold text-blue-700 dark:bg-red-950/60 dark:text-red-400">
                  {effectiveUser.role}
                </div>
              </div>

              <div className="mt-1 space-y-0.5">
                <button
                  onClick={() => {
                    setShowHelpModal(true);
                    setShowUserMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                  <span>ERP Documentation & SOPs</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </div>
                  <span className="text-[10px] font-normal text-slate-400 dark:text-zinc-500">
                    Login Screen
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-[#0e0e12] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white dark:bg-red-600">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Masters ERP Reference Manual
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Standard Operating Procedure for Master Data Administration
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-zinc-300">
              <p>
                The <strong>Masters Management Module</strong> centralizes all 48 operational master entities across 10 functional groups:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[11.5px]">
                <li><strong>Organization:</strong> Company legal entities, branch hubs, financial periods and granular user role matrices.</li>
                <li><strong>Party:</strong> Shippers, consignors, consignees, vendors and contracted vehicle owners.</li>
                <li><strong>Fleet:</strong> Vehicles, load ratings, commercial drivers, cleaners, and fuel stations.</li>
                <li><strong>Logistics:</strong> Highway corridors, cargo commodities, UOM conversions, and geofence polygons.</li>
                <li><strong>Commercial:</strong> Rate charts, detention charge slabs, and SLA contracts.</li>
                <li><strong>Finance & Compliance:</strong> Expense heads, banking ledgers, GST configurations, and fitness compliance certificates.</li>
                <li><strong>Telematics & Workflows:</strong> AIS-140 GPS trackers, IoT sensors, cameras, and escalation alert rules.</li>
              </ul>
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-2.5 text-[11px] text-blue-800 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-300">
                To prevent data integrity errors, referenced master records cannot be deleted if active trips or transactions depend on them. Use <strong>Deactivate</strong> instead.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="rounded-lg bg-blue-600 text-white dark:bg-red-600 px-4 py-1.5 text-xs font-semibold hover:bg-blue-700 dark:hover:bg-red-700 cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
