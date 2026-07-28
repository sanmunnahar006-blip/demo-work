import React from 'react';
import { ShieldCheck, Clock, Search, User } from 'lucide-react';
import { AuditLog } from '../../types';

interface AuditLogsViewProps {
  logs: AuditLog[];
  loading: boolean;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs, loading }) => {
  return (
    <div className="p-4 sm:p-8 space-y-6 font-sans max-w-7xl mx-auto">
      <div className="pb-2 border-b border-[#1C2333]">
        <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#8EF012]" />
          System Audit Trail & Security Logs
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Immutable system log of client modifications, financial records, and master access authorizations
        </p>
      </div>

      <div className="bg-[#121724] border border-[#222B3D] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="h-64 animate-pulse" />
        ) : (
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#161C2B] text-gray-400 uppercase font-bold text-[10px] border-b border-[#222B3D]">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Module Entity</th>
                <th className="p-4">Entity ID</th>
                <th className="p-4">IP / User Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2333]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#161D2E] transition-colors font-mono text-[11px]">
                  <td className="p-4 text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-4 font-bold text-[#8EF012]">{log.action}</td>
                  <td className="p-4 text-white font-sans">{log.entity}</td>
                  <td className="p-4 text-gray-500">{log.entityId}</td>
                  <td className="p-4 text-gray-500">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
