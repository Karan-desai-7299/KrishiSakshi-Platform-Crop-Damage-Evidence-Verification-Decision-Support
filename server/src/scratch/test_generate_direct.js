import mongoose from 'mongoose';
import { clusterService } from '../services/clusterService.js';

try {
  await mongoose.connect('mongodb://127.0.0.1:27017/krishisakshi');
  console.log('Connected to DB');

  const result = await clusterService.generateClusters({
    radiusM: 1000,
    minReports: 3
  });
  console.log('Clustering result:');
  console.log('Total clusters:', result.totalClusters);
  console.log('Total reports grouped:', result.totalReportsGrouped);
  if (result.clusters.length > 0) {
    console.log('Sample cluster 0 ID:', result.clusters[0].clusterId);
    console.log('Sample cluster 0 priorityScore:', result.clusters[0].priorityScore);
    console.log('Sample cluster 0 reasons:', result.clusters[0].reasons);
  }
} catch (err) {
  console.error('ERROR during clustering:', err);
} finally {
  await mongoose.disconnect();
}
