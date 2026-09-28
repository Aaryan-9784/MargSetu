import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History, Activity, TrendingUp, AlertTriangle, Wrench, CheckCircle2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getDashboardSummaryApi } from '../api/dashboard';
import { getAllLifecycleEventsApi } from '../api/lifecycle';
import { AssetTypeBadge } from '../components/common/Badge';
import { LoadingSpinner, EmptyState } from '../components/common/UIHelpers';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const EVENT_COLORS = {
  REGISTERED: '#805AD5', CONSTRUCTION_COMPLETED: '#3182CE', OPERATIONAL: '#16803C',
  INSPECTION_COMPLETED: '#1976A5', ISSUE_DETECTED: '#C53030', MAINTENANCE_ASSIGNED: '#D89B24',
  REPAIR_STARTED: '#DD6B20', REPAIR_COMPLETED: '#38A169', RE_INSPECTION_COMPLETED: '#2B6CB0',
  UPGRADED: '#6B46C1', RETIRED: '#718096', STATUS_CHANGED: '#4A5568',
};

const LifecyclePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventTypeCounts, setEventTypeCounts] = useState([]);
  const [filters, setFilters] = useState({ assetType: 'ALL', eventType: 'ALL' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, evtRes] = await Promise.all([
          getDashboardSummaryApi(),
          getAllLifecycleEventsApi({ ...filters, limit: 50 }),
        ]);
        setSummary(sumRes.data);
        setEvents(evtRes.data || []);
        setEventTypeCounts(evtRes.eventTypeCounts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  if (loading) return <LoadingSpinner label="Loading lifecycle analytics..." />;
  if (!summary) return <EmptyState icon={History} title="Unable to Load" message="Please check your connection." />;

  const { kpis, charts } = summary;

  // Build lifecycle event type chart data
  const eventChartData = eventTypeCounts
    .map((e) => ({
      name: e._id?.replace(/_/g, ' ') || 'Unknown',
      value: e.count,
      color: EVENT_COLORS[e._id] || '#718096',
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Lifecycle Analytics</h1>
        <p className="text-sm text-charcoal-500">Comprehensive lifecycle event analysis across all infrastructure assets.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle p-4">
          <Activity className="w-5 h-5 text-[#1976A5] mb-2" />
          <p className="text-xl font-black text-navy-900">{kpis.totalAssets}</p>
          <p className="text-xs text-charcoal-500 font-medium">Total Assets</p>
        </div>
        <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle p-4">
          <TrendingUp className="w-5 h-5 text-govSuccess mb-2" />
          <p className="text-xl font-black text-navy-900">{kpis.operational}</p>
          <p className="text-xs text-charcoal-500 font-medium">Operational</p>
        </div>
        <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle p-4">
          <Wrench className="w-5 h-5 text-safety-amber mb-2" />
          <p className="text-xl font-black text-navy-900">{kpis.underMaintenance}</p>
          <p className="text-xs text-charcoal-500 font-medium">Under Maintenance</p>
        </div>
        <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle p-4">
          <AlertTriangle className="w-5 h-5 text-govDanger mb-2" />
          <p className="text-xl font-black text-navy-900">{kpis.critical}</p>
          <p className="text-xs text-charcoal-500 font-medium">Critical</p>
        </div>
        <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle p-4">
          <CheckCircle2 className="w-5 h-5 text-charcoal-500 mb-2" />
          <p className="text-xl font-black text-navy-900">{eventChartData.reduce((s, e) => s + e.value, 0)}</p>
          <p className="text-xs text-charcoal-500 font-medium">Total Events</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle p-4 flex flex-col md:flex-row gap-3">
        <select value={filters.assetType} onChange={e => setFilters(p => ({ ...p, assetType: e.target.value }))} className="px-3 py-2 rounded-lg border border-charcoal-200 bg-charcoal-50 text-sm font-medium">
          <option value="ALL">All Types</option>
          <option value="ROAD">Road</option><option value="HIGHWAY">Highway</option><option value="BRIDGE">Bridge</option>
        </select>
        <select value={filters.eventType} onChange={e => setFilters(p => ({ ...p, eventType: e.target.value }))} className="px-3 py-2 rounded-lg border border-charcoal-200 bg-charcoal-50 text-sm font-medium">
          <option value="ALL">All Events</option>
          {Object.keys(EVENT_COLORS).map(et => (
            <option key={et} value={et}>{et.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lifecycle Event Types */}
        <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle p-5">
          <h3 className="text-sm font-bold text-navy-900 mb-4">Lifecycle Events by Type</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventChartData.slice(0, 10)} barSize={24} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {eventChartData.slice(0, 10).map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Condition */}
        <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle p-5">
          <h3 className="text-sm font-bold text-navy-900 mb-4">Condition Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.assetConditionDistribution.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3}>
                  {charts.assetConditionDistribution.filter(d => d.value > 0).map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} formatter={(val) => <span className="text-xs text-charcoal-500">{val}</span>} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance Priority */}
        <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle p-5">
          <h3 className="text-sm font-bold text-navy-900 mb-4">Maintenance Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.maintenanceStatusDistribution} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {charts.maintenanceStatusDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Types */}
        <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle p-5">
          <h3 className="text-sm font-bold text-navy-900 mb-4">Asset Types</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.assetTypeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} paddingAngle={4}>
                  {charts.assetTypeDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} formatter={(val) => <span className="text-xs text-charcoal-500">{val}</span>} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle">
        <div className="p-5 border-b border-charcoal-200">
          <h3 className="text-sm font-bold text-navy-900">Recent Lifecycle Events</h3>
        </div>
        <div className="divide-y divide-charcoal-200 max-h-[400px] overflow-y-auto">
          {events.length === 0 ? (
            <div className="p-8 text-center text-sm text-charcoal-500">No lifecycle events match your filters.</div>
          ) : (
            events.map((evt) => (
              <div
                key={evt._id}
                onClick={() => evt.asset && navigate(`/assets/${evt.asset._id}`)}
                className="flex items-start gap-3 px-5 py-3 hover:bg-charcoal-50 cursor-pointer transition-colors"
              >
                <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: EVENT_COLORS[evt.eventType] || '#718096' }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-navy-900">{evt.asset?.assetId || 'SYS'}</span>
                    {evt.asset?.assetType && <AssetTypeBadge type={evt.asset.assetType} />}
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: EVENT_COLORS[evt.eventType] || '#718096' }}>
                      {evt.eventType?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-500 mt-0.5 truncate">{evt.title}</p>
                </div>
                <span className="text-[10px] text-charcoal-500 whitespace-nowrap">{formatDate(evt.eventDate)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LifecyclePage;
