const Asset = require('../models/Asset');
const LifecycleEvent = require('../models/LifecycleEvent');

// @desc    Get chronological lifecycle events for an asset
// @route   GET /api/assets/:id/lifecycle
// @access  Private (All roles)
const getAssetLifecycle = async (req, res, next) => {
  try {
    const { id } = req.params;

    let asset = await Asset.findById(id);
    if (!asset) {
      asset = await Asset.findOne({ assetId: id.toUpperCase().trim() });
    }

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: `Asset not found with id '${id}'`,
      });
    }

    const events = await LifecycleEvent.find({ asset: asset._id }).sort({
      eventDate: 1,
      createdAt: 1,
    });

    res.json({
      success: true,
      count: events.length,
      asset: {
        id: asset._id,
        assetId: asset.assetId,
        name: asset.name,
        assetType: asset.assetType,
        condition: asset.condition,
        status: asset.status,
      },
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all lifecycle events across all assets (for Lifecycle Analytics)
// @route   GET /api/lifecycle
// @access  Private (All roles)
const getAllLifecycleEvents = async (req, res, next) => {
  try {
    const { eventType, assetType, district, limit = 50 } = req.query;

    const query = {};
    if (eventType && eventType !== 'ALL') {
      query.eventType = eventType;
    }

    let assetFilter = {};
    if (assetType && assetType !== 'ALL') assetFilter.assetType = assetType;
    if (district && district !== 'ALL') assetFilter.district = district;

    if (Object.keys(assetFilter).length > 0) {
      const matchingAssets = await Asset.find(assetFilter).select('_id');
      query.asset = { $in: matchingAssets.map((a) => a._id) };
    }

    const events = await LifecycleEvent.find(query)
      .populate('asset', 'assetId assetCode assetType name district condition status')
      .sort({ eventDate: -1, createdAt: -1 })
      .limit(Number(limit));

    // Summary of events by type
    const eventTypeCounts = await LifecycleEvent.aggregate([
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      count: events.length,
      eventTypeCounts,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssetLifecycle,
  getAllLifecycleEvents,
};
