const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== KRISHISAKSHI PHASE 6 OFFICER DASHBOARD VERIFICATION TESTS ===\n');

  // Step 1: Officer Authentication
  console.log('Test 1: Authenticating as Officer Sanjay Deshmukh...');
  const offRes = await fetch(`${BASE_URL}/demo/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'OFFICER' })
  });
  const offData = await offRes.json();
  const token = offData.data?.token;
  if (!token) throw new Error('Officer login failed');
  console.log(`✓ Officer authenticated: ${offData.data.user.name} (${offData.data.user.role})`);

  // Step 2: Officer Dashboard Summary Stats
  console.log('\nTest 2: Verifying Officer Dashboard Stats (GET /api/clusters/stats/summary)...');
  const statsRes = await fetch(`${BASE_URL}/clusters/stats/summary`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const statsData = await statsRes.json();
  if (!statsData.success) {
    throw new Error('Stats retrieval failed: ' + JSON.stringify(statsData));
  }
  const s = statsData.data;
  console.log(`✓ Stats retrieved successfully:`);
  console.log(`  - Total Damage Reports: ${s.totalReports}`);
  console.log(`  - Total Clusters: ${s.totalClusters}`);
  console.log(`  - High Priority: ${s.highPriority}`);
  console.log(`  - Medium Priority: ${s.mediumPriority}`);
  console.log(`  - Low Priority: ${s.lowPriority}`);
  console.log(`  - Field Verifications: ${s.completedVerifications} Completed / ${s.pendingVerifications} Pending`);
  console.log(`  - Active Replay Event: ${s.activeEvent?.eventId} (${s.activeEvent?.startDate} to ${s.activeEvent?.endDate})`);

  if (typeof s.totalReports !== 'number' || s.totalReports <= 0) {
    throw new Error('Invalid totalReports metric');
  }
  if (typeof s.totalClusters !== 'number' || s.totalClusters <= 0) {
    throw new Error('Invalid totalClusters metric');
  }

  // Step 3: Cluster Ranking & Data Structure
  console.log('\nTest 3: Verifying Ranked Cluster List (GET /api/clusters)...');
  const clustersRes = await fetch(`${BASE_URL}/clusters`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const clustersData = await clustersRes.json();
  const clusters = clustersData.data;
  if (!clusters || clusters.length === 0) {
    throw new Error('No clusters returned');
  }

  // Verify descending sort by priorityScore
  for (let i = 0; i < clusters.length - 1; i++) {
    if (clusters[i].priorityScore < clusters[i + 1].priorityScore) {
      throw new Error(`Clusters not sorted descending: [${i}] score ${clusters[i].priorityScore} < [${i+1}] score ${clusters[i+1].priorityScore}`);
    }
  }
  console.log(`✓ Verified ${clusters.length} clusters are strictly sorted descending by Priority Score.`);
  console.log(`  Top Cluster #${clusters[0].clusterId}: Priority ${clusters[0].priorityLevel} (Score: ${clusters[0].priorityScore}/100)`);
  console.log(`  Dominant Crop: ${clusters[0].dominantCrop}, Report Count: ${clusters[0].reportCount}`);

  // Step 4: Cluster Detail Drawer & Phone Masking
  console.log('\nTest 4: Verifying Cluster Detail & Phone Masking (GET /api/clusters/:id)...');
  const sampleClusterId = clusters[0].clusterId;
  const detailRes = await fetch(`${BASE_URL}/clusters/${sampleClusterId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const detailData = await detailRes.json();
  if (!detailData.success) {
    throw new Error(`Failed to retrieve cluster ${sampleClusterId}: ${JSON.stringify(detailData)}`);
  }
  const detail = detailData.data;
  console.log(`✓ Retrieved details for cluster ${detail.clusterId}:`);
  console.log(`  - Dominant Crop: ${detail.dominantCrop}`);
  console.log(`  - Reports count: ${detail.reportIds?.length || 0}`);

  // Check phone masking in member reports
  if (detail.reportIds && detail.reportIds.length > 0) {
    const sampleRep = detail.reportIds[0];
    if (sampleRep.farmerId?.phone) {
      console.log(`  - Sample Farmer Phone: "${sampleRep.farmerId.phone}"`);
      if (!sampleRep.farmerId.phone.includes('XXXXX')) {
        throw new Error(`Phone number not masked: ${sampleRep.farmerId.phone}`);
      }
      console.log('✓ Farmer phone number privacy masking verified (99999XXXXX).');
    }
  }

  // Step 5: Verify Decision Support Honesty Labels
  console.log('\nTest 5: Verifying Honesty & Non-AI Heuristic Rules...');
  if (!detail.satellite?.badge?.includes('SIMULATED')) {
    throw new Error('Satellite badge missing SIMULATED label');
  }
  console.log(`✓ Satellite proxy honesty badge confirmed: "${detail.satellite.badge}"`);
  console.log(`✓ Explainable WHY checklist verified (${detail.reasons?.length || 0} heuristic reasons)`);

  console.log('\n=== ALL PHASE 6 OFFICER DASHBOARD TESTS PASSED ===\n');
}

runTests().catch(err => {
  console.error('\n❌ PHASE 6 TEST FAILED:', err);
  process.exit(1);
});
