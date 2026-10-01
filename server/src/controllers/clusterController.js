import { clusterService } from '../services/clusterService.js';
import DamageReport from '../models/DamageReport.js';
import DamageCluster from '../models/DamageCluster.js';
import WeatherEvent from '../models/WeatherEvent.js';
import { maskPhone } from '../middleware/authMiddleware.js';

export const clusterController = {
  /**
   * GET /api/clusters/stats/summary
   */
  async getStats(req, res) {
    try {
      const { regionId = 'KOLHAPUR_DISTRICT' } = req.query;

      const totalReports = await DamageReport.countDocuments({ regionId });
      const totalClusters = await DamageCluster.countDocuments({ regionId });
      const highPriority = await DamageCluster.countDocuments({ regionId, priorityLevel: 'HIGH' });
      const mediumPriority = await DamageCluster.countDocuments({ regionId, priorityLevel: 'MEDIUM' });
      const lowPriority = await DamageCluster.countDocuments({ regionId, priorityLevel: 'LOW' });

      const pendingVerifications = await DamageReport.countDocuments({
        regionId,
        status: { $in: ['Report Submitted', 'Under Review', 'Field Verification'] }
      });
      const completedVerifications = await DamageReport.countDocuments({
        regionId,
        status: 'Verification Completed'
      });

      const activeEvent = await WeatherEvent.findOne({ regionId }).sort({ endDate: -1 });

      res.status(200).json({
        success: true,
        data: {
          totalReports,
          totalClusters,
          highPriority,
          mediumPriority,
          lowPriority,
          pendingVerifications,
          completedVerifications,
          activeEvent: activeEvent ? {
            eventId: activeEvent.eventId,
            title: activeEvent.title,
            startDate: activeEvent.startDate,
            endDate: activeEvent.endDate,
            regionId: activeEvent.regionId
          } : null
        },
        error: null
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        data: null,
        error: { message: err.message }
      });
    }
  },
  /**
   * POST /api/clusters/generate
   */
  async generate(req, res) {
    try {
      const { eventId, radiusM, minReports, regionId } = req.body;
      const data = await clusterService.generateClusters({
        eventId,
        radiusM: radiusM ? Number(radiusM) : 1000,
        minReports: minReports ? Number(minReports) : 3,
        regionId: regionId || 'KOLHAPUR_DISTRICT'
      });

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
   * GET /api/clusters
   */
  async listClusters(req, res) {
    try {
      const { eventId } = req.query;
      const clusters = await clusterService.getClustersByEvent(eventId);

      res.status(200).json({
        success: true,
        data: clusters,
        error: null
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        data: null,
        error: { message: err.message }
      });
    }
  },

  /**
   * GET /api/clusters/:id
   */
  async getCluster(req, res) {
    try {
      const { id } = req.params;
      const cluster = await clusterService.getClusterById(id);

      if (!cluster) {
        return res.status(404).json({
          success: false,
          data: null,
          error: { message: `Cluster with ID ${id} not found.` }
        });
      }

      const clusterObj = cluster.toObject();
      // Mask farmer phone numbers in reports
      if (clusterObj.reportIds) {
        clusterObj.reportIds.forEach(rep => {
          if (rep.farmerId && rep.farmerId.phone) {
            rep.farmerId.phone = maskPhone(rep.farmerId.phone);
          }
        });
      }

      res.status(200).json({
        success: true,
        data: clusterObj,
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
