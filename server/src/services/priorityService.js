/**
 * Priority Scoring Engine
 * 
 * Rules:
 * Computes transparent, explainable verification priority score (0–100)
 * Weights:
 * - Rainfall signal: 0.30
 * - Report density: 0.25
 * - Evidence consistency: 0.20
 * - Satellite supporting signal: 0.15
 * - Time proximity: 0.10
 * 
 * Generates mandatory "WHY this priority?" checklist showing ONLY true factors.
 */

export const PRIORITY_CONFIG = {
  weights: {
    rainfall: 0.30,
    reportDensity: 0.25,
    evidenceConsistency: 0.20,
    satellite: 0.15,
    timeProximity: 0.10
  },
  thresholds: {
    high: 70,
    medium: 40
  },
  maxDensityReportsPerKm2: 15,
  timeProximityHours: Number(process.env.TIME_PROXIMITY_HOURS) || 24
};

export const priorityService = {
  /**
   * Calculates explainable priority score and generates verified WHY checklist
   */
  calculatePriority({
    clusterCumulativeRainfallMm = 0,
    thresholdMm = 100,
    reportCount = 0,
    radiusM = 1000,
    consistencyScore = 0.5,
    satelliteSignalScore = 0.8,
    reportsInTimeWindow = 0,
    dominantDamageRatio = 0.8,
    dominantDamageType = 'Waterlogging'
  }) {
    const { weights, thresholds, maxDensityReportsPerKm2, timeProximityHours } = PRIORITY_CONFIG;

    // 1. Rainfall factor (0 to 1)
    const fRain = Math.min(1.0, clusterCumulativeRainfallMm / thresholdMm);

    // 2. Report density factor (0 to 1)
    // Area of cluster in km2 = PI * (radius in km)^2
    const radiusKm = radiusM / 1000;
    const areaKm2 = Math.PI * Math.pow(radiusKm, 2);
    const density = reportCount / Math.max(0.1, areaKm2);
    const fDensity = Math.min(1.0, density / maxDensityReportsPerKm2);

    // 3. Evidence consistency factor (0 to 1)
    const fConsistency = Math.min(1.0, Math.max(0.0, consistencyScore));

    // 4. Satellite supporting factor (0 to 1)
    const fSatellite = Math.min(1.0, Math.max(0.0, satelliteSignalScore));

    // 5. Time proximity factor (0 to 1)
    const timeShare = reportCount > 0 ? reportsInTimeWindow / reportCount : 0;
    const fTime = Math.min(1.0, timeShare);

    // Composite weighted score (0 to 100)
    const rawScore = (
      weights.rainfall * fRain +
      weights.reportDensity * fDensity +
      weights.evidenceConsistency * fConsistency +
      weights.satellite * fSatellite +
      weights.timeProximity * fTime
    );

    const score = Math.round(rawScore * 100);

    // Priority Level Assignment
    let priorityLevel = 'LOW';
    if (score >= thresholds.high) {
      priorityLevel = 'HIGH';
    } else if (score >= thresholds.medium) {
      priorityLevel = 'MEDIUM';
    } else {
      priorityLevel = 'LOW';
    }

    // MANDATORY "WHY this priority?" checklist:
    // Generate lines ONLY from factors that are actually true!
    // False factors show "—" with the specific reason.
    const reasons = [];

    // Factor 1: Rainfall
    if (clusterCumulativeRainfallMm >= thresholdMm) {
      reasons.push({
        status: 'TRUE',
        text: `✓ Rainfall above prototype threshold (${clusterCumulativeRainfallMm} mm vs ${thresholdMm} mm)`
      });
    } else {
      reasons.push({
        status: 'FALSE',
        text: `— Rainfall below prototype threshold (${clusterCumulativeRainfallMm} mm vs ${thresholdMm} mm)`
      });
    }

    // Factor 2: Report Count & Density
    if (reportCount >= 3) {
      reasons.push({
        status: 'TRUE',
        text: `✓ ${reportCount} reports within ${radiusKm} km radius (${Math.round(density * 10) / 10} reports/km²)`
      });
    } else {
      reasons.push({
        status: 'FALSE',
        text: `— Sparse reports in area (${reportCount} within ${radiusKm} km)`
      });
    }

    // Factor 3: Time Proximity
    if (timeShare >= 0.5) {
      reasons.push({
        status: 'TRUE',
        text: `✓ ${Math.round(timeShare * 100)}% of reports submitted within ${timeProximityHours}h window`
      });
    } else {
      reasons.push({
        status: 'FALSE',
        text: `— Reports spread over extended period (${Math.round(timeShare * 100)}% within ${timeProximityHours}h)`
      });
    }

    // Factor 4: Dominant Damage Type
    if (dominantDamageRatio >= 0.6) {
      reasons.push({
        status: 'TRUE',
        text: `✓ Concordant damage type: ${dominantDamageType} (${Math.round(dominantDamageRatio * 100)}% agreement)`
      });
    } else {
      reasons.push({
        status: 'FALSE',
        text: `— Varied reported damage types across cluster`
      });
    }

    // Factor 5: Satellite Layer (Simulated)
    reasons.push({
      status: 'SUPPORTING',
      text: '○ Supporting satellite layer (simulated)'
    });

    return {
      score,
      priorityLevel,
      factors: {
        fRain: Math.round(fRain * 100) / 100,
        fDensity: Math.round(fDensity * 100) / 100,
        fConsistency: Math.round(fConsistency * 100) / 100,
        fSatellite: Math.round(fSatellite * 100) / 100,
        fTime: Math.round(fTime * 100) / 100
      },
      reasons,
      heuristicDisclaimer: 'Starting heuristic — adjustable, not scientifically validated. This score only suggests verification order. It does not determine compensation.'
    };
  }
};
