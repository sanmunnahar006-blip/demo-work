import React, { useState } from 'react';
import { CheckSquare, Plus, Clock, AlertCircle, Trash2, CheckCircle2, Calendar, X } from 'lucide-react';
import { Task, TaskPriority, TaskStatus, Client, Project } from '../../types';

interface TasksListProps {
  tasks: Task[];
  clients: Client[];
  projects: Project[];
  loading: boolean;
  onAddTask: (taskData: Partial<Task>) => Promise<void>;
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

export const TasksList: React.FC<TasksListProps> = ({
  tasks,
  clients,
  projects,
  loading,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newTask, setNewTask] = useState<Partial<Task>>({
    name: '',
    projectId: projects.length > 0 ? projects[0].id : '',
    priority: 'High',
    status: 'To Do',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
  });

  const filteredTasks = tasks.filter((t) => statusFilter === 'ALL' || t.status === statusFilter);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.name) return;
    const proj = projects.find(p => p.id === newTask.projectId);
    await onAddTask({
      ...newTask,
      projectName: proj ? proj.name : '',
      clientName: proj ? proj.clientName : '',
    });
    setIsModalOpen(false);
    setNewTask({
      name: '',
      projectId: projects.length > 0 ? projects[0].id : '',
      priority: 'High',
      status: 'To Do',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
    });
  };

  const toggleTaskCompleted = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
    await onUpdateTask(task.id, { status: nextStatus });
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1C2333]">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#8EF012]" />
            Task & Engineering Operations
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Organize agency development sprints, priority items, and project deliverables
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#8EF012] hover:bg-[#a2f734] text-black font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(142,240,18,0.25)] transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-[#121724] border border-[#222B3D] rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400 font-medium">Filter by Status:</span>
          {['ALL', 'To Do', 'In Progress', 'Review', 'Completed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                statusFilter === s ? 'bg-[#8EF012] text-black' : 'bg-[#1C2538] text-gray-300 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Table */}
      {loading ? (
        <div className="h-64 bg-[#121724] border border-[#222B3D] rounded-2xl animate-pulse" />
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 text-center bg-[#121724] border border-[#222B3D] rounded-2xl text-xs text-gray-500">
          No tasks found.
        </div>
      ) : (
        <div className="bg-[#121724] border border-[#222B3D] rounded-2xl overflow-hidden">
          <div className="divide-y divide-[#1C2333]">
            {filteredTasks.map((t) => (
              <div key={t.id} className="p-4 hover:bg-[#161D2E] transition-colors flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => toggleTaskCompleted(t)}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      t.status === 'Completed'
                        ? 'bg-[#8EF012] border-[#8EF012] text-black'
                        : 'border-[#334155] hover:border-[#8EF012]'
                    }`}
                  >
                    {t.status === 'Completed' && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="min-w-0">
                    <h4 className={`text-xs font-bold text-white ${t.status === 'Completed' ? 'line-through text-gray-500' : ''}`}>
                      {t.name}
                    </h4>
                    {t.projectName && (
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        Project: <strong className="text-[#8EF012]">{t.projectName}</strong>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-xs">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    t.priority === 'Urgent' ? 'bg-red-950/80 text-red-400 border border-red-800/40' :
                    t.priority === 'High' ? 'bg-amber-950/80 text-amber-400 border border-amber-800/40' :
                    'bg-[#1C2538] text-gray-300'
                  }`}>
                    {t.priority}
                  </span>

                  <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    {t.deadline}
                  </span>

                  <button onClick={() => onDeleteTask(t.id)} className="p-1 text-gray-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
          <div className="bg-[#0F131C] border border-[#222F47] rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#222F47]">
              <h3 className="text-sm font-bold text-white">Create New Task</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  placeholder="e.g. Conduct load testing for API endpoint"
                  className="w-full p-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white focus:outline-none focus:border-[#8EF012]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Associated Project</label>
                <select
                  value={newTask.projectId}
                  onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                  className="w-full p-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white focus:outline-none focus:border-[#8EF012]"
                >
                  <option value="">-- None / General Task --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                    className="w-full p-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white focus:outline-none focus:border-[#8EF012]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                    className="w-full p-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white focus:outline-none focus:border-[#8EF012]"
                  />
                </div>
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
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
