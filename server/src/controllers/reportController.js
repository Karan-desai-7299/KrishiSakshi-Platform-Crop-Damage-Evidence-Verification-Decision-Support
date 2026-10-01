import DamageReport from '../models/DamageReport.js';
import WeatherEvent from '../models/WeatherEvent.js';
import Evidence from '../models/Evidence.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import DamageCluster from '../models/DamageCluster.js';
import Verification from '../models/Verification.js';
import { getNextCaseId } from '../utils/idGenerator.js';
import { maskPhone } from '../middleware/authMiddleware.js';
import { satelliteService } from '../services/satelliteService.js';
import { getHaversineDistanceMeters } from '../utils/haversine.js';

export const reportController = {
  /**
   * POST /api/reports
   * Creates a new damage report with sequential Case ID, replay time, photo metadata, and audit log
   */
  async createReport(req, res) {
    try {
      const { crop, damageType, coordinates, description, farmId, regionId = 'KOLHAPUR_DISTRICT' } = req.body;

      if (!crop || !damageType) {
        return res.status(400).json({
          success: false,
          data: null,
          error: { message: 'Crop and damage type are required fields.' }
        });
      }

      // Parse coordinates [lng, lat]
      let parsedCoords;
      if (typeof coordinates === 'string') {
        try {
          parsedCoords = JSON.parse(coordinates);
        } catch {
          parsedCoords = coordinates.split(',').map(n => parseFloat(n.trim()));
        }
      } else if (Array.isArray(coordinates)) {
        parsedCoords = coordinates.map(Number);
      }

      if (!parsedCoords || parsedCoords.length !== 2 || isNaN(parsedCoords[0]) || isNaN(parsedCoords[1])) {
        // Fallback default coordinates in Kolhapur center
        parsedCoords = [74.243, 16.705];
      }

      // Generate sequential Case ID KS-YYYY-XXXXXX
      const caseId = await getNextCaseId();

      // Check replay rules: link to current replay event if available
      const activeEvent = await WeatherEvent.findOne({
        regionId,
        status: { $in: ['ALERT_READY', 'ALERT_SENT'] }
      }).sort({ createdAt: -1 });

      let eventId = null;
      let effectiveReportedAt = new Date();
      let replayMinutesElapsed = 0;

      if (activeEvent) {
        eventId = activeEvent.eventId;
        // Replay rule: effectiveReportedAt = event end + minutes since alert was sent
        replayMinutesElapsed = Math.max(0, Math.floor((Date.now() - activeEvent.createdAt.getTime()) / 60000));
        const eventEndDate = new Date(activeEvent.endDate);
        effectiveReportedAt = new Date(eventEndDate.getTime() + (replayMinutesElapsed * 60000));
      }

      // Photo metadata if uploaded
      let photoData = null;
      if (req.file) {
        photoData = {
          filename: req.file.filename,
          url: `/uploads/${req.file.filename}`,
          timestamp: new Date(),
          location: parsedCoords
        };
      }

      // Create DamageReport
      const report = new DamageReport({
        caseId,
        farmerId: req.user.id,
        farmId: farmId || null,
        regionId,
        eventId,
        crop,
        damageType,
        location: {
          type: 'Point',
          coordinates: parsedCoords
        },
        photo: photoData,
        description: description || '',
        status: 'Report Submitted',
        priorityScore: 0,
        reportedAt: new Date(),
        effectiveReportedAt,
        isDemo: true
      });

      await report.save();

      // Store Evidence entry
      await Evidence.create({
        reportId: report._id,
        caseId,
        type: 'FARMER',
        source: 'Farmer Mobile Submission',
        timestamp: new Date(),
        location: report.location,
        data: {
          crop,
          damageType,
          photoPresent: !!photoData,
          photoFilename: photoData?.filename || null,
          replayTime: effectiveReportedAt.toISOString()
        },
        isDemo: true
      });

      // AuditLog entry
      await AuditLog.create({
        actor: {
          userId: req.user.id,
          name: req.user.name,
          role: 'FARMER'
        },
        action: 'REPORT_SUBMITTED',
        targetId: caseId,
        metadata: {
          crop,
          damageType,
          coordinates: parsedCoords,
          effectiveReportedAt: effectiveReportedAt.toISOString()
        }
      });

      // Simulated SMS Notification
      const simulatedSms = `KrishiSakshi: Crop loss report ${caseId} submitted successfully. — DEMO MODE`;
      const notification = new Notification({
        userId: req.user.id,
        title: 'अहवाल यशस्वीरीत्या नोंदवला गेला',
        message: simulatedSms,
        type: 'REPORT_CONFIRMATION',
        channel: 'SMS',
        demoMode: true,
        eventId
      });
      await notification.save();

      res.status(201).json({
        success: true,
        data: {
          report: {
            ...report.toObject(),
            farmerPhone: maskPhone(req.user.phone)
          },
          caseId,
          simulatedSms,
          effectiveReportedAt: effectiveReportedAt.toISOString(),
          replayTimeLabel: 'replay time',
          successMessageMr: 'तुमचा अहवाल नोंदवला गेला आहे.',
          successMessageEn: 'Your report has been added to the local crop-loss event record.'
        },
        error: null
      });
    } catch (err) {
      console.error('[Create Report Error]:', err);
      res.status(500).json({
        success: false,
        data: null,
        error: { message: err.message || 'Failed to submit crop loss report.' }
      });
    }
  },

  /**
   * GET /api/reports/:id
   * Retrieves single report with ownership authorization
   */
  async getReportById(req, res) {
    try {
      const { id } = req.params;
      const report = await DamageReport.findOne({
        $or: [{ caseId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
      }).populate('farmerId', 'name village district phone');

      if (!report) {
        return res.status(404).json({
          success: false,
          data: null,
          error: { message: `Report with ID ${id} not found.` }
        });
      }

      // Farmer ownership check: farmer can only view their own report
      if (req.user.role === 'FARMER' && report.farmerId._id.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          data: null,
          error: { message: 'Access denied. You can only view your own submitted reports.' }
        });
      }

      const reportObj = report.toObject();
      if (reportObj.farmerId) {
        reportObj.farmerId.phone = maskPhone(reportObj.farmerId.phone);
      }

      res.status(200).json({
        success: true,
        data: reportObj,
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
   * GET /api/reports/:id/dossier
   * Retrieves the comprehensive 4-part evidence dossier, existing verification, and audit logs
   */
  async getCaseDossier(req, res) {
    try {
      const { id } = req.params;
      const report = await DamageReport.findOne({
        $or: [{ caseId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
      }).populate('farmerId', 'name village district taluka phone');

      if (!report) {
        return res.status(404).json({
          success: false,
          data: null,
          error: { message: `Crop loss report with ID ${id} not found.` }
        });
      }

      // Check farmer isolation: farmers can only see their own dossier
      if (req.user.role === 'FARMER' && report.farmerId._id.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          data: null,
          error: { message: 'Access denied. You can only view your own submitted reports.' }
        });
      }

      const reportObj = report.toObject();
      if (reportObj.farmerId) {
        reportObj.farmerId.phone = maskPhone(reportObj.farmerId.phone);
      }

      // 1. Weather Context (Gridded reanalysis estimate)
      let weatherEvent = null;
      if (report.eventId) {
        weatherEvent = await WeatherEvent.findOne({ eventId: report.eventId });
      }
      if (!weatherEvent) {
        weatherEvent = await WeatherEvent.findOne({ regionId: report.regionId }).sort({ endDate: -1 });
      }

      const weatherContext = weatherEvent ? {
        eventId: weatherEvent.eventId,
        title: weatherEvent.title || 'July 2024 Heavy Rainfall Deluge',
        startDate: weatherEvent.startDate,
        endDate: weatherEvent.endDate,
        referenceStation: 'Kolhapur / Shirol Reference Grid',
        cumulativeRainfallMm: weatherEvent.totalRainfallMm || 184,
        peakDailyRainfallMm: weatherEvent.peakRainfallMm || 96,
        thresholdMm: weatherEvent.thresholdMm || 100,
        thresholdExceeded: (weatherEvent.totalRainfallMm || 184) >= (weatherEvent.thresholdMm || 100),
        status: weatherEvent.status,
        dataSource: 'Gridded reanalysis estimate (Open-Meteo)',
        gridCaveat: 'Reanalysis grid is ~9–25 km; values represent gridded atmospheric estimates, not an individual farm rain-gauge.'
      } : {
        eventId: 'EVT-DEFAULT',
        title: 'Monsoon Atmospheric Event',
        startDate: '2024-07-22',
        endDate: '2024-07-26',
        referenceStation: 'Kolhapur Center Grid',
        cumulativeRainfallMm: 160,
        peakDailyRainfallMm: 85,
        thresholdMm: 100,
        thresholdExceeded: true,
        dataSource: 'Gridded reanalysis estimate (Open-Meteo)',
        gridCaveat: 'Reanalysis grid is ~9–25 km.'
      };

      // 2. Satellite Context (SAR Proxy with mandatory SIMULATED badge)
      const reportCoords = report.location?.coordinates || [74.243, 16.705];
      const satelliteProxy = await satelliteService.getSarProxyLayer(
        reportCoords,
        { startDate: weatherEvent?.startDate, endDate: weatherEvent?.endDate }
      );

      // 3. Cluster Context
      const cluster = await DamageCluster.findOne({
        reportIds: report._id
      });

      let clusterContext = null;
      if (cluster) {
        const clusterCoords = cluster.center?.coordinates || cluster.centroid?.coordinates || reportCoords;
        const distFromCentroidMeters = getHaversineDistanceMeters(
          reportCoords,
          clusterCoords
        );
        clusterContext = {
          clusterId: cluster.clusterId,
          priorityScore: cluster.priorityScore,
          priorityLevel: cluster.priorityLevel,
          reportCount: cluster.reportCount,
          dominantCrop: cluster.dominantCrop,
          dominantDamageType: cluster.dominantDamageType,
          centroidCoordinates: clusterCoords,
          distanceFromCentroidMeters: Math.round(distFromCentroidMeters),
          reasons: cluster.reasons,
          heuristicsNote: 'Proximity cluster formed by geographic proximity (1 km radius), not administrative village boundary.'
        };
      }

      // 4. Verification Record
      const verification = await Verification.findOne({ caseId: report.caseId })
        .populate('officerId', 'name role district');

      // 5. Audit Log Timeline
      const auditLogs = await AuditLog.find({ targetId: report.caseId })
        .sort({ createdAt: 1 });

      res.status(200).json({
        success: true,
        data: {
          report: reportObj,
          weather: weatherContext,
          satellite: satelliteProxy,
          cluster: clusterContext,
          verification: verification ? verification.toObject() : null,
          auditLogs: auditLogs.map(l => ({
            id: l._id,
            action: l.action,
            actor: l.actor,
            metadata: l.metadata,
            createdAt: l.createdAt
          }))
        },
        error: null
      });
    } catch (err) {
      console.error('[Case Dossier Error]:', err);
      res.status(500).json({
        success: false,
        data: null,
        error: { message: err.message || 'Failed to retrieve case dossier.' }
      });
    }
  },

  /**
   * POST /api/reports/:id/verify
   * Records official field panchnama observation and updates audit log
   */
  async submitVerification(req, res) {
    try {
      const { id } = req.params;
      const { finding, observedLossPercent, notes } = req.body;

      // Role check: Only officers can record field panchnama
      if (req.user.role !== 'OFFICER') {
        return res.status(403).json({
          success: false,
          data: null,
          error: { message: 'Access denied. Only authorized field officers can record panchnama verifications.' }
        });
      }

      const report = await DamageReport.findOne({
        $or: [{ caseId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
      });

      if (!report) {
        return res.status(404).json({
          success: false,
          data: null,
          error: { message: `Report with ID ${id} not found.` }
        });
      }

      const validFindings = ['Verified', 'Partially Verified', 'Needs More Information', 'Not Observed'];
      const targetFinding = validFindings.includes(finding) ? finding : 'Verified';

      let newReportStatus = 'Verification Completed';
      if (targetFinding === 'Needs More Information') {
        newReportStatus = 'Needs More Information';
      }

      const previousStatus = report.status;
      report.status = newReportStatus;
      await report.save();

      // Handle photo upload if present
      const photos = [];
      if (req.file) {
        photos.push({
          filename: req.file.filename,
          url: `/uploads/${req.file.filename}`,
          timestamp: new Date(),
          location: report.location.coordinates
        });
      }

      // Upsert Verification document
      const verification = await Verification.findOneAndUpdate(
        { caseId: report.caseId },
        {
          caseId: report.caseId,
          officerId: req.user.id,
          status: targetFinding,
          notes: notes || '',
          photos: photos.length > 0 ? photos : undefined,
          verifiedAt: new Date(),
          isDemo: true
        },
        { returnDocument: 'after', upsert: true }
      ).populate('officerId', 'name role district');

      // Create immutable AuditLog
      const auditLog = await AuditLog.create({
        actor: {
          userId: req.user.id,
          name: req.user.name,
          role: 'OFFICER'
        },
        action: 'OFFICER_VERIFICATION_RECORDED',
        targetId: report.caseId,
        metadata: {
          previousStatus,
          newStatus: newReportStatus,
          finding: targetFinding,
          observedLossPercent: observedLossPercent ? Number(observedLossPercent) : undefined,
          notes: notes || 'Official field panchnama observation recorded by visiting officer.'
        }
      });

      res.status(200).json({
        success: true,
        data: {
          report,
          verification,
          auditLog,
          message: 'Official field verification observation recorded successfully.'
        },
        error: null
      });
    } catch (err) {
      console.error('[Submit Verification Error]:', err);
      res.status(500).json({
        success: false,
        data: null,
        error: { message: err.message || 'Failed to submit verification observation.' }
      });
    }
  }
};
