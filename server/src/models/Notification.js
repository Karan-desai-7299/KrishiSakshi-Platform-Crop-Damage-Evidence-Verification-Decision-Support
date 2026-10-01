import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: String, default: 'ALL_FARMERS_IN_REGION' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'WEATHER_ALERT' },
  channel: { type: String, enum: ['SMS', 'IVR', 'IN_APP'], default: 'SMS' },
  demoMode: { type: Boolean, default: true },
  eventId: { type: String }
}, {
  timestamps: true
});

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
