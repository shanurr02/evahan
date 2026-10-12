export type MasterCategory =
  | 'organization'
  | 'party'
  | 'fleet'
  | 'logistics'
  | 'commercial'
  | 'finance'
  | 'compliance'
  | 'maintenance'
  | 'tracking'
  | 'workflow';

export type MasterType =
  // A. Organization
  | 'company'
  | 'branch'
  | 'financial_year'
  | 'department'
  | 'user'
  | 'role_permission'
  // B. Party
  | 'customer'
  | 'consignor'
  | 'consignee'
  | 'vendor'
  | 'transporter'
  // C. Fleet
  | 'vehicle'
  | 'vehicle_type'
  | 'driver'
  | 'helper'
  | 'fuel_type'
  | 'fuel_station'
  // D. Location & Logistics
  | 'city_location'
  | 'route'
  | 'material'
  | 'uom'
  | 'service_type'
  | 'geofence'
  // E. Commercial
  | 'rate_chart'
  | 'freight_charge_type'
  | 'contract_sla'
  // F. Finance
  | 'trip_expense_category'
  | 'payment_mode'
  | 'bank_account'
  | 'ledger'
  | 'account_group'
  | 'gst_tax'
  // G. Document & Compliance
  | 'document_type'
  | 'vehicle_compliance'
  | 'driver_document'
  | 'reason_status'
  // H. Maintenance
  | 'maintenance_type'
  | 'spare_parts'
  | 'workshop'
  | 'tyre'
  | 'maintenance_checklist'
  // I. Tracking & Telematics
  | 'gps_device'
  | 'sensor'
  | 'camera'
  | 'alert_rule'
  // J. Workflow & Communication
  | 'expense_approval_policy'
  | 'workflow_approval'
  | 'notification_template';

export interface MasterCategoryInfo {
  id: MasterCategory;
  name: string;
  code: string;
  description: string;
  iconName: string;
  masters: MasterType[];
}

export type FieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'date'
  | 'textarea'
  | 'checkbox'
  | 'switch'
  | 'email'
  | 'phone'
  | 'file'
  | 'multiselect'
  | 'tags'
  | 'password'
  | 'permission_matrix';

export interface FormFieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  defaultValue?: any;
  helpText?: string;
  section?: string;
  dependsOn?: string;
  validationRegex?: RegExp;
  mask?: boolean;
  colSpan?: 1 | 2;
}

export interface TableColumnDefinition {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  format?: 'text' | 'badge' | 'date' | 'currency' | 'masked' | 'boolean' | 'tag' | 'phone' | 'email';
  badgeMap?: Record<string, { color: string; label?: string }>;
}

export interface MasterMetadata {
  id: MasterType;
  category: MasterCategory;
  name: string;
  shortDescription: string;
  singularName: string;
  codePrefix: string;
  iconName: string;
  identifierKey: string;
  nameKey: string;
  columns: TableColumnDefinition[];
  formSections: {
    id: string;
    title: string;
    description?: string;
    fields: FormFieldDefinition[];
  }[];
  supportsImport?: boolean;
  supportsDuplicate?: boolean;
  supportsVerification?: boolean;
  verificationField?: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  user: string;
  action: 'Created' | 'Updated' | 'Status Changed' | 'Verified' | 'Imported';
  details: string;
}

export interface MasterRecord {
  id: string;
  code: string;
  name?: string;
  is_active: boolean;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  branch_id?: string;
  branch_name?: string;
  company_id?: string;
  audit_history?: AuditRecord[];
  [key: string]: any;
}

export interface MasterFilterState {
  searchQuery: string;
  statusFilter: 'all' | 'active' | 'inactive';
  branchFilter: string;
  customFilterKey?: string;
  customFilterValue?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}
