/**
 * Satellite Service (Simulated Proxy Layer)
 * 
 * In accordance with Data Honesty Rule #5:
 * SAR/satellite appears ONLY with the badge "SIMULATED — prototype only".
 * Real Sentinel-1 processing is roadmap only.
 */

export const satelliteService = {
  /**
   * Deterministically returns simulated satellite surface change proxy
   */
  getSignal(coordinates, eventDate) {
    return {
      signal: 'Consistent with possible surface change',
      confidence: 'Moderate',
      badge: 'SIMULATED — prototype only',
      platform: 'Sentinel-1 SAR (Simulated Replay)',
      polarization: 'VV/VH Coherence Difference',
      normalizedScore: 0.80, // 0 to 1
      isDemo: true,
      notice: 'This layer is a simulated demonstration proxy. Real satellite coherence analysis is scheduled for post-pilot integration.'
    };
  },

  getSarProxyLayer(coordinates, options = {}) {
    return this.getSignal(coordinates, options.startDate || options.endDate);
  }
};
