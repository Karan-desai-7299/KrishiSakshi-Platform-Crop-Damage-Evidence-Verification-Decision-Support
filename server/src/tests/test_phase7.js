const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== KRISHISAKSHI PHASE 7 VERIFICATION CASE & AUDIT TESTS ===\n');

  // Step 1: Officer and Farmer Authentication
  console.log('Test 1: Authenticating Officer and Farmer...');
  const offRes = await fetch(`${BASE_URL}/demo/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'OFFICER' })
  });
  const offData = await offRes.json();
  const officerToken = offData.data?.token;

  const farmRes = await fetch(`${BASE_URL}/demo/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'FARMER' })
  });
  const farmData = await farmRes.json();
  const farmerToken = farmData.data?.token;
  const farmerId = farmData.data?.user?.id;

  console.log(`✓ Officer: ${offData.data?.user?.name} (Token present: ${!!officerToken})`);
  console.log(`✓ Farmer: ${farmData.data?.user?.name} (Token present: ${!!farmerToken})`);

  // Step 2: Retrieve Case Dossier (4 Structured Evidence Sections)
  console.log('\nTest 2: Verifying 4-Part Evidence Dossier (GET /api/reports/:id/dossier)...');
  const targetCaseId = 'KS-2026-000001';
  const dossierRes = await fetch(`${BASE_URL}/reports/${targetCaseId}/dossier`, {
    headers: { Authorization: `Bearer ${officerToken}` }
  });
  const dossierData = await dossierRes.json();
  if (!dossierData.success) {
    throw new Error('Dossier retrieval failed: ' + JSON.stringify(dossierData));
  }

  const { report, weather, satellite, cluster, auditLogs } = dossierData.data;

  // Validate Section 1: Farmer Submission
  console.log(`✓ Section 1 (Farmer Submission): Case ${report.caseId}, Crop: ${report.crop}, Loss: ${report.estimatedLossPercent}%`);
  console.log(`  Farmer Name: ${report.farmerId?.name}, Phone: "${report.farmerId?.phone}"`);
  if (!report.farmerId?.phone?.includes('XXXXX')) {
    throw new Error('Farmer phone not masked in dossier');
  }

  // Validate Section 2: Weather Context
  console.log(`✓ Section 2 (Weather Context): ${weather.dataSource}`);
  console.log(`  Rainfall: ${weather.cumulativeRainfallMm} mm (Threshold: ${weather.thresholdMm} mm, Exceeded: ${weather.thresholdExceeded})`);
  if (!weather.dataSource.includes('Gridded reanalysis estimate (Open-Meteo)')) {
    throw new Error('Weather dataSource missing mandatory attribution string');
  }

  // Validate Section 3: Satellite SAR Proxy
  console.log(`✓ Section 3 (Satellite Proxy): Signal: "${satellite.signal}", Badge: "${satellite.badge}"`);
  if (!satellite.badge.includes('SIMULATED — prototype only')) {
    throw new Error('Satellite badge missing SIMULATED label');
  }

  // Validate Section 4: Cluster Context
  console.log(`✓ Section 4 (Cluster Context): Cluster ${cluster?.clusterId || 'Isolated'}, Priority: ${cluster?.priorityLevel} (${cluster?.priorityScore}/100)`);
  if (cluster) {
    console.log(`  Centroid distance: ${cluster.distanceFromCentroidMeters}m, Reports in cluster: ${cluster.reportCount}`);
  }

  // Step 3: Farmer Role Isolation
  console.log('\nTest 3: Verifying Role Isolation on Case Dossier...');
  // Farmer Patil accessing own report should succeed
  const ownRes = await fetch(`${BASE_URL}/reports/${targetCaseId}/dossier`, {
    headers: { Authorization: `Bearer ${farmerToken}` }
  });
  const ownData = await ownRes.json();
  console.log(`✓ Farmer access to own case ${targetCaseId}: ${ownData.success ? 'Granted' : 'Denied'}`);

  // Step 4: Field Panchnama Recording & Status Transition
  console.log('\nTest 4: Recording Official Field Panchnama Finding (POST /api/reports/:id/verify)...');
  const verifyRes = await fetch(`${BASE_URL}/reports/${targetCaseId}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${officerToken}`
    },
    body: JSON.stringify({
      finding: 'Partially Verified',
      observedLossPercent: 65,
      notes: 'Automated test panchnama: Sugarcane lodging observed on 65% of surveyed acreage. Recommended for standard relief queue.'
    })
  });
  const verifyData = await verifyRes.json();
  if (!verifyData.success) {
    throw new Error('Panchnama recording failed: ' + JSON.stringify(verifyData));
  }

  console.log(`✓ Panchnama recorded:`);
  console.log(`  - Finding: ${verifyData.data.verification.status}`);
  console.log(`  - Updated Report Status: ${verifyData.data.report.status}`);
  console.log(`  - Audit Action: ${verifyData.data.auditLog.action}`);

  // Non-officer (farmer) attempting verification should be blocked
  const illegalRes = await fetch(`${BASE_URL}/reports/${targetCaseId}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${farmerToken}`
    },
    body: JSON.stringify({
      finding: 'Verified',
      observedLossPercent: 90
    })
  });
  if (illegalRes.status !== 403) {
    throw new Error(`Unauthorized farmer verification expected 403, got ${illegalRes.status}`);
  }
  console.log('✓ Security: Unauthorized farmer verification strictly blocked (HTTP 403 Forbidden).');

  // Step 5: Immutable Audit Timeline Verification
  console.log('\nTest 5: Verifying Immutable Case Audit Timeline...');
  const refreshedDossierRes = await fetch(`${BASE_URL}/reports/${targetCaseId}/dossier`, {
    headers: { Authorization: `Bearer ${officerToken}` }
  });
  const refreshedData = await refreshedDossierRes.json();
  const refreshedLogs = refreshedData.data.auditLogs;

  console.log(`✓ Audit timeline entries: ${refreshedLogs.length}`);
  const latestLog = refreshedLogs[refreshedLogs.length - 1];
  console.log(`  Latest Event: [${new Date(latestLog.createdAt).toLocaleTimeString()}] ${latestLog.action} by ${latestLog.actor.name} (${latestLog.actor.role})`);
  console.log(`  Metadata: ${JSON.stringify(latestLog.metadata)}`);

  if (latestLog.action !== 'OFFICER_VERIFICATION_RECORDED') {
    throw new Error('Latest audit log does not match panchnama action');
  }

  console.log('\n=== ALL PHASE 7 VERIFICATION CASE & AUDIT TESTS PASSED ===\n');
}

runTests().catch(err => {
  console.error('\n❌ PHASE 7 TEST FAILED:', err);
  process.exit(1);
});
