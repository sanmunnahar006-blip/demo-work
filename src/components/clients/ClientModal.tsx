import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ShieldAlert, Check, User, Building, Mail, Phone, Globe, MapPin, Tag } from 'lucide-react';
import { Client, DuplicateWarning, PreferredContact, ClientSource, ClientStatus } from '../../types';
import { api } from '../../services/api';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Partial<Client>) => Promise<void>;
  clientToEdit?: Client | null;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clientToEdit,
}) => {
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    company: '',
    designation: '',
    country: 'United States',
    city: '',
    address: '',
    email: '',
    phone: '',
    whatsapp: '',
    telegram: '',
    facebook: '',
    instagram: '',
    linkedin: '',
    website: '',
    notes: '',
    preferredContactMethod: 'Email',
    timeZone: 'America/New_York',
    source: 'Organic',
    status: 'Active',
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [duplicates, setDuplicates] = useState<DuplicateWarning[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (clientToEdit) {
      setFormData(clientToEdit);
    } else {
      setFormData({
        name: '',
        company: '',
        designation: '',
        country: 'United States',
        city: '',
        address: '',
        email: '',
        phone: '',
        whatsapp: '',
        telegram: '',
        facebook: '',
        instagram: '',
        linkedin: '',
        website: '',
        notes: '',
        preferredContactMethod: 'Email',
        timeZone: 'America/New_York',
        source: 'Organic',
        status: 'Active',
        tags: ['Enterprise'],
      });
    }
    setDuplicates([]);
    setFormError(null);
  }, [clientToEdit, isOpen]);

  // Real-time Duplicate Check Effect
  useEffect(() => {
    if (!isOpen) return;

    const handler = setTimeout(async () => {
      if (formData.email || formData.phone || formData.whatsapp || formData.website) {
        setCheckingDuplicates(true);
        try {
          const res = await api.checkDuplicateClient({
            email: formData.email,
            phone: formData.phone,
            whatsapp: formData.whatsapp,
            website: formData.website,
            excludeId: clientToEdit?.id,
          });
          setDuplicates(res.warnings || []);
        } catch {
          // Ignore
        } finally {
          setCheckingDuplicates(false);
        }
      } else {
        setDuplicates([]);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [formData.email, formData.phone, formData.whatsapp, formData.website, isOpen, clientToEdit]);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTags = Array.from(new Set([...(formData.tags || []), tagInput.trim()]));
      setFormData({ ...formData, tags: newTags });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRem: string) => {
    setFormData({ ...formData, tags: (formData.tags || []).filter(t => t !== tagToRem) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setFormError('Client Name and Email are strictly required.');
      return;
    }

    if (duplicates.length > 0) {
      setFormError('Duplicate records detected! Please resolve duplicates before saving.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save client');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-[#0F131C] border border-[#222F47] rounded-3xl w-full max-w-4xl shadow-2xl my-8 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#222F47] flex items-center justify-between shrink-0 bg-[#121724]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A2234] border border-[#8EF012]/40 text-[#8EF012] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {clientToEdit ? 'Edit Client Profile' : 'Register New Enterprise Client'}
              </h3>
              <p className="text-xs text-gray-400">Complete client details with automated duplicate detection</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-[#1C2538] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Duplicate Warnings Banner */}
          {duplicates.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>DUPLICATE RECORD WARNING DETECTED</span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                {duplicates.map((dup, i) => (
                  <li key={i}>
                    Matching <strong className="uppercase">{dup.field}</strong> ({dup.value}) exists for client:{' '}
                    <strong className="text-white">{dup.existingClient.name}</strong> ({dup.existingClient.company})
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-amber-300 font-medium">
                To maintain data integrity, duplicate clients cannot be saved.
              </p>
            </div>
          )}

          {formError && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Basic Identity */}
          <div>
            <h4 className="text-xs font-bold text-[#8EF012] uppercase tracking-wider mb-3">
              Client Identity & Designation
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alexander Vance"
                  className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Company Name</label>
                <input
                  type="text"
                  value={formData.company || ''}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Vance Capital Corp"
                  className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Designation</label>
                <input
                  type="text"
                  value={formData.designation || ''}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Managing Director"
                  className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Channels */}
          <div>
            <h4 className="text-xs font-bold text-[#8EF012] uppercase tracking-wider mb-3">
              Contact Channels (Checked for Duplicates)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alexander@vancecapital.com"
                  className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (212) 555-0192"
                  className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  value={formData.whatsapp || ''}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="+12125550192"
                  className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Telegram Handle</label>
                <input
                  type="text"
                  value={formData.telegram || ''}
                  onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                  placeholder="@alex_vance"
                  className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">LinkedIn Profile</label>
                <input
                  type="url"
                  value={formData.linkedin || ''}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Company Website</label>
                <input
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://vancecapital.com"
                  className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Location & Preferences */}
          <div>
            <h4 className="text-xs font-bold text-[#8EF012] uppercase tracking-wider mb-3">
              Location & Preferences
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Country</label>
                <input
                  type="text"
                  value={formData.country || ''}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="United States"
                  className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="New York"
                  className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Preferred Contact</label>
                <select
                  value={formData.preferredContactMethod || 'Email'}
                  onChange={(e) => setFormData({ ...formData, preferredContactMethod: e.target.value as PreferredContact })}
                  className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
                >
                  <option value="Email">Email</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Phone">Phone</option>
                  <option value="Telegram">Telegram</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Client Source</label>
                <select
                  value={formData.source || 'Organic'}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value as ClientSource })}
                  className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
                >
                  <option value="Organic">Organic</option>
                  <option value="Referral">Referral</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Website">Website</option>
                  <option value="Upwork">Upwork</option>
                  <option value="Cold Outreach">Cold Outreach</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Status & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Client Status</label>
              <select
                value={formData.status || 'Active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ClientStatus })}
                className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
              >
                <option value="Active">Active Client</option>
                <option value="Inactive">Inactive</option>
                <option value="Lead">Lead / Prospect</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Tags (Press Enter to add)</label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="e.g. Fintech, Enterprise, Retainer"
                className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(formData.tags || []).map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded bg-[#1C2538] border border-[#2D3C5C] text-[11px] text-[#8EF012] flex items-center gap-1">
                    {t}
                    <button type="button" onClick={() => handleRemoveTag(t)} className="hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Internal Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Internal Notes & Context</label>
            <textarea
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Important notes, business priorities, SLA requirements..."
              className="w-full px-3.5 py-2.5 bg-[#161B27] border border-[#2A344A] rounded-xl text-white text-xs focus:outline-none focus:border-[#8EF012]"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-[#222F47] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-[#1C2438] hover:bg-[#25314C] text-gray-300 font-bold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || duplicates.length > 0}
              className="px-6 py-2.5 bg-[#8EF012] hover:bg-[#a2f734] text-black font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(142,240,18,0.25)] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? 'Saving...' : 'Save Client Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
