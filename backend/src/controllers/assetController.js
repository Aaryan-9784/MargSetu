const mongoose = require('mongoose');
const Asset = require('../models/Asset');
const LifecycleEvent = require('../models/LifecycleEvent');
const Inspection = require('../models/Inspection');
const Maintenance = require('../models/Maintenance');

// @desc    Get all assets with filtering & search
// @route   GET /api/assets
// @access  Private (All authenticated roles)
const getAssets = async (req, res, next) => {
  try {
    const { q, assetType, status, condition, district, sort } = req.query;

    const query = {};

    if (assetType && assetType !== 'ALL') {
      query.assetType = assetType;
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (condition && condition !== 'ALL') {
      query.condition = condition;
    }

    if (district && district !== 'ALL') {
      query.district = district;
    }

    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      query.$or = [
        { assetId: searchRegex },
        { assetCode: searchRegex },
        { name: searchRegex },
        { district: searchRegex },
        { area: searchRegex },
        { 'assetSpecificDetails.roadNumber': searchRegex },
        { 'assetSpecificDetails.highwayNumber': searchRegex },
        { 'assetSpecificDetails.bridgeNumber': searchRegex },
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'name_asc') sortOptions = { name: 1 };
    if (sort === 'name_desc') sortOptions = { name: -1 };
    if (sort === 'cost_desc') sortOptions = { estimatedCost: -1 };
    if (sort === 'inspection_due') sortOptions = { nextInspectionDate: 1 };

    const assets = await Asset.find(query).sort(sortOptions);
    const total = await Asset.countDocuments(query);

    res.json({
      success: true,
      count: assets.length,
      total,
      data: assets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single asset by ID or assetId (e.g. BR-014)
// @route   GET /api/assets/:id
// @access  Private (All authenticated roles)
const getAssetById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let asset;
    if (mongoose.Types.ObjectId.isValid(id)) {
      asset = await Asset.findById(id).populate('createdBy', 'name email role');
    }

    if (!asset) {
      asset = await Asset.findOne({
        assetId: id.toUpperCase().trim(),
      }).populate('createdBy', 'name email role');
    }

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: `Asset not found with identifier '${id}'`,
      });
    }

    // Retrieve recent inspections and maintenance
    const inspections = await Inspection.find({ asset: asset._id })
      .sort({ inspectionDate: -1 })
      .limit(10);

    const maintenance = await Maintenance.find({ asset: asset._id })
      .sort({ createdAt: -1 })
      .limit(10);

    const lifecycleEvents = await LifecycleEvent.find({ asset: asset._id })
      .sort({ eventDate: -1, createdAt: -1 });

    res.json({
      success: true,
      data: {
        asset,
        inspections,
        maintenance,
        lifecycleEvents,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new asset
// @route   POST /api/assets
// @access  Private (ADMIN only)
const createAsset = async (req, res, next) => {
  try {
    const {
      assetId,
      assetCode,
      assetType,
      name,
      description,
      department,
      state,
      district,
      area,
      location,
      assetSpecificDetails,
      condition,
      status,
      constructionDate,
      operationalDate,
      estimatedCost,
      nextInspectionDate,
    } = req.body;

    if (!assetId || !assetType || !name || !district || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: assetId, assetType, name, district, and location.',
      });
    }

    const existingAsset = await Asset.findOne({
      assetId: assetId.toUpperCase().trim(),
    });

    if (existingAsset) {
      return res.status(400).json({
        success: false,
        message: `Asset with Asset ID '${assetId}' already exists in inventory.`,
      });
    }

    const generatedCode =
      assetCode ||
      `GJ-${district.substring(0, 3).toUpperCase()}-${assetId.toUpperCase().trim()}`;

    // Set default next inspection to 6 months from operational or current date
    const calculatedNextInspection =
      nextInspectionDate ||
      new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

    const newAsset = await Asset.create({
      assetId: assetId.toUpperCase().trim(),
      assetCode: generatedCode,
      assetType,
      name,
      description,
      department: department || 'Roads & Buildings Department, Gujarat',
      state: state || 'Gujarat',
      district,
      area,
      location,
      assetSpecificDetails: assetSpecificDetails || {},
      condition: condition || 'GOOD',
      status: status || 'OPERATIONAL',
      constructionDate: constructionDate || new Date(),
      operationalDate: operationalDate || new Date(),
      estimatedCost: estimatedCost || 0,
      lastInspectionDate: null,
      nextInspectionDate: calculatedNextInspection,
      createdBy: req.user._id,
    });

    // Create automatic REGISTERED lifecycle event
    await LifecycleEvent.create({
      asset: newAsset._id,
      eventType: 'REGISTERED',
      title: `${assetType} Registered in State Inventory`,
      description: `Asset ${newAsset.assetId} (${newAsset.name}) registered under ${newAsset.department}, ${newAsset.district} district.`,
      performedBy: {
        name: req.user.name,
        role: req.user.role,
        email: req.user.email,
      },
      metadata: {
        assetType: newAsset.assetType,
        estimatedCost: newAsset.estimatedCost,
        district: newAsset.district,
        initialCondition: newAsset.condition,
        initialStatus: newAsset.status,
      },
      eventDate: newAsset.operationalDate || new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Asset successfully registered into inventory',
      data: newAsset,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update asset details
// @route   PUT /api/assets/:id
// @access  Private (ADMIN only)
const updateAsset = async (req, res, next) => {
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

    const previousStatus = asset.status;
    const previousCondition = asset.condition;

    const updatedAsset = await Asset.findByIdAndUpdate(
      asset._id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    // If status or condition changed, log a lifecycle event
    if (
      (req.body.status && req.body.status !== previousStatus) ||
      (req.body.condition && req.body.condition !== previousCondition)
    ) {
      await LifecycleEvent.create({
        asset: updatedAsset._id,
        eventType: 'STATUS_CHANGED',
        title: `Asset Status/Condition Updated`,
        description: `Status changed from ${previousStatus} to ${updatedAsset.status}. Condition changed from ${previousCondition} to ${updatedAsset.condition}.`,
        performedBy: {
          name: req.user.name,
          role: req.user.role,
          email: req.user.email,
        },
        metadata: {
          previousStatus,
          newStatus: updatedAsset.status,
          previousCondition,
          newCondition: updatedAsset.condition,
        },
        eventDate: new Date(),
      });
    }

    res.json({
      success: true,
      message: 'Asset updated successfully',
      data: updatedAsset,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete asset and related records
// @route   DELETE /api/assets/:id
// @access  Private (ADMIN only)
const deleteAsset = async (req, res, next) => {
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

    // Cascade delete related records
    await Inspection.deleteMany({ asset: asset._id });
    await Maintenance.deleteMany({ asset: asset._id });
    await LifecycleEvent.deleteMany({ asset: asset._id });
    await Asset.findByIdAndDelete(asset._id);

    res.json({
      success: true,
      message: `Asset ${asset.assetId} and associated records successfully deleted`,
      deletedId: asset._id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
};
