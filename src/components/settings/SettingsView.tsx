import React, { useState } from 'react';
import { Settings, Shield, Database, Lock, Save, Download, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AgencySettings } from '../../types';

interface SettingsViewProps {
  settings: AgencySettings;
  onSaveSettings: (updates: Partial<AgencySettings>) => Promise<void>;
  onChangePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  onBackupDatabase: () => void;
  onRestoreDatabase: (jsonContent: string) => Promise<boolean>;
  onClearAllData?: () => Promise<void>;
  onResetDemoData?: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onChangePassword,
  onBackupDatabase,
  onRestoreDatabase,
  onClearAllData,
  onResetDemoData,
}) => {
  const [agencyData, setAgencyData] = useState<AgencySettings>(settings);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [passStatus, setPassStatus] = useState<string | null>(null);

  const handleSaveAgencyInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings(agencyData);
    setSaveStatus('Agency settings updated successfully!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPassStatus('New passwords do not match');
      return;
    }
    const success = await onChangePassword(oldPassword, newPassword);
    if (success) {
      setPassStatus('Master Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPassStatus('Current Master Password incorrect');
    }
    setTimeout(() => setPassStatus(null), 4000);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        const ok = await onRestoreDatabase(content);
        if (ok) alert('Database restored successfully! Page will refresh.');
        else alert('Failed to restore database. Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 font-sans max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-[#1C2333]">
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#8EF012]" />
          System Settings & Security Controls
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Configure agency branding, Master Security password, and database backups
        </p>
      </div>

      {/* Agency Branding Card */}
      <div className="bg-[#121724] border border-[#222B3D] rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#8EF012]" />
          SOLVEX Organization Profile
        </h3>

        {saveStatus && (
          <div className="p-3 mb-4 rounded-xl bg-[#8EF012]/15 border border-[#8EF012]/40 text-[#8EF012] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveStatus}</span>
          </div>
        )}

        <form onSubmit={handleSaveAgencyInfo} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 font-medium mb-1">Agency Name</label>
              <input
                type="text"
                value={agencyData.agencyName}
                onChange={(e) => setAgencyData({ ...agencyData, agencyName: e.target.value })}
                className="w-full p-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white focus:outline-none focus:border-[#8EF012]"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">Tagline</label>
              <input
                type="text"
                value={agencyData.tagline}
                onChange={(e) => setAgencyData({ ...agencyData, tagline: e.target.value })}
                className="w-full p-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white focus:outline-none focus:border-[#8EF012]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 font-medium mb-1">Contact Email</label>
              <input
                type="email"
                value={agencyData.email}
                onChange={(e) => setAgencyData({ ...agencyData, email: e.target.value })}
                className="w-full p-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white focus:outline-none focus:border-[#8EF012]"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">Contact Phone</label>
              <input
                type="text"
                value={agencyData.phone}
                onChange={(e) => setAgencyData({ ...agencyData, phone: e.target.value })}
                className="w-full p-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white focus:outline-none focus:border-[#8EF012]"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">Tax / Registration ID</label>
              <input
                type="text"
                value={agencyData.taxId}
                onChange={(e) => setAgencyData({ ...agencyData, taxId: e.target.value })}
                className="w-full p-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white focus:outline-none focus:border-[#8EF012]"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Official Address</label>
            <input
              type="text"
              value={agencyData.address}
              onChange={(e) => setAgencyData({ ...agencyData, address: e.target.value })}
              className="w-full p-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white focus:outline-none focus:border-[#8EF012]"
            />
          </div>

          <button type="submit" className="px-5 py-2.5 bg-[#8EF012] text-black font-bold rounded-xl shadow-md">
            Save Agency Profile
          </button>
        </form>
      </div>

      {/* Security Master Password Card */}
      <div className="bg-[#121724] border border-[#222B3D] rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#8EF012]" />
          Master Access Password Settings
        </h3>

        {passStatus && (
          <div className="p-3 mb-4 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs">
            {passStatus}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs max-w-md">
          <div>
            <label className="block text-gray-300 font-medium mb-1">Current Master Password</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full p-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white focus:outline-none focus:border-[#8EF012]"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">New Master Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white focus:outline-none focus:border-[#8EF012]"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white focus:outline-none focus:border-[#8EF012]"
            />
          </div>

          <button type="submit" className="px-5 py-2.5 bg-[#1C2538] hover:bg-[#283550] border border-[#2D3C5C] text-white font-bold rounded-xl">
            Update Master Password
          </button>
        </form>
      </div>

      {/* Database Backup & Restore */}
      <div className="bg-[#121724] border border-[#222B3D] rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Database className="w-4 h-4 text-[#8EF012]" />
          Data Vault Backup & Disaster Recovery
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Export full system database (clients, projects, payments, tasks, audit logs) as JSON snapshot.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={onBackupDatabase}
            className="px-4 py-2.5 bg-[#1C2538] hover:bg-[#283550] border border-[#2D3C5C] text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#8EF012]" />
            <span>Download Database JSON Backup</span>
          </button>

          <label className="px-4 py-2.5 bg-[#1C2538] hover:bg-[#283550] border border-[#2D3C5C] text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Restore From JSON Snapshot</span>
            <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
          </label>
        </div>
      </div>

      {/* Danger Zone: Data Reset & Clear */}
      <div className="bg-[#121724] border border-red-900/40 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          Danger Zone — Data Management
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Wipe demo records to start fresh with a clean database or re-load sample demo records.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          {onClearAllData && (
            <button
              onClick={onClearAllData}
              className="px-4 py-2.5 bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-red-300 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Delete All Demo Data</span>
            </button>
          )}

          {onResetDemoData && (
            <button
              onClick={onResetDemoData}
              className="px-4 py-2.5 bg-[#1C2538] hover:bg-[#283550] border border-[#2D3C5C] text-gray-300 hover:text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Database className="w-4 h-4 text-amber-400" />
              <span>Re-load Sample Demo Data</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
