const mongoose = require('mongoose');

const lifecycleEventSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    eventType: {
      type: String,
      enum: [
        'PLANNED',
        'REGISTERED',
        'UNDER_CONSTRUCTION',
        'CONSTRUCTION_COMPLETED',
        'OPERATIONAL',
        'INSPECTION_COMPLETED',
        'ISSUE_DETECTED',
        'MAINTENANCE_ASSIGNED',
        'REPAIR_STARTED',
        'REPAIR_COMPLETED',
        'RE_INSPECTION_COMPLETED',
        'UPGRADED',
        'REPLACED',
        'RETIRED',
        'STATUS_CHANGED',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    performedBy: {
      name: {
        type: String,
        default: 'System Administrator',
      },
      role: {
        type: String,
        default: 'ADMIN',
      },
      email: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    eventDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

lifecycleEventSchema.index({ asset: 1, eventDate: -1 });
lifecycleEventSchema.index({ eventType: 1 });

module.exports = mongoose.model('LifecycleEvent', lifecycleEventSchema);
