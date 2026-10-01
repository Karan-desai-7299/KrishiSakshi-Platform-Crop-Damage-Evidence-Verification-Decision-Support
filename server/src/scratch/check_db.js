import mongoose from 'mongoose';
import DamageReport from '../models/DamageReport.js';
import WeatherEvent from '../models/WeatherEvent.js';

await mongoose.connect('mongodb://127.0.0.1:27017/krishisakshi');
const totalReports = await DamageReport.countDocuments();
const totalEvents = await WeatherEvent.countDocuments();
const events = await WeatherEvent.find({});
const sampleReports = await DamageReport.find({}).limit(5);

const latestEvent = await WeatherEvent.findOne({ regionId: 'KOLHAPUR_DISTRICT' }).sort({ createdAt: -1 });
console.log('Latest event:', latestEvent?.eventId, latestEvent?.createdAt);

const countsByEvent = await DamageReport.aggregate([
  { $group: { _id: '$eventId', count: { $sum: 1 } } }
]);
console.log('Reports grouped by eventId:', countsByEvent);

await mongoose.disconnect();
