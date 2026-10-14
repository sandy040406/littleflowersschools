'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, Trash2, Edit2, XCircle, MessageSquare, Loader2, Download } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import {
  type Enquiry,
  type EnquiryStatus,
  listEnquiries,
  updateEnquiry,
  deleteEnquiry,
  statusMeta
} from '@/lib/enquiries';

/** Quote a CSV cell and neutralise spreadsheet formulas (=, +, -, @) from public input. */
function csvCell(value: string | number | null | undefined): string {
  let s = value == null ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

function exportEnquiriesCsv(rows: Enquiry[], filterLabel: string) {
  const headers = [
    'ID', 'Submitted', 'Parent Name', 'Email', 'Phone', 'Preferred Contact',
    'Student Name', 'Grade', 'Message', 'Status', 'Admin Notes',
  ];
  const lines = rows.map((e) => [
    e.id,
    new Date(e.created_at).toLocaleString(),
    e.parent_name,
    e.email,
    e.phone,
    e.preferred_contact,
    e.student_name,
    e.grade_interested,
    e.message,
    e.status,
    e.admin_notes,
  ].map(csvCell).join(','));

  const csv = '\uFEFF' + [headers.map(csvCell).join(','), ...lines].join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `enquiries-${filterLabel}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<EnquiryStatus | 'all'>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const data = await listEnquiries(filter === 'all' ? undefined : filter);
      setEnquiries(data);
    } catch (err) {
      console.error('Failed to load enquiries', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [filter]);

  const handleStatusChange = async (id: number, newStatus: EnquiryStatus) => {
    try {
      const updated = await updateEnquiry(id, { status: newStatus });
      setEnquiries(enquiries.map(e => e.id === id ? updated : e));
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this enquiry? This action cannot be undone.')) {
      try {
        await deleteEnquiry(id);
        setEnquiries(enquiries.filter(e => e.id !== id));
      } catch (err) {
        alert('Failed to delete enquiry.');
      }
    }
  };

  const openNotesModal = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setAdminNotes(enquiry.admin_notes || '');
    setIsModalOpen(true);
  };

  const saveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry) return;
    
    setIsSaving(true);
    try {
      const updated = await updateEnquiry(selectedEnquiry.id, { admin_notes: adminNotes });
      setEnquiries(enquiries.map(enq => enq.id === selectedEnquiry.id ? updated : enq));
      setIsModalOpen(false);
      setSelectedEnquiry(null);
    } catch (err) {
      alert('Failed to save notes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy mb-1">Admission Enquiries</h1>
          <p className="text-text-secondary">Manage and respond to admission requests.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="enquiry-status-filter" className="text-sm font-medium text-navy">Filter Status:</label>
          <select 
            id="enquiry-status-filter"
            value={filter} 
            onChange={(e) => setFilter(e.target.value as EnquiryStatus | 'all')}
            className="border-border rounded-lg px-3 py-2 text-sm focus:ring-school-blue focus:border-school-blue"
          >
            <option value="all">All Enquiries</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </select>
          <Button
            id="export-enquiries-csv"
            variant="outline"
            size="sm"
            disabled={isLoading || enquiries.length === 0}
            onClick={() => exportEnquiriesCsv(enquiries, filter)}
          >
            <Download size={16} /> Export CSV
          </Button>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-soft-blue/50 border-b border-border text-sm text-text-secondary">
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Parent & Contact</th>
                <th className="px-6 py-4 font-medium">Student Info</th>
                <th className="px-6 py-4 font-medium">Message / Notes</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 size={32} className="animate-spin text-school-blue mx-auto" />
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                    No enquiries found.
                  </td>
                </tr>
              ) : (
                enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-soft-blue/30 transition-colors group">
                    <td className="px-6 py-4 align-top">
                      <span className="text-sm text-navy whitespace-nowrap">
                        {new Date(enq.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="font-medium text-navy mb-1">{enq.parent_name}</div>
                      <div className="flex flex-col gap-1 text-xs text-text-secondary">
                        <a href={`mailto:${enq.email}`} className="flex items-center gap-1.5 hover:text-school-blue">
                          <Mail size={12} /> {enq.email}
                        </a>
                        <a href={`tel:${enq.phone}`} className="flex items-center gap-1.5 hover:text-school-blue">
                          <Phone size={12} /> {enq.phone}
                        </a>
                        {enq.preferred_contact && (
                          <span className="inline-block mt-1 text-[10px] uppercase bg-gray-100 px-2 py-0.5 rounded w-fit">
                            Prefers {enq.preferred_contact}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      {enq.student_name ? (
                        <>
                          <div className="text-sm text-navy font-medium">{enq.student_name}</div>
                          <div className="text-xs text-text-secondary">{enq.grade_interested || 'Grade not specified'}</div>
                        </>
                      ) : (
                        <span className="text-sm text-text-muted italic">Not provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top max-w-xs">
                      {enq.message && (
                        <div className="text-sm text-text-secondary mb-2 line-clamp-2" title={enq.message}>
                          <span className="text-navy font-medium text-xs block mb-0.5">Message:</span>
                          {enq.message}
                        </div>
                      )}
                      {enq.admin_notes ? (
                        <div className="text-sm text-school-blue line-clamp-2 bg-school-blue/5 p-2 rounded" title={enq.admin_notes}>
                          <span className="font-medium text-xs block mb-0.5">Admin Note:</span>
                          {enq.admin_notes}
                        </div>
                      ) : (
                        <button 
                          onClick={() => openNotesModal(enq)}
                          className="text-xs text-text-muted hover:text-school-blue flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 size={12} /> Add Note
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <select
                        value={enq.status}
                        onChange={(e) => handleStatusChange(enq.id, e.target.value as EnquiryStatus)}
                        className={`text-xs font-bold rounded-full px-2.5 py-1 text-center cursor-pointer border focus:outline-none focus:ring-2 focus:ring-school-blue/50 ${statusMeta(enq.status).className}`}
                      >
                        <option value="new">NEW</option>
                        <option value="contacted">CONTACTED</option>
                        <option value="closed">CLOSED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 align-top text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openNotesModal(enq)}
                          className="p-2 text-text-muted hover:text-school-blue rounded-lg hover:bg-school-blue/10 transition-colors"
                          title="Edit Notes"
                        >
                          <MessageSquare size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(enq.id)}
                          className="p-2 text-text-muted hover:text-error rounded-lg hover:bg-error/10 transition-colors"
                          title="Delete Enquiry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Notes Modal */}
      {isModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-navy/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="p-5 border-b border-border flex justify-between items-center">
              <h2 className="text-lg font-bold text-navy">Admin Notes</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-navy">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={saveNotes} className="p-5 space-y-4">
              <div className="bg-soft-blue/50 p-3 rounded-lg text-sm mb-4">
                <div className="font-medium text-navy">{selectedEnquiry.parent_name}</div>
                <div className="text-text-secondary">{selectedEnquiry.email}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Internal Notes (Not visible to parent)</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full border-border rounded-lg h-32 focus:ring-school-blue focus:border-school-blue resize-none p-3 text-sm"
                  placeholder="E.g., Spoke to father on Tuesday, scheduled a campus tour for Friday..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Save Notes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
