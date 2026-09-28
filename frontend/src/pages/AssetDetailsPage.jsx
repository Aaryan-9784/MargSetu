import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, ClipboardCheck, Wrench, History, Info,
  Calendar, Building2, DollarSign, Plus, CheckCircle2, AlertTriangle, X, Send,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { getAssetByIdApi } from '../api/assets';
import { createInspectionApi } from '../api/inspections';
import { createMaintenanceApi, updateMaintenanceApi } from '../api/maintenance';
import { getAssetLifecycleApi } from '../api/lifecycle';
import { AssetTypeBadge, ConditionBadge, StatusBadge, PriorityBadge } from '../components/common/Badge';
import { LoadingSpinner, EmptyState } from '../components/common/UIHelpers';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Fix default leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const formatINR = (val) => {
  if (!val) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${Number(val).toLocaleString('en-IN')}`;
};

const TABS = [
  { key: 'overview', label: 'Overview', icon: Info },
  { key: 'map', label: 'Map', icon: MapPin },
  { key: 'inspection', label: 'Inspection', icon: ClipboardCheck },
  { key: 'maintenance', label: 'Maintenance', icon: Wrench },
  { key: 'lifecycle', label: 'Lifecycle', icon: History },
];

const EVENT_COLORS = {
  REGISTERED: '#805AD5', CONSTRUCTION_COMPLETED: '#3182CE', OPERATIONAL: '#16803C',
  INSPECTION_COMPLETED: '#1976A5', ISSUE_DETECTED: '#C53030', MAINTENANCE_ASSIGNED: '#D89B24',
  REPAIR_STARTED: '#DD6B20', REPAIR_COMPLETED: '#38A169', RE_INSPECTION_COMPLETED: '#2B6CB0',
  UPGRADED: '#6B46C1', RETIRED: '#718096', STATUS_CHANGED: '#4A5568',
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-charcoal-200 last:border-0">
    <span className="text-xs font-medium text-charcoal-500">{label}</span>
    <span className="text-xs font-semibold text-navy-900 text-right max-w-[60%]">{value || '—'}</span>
  </div>
);

const AssetDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isInspector, isOfficer } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [asset, setAsset] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [lifecycle, setLifecycle] = useState([]);
  // Inspection form
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [inspForm, setInspForm] = useState({ condition: 'GOOD', severity: 'NONE', issueDetected: false, remarks: '', recommendation: '' });
  const [submittingInsp, setSubmittingInsp] = useState(false);
  // Maintenance form
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [maintForm, setMaintForm] = useState({ issueType: '', description: '', priority: 'MEDIUM', assignedTo: '' });
  const [submittingMaint, setSubmittingMaint] = useState(false);
  // Resolution form
  const [showResolveForm, setShowResolveForm] = useState(null);
  const [resolveForm, setResolveForm] = useState({ finalCondition: 'GOOD', resolutionNotes: '', repairCost: '' });
  const [submittingResolve, setSubmittingResolve] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAssetByIdApi(id);
      setAsset(res.data.asset);
      setInspections(res.data.inspections || []);
      setMaintenance(res.data.maintenance || []);
      const lcRes = await getAssetLifecycleApi(res.data.asset._id);
      setLifecycle(lcRes.data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load asset details', 'error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreateInspection = async (e) => {
    e.preventDefault();
    setSubmittingInsp(true);
    try {
      await createInspectionApi(asset._id, { ...inspForm, inspectionDate: new Date().toISOString() });
      showToast('Inspection recorded and asset lifecycle updated');
      setShowInspectionForm(false);
      setInspForm({ condition: 'GOOD', severity: 'NONE', issueDetected: false, remarks: '', recommendation: '' });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create inspection', 'error');
    } finally {
      setSubmittingInsp(false);
    }
  };

  const handleCreateMaintenance = async (e) => {
    e.preventDefault();
    setSubmittingMaint(true);
    try {
      await createMaintenanceApi(asset._id, maintForm);
      showToast('Maintenance ticket created successfully');
      setShowMaintenanceForm(false);
      setMaintForm({ issueType: '', description: '', priority: 'MEDIUM', assignedTo: '' });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create maintenance ticket', 'error');
    } finally {
      setSubmittingMaint(false);
    }
  };

  const handleMaintenanceAction = async (ticket, newStatus) => {
    try {
      await updateMaintenanceApi(ticket._id, { status: newStatus, assignedTo: ticket.assignedTo || user?.name });
      showToast(`Maintenance ticket updated to ${newStatus}`);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update ticket', 'error');
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    setSubmittingResolve(true);
    try {
      await updateMaintenanceApi(showResolveForm._id, { status: 'RESOLVED', ...resolveForm, repairCost: Number(resolveForm.repairCost) || 0 });
      showToast('Maintenance completed successfully. Asset returned to OPERATIONAL.');
      setShowResolveForm(null);
      setResolveForm({ finalCondition: 'GOOD', resolutionNotes: '', repairCost: '' });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to resolve', 'error');
    } finally {
      setSubmittingResolve(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading asset details..." />;
  if (!asset) return <EmptyState icon={Info} title="Asset Not Found" message="The requested infrastructure asset could not be found." />;

  const details = asset.assetSpecificDetails || {};
  const inputCls = "w-full px-3 py-2 rounded-lg border border-charcoal-200 bg-charcoal-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1976A5]/40 focus:border-[#1976A5] transition-all";
  const labelCls = "block text-[11px] font-bold text-navy-800 mb-1 uppercase tracking-wide";

  return (
    <div className="space-y-5">
      {/* Breadcrumb & Header */}
      <button onClick={() => navigate('/assets')} className="flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-[#1976A5] transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Asset Inventory
      </button>

      <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-navy-900 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
              {asset.assetType === 'ROAD' ? 'RD' : asset.assetType === 'HIGHWAY' ? 'HW' : 'BR'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-bold text-[#1976A5]">{asset.assetId}</span>
                <AssetTypeBadge type={asset.assetType} />
              </div>
              <h1 className="text-lg font-bold text-navy-900 mt-0.5">{asset.name}</h1>
              <p className="text-xs text-charcoal-500 mt-0.5">{asset.district}, {asset.state} · {asset.department}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <ConditionBadge condition={asset.condition} size="md" />
            <StatusBadge status={asset.status} size="md" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle overflow-hidden">
        <div className="flex border-b border-charcoal-200 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'border-[#1976A5] text-[#1976A5] bg-[#1976A5]/5'
                  : 'border-transparent text-charcoal-500 hover:text-navy-800 hover:bg-charcoal-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* === OVERVIEW === */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border border-charcoal-200 rounded-lg p-4">
                  <h3 className="text-xs font-bold text-navy-800 uppercase tracking-wider mb-3">Basic Information</h3>
                  <InfoRow label="Asset ID" value={asset.assetId} />
                  <InfoRow label="Asset Code" value={asset.assetCode} />
                  <InfoRow label="Asset Type" value={asset.assetType} />
                  <InfoRow label="Department" value={asset.department} />
                  <InfoRow label="Description" value={asset.description} />
                </div>
                <div className="border border-charcoal-200 rounded-lg p-4">
                  <h3 className="text-xs font-bold text-navy-800 uppercase tracking-wider mb-3">Location</h3>
                  <InfoRow label="State" value={asset.state} />
                  <InfoRow label="District" value={asset.district} />
                  <InfoRow label="Area" value={asset.area} />
                  <InfoRow label="Coordinates" value={`${asset.location?.latitude}, ${asset.location?.longitude}`} />
                </div>
              </div>
              <div className="space-y-4">
                <div className="border border-charcoal-200 rounded-lg p-4">
                  <h3 className="text-xs font-bold text-navy-800 uppercase tracking-wider mb-3">{asset.assetType} Details</h3>
                  {asset.assetType === 'ROAD' && (<>
                    <InfoRow label="Road Number" value={details.roadNumber} />
                    <InfoRow label="Category" value={details.roadCategory?.replace(/_/g, ' ')} />
                    <InfoRow label="Start → End" value={`${details.startLocation || '—'} → ${details.endLocation || '—'}`} />
                    <InfoRow label="Length" value={details.lengthKm ? `${details.lengthKm} km` : '—'} />
                    <InfoRow label="Width" value={details.widthMeters ? `${details.widthMeters} m` : '—'} />
                    <InfoRow label="Lanes" value={details.laneCount} />
                    <InfoRow label="Surface" value={details.surfaceType} />
                  </>)}
                  {asset.assetType === 'HIGHWAY' && (<>
                    <InfoRow label="Highway Number" value={details.highwayNumber} />
                    <InfoRow label="Corridor" value={details.corridorName} />
                    <InfoRow label="Start → End" value={`${details.startLocation || '—'} → ${details.endLocation || '—'}`} />
                    <InfoRow label="Length" value={details.lengthKm ? `${details.lengthKm} km` : '—'} />
                    <InfoRow label="Lanes" value={details.laneCount} />
                    <InfoRow label="Median" value={details.medianType} />
                    <InfoRow label="Pavement" value={details.pavementType} />
                  </>)}
                  {asset.assetType === 'BRIDGE' && (<>
                    <InfoRow label="Bridge Number" value={details.bridgeNumber} />
                    <InfoRow label="Bridge Name" value={details.bridgeName} />
                    <InfoRow label="Crossing Type" value={details.crossingType} />
                    <InfoRow label="River/Crossing" value={details.riverOrCrossing} />
                    <InfoRow label="Length" value={details.lengthMeters ? `${details.lengthMeters} m` : '—'} />
                    <InfoRow label="Width" value={details.widthMeters ? `${details.widthMeters} m` : '—'} />
                    <InfoRow label="Lanes" value={details.laneCount} />
                    <InfoRow label="Structural Type" value={details.structuralType} />
                    <InfoRow label="Load Capacity" value={details.loadCapacityTons ? `${details.loadCapacityTons} Tons` : '—'} />
                  </>)}
                </div>
                <div className="border border-charcoal-200 rounded-lg p-4">
                  <h3 className="text-xs font-bold text-navy-800 uppercase tracking-wider mb-3">Construction & Financial</h3>
                  <InfoRow label="Construction Date" value={formatDate(asset.constructionDate)} />
                  <InfoRow label="Operational Date" value={formatDate(asset.operationalDate)} />
                  <InfoRow label="Estimated Cost" value={formatINR(asset.estimatedCost)} />
                  <InfoRow label="Asset Age" value={asset.operationalDate ? `${Math.floor((Date.now() - new Date(asset.operationalDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years` : '—'} />
                </div>
                <div className="border border-charcoal-200 rounded-lg p-4">
                  <h3 className="text-xs font-bold text-navy-800 uppercase tracking-wider mb-3">Inspection Schedule</h3>
                  <InfoRow label="Last Inspection" value={formatDate(asset.lastInspectionDate)} />
                  <InfoRow label="Next Inspection" value={formatDate(asset.nextInspectionDate)} />
                </div>
              </div>
            </div>
          )}

          {/* === MAP === */}
          {activeTab === 'map' && (
            <div className="h-[480px] rounded-lg overflow-hidden border border-charcoal-200">
              {asset.location?.latitude && asset.location?.longitude ? (
                <MapContainer
                  center={[asset.location.latitude, asset.location.longitude]}
                  zoom={14}
                  scrollWheelZoom={true}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[asset.location.latitude, asset.location.longitude]}>
                    <Popup>
                      <div className="text-xs space-y-1">
                        <p className="font-bold">{asset.assetId} — {asset.name}</p>
                        <p>Type: {asset.assetType}</p>
                        <p>Condition: {asset.condition}</p>
                        <p>Status: {asset.status}</p>
                      </div>
                    </Popup>
                  </Marker>
                  {/* Show start/end for roads and highways */}
                  {(asset.assetType === 'ROAD' || asset.assetType === 'HIGHWAY') &&
                    asset.location.startLatitude && asset.location.endLatitude && (
                    <Polyline
                      positions={[
                        [asset.location.startLatitude, asset.location.startLongitude],
                        [asset.location.latitude, asset.location.longitude],
                        [asset.location.endLatitude, asset.location.endLongitude],
                      ]}
                      color="#1976A5"
                      weight={4}
                      dashArray="8 4"
                    />
                  )}
                </MapContainer>
              ) : (
                <EmptyState icon={MapPin} title="No Coordinates" message="Location data is not available for this asset." />
              )}
            </div>
          )}

          {/* === INSPECTION === */}
          {activeTab === 'inspection' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-navy-900">Inspection Records</h3>
                {(isAdmin || isInspector) && (
                  <button onClick={() => setShowInspectionForm(true)} className="flex items-center gap-1.5 px-3 py-2 bg-navy-900 hover:bg-navy-700 text-white text-xs font-bold rounded-lg transition-colors">
                    <Plus className="w-3.5 h-3.5" /> New Inspection
                  </button>
                )}
              </div>

              {inspections.length === 0 ? (
                <EmptyState icon={ClipboardCheck} title="No Inspections" message="No inspection records exist for this asset yet." />
              ) : (
                <div className="space-y-3">
                  {inspections.map((insp) => (
                    <div key={insp._id} className="border border-charcoal-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-navy-900">{formatDate(insp.inspectionDate)}</span>
                          <ConditionBadge condition={insp.condition} />
                          {insp.issueDetected && <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">ISSUE DETECTED</span>}
                        </div>
                        <span className="text-[10px] text-charcoal-500">by {insp.inspector?.name || 'Unknown'}</span>
                      </div>
                      {insp.remarks && <p className="text-xs text-charcoal-500">{insp.remarks}</p>}
                      {insp.recommendation && <p className="text-xs text-[#1976A5] mt-1">Recommendation: {insp.recommendation}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Inspection Form Modal */}
              {showInspectionForm && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="bg-white rounded-xl shadow-elevation max-w-lg w-full mx-4 border border-charcoal-200">
                    <div className="flex items-center justify-between p-5 border-b border-charcoal-200">
                      <h2 className="text-base font-bold text-navy-900">Record Field Inspection</h2>
                      <button onClick={() => setShowInspectionForm(false)} className="p-1 text-charcoal-500 hover:text-navy-900"><X className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={handleCreateInspection} className="p-5 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelCls}>Condition *</label><select value={inspForm.condition} onChange={e => setInspForm(p => ({ ...p, condition: e.target.value }))} className={inputCls}><option value="EXCELLENT">Excellent</option><option value="GOOD">Good</option><option value="FAIR">Fair</option><option value="POOR">Poor</option><option value="CRITICAL">Critical</option></select></div>
                        <div><label className={labelCls}>Severity</label><select value={inspForm.severity} onChange={e => setInspForm(p => ({ ...p, severity: e.target.value }))} className={inputCls}><option value="NONE">None</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={inspForm.issueDetected} onChange={e => setInspForm(p => ({ ...p, issueDetected: e.target.checked }))} className="rounded border-charcoal-200" id="issueDetected" />
                        <label htmlFor="issueDetected" className="text-xs font-medium text-navy-800">Issue / Defect Detected</label>
                      </div>
                      <div><label className={labelCls}>Remarks</label><textarea value={inspForm.remarks} onChange={e => setInspForm(p => ({ ...p, remarks: e.target.value }))} className={inputCls} rows={2} placeholder="Inspection observations..." /></div>
                      <div><label className={labelCls}>Recommendation</label><textarea value={inspForm.recommendation} onChange={e => setInspForm(p => ({ ...p, recommendation: e.target.value }))} className={inputCls} rows={2} placeholder="Recommended next actions..." /></div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowInspectionForm(false)} className="px-4 py-2 text-sm font-medium text-charcoal-500 bg-charcoal-50 rounded-lg border border-charcoal-200">Cancel</button>
                        <button type="submit" disabled={submittingInsp} className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-700 text-white text-sm font-bold rounded-lg disabled:opacity-50">
                          {submittingInsp ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />} Submit Inspection
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* === MAINTENANCE === */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-navy-900">Maintenance Tickets</h3>
                {(isAdmin || isInspector || isOfficer) && (
                  <button onClick={() => setShowMaintenanceForm(true)} className="flex items-center gap-1.5 px-3 py-2 bg-navy-900 hover:bg-navy-700 text-white text-xs font-bold rounded-lg transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Create Ticket
                  </button>
                )}
              </div>

              {maintenance.length === 0 ? (
                <EmptyState icon={Wrench} title="No Maintenance Records" message="No maintenance tickets exist for this asset." />
              ) : (
                <div className="space-y-3">
                  {maintenance.map((tkt) => (
                    <div key={tkt._id} className="border border-charcoal-200 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-navy-900">{tkt.ticketId}</span>
                            <PriorityBadge priority={tkt.priority} />
                            <StatusBadge status={tkt.status === 'IN_PROGRESS' ? 'UNDER_MAINTENANCE' : tkt.status === 'RESOLVED' ? 'OPERATIONAL' : tkt.status === 'ASSIGNED' ? 'UNDER_CONSTRUCTION' : 'CRITICAL'} />
                          </div>
                          <p className="text-xs font-semibold text-navy-800 mt-1">{tkt.issueType}</p>
                          <p className="text-xs text-charcoal-500 mt-0.5">{tkt.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-charcoal-500 mt-2">
                        <span>Assigned: {tkt.assignedTo || 'Unassigned'}</span>
                        <span>Reported: {formatDate(tkt.reportedAt)}</span>
                        {tkt.resolvedAt && <span>Resolved: {formatDate(tkt.resolvedAt)}</span>}
                        {tkt.repairCost > 0 && <span>Cost: {formatINR(tkt.repairCost)}</span>}
                      </div>
                      {/* Workflow actions */}
                      {(isAdmin || isOfficer) && tkt.status !== 'RESOLVED' && (
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-charcoal-200">
                          {tkt.status === 'OPEN' && (
                            <button onClick={() => handleMaintenanceAction(tkt, 'ASSIGNED')} className="px-3 py-1.5 text-[11px] font-bold text-white bg-[#D89B24] hover:bg-[#B45309] rounded-lg transition-colors">Assign</button>
                          )}
                          {tkt.status === 'ASSIGNED' && (
                            <button onClick={() => handleMaintenanceAction(tkt, 'IN_PROGRESS')} className="px-3 py-1.5 text-[11px] font-bold text-white bg-[#1976A5] hover:bg-[#123B5D] rounded-lg transition-colors">Start Repair</button>
                          )}
                          {tkt.status === 'IN_PROGRESS' && (
                            <button onClick={() => { setShowResolveForm(tkt); setResolveForm({ finalCondition: 'GOOD', resolutionNotes: '', repairCost: '' }); }} className="px-3 py-1.5 text-[11px] font-bold text-white bg-govSuccess hover:bg-govSuccess-dark rounded-lg transition-colors">
                              <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> Resolve
                            </button>
                          )}
                        </div>
                      )}
                      {tkt.status === 'RESOLVED' && tkt.resolutionNotes && (
                        <div className="mt-2 pt-2 border-t border-charcoal-200 text-xs text-govSuccess">
                          ✓ {tkt.resolutionNotes} · Final Condition: {tkt.finalCondition}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Maintenance Create Modal */}
              {showMaintenanceForm && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="bg-white rounded-xl shadow-elevation max-w-lg w-full mx-4 border border-charcoal-200">
                    <div className="flex items-center justify-between p-5 border-b border-charcoal-200">
                      <h2 className="text-base font-bold text-navy-900">Create Maintenance Request</h2>
                      <button onClick={() => setShowMaintenanceForm(false)} className="p-1 text-charcoal-500 hover:text-navy-900"><X className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={handleCreateMaintenance} className="p-5 space-y-3">
                      <div><label className={labelCls}>Issue Type *</label><input value={maintForm.issueType} onChange={e => setMaintForm(p => ({ ...p, issueType: e.target.value }))} className={inputCls} placeholder="e.g. Surface Crack, Pothole Damage" required /></div>
                      <div><label className={labelCls}>Description *</label><textarea value={maintForm.description} onChange={e => setMaintForm(p => ({ ...p, description: e.target.value }))} className={inputCls} rows={3} placeholder="Describe the issue in detail..." required /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelCls}>Priority</label><select value={maintForm.priority} onChange={e => setMaintForm(p => ({ ...p, priority: e.target.value }))} className={inputCls}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select></div>
                        <div><label className={labelCls}>Assigned To</label><input value={maintForm.assignedTo} onChange={e => setMaintForm(p => ({ ...p, assignedTo: e.target.value }))} className={inputCls} placeholder="Contractor name" /></div>
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowMaintenanceForm(false)} className="px-4 py-2 text-sm font-medium text-charcoal-500 bg-charcoal-50 rounded-lg border border-charcoal-200">Cancel</button>
                        <button type="submit" disabled={submittingMaint} className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-700 text-white text-sm font-bold rounded-lg disabled:opacity-50">
                          {submittingMaint ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />} Create Ticket
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Resolve Modal */}
              {showResolveForm && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="bg-white rounded-xl shadow-elevation max-w-lg w-full mx-4 border border-charcoal-200">
                    <div className="flex items-center justify-between p-5 border-b border-charcoal-200">
                      <h2 className="text-base font-bold text-navy-900">Resolve Maintenance — {showResolveForm.ticketId}</h2>
                      <button onClick={() => setShowResolveForm(null)} className="p-1 text-charcoal-500 hover:text-navy-900"><X className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={handleResolve} className="p-5 space-y-3">
                      <div><label className={labelCls}>Final Condition *</label><select value={resolveForm.finalCondition} onChange={e => setResolveForm(p => ({ ...p, finalCondition: e.target.value }))} className={inputCls}><option value="EXCELLENT">Excellent</option><option value="GOOD">Good</option><option value="FAIR">Fair</option><option value="POOR">Poor</option></select></div>
                      <div><label className={labelCls}>Resolution Notes</label><textarea value={resolveForm.resolutionNotes} onChange={e => setResolveForm(p => ({ ...p, resolutionNotes: e.target.value }))} className={inputCls} rows={3} placeholder="Describe repair work completed..." /></div>
                      <div><label className={labelCls}>Repair Cost (₹)</label><input type="number" value={resolveForm.repairCost} onChange={e => setResolveForm(p => ({ ...p, repairCost: e.target.value }))} className={inputCls} placeholder="1500000" /></div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowResolveForm(null)} className="px-4 py-2 text-sm font-medium text-charcoal-500 bg-charcoal-50 rounded-lg border border-charcoal-200">Cancel</button>
                        <button type="submit" disabled={submittingResolve} className="flex items-center gap-1.5 px-4 py-2 bg-govSuccess hover:bg-govSuccess-dark text-white text-sm font-bold rounded-lg disabled:opacity-50">
                          {submittingResolve ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Complete Maintenance
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* === LIFECYCLE TIMELINE === */}
          {activeTab === 'lifecycle' && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-navy-900 mb-4">Asset Lifecycle Timeline</h3>
              {lifecycle.length === 0 ? (
                <EmptyState icon={History} title="No Lifecycle Events" message="No lifecycle events recorded for this asset." />
              ) : (
                <div className="relative ml-4">
                  {/* Vertical line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-charcoal-200" />
                  {lifecycle.map((evt, idx) => {
                    const color = EVENT_COLORS[evt.eventType] || '#718096';
                    const year = new Date(evt.eventDate).getFullYear();
                    const prevYear = idx > 0 ? new Date(lifecycle[idx - 1].eventDate).getFullYear() : null;
                    return (
                      <React.Fragment key={evt._id}>
                        {(idx === 0 || year !== prevYear) && (
                          <div className="flex items-center gap-3 mb-3 mt-2">
                            <div className="w-4 h-4 rounded-full bg-navy-900 border-2 border-white shadow-sm z-10 flex items-center justify-center">
                              <span className="text-[6px] text-white font-bold">{year.toString().slice(2)}</span>
                            </div>
                            <span className="text-xs font-black text-navy-900">{year}</span>
                          </div>
                        )}
                        <div className="flex items-start gap-3 mb-4 pl-0.5">
                          <div className="w-[15px] h-[15px] rounded-full border-[3px] z-10 flex-shrink-0 mt-0.5" style={{ borderColor: color, backgroundColor: 'white' }} />
                          <div className="flex-1 bg-charcoal-50 rounded-lg p-3 border border-charcoal-200 hover:shadow-subtle transition-shadow">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: color }}>
                                  {evt.eventType?.replace(/_/g, ' ')}
                                </span>
                                <h4 className="text-xs font-bold text-navy-900 mt-1.5">{evt.title}</h4>
                              </div>
                              <span className="text-[10px] text-charcoal-500 whitespace-nowrap">{formatDate(evt.eventDate)}</span>
                            </div>
                            <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">{evt.description}</p>
                            <p className="text-[10px] text-charcoal-500 mt-1.5">By: {evt.performedBy?.name || 'System'} ({evt.performedBy?.role || ''})</p>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetDetailsPage;
