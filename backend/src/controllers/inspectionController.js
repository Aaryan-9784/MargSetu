const mongoose = require('mongoose');
const Asset = require('../models/Asset');
const Inspection = require('../models/Inspection');
const LifecycleEvent = require('../models/LifecycleEvent');

// @desc    Get all inspections for an asset
// @route   GET /api/assets/:id/inspections
// @access  Private (All roles)
const getAssetInspections = async (req, res, next) => {
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

    const inspections = await Inspection.find({ asset: asset._id }).sort({
      inspectionDate: -1,
    });

    res.json({
      success: true,
      count: inspections.length,
      data: inspections,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new inspection for an asset
// @route   POST /api/assets/:id/inspections
// @access  Private (ADMIN, FIELD_INSPECTOR)
const createInspection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      inspectionDate,
      condition,
      severity,
      issueDetected,
      remarks,
      recommendation,
      assetSpecificInspectionData,
    } = req.body;

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

    if (!condition) {
      return res.status(400).json({
        success: false,
        message: 'Inspection condition assessment is required.',
      });
    }

    const inspectDate = inspectionDate ? new Date(inspectionDate) : new Date();
    // Schedule next inspection 6 months out
    const nextInspectDate = new Date(inspectDate.getTime() + 180 * 24 * 60 * 60 * 1000);

    const inspection = await Inspection.create({
      asset: asset._id,
      inspectionDate: inspectDate,
      inspector: {
        id: req.user._id,
        name: req.user.name,
        role: req.user.role,
        email: req.user.email,
      },
      condition,
      severity: severity || (issueDetected ? 'MEDIUM' : 'NONE'),
      issueDetected: Boolean(issueDetected),
      remarks: remarks || '',
      recommendation: recommendation || '',
      assetSpecificInspectionData: assetSpecificInspectionData || {},
    });

    // Update asset condition and inspection dates
    asset.lastInspectionDate = inspectDate;
    asset.nextInspectionDate = nextInspectDate;
    const previousCondition = asset.condition;
    asset.condition = condition;

    // If critical condition or high severity issue detected, mark asset status as CRITICAL
    if (condition === 'CRITICAL' || severity === 'CRITICAL') {
      asset.status = 'CRITICAL';
    } else if (issueDetected && condition === 'POOR' && asset.status === 'OPERATIONAL') {
      asset.status = 'UNDER_MAINTENANCE';
    }

    await asset.save();

    // 1. Create INSPECTION_COMPLETED lifecycle event
    await LifecycleEvent.create({
      asset: asset._id,
      eventType: 'INSPECTION_COMPLETED',
      title: `Field Inspection Completed`,
      description: `Formal physical condition assessment executed by ${req.user.name}. Asset evaluated as '${condition}' (Previously '${previousCondition}').`,
      performedBy: {
        name: req.user.name,
        role: req.user.role,
        email: req.user.email,
      },
      metadata: {
        inspectionId: inspection._id,
        assessedCondition: condition,
        severity: inspection.severity,
        issueDetected: inspection.issueDetected,
        recommendation: inspection.recommendation,
      },
      eventDate: inspectDate,
    });

    // 2. If issue detected, record an ISSUE_DETECTED lifecycle event
    if (issueDetected) {
      await LifecycleEvent.create({
        asset: asset._id,
        eventType: 'ISSUE_DETECTED',
        title: `Structural / Surface Defect Detected`,
        description: `Defect logged during inspection: ${remarks || recommendation || 'Immediate maintenance investigation recommended.'}`,
        performedBy: {
          name: req.user.name,
          role: req.user.role,
          email: req.user.email,
        },
        metadata: {
          inspectionId: inspection._id,
          severity: inspection.severity,
          condition: inspection.condition,
          remarks,
          recommendation,
        },
        eventDate: inspectDate,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Inspection recorded and asset lifecycle updated successfully',
      data: {
        inspection,
        updatedAsset: asset,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssetInspections,
  createInspection,
};
