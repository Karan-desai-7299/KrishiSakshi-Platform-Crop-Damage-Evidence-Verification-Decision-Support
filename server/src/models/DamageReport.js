import mongoose from 'mongoose';

const damageReportSchema = new mongoose.Schema({
  caseId: { type: String, required: true, unique: true }, // KS-YYYY-XXXXXX
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm' },
  regionId: { type: String, required: true, default: 'KOLHAPUR_DISTRICT' },
  eventId: { type: String, default: null }, // Nullable until attached to replay event
  crop: { 
    type: String, 
    required: true,
    enum: ['Soybean', 'Rice', 'Sugarcane', 'Cotton', 'Other'] 
  },
  damageType: { 
    type: String, 
    required: true,
    enum: ['Heavy rain', 'Flood', 'Waterlogging', 'Hailstorm', 'Strong wind', 'Drought', 'Other']
  },
  location: {
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
  photo: {
    filename: String,
    url: String,
    timestamp: Date,
    location: [Number]
  },
  description: { type: String, default: '' },
  status: { 
    type: String, 
    enum: [
      'Report Submitted', 
      'Under Review', 
      'Field Verification', 
      'Verification Completed', 
      'Needs More Information'
    ], 
    default: 'Report Submitted' 
  },
  priorityScore: { type: Number, default: 0 },
  reportedAt: { type: Date, default: Date.now },
  effectiveReportedAt: { type: Date, default: Date.now }, // Used for replay time mechanics
  isDemo: { type: Boolean, default: true }
}, {
  timestamps: true
});

damageReportSchema.index({ location: '2dsphere' });
damageReportSchema.index({ eventId: 1, regionId: 1 });

export default mongoose.models.DamageReport || mongoose.model('DamageReport', damageReportSchema);
