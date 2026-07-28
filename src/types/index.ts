export type ClientStatus = 'Active' | 'Inactive' | 'Lead' | 'On Hold';
export type PreferredContact = 'Email' | 'WhatsApp' | 'Phone' | 'Telegram';
export type ClientSource = 'Organic' | 'Referral' | 'LinkedIn' | 'Website' | 'Upwork' | 'Cold Outreach' | 'Other';

export interface Client {
  id: string;
  name: string;
  company: string;
  designation: string;
  country: string;
  city: string;
  address: string;
  email: string;
  phone: string;
  whatsapp: string;
  telegram: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  website: string;
  notes: string;
  preferredContactMethod: PreferredContact;
  timeZone: string;
  source: ClientSource;
  status: ClientStatus;
  clientSince: string;
  tags: string[];
  avatar?: string;
  documentIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type ProjectStatus = 
  | 'Inquiry' 
  | 'Proposal Sent' 
  | 'Approved' 
  | 'In Progress' 
  | 'Revision' 
  | 'Testing' 
  | 'Delivered' 
  | 'Completed' 
  | 'Cancelled';

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  type: string;
  description: string;
  technology: string[];
  budget: number;
  paidAmount: number;
  dueAmount: number;
  currency: string;
  deadline: string;
  priority: ProjectPriority;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  assignedNotes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'Bank Transfer' | 'Wire Transfer' | 'Stripe' | 'Wise' | 'Crypto' | 'PayPal' | 'Cash';
export type PaymentStatus = 'Paid' | 'Pending' | 'Overdue';

export interface Payment {
  id: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId: string;
  invoiceNumber: string;
  date: string;
  status: PaymentStatus;
  notes?: string;
  createdAt: string;
}

export type CommunicationType = 'Call' | 'WhatsApp' | 'Meeting' | 'Email' | 'Note' | 'Follow Up';

export interface Communication {
  id: string;
  clientId: string;
  clientName: string;
  type: CommunicationType;
  summary: string;
  details: string;
  date: string;
  followUpDate?: string;
  createdBy: string;
  createdAt: string;
}

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Completed';

export interface Task {
  id: string;
  name: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string;
  reminder?: string;
  notes?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  type: 'deadline' | 'payment' | 'followup' | 'system' | 'completion';
  title: string;
  message: string;
  timestamp: string;
  date?: string;
  isRead: boolean;
  read?: boolean;
  link?: string;
}

export type Notification = AppNotification;

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  category: 'Contract' | 'Document' | 'Logo' | 'Image' | 'PDF' | 'ZIP' | 'Other';
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  dataUrl?: string;
  uploadedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details?: string;
  entity?: string;
  entityId?: string;
  timestamp: string;
  ip?: string;
  ipAddress?: string;
  status?: 'Success' | 'Warning' | 'Security';
}

export interface AgencySettings {
  agencyName: string;
  tagline: string;
  logoUrl?: string;
  address: string;
  taxId: string;
  email: string;
  phone: string;
  website?: string;
  currency: string;
  dateFormat?: string;
  timeZone?: string;
  masterPasswordHash?: string;
  autoLockMinutes?: number;
  securityLogsEnabled?: boolean;
}

export interface DuplicateWarning {
  field: 'email' | 'phone' | 'whatsapp' | 'website';
  value: string;
  existingClient: {
    id: string;
    name: string;
    company: string;
  };
}

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  totalProjects: number;
  runningProjects: number;
  completedProjects: number;
  pendingProjects: number;
  totalRevenue: number;
  totalDue: number;
  monthlyRevenue: number;
  recentActivities: AuditLog[];
  recentPayments: Payment[];
  upcomingDeadlines: Project[];
}
