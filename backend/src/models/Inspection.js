const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    inspectionDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    inspector: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      name: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        default: 'FIELD_INSPECTOR',
      },
      email: String,
    },
    condition: {
      type: String,
      enum: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'NONE',
    },
    issueDetected: {
      type: Boolean,
      default: false,
    },
    remarks: {
      type: String,
      default: '',
    },
    recommendation: {
      type: String,
      default: '',
    },
    // Dynamic inspection checklist data
    assetSpecificInspectionData: {
      // Road
      surfaceCondition: String,
      potholesDetected: Boolean,
      potholeCount: Number,
      drainageCondition: String,

      // Highway
      pavementCondition: String,
      laneCondition: String,
      medianCondition: String,
      barrierIntegrity: String,

      // Bridge
      structuralCondition: String,
      deckCondition: String,
      expansionJointCondition: String,
      loadConcern: Boolean,
      substructureHealth: String,
    },
  },
  {
    timestamps: true,
  }
);

inspectionSchema.index({ asset: 1, inspectionDate: -1 });

module.exports = mongoose.model('Inspection', inspectionSchema);
