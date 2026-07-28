import React, { useState } from 'react';
import { FolderCheck, Upload, Trash2, Download, FileText, Image, FileCode, Archive, Plus, X } from 'lucide-react';
import { FileItem, Client, Project } from '../../types';

interface FileManagerProps {
  files: FileItem[];
  clients: Client[];
  projects: Project[];
  loading: boolean;
  onUploadFile: (fileData: Partial<FileItem>) => Promise<void>;
  onDeleteFile: (id: string) => Promise<void>;
}

export const FileManager: React.FC<FileManagerProps> = ({
  files,
  clients,
  projects,
  loading,
  onUploadFile,
  onDeleteFile,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [category, setCategory] = useState<FileItem['category']>('Contract');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const getFileIcon = (cat: FileItem['category']) => {
    switch (cat) {
      case 'Contract': return <FileText className="w-5 h-5 text-[#8EF012]" />;
      case 'Image': case 'Logo': return <Image className="w-5 h-5 text-purple-400" />;
      case 'ZIP': return <Archive className="w-5 h-5 text-amber-400" />;
      default: return <FileCode className="w-5 h-5 text-blue-400" />;
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) return;

    const client = clients.find(c => c.id === selectedClientId);
    const proj = projects.find(p => p.id === selectedProjectId);

    await onUploadFile({
      name: fileName.endsWith('.pdf') || fileName.endsWith('.zip') ? fileName : `${fileName}.pdf`,
      size: Math.floor(Math.random() * 3000000) + 500000,
      type: 'application/pdf',
      category,
      clientId: selectedClientId,
      clientName: client ? client.name : '',
      projectId: selectedProjectId,
      projectName: proj ? proj.name : '',
    });

    setIsModalOpen(false);
    setFileName('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB`;
    return `${(bytes / 1000).toFixed(0)} KB`;
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1C2333]">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FolderCheck className="w-5 h-5 text-[#8EF012]" />
            Asset & Document Manager
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Store, view, and organize contracts, SLA agreements, brand assets, and project code bundles
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#8EF012] hover:bg-[#a2f734] text-black font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(142,240,18,0.25)] transition-all flex items-center gap-1.5"
        >
          <Upload className="w-4 h-4 stroke-[3]" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Files Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-[#121724] border border-[#222B3D] rounded-2xl" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="p-12 text-center bg-[#121724] border border-[#222B3D] rounded-2xl text-xs text-gray-500">
          No document assets uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div key={file.id} className="bg-[#121724] border border-[#222B3D] hover:border-[#8EF012]/40 rounded-2xl p-4 transition-all flex flex-col justify-between group shadow-md">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-[#1C2538]">
                    {getFileIcon(file.category)}
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#1C2538] text-[10px] text-[#8EF012] font-mono">
                    {file.category}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white group-hover:text-[#8EF012] transition-colors truncate">
                  {file.name}
                </h4>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                  {file.clientName || file.projectName || 'Agency Asset'}
                </p>
              </div>

              <div className="pt-3 border-t border-[#1C2333] flex items-center justify-between text-[11px] text-gray-500 font-mono">
                <span>{formatFileSize(file.size)}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert(`Simulated Download of ${file.name}`)}
                    className="p-1 text-gray-400 hover:text-white"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteFile(file.id)}
                    className="p-1 text-gray-400 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
          <div className="bg-[#0F131C] border border-[#222F47] rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222F47]">
              <h3 className="text-sm font-bold text-white">Upload Asset Document</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Document Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vance_Capital_ISO27001_SLA.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full p-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white focus:outline-none focus:border-[#8EF012]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Asset Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white focus:outline-none focus:border-[#8EF012]"
                >
                  <option value="Contract">Contract / SLA</option>
                  <option value="Document">PDF Document</option>
                  <option value="Logo">Logo / Vector</option>
                  <option value="Image">Design Mockup</option>
                  <option value="ZIP">ZIP Source Code</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Associate Client</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full p-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white focus:outline-none focus:border-[#8EF012]"
                >
                  <option value="">-- None / General Agency File --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#1C2438] text-gray-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#8EF012] text-black font-bold rounded-xl">
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
