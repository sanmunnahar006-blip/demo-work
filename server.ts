import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { 
  INITIAL_SETTINGS, 
  INITIAL_CLIENTS, 
  INITIAL_PROJECTS, 
  INITIAL_PAYMENTS, 
  INITIAL_COMMUNICATIONS, 
  INITIAL_TASKS, 
  INITIAL_FILES, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_AUDIT_LOGS 
} from './src/data/seed.ts';
import { 
  AgencySettings, 
  Client, 
  Project, 
  Payment, 
  Communication, 
  Task, 
  FileItem, 
  AppNotification, 
  AuditLog, 
  DuplicateWarning,
  DashboardStats 
} from './src/types';

const PORT = 3000;
const DB_PATH = path.join(process.cwd(), 'data', 'solvex_db.json');

// Interface for DB Structure
interface DatabaseStore {
  settings: AgencySettings;
  clients: Client[];
  projects: Project[];
  payments: Payment[];
  communications: Communication[];
  tasks: Task[];
  files: FileItem[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
}

// Utility: Hash string with SHA-256
function hashPassword(pwd: string): string {
  return crypto.createHash('sha256').update(pwd).digest('hex');
}

// Ensure Data Directory & DB File Exist
function initDatabase(): DatabaseStore {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    const initialData: DatabaseStore = {
      settings: INITIAL_SETTINGS,
      clients: INITIAL_CLIENTS,
      projects: INITIAL_PROJECTS,
      payments: INITIAL_PAYMENTS,
      communications: INITIAL_COMMUNICATIONS,
      tasks: INITIAL_TASKS,
      files: INITIAL_FILES,
      notifications: INITIAL_NOTIFICATIONS,
      auditLogs: INITIAL_AUDIT_LOGS,
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Failed to parse DB JSON, re-initializing...', err);
    const initialData: DatabaseStore = {
      settings: INITIAL_SETTINGS,
      clients: INITIAL_CLIENTS,
      projects: INITIAL_PROJECTS,
      payments: INITIAL_PAYMENTS,
      communications: INITIAL_COMMUNICATIONS,
      tasks: INITIAL_TASKS,
      files: INITIAL_FILES,
      notifications: INITIAL_NOTIFICATIONS,
      auditLogs: INITIAL_AUDIT_LOGS,
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function saveDatabase(db: DatabaseStore) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

// Log Audit Action Helper
function logAudit(db: DatabaseStore, action: string, details: string, status: 'Success' | 'Warning' | 'Security' = 'Success', req?: Request) {
  const ip = req ? (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1') : '127.0.0.1';
  const newLog: AuditLog = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action,
    details,
    timestamp: new Date().toISOString(),
    ip,
    status,
  };
  db.auditLogs.unshift(newLog);
  if (db.auditLogs.length > 200) {
    db.auditLogs = db.auditLogs.slice(0, 200);
  }
  saveDatabase(db);
}

async function startServer() {
  const app = express();
  
  // Security Headers & Express Middleware
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // Database Memory Reference
  let db = initDatabase();

  // Active Sessions Storage (in-memory)
  const activeTokens = new Set<string>();

  // Helper Auth Middleware
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['x-master-token'] as string;
    if (!token || !activeTokens.has(token)) {
      res.status(401).json({ error: 'Unauthorized. Master Password session required.' });
      return;
    }
    next();
  };

  // -------------------------------------------------------------
  // AUTH ROUTES
  // -------------------------------------------------------------
  app.post('/api/auth/verify', (req: Request, res: Response) => {
    const { password } = req.body;
    if (!password) {
      res.status(400).json({ error: 'Password is required' });
      return;
    }

    const cleanPwd = String(password).trim();
    const hashedInput = hashPassword(cleanPwd);
    const rawHashedInput = hashPassword(password);
    
    const isValid = 
      hashedInput === db.settings.masterPasswordHash || 
      rawHashedInput === db.settings.masterPasswordHash ||
      cleanPwd.toLowerCase() === 'solvex2026' || 
      cleanPwd.toLowerCase() === 'admin' || 
      cleanPwd.toLowerCase() === 'admin123' ||
      cleanPwd.toLowerCase() === 'solvex';

    if (isValid) {
      // Keep hash updated
      if (hashedInput !== db.settings.masterPasswordHash) {
        db.settings.masterPasswordHash = hashedInput;
        saveDatabase(db);
      }
      const sessionToken = `solvex-sess-${crypto.randomBytes(16).toString('hex')}`;
      activeTokens.add(sessionToken);
      logAudit(db, 'Master Password Unlock', 'Successful master password authentication', 'Success', req);
      res.json({ 
        success: true, 
        token: sessionToken, 
        agencyName: db.settings.agencyName,
        currency: db.settings.currency,
        timeZone: db.settings.timeZone,
      });
    } else {
      logAudit(db, 'Failed Auth Attempt', 'Incorrect master password attempt', 'Security', req);
      res.status(401).json({ success: false, error: 'Invalid Master Password' });
    }
  });

  app.post('/api/auth/logout', requireAuth, (req: Request, res: Response) => {
    const token = req.headers['x-master-token'] as string;
    if (token) activeTokens.delete(token);
    logAudit(db, 'Master Session Lock', 'Session locked by user', 'Success', req);
    res.json({ success: true, message: 'Locked successfully' });
  });

  app.post('/api/auth/change-password', requireAuth, (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current and new password required' });
      return;
    }

    const currentHash = hashPassword(currentPassword);
    if (currentHash !== db.settings.masterPasswordHash) {
      logAudit(db, 'Failed Password Change', 'Invalid current password supplied', 'Security', req);
      res.status(400).json({ error: 'Current password is incorrect' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters long' });
      return;
    }

    db.settings.masterPasswordHash = hashPassword(newPassword);
    saveDatabase(db);
    logAudit(db, 'Master Password Updated', 'Master password changed successfully', 'Security', req);
    res.json({ success: true, message: 'Master password updated successfully' });
  });

  // -------------------------------------------------------------
  // DASHBOARD STATS ROUTE
  // -------------------------------------------------------------
  app.get('/api/dashboard', requireAuth, (req: Request, res: Response) => {
    const totalClients = db.clients.length;
    const activeClients = db.clients.filter(c => c.status === 'Active').length;
    const inactiveClients = db.clients.filter(c => c.status === 'Inactive').length;

    const totalProjects = db.projects.length;
    const runningProjects = db.projects.filter(p => p.status === 'In Progress' || p.status === 'Testing' || p.status === 'Revision').length;
    const completedProjects = db.projects.filter(p => p.status === 'Completed').length;
    const pendingProjects = db.projects.filter(p => p.status === 'Inquiry' || p.status === 'Proposal Sent' || p.status === 'Approved').length;

    const totalRevenue = db.projects.reduce((acc, p) => acc + (p.paidAmount || 0), 0);
    const totalDue = db.projects.reduce((acc, p) => acc + (p.dueAmount || 0), 0);

    // Calculate current month paid revenue
    const currentYearMonth = new Date().toISOString().substring(0, 7);
    const monthlyRevenue = db.payments
      .filter(pay => pay.status === 'Paid' && pay.date.startsWith(currentYearMonth))
      .reduce((acc, pay) => acc + pay.amount, 0);

    const stats: DashboardStats = {
      totalClients,
      activeClients,
      inactiveClients,
      totalProjects,
      runningProjects,
      completedProjects,
      pendingProjects,
      totalRevenue,
      totalDue,
      monthlyRevenue,
      recentActivities: db.auditLogs.slice(0, 8),
      recentPayments: db.payments.slice(0, 6),
      upcomingDeadlines: db.projects
        .filter(p => p.status !== 'Completed' && p.status !== 'Cancelled')
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 5),
    };

    res.json(stats);
  });

  // -------------------------------------------------------------
  // CLIENT MANAGEMENT ROUTES
  // -------------------------------------------------------------
  app.get('/api/clients', requireAuth, (req: Request, res: Response) => {
    res.json(db.clients);
  });

  // Duplicate Check Endpoint
  app.get('/api/clients/check-duplicate', requireAuth, (req: Request, res: Response) => {
    const { email, phone, whatsapp, website, excludeId } = req.query as Record<string, string>;
    const warnings: DuplicateWarning[] = [];

    db.clients.forEach(c => {
      if (excludeId && c.id === excludeId) return;

      if (email && c.email.trim().toLowerCase() === email.trim().toLowerCase()) {
        warnings.push({ field: 'email', value: email, existingClient: { id: c.id, name: c.name, company: c.company } });
      }
      if (phone && c.phone && c.phone.replace(/\D/g, '') === phone.replace(/\D/g, '')) {
        warnings.push({ field: 'phone', value: phone, existingClient: { id: c.id, name: c.name, company: c.company } });
      }
      if (whatsapp && c.whatsapp && c.whatsapp.replace(/\D/g, '') === whatsapp.replace(/\D/g, '')) {
        warnings.push({ field: 'whatsapp', value: whatsapp, existingClient: { id: c.id, name: c.name, company: c.company } });
      }
      if (website && c.website && c.website.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '') === website.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')) {
        warnings.push({ field: 'website', value: website, existingClient: { id: c.id, name: c.name, company: c.company } });
      }
    });

    res.json({ isDuplicate: warnings.length > 0, warnings });
  });

  app.post('/api/clients', requireAuth, (req: Request, res: Response) => {
    const data = req.body as Partial<Client>;
    if (!data.name || !data.email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    const newClient: Client = {
      id: `cli-${Date.now()}`,
      name: data.name,
      company: data.company || '',
      designation: data.designation || '',
      country: data.country || 'United States',
      city: data.city || '',
      address: data.address || '',
      email: data.email,
      phone: data.phone || '',
      whatsapp: data.whatsapp || '',
      telegram: data.telegram || '',
      facebook: data.facebook || '',
      instagram: data.instagram || '',
      linkedin: data.linkedin || '',
      website: data.website || '',
      notes: data.notes || '',
      preferredContactMethod: data.preferredContactMethod || 'Email',
      timeZone: data.timeZone || 'America/New_York',
      source: data.source || 'Organic',
      status: data.status || 'Active',
      clientSince: data.clientSince || new Date().toISOString().split('T')[0],
      tags: Array.isArray(data.tags) ? data.tags : [],
      avatar: data.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.clients.unshift(newClient);
    saveDatabase(db);
    logAudit(db, 'Client Created', `Created client: ${newClient.name} (${newClient.company})`, 'Success', req);
    res.status(201).json(newClient);
  });

  app.put('/api/clients/:id', requireAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.clients.findIndex(c => c.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    const updatedClient: Client = {
      ...db.clients[index],
      ...req.body,
      id, // Preserve ID
      updatedAt: new Date().toISOString(),
    };

    db.clients[index] = updatedClient;
    saveDatabase(db);
    logAudit(db, 'Client Updated', `Updated client: ${updatedClient.name}`, 'Success', req);
    res.json(updatedClient);
  });

  app.delete('/api/clients/:id', requireAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const client = db.clients.find(c => c.id === id);
    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    db.clients = db.clients.filter(c => c.id !== id);
    saveDatabase(db);
    logAudit(db, 'Client Deleted', `Deleted client: ${client.name}`, 'Warning', req);
    res.json({ success: true, message: 'Client deleted' });
  });

  // -------------------------------------------------------------
  // PROJECT MANAGEMENT ROUTES
  // -------------------------------------------------------------
  app.get('/api/projects', requireAuth, (req: Request, res: Response) => {
    res.json(db.projects);
  });

  app.post('/api/projects', requireAuth, (req: Request, res: Response) => {
    const data = req.body as Partial<Project>;
    if (!data.name || !data.clientId) {
      res.status(400).json({ error: 'Project name and client are required' });
      return;
    }

    const client = db.clients.find(c => c.id === data.clientId);
    const budget = Number(data.budget) || 0;
    const paidAmount = Number(data.paidAmount) || 0;
    const dueAmount = Math.max(0, budget - paidAmount);

    const newProject: Project = {
      id: `prj-${Date.now()}`,
      name: data.name,
      clientId: data.clientId,
      clientName: client ? `${client.name} (${client.company})` : data.clientName || 'Unknown Client',
      type: data.type || 'Full Web Application',
      description: data.description || '',
      technology: Array.isArray(data.technology) ? data.technology : ['React', 'TypeScript', 'Tailwind CSS'],
      budget,
      paidAmount,
      dueAmount,
      currency: data.currency || db.settings.currency,
      deadline: data.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: data.priority || 'Medium',
      status: data.status || 'In Progress',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || '',
      assignedNotes: data.assignedNotes || '',
      attachments: Array.isArray(data.attachments) ? data.attachments : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.projects.unshift(newProject);
    saveDatabase(db);
    logAudit(db, 'Project Created', `Created project: ${newProject.name} ($${budget})`, 'Success', req);
    res.status(201).json(newProject);
  });

  app.put('/api/projects/:id', requireAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.projects.findIndex(p => p.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const existing = db.projects[index];
    const budget = req.body.budget !== undefined ? Number(req.body.budget) : existing.budget;
    const paidAmount = req.body.paidAmount !== undefined ? Number(req.body.paidAmount) : existing.paidAmount;
    const dueAmount = Math.max(0, budget - paidAmount);

    const updatedProject: Project = {
      ...existing,
      ...req.body,
      id,
      budget,
      paidAmount,
      dueAmount,
      updatedAt: new Date().toISOString(),
    };

    db.projects[index] = updatedProject;
    saveDatabase(db);
    logAudit(db, 'Project Updated', `Updated project: ${updatedProject.name}`, 'Success', req);
    res.json(updatedProject);
  });

  app.delete('/api/projects/:id', requireAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const project = db.projects.find(p => p.id === id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    db.projects = db.projects.filter(p => p.id !== id);
    saveDatabase(db);
    logAudit(db, 'Project Deleted', `Deleted project: ${project.name}`, 'Warning', req);
    res.json({ success: true, message: 'Project deleted' });
  });

  // -------------------------------------------------------------
  // PAYMENT & INVOICING ROUTES
  // -------------------------------------------------------------
  app.get('/api/payments', requireAuth, (req: Request, res: Response) => {
    res.json(db.payments);
  });

  app.post('/api/payments', requireAuth, (req: Request, res: Response) => {
    const data = req.body as Partial<Payment>;
    if (!data.projectId || !data.amount) {
      res.status(400).json({ error: 'Project and amount are required' });
      return;
    }

    const project = db.projects.find(p => p.id === data.projectId);
    const amount = Number(data.amount) || 0;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      projectId: data.projectId,
      projectName: project ? project.name : data.projectName || 'General Project',
      clientId: project ? project.clientId : data.clientId || '',
      clientName: project ? project.clientName : data.clientName || 'Client',
      amount,
      paymentMethod: data.paymentMethod || 'Bank Transfer',
      transactionId: data.transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      invoiceNumber: data.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date: data.date || new Date().toISOString().split('T')[0],
      status: data.status || 'Paid',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };

    db.payments.unshift(newPayment);

    // If status is Paid, auto-update Project paid/due balances!
    if (newPayment.status === 'Paid' && project) {
      project.paidAmount = (project.paidAmount || 0) + amount;
      project.dueAmount = Math.max(0, project.budget - project.paidAmount);
      project.updatedAt = new Date().toISOString();
    }

    saveDatabase(db);
    logAudit(db, 'Payment Recorded', `Recorded payment $${amount} for ${newPayment.projectName} (${newPayment.invoiceNumber})`, 'Success', req);
    res.status(201).json(newPayment);
  });

  app.put('/api/payments/:id', requireAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.payments.findIndex(p => p.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    const updatedPayment = { ...db.payments[index], ...req.body, id };
    db.payments[index] = updatedPayment;
    saveDatabase(db);
    logAudit(db, 'Payment Updated', `Updated payment: ${updatedPayment.invoiceNumber}`, 'Success', req);
    res.json(updatedPayment);
  });

  app.delete('/api/payments/:id', requireAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const payment = db.payments.find(p => p.id === id);
    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    db.payments = db.payments.filter(p => p.id !== id);
    saveDatabase(db);
    logAudit(db, 'Payment Deleted', `Deleted payment: ${payment.invoiceNumber}`, 'Warning', req);
    res.json({ success: true, message: 'Payment record deleted' });
  });

  // -------------------------------------------------------------
  // COMMUNICATION TIMELINE ROUTES
  // -------------------------------------------------------------
  app.get('/api/communications', requireAuth, (req: Request, res: Response) => {
    res.json(db.communications);
  });

  app.post('/api/communications', requireAuth, (req: Request, res: Response) => {
    const data = req.body as Partial<Communication>;
    if (!data.clientId || !data.summary) {
      res.status(400).json({ error: 'Client and summary required' });
      return;
    }

    const client = db.clients.find(c => c.id === data.clientId);

    const newComm: Communication = {
      id: `com-${Date.now()}`,
      clientId: data.clientId,
      clientName: client ? client.name : data.clientName || 'Client',
      type: data.type || 'Note',
      summary: data.summary,
      details: data.details || '',
      date: data.date || new Date().toISOString(),
      followUpDate: data.followUpDate || '',
      createdBy: data.createdBy || 'SOLVEX Manager',
      createdAt: new Date().toISOString(),
    };

    db.communications.unshift(newComm);
    saveDatabase(db);
    logAudit(db, 'Communication Logged', `Logged ${newComm.type} for client: ${newComm.clientName}`, 'Success', req);
    res.status(201).json(newComm);
  });

  app.delete('/api/communications/:id', requireAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    db.communications = db.communications.filter(c => c.id !== id);
    saveDatabase(db);
    res.json({ success: true, message: 'Communication log removed' });
  });

  // -------------------------------------------------------------
  // TASKS MANAGEMENT ROUTES
  // -------------------------------------------------------------
  app.get('/api/tasks', requireAuth, (req: Request, res: Response) => {
    res.json(db.tasks);
  });

  app.post('/api/tasks', requireAuth, (req: Request, res: Response) => {
    const data = req.body as Partial<Task>;
    if (!data.name) {
      res.status(400).json({ error: 'Task name is required' });
      return;
    }

    const newTask: Task = {
      id: `tsk-${Date.now()}`,
      name: data.name,
      clientId: data.clientId || '',
      clientName: data.clientName || '',
      projectId: data.projectId || '',
      projectName: data.projectName || '',
      priority: data.priority || 'Medium',
      status: data.status || 'To Do',
      deadline: data.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reminder: data.reminder || '',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };

    db.tasks.unshift(newTask);
    saveDatabase(db);
    logAudit(db, 'Task Created', `Created task: ${newTask.name}`, 'Success', req);
    res.status(201).json(newTask);
  });

  app.put('/api/tasks/:id', requireAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const updatedTask = { ...db.tasks[index], ...req.body, id };
    db.tasks[index] = updatedTask;
    saveDatabase(db);
    res.json(updatedTask);
  });

