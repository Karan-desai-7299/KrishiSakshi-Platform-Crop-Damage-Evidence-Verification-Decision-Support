import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import Farm from '../models/Farm.js';
import DamageReport from '../models/DamageReport.js';
import Evidence from '../models/Evidence.js';
import DamageCluster from '../models/DamageCluster.js';
import Verification from '../models/Verification.js';
import WeatherEvent from '../models/WeatherEvent.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import Counter from '../models/Counter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krishisakshi';

// 8 Cluster Centers across Kolhapur District [lng, lat]
const CLUSTER_CENTERS = [
  { name: 'Shiroli North', center: [74.250, 16.715], village: 'Shiroli', crop: 'Soybean', damage: 'Waterlogging', count: 18 },
  { name: 'Uchgaon East', center: [74.270, 16.690], village: 'Uchgaon', crop: 'Sugarcane', damage: 'Flood', count: 14 },
  { name: 'Kagal South Basin', center: [74.320, 16.580], village: 'Kagal', crop: 'Soybean', damage: 'Heavy rain', count: 22 },
  { name: 'Panhala Foothills', center: [74.115, 16.805], village: 'Panhala', crop: 'Rice', damage: 'Waterlogging', count: 12 },
  { name: 'Kodoli Valley', center: [74.180, 16.850], village: 'Kodoli', crop: 'Sugarcane', damage: 'Strong wind', count: 8 },
  { name: 'Shirol Krishna Basin', center: [74.605, 16.740], village: 'Shirol', crop: 'Rice', damage: 'Flood', count: 15 },
  { name: 'Gadhinglaj Plains', center: [74.350, 16.230], village: 'Gadhinglaj', crop: 'Soybean', damage: 'Waterlogging', count: 7 },
  { name: 'Nesari Outskirts', center: [74.330, 16.150], village: 'Nesari', crop: 'Cotton', damage: 'Heavy rain', count: 5 }
];

// Scattered locations [lng, lat]
const SCATTERED_COORDS = [
  [74.210, 16.680], [74.360, 16.620], [74.150, 16.770], [74.520, 16.710],
  [74.410, 16.280], [74.280, 16.450], [74.450, 16.350], [74.230, 16.820]
];

const MARATHI_FARMER_NAMES = [
  'Ram Patil', 'Tukaram Shinde', 'Dnyaneshwar Jadhav', 'Ananda Gaikwad', 'Vishnu Kamble',
  'Baburao Bhosale', 'Pandurang Chavan', 'Namdeo More', 'Santosh Pawar', 'Shivaji Mane',
  'Balasaheb Deshmukh', 'Maruti Kadam', 'Suresh Salunkhe', 'Ganesh Sawant', 'Ashok Jagtap',
  'Tanaji Mohite', 'Rajaram Ghorpade', 'Kisanrao Shinde', 'Mahadev Patil', 'Govind Jadhav',
  'Babanrao Nikam', 'Vithalrao Shinde', 'Dattatray Thorat', 'Kashinath Maske', 'Uttamrao Suryavanshi',
  'Shankar Mali', 'Prakash Bhandare', 'Ramesh Nalawade', 'Bhagwan Shedge', 'Sunil Kumbhar',
  'Nivas Chougule', 'Sudhakar Shirole', 'Vasantrao Magdum', 'Jagannath Powar', 'Bhikaji Desai',
  'Dinkar Khot', 'Gopalrao Powar', 'Laxman Dange', 'Sadashiv Bandgar', 'Shrikant Sutar',
  'Vijayrao Gholap', 'Arjun Waghmare', 'Kundlik Lohar', 'Sambhaji Shinde', 'Haribhau Koli',
  'Abhiman Patil', 'Narayan Dhonde', 'Raosaheb Ghadge', 'Kalyanrao Tambe', 'Chandrakant Khade'
];

