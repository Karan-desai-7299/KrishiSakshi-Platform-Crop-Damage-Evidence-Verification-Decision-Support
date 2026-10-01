import mongoose from 'mongoose';

const damageClusterSchema = new mongoose.Schema({
  clusterId: { type: String, required: true, unique: true },
  eventId: { type: String, required: true },
  regionId: { type: String, default: 'KOLHAPUR_DISTRICT' },
  center: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  reportIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DamageReport' }],
  reportCount: { type: Number, required: true },
  dominantCrop: { type: String, required: true },
  dominantDamageType: { type: String, required: true },
  timeSpread: {
    earliestReport: Date,
    latestReport: Date,
    spreadHours: Number
  },
  priorityScore: { type: Number, required: true },
  priorityLevel: { 
    type: String, 
    enum: ['HIGH', 'MEDIUM', 'LOW'], 
    required: true 
  },
  reasons: [{ type: String }],
  satellite: {
    signal: { type: String, default: 'Consistent with possible surface change' },
    confidence: { type: String, default: 'Moderate' },
    badge: { type: String, default: 'SIMULATED — prototype only' }
  },
  assignedOfficerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verificationStatus: { 
    type: String, 
    enum: ['PENDING', 'ASSIGNED', 'COMPLETED'], 
    default: 'PENDING' 
  },
  isDemo: { type: Boolean, default: true }
}, {
  timestamps: true
});

damageClusterSchema.index({ center: '2dsphere' });
damageClusterSchema.index({ eventId: 1, priorityLevel: 1 });

export default mongoose.models.DamageCluster || mongoose.model('DamageCluster', damageClusterSchema);
