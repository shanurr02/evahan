export type VehicleStatus = 'Running' | 'Idle' | 'Parked' | 'Inactive';

export type AlarmSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export type JobStatus = 'Planned' | 'Running' | 'Delayed' | 'Completed';

export type ReminderCategory = 'Insurance' | 'Tax' | 'Pollution Certificate' | 'Fitness' | 'Permit' | 'Service/Maintenance';

export type IssuePriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type IssueType = 'Breakdown' | 'Delay' | 'Complaint' | 'Vehicle Issue' | 'Driver Issue' | 'Route Issue' | 'Other';

export type IssueStatus = 'Open' | 'In Progress' | 'Pending Review' | 'Resolved';

export type DocumentCategory = 'RC' | 'Insurance' | 'Permit' | 'Fitness' | 'Pollution' | 'Service Invoice' | 'Job Proof' | 'Compliance Documents';

export type DocumentStatus = 'Valid' | 'Expiring Soon' | 'Expired';

export type UserRole = 'Super Admin' | 'Company Admin' | 'Operations' | 'Finance' | 'Maintenance' | 'Viewer';

export interface Vehicle {
  id: string;
  regNumber: string; // e.g. OD14AB1234
  model: string; // Tata 1612, BharatBenz 2523, etc.
  make: string;
  year: number;
  group: string; // Rourkela North, Bhubaneswar, etc.
  fuelType: 'Diesel' | 'CNG' | 'Electric';
  driverId: string;
  driverName: string;
  deviceId: string;
  deviceType: string;
  deviceStatus: 'Working' | 'Not Working' | 'Removed';
  status: VehicleStatus;
  speed: number; // km/h
  heading: number; // degrees
  lat: number;
  lng: number;
  locationName: string;
  ignition: 'ON' | 'OFF';
  batteryVoltage: number;
  fuelLevel: number; // %
  odometer: number; // km
  todayDistance: number; // km
  todayRunningTime: string; // e.g. "4h 25m"
  todayIdleTime: string; // e.g. "1h 10m"
  todayStopTime: string; // e.g. "2h 45m"
  avgSpeed: number; // km/h
  mileage: number; // km/L
  lastUpdated: string;
  activeAlarmsCount: number;
  activeJobId?: string;
  documentsStatus: 'Valid' | 'Attention Required';
  dailyUtilization: number; // %
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  assignedVehicleReg: string;
  assignedVehicleId?: string;
  status: 'Active' | 'On Trip' | 'On Leave' | 'Suspended';
  safetyScore: number; // 0 - 100
  totalTrips: number;
  experienceYears: number;
  alarmsCount: number;
  bloodGroup: string;
  joinedDate: string;
}

export interface Job {
  id: string;
  jobNumber: string;
  vehicleId: string;
  vehicleReg: string;
  driverId: string;
  driverName: string;
  origin: string;
  destination: string;
  plannedStartTime: string;
  actualStartTime?: string;
  eta: string;
  status: JobStatus;
  progress: number; // 0 - 100
  distanceKm: number;
  cargoType: string;
  cargoWeightTonnes: number;
  cargoDescription?: string;
  delayMinutes?: number;
  notes?: string;
}

export interface Alarm {
  id: string;
  type: 'Overspeed' | 'Excessive Idling' | 'Geofence' | 'Device Failure' | 'Route Deviation' | 'Harsh Braking' | 'SOS Button';
  vehicleId: string;
  vehicleReg: string;
  driverName: string;
  severity: AlarmSeverity;
  timestamp: string;
  location: string;
  speed?: number;
  speedLimit?: number;
  status: 'Open' | 'Acknowledged' | 'Resolved';
  acknowledgedBy?: string;
  details: string;
}

export interface Reminder {
  id: string;
  vehicleId: string;
  vehicleReg: string;
  category?: ReminderCategory;
  type?: string;
  title?: string;
  description?: string;
  dueDate: string;
  dueKm?: number;
  daysRemaining?: number;
  priority?: string;
  status: 'Overdue' | 'Due Today' | 'Due Soon' | 'Upcoming' | 'Completed' | 'Urgent';
  assignedTo?: string;
  costEstimate?: number;
  recurring?: boolean;
  notes?: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  vehicleReg: string;
  category: 'Fuel' | 'Scheduled Maintenance' | 'Tyres' | 'Toll & Tax' | 'Repairs' | 'Insurance';
  amount: number;
  description: string;
  addedBy: string;
  fuelLiters?: number;
  odometerReading?: number;
  stationName?: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  category: DocumentCategory;
  vehicleReg: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  status: DocumentStatus;
  fileSize: string;
  verified: boolean;
}

export interface OperationalIssue {
  id: string;
  type: IssueType;
  vehicleReg: string;
  jobId?: string;
  priority: IssuePriority;
  status: IssueStatus;
  createdDate: string;
  assignee: string;
  title: string;
  description: string;
  resolution?: string;
}

export interface TenantInfo {
  id: string;
  name: string;
  region: string;
  code: string;
  fleetSize: number;
}

export type Tenant = TenantInfo;
export type AlarmEvent = Alarm;

export type NavigationTab =
  | 'overview'
  | 'realtime'
  | 'history'
  | 'vehicles'
  | 'drivers'
  | 'jobs'
  | 'reminders'
  | 'finance'
  | 'records'
  | 'alarms'
  | 'reports'
  | 'settings'
  | 'masters';

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  avatarUrl?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}
