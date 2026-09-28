import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Wrench, Eye, CheckCircle2, X } from 'lucide-react';
import { getAllMaintenanceApi, updateMaintenanceApi } from '../api/maintenance';
import { AssetTypeBadge, ConditionBadge, StatusBadge, PriorityBadge } from '../components/common/Badge';
import { LoadingSpinner, EmptyState } from '../components/common/UIHelpers';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const MaintenancePage = () => {
  const navigate = useNavigate();
  const { isAdmin, isOfficer } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({ status: 'ALL', priority: 'ALL', assetType: 'ALL' });
  const [q, setQ] = useState('');
  const [showResolveForm, setShowResolveForm] = useState(null);
  const [resolveForm, setResolveForm] = useState({ finalCondition: 'GOOD', resolutionNotes: '', repairCost: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await getAllMaintenanceApi({ ...filters, q });
      setTickets(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [filters, q]);

  const handleAction = async (ticket, newStatus) => {
    try {
      await updateMaintenanceApi(ticket._id, { status: newStatus, assignedTo: ticket.assignedTo });
      showToast(`Ticket ${ticket.ticketId} updated to ${newStatus}`);
      fetchTickets();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update', 'error');
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateMaintenanceApi(showResolveForm._id, { status: 'RESOLVED', ...resolveForm, repairCost: Number(resolveForm.repairCost) || 0 });
      showToast('Maintenance completed successfully');
      setShowResolveForm(null);
      fetchTickets();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to resolve', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const statusCounts = {
    OPEN: tickets.filter(t => t.status === 'OPEN').length,
    ASSIGNED: tickets.filter(t => t.status === 'ASSIGNED').length,
    IN_PROGRESS: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    RESOLVED: tickets.filter(t => t.status === 'RESOLVED').length,
    HIGH_PRIORITY: tickets.filter(t => t.priority === 'HIGH' || t.priority === 'URGENT').length,
  };

  const inputCls = "w-full px-3 py-2 rounded-lg border border-charcoal-200 bg-charcoal-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1976A5]/40 focus:border-[#1976A5] transition-all";
  const labelCls = "block text-[11px] font-bold text-navy-800 mb-1 uppercase tracking-wide";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Maintenance Management</h1>
        <p className="text-sm text-charcoal-500">Track repair work orders, assignments, and resolution across all infrastructure assets.</p>
      </div>

      {/* Status KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Open', count: statusCounts.OPEN, color: 'text-red-700 bg-red-50 border-red-200' },
          { label: 'Assigned', count: statusCounts.ASSIGNED, color: 'text-orange-700 bg-orange-50 border-orange-200' },
          { label: 'In Progress', count: statusCounts.IN_PROGRESS, color: 'text-[#1976A5] bg-blue-50 border-blue-200' },
          { label: 'Resolved', count: statusCounts.RESOLVED, color: 'text-govSuccess bg-green-50 border-green-200' },
          { label: 'High Priority', count: statusCounts.HIGH_PRIORITY, color: 'text-[#D89B24] bg-amber-50 border-amber-200' },
        ].map((c) => (
          <div key={c.label} className={`rounded-lg border p-3 ${c.color}`}>
            <p className="text-xl font-black">{c.count}</p>
            <p className="text-xs font-medium">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle p-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search tickets..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-charcoal-200 bg-charcoal-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1976A5]/40" />
        </div>
        <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))} className="px-3 py-2 rounded-lg border border-charcoal-200 bg-charcoal-50 text-sm font-medium">
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open</option><option value="ASSIGNED">Assigned</option><option value="IN_PROGRESS">In Progress</option><option value="RESOLVED">Resolved</option>
        </select>
        <select value={filters.priority} onChange={e => setFilters(p => ({ ...p, priority: e.target.value }))} className="px-3 py-2 rounded-lg border border-charcoal-200 bg-charcoal-50 text-sm font-medium">
          <option value="ALL">All Priorities</option>
          <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option>
        </select>
        <select value={filters.assetType} onChange={e => setFilters(p => ({ ...p, assetType: e.target.value }))} className="px-3 py-2 rounded-lg border border-charcoal-200 bg-charcoal-50 text-sm font-medium">
          <option value="ALL">All Types</option>
          <option value="ROAD">Road</option><option value="HIGHWAY">Highway</option><option value="BRIDGE">Bridge</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle overflow-hidden">
        {loading ? <LoadingSpinner label="Loading tickets..." /> : tickets.length === 0 ? (
          <EmptyState icon={Wrench} title="No Maintenance Tickets" message="No maintenance work orders match your current filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-charcoal-50 border-b border-charcoal-200">
                  {['Ticket','Asset','Type','Issue','Priority','Assigned To','Status','Reported','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[11px] font-bold text-charcoal-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-200">
                {tickets.map(tkt => (
                  <tr key={tkt._id} className="hover:bg-charcoal-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-bold text-navy-900">{tkt.ticketId}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => tkt.asset && navigate(`/assets/${tkt.asset._id}`)} className="text-xs font-semibold text-[#1976A5] hover:underline">
                        {tkt.asset?.assetId || '—'}
                      </button>
                      <p className="text-[10px] text-charcoal-500 truncate max-w-[120px]">{tkt.asset?.name}</p>
                    </td>
                    <td className="px-4 py-3">{tkt.asset?.assetType ? <AssetTypeBadge type={tkt.asset.assetType} /> : '—'}</td>
                    <td className="px-4 py-3 text-xs text-charcoal-500 max-w-[160px] truncate">{tkt.issueType}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={tkt.priority} /></td>
                    <td className="px-4 py-3 text-xs text-charcoal-500 max-w-[120px] truncate">{tkt.assignedTo || 'Unassigned'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        tkt.status === 'RESOLVED' ? 'bg-green-50 text-govSuccess border border-green-200' :
                        tkt.status === 'IN_PROGRESS' ? 'bg-blue-50 text-[#1976A5] border border-blue-200' :
                        tkt.status === 'ASSIGNED' ? 'bg-amber-50 text-[#B45309] border border-amber-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}>{tkt.status?.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-charcoal-500">{formatDate(tkt.reportedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {tkt.asset && (
                          <button onClick={() => navigate(`/assets/${tkt.asset._id}`)} className="p-1 text-charcoal-500 hover:text-[#1976A5] rounded" title="View Asset"><Eye className="w-3.5 h-3.5" /></button>
                        )}
                        {(isAdmin || isOfficer) && tkt.status === 'OPEN' && (
                          <button onClick={() => handleAction(tkt, 'ASSIGNED')} className="px-2 py-1 text-[10px] font-bold text-white bg-[#D89B24] rounded">Assign</button>
                        )}
                        {(isAdmin || isOfficer) && tkt.status === 'ASSIGNED' && (
                          <button onClick={() => handleAction(tkt, 'IN_PROGRESS')} className="px-2 py-1 text-[10px] font-bold text-white bg-[#1976A5] rounded">Start</button>
                        )}
                        {(isAdmin || isOfficer) && tkt.status === 'IN_PROGRESS' && (
                          <button onClick={() => { setShowResolveForm(tkt); setResolveForm({ finalCondition: 'GOOD', resolutionNotes: '', repairCost: '' }); }} className="px-2 py-1 text-[10px] font-bold text-white bg-govSuccess rounded">Resolve</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {showResolveForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-elevation max-w-lg w-full mx-4 border border-charcoal-200">
            <div className="flex items-center justify-between p-5 border-b border-charcoal-200">
              <h2 className="text-base font-bold text-navy-900">Resolve — {showResolveForm.ticketId}</h2>
              <button onClick={() => setShowResolveForm(null)} className="p-1 text-charcoal-500 hover:text-navy-900"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleResolve} className="p-5 space-y-3">
              <div><label className={labelCls}>Final Condition *</label><select value={resolveForm.finalCondition} onChange={e => setResolveForm(p => ({ ...p, finalCondition: e.target.value }))} className={inputCls}><option value="EXCELLENT">Excellent</option><option value="GOOD">Good</option><option value="FAIR">Fair</option><option value="POOR">Poor</option></select></div>
              <div><label className={labelCls}>Resolution Notes</label><textarea value={resolveForm.resolutionNotes} onChange={e => setResolveForm(p => ({ ...p, resolutionNotes: e.target.value }))} className={inputCls} rows={3} /></div>
              <div><label className={labelCls}>Repair Cost (₹)</label><input type="number" value={resolveForm.repairCost} onChange={e => setResolveForm(p => ({ ...p, repairCost: e.target.value }))} className={inputCls} /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowResolveForm(null)} className="px-4 py-2 text-sm font-medium text-charcoal-500 bg-charcoal-50 rounded-lg border border-charcoal-200">Cancel</button>
                <button type="submit" disabled={submitting} className="flex items-center gap-1.5 px-4 py-2 bg-govSuccess hover:bg-govSuccess-dark text-white text-sm font-bold rounded-lg disabled:opacity-50">
                  <CheckCircle2 className="w-4 h-4" /> Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;
