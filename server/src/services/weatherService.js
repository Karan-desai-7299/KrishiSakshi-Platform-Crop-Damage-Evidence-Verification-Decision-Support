import axios from 'axios';
import WeatherEvent from '../models/WeatherEvent.js';
import Notification from '../models/Notification.js';
import { getNextEventId } from '../utils/idGenerator.js';

// Kolhapur District 5 Demo Locations (approximate coordinates)
export const KOLHAPUR_DEMO_LOCATIONS = [
  { name: 'Kolhapur', lat: 16.705, lng: 74.243 },
  { name: 'Kagal', lat: 16.576, lng: 74.314 },
  { name: 'Panhala', lat: 16.810, lng: 74.110 },
  { name: 'Shirol', lat: 16.737, lng: 74.597 },
  { name: 'Gadhinglaj', lat: 16.226, lng: 74.346 }
];

export const weatherService = {
  /**
   * Validate that the date range is historical and respects the 5-day reanalysis delay
   */
  validateDateRange(startDateStr, endDateStr) {
    if (!startDateStr || !endDateStr) {
      throw new Error('Both start date and end date are required.');
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format. Please provide dates in YYYY-MM-DD format.');
    }

    if (startDate > endDate) {
      throw new Error('Start date cannot be after end date.');
    }

    // Maximum allowed end date is today - 5 days
    const now = new Date();
    const maxAllowedEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5);
    const maxAllowedStr = maxAllowedEndDate.toISOString().split('T')[0];

    if (endDate > maxAllowedEndDate) {
      throw new Error(
        `The historical reanalysis API operates with a 5-day delay. End date cannot be later than ${maxAllowedStr} (today − 5 days). The demo is an event replay of a past event and cannot be presented as live detection.`
      );
    }

    return true;
  },

  /**
   * Fetches real historical rainfall data from Open-Meteo Archive API
   */
  async getHistoricalRainfall(locations = KOLHAPUR_DEMO_LOCATIONS, startDate, endDate) {
    this.validateDateRange(startDate, endDate);

    const latitudes = locations.map(l => l.lat).join(',');
    const longitudes = locations.map(l => l.lng).join(',');

    const url = 'https://archive-api.open-meteo.com/v1/archive';
    const params = {
      latitude: latitudes,
      longitude: longitudes,
      start_date: startDate,
      end_date: endDate,
      daily: 'precipitation_sum',
      timezone: 'Asia/Kolkata'
    };

    try {
      const response = await axios.get(url, { params, timeout: 15000 });
      const rawData = response.data;

      // When querying multiple locations, Open-Meteo returns an array of objects
      const locationResults = Array.isArray(rawData) ? rawData : [rawData];

      const rainfallByLocation = locationResults.map((result, idx) => {
        const loc = locations[idx] || { name: `Location ${idx + 1}`, lat: result.latitude, lng: result.longitude };
        const timeArray = result.daily?.time || [];
        const precipitationArray = result.daily?.precipitation_sum || [];

        const dailyPrecipitation = timeArray.map((date, i) => ({
          date,
          rainfallMm: Math.round((precipitationArray[i] || 0) * 10) / 10
        }));

        const cumulativeRainfallMm = Math.round(dailyPrecipitation.reduce((acc, curr) => acc + curr.rainfallMm, 0) * 10) / 10;
        const maxSingleDayMm = Math.round(Math.max(...dailyPrecipitation.map(d => d.rainfallMm), 0) * 10) / 10;

        return {
          locationName: loc.name,
          latitude: loc.lat,
          longitude: loc.lng,
          gridLatitude: result.latitude,
          gridLongitude: result.longitude,
          elevation: result.elevation,
          cumulativeRainfallMm,
          maxSingleDayMm,
          dailyPrecipitation
        };
      });

      // Compare returned grid coordinates across locations to detect shared cells (~9-25km grid)
      const gridCellMap = {};
      rainfallByLocation.forEach(loc => {
        const key = `${loc.gridLatitude},${loc.gridLongitude}`;
        if (!gridCellMap[key]) gridCellMap[key] = [];
        gridCellMap[key].push(loc.locationName);
      });

      const sharedGridCells = Object.entries(gridCellMap)
        .filter(([_, names]) => names.length > 1)
        .map(([coord, names]) => ({
          gridCoordinate: coord,
          locationsSharingCell: names
        }));

      return {
        rainfallByLocation,
        sharedGridCells,
        source: 'Gridded reanalysis estimate (Open-Meteo)',
        gridCaveat: 'The reanalysis grid is about 9–25 km. A cluster rainfall figure comes from the nearest grid cell, so proximity does not imply 1 km rainfall precision.'
      };
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        throw new Error('Open-Meteo API request timed out after 15 seconds. Please try again.');
      }
      if (err.response) {
        throw new Error(`Open-Meteo API error (${err.response.status}): ${err.response.data?.reason || err.message}`);
      }
      throw new Error(`Failed to fetch weather data: ${err.message}`);
    }
  },

  /**
   * Analyzes rainfall data against threshold heuristic
   */
  async analyzeRainfallEvent(locations = KOLHAPUR_DEMO_LOCATIONS, startDate, endDate, thresholdMm = 100) {
    const rawAnalysis = await this.getHistoricalRainfall(locations, startDate, endDate);
    const parsedThreshold = Number(thresholdMm) || 100;

    let flaggedCount = 0;
    const evaluatedLocations = rawAnalysis.rainfallByLocation.map(loc => {
      // Location is flagged if cumulative rainfall >= threshold OR maximum single-day >= threshold * 0.7
      const thresholdExceeded = loc.cumulativeRainfallMm >= parsedThreshold;
      if (thresholdExceeded) flaggedCount++;

      return {
        ...loc,
        thresholdExceeded
      };
    });

    const totalLocations = evaluatedLocations.length;
    const summary = flaggedCount > 0
      ? `Rainfall threshold triggered an event flag at ${flaggedCount} of ${totalLocations} locations.`
      : 'No threshold-triggered event in this period.';

    return {
      regionId: 'KOLHAPUR_DISTRICT',
      regionName: 'Kolhapur District',
      startDate,
      endDate,
      thresholdMm: parsedThreshold,
      flaggedCount,
      totalLocations,
      hasTriggeredEvent: flaggedCount > 0,
      summary,
      rainfallByLocation: evaluatedLocations,
      sharedGridCells: rawAnalysis.sharedGridCells,
      source: rawAnalysis.source,
      gridCaveat: rawAnalysis.gridCaveat,
      thresholdDisclaimer: 'Threshold: prototype heuristic — configurable, not an official government threshold.'
    };
  },

  /**
   * Peak-window finder: scans a historical season (e.g., June-Sept 2024)
   * and returns the N-day window with the highest cumulative rainfall
   */
  async findPeakRainfallWindow(seasonYear = 2024, windowDays = 5, locations = KOLHAPUR_DEMO_LOCATIONS) {
    const startDate = `${seasonYear}-06-01`;
    const endDate = `${seasonYear}-09-30`;

    // Ensure season does not violate 5-day boundary
    this.validateDateRange(startDate, endDate);

    const weatherData = await this.getHistoricalRainfall(locations, startDate, endDate);
    const numLocations = weatherData.rainfallByLocation.length;
    if (numLocations === 0) throw new Error('No weather data received for peak window scanning.');

    const dateList = weatherData.rainfallByLocation[0].dailyPrecipitation.map(d => d.date);
    const totalDays = dateList.length;

    let bestWindow = {
      startIndex: 0,
      endIndex: windowDays - 1,
      totalRainfall: -1,
      avgRainfallPerDay: 0
    };

    // Slide window of N days across season
    for (let i = 0; i <= totalDays - windowDays; i++) {
      let windowSum = 0;
      for (let j = 0; j < windowDays; j++) {
        const dayIdx = i + j;
        for (let l = 0; l < numLocations; l++) {
          windowSum += weatherData.rainfallByLocation[l].dailyPrecipitation[dayIdx]?.rainfallMm || 0;
        }
      }

      if (windowSum > bestWindow.totalRainfall) {
        bestWindow = {
          startIndex: i,
          endIndex: i + windowDays - 1,
          totalRainfall: windowSum,
          avgRainfallPerDay: Math.round((windowSum / (windowDays * numLocations)) * 10) / 10
        };
      }
    }

    const peakStartDate = dateList[bestWindow.startIndex];
    const peakEndDate = dateList[bestWindow.endIndex];

    // Get cumulative rain per location during this peak window
    const peakLocations = weatherData.rainfallByLocation.map(loc => {
      const windowDaysData = loc.dailyPrecipitation.slice(bestWindow.startIndex, bestWindow.endIndex + 1);
      const cumulativeMm = Math.round(windowDaysData.reduce((acc, curr) => acc + curr.rainfallMm, 0) * 10) / 10;
      return {
        name: loc.locationName,
        cumulativeRainfallMm: cumulativeMm
      };
    });

    const maxLocation = peakLocations.reduce((max, loc) => loc.cumulativeRainfallMm > max.cumulativeRainfallMm ? loc : max, peakLocations[0]);

    return {
      seasonYear,
      windowDays,
      peakStartDate,
      peakEndDate,
      avgRainfallPerDayMm: bestWindow.avgRainfallPerDay,
      maxLocation: maxLocation.name,
      maxLocationRainfallMm: maxLocation.cumulativeRainfallMm,
      locations: peakLocations,
      suggestion: `Peak ${windowDays}-day monsoon window detected from ${peakStartDate} to ${peakEndDate} with up to ${maxLocation.cumulativeRainfallMm} mm in ${maxLocation.name}.`
    };
  },

  /**
   * Creates a WeatherEvent record with sequential ID (EVT-YYYY-XXXX) and status ALERT_READY
   */
  async createWeatherEvent({ regionId = 'KOLHAPUR_DISTRICT', regionName = 'Kolhapur District', startDate, endDate, thresholdMm = 100 }) {
    const analysis = await this.analyzeRainfallEvent(KOLHAPUR_DEMO_LOCATIONS, startDate, endDate, thresholdMm);
    const eventId = await getNextEventId();

    const weatherEvent = new WeatherEvent({
      eventId,
      type: 'HEAVY_RAINFALL',
      regionId,
      regionName,
      locations: KOLHAPUR_DEMO_LOCATIONS,
      startDate,
      endDate,
      rainfallByLocation: analysis.rainfallByLocation,
      thresholdMm: analysis.thresholdMm,
      source: 'Gridded reanalysis estimate (Open-Meteo)',
      status: 'ALERT_READY',
      isDemo: true
    });

    await weatherEvent.save();

    return {
      weatherEvent,
      analysis
    };
  },

  /**
   * Logs simulated farmer alert notifications for the event (status -> ALERT_SENT)
   */
  async sendFarmerAlert(eventId) {
    const event = await WeatherEvent.findOne({ eventId });
    if (!event) {
      throw new Error(`Weather event with ID ${eventId} not found.`);
    }

    event.status = 'ALERT_SENT';
    await event.save();

    // Create simulated Notification record badged "DEMO MODE — simulated alert"
    const notification = new Notification({
      userId: 'ALL_FARMERS_KOLHAPUR',
      title: 'आपल्या परिसरात मुसळधार पावसाची नोंद झाली आहे',
      message: 'आपल्या परिसरात मुसळधार पावसाची नोंद झाली आहे. आपल्या पिकाचे नुकसान झाले असल्यास कृपया लवकर नुकसान नोंदवा. (DEMO MODE — simulated alert)',
      type: 'WEATHER_ALERT',
      channel: 'SMS',
      demoMode: true,
      eventId: event.eventId
    });

    await notification.save();

    return {
      event,
      notification,
      message: `Simulated farmer alert successfully dispatched and logged for event ${eventId}.`,
      badge: 'DEMO MODE — simulated alert'
    };
  },

  /**
   * Get all weather events
   */
  async getAllEvents() {
    return WeatherEvent.find().sort({ createdAt: -1 });
  }
};
