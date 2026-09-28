const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    assetId: {
      type: String,
      required: [true, 'Asset ID is required (e.g. BR-014, RD-101)'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    assetCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    assetType: {
      type: String,
      enum: ['ROAD', 'HIGHWAY', 'BRIDGE'],
      required: [true, 'Asset type must be ROAD, HIGHWAY, or BRIDGE'],
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: 'Roads & Buildings Department, Gujarat',
    },
    state: {
      type: String,
      default: 'Gujarat',
    },
    district: {
      type: String,
      required: [true, 'District is required'],
    },
    area: {
      type: String,
      default: '',
    },
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      startLatitude: Number,
      startLongitude: Number,
      endLatitude: Number,
      endLongitude: Number,
      address: String,
    },
    // Dynamically typed per ROAD, HIGHWAY, or BRIDGE
    assetSpecificDetails: {
      // ROAD fields
      roadNumber: String,
      roadCategory: {
        type: String,
        enum: ['CITY_ROAD', 'DISTRICT_ROAD', 'RURAL_ROAD', 'STATE_ROAD', ''],
      },
      startLocation: String,
      endLocation: String,
      lengthKm: Number,
      widthMeters: Number,
      laneCount: Number,
      surfaceType: {
        type: String,
        enum: ['BITUMINOUS', 'CONCRETE', 'GRAVEL', 'OTHER', ''],
      },

      // HIGHWAY fields
      highwayNumber: String,
      corridorName: String,
      medianType: String,
      pavementType: String,

      // BRIDGE fields
      bridgeNumber: String,
      bridgeName: String,
      crossingType: {
        type: String,
        enum: ['RIVER', 'CANAL', 'RAILWAY', 'ROAD', 'OTHER', ''],
      },
      riverOrCrossing: String,
      lengthMeters: Number,
      structuralType: {
        type: String,
        enum: ['RCC', 'STEEL', 'COMPOSITE', 'OTHER', ''],
      },
      loadCapacityTons: Number,
    },
    condition: {
      type: String,
      enum: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'],
      default: 'GOOD',
      required: true,
    },
    status: {
      type: String,
      enum: [
        'PLANNED',
        'UNDER_CONSTRUCTION',
        'OPERATIONAL',
        'UNDER_MAINTENANCE',
        'CRITICAL',
        'RETIRED',
      ],
      default: 'OPERATIONAL',
      required: true,
    },
    constructionDate: {
      type: Date,
    },
    operationalDate: {
      type: Date,
    },
    estimatedCost: {
      type: Number, // in INR
      default: 0,
    },
    lastInspectionDate: {
      type: Date,
    },
    nextInspectionDate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual index for searching
assetSchema.index({ assetId: 1, name: 'text', district: 1 });

module.exports = mongoose.model('Asset', assetSchema);
