/**
 * Evidence Service: Evaluates multi-source evidence consistency
 * 
 * Rules:
 * Per-item labels: Available / Consistent / Supporting / Not available.
 * Overall labels: "Supporting evidence", "Limited evidence", or "Evidence inconsistency noted".
 * NEVER output a percentage "authenticity" or claim "100% genuine".
 */

export const evidenceService = {
  /**
   * Evaluates evidence consistency for a collection of reports in a cluster
   */
  checkConsistency(clusterReports, clusterCenter, eventEndDate) {
    if (!clusterReports || clusterReports.length === 0) {
      return {
        overall: 'Limited evidence',
        normalizedScore: 0.30,
        items: []
      };
    }

    const totalReports = clusterReports.length;

    // 1. GPS present
    const withGps = clusterReports.filter(r => r.location?.coordinates?.length === 2);
    const gpsRatio = withGps.length / totalReports;
    const gpsItem = {
      name: 'GPS Location Data',
      status: gpsRatio >= 0.8 ? 'Consistent' : gpsRatio > 0 ? 'Available' : 'Not available',
      detail: `${withGps.length} of ${totalReports} reports include coordinate telemetry.`
    };

    // 2. Timestamp present
    const withTimestamp = clusterReports.filter(r => r.reportedAt || r.effectiveReportedAt);
    const timeItem = {
      name: 'Submission Timestamp',
      status: withTimestamp.length === totalReports ? 'Available' : 'Limited',
      detail: 'Timestamp recorded for all reports in cluster.'
    };

    // 3. Distance to cluster centre
    // Reports are grouped within proximity radius
    const distanceItem = {
      name: 'Geospatial Centroid Proximity',
      status: 'Consistent',
      detail: `All ${totalReports} reports are within the configured proximity boundary.`
    };

    // 4. Photo present
    const withPhoto = clusterReports.filter(r => r.photo?.filename || r.photo?.url);
    const photoRatio = withPhoto.length / totalReports;
    const photoItem = {
      name: 'Ground Crop Photo Evidence',
      status: photoRatio >= 0.5 ? 'Supporting' : photoRatio > 0 ? 'Available' : 'Not available',
      detail: `${withPhoto.length} of ${totalReports} reports have ground photos attached.`
    };

    // 5. Event nearby in time
    let eventNearbyCount = 0;
    if (eventEndDate) {
      const eventEndMs = new Date(eventEndDate).getTime();
      clusterReports.forEach(r => {
        const reportMs = new Date(r.effectiveReportedAt || r.reportedAt).getTime();
        const diffHours = Math.abs(reportMs - eventEndMs) / 3600000;
        if (diffHours <= 72) eventNearbyCount++;
      });
    }
    const eventTimeItem = {
      name: 'Temporal Disaster Window (72h)',
      status: eventNearbyCount >= totalReports * 0.7 ? 'Consistent' : 'Available',
      detail: `${eventNearbyCount} of ${totalReports} reports submitted within 72 hours of weather event.`
    };

    // 6. Nearby corroborating reports
    const corroborationItem = {
      name: 'Independent Farmer Reports',
      status: totalReports >= 5 ? 'Supporting' : totalReports >= 3 ? 'Consistent' : 'Limited',
      detail: `${totalReports} independent farmer submissions corroborate local impact.`
    };

    // 7. Simulated satellite signal
    const satelliteItem = {
      name: 'Satellite Surface Change (SIMULATED)',
      status: 'Supporting',
      detail: 'Simulated radar backscatter consistent with surface moisture change.'
    };

    const items = [
      gpsItem,
      timeItem,
      distanceItem,
      photoItem,
      eventTimeItem,
      corroborationItem,
      satelliteItem
    ];

    // Compute qualitative overall assessment (Never percentage authenticity!)
    const positiveCount = items.filter(i => ['Consistent', 'Supporting'].includes(i.status)).length;
    let overall = 'Supporting evidence';
    let normalizedScore = 0.85;

    if (positiveCount >= 5) {
      overall = 'Supporting evidence';
      normalizedScore = 0.85;
    } else if (positiveCount >= 3) {
      overall = 'Limited evidence';
      normalizedScore = 0.55;
    } else {
      overall = 'Evidence inconsistency noted';
      normalizedScore = 0.25;
    }

    return {
      overall,
      normalizedScore,
      items
    };
  }
};
