import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Route, Landmark, AlertTriangle, ClipboardCheck, TrendingUp,
  ArrowUpRight, Eye, ExternalLink,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getDashboardSummaryApi, getDashboardActivityApi, getCriticalAssetsApi } from '../api/dashboard';
import { AssetTypeBadge, ConditionBadge, StatusBadge } from '../components/common/Badge';
import { LoadingSpinner, EmptyState } from '../components/common/UIHelpers';
import { useAuth } from '../context/AuthContext';

const formatINR = (val) => {
  if (!val) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  return `₹${val.toLocaleString('en-IN')}`;
};

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const KpiCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle p-4 hover:shadow-card transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-[18px] h-[18px]" />
      </div>
      {sub && <span className="text-[10px] text-charcoal-500 font-medium">{sub}</span>}
    </div>
    <p className="text-2xl font-black text-navy-900">{value}</p>
    <p className="text-xs text-charcoal-500 mt-0.5 font-medium">{label}</p>
  </div>
);

const EVENT_TYPE_LABELS = {
  REGISTERED: 'Registered',
  CONSTRUCTION_COMPLETED: 'Construction Completed',
  OPERATIONAL: 'Operational',
  INSPECTION_COMPLETED: 'Inspection Completed',
  ISSUE_DETECTED: 'Issue Detected',
  MAINTENANCE_ASSIGNED: 'Maintenance Assigned',
  REPAIR_STARTED: 'Repair Started',
  REPAIR_COMPLETED: 'Repair Completed',
  RE_INSPECTION_COMPLETED: 'Re-Inspection Completed',
  UPGRADED: 'Upgraded',
  RETIRED: 'Retired',
  STATUS_CHANGED: 'Status Changed',
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState([]);
  const [criticalAssets, setCriticalAssets] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, actRes, critRes] = await Promise.all([
          getDashboardSummaryApi(),
          getDashboardActivityApi(),
          getCriticalAssetsApi(),
        ]);
        setSummary(sumRes.data);
        setActivity(actRes.data || []);
        setCriticalAssets(critRes.data || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner label="Loading dashboard metrics..." />;
  if (!summary) return <EmptyState icon={Activity} title="Unable to load dashboard" message="Please check your connection and try again." />;

  const { kpis, charts } = summary;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Transportation Infrastructure Overview</h1>
        <p className="text-sm text-charcoal-500 mt-0.5">
          Monitor roads, highways and bridges across their complete lifecycle.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard icon={Activity} label="Total Assets" value={kpis.totalAssets} color="bg-[#1976A5]/10 text-[#1976A5]" />
        <KpiCard icon={TrendingUp} label="Operational" value={kpis.operational} color="bg-[#DCFCE7] text-[#166534]" />
        <KpiCard icon={Landmark} label="Under Maintenance" value={kpis.underMaintenance} color="bg-[#FEF3C7] text-[#B45309]" />
        <KpiCard icon={AlertTriangle} label="Critical" value={kpis.critical} color="bg-[#FEE2E2] text-[#991B1B]" />
        <KpiCard icon={ClipboardCheck} label="Inspection Due" value={kpis.inspectionDue} color="bg-purple-50 text-purple-700" />
      </div>

      {/* Asset Type Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#1976A5]/10 flex items-center justify-center">
            <Route className="w-5 h-5 text-[#1976A5]" />
          </div>
          <div>
            <p className="text-xl font-black text-navy-900">{kpis.breakdown.roads}</p>
            <p className="text-xs text-charcoal-500 font-medium">Roads</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#123B5D]/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#123B5D]" />
          </div>
          <div>
            <p className="text-xl font-black text-navy-900">{kpis.breakdown.highways}</p>
            <p className="text-xs text-charcoal-500 font-medium">Highways</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#D89B24]/10 flex items-center justify-center">
            <Landmark className="w-5 h-5 text-[#D89B24]" />
          </div>
          <div>
            <p className="text-xl font-black text-navy-900">{kpis.breakdown.bridges}</p>
            <p className="text-xs text-charcoal-500 font-medium">Bridges</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Type Distribution Pie */}
        <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle p-5">
          <h3 className="text-sm font-bold text-navy-900 mb-4">Asset Type Distribution</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.assetTypeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {charts.assetTypeDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} formatter={(val) => <span className="text-xs text-charcoal-500">{val}</span>} />
                <Tooltip formatter={(val) => val} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Condition Distribution */}
        <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle p-5">
          <h3 className="text-sm font-bold text-navy-900 mb-4">Asset Condition</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.assetConditionDistribution} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {charts.assetConditionDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle p-5">
          <h3 className="text-sm font-bold text-navy-900 mb-4">Asset Status</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.assetStatusDistribution.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                  {charts.assetStatusDistribution.filter(d => d.value > 0).map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} formatter={(val) => <span className="text-xs text-charcoal-500">{val}</span>} />
                <Tooltip formatter={(val) => val} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* District Distribution */}
        <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle p-5">
          <h3 className="text-sm font-bold text-navy-900 mb-4">District-wise Assets</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.districtDistribution} barSize={28} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis dataKey="district" type="category" width={80} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1976A5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Maintenance Status + Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Status */}
        <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle p-5">
          <h3 className="text-sm font-bold text-navy-900 mb-4">Maintenance Status</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.maintenanceStatusDistribution} barSize={32}>
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

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle p-5">
          <h3 className="text-sm font-bold text-navy-900 mb-4">Recent Lifecycle Activity</h3>
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {activity.length === 0 ? (
              <p className="text-sm text-charcoal-500 text-center py-4">No recent activity.</p>
            ) : (
              activity.slice(0, 8).map((evt) => (
                <div
                  key={evt._id}
                  onClick={() => evt.asset && navigate(`/assets/${evt.asset._id}`)}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-charcoal-50 cursor-pointer transition-colors border border-transparent hover:border-charcoal-200"
                >
                  <div className="w-2 h-2 rounded-full bg-[#1976A5] mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-navy-900">
                        {evt.asset?.assetId || 'SYS'}
                      </span>
                      {evt.asset?.assetType && <AssetTypeBadge type={evt.asset.assetType} size="sm" />}
                    </div>
                    <p className="text-xs text-charcoal-500 mt-0.5 truncate">{evt.title}</p>
                    <p className="text-[10px] text-charcoal-500 mt-0.5">{formatDate(evt.eventDate)}</p>
                  </div>
                  <span className="text-[10px] text-charcoal-500 font-mono whitespace-nowrap">
                    {EVENT_TYPE_LABELS[evt.eventType] || evt.eventType}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Critical Assets Table */}
      <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle">
        <div className="p-5 border-b border-charcoal-200">
          <h3 className="text-sm font-bold text-navy-900">Critical & High-Attention Assets</h3>
          <p className="text-xs text-charcoal-500 mt-0.5">Assets requiring immediate inspection or maintenance intervention</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-charcoal-50 border-b border-charcoal-200">
                <th className="text-left px-4 py-2.5 text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">Asset ID</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">Location</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">Condition</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">Last Inspection</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-200">
              {criticalAssets.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-sm text-charcoal-500">No critical assets found.</td></tr>
              ) : (
                criticalAssets.map((a) => (
                  <tr key={a._id} className="hover:bg-charcoal-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-bold text-navy-900">{a.assetId}</td>
                    <td className="px-4 py-3"><AssetTypeBadge type={a.assetType} /></td>
                    <td className="px-4 py-3 text-xs text-charcoal-500">{a.district}</td>
                    <td className="px-4 py-3"><ConditionBadge condition={a.condition} /></td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3 text-xs text-charcoal-500">{formatDate(a.lastInspectionDate)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/assets/${a._id}`)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-[#1976A5] hover:text-[#123B5D] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
