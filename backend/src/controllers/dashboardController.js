const Asset = require('../models/Asset');
const Maintenance = require('../models/Maintenance');
const LifecycleEvent = require('../models/LifecycleEvent');

// @desc    Get dashboard summary statistics & chart analytics from MongoDB
// @route   GET /api/dashboard/summary
// @access  Private (All roles)
const getDashboardSummary = async (req, res, next) => {
  try {
    const totalAssets = await Asset.countDocuments();
    const operationalAssets = await Asset.countDocuments({ status: 'OPERATIONAL' });
    const maintenanceAssets = await Asset.countDocuments({ status: 'UNDER_MAINTENANCE' });
    const criticalAssets = await Asset.countDocuments({
      $or: [{ status: 'CRITICAL' }, { condition: 'CRITICAL' }],
    });

    // Inspection Due: Next inspection date <= now or null
    const now = new Date();
    const inspectionDue = await Asset.countDocuments({
      $or: [
        { nextInspectionDate: { $lte: now } },
        { nextInspectionDate: null },
        { lastInspectionDate: null },
      ],
    });

    // Counts by Type
    const roadsCount = await Asset.countDocuments({ assetType: 'ROAD' });
    const highwaysCount = await Asset.countDocuments({ assetType: 'HIGHWAY' });
    const bridgesCount = await Asset.countDocuments({ assetType: 'BRIDGE' });

    // Chart 1: Asset Type Distribution
    const assetTypeDistribution = [
      { name: 'Roads', value: roadsCount, code: 'ROAD', color: '#1976A5' },
      { name: 'Highways', value: highwaysCount, code: 'HIGHWAY', color: '#123B5D' },
      { name: 'Bridges', value: bridgesCount, code: 'BRIDGE', color: '#D89B24' },
    ];

    // Chart 2: Asset Status Distribution
    const statusAgg = await Asset.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusMap = statusAgg.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    const assetStatusDistribution = [
      { name: 'Operational', value: statusMap['OPERATIONAL'] || 0, color: '#16803C' },
      { name: 'Under Maintenance', value: statusMap['UNDER_MAINTENANCE'] || 0, color: '#D89B24' },
      { name: 'Critical', value: statusMap['CRITICAL'] || 0, color: '#C53030' },
      { name: 'Under Construction', value: statusMap['UNDER_CONSTRUCTION'] || 0, color: '#3182CE' },
      { name: 'Planned', value: statusMap['PLANNED'] || 0, color: '#805AD5' },
      { name: 'Retired', value: statusMap['RETIRED'] || 0, color: '#718096' },
    ];

    // Chart 3: Asset Condition Distribution
    const conditionAgg = await Asset.aggregate([
      { $group: { _id: '$condition', count: { $sum: 1 } } },
    ]);
    const conditionMap = conditionAgg.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    const assetConditionDistribution = [
      { name: 'Excellent', value: conditionMap['EXCELLENT'] || 0, color: '#16803C' },
      { name: 'Good', value: conditionMap['GOOD'] || 0, color: '#2B6CB0' },
      { name: 'Fair', value: conditionMap['FAIR'] || 0, color: '#D89B24' },
      { name: 'Poor', value: conditionMap['POOR'] || 0, color: '#DD6B20' },
      { name: 'Critical', value: conditionMap['CRITICAL'] || 0, color: '#C53030' },
    ];

    // Chart 4: Maintenance Status Distribution
    const maintenanceAgg = await Maintenance.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const maintenanceMap = maintenanceAgg.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    const maintenanceStatusDistribution = [
      { name: 'Open', value: maintenanceMap['OPEN'] || 0, color: '#E53E3E' },
      { name: 'Assigned', value: maintenanceMap['ASSIGNED'] || 0, color: '#DD6B20' },
      { name: 'In Progress', value: maintenanceMap['IN_PROGRESS'] || 0, color: '#3182CE' },
      { name: 'Resolved', value: maintenanceMap['RESOLVED'] || 0, color: '#38A169' },
    ];

    // Chart 5: District-wise Asset Distribution
    const districtAgg = await Asset.aggregate([
      { $group: { _id: '$district', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);
    const districtDistribution = districtAgg.map((item) => ({
      district: item._id,
      count: item.count,
    }));

    res.json({
      success: true,
      data: {
        kpis: {
          totalAssets,
          operational: operationalAssets,
          underMaintenance: maintenanceAssets,
          critical: criticalAssets,
          inspectionDue,
          breakdown: {
            roads: roadsCount,
            highways: highwaysCount,
            bridges: bridgesCount,
          },
        },
        charts: {
          assetTypeDistribution,
          assetStatusDistribution,
          assetConditionDistribution,
          maintenanceStatusDistribution,
          districtDistribution,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent lifecycle events activity
// @route   GET /api/dashboard/activity
// @access  Private (All roles)
const getDashboardActivity = async (req, res, next) => {
  try {
    const activities = await LifecycleEvent.find()
      .populate('asset', 'assetId assetCode assetType name district condition status')
      .sort({ eventDate: -1, createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get critical and high-attention assets
// @route   GET /api/dashboard/critical-assets
// @access  Private (All roles)
const getCriticalAssets = async (req, res, next) => {
  try {
    const criticalAssets = await Asset.find({
      $or: [
        { condition: { $in: ['CRITICAL', 'POOR'] } },
        { status: { $in: ['CRITICAL', 'UNDER_MAINTENANCE'] } },
      ],
    })
      .sort({ condition: 1, lastInspectionDate: 1 })
      .limit(10);

    res.json({
      success: true,
      count: criticalAssets.length,
      data: criticalAssets,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getDashboardActivity,
  getCriticalAssets,
};
