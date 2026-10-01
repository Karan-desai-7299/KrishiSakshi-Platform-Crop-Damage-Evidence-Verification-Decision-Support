import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  caseId: { type: String, required: true },
  officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['Verified', 'Partially Verified', 'Needs More Information', 'Not Observed'], 
    required: true 
  },
  notes: { type: String, default: '' },
  photos: [{
    filename: String,
    url: String,
    timestamp: { type: Date, default: Date.now },
    location: [Number]
  }],
  verifiedAt: { type: Date, default: Date.now },
  isDemo: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.models.Verification || mongoose.model('Verification', verificationSchema);
