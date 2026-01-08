
export enum AssetStatus {
  ACTIVE = 'Active',
  MAINTENANCE = 'Maintenance',
  SPARE = 'Spare',
  DISPOSED = 'Disposed',
  OBSOLETE = 'Obsolete'
}

export enum TicketStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved'
}

export enum Severity {
  MAJOR = 'Major',
  MINOR = 'Minor'
}

export interface ACAsset {
  id: number;
  campus: string;
  floor: string;
  room: string;
  type: string;
  capacity: string;
  status: AssetStatus;
  complaints: number;
  health: number;
  issuesThisMonth: number;
}

export interface Ticket {
  id: string;
  assetId: number;
  severity: Severity;
  issue: string;
  status: TicketStatus;
  assignedTo?: string;
  timestamp: string;
  resolvedAt?: string;
  resolver?: string;
}

export interface TechProfile {
  name: string;
  points: number;
  demerits: number;
  attendance: boolean;
  tasks: string[];
}

export interface Tool {
  name: string;
  quantity: number;
}

export interface Refrigerant {
  name: string;
  type: 'AC' | 'Fridge';
  kg: number;
}

export enum ChecklistType {
  DAILY = 'Daily',
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly'
}

export interface ChecklistRecord {
  type: ChecklistType;
  done: boolean;
  assetId: number;
}
