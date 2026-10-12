import React, { useState, useEffect } from 'react';
import {
  mockTenants,
  mockVehicles,
  mockDrivers,
  mockJobs,
  mockReminders,
  mockAlarms,
  initialUser,
} from './mockData';
import {
  Vehicle,
  Driver,
  Job,
  Reminder,
  AlarmEvent,
  Tenant,
  NavigationTab,
  UserProfile,
} from './types';
import { MasterType } from './types/masters';
import { MASTER_DEFINITIONS } from './data/masterDefinitions';
import { ToastProvider, useToast } from './components/common/Toast';
import { Sidebar } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';

// Views
import { LoginView } from './components/views/LoginView';
import { OverviewView } from './components/views/OverviewView';
import { RealtimeView } from './components/views/RealtimeView';
import { HistoryView } from './components/views/HistoryView';
import { VehiclesView } from './components/views/VehiclesView';
import { DriversView } from './components/views/DriversView';
import { JobsView } from './components/views/JobsView';
import { RemindersView } from './components/views/RemindersView';
import { FinanceView } from './components/views/FinanceView';
import { RecordsView } from './components/views/RecordsView';
import { AlarmsView } from './components/views/AlarmsView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';
import { MastersHub } from './components/masters/MastersHub';

function FleetCommandApp() {
  const { showToast } = useToast();

  // Authentication & Tenant: defaults to false if not previously logged in so user sees the Login Page and Single-Click Demo Login
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fleet_erp_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [tenants] = useState<Tenant[]>(mockTenants);
  const [selectedTenant, setSelectedTenant] = useState<Tenant>(mockTenants[0]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(initialUser);

  // Theme State: defaults to clean Light ERP theme as requested in Section 1
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Navigation & UI State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('masters');
  const [activeMaster, setActiveMaster] = useState<MasterType | null>('company');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Fleet Entity State
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [reminders, setReminders] = useState<Reminder[]>(mockReminders);
  const [alarms, setAlarms] = useState<AlarmEvent[]>(mockAlarms);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Live Telemetry Simulation Engine (every 5 seconds)
  const [isLive, setIsLive] = useState<boolean>(true);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.status === 'Running') {
            const dLat = (Math.random() - 0.48) * 0.003;
            const dLng = (Math.random() - 0.48) * 0.003;
            const speedJitter = Math.floor(Math.random() * 5) - 2;
            const newSpeed = Math.min(80, Math.max(35, v.speed + speedJitter));

            return {
              ...v,
              lat: v.lat + dLat,
              lng: v.lng + dLng,
              speed: newSpeed,
              odometer: v.odometer + 0.1,
              todayDistance: Number((v.todayDistance + 0.1).toFixed(1)),
              lastUpdated: 'Just now',
            };
          }
          return v;
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  // Global search handler: searches across Masters, Vehicles, Jobs
  const handleGlobalSearch = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return;

    // 1. Search in Masters
    const masterKeys = Object.keys(MASTER_DEFINITIONS) as MasterType[];
    const matchedMaster = masterKeys.find((mKey) => {
      const def = MASTER_DEFINITIONS[mKey];
      return (
        def.name.toLowerCase().includes(q) ||
        def.singularName.toLowerCase().includes(q) ||
        def.codePrefix.toLowerCase().includes(q) ||
        mKey.toLowerCase().includes(q)
      );
    });

    if (matchedMaster) {
      setCurrentTab('masters');
      setActiveMaster(matchedMaster);
      showToast('info', 'Master Located', `Switched to ${MASTER_DEFINITIONS[matchedMaster].name}`);
      return;
    }

    // 2. Search vehicles
    const matchedVehicle = vehicles.find(
      (v) =>
        v.regNumber.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.driverName.toLowerCase().includes(q)
    );

    if (matchedVehicle) {
      setSelectedVehicle(matchedVehicle);
      setCurrentTab('realtime');
      showToast('info', 'Vehicle Located', `Switched to live tracking for ${matchedVehicle.regNumber}`);
      return;
    }

    // 3. Search jobs
    const matchedJob = jobs.find(
      (j) =>
        j.jobNumber.toLowerCase().includes(q) ||
        j.origin.toLowerCase().includes(q) ||
        j.destination.toLowerCase().includes(q)
    );

    if (matchedJob) {
      setCurrentTab('jobs');
      showToast('info', 'Job Found', `Found order ${matchedJob.jobNumber}`);
      return;
    }

    showToast('info', 'Search', `No asset directly matching "${query}"`);
  };

  // Alarm action handlers
  const handleAcknowledgeAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Acknowledged' as const } : a))
    );
  };

  const handleResolveAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Resolved' as const } : a))
    );
  };

  const handleSelectVehicleByReg = (reg: string) => {
    const v = vehicles.find((item) => item.regNumber === reg);
    if (v) setSelectedVehicle(v);
  };

  // If user is logged out, show LoginView
  if (!isAuthenticated) {
    return (
      <LoginView
        tenants={tenants}
        currentTheme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        onLoginSuccess={(user, tenantId) => {
          const tenant = tenants.find((t) => t.id === tenantId) || tenants[0];
          setSelectedTenant(tenant);
          setCurrentUser(user);
          setIsAuthenticated(true);
          try {
            localStorage.setItem('fleet_erp_auth', 'true');
          } catch {
            // ignore
          }
          showToast('success', 'Authenticated', `Welcome back, ${user.name} (${tenant.name})`);
        }}
        onLogin={(tenant) => {
          setSelectedTenant(tenant);
          setIsAuthenticated(true);
          try {
            localStorage.setItem('fleet_erp_auth', 'true');
          } catch {
            // ignore
          }
          showToast('success', 'Authenticated', `Welcome back to ${tenant.name}`);
        }}
      />
    );
  }

  // Active counts for badge notification
  const activeAlarmCount = alarms.filter((a) => a.status === 'Active').length;
  const urgentReminderCount = reminders.filter(
    (r) => r.status === 'Overdue' || r.status === 'Urgent'
  ).length;
  const activeJobCount = jobs.filter(
    (j) => j.status === 'Running' || j.status === 'Delayed'
  ).length;

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans transition-colors ${
      theme === 'dark' ? 'bg-[#000000] text-zinc-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setIsMobileSidebarOpen(false);
        }}
        activeMaster={activeMaster}
        onSelectMaster={(m) => {
          setActiveMaster(m);
          setCurrentTab('masters');
          setIsMobileSidebarOpen(false);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeAlarmsCount={activeAlarmCount}
        activeRemindersCount={urgentReminderCount}
        activeJobsCount={activeJobCount}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div className={`flex flex-1 flex-col overflow-hidden ${
        theme === 'dark' ? 'bg-[#000000]' : 'bg-[#f8fafc]'
      }`}>
        {/* Top Header */}
        <Navbar
          user={currentUser}
          currentTenant={selectedTenant}
          tenants={tenants}
          currentTab={currentTab}
          activeMaster={activeMaster}
          onSelectMaster={setActiveMaster}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          onSelectTenant={(t) => {
            setSelectedTenant(t);
            showToast('info', 'Tenant Switched', `Active workspace: ${t.name}`);
          }}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          activeAlarmsCount={activeAlarmCount}
          onOpenAlarms={() => setCurrentTab('alarms')}
          onGlobalSearch={handleGlobalSearch}
          isLive={isLive}
          onToggleLive={() => {
            setIsLive(!isLive);
            showToast('info', isLive ? 'Telemetry Paused' : 'Telemetry Live', 'AIS-140 stream toggle');
          }}
          onLogout={() => {
            try {
              localStorage.removeItem('fleet_erp_auth');
            } catch (e) {
              // ignore
            }
            setIsAuthenticated(false);
            showToast('info', 'Logged Out', 'Session ended. Returned to Login screen.');
          }}
        />

        {/* Scrollable Main View Container */}
        <main className={`flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-6 ${
          theme === 'dark' ? 'bg-[#000000]' : 'bg-[#f8fafc]'
        }`}>
          {/* MASTERS HUB */}
          {currentTab === 'masters' && (
            <MastersHub
              activeMaster={activeMaster}
              onSelectMaster={setActiveMaster}
              onNavigateTab={setCurrentTab}
            />
          )}

          {/* DASHBOARD / OVERVIEW */}
          {currentTab === 'overview' && (
            <OverviewView
              vehicles={vehicles}
              alarms={alarms}
              jobs={jobs}
              reminders={reminders}
              onNavigateTab={setCurrentTab}
              onSelectVehicle={(v) => {
                setSelectedVehicle(v);
                setCurrentTab('realtime');
              }}
            />
          )}

          {/* REALTIME GPS TRACKING */}
          {currentTab === 'realtime' && (
            <RealtimeView
              vehicles={vehicles}
              selectedVehicle={selectedVehicle}
              onSelectVehicle={setSelectedVehicle}
              onNavigateTab={setCurrentTab}
              isLive={isLive}
            />
          )}

          {/* TRIP HISTORY */}
          {currentTab === 'history' && (
            <HistoryView
              vehicles={vehicles}
              selectedVehicle={selectedVehicle}
              onSelectVehicle={setSelectedVehicle}
            />
          )}

          {/* FLEET MANAGEMENT / VEHICLES */}
          {currentTab === 'vehicles' && (
            <VehiclesView
              vehicles={vehicles}
              drivers={drivers}
              selectedVehicle={selectedVehicle}
              onSelectVehicle={setSelectedVehicle}
              onNavigateTab={setCurrentTab}
              onAddVehicle={(newV) => {
                const created = {
                  ...newV,
                  id: `v-${Date.now()}`,
                } as Vehicle;
                setVehicles([created, ...vehicles]);
              }}
            />
          )}

          {/* DRIVERS */}
          {currentTab === 'drivers' && (
            <DriversView
              drivers={drivers}
              onAddDriver={(d) => setDrivers([d, ...drivers])}
              onNavigateTab={setCurrentTab}
            />
          )}

          {/* TRANSPORT OPERATIONS / JOBS */}
          {currentTab === 'jobs' && (
            <JobsView
              jobs={jobs}
              vehicles={vehicles}
              drivers={drivers}
              onCreateJob={(j) => setJobs([j, ...jobs])}
              onNavigateTab={setCurrentTab}
            />
          )}

          {/* MAINTENANCE / REMINDERS */}
          {currentTab === 'reminders' && (
            <RemindersView
              reminders={reminders}
              vehicles={vehicles}
              onAddReminder={(rem) => setReminders([rem, ...reminders])}
              onResolveReminder={(id) => {
                setReminders((prev) =>
                  prev.map((r) => (r.id === id ? { ...r, status: 'Completed' as const } : r))
                );
              }}
            />
          )}

          {/* BILLING & FINANCE */}
          {currentTab === 'finance' && <FinanceView vehicles={vehicles} />}

          {/* COMPLIANCE & RECORDS */}
          {currentTab === 'records' && <RecordsView vehicles={vehicles} />}

          {/* TELEMETRY ALARMS */}
          {currentTab === 'alarms' && (
            <AlarmsView
              alarms={alarms}
              onAcknowledgeAlarm={handleAcknowledgeAlarm}
              onResolveAlarm={handleResolveAlarm}
              onNavigateTab={setCurrentTab}
              onSelectVehicleByReg={handleSelectVehicleByReg}
            />
          )}

          {/* REPORTS & ANALYTICS */}
          {currentTab === 'reports' && (
            <ReportsView vehicles={vehicles} drivers={drivers} />
          )}

          {/* SETTINGS */}
          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <FleetCommandApp />
    </ToastProvider>
  );
}
