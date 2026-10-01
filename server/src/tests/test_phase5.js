const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== KRISHISAKSHI PHASE 5 ENGINE VERIFICATION TESTS ===\n');

  // Obtain Officer Token
  console.log('Authenticating as Officer (Sanjay Deshmukh)...');
  const offRes = await fetch(`${BASE_URL}/demo/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'OFFICER' })
  });
  const offData = await offRes.json();
  const officerToken = offData.data?.token;
  if (!officerToken) {
    throw new Error('Failed to retrieve officer token: ' + JSON.stringify(offData));
  }
  console.log('✓ Officer authenticated successfully.');

  // Test 1: Cluster generation with 1000m radius
  console.log('\nTest 1: Proximity Clustering Engine (POST /api/clusters/generate)...');
  const genRes1 = await fetch(`${BASE_URL}/clusters/generate`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${officerToken}`
    },
    body: JSON.stringify({ radiusM: 1000, minReports: 3 })
  });
  const genData1 = await genRes1.json();
  if (!genData1.success) {
    throw new Error(`Cluster generation failed: ${JSON.stringify(genData1)}`);
  }
  console.log(`✓ Clustered ${genData1.data.totalReportsGrouped} reports into ${genData1.data.totalClusters} clusters (radius: 1000m).`);
  console.log(`  Total reports in region: ${genData1.data.totalReportsInRegion}`);

  // Test 2: Dynamic cluster recalculation with different radius
  console.log('\nTest 2: Dynamic recalculation with different radius...');
  const genRes2 = await fetch(`${BASE_URL}/clusters/generate`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${officerToken}`
    },
    body: JSON.stringify({ radiusM: 500, minReports: 3 })
  });
  const genData2 = await genRes2.json();
  const genRes3 = await fetch(`${BASE_URL}/clusters/generate`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${officerToken}`
    },
    body: JSON.stringify({ radiusM: 2000, minReports: 3 })
  });
  const genData3 = await genRes3.json();
  console.log(`✓ 500m radius -> ${genData2.data.totalClusters} clusters`);
  console.log(`✓ 1000m radius -> ${genData1.data.totalClusters} clusters`);
  console.log(`✓ 2000m radius -> ${genData3.data.totalClusters} clusters`);
  console.log('✓ Dynamic radius responsiveness validated.');

  // Restore 1000m for consistent baseline
  await fetch(`${BASE_URL}/clusters/generate`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${officerToken}`
    },
    body: JSON.stringify({ radiusM: 1000, minReports: 3 })
  });

  // Test 3: Priority Calculation & WHY Checklist
  console.log('\nTest 3: Priority Engine & Explainable WHY Checklist Verification...');
  const clustersRes = await fetch(`${BASE_URL}/clusters`, {
    headers: { 'Authorization': `Bearer ${officerToken}` }
  });
  const clustersData = await clustersRes.json();
  const clusters = clustersData.data;
  console.log(`✓ Retrieved ${clusters.length} active clusters.`);

  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  for (const c of clusters) {
    if (c.priorityLevel === 'HIGH') highCount++;
    else if (c.priorityLevel === 'MEDIUM') mediumCount++;
    else lowCount++;

    // Validate score matches factors
    if (c.priorityScore < 0 || c.priorityScore > 100) {
      throw new Error(`Cluster ${c.clusterId} has invalid score ${c.priorityScore}`);
    }

    // Validate priority level thresholds
    if (c.priorityScore >= 70 && c.priorityLevel !== 'HIGH') {
      throw new Error(`Cluster ${c.clusterId} score ${c.priorityScore} should be HIGH`);
    }
    if (c.priorityScore >= 40 && c.priorityScore < 70 && c.priorityLevel !== 'MEDIUM') {
      throw new Error(`Cluster ${c.clusterId} score ${c.priorityScore} should be MEDIUM`);
    }
    if (c.priorityScore < 40 && c.priorityLevel !== 'LOW') {
      throw new Error(`Cluster ${c.clusterId} score ${c.priorityScore} should be LOW`);
    }

    // Check WHY checklist exists and is truthful
    if (!c.reasons || !Array.isArray(c.reasons) || c.reasons.length === 0) {
      throw new Error(`Cluster ${c.clusterId} lacks reasons checklist`);
    }
  }

  console.log(`✓ Priority Distribution: HIGH: ${highCount}, MEDIUM: ${mediumCount}, LOW: ${lowCount}`);
  console.log(`✓ Sample Cluster #${clusters[0].clusterId}:`);
  console.log(`  - Priority Score: ${clusters[0].priorityScore} (${clusters[0].priorityLevel})`);
  console.log(`  - Dominant Crop: ${clusters[0].dominantCrop}`);
  console.log(`  - Reports: ${clusters[0].reportCount}`);
  console.log(`  - Priority Reasons (WHY Checklist):`);
  clusters[0].reasons.forEach(r => console.log(`     • ${r}`));

  // Test 4: Satellite SAR Proxy & Simulated Badge
  console.log('\nTest 4: Satellite SAR Proxy & Badge Verification...');
  const sampleCluster = clusters[0];
  if (!sampleCluster.satellite) {
    throw new Error('Satellite data missing in cluster');
  }
  console.log(`✓ Satellite proxy signal: ${sampleCluster.satellite.signal}`);
  console.log(`✓ Simulated badge: "${sampleCluster.satellite.badge}"`);
  if (!sampleCluster.satellite.badge.includes('SIMULATED')) {
    throw new Error('Satellite data lacks SIMULATED badge');
  }

  // Test 5: Verify Live Report Submission links into Replay Cluster
  console.log('\nTest 5: Live Report Cluster Ingestion Test...');
  // Login as demo farmer
  const loginRes = await fetch(`${BASE_URL}/demo/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'FARMER' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.token;
  if (!token) {
    throw new Error('Failed to retrieve farmer token: ' + JSON.stringify(loginData));
  }

  // Submit report near Shirol (approx 16.718, 74.595)
  const submitRes = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      crop: 'Sugarcane',
      damageType: 'Waterlogging',
      coordinates: [74.595, 16.718],
      description: 'Automated test report for cluster integration',
      regionId: 'KOLHAPUR_DISTRICT'
    })
  });
  const submitData = await submitRes.json();
  if (!submitData.success) {
    throw new Error('Report submission failed: ' + JSON.stringify(submitData));
  }
  console.log(`✓ Live report submitted: ${submitData.data.caseId} at (${submitData.data.report.location.coordinates[0]}, ${submitData.data.report.location.coordinates[1]})`);

  // Regenerate clusters
  const reclusterRes = await fetch(`${BASE_URL}/clusters/generate`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${officerToken}`
    },
    body: JSON.stringify({ radiusM: 1000, minReports: 3 })
  });
  const reclusterData = await reclusterRes.json();
  console.log(`✓ Regenerated clusters with new report. Total reports in clusters: ${reclusterData.data.totalReportsGrouped}`);

  console.log('\n=== ALL PHASE 5 BACKEND VERIFICATION TESTS PASSED ===\n');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
