const mongoose = require('mongoose');
const Asset = require('../models/Asset');
const Maintenance = require('../models/Maintenance');
const LifecycleEvent = require('../models/LifecycleEvent');

// @desc    Get all maintenance tickets across all assets with filters
// @route   GET /api/maintenance
// @access  Private (All roles)
const getAllMaintenance = async (req, res, next) => {
  try {
    const { status, priority, assetType, district, q } = req.query;

    const query = {};
    if (status && status !== 'ALL') query.status = status;
    if (priority && priority !== 'ALL') query.priority = priority;

    let assetFilter = {};
    if (assetType && assetType !== 'ALL') assetFilter.assetType = assetType;
    if (district && district !== 'ALL') assetFilter.district = district;

    let matchingAssetIds = null;
    if (Object.keys(assetFilter).length > 0 || (q && q.trim())) {
      const assetQuery = { ...assetFilter };
      if (q && q.trim()) {
        const searchRegex = new RegExp(q.trim(), 'i');
        assetQuery.$or = [
          { assetId: searchRegex },
          { name: searchRegex },
          { district: searchRegex },
        ];
      }
      const matchingAssets = await Asset.find(assetQuery).select('_id');
      matchingAssetIds = matchingAssets.map((a) => a._id);
      query.asset = { $in: matchingAssetIds };
    }

    const tickets = await Maintenance.find(query)
      .populate('asset', 'assetId assetCode assetType name district condition status location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get maintenance tickets for a specific asset
// @route   GET /api/assets/:id/maintenance
// @access  Private (All roles)
const getAssetMaintenance = async (req, res, next) => {
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

    const tickets = await Maintenance.find({ asset: asset._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new maintenance ticket
// @route   POST /api/assets/:id/maintenance
// @access  Private (ADMIN, FIELD_INSPECTOR, MAINTENANCE_OFFICER)
const createMaintenance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      issueType,
      description,
      priority,
      assignedTo,
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

    if (!issueType || !description) {
      return res.status(400).json({
        success: false,
        message: 'Issue type and description are required.',
      });
    }

    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `TKT-${year}-${randomNum}`;

    const initialStatus = assignedTo && assignedTo.trim() !== 'Unassigned' ? 'ASSIGNED' : 'OPEN';

    const ticket = await Maintenance.create({
      ticketId,
      asset: asset._id,
      issueType,
      description,
      priority: priority || 'MEDIUM',
      assignedTo: assignedTo || 'Unassigned',
      status: initialStatus,
      reportedBy: {
        id: req.user._id,
        name: req.user.name,
        role: req.user.role,
      },
      reportedAt: new Date(),
    });

    // Update asset status to UNDER_MAINTENANCE
    asset.status = 'UNDER_MAINTENANCE';
    await asset.save();

    // Create lifecycle event
    await LifecycleEvent.create({
      asset: asset._id,
      eventType: initialStatus === 'ASSIGNED' ? 'MAINTENANCE_ASSIGNED' : 'ISSUE_DETECTED',
      title: initialStatus === 'ASSIGNED' ? `Maintenance Assigned (${ticketId})` : `Maintenance Request Created (${ticketId})`,
      description: `${issueType}: ${description}. Assigned to: ${ticket.assignedTo}. Priority: ${ticket.priority}.`,
      performedBy: {
        name: req.user.name,
        role: req.user.role,
        email: req.user.email,
      },
      metadata: {
        ticketId,
        priority: ticket.priority,
        assignedTo: ticket.assignedTo,
        status: ticket.status,
      },
      eventDate: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance ticket created successfully',
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update maintenance ticket workflow (Assign, Start repair, Resolve)
// @route   PUT /api/maintenance/:id
// @access  Private (ADMIN, MAINTENANCE_OFFICER)
const updateMaintenance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      status,
      assignedTo,
      priority,
      resolutionNotes,
      repairCost,
      finalCondition,
    } = req.body;

    const ticket = await Maintenance.findById(id).populate('asset');
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance ticket not found',
      });
    }

    const previousStatus = ticket.status;
    const asset = await Asset.findById(ticket.asset._id);

    if (assignedTo) ticket.assignedTo = assignedTo;
    if (priority) ticket.priority = priority;

    // Workflow status transitions
    if (status && status !== previousStatus) {
      ticket.status = status;

      // 1. Transition: OPEN -> ASSIGNED
      if (status === 'ASSIGNED') {
        await LifecycleEvent.create({
          asset: asset._id,
          eventType: 'MAINTENANCE_ASSIGNED',
          title: `Maintenance Work Order Assigned`,
          description: `Ticket ${ticket.ticketId} assigned to engineering contractor/crew '${ticket.assignedTo}'.`,
          performedBy: {
            name: req.user.name,
            role: req.user.role,
            email: req.user.email,
          },
          metadata: {
            ticketId: ticket.ticketId,
            assignedTo: ticket.assignedTo,
          },
          eventDate: new Date(),
        });
      }

      // 2. Transition: -> IN_PROGRESS
      if (status === 'IN_PROGRESS') {
        ticket.startedAt = new Date();
        await LifecycleEvent.create({
          asset: asset._id,
          eventType: 'REPAIR_STARTED',
          title: `Infrastructure Repair Works Commenced`,
          description: `On-site repair operations officially commenced for ${ticket.issueType} by ${ticket.assignedTo}.`,
          performedBy: {
            name: req.user.name,
            role: req.user.role,
            email: req.user.email,
          },
          metadata: {
            ticketId: ticket.ticketId,
            startedAt: ticket.startedAt,
          },
          eventDate: new Date(),
        });
      }

      // 3. Transition: -> RESOLVED
      if (status === 'RESOLVED') {
        ticket.resolvedAt = new Date();
        ticket.resolutionNotes = resolutionNotes || ticket.resolutionNotes || 'Repair completed according to MoRTH specifications.';
        ticket.repairCost = repairCost !== undefined ? Number(repairCost) : ticket.repairCost;
        ticket.finalCondition = finalCondition || 'GOOD';

        // Update the asset condition and return to OPERATIONAL
        const previousAssetStatus = asset.status;
        const previousAssetCondition = asset.condition;

        asset.status = 'OPERATIONAL';
        asset.condition = ticket.finalCondition;
        asset.lastInspectionDate = new Date();
        asset.nextInspectionDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);
        await asset.save();

        // Lifecycle: REPAIR_COMPLETED
        await LifecycleEvent.create({
          asset: asset._id,
          eventType: 'REPAIR_COMPLETED',
          title: `Repair & Rehabilitation Completed`,
          description: `Work order ${ticket.ticketId} completed. ${ticket.resolutionNotes}. Total repair cost: INR ${(ticket.repairCost || 0).toLocaleString('en-IN')}. Assessed condition: ${ticket.finalCondition}.`,
          performedBy: {
            name: req.user.name,
            role: req.user.role,
            email: req.user.email,
          },
          metadata: {
            ticketId: ticket.ticketId,
            repairCost: ticket.repairCost,
            finalCondition: ticket.finalCondition,
            resolutionNotes: ticket.resolutionNotes,
          },
          eventDate: new Date(),
        });

        // Lifecycle: STATUS_CHANGED to OPERATIONAL
        await LifecycleEvent.create({
          asset: asset._id,
          eventType: 'STATUS_CHANGED',
          title: `Asset Returned to OPERATIONAL Status`,
          description: `Asset ${asset.assetId} rehabilitated from ${previousAssetStatus} (${previousAssetCondition}) to OPERATIONAL (${asset.condition}).`,
          performedBy: {
            name: req.user.name,
            role: req.user.role,
            email: req.user.email,
          },
          metadata: {
            previousStatus: previousAssetStatus,
            newStatus: 'OPERATIONAL',
            condition: asset.condition,
          },
          eventDate: new Date(),
        });
      }
    }

    await ticket.save();

    res.json({
      success: true,
      message: `Maintenance ticket status updated to ${ticket.status}`,
      data: {
        ticket,
        updatedAsset: asset,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMaintenance,
  getAssetMaintenance,
  createMaintenance,
  updateMaintenance,
};
