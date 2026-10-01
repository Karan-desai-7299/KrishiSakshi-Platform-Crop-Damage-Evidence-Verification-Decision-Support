import mongoose from 'mongoose';

const weatherEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true }, // EVT-YYYY-XXXX
  type: { type: String, default: 'HEAVY_RAINFALL' },
  regionId: { type: String, required: true },
  regionName: { type: String, required: true },
  locations: [{
    name: String,
    lat: Number,
    lng: Number
  }],
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  rainfallByLocation: [{
    locationName: String,
    latitude: Number,
    longitude: Number,
    gridLatitude: Number,
    gridLongitude: Number,
    elevation: Number,
    cumulativeRainfallMm: Number,
    maxSingleDayMm: Number,
    thresholdExceeded: Boolean,
    dailyPrecipitation: [{
      date: String,
      rainfallMm: Number
    }]
  }],
  thresholdMm: { type: Number, required: true },
  source: { type: String, default: 'Gridded reanalysis estimate (Open-Meteo)' },
  status: { type: String, enum: ['ALERT_READY', 'ALERT_SENT', 'ARCHIVED'], default: 'ALERT_READY' },
  isDemo: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.models.WeatherEvent || mongoose.model('WeatherEvent', weatherEventSchema);
