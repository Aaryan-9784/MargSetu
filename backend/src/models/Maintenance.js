const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    issueType: {
      type: String,
      required: [true, 'Issue type is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
      required: true,
    },
    assignedTo: {
      type: String,
      default: 'Unassigned',
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'],
      default: 'OPEN',
      required: true,
    },
    reportedBy: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      name: {
        type: String,
        default: 'System',
      },
      role: {
        type: String,
        default: 'FIELD_INSPECTOR',
      },
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
    startedAt: {
      type: Date,
    },
    resolvedAt: {
      type: Date,
    },
    repairCost: {
      type: Number,
      default: 0,
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    finalCondition: {
      type: String,
      enum: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'],
    },
  },
  {
    timestamps: true,
  }
);

maintenanceSchema.index({ asset: 1, status: 1 });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
