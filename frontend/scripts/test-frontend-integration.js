const http = require('http');

const testRoute = (url) => {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, length: data.length });
      });
    }).on('error', (err) => {
      resolve({ status: 500, error: err.message });
    });
  });
};

const runFrontendTests = async () => {
  console.log('\n======================================================');
  console.log('   CIVICFIX FRONTEND INTEGRATION & ROUTE VERIFICATION');
  console.log('======================================================\n');

  const routes = [
    { name: 'Landing Page', path: '/' },
    { name: 'Public Complaint Feed', path: '/complaints' },
    { name: 'Citizen Login Page', path: '/login' },
    { name: 'Citizen Signup Page', path: '/signup' },
    { name: 'Citizen Dashboard', path: '/dashboard' },
    { name: 'Report Issue Page', path: '/complaints/new' },
    { name: 'My Complaints Page', path: '/complaints/mine' },
    { name: 'Officer Command Dashboard', path: '/officer/dashboard' },
  ];

  let passed = 0;
  let failed = 0;

  for (const r of routes) {
    const res = await testRoute(`http://localhost:3000${r.path}`);
    if (res.status === 200) {
      passed++;
      console.log(`  \x1b[32m✔ PASS\x1b[0m [200 OK] ${r.name} (${r.path}) - Size: ${res.length} bytes`);
    } else {
      failed++;
      console.log(`  \x1b[31m✖ FAIL\x1b[0m [${res.status}] ${r.name} (${r.path}) - ${res.error || ''}`);
    }
  }

  console.log('\n======================================================');
  console.log(`   Frontend Routes Tested: ${routes.length}`);
  console.log(`   Passed:                 ${passed}`);
  console.log(`   Failed:                 ${failed}`);
  console.log('======================================================\n');

  process.exit(failed > 0 ? 1 : 0);
};

runFrontendTests();
