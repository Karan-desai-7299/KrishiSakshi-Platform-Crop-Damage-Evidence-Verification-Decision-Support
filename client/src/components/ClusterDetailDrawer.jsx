import React, { useState } from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Users, 
  CheckCircle, 
  AlertCircle,
  FileSpreadsheet,
  CheckSquare,
  Sprout,
  Clock,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function ClusterDetailDrawer({
  cluster,
  onClose,
  reports = []
}) {
  const { isMarathi, strings } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!cluster) return null;

  const isHigh = cluster.priorityLevel === 'HIGH';
  const isMedium = cluster.priorityLevel === 'MEDIUM';

  // Generate and download offline Panchnama CSV
  const handleExportCSV = () => {
    const headers = [
      'Cluster ID',
      'Case ID',
      'Farmer Name',
      'Masked Phone',
      'Village',
      'Taluka',
      'Crop',
      'Damage Type',
      'Reported Loss (%)',
      'Longitude',
      'Latitude',
      'Effective Reported Time (Replay)',
      'Verification Status'
    ];

    const memberReports = reports && reports.length > 0 ? reports : cluster.reportIds || [];

    const rows = memberReports.map(rep => {
      const coords = rep.location?.coordinates || [0, 0];
      const farmer = rep.farmerId || {};
      return [
        `"${cluster.clusterId}"`,
        `"${rep.caseId || 'N/A'}"`,
        `"${farmer.name || rep.farmerName || 'Patil'}"`,
        `"${farmer.phone || '99999XXXXX'}"`,
        `"${farmer.village || rep.village || 'Kolhapur'}"`,
        `"${farmer.taluka || 'Karveer'}"`,
        `"${rep.crop || cluster.dominantCrop}"`,
        `"${rep.damageType || cluster.dominantDamageType}"`,
        `"${rep.estimatedLossPercent || 70}"`,
        coords[0],
        coords[1],
        `"${rep.effectiveReportedAt ? new Date(rep.effectiveReportedAt).toLocaleString('en-IN') : 'Replay Event'}"`,
        `"${rep.status || 'Report Submitted'}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `panchnama_cluster_${cluster.clusterId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const memberReports = reports && reports.length > 0 ? reports : cluster.reportIds || [];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl border-l border-border-default flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-4 border-b border-border-default bg-[#F7F9FA] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-md bg-primary text-white flex items-center justify-center font-bold text-xs">
            CLU
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-content-main font-mono">
                {cluster.clusterId}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                isHigh 
                  ? 'bg-red-50 text-priority-high border-red-200' 
                  : isMedium 
                    ? 'bg-amber-50 text-amber-800 border-amber-200' 
                    : 'bg-gray-50 text-content-secondary border-gray-200'
              }`}>
                {isMarathi 
                  ? (isHigh ? 'उच्च प्राधान्य' : isMedium ? 'मध्यम प्राधान्य' : 'कमी प्राधान्य')
                  : `${cluster.priorityLevel} Priority`} ({cluster.priorityScore}/100)
              </span>
            </div>
            <div className="text-[11px] text-content-secondary mt-0.5">
              {isMarathi ? 'मध्यबिंदू: ' : 'Centroid: '}[{(cluster.center?.coordinates || cluster.centroid?.coordinates || [74.35, 16.68])[0].toFixed(4)}, {(cluster.center?.coordinates || cluster.centroid?.coordinates || [74.35, 16.68])[1].toFixed(4)}] • {cluster.reportCount} {isMarathi ? 'अहवाल' : 'reports'}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="farmer-tap-target p-2 text-content-secondary hover:text-content-main hover:bg-gray-200 rounded-md transition-colors"
          title={isMarathi ? 'बंद करा' : 'Close drawer'}
        >
          <X size={18} />
        </button>
      </div>

      {/* Drawer Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Honesty Reminder */}
        <div className="p-3 rounded-md bg-blue-50/50 border border-blue-200 text-xs text-content-secondary flex items-start gap-2">
          <ShieldCheck size={16} className="text-primary shrink-0 mt-0.5" />
          <div>
            <strong className="text-content-main">
              {isMarathi ? 'निर्णय साहाय्य सूचना: ' : 'Decision Support Notice: '}
            </strong>
            {isMarathi 
              ? 'हा गट प्रत्यक्ष क्षेत्रीय भेटींना प्राधान्य देण्यासाठी समीपतेच्या आधारे तयार केला आहे. अधिकृत पंचनाम्यानंतरच नुकसान प्रमाणित होते.'
              : 'This cluster is generated via proximity grouping to prioritize physical field visits. Damage is only verified once official panchnama is completed.'}
          </div>
        </div>

        {/* Explainable "WHY this priority?" Checklist */}
        <div className="gov-card p-3 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-content-main uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare size={14} className="text-primary" />
              <span>{isMarathi ? 'स्पष्टीकरणात्मक प्राधान्य मूल्यांकन (नियम-आधारित)' : 'Explainable Priority Assessment (Rule-based)'}</span>
            </h4>
            <span className="text-[10px] text-content-secondary font-mono">
              {isMarathi ? 'गुण: ' : 'Score: '}{cluster.priorityScore}/100
            </span>
          </div>

          <div className="space-y-1.5">
            {cluster.reasons && cluster.reasons.length > 0 ? (
              cluster.reasons.map((reason, idx) => (
                <div key={idx} className="text-xs text-content-main flex items-start gap-2 p-1.5 rounded bg-gray-50/60">
                  <span className="text-agri font-bold shrink-0">✓</span>
                  <span>{reason}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-content-secondary italic">
                {isMarathi ? 'प्रमाणित समीपता गट आधारभूत माहिती.' : 'Standard proximity cluster baseline.'}
              </div>
            )}
          </div>
        </div>

        {/* Evidence Breakdown Grid */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="gov-card p-2.5">
            <div className="text-[10px] font-bold text-content-secondary uppercase">
              {isMarathi ? 'प्रमुख पीक' : 'Dominant Crop'}
            </div>
            <div className="text-xs font-bold text-content-main mt-0.5">{cluster.dominantCrop}</div>
            <div className="text-[10px] text-content-secondary">{cluster.dominantDamageType || 'Waterlogging'}</div>
          </div>

          <div className="gov-card p-2.5">
            <div className="text-[10px] font-bold text-content-secondary uppercase">
              {isMarathi ? 'वेळ विस्तार' : 'Time Spread'}
            </div>
            <div className="text-xs font-bold text-content-main mt-0.5">
              {cluster.timeSpread?.spreadHours !== undefined 
                ? `${cluster.timeSpread.spreadHours}${isMarathi ? ' तास विस्तार' : 'h spread'}` 
                : (isMarathi ? '२४ तासांच्या आत' : 'Under 24h')}
            </div>
            <div className="text-[10px] text-content-secondary">
              {isMarathi ? 'आपत्ती सुसंगतता' : 'Replay alignment'}
            </div>
          </div>

          <div className="gov-card p-2.5">
            <div className="text-[10px] font-bold text-content-secondary uppercase">
              {isMarathi ? 'उपग्रह स्तर' : 'Satellite Proxy'}
            </div>
            <div className="text-xs font-bold text-content-main mt-0.5">SAR Signal</div>
            <div className="text-[10px] text-primary font-semibold">
              {isMarathi ? 'प्रात्यक्षिक (SIMULATED)' : 'SIMULATED'}
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 bg-gray-50 rounded-md border border-border-default">
          <div className="text-xs text-content-secondary">
            <strong className="text-content-main">{memberReports.length}</strong> {isMarathi ? 'शेतकऱ्यांचे अहवाल या गटात समाविष्ट आहेत.' : 'individual farmer reports in this cluster.'}
          </div>
          <button
            onClick={handleExportCSV}
            className="farmer-tap-target px-3 py-1.5 bg-white hover:bg-gray-100 text-content-main border border-border-default rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
          >
            <Download size={14} className="text-primary" />
            <span>{isMarathi ? 'पंचनामा पत्रक डाऊनलोड करा (CSV)' : 'Export Panchnama Sheet (CSV)'}</span>
          </button>
        </div>

        {/* Reports Table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-content-main uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} className="text-primary" />
              <span>{isMarathi ? 'या गटातील शेतकरी अहवाल' : 'Farmer Reports in this Cluster'}</span>
            </h4>
            <span className="text-[10px] text-content-secondary">
              {isMarathi ? 'गोपनीयतेसाठी फोन नंबर अंशतः लपवले आहेत' : 'Phone numbers masked for privacy'}
            </span>
          </div>

          <div className="overflow-x-auto border border-border-default rounded-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9FA] text-content-secondary font-semibold border-b border-border-default">
                <tr>
                  <th className="py-2 px-3">{isMarathi ? 'प्रकरण क्र.' : 'Case ID'}</th>
                  <th className="py-2 px-3">{isMarathi ? 'शेतकरी व गाव' : 'Farmer & Village'}</th>
                  <th className="py-2 px-3">{isMarathi ? 'पीक व नुकसान' : 'Crop & Loss'}</th>
                  <th className="py-2 px-3">{isMarathi ? 'स्थिती' : 'Status'}</th>
                  <th className="py-2 px-3 text-right">{isMarathi ? 'कृती' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {memberReports.map((rep, idx) => {
                  const farmer = rep.farmerId || {};
                  return (
                    <tr key={rep.caseId || idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-2 px-3 font-mono font-bold text-primary">
                        {rep.caseId || `KS-2026-000${idx + 1}`}
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-content-main">{farmer.name || 'Patil'}</div>
                        <div className="text-[10px] text-content-secondary">
                          {farmer.village || 'Kolhapur'} • {farmer.phone || '99999XXXXX'}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-medium text-content-main">{rep.crop || cluster.dominantCrop}</div>
                        <div className="text-[10px] text-content-secondary">
                          {rep.damageType || cluster.dominantDamageType} ({rep.estimatedLossPercent || 70}%)
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border inline-block ${
                          rep.status === 'Verification Completed'
                            ? 'text-agri bg-green-50 border-[#C8E6C9]'
                            : rep.status === 'Field Verification'
                              ? 'text-blue-700 bg-blue-50 border-blue-200'
                              : 'text-amber-800 bg-amber-50 border-amber-200'
                        }`}>
                          {rep.status || 'Report Submitted'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <Link
                          to={`/verification/${rep.caseId || `KS-2026-000${idx + 1}`}`}
                          className="farmer-tap-target text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <span>{isMarathi ? 'तपासा' : 'Verify'}</span>
                          <ExternalLink size={11} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Drawer Footer */}
      <div className="p-3 border-t border-border-default bg-[#F7F9FA] flex items-center justify-between text-xs">
        <span className="text-[11px] text-content-secondary">
          {isMarathi ? 'डेटा स्रोत: हवामान पुनर्गणना व शेतकरी अहवाल' : 'Data source: Gridded reanalysis & farmer submissions'}
        </span>
        <button
          onClick={handleExportCSV}
          className="farmer-tap-target px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <FileSpreadsheet size={13} />
          <span>{isMarathi ? 'CSV डाउनलोड' : 'Download CSV'}</span>
        </button>
      </div>
    </div>
  );
}
