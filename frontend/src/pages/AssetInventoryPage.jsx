import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Eye, Pencil, Trash2, X, Archive, ChevronDown } from 'lucide-react';
import { getAssetsApi, createAssetApi, deleteAssetApi } from '../api/assets';
import { AssetTypeBadge, ConditionBadge, StatusBadge } from '../components/common/Badge';
import { LoadingSpinner, EmptyState, ConfirmDialog } from '../components/common/UIHelpers';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const INITIAL_FORM = {
  assetId: '', assetType: 'ROAD', name: '', description: '', department: '', state: 'Gujarat', district: '', area: '',
  latitude: '', longitude: '', constructionDate: '', operationalDate: '', estimatedCost: '', condition: 'GOOD', status: 'OPERATIONAL',
  // Road
  roadNumber: '', roadCategory: '', startLocation: '', endLocation: '', lengthKm: '', widthMeters: '', laneCount: '', surfaceType: '',
  // Highway
  highwayNumber: '', corridorName: '', medianType: '', pavementType: '',
  // Bridge
  bridgeNumber: '', bridgeName: '', crossingType: '', riverOrCrossing: '', lengthMeters: '', structuralType: '', loadCapacityTons: '',
};

const AssetInventoryPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState({ assetType: 'ALL', status: 'ALL', condition: 'ALL', district: 'ALL' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await getAssetsApi({ q, ...filters });
      setAssets(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssets(); }, [q, filters]);

  const districts = [...new Set(assets.map(a => a.district).filter(Boolean))];

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { assetId, assetType, name, description, department, state, district, area,
        latitude, longitude, constructionDate, operationalDate, estimatedCost, condition, status, ...rest } = formData;

      let assetSpecificDetails = {};
      if (assetType === 'ROAD') {
        assetSpecificDetails = { roadNumber: rest.roadNumber, roadCategory: rest.roadCategory, startLocation: rest.startLocation, endLocation: rest.endLocation, lengthKm: Number(rest.lengthKm) || 0, widthMeters: Number(rest.widthMeters) || 0, laneCount: Number(rest.laneCount) || 2, surfaceType: rest.surfaceType };
      } else if (assetType === 'HIGHWAY') {
        assetSpecificDetails = { highwayNumber: rest.highwayNumber, corridorName: rest.corridorName, startLocation: rest.startLocation, endLocation: rest.endLocation, lengthKm: Number(rest.lengthKm) || 0, laneCount: Number(rest.laneCount) || 4, medianType: rest.medianType, pavementType: rest.pavementType };
      } else if (assetType === 'BRIDGE') {
        assetSpecificDetails = { bridgeNumber: rest.bridgeNumber, bridgeName: rest.bridgeName, crossingType: rest.crossingType, riverOrCrossing: rest.riverOrCrossing, lengthMeters: Number(rest.lengthMeters) || 0, widthMeters: Number(rest.widthMeters) || 0, laneCount: Number(rest.laneCount) || 2, structuralType: rest.structuralType, loadCapacityTons: Number(rest.loadCapacityTons) || 0 };
      }

      await createAssetApi({
        assetId, assetType, name, description, department: department || 'Roads & Buildings Department, Gujarat',
        state: state || 'Gujarat', district, area,
        location: { latitude: Number(latitude), longitude: Number(longitude) },
        assetSpecificDetails, condition, status,
        constructionDate: constructionDate || undefined, operationalDate: operationalDate || undefined,
        estimatedCost: Number(estimatedCost) || 0,
      });
      showToast('Asset successfully registered into inventory');
      setShowCreateModal(false);
      setFormData(INITIAL_FORM);
      fetchAssets();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create asset', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAssetApi(deleteTarget._id);
      showToast(`Asset ${deleteTarget.assetId} deleted successfully`);
      setDeleteTarget(null);
      fetchAssets();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete asset', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const inputCls = "w-full px-3 py-2 rounded-lg border border-charcoal-200 bg-charcoal-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1976A5]/40 focus:border-[#1976A5] transition-all";
  const labelCls = "block text-[11px] font-bold text-navy-800 mb-1 uppercase tracking-wide";
  const updateForm = (field, value) => setFormData(p => ({ ...p, [field]: value }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Infrastructure Asset Inventory</h1>
          <p className="text-sm text-charcoal-500">Centralized registry of government roads, highways and bridges.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-700 text-white text-sm font-bold rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Add Asset
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by asset ID, name, district..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-charcoal-200 bg-charcoal-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1976A5]/40" />
          </div>
          <select value={filters.assetType} onChange={e => setFilters(p => ({ ...p, assetType: e.target.value }))} className="px-3 py-2 rounded-lg border border-charcoal-200 bg-charcoal-50 text-sm font-medium">
            <option value="ALL">All Types</option>
            <option value="ROAD">Road</option>
            <option value="HIGHWAY">Highway</option>
            <option value="BRIDGE">Bridge</option>
          </select>
          <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))} className="px-3 py-2 rounded-lg border border-charcoal-200 bg-charcoal-50 text-sm font-medium">
            <option value="ALL">All Statuses</option>
            <option value="OPERATIONAL">Operational</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="CRITICAL">Critical</option>
            <option value="RETIRED">Retired</option>
          </select>
          <select value={filters.condition} onChange={e => setFilters(p => ({ ...p, condition: e.target.value }))} className="px-3 py-2 rounded-lg border border-charcoal-200 bg-charcoal-50 text-sm font-medium">
            <option value="ALL">All Conditions</option>
            <option value="EXCELLENT">Excellent</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
            <option value="POOR">Poor</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-charcoal-200 shadow-subtle overflow-hidden">
        {loading ? <LoadingSpinner label="Loading assets..." /> : assets.length === 0 ? (
          <EmptyState icon={Archive} title="No Assets Found" message="No infrastructure assets match your current filter criteria." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-charcoal-50 border-b border-charcoal-200">
                  {['Asset ID','Name','Type','District','Condition','Status','Last Inspection','Next Inspection','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[11px] font-bold text-charcoal-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-200">
                {assets.map(a => (
                  <tr key={a._id} className="hover:bg-charcoal-50 transition-colors cursor-pointer" onClick={() => navigate(`/assets/${a._id}`)}>
                    <td className="px-4 py-3 text-xs font-mono font-bold text-navy-900">{a.assetId}</td>
                    <td className="px-4 py-3 text-xs font-medium text-navy-800 max-w-[180px] truncate">{a.name}</td>
                    <td className="px-4 py-3"><AssetTypeBadge type={a.assetType} /></td>
                    <td className="px-4 py-3 text-xs text-charcoal-500">{a.district}</td>
                    <td className="px-4 py-3"><ConditionBadge condition={a.condition} /></td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3 text-xs text-charcoal-500">{formatDate(a.lastInspectionDate)}</td>
                    <td className="px-4 py-3 text-xs text-charcoal-500">{formatDate(a.nextInspectionDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => navigate(`/assets/${a._id}`)} className="p-1.5 text-charcoal-500 hover:text-[#1976A5] rounded transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button onClick={() => setDeleteTarget(a)} className="p-1.5 text-charcoal-500 hover:text-govDanger rounded transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Delete Confirm */}
      <ConfirmDialog open={!!deleteTarget} title="Delete Infrastructure Asset?" message={`Are you sure you want to permanently remove ${deleteTarget?.assetId} (${deleteTarget?.name}) and all associated inspections, maintenance tickets, and lifecycle events?`} confirmLabel="Delete Permanently" danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />

      {/* Create Asset Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-8">
          <div className="bg-white rounded-xl shadow-elevation max-w-2xl w-full mx-4 border border-charcoal-200">
            <div className="flex items-center justify-between p-5 border-b border-charcoal-200">
              <div>
                <h2 className="text-lg font-bold text-navy-900">Register New Infrastructure Asset</h2>
                <p className="text-xs text-charcoal-500 mt-0.5">Add a Road, Highway, or Bridge to the state asset registry.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 text-charcoal-500 hover:text-navy-900 rounded-md"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Section 1: Basic */}
              <div>
                <h3 className="text-xs font-bold text-navy-800 uppercase tracking-wider mb-3 pb-1 border-b border-charcoal-200">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Asset Type *</label>
                    <select value={formData.assetType} onChange={e => updateForm('assetType', e.target.value)} className={inputCls} required>
                      <option value="ROAD">Road</option><option value="HIGHWAY">Highway</option><option value="BRIDGE">Bridge</option>
                    </select>
                  </div>
                  <div><label className={labelCls}>Asset ID *</label><input value={formData.assetId} onChange={e => updateForm('assetId', e.target.value)} className={inputCls} placeholder="e.g. RD-201" required /></div>
                  <div className="md:col-span-2"><label className={labelCls}>Name *</label><input value={formData.name} onChange={e => updateForm('name', e.target.value)} className={inputCls} placeholder="Asset name" required /></div>
                  <div className="md:col-span-2"><label className={labelCls}>Description</label><textarea value={formData.description} onChange={e => updateForm('description', e.target.value)} className={inputCls} rows={2} placeholder="Brief description" /></div>
                  <div><label className={labelCls}>Department</label><input value={formData.department} onChange={e => updateForm('department', e.target.value)} className={inputCls} placeholder="Roads & Buildings Department" /></div>
                </div>
              </div>

              {/* Section 2: Location */}
              <div>
                <h3 className="text-xs font-bold text-navy-800 uppercase tracking-wider mb-3 pb-1 border-b border-charcoal-200">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><label className={labelCls}>State</label><input value={formData.state} onChange={e => updateForm('state', e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>District *</label><input value={formData.district} onChange={e => updateForm('district', e.target.value)} className={inputCls} placeholder="e.g. Ahmedabad" required /></div>
                  <div><label className={labelCls}>Area</label><input value={formData.area} onChange={e => updateForm('area', e.target.value)} className={inputCls} placeholder="Locality" /></div>
                  <div />
                  <div><label className={labelCls}>Latitude *</label><input type="number" step="any" value={formData.latitude} onChange={e => updateForm('latitude', e.target.value)} className={inputCls} placeholder="23.0225" required /></div>
                  <div><label className={labelCls}>Longitude *</label><input type="number" step="any" value={formData.longitude} onChange={e => updateForm('longitude', e.target.value)} className={inputCls} placeholder="72.5714" required /></div>
                </div>
              </div>

              {/* Section 3: Asset-Specific */}
              <div>
                <h3 className="text-xs font-bold text-navy-800 uppercase tracking-wider mb-3 pb-1 border-b border-charcoal-200">
                  {formData.assetType} Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formData.assetType === 'ROAD' && (<>
                    <div><label className={labelCls}>Road Number</label><input value={formData.roadNumber} onChange={e => updateForm('roadNumber', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Road Category</label><select value={formData.roadCategory} onChange={e => updateForm('roadCategory', e.target.value)} className={inputCls}><option value="">Select</option><option value="CITY_ROAD">City Road</option><option value="DISTRICT_ROAD">District Road</option><option value="RURAL_ROAD">Rural Road</option><option value="STATE_ROAD">State Road</option></select></div>
                    <div><label className={labelCls}>Start Location</label><input value={formData.startLocation} onChange={e => updateForm('startLocation', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>End Location</label><input value={formData.endLocation} onChange={e => updateForm('endLocation', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Length (km)</label><input type="number" step="any" value={formData.lengthKm} onChange={e => updateForm('lengthKm', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Width (m)</label><input type="number" step="any" value={formData.widthMeters} onChange={e => updateForm('widthMeters', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Lane Count</label><input type="number" value={formData.laneCount} onChange={e => updateForm('laneCount', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Surface Type</label><select value={formData.surfaceType} onChange={e => updateForm('surfaceType', e.target.value)} className={inputCls}><option value="">Select</option><option value="BITUMINOUS">Bituminous</option><option value="CONCRETE">Concrete</option><option value="GRAVEL">Gravel</option><option value="OTHER">Other</option></select></div>
                  </>)}
                  {formData.assetType === 'HIGHWAY' && (<>
                    <div><label className={labelCls}>Highway Number</label><input value={formData.highwayNumber} onChange={e => updateForm('highwayNumber', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Corridor Name</label><input value={formData.corridorName} onChange={e => updateForm('corridorName', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Start Location</label><input value={formData.startLocation} onChange={e => updateForm('startLocation', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>End Location</label><input value={formData.endLocation} onChange={e => updateForm('endLocation', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Length (km)</label><input type="number" step="any" value={formData.lengthKm} onChange={e => updateForm('lengthKm', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Lane Count</label><input type="number" value={formData.laneCount} onChange={e => updateForm('laneCount', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Median Type</label><input value={formData.medianType} onChange={e => updateForm('medianType', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Pavement Type</label><input value={formData.pavementType} onChange={e => updateForm('pavementType', e.target.value)} className={inputCls} /></div>
                  </>)}
                  {formData.assetType === 'BRIDGE' && (<>
                    <div><label className={labelCls}>Bridge Number</label><input value={formData.bridgeNumber} onChange={e => updateForm('bridgeNumber', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Bridge Name</label><input value={formData.bridgeName} onChange={e => updateForm('bridgeName', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Crossing Type</label><select value={formData.crossingType} onChange={e => updateForm('crossingType', e.target.value)} className={inputCls}><option value="">Select</option><option value="RIVER">River</option><option value="CANAL">Canal</option><option value="RAILWAY">Railway</option><option value="ROAD">Road</option><option value="OTHER">Other</option></select></div>
                    <div><label className={labelCls}>River/Crossing</label><input value={formData.riverOrCrossing} onChange={e => updateForm('riverOrCrossing', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Length (m)</label><input type="number" step="any" value={formData.lengthMeters} onChange={e => updateForm('lengthMeters', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Width (m)</label><input type="number" step="any" value={formData.widthMeters} onChange={e => updateForm('widthMeters', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Lane Count</label><input type="number" value={formData.laneCount} onChange={e => updateForm('laneCount', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Structural Type</label><select value={formData.structuralType} onChange={e => updateForm('structuralType', e.target.value)} className={inputCls}><option value="">Select</option><option value="RCC">RCC</option><option value="STEEL">Steel</option><option value="COMPOSITE">Composite</option><option value="OTHER">Other</option></select></div>
                    <div><label className={labelCls}>Load Capacity (T)</label><input type="number" step="any" value={formData.loadCapacityTons} onChange={e => updateForm('loadCapacityTons', e.target.value)} className={inputCls} /></div>
                  </>)}
                </div>
              </div>

              {/* Section 4: Dates & Condition */}
              <div>
                <h3 className="text-xs font-bold text-navy-800 uppercase tracking-wider mb-3 pb-1 border-b border-charcoal-200">Construction & Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><label className={labelCls}>Construction Date</label><input type="date" value={formData.constructionDate} onChange={e => updateForm('constructionDate', e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Operational Date</label><input type="date" value={formData.operationalDate} onChange={e => updateForm('operationalDate', e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Estimated Cost (₹)</label><input type="number" value={formData.estimatedCost} onChange={e => updateForm('estimatedCost', e.target.value)} className={inputCls} placeholder="50000000" /></div>
                  <div><label className={labelCls}>Condition</label><select value={formData.condition} onChange={e => updateForm('condition', e.target.value)} className={inputCls}><option value="EXCELLENT">Excellent</option><option value="GOOD">Good</option><option value="FAIR">Fair</option><option value="POOR">Poor</option><option value="CRITICAL">Critical</option></select></div>
                  <div><label className={labelCls}>Status</label><select value={formData.status} onChange={e => updateForm('status', e.target.value)} className={inputCls}><option value="PLANNED">Planned</option><option value="UNDER_CONSTRUCTION">Under Construction</option><option value="OPERATIONAL">Operational</option><option value="UNDER_MAINTENANCE">Under Maintenance</option><option value="CRITICAL">Critical</option><option value="RETIRED">Retired</option></select></div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-charcoal-200">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-medium text-charcoal-500 bg-charcoal-50 hover:bg-charcoal-100 rounded-lg border border-charcoal-200 transition-colors">Cancel</button>
                <button type="submit" disabled={creating} className="flex items-center gap-2 px-5 py-2 bg-navy-900 hover:bg-navy-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50">
                  {creating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetInventoryPage;