export async function seedDatabase() {
  console.log('[Seed] Connecting to MongoDB:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  console.log('[Seed] Clearing existing demo records (isDemo: true)...');
  await User.deleteMany({ isDemo: true });
  await Farm.deleteMany({ isDemo: true });
  await DamageReport.deleteMany({ isDemo: true });
  await Evidence.deleteMany({ isDemo: true });
  await DamageCluster.deleteMany({ isDemo: true });
  await Verification.deleteMany({ isDemo: true });
  await WeatherEvent.deleteMany({ isDemo: true });
  await Notification.deleteMany({ demoMode: true });
  await AuditLog.deleteMany({});
  await Counter.deleteMany({});

  console.log('[Seed] Resetting Case and Event Counters...');
  await Counter.create({ name: 'case_2026', seq: 0 });
  await Counter.create({ name: 'event_2026', seq: 0 });

  // 1. Seed Demo Officer
  console.log('[Seed] Creating Demo Officer (Sanjay Deshmukh)...');
  const demoOfficer = await User.create({
    name: 'Sanjay Deshmukh',
    phone: '9999954321', // Masked as 99999XXXXX
    role: 'OFFICER',
    district: 'Kolhapur',
    taluka: 'District HQ',
    village: 'Kolhapur Center',
    language: 'en',
    isDemo: true
  });

  // 2. Seed 50 Farmers (including Demo Farmer Ram Patil)
  console.log('[Seed] Creating 50 Farmers...');
  const users = [];
  for (let i = 0; i < 50; i++) {
    const isDemoFarmer = i === 0;
    const name = MARATHI_FARMER_NAMES[i] || `Farmer ${i + 1}`;
    const village = CLUSTER_CENTERS[i % CLUSTER_CENTERS.length].village;
    const phone = isDemoFarmer ? '9999912345' : `99999${String(10000 + i).padStart(5, '0')}`;

    const user = await User.create({
      name,
      phone,
      role: 'FARMER',
      district: 'Kolhapur',
      taluka: i % 2 === 0 ? 'Karveer' : 'Kagal',
      village,
      language: 'mr',
      isDemo: true
    });
    users.push(user);
  }

  // 3. Seed 50 Farms (with GeoJSON Points)
  console.log('[Seed] Creating 50 Farms with 2dsphere locations...');
  const farms = [];
  for (let i = 0; i < users.length; i++) {
    const cluster = CLUSTER_CENTERS[i % CLUSTER_CENTERS.length];
    // Add jitter within ~500m of cluster center
    const lngJitter = (Math.random() - 0.5) * 0.008;
    const latJitter = (Math.random() - 0.5) * 0.008;
    const coords = [
      Math.round((cluster.center[0] + lngJitter) * 1000000) / 1000000,
      Math.round((cluster.center[1] + latJitter) * 1000000) / 1000000
    ];

    const farm = await Farm.create({
      farmerId: users[i]._id,
      crop: cluster.crop,
      areaAcres: Math.round((1.5 + Math.random() * 5) * 10) / 10,
      location: {
        type: 'Point',
        coordinates: coords
      },
      village: cluster.village,
      isDemo: true
    });
    farms.push(farm);
  }

  // 4. Seed ~100 Damage Reports grouped around 8 cluster centers + scattered reports
  console.log('[Seed] Creating ~100 Damage Reports grouped around 8 cluster centres...');
  const reports = [];
  let caseSeq = 1;

  for (let c = 0; c < CLUSTER_CENTERS.length; c++) {
    const clusterDef = CLUSTER_CENTERS[c];
    for (let j = 0; j < clusterDef.count; j++) {
      const user = users[(c * 6 + j) % users.length];
      const farm = farms[(c * 6 + j) % farms.length];

      // Jitter around cluster center within ~800m
      const lngJitter = (Math.random() - 0.5) * 0.012;
      const latJitter = (Math.random() - 0.5) * 0.012;
      const coords = [
        Math.round((clusterDef.center[0] + lngJitter) * 1000000) / 1000000,
        Math.round((clusterDef.center[1] + latJitter) * 1000000) / 1000000
      ];

      const caseId = `KS-2026-${String(caseSeq).padStart(6, '0')}`;
      caseSeq++;

      const report = await DamageReport.create({
        caseId,
        farmerId: user._id,
        farmId: farm._id,
        regionId: 'KOLHAPUR_DISTRICT',
        eventId: null, // Nullable until attached to replay event
        crop: clusterDef.crop,
        damageType: clusterDef.damage,
        location: {
          type: 'Point',
          coordinates: coords
        },
        photo: {
          filename: `photo_${caseId}.jpg`,
          url: `/uploads/mock_crop_${(caseSeq % 4) + 1}.jpg`,
          timestamp: new Date(Date.now() - Math.random() * 86400000 * 2),
          location: coords
        },
        description: `${clusterDef.damage} affected ${clusterDef.crop} crop severely in ${clusterDef.village}.`,
        status: caseSeq <= 15 ? 'Verification Completed' : caseSeq <= 30 ? 'Field Verification' : caseSeq <= 50 ? 'Under Review' : 'Report Submitted',
        priorityScore: 0, // Computed by priorityService in Phase 5
        reportedAt: new Date(Date.now() - Math.random() * 86400000 * 3),
        effectiveReportedAt: new Date(Date.now() - Math.random() * 86400000 * 3),
        isDemo: true
      });
      reports.push(report);
    }
  }

  // Add 8 scattered reports
  for (let s = 0; s < SCATTERED_COORDS.length; s++) {
    const user = users[s % users.length];
    const caseId = `KS-2026-${String(caseSeq).padStart(6, '0')}`;
    caseSeq++;

    const report = await DamageReport.create({
      caseId,
      farmerId: user._id,
      farmId: farms[s]._id,
      regionId: 'KOLHAPUR_DISTRICT',
      eventId: null,
      crop: 'Soybean',
      damageType: 'Waterlogging',
      location: {
        type: 'Point',
        coordinates: SCATTERED_COORDS[s]
      },
      description: 'Isolated crop inundation report.',
      status: 'Report Submitted',
      reportedAt: new Date(Date.now() - Math.random() * 86400000),
      effectiveReportedAt: new Date(Date.now() - Math.random() * 86400000),
      isDemo: true
    });
    reports.push(report);
  }

  // Update case counter to match generated cases
  await Counter.findOneAndUpdate({ name: 'case_2026' }, { seq: caseSeq - 1 });
  console.log(`[Seed] Seeded total ${reports.length} Damage Reports.`);

  // 5. Seed Evidence Records for reports
  console.log('[Seed] Seeding Evidence records...');
  for (let i = 0; i < Math.min(reports.length, 40); i++) {
    const rep = reports[i];
    await Evidence.create({
      reportId: rep._id,
      caseId: rep.caseId,
      type: 'FARMER',
      source: 'Farmer Mobile Submission',
      timestamp: rep.reportedAt,
      location: rep.location,
      data: { photoPresent: true, gpsAccuracyMeters: 8 },
      isDemo: true
    });

    await Evidence.create({
      reportId: rep._id,
      caseId: rep.caseId,
      type: 'WEATHER',
      source: 'Gridded reanalysis estimate (Open-Meteo)',
      timestamp: rep.reportedAt,
      location: rep.location,
      data: { rainfallMm: 120, thresholdMm: 100, thresholdExceeded: true },
      isDemo: true
    });

    await Evidence.create({
      reportId: rep._id,
      caseId: rep.caseId,
      type: 'SATELLITE',
      source: 'Simulated SAR Layer',
      timestamp: rep.reportedAt,
      location: rep.location,
      data: { signal: 'Consistent with possible surface change', badge: 'SIMULATED — prototype only' },
      isDemo: true
    });
  }

  // 6. Seed 20 Verification Records
  console.log('[Seed] Seeding 20 Verification records...');
  const verifStatuses = ['Verified', 'Partially Verified', 'Needs More Information', 'Not Observed'];
  for (let v = 0; v < 20; v++) {
    const rep = reports[v];
    const status = verifStatuses[v % verifStatuses.length];

    await Verification.create({
      caseId: rep.caseId,
      officerId: demoOfficer._id,
      status,
      notes: `Official field inspection conducted at ${rep.location.coordinates.join(', ')}. Outcome: ${status}.`,
      photos: [{
        filename: `field_inspection_${v + 1}.jpg`,
        url: `/uploads/field_inspection_${(v % 3) + 1}.jpg`,
        timestamp: new Date(),
        location: rep.location.coordinates
      }],
      verifiedAt: new Date(Date.now() - (20 - v) * 3600000),
      isDemo: true
    });

    // Create AuditLog entry
    await AuditLog.create({
      actor: {
        userId: demoOfficer._id,
        name: demoOfficer.name,
        role: demoOfficer.role
      },
      action: 'STATUS_CHANGED',
      targetId: rep.caseId,
      metadata: { newStatus: status, officerNotes: `Field verification saved: ${status}` }
    });
  }

  // 7. Seed 5 Historical Weather Events
  console.log('[Seed] Seeding 5 Historical WeatherEvent records...');
  const demoEvents = [
    { id: 'EVT-2024-0001', start: '2024-07-22', end: '2024-07-26', thresh: 100, desc: 'July 2024 Extreme Monsoon Cloudburst' },
    { id: 'EVT-2024-0002', start: '2024-06-06', end: '2024-06-10', thresh: 100, desc: 'June 2024 Monsoon Onset Inundation' },
    { id: 'EVT-2023-0001', start: '2023-07-18', end: '2023-07-22', thresh: 90, desc: 'July 2023 Panchaganga River Surge' },
    { id: 'EVT-2022-0001', start: '2022-08-10', end: '2022-08-14', thresh: 110, desc: 'August 2022 Heavy Inundation' },
    { id: 'EVT-2021-0001', start: '2021-07-21', end: '2021-07-25', thresh: 120, desc: 'July 2021 Historical Kolhapur Floods' }
  ];

  for (let e = 0; e < demoEvents.length; e++) {
    const dev = demoEvents[e];
    await WeatherEvent.create({
      eventId: dev.id,
      type: 'HEAVY_RAINFALL',
      regionId: 'KOLHAPUR_DISTRICT',
      regionName: 'Kolhapur District',
      locations: [
        { name: 'Kolhapur', lat: 16.705, lng: 74.243 },
        { name: 'Kagal', lat: 16.576, lng: 74.314 },
        { name: 'Panhala', lat: 16.810, lng: 74.110 },
        { name: 'Shirol', lat: 16.737, lng: 74.597 },
        { name: 'Gadhinglaj', lat: 16.226, lng: 74.346 }
      ],
      startDate: dev.start,
      endDate: dev.end,
      thresholdMm: dev.thresh,
      source: 'Gridded reanalysis estimate (Open-Meteo)',
      status: 'ALERT_SENT',
      isDemo: true
    });
  }

  console.log('[Seed] Seed script completed successfully!');
  console.log(`[Seed] Summary:
    - 1 Demo Officer: Sanjay Deshmukh (phone: 99999XXXXX)
    - 50 Farmers (including Demo Farmer Ram Patil: 99999XXXXX)
    - 50 Farms (with 2dsphere indexes)
    - ${reports.length} Damage Reports (across 8 cluster centres + scattered)
    - 40 Evidence records
    - 20 Verification records
    - 5 Weather Events
    - All records marked with isDemo: true. No fake claims.`);
}

// Execute directly if run as CLI script
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}
