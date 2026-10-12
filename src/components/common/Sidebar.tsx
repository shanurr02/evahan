import React, { useState } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Truck,
  History,
  Radio,
  CircleDollarSign,
  Wrench,
  FileCheck,
  Layers,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Search,
  Building2,
  Users2,
  MapPin,
  Receipt,
  Coins,
  Cpu,
  GitPullRequest,
  CheckCircle2,
} from 'lucide-react';
import { NavigationTab } from '../../types';
import { MasterCategory, MasterType } from '../../types/masters';
import { MASTER_CATEGORIES, MASTER_DEFINITIONS } from '../../data/masterDefinitions';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Building2,
  Users2,
  Truck,
  MapPin,
  Receipt,
  Coins,
  FileCheck,
  Wrench,
  Radio: Cpu,
  GitPullRequest,
};

export interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  activeMaster?: MasterType | null;
  onSelectMaster?: (master: MasterType | null) => void;
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
  setIsCollapsed?: (collapsed: boolean) => void;
  activeAlarmsCount?: number;
  activeRemindersCount?: number;
  activeJobsCount?: number;
  badgeCounts?: {
    alarms?: number;
    reminders?: number;
    issues?: number;
    jobs?: number;
  };
  isMobileOpen?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeMaster,
  onSelectMaster,
  isCollapsed,
  onToggleCollapse,
  setIsCollapsed,
  activeAlarmsCount,
  activeRemindersCount,
  activeJobsCount,
  badgeCounts,
  isMobileOpen,
  mobileOpen,
  onCloseMobile,
  setMobileOpen,
}) => {
  const resolvedMobileOpen = isMobileOpen ?? mobileOpen ?? false;
  const handleClose = () => {
    onCloseMobile?.();
    setMobileOpen?.(false);
  };
  const handleToggle = () => {
    if (onToggleCollapse) onToggleCollapse();
    else if (setIsCollapsed) setIsCollapsed(!isCollapsed);
  };

  // Masters submenu accordion states
  const [isMastersMenuOpen, setIsMastersMenuOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    organization: true,
  });
  const [sidebarSearch, setSidebarSearch] = useState('');

  const toggleCategory = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const jobsCount = activeJobsCount ?? badgeCounts?.jobs ?? 0;
  const remindersCount = activeRemindersCount ?? badgeCounts?.reminders ?? 0;

  // Layout items per Section 2 of Prompt
  const mainNavItems = [
    {
      id: 'overview' as NavigationTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'jobs' as NavigationTab,
      label: 'Transport Operations',
      icon: Briefcase,
      badge: jobsCount > 0 ? `${jobsCount}` : undefined,
    },
    {
      id: 'vehicles' as NavigationTab,
      label: 'Fleet Management',
      icon: Truck,
    },
    {
      id: 'history' as NavigationTab,
      label: 'Trip Management',
      icon: History,
    },
    {
      id: 'realtime' as NavigationTab,
      label: 'GPS Tracking',
      icon: Radio,
      badge: 'LIVE',
      badgeColor: 'text-red-500 font-bold animate-pulse',
    },
    {
      id: 'finance' as NavigationTab,
      label: 'Billing & Accounting',
      icon: CircleDollarSign,
    },
    {
      id: 'reminders' as NavigationTab,
      label: 'Maintenance',
      icon: Wrench,
      badge: remindersCount > 0 ? `${remindersCount}` : undefined,
    },
    {
      id: 'records' as NavigationTab,
      label: 'Compliance & Documents',
      icon: FileCheck,
    },
    // Masters is rendered dynamically below with submenus
    {
      id: 'reports' as NavigationTab,
      label: 'Reports & Analytics',
      icon: BarChart3,
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleTabClick = (tabId: NavigationTab) => {
    onSelectTab(tabId);
    if (tabId !== 'masters' && onSelectMaster) {
      onSelectMaster(null);
    }
    if (resolvedMobileOpen) handleClose();
  };

  const handleMasterClick = (masterType: MasterType, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectTab('masters');
    onSelectMaster?.(masterType);
    if (resolvedMobileOpen) handleClose();
  };

  const handleMastersHeaderClick = () => {
    onSelectTab('masters');
    onSelectMaster?.(null);
    setIsMastersMenuOpen((prev) => !prev);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {resolvedMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs lg:hidden"
          onClick={handleClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ease-in-out dark:border-zinc-800 dark:bg-[#07070a] lg:static ${
          resolvedMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-16' : 'w-64'}`}
      >
        {/* Brand Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-3.5 dark:border-zinc-800 bg-white dark:bg-[#07070a]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs dark:bg-red-600">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white">
                    FLEET COMMAND
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-red-500 animate-pulse" />
                </div>
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-blue-600 dark:text-red-400">
                  Transport ERP & Masters
                </span>
              </div>
            )}
          </div>
          <button
            onClick={handleToggle}
            className="hidden h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white lg:flex cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Navigation Scrollable Body */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2.5 text-xs">
          {/* Main Top Nav Items (Dashboard, Operations, Fleet, Trip, GPS, Billing, Maintenance, Compliance) */}
          {mainNavItems.slice(0, 8).map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-red-950/40 dark:text-red-400 font-bold border border-blue-200 dark:border-red-800/60'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-blue-600 dark:text-red-400' : 'text-slate-400 dark:text-zinc-500'
                  }`}
                />
                {!isCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                {!isCollapsed && item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${item.badgeColor || 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* ======================================================== */}
          {/* MASTERS MENU - EXPANDABLE WITH 10 CATEGORIES & 48 SUBMENUS */}
          {/* ======================================================== */}
          <div className="pt-1 pb-1">
            <button
              onClick={handleMastersHeaderClick}
              title={isCollapsed ? 'Masters (48 Master Types)' : undefined}
              className={`group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 font-semibold transition-colors cursor-pointer ${
                currentTab === 'masters'
                  ? 'bg-blue-600 text-white dark:bg-red-600 dark:text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800/80'
              }`}
            >
              <Layers className="h-4 w-4 shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left font-bold text-xs">Masters</span>
                  <span
                    className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                      currentTab === 'masters'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    48
                  </span>
                  {isMastersMenuOpen ? (
                    <ChevronUp className="h-3.5 w-3.5 opacity-80" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                  )}
                </>
              )}
            </button>

            {/* Masters Submenus Tree (visible when expanded & sidebar not collapsed) */}
            {!isCollapsed && isMastersMenuOpen && (
              <div className="mt-1 space-y-1 pl-1.5 pr-0.5 border-l-2 border-blue-200 dark:border-zinc-800 ml-3.5 pt-1">
                {/* Search within masters */}
                <div className="relative mb-2 px-1">
                  <Search className="absolute left-2.5 top-2 h-3 w-3 text-slate-400" />
                  <input
                    type="text"
                    value={sidebarSearch}
                    onChange={(e) => setSidebarSearch(e.target.value)}
                    placeholder="Quick find master..."
                    className="w-full rounded border border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-[#111116] pl-7 pr-2 py-1 text-[11px] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white dark:focus:bg-[#14141a]"
                  />
                </div>

                {/* All 10 Categories Accordions */}
                {MASTER_CATEGORIES.map((cat) => {
                  const CatIcon = CATEGORY_ICONS[cat.iconName] || Layers;
                  const isCatExpanded = !!expandedCategories[cat.id] || sidebarSearch.trim().length > 0;
                  const filteredMasters = cat.masters.filter((mKey) => {
                    if (!sidebarSearch.trim()) return true;
                    const meta = MASTER_DEFINITIONS[mKey];
                    return (
                      meta.name.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
                      meta.singularName.toLowerCase().includes(sidebarSearch.toLowerCase())
                    );
                  });

                  if (sidebarSearch.trim() && filteredMasters.length === 0) return null;

                  return (
                    <div key={cat.id} className="space-y-0.5">
                      <button
                        type="button"
                        onClick={(e) => toggleCategory(cat.id, e)}
                        className="flex w-full items-center justify-between rounded px-2 py-1 text-[11.5px] font-semibold text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60 cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <CatIcon className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{cat.name.replace(' Masters', '')}</span>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                          <span>{cat.masters.length}</span>
                          {isCatExpanded ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </span>
                      </button>

                      {/* Submenu items */}
                      {isCatExpanded && (
                        <div className="space-y-0.5 pl-3 border-l border-slate-100 dark:border-zinc-800/80 ml-2">
                          {filteredMasters.map((mKey) => {
                            const meta = MASTER_DEFINITIONS[mKey];
                            const isMasterActive = currentTab === 'masters' && activeMaster === mKey;

                            return (
                              <button
                                key={mKey}
                                type="button"
                                onClick={(e) => handleMasterClick(mKey, e)}
                                className={`flex w-full items-center justify-between rounded px-2 py-1 text-[11px] transition-colors cursor-pointer ${
                                  isMasterActive
                                    ? 'bg-blue-100/70 text-blue-700 dark:bg-red-950/70 dark:text-red-400 font-bold'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200'
                                }`}
                              >
                                <span className="truncate">{meta.name.replace(' Master', '')}</span>
                                <span className="font-mono-num text-[9.5px] opacity-60">
                                  {meta.codePrefix}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Remaining Nav Items (Reports & Analytics, Settings) */}
          {mainNavItems.slice(8).map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-red-950/40 dark:text-red-400 font-bold border border-blue-200 dark:border-red-800/60'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-blue-600 dark:text-red-400' : 'text-slate-400 dark:text-zinc-500'
                  }`}
                />
                {!isCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Operational Status Footer */}
        <div className="border-t border-slate-200 p-2.5 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#09090d]">
          {!isCollapsed ? (
            <div className="rounded-lg bg-white p-2 border border-slate-200 dark:bg-[#0f0f14] dark:border-zinc-800 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800 dark:text-zinc-200">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  ERP Server Online
                </span>
                <span className="font-mono-num text-[10px] text-blue-600 dark:text-red-400">v5.2</span>
              </div>
              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-zinc-400">
                All 48 Masters Synchronized
              </p>
            </div>
          ) : (
            <div className="flex justify-center" title="ERP Server Active">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
