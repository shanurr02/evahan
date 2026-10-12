import React, { useState } from 'react';
import {
  Building2,
  Users2,
  Truck,
  MapPin,
  Receipt,
  Coins,
  FileCheck,
  Wrench,
  Radio,
  GitPullRequest,
  Search,
  ArrowRight,
  Plus,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { MasterCategory, MasterRecord, MasterType } from '../../types/masters';
import { MASTER_CATEGORIES, MASTER_DEFINITIONS } from '../../data/masterDefinitions';
import { INITIAL_MASTER_RECORDS } from '../../data/masterSeedData';
import { MasterListingPage } from './MasterListingPage';

// Icon mapping helper
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Building2,
  Users2,
  Truck,
  MapPin,
  Receipt,
  Coins,
  FileCheck,
  Wrench,
  Radio,
  GitPullRequest,
};

interface MastersHubProps {
  activeMaster?: MasterType | null;
  onSelectMaster: (masterType: MasterType | null) => void;
  onNavigateTab?: (tab: any) => void;
}

export const MastersHub: React.FC<MastersHubProps> = ({
  activeMaster,
  onSelectMaster,
}) => {
  // Master records repository in React state
  const [recordsMap, setRecordsMap] = useState<Record<MasterType, MasterRecord[]>>(INITIAL_MASTER_RECORDS);
  const [selectedCategory, setSelectedCategory] = useState<MasterCategory>('organization');
  const [hubSearchQuery, setHubSearchQuery] = useState('');

  // CRUD handlers for active master
  const handleAddRecord = (masterType: MasterType, data: Partial<MasterRecord>) => {
    const newRecord: MasterRecord = {
      id: `${masterType}-${Date.now()}`,
      code: data.code || `${MASTER_DEFINITIONS[masterType].codePrefix}-${Math.floor(1000 + Math.random() * 9000)}`,
      name: data.name || '',
      is_active: data.is_active ?? true,
      created_at: new Date().toISOString(),
      created_by: 'Operations Desk',
      updated_at: new Date().toISOString(),
      updated_by: 'Operations Desk',
      ...data,
    };

    setRecordsMap((prev) => ({
      ...prev,
      [masterType]: [newRecord, ...(prev[masterType] || [])],
    }));
  };

  const handleUpdateRecord = (masterType: MasterType, id: string, data: Partial<MasterRecord>) => {
    setRecordsMap((prev) => ({
      ...prev,
      [masterType]: (prev[masterType] || []).map((r) =>
        r.id === id
          ? {
              ...r,
              ...data,
              updated_at: new Date().toISOString(),
              updated_by: 'Operations Desk',
            }
          : r
      ),
    }));
  };

  const handleDeleteRecord = (masterType: MasterType, id: string) => {
    setRecordsMap((prev) => ({
      ...prev,
      [masterType]: (prev[masterType] || []).filter((r) => r.id !== id),
    }));
  };

  const handleToggleStatus = (masterType: MasterType, id: string) => {
    setRecordsMap((prev) => ({
      ...prev,
      [masterType]: (prev[masterType] || []).map((r) =>
        r.id === id ? { ...r, is_active: !r.is_active, updated_at: new Date().toISOString() } : r
      ),
    }));
  };

  const handleDuplicateRecord = (masterType: MasterType, record: MasterRecord) => {
    const meta = MASTER_DEFINITIONS[masterType];
    const duplicated: MasterRecord = {
      ...record,
      id: `${masterType}-${Date.now()}`,
      code: `${record.code}-COPY`,
      name: record.name ? `${record.name} (Copy)` : undefined,
      created_at: new Date().toISOString(),
      created_by: 'Duplicate Action',
      updated_at: new Date().toISOString(),
      updated_by: 'Duplicate Action',
    };
    setRecordsMap((prev) => ({
      ...prev,
      [masterType]: [duplicated, ...(prev[masterType] || [])],
    }));
  };

  const handleBulkAction = (
    masterType: MasterType,
    action: 'activate' | 'deactivate' | 'delete',
    ids: string[]
  ) => {
    setRecordsMap((prev) => {
      const list = prev[masterType] || [];
      if (action === 'delete') {
        return { ...prev, [masterType]: list.filter((r) => !ids.includes(r.id)) };
      }
      return {
        ...prev,
        [masterType]: list.map((r) =>
          ids.includes(r.id)
            ? { ...r, is_active: action === 'activate', updated_at: new Date().toISOString() }
            : r
        ),
      };
    });
  };

  // If a specific master is selected, render its dedicated listing page!
  if (activeMaster) {
    const meta = MASTER_DEFINITIONS[activeMaster];
    const cat = MASTER_CATEGORIES.find((c) => c.id === meta.category);
    const records = recordsMap[activeMaster] || [];

    return (
      <div className="space-y-4">
        {/* Quick category banner with back button to Master Overview */}
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs dark:border-zinc-800 dark:bg-[#0a0a0d]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectMaster(null)}
              className="font-semibold text-blue-600 hover:underline dark:text-red-400 cursor-pointer"
            >
              &larr; Masters Index
            </button>
            <span className="text-slate-300 dark:text-zinc-600">|</span>
            <span className="text-slate-500 dark:text-zinc-400">
              Category: <strong>{cat?.name}</strong>
            </span>
          </div>

          {/* Quick jump to siblings in same category */}
          <div className="hidden md:flex items-center gap-1.5 overflow-x-auto">
            <span className="text-slate-400 text-[11px]">Related:</span>
            {cat?.masters.map((mKey) => {
              const sibMeta = MASTER_DEFINITIONS[mKey];
              const isCurr = mKey === activeMaster;
              return (
                <button
                  key={mKey}
                  type="button"
                  onClick={() => onSelectMaster(mKey)}
                  className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                    isCurr
                      ? 'bg-blue-600 text-white dark:bg-red-600'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                  }`}
                >
                  {sibMeta.singularName}
                </button>
              );
            })}
          </div>
        </div>

        <MasterListingPage
          metadata={meta}
          records={records}
          categoryName={cat?.name}
          categoryCode={cat?.code}
          onAddRecord={(data) => handleAddRecord(activeMaster, data)}
          onUpdateRecord={(id, data) => handleUpdateRecord(activeMaster, id, data)}
          onDeleteRecord={(id) => handleDeleteRecord(activeMaster, id)}
          onToggleStatus={(id) => handleToggleStatus(activeMaster, id)}
          onDuplicateRecord={(rec) => handleDuplicateRecord(activeMaster, rec)}
          onBulkAction={(action, ids) => handleBulkAction(activeMaster, action, ids)}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // Default Overview / Hub View: All 10 Categories & 48 Masters!
  // -------------------------------------------------------------
  const totalMasterTypesCount = 48;
  const totalStoredRecordsCount = (Object.values(recordsMap) as MasterRecord[][]).reduce(
    (acc: number, arr: MasterRecord[]) => acc + (arr?.length || 0),
    0
  );

  // Filter masters across search query in hub
  const filteredCategoryList = MASTER_CATEGORIES.map((cat) => {
    const matchingMasters = cat.masters.filter((mKey) => {
      if (!hubSearchQuery.trim()) return true;
      const mMeta = MASTER_DEFINITIONS[mKey];
      const q = hubSearchQuery.toLowerCase();
      return (
        mMeta.name.toLowerCase().includes(q) ||
        mMeta.singularName.toLowerCase().includes(q) ||
        mMeta.shortDescription.toLowerCase().includes(q) ||
        cat.name.toLowerCase().includes(q)
      );
    });
    return {
      ...cat,
      matchingMasters,
    };
  }).filter((cat) => cat.matchingMasters.length > 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#0a0a0d] shadow-2xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-red-400">
              <Layers className="h-4 w-4" />
              <span>Enterprise Transport ERP</span>
            </div>
            <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Masters Management Center
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 max-w-2xl">
              Centralized repository for all 48 master definitions: Organization hierarchy, Commercial contracts, Fleet assets, Logistics corridors, Accounting ledgers & IoT Telematics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-center dark:border-zinc-800 dark:bg-[#111116] min-w-[110px]">
              <span className="block text-xl font-bold font-mono-num text-slate-900 dark:text-zinc-100">
                {totalMasterTypesCount}
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-zinc-400">Master Types</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-center dark:border-zinc-800 dark:bg-[#111116] min-w-[110px]">
              <span className="block text-xl font-bold font-mono-num text-emerald-600 dark:text-emerald-400">
                {totalStoredRecordsCount}
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-zinc-400">Active Records</span>
            </div>
          </div>
        </div>

        {/* Global Search across all 48 Masters */}
        <div className="mt-4 relative max-w-xl">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            value={hubSearchQuery}
            onChange={(e) => setHubSearchQuery(e.target.value)}
            placeholder="Search across all 48 Masters (e.g. Rate Chart, Vehicle, GST, Geofence, Driver)..."
            className="w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-[#121216] pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#121216] focus:border-blue-600 dark:focus:border-red-500 transition-colors shadow-2xs"
          />
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex overflow-x-auto gap-2 pb-1">
        {MASTER_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const Icon = CATEGORY_ICONS[cat.iconName] || Layers;
          const masterCount = cat.masters.length;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setHubSearchQuery('');
              }}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-red-600 dark:bg-red-950/40 dark:text-red-400 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-zinc-800 dark:bg-[#0a0a0d] dark:text-zinc-400 dark:hover:border-zinc-700'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.name}</span>
              <span className="rounded-full bg-slate-200/70 dark:bg-zinc-800 px-1.5 py-0.2 text-[10px]">
                {masterCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Categories & Master Grid */}
      <div className="space-y-6">
        {filteredCategoryList.map((cat) => {
          // If not searching, only show currently selected category
          if (!hubSearchQuery && selectedCategory !== cat.id) return null;

          const Icon = CATEGORY_ICONS[cat.iconName] || Layers;

          return (
            <div key={cat.id} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600/10 text-blue-600 dark:bg-red-600/15 dark:text-red-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      {cat.name}
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {cat.description}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  {cat.matchingMasters.length} Masters
                </span>
              </div>

              {/* Masters Grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {cat.matchingMasters.map((mKey) => {
                  const mMeta = MASTER_DEFINITIONS[mKey];
                  const records = recordsMap[mKey] || [];
                  const count = records.length;
                  const active = records.filter((r) => r.is_active).length;

                  return (
                    <div
                      key={mKey}
                      onClick={() => onSelectMaster(mKey)}
                      className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-[#0a0a0d] hover:border-blue-500 dark:hover:border-red-500 transition-all cursor-pointer shadow-2xs hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono-num rounded bg-slate-100 px-1.5 py-0.5 text-[10.5px] font-bold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                              {mMeta.codePrefix}
                            </span>
                            <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-red-400 transition-colors">
                              {mMeta.name}
                            </h3>
                          </div>
                          <span className="flex h-5 w-5 items-center justify-center rounded-full text-slate-300 group-hover:text-blue-600 dark:group-hover:text-red-400 transition-colors">
                            <ChevronRight className="h-4 w-4" />
                          </span>
                        </div>

                        <p className="mt-2 text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {mMeta.shortDescription}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800/80 pt-2.5 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-num font-bold text-slate-800 dark:text-zinc-200">
                            {count}
                          </span>
                          <span className="text-slate-400">records</span>
                          <span className="text-slate-300 dark:text-zinc-700">&bull;</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            {active} active
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-blue-600 group-hover:underline dark:text-red-400 flex items-center gap-0.5">
                          <span>Manage</span>
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
