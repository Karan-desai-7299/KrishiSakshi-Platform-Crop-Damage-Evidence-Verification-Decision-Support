import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true }, // In logs/UI masked as 99999XXXXX
  role: { type: String, enum: ['FARMER', 'OFFICER'], required: true },
  district: { type: String, default: 'Kolhapur' },
  taluka: { type: String, default: 'Karveer' },
  village: { type: String, default: 'Shiroli' },
  language: { type: String, enum: ['mr', 'en'], default: 'mr' },
  isDemo: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model('User', userSchema);
