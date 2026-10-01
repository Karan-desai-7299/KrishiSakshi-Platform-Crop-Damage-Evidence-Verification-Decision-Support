import mongoose from 'mongoose';

const farmSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  crop: { type: String, required: true },
  areaAcres: { type: Number, required: true },
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
  village: { type: String, required: true },
  isDemo: { type: Boolean, default: true }
}, {
  timestamps: true
});

farmSchema.index({ location: '2dsphere' });

export default mongoose.models.Farm || mongoose.model('Farm', farmSchema);
