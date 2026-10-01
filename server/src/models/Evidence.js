import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema({
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'DamageReport', required: true },
  caseId: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['FARMER', 'WEATHER', 'SATELLITE', 'OFFICER'], 
    required: true 
  },
  source: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number] // [longitude, latitude]
  },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  isDemo: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.models.Evidence || mongoose.model('Evidence', evidenceSchema);