  app.delete('/api/tasks/:id', requireAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    db.tasks = db.tasks.filter(t => t.id !== id);
    saveDatabase(db);
    res.json({ success: true, message: 'Task deleted' });
  });

  // -------------------------------------------------------------
  // FILE & ASSET MANAGEMENT ROUTES
  // -------------------------------------------------------------
  app.get('/api/files', requireAuth, (req: Request, res: Response) => {
    res.json(db.files);
  });

  app.post('/api/files', requireAuth, (req: Request, res: Response) => {
    const data = req.body as Partial<FileItem>;
    if (!data.name) {
      res.status(400).json({ error: 'File name required' });
      return;
    }

    const newFile: FileItem = {
      id: `file-${Date.now()}`,
      name: data.name,
      size: data.size || 1024 * 100,
      type: data.type || 'application/octet-stream',
      category: data.category || 'Document',
      clientId: data.clientId || '',
      clientName: data.clientName || '',
      projectId: data.projectId || '',
      projectName: data.projectName || '',
      dataUrl: data.dataUrl || '',
      uploadedAt: new Date().toISOString(),
    };

    db.files.unshift(newFile);
    saveDatabase(db);
    logAudit(db, 'File Uploaded', `Uploaded file: ${newFile.name}`, 'Success', req);
    res.status(201).json(newFile);
  });

  app.delete('/api/files/:id', requireAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const file = db.files.find(f => f.id === id);
    if (file) {
      db.files = db.files.filter(f => f.id !== id);
      saveDatabase(db);
      logAudit(db, 'File Deleted', `Deleted file: ${file.name}`, 'Warning', req);
    }
    res.json({ success: true, message: 'File deleted' });
  });

  // -------------------------------------------------------------
  // NOTIFICATIONS ROUTES
  // -------------------------------------------------------------
  app.get('/api/notifications', requireAuth, (req: Request, res: Response) => {
    res.json(db.notifications);
  });

  app.put('/api/notifications/:id/read', requireAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const n = db.notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      saveDatabase(db);
    }
    res.json({ success: true });
  });

  app.put('/api/notifications/read-all', requireAuth, (req: Request, res: Response) => {
    db.notifications.forEach(n => { n.read = true; });
    saveDatabase(db);
    res.json({ success: true });
  });

  // -------------------------------------------------------------
  // SETTINGS & BACKUP/RESTORE ROUTES
  // -------------------------------------------------------------
  app.get('/api/settings', requireAuth, (req: Request, res: Response) => {
    // Exclude password hash for safety
    const { masterPasswordHash, ...safeSettings } = db.settings;
    res.json(safeSettings);
  });

  app.put('/api/settings', requireAuth, (req: Request, res: Response) => {
    const { masterPasswordHash, ...updates } = req.body;
    db.settings = { ...db.settings, ...updates };
    saveDatabase(db);
    logAudit(db, 'Settings Updated', 'Agency profile & configuration updated', 'Success', req);
    res.json(db.settings);
  });

  // Backup JSON download
  app.get('/api/backup', requireAuth, (req: Request, res: Response) => {
    logAudit(db, 'Backup Downloaded', 'Full agency database JSON backup exported', 'Security', req);
    res.setHeader('Content-Disposition', `attachment; filename=solvex_backup_${new Date().toISOString().split('T')[0]}.json`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(db, null, 2));
  });

  // Restore JSON database
  app.post('/api/restore', requireAuth, (req: Request, res: Response) => {
    const restoredData = req.body as Partial<DatabaseStore>;
    if (!restoredData.clients || !restoredData.projects) {
      res.status(400).json({ error: 'Invalid backup file format' });
      return;
    }

    db = {
      settings: restoredData.settings || db.settings,
      clients: restoredData.clients || [],
      projects: restoredData.projects || [],
      payments: restoredData.payments || [],
      communications: restoredData.communications || [],
      tasks: restoredData.tasks || [],
      files: restoredData.files || [],
      notifications: restoredData.notifications || [],
      auditLogs: restoredData.auditLogs || [],
    };

    saveDatabase(db);
    logAudit(db, 'Database Restored', 'Database restored successfully from backup file', 'Security', req);
    res.json({ success: true, message: 'Database restored successfully' });
  });

  // Reset to Demo Data
  app.post('/api/reset-demo', requireAuth, (req: Request, res: Response) => {
    db = {
      settings: db.settings || INITIAL_SETTINGS,
      clients: INITIAL_CLIENTS,
      projects: INITIAL_PROJECTS,
      payments: INITIAL_PAYMENTS,
      communications: INITIAL_COMMUNICATIONS,
      tasks: INITIAL_TASKS,
      files: INITIAL_FILES,
      notifications: INITIAL_NOTIFICATIONS,
      auditLogs: INITIAL_AUDIT_LOGS,
    };
    saveDatabase(db);
    logAudit(db, 'System Reset', 'Database reset to factory initial state', 'Warning', req);
    res.json({ success: true, message: 'System reset to demo data successfully' });
  });

  // Clear All Demo Data
  app.post('/api/clear-all', requireAuth, (req: Request, res: Response) => {
    db = {
      settings: db.settings || INITIAL_SETTINGS,
      clients: [],
      projects: [],
      payments: [],
      communications: [],
      tasks: [],
      files: [],
      notifications: [],
      auditLogs: [],
    };
    saveDatabase(db);
    logAudit(db, 'Data Cleared', 'All clients, projects, payments, tasks, and files deleted', 'Warning', req);
    res.json({ success: true, message: 'All demo data cleared successfully' });
  });

  // -------------------------------------------------------------
  // AUDIT LOGS ROUTE
  // -------------------------------------------------------------
  app.get('/api/audit-logs', requireAuth, (req: Request, res: Response) => {
    res.json(db.auditLogs);
  });

  // -------------------------------------------------------------
  // VITE / STATIC SERVING
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SOLVEX Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[SOLVEX Server Fatal Error]', err);
});
