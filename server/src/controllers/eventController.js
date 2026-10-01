import { weatherService } from '../services/weatherService.js';

export const eventController = {
  /**
   * POST /api/events/analyze
   */
  async analyze(req, res) {
    try {
      const { startDate, endDate, thresholdMm } = req.body;
      const data = await weatherService.analyzeRainfallEvent(
        undefined,
        startDate,
        endDate,
        thresholdMm
      );

      res.status(200).json({
        success: true,
        data,
        error: null
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        data: null,
        error: { message: err.message }
      });
    }
  },

  /**
   * POST /api/events/peak-window
   */
  async peakWindow(req, res) {
    try {
      const { seasonYear, windowDays } = req.body;
      const data = await weatherService.findPeakRainfallWindow(
        seasonYear ? Number(seasonYear) : 2024,
        windowDays ? Number(windowDays) : 5
      );

      res.status(200).json({
        success: true,
        data,
        error: null
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        data: null,
        error: { message: err.message }
      });
    }
  },

  /**
   * POST /api/events (Create Farmer Alert / Event)
   */
  async createEvent(req, res) {
    try {
      const { startDate, endDate, thresholdMm, regionId, regionName } = req.body;
      const data = await weatherService.createWeatherEvent({
        startDate,
        endDate,
        thresholdMm,
        regionId,
        regionName
      });

      res.status(201).json({
        success: true,
        data,
        error: null
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        data: null,
        error: { message: err.message }
      });
    }
  },

  /**
   * POST /api/events/:id/alert (Send Farmer Alert simulated)
   */
  async sendAlert(req, res) {
    try {
      const { id } = req.params;
      const data = await weatherService.sendFarmerAlert(id);

      res.status(200).json({
        success: true,
        data,
        error: null
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        data: null,
        error: { message: err.message }
      });
    }
  },

  /**
   * GET /api/events
   */
  async listEvents(req, res) {
    try {
      const data = await weatherService.getAllEvents();
      res.status(200).json({
        success: true,
        data,
        error: null
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        data: null,
        error: { message: err.message }
      });
    }
  }
};
