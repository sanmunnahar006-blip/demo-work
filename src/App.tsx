import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { 
  Client, 
  Project, 
  Payment, 
  Communication, 
  Task, 
  FileItem, 
  AgencySettings, 
  Notification, 
  AuditLog, 
  DashboardStats,
  ProjectStatus
} from './types';

// Layout & Core Views
import { LockScreen } from './components/auth/LockScreen';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { ClientsList } from './components/clients/ClientsList';
import { ClientModal } from './components/clients/ClientModal';
import { ClientDetailModal } from './components/clients/ClientDetailModal';
import { ProjectsList } from './components/projects/ProjectsList';
import { ProjectModal } from './components/projects/ProjectModal';
import { PaymentsList } from './components/payments/PaymentsList';
import { PaymentModal } from './components/payments/PaymentModal';
import { InvoiceGenerator } from './components/payments/InvoiceGenerator';
import { CommunicationTimeline } from './components/timeline/CommunicationTimeline';
import { TasksList } from './components/tasks/TasksList';
import { FileManager } from './components/files/FileManager';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { NotificationsDrawer } from './components/notifications/NotificationsDrawer';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { Toast, ToastType } from './components/common/Toast';

export default function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Active Tab View
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Main Domain Data
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [settings, setSettings] = useState<AgencySettings>({
    agencyName: 'SOLVEX',
    tagline: 'Enterprise Web Engineering',
    email: 'contact@solvex.io',
    phone: '+1 (800) 555-7658',
    address: '700 Tech Plaza, Suite 1200, Silicon Valley, CA',
    taxId: 'US-998822110',
    currency: 'USD',
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  // Modal States
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const [isClientDetailModalOpen, setIsClientDetailModalOpen] = useState(false);
  const [clientToView, setClientToView] = useState<Client | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Payment | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Toast Notification state
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  const handleQuickAction = (action: 'add-client' | 'add-project' | 'add-payment' | 'add-task') => {
    if (action === 'add-client') {
      setClientToEdit(null);
      setIsClientModalOpen(true);
    } else if (action === 'add-project') {
      setProjectToEdit(null);
      setIsProjectModalOpen(true);
    } else if (action === 'add-payment') {
      setIsPaymentModalOpen(true);
    } else if (action === 'add-task') {
      setActiveTab('tasks');
    }
  };

  // Check auth session on startup
  useEffect(() => {
    const token = api.getSessionToken();
    if (token) {
      setIsAuthenticated(true);
      fetchData();
    }
    setAuthChecking(false);
  }, []);

  // Keyboard shortcut Cmd+K or Ctrl+K for Global Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Primary data fetcher
  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        statsData,
        clientsData,
        projectsData,
        paymentsData,
        commsData,
        tasksData,
        filesData,
        settingsData,
        notifsData,
        logsData,
      ] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getClients().catch(() => []),
        api.getProjects().catch(() => []),
        api.getPayments().catch(() => []),
        api.getCommunications().catch(() => []),
        api.getTasks().catch(() => []),
        api.getFiles().catch(() => []),
        api.getSettings().catch(() => null),
        api.getNotifications().catch(() => []),
        api.getAuditLogs().catch(() => []),
      ]);

      if (statsData) setDashboardStats(statsData);
      setClients(clientsData);
      setProjects(projectsData);
      setPayments(paymentsData);
      setCommunications(commsData);
      setTasks(tasksData);
      setFiles(filesData);
      if (settingsData) setSettings(settingsData);
      setNotifications(notifsData);
      setAuditLogs(logsData);
    } catch (err) {
      console.error('Failed loading SOLVEX dataset', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    fetchData();
    showToast('Welcome to SOLVEX Client Management System', 'success');
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    showToast('Session locked', 'info');
  };

  // --- CLIENT HANDLERS ---
  const handleSaveClient = async (clientData: Partial<Client>) => {
    if (clientToEdit) {
      await api.updateClient(clientToEdit.id, clientData);
      showToast('Client profile updated successfully');
    } else {
      await api.createClient(clientData);
      showToast('New client profile created');
    }
    fetchData();
  };

  const handleDeleteClient = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client profile?')) {
      await api.deleteClient(id);
      showToast('Client deleted', 'info');
      fetchData();
    }
  };

  // --- PROJECT HANDLERS ---
  const handleSaveProject = async (projectData: Partial<Project>) => {
    if (projectToEdit) {
      await api.updateProject(projectToEdit.id, projectData);
      showToast('Project updated successfully');
    } else {
      await api.createProject(projectData);
      showToast('New client project created');
    }
    fetchData();
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await api.deleteProject(id);
      showToast('Project deleted', 'info');
      fetchData();
    }
  };

  const handleUpdateProjectStatus = async (projectId: string, newStatus: ProjectStatus) => {
    await api.updateProject(projectId, { status: newStatus });
    showToast(`Project status moved to ${newStatus}`);
    fetchData();
  };

  // --- PAYMENT HANDLERS ---
  const handleRecordPayment = async (paymentData: Partial<Payment>) => {
    await api.recordPayment(paymentData);
    showToast('Payment transaction recorded successfully');
    fetchData();
  };

  const handleDeletePayment = async (id: string) => {
    if (window.confirm('Delete payment transaction record?')) {
      await api.deletePayment(id);
      showToast('Payment record removed', 'info');
      fetchData();
    }
  };

  // --- TASK HANDLERS ---
  const handleAddTask = async (taskData: Partial<Task>) => {
    await api.createTask(taskData);
    showToast('Task added to sprint queue');
    fetchData();
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    await api.updateTask(id, updates);
    fetchData();
  };

  const handleDeleteTask = async (id: string) => {
    await api.deleteTask(id);
    showToast('Task removed', 'info');
    fetchData();
  };

  // --- FILE HANDLERS ---
  const handleUploadFile = async (fileData: Partial<FileItem>) => {
    await api.uploadFile(fileData);
    showToast('Document uploaded to asset manager');
    fetchData();
  };

  const handleDeleteFile = async (id: string) => {
    await api.deleteFile(id);
    showToast('File deleted', 'info');
    fetchData();
  };

  // --- TIMELINE HANDLERS ---
  const handleAddCommunication = async (commData: Partial<Communication>) => {
    await api.createCommunication(commData);
    showToast('Communication entry logged');
    fetchData();
  };

  const handleDeleteCommunication = async (id: string) => {
    await api.deleteCommunication(id);
    showToast('Communication entry deleted', 'info');
    fetchData();
  };

  // --- SETTINGS HANDLERS ---
  const handleSaveSettings = async (updates: Partial<AgencySettings>) => {
    await api.updateSettings(updates);
    showToast('Agency profile saved');
    fetchData();
  };

  const handleChangePassword = async (oldPass: string, newPass: string) => {
    try {
      await api.changePassword(oldPass, newPass);
      showToast('Master Password changed successfully', 'success');
      return true;
    } catch {
      showToast('Current Master Password incorrect', 'error');
      return false;
    }
  };

  const handleBackupDatabase = async () => {
    const backup = await api.getDatabaseBackup();
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `solvex_database_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('Database JSON backup downloaded');
  };

  const handleRestoreDatabase = async (jsonContent: string) => {
    try {
      const parsed = JSON.parse(jsonContent);
      await api.restoreDatabaseBackup(parsed);
      showToast('Database restored! Refreshing data...');
      fetchData();
      return true;
    } catch {
      showToast('Invalid backup JSON file', 'error');
      return false;
    }
  };

  const handleClearAllData = async () => {
    if (!confirm('Are you sure you want to delete ALL demo data? This will clear all clients, projects, payments, tasks, and files.')) {
      return;
    }
    try {
      await api.clearAllData();
      showToast('All demo data deleted successfully', 'success');
      fetchData();
    } catch {
      showToast('Failed to clear demo data', 'error');
    }
  };

  const handleResetDemoData = async () => {
    if (!confirm('Are you sure you want to re-populate the database with initial sample demo records?')) {
      return;
    }
    try {
      await api.resetDemoData();
      showToast('Demo data re-populated successfully', 'success');
      fetchData();
    } catch {
      showToast('Failed to reset demo data', 'error');
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#0A0D14] flex items-center justify-center text-white font-sans">
        <div className="w-8 h-8 border-2 border-[#8EF012] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LockScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white font-sans flex flex-col md:flex-row antialiased selection:bg-[#8EF012] selection:text-black">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab as any}
        setActiveTab={(tab) => setActiveTab(tab)}
        onLock={handleLogout}
        onLockSession={handleLogout}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
        activeProjectsCount={projects.filter((p) => p.status === 'In Progress').length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab as any}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenSearch={() => setIsGlobalSearchOpen(true)}
          unreadNotificationsCount={unreadNotifsCount}
          unreadCount={unreadNotifsCount}
          onLock={handleLogout}
          onLockSession={handleLogout}
          onOpenMobileSidebar={() => setIsOpenMobile(true)}
          onQuickAction={handleQuickAction}
          agencyName={settings.agencyName}
          timeZone={settings.timeZone}
        />

        {/* View Component Switcher */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              stats={dashboardStats}
              loading={loading}
              onNavigate={(tab) => setActiveTab(tab)}
              onAddClient={() => { setClientToEdit(null); setIsClientModalOpen(true); }}
              onAddProject={() => { setProjectToEdit(null); setIsProjectModalOpen(true); }}
            />
          )}

          {activeTab === 'clients' && (
            <ClientsList
              clients={clients}
              loading={loading}
              onAddClient={() => { setClientToEdit(null); setIsClientModalOpen(true); }}
              onEditClient={(client) => { setClientToEdit(client); setIsClientModalOpen(true); }}
              onDeleteClient={handleDeleteClient}
              onViewClient={(client) => { setClientToView(client); setIsClientDetailModalOpen(true); }}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsList
              projects={projects}
              clients={clients}
              loading={loading}
              onAddProject={() => { setProjectToEdit(null); setIsProjectModalOpen(true); }}
              onEditProject={(proj) => { setProjectToEdit(proj); setIsProjectModalOpen(true); }}
              onDeleteProject={handleDeleteProject}
              onUpdateStatus={handleUpdateProjectStatus}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsList
              payments={payments}
              projects={projects}
              loading={loading}
              onRecordPayment={() => setIsPaymentModalOpen(true)}
              onViewInvoice={(payment) => { setSelectedInvoice(payment); setIsInvoiceOpen(true); }}
              onDeletePayment={handleDeletePayment}
            />
          )}

          {activeTab === 'timeline' && (
            <CommunicationTimeline
              communications={communications}
              clients={clients}
              loading={loading}
              onAddCommunication={handleAddCommunication}
              onDeleteCommunication={handleDeleteCommunication}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksList
              tasks={tasks}
              clients={clients}
              projects={projects}
              loading={loading}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === 'files' && (
            <FileManager
              files={files}
              clients={clients}
              projects={projects}
              loading={loading}
              onUploadFile={handleUploadFile}
              onDeleteFile={handleDeleteFile}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              clients={clients}
              projects={projects}
              payments={payments}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onChangePassword={handleChangePassword}
              onBackupDatabase={handleBackupDatabase}
              onRestoreDatabase={handleRestoreDatabase}
              onClearAllData={handleClearAllData}
              onResetDemoData={handleResetDemoData}
            />
          )}

          {activeTab === 'audit' && (
            <AuditLogsView
              logs={auditLogs}
              loading={loading}
            />
          )}
        </main>
      </div>

      {/* Modals & Drawers */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSaveClient}
        clientToEdit={clientToEdit}
        existingClients={clients}
      />

      <ClientDetailModal
        client={clientToView}
        isOpen={isClientDetailModalOpen}
        onClose={() => setIsClientDetailModalOpen(false)}
        projects={projects.filter((p) => p.clientId === clientToView?.id)}
        communications={communications.filter((c) => c.clientId === clientToView?.id)}
        payments={payments.filter((p) => p.clientId === clientToView?.id)}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
        projectToEdit={projectToEdit}
        clients={clients}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSave={handleRecordPayment}
        projects={projects}
      />

      <InvoiceGenerator
        payment={selectedInvoice}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        agencySettings={settings}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={async (id) => {
          await api.markNotificationRead(id);
          fetchData();
        }}
        onClearAll={async () => {
          await api.clearAllNotifications();
          fetchData();
        }}
      />

      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        clients={clients}
        projects={projects}
        payments={payments}
        onSelectClient={(c) => { setClientToView(c); setIsClientDetailModalOpen(true); }}
        onSelectProject={(p) => { setProjectToEdit(p); setIsProjectModalOpen(true); }}
      />
    </div>
  );
}
