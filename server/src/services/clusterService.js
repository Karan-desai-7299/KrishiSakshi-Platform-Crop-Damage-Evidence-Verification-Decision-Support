import DamageReport from '../models/DamageReport.js';
import DamageCluster from '../models/DamageCluster.js';
import WeatherEvent from '../models/WeatherEvent.js';
import { getHaversineDistanceMeters } from '../utils/haversine.js';
import { satelliteService } from './satelliteService.js';
import { evidenceService } from './evidenceService.js';
import { priorityService } from './priorityService.js';

export const clusterService = {
  /**
   * Generates or regenerates damage clusters for an event based on proximity
   */
  async generateClusters({
    eventId,
    regionId = 'KOLHAPUR_DISTRICT',
    radiusM = 1000,
    minReports = 3
  }) {
    // 1. Locate the event
    let event = null;
    if (eventId) {
      event = await WeatherEvent.findOne({ eventId });
    }
    if (!event) {
      // Pick the event with the most damage reports in this region
      const topEventAgg = await DamageReport.aggregate([
        { $match: { regionId, eventId: { $ne: null } } },
        { $group: { _id: '$eventId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]);
      if (topEventAgg.length > 0) {
        event = await WeatherEvent.findOne({ eventId: topEventAgg[0]._id });
      }
    }
    if (!event) {
      event = await WeatherEvent.findOne({ regionId }).sort({ endDate: -1 });
    }
    if (!event) {
      throw new Error('No weather event found for clustering. Please select or analyze an event first.');
    }

    const currentEventId = event.eventId;
    const eventEndDate = new Date(event.endDate);

    // 2. Replay Linking Rule:
    // Ensure all unlinked seeded reports in this region are attached to this replay event
    const unlinkedReports = await DamageReport.find({
      regionId,
      eventId: null,
      isDemo: true
    });

    if (unlinkedReports.length > 0) {
      console.log(`[ClusterService] Attaching ${unlinkedReports.length} seeded reports to event ${currentEventId} (replay linking)...`);
      for (const rep of unlinkedReports) {
        // Random 2 to 60 hours after event end
        const randomHours = 2 + Math.random() * 58;
        const effectiveTime = new Date(eventEndDate.getTime() + randomHours * 3600000);
        rep.eventId = currentEventId;
        rep.effectiveReportedAt = effectiveTime;
        await rep.save();
      }
    }

    // 3. Fetch all reports for this event/region (including live demo reports)
    const reports = await DamageReport.find({
      regionId,
      $or: [{ eventId: currentEventId }, { eventId: null }]
    });

    if (reports.length === 0) {
      return {
        clusters: [],
        totalReports: 0,
        eventId: currentEventId,
        message: 'No farmer reports found in the target region.'
      };
    }

    // 4. Proximity Grouping Algorithm (Haversine clustering)
    const parsedRadius = Number(radiusM) || 1000;
    const parsedMinReports = Number(minReports) || 3;

    const visited = new Set();
    const rawClusters = [];

    for (let i = 0; i < reports.length; i++) {
      if (visited.has(reports[i]._id.toString())) continue;

      const clusterMembers = [reports[i]];
      visited.add(reports[i]._id.toString());
      const baseCoord = reports[i].location.coordinates;

      for (let j = 0; j < reports.length; j++) {
        if (i === j || visited.has(reports[j]._id.toString())) continue;

        const targetCoord = reports[j].location.coordinates;
        const distMeters = getHaversineDistanceMeters(baseCoord, targetCoord);

        if (distMeters <= parsedRadius) {
          clusterMembers.push(reports[j]);
          visited.add(reports[j]._id.toString());
        }
      }

      if (clusterMembers.length >= parsedMinReports) {
        rawClusters.push(clusterMembers);
      }
    }

    // 5. Clear previous generated clusters for this event
    await DamageCluster.deleteMany({ eventId: currentEventId });

    // 6. Process each cluster and compute metrics
    const savedClusters = [];

    for (let idx = 0; idx < rawClusters.length; idx++) {
      const memberReports = rawClusters[idx];
      const count = memberReports.length;

      // Compute geometric centroid
      let sumLng = 0;
      let sumLat = 0;
      memberReports.forEach(r => {
        sumLng += r.location.coordinates[0];
        sumLat += r.location.coordinates[1];
      });
      const centerCoords = [
        Math.round((sumLng / count) * 1000000) / 1000000,
        Math.round((sumLat / count) * 1000000) / 1000000
      ];

      // Dominant crop
      const cropCounts = {};
      memberReports.forEach(r => {
        cropCounts[r.crop] = (cropCounts[r.crop] || 0) + 1;
      });
      const dominantCrop = Object.keys(cropCounts).reduce((a, b) => cropCounts[a] > cropCounts[b] ? a : b);

      // Dominant damage type
      const damageCounts = {};
      memberReports.forEach(r => {
        damageCounts[r.damageType] = (damageCounts[r.damageType] || 0) + 1;
      });
      const dominantDamageType = Object.keys(damageCounts).reduce((a, b) => damageCounts[a] > damageCounts[b] ? a : b);
      const dominantDamageRatio = damageCounts[dominantDamageType] / count;

      // Time spread
      const timestamps = memberReports.map(r => new Date(r.effectiveReportedAt || r.reportedAt).getTime());
      const earliestMs = Math.min(...timestamps);
      const latestMs = Math.max(...timestamps);
      const spreadHours = Math.round(((latestMs - earliestMs) / 3600000) * 10) / 10;

      // Reports in 24h window
      const reportsInTimeWindow = memberReports.filter(r => {
        const tMs = new Date(r.effectiveReportedAt || r.reportedAt).getTime();
        return Math.abs(tMs - earliestMs) <= (24 * 3600000);
      }).length;

      // Local rainfall calculation from event data
      let clusterRainfallMm = event.thresholdMm || 100;
      if (event.rainfallByLocation && event.rainfallByLocation.length > 0) {
        // Nearest weather reference location
        let minLocDist = Infinity;
        let nearestRain = clusterRainfallMm;
        event.rainfallByLocation.forEach(loc => {
          const locDist = getHaversineDistanceMeters(centerCoords, [loc.longitude, loc.latitude]);
          if (locDist < minLocDist) {
            minLocDist = locDist;
            nearestRain = loc.cumulativeRainfallMm;
          }
        });
        clusterRainfallMm = nearestRain;
      }

      // Evidence & Satellite evaluations
      const satellite = satelliteService.getSignal(centerCoords, event.endDate);
      const evidence = evidenceService.checkConsistency(memberReports, centerCoords, event.endDate);

      // Priority calculation
      const priority = priorityService.calculatePriority({
        clusterCumulativeRainfallMm: clusterRainfallMm,
        thresholdMm: event.thresholdMm || 100,
        reportCount: count,
        radiusM: parsedRadius,
        consistencyScore: evidence.normalizedScore,
        satelliteSignalScore: satellite.normalizedScore,
        reportsInTimeWindow,
        dominantDamageRatio,
        dominantDamageType
      });

      const clusterId = `CLU-${currentEventId}-${String(idx + 1).padStart(3, '0')}`;

      const clusterDoc = new DamageCluster({
        clusterId,
        eventId: currentEventId,
        regionId,
        center: {
          type: 'Point',
          coordinates: centerCoords
        },
        reportIds: memberReports.map(r => r._id),
        reportCount: count,
        dominantCrop,
        dominantDamageType,
        timeSpread: {
          earliestReport: new Date(earliestMs),
          latestReport: new Date(latestMs),
          spreadHours
        },
        priorityScore: priority.score,
        priorityLevel: priority.priorityLevel,
        reasons: priority.reasons.map(r => r.text),
        satellite: {
          signal: satellite.signal,
          confidence: satellite.confidence,
          badge: satellite.badge
        },
        verificationStatus: 'PENDING',
        isDemo: true
      });

      await clusterDoc.save();

      savedClusters.push({
        ...clusterDoc.toObject(),
        priorityDetails: priority,
        evidenceDetails: evidence,
        clusterRainfallMm
      });
    }

    // Sort by priority score descending
    savedClusters.sort((a, b) => b.priorityScore - a.priorityScore);

    return {
      eventId: currentEventId,
      regionId,
      radiusM: parsedRadius,
      minReports: parsedMinReports,
      clusters: savedClusters,
      totalClusters: savedClusters.length,
      totalReportsGrouped: rawClusters.reduce((sum, c) => sum + c.length, 0),
      totalReportsInRegion: reports.length,
      wordingNotice: 'Multiple independent reports indicate a potential damage cluster requiring verification.',
      radiusNotice: 'Radius 1 km — prototype setting, not a validated value. Clusters are formed by geographic proximity, not village boundaries.'
    };
  },

  /**
   * Retrieves all clusters for an event
   */
  async getClustersByEvent(eventId) {
    let query = {};
    if (eventId) {
      query.eventId = eventId;
    } else {
      const latestCluster = await DamageCluster.findOne().sort({ createdAt: -1 });
      if (latestCluster) {
        query.eventId = latestCluster.eventId;
      } else {
        const latestEvent = await WeatherEvent.findOne().sort({ endDate: -1 });
        if (latestEvent) {
          query.eventId = latestEvent.eventId;
        }
      }
    }
    return DamageCluster.find(query)
      .sort({ priorityScore: -1 })
      .populate('reportIds', 'caseId crop damageType location status effectiveReportedAt');
  },

  /**
   * Retrieves a single cluster with report details
   */
  async getClusterById(clusterId) {
    return DamageCluster.findOne({ clusterId })
      .populate({
        path: 'reportIds',
        populate: { path: 'farmerId', select: 'name village district phone' }
      });
  }
};
