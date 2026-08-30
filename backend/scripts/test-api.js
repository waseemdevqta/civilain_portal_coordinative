const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config({ path: path.join(__dirname, '../.env') });
process.env.NODE_ENV = 'test';

const connectDB = require('../config/db');
const seedDatabase = require('./seed');
const app = require('../server');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { calculatePriority } = require('../utils/priority');

const PORT = 5099;
let server;
let baseUrl;

// Test state variables
let citizenToken = '';
let citizenRefreshToken = '';
let citizenId = '';
let secondCitizenToken = '';
let secondCitizenRefreshToken = '';
let secondCitizenId = '';
let officerToken = '';
let officerRefreshToken = '';
let officerId = '';
let testComplaintId = '';
let secondComplaintId = '';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

const makeRequest = (method, endpoint, body = null, token = null, rawBody = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${baseUrl}${endpoint}`);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: `${url.pathname}${url.search}`,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      if (token.startsWith('Raw ')) {
        options.headers['Authorization'] = token.replace('Raw ', '');
      } else {
        options.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = { raw: data };
        }
        resolve({ status: res.statusCode, data: json, headers: res.headers });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (rawBody !== null) {
      req.write(rawBody);
    } else if (body !== null) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const assert = (condition, testName, details = '') => {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m [${totalTests}] ${testName}`);
  } else {
    failedTests++;
    console.error(`  \x1b[31m✖ FAIL\x1b[0m [${totalTests}] ${testName}`);
    if (details) {
      console.error(`    \x1b[33mDetails:\x1b[0m`, details);
    }
  }
};

const runAggressiveSuite = async () => {
  console.log('\n======================================================');
  console.log('   CIVICFIX AGGRESSIVE BACKEND INTEGRATION TEST SUITE');
  console.log('======================================================\n');

  try {
    // ----------------------------------------------------
    // Section 1: System & Health Check
    // ----------------------------------------------------
    console.log('\n--- Section 1: System & Health ---');
    const healthRes = await makeRequest('GET', '/api/health');
    assert(
      healthRes.status === 200 && healthRes.data.success === true && healthRes.data.message === 'CivicFix API is running',
      'GET /api/health returns 200 OK and running status',
      healthRes.data
    );

    // ----------------------------------------------------
    // Section 2: Signup Tests
    // ----------------------------------------------------
    console.log('\n--- Section 2: Authentication - Signup ---');
    const uniqueEmail = `citizen_test_${Date.now()}@example.com`;

    // 2.1 Valid signup
    const validSignupRes = await makeRequest('POST', '/api/auth/signup', {
      name: 'Test Citizen User',
      email: uniqueEmail,
      password: 'Password123!',
    });
    assert(
      validSignupRes.status === 201 &&
      validSignupRes.data.success === true &&
      validSignupRes.data.data.accessToken &&
      validSignupRes.data.data.refreshToken &&
      validSignupRes.data.data.user.role === 'citizen' &&
      validSignupRes.data.data.user.password === undefined,
      'Valid signup creates Citizen account, returns access + refresh tokens, password NEVER returned',
      validSignupRes.data
    );
    citizenToken = validSignupRes.data.data.accessToken;
    citizenRefreshToken = validSignupRes.data.data.refreshToken;
    citizenId = validSignupRes.data.data.user.id;

    // 2.2 Duplicate email rejection
    const dupSignupRes = await makeRequest('POST', '/api/auth/signup', {
      name: 'Duplicate Citizen',
      email: uniqueEmail,
      password: 'Password123!',
    });
    assert(
      dupSignupRes.status === 400 && dupSignupRes.data.success === false,
      'Duplicate email signup is rejected with 400 Bad Request',
      dupSignupRes.data
    );

    // 2.3 Invalid email format rejection
    const invalidEmailRes = await makeRequest('POST', '/api/auth/signup', {
      name: 'Invalid Email User',
      email: 'not-an-email-address',
      password: 'Password123!',
    });
    assert(
      invalidEmailRes.status === 400 && invalidEmailRes.data.success === false,
      'Malformed email address is rejected with 400 Bad Request',
      invalidEmailRes.data
    );

    // 2.4 Missing name
    const missingNameRes = await makeRequest('POST', '/api/auth/signup', {
      email: `no_name_${Date.now()}@example.com`,
      password: 'Password123!',
    });
    assert(missingNameRes.status === 400, 'Signup with missing name rejected with 400 Bad Request', missingNameRes.data);

    // 2.5 Missing email
    const missingEmailRes = await makeRequest('POST', '/api/auth/signup', {
      name: 'No Email User',
      password: 'Password123!',
    });
    assert(missingEmailRes.status === 400, 'Signup with missing email rejected with 400 Bad Request', missingEmailRes.data);

    // 2.6 Missing password
    const missingPasswordRes = await makeRequest('POST', '/api/auth/signup', {
      name: 'No Pass User',
      email: `no_pass_${Date.now()}@example.com`,
    });
    assert(missingPasswordRes.status === 400, 'Signup with missing password rejected with 400 Bad Request', missingPasswordRes.data);

    // 2.7 Short password (< 6 chars)
    const shortPassRes = await makeRequest('POST', '/api/auth/signup', {
      name: 'Short Pass User',
      email: `short_pass_${Date.now()}@example.com`,
      password: '12345',
    });
    assert(shortPassRes.status === 400, 'Signup with short password (< 6 characters) rejected with 400 Bad Request', shortPassRes.data);

    // 2.8 Attempt to create Officer account via public signup
    const spoofOfficerRes = await makeRequest('POST', '/api/auth/signup', {
      name: 'Fake Officer Hacker',
      email: `fake_officer_${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'officer', // Must be ignored and forced to citizen
    });
    assert(
      spoofOfficerRes.status === 201 &&
      spoofOfficerRes.data.data.user.role === 'citizen',
      'Public signup ignores spoofed role and forces citizen account creation',
      spoofOfficerRes.data
    );

    // 2.9 Register second citizen for multi-user tests
    const secondCitizenEmail = `second_citizen_${Date.now()}@example.com`;
    const secondSignupRes = await makeRequest('POST', '/api/auth/signup', {
      name: 'Second Citizen Fatima',
      email: secondCitizenEmail,
      password: 'Password123!',
    });
    secondCitizenToken = secondSignupRes.data.data.accessToken;
    secondCitizenRefreshToken = secondSignupRes.data.data.refreshToken;
    secondCitizenId = secondSignupRes.data.data.user.id;

    // ----------------------------------------------------
    // Section 3: Login Tests
    // ----------------------------------------------------
    console.log('\n--- Section 3: Authentication - Login ---');
    // 3.1 Valid citizen login
    const citizenLoginRes = await makeRequest('POST', '/api/auth/login', {
      email: uniqueEmail,
      password: 'Password123!',
    });
    assert(
      citizenLoginRes.status === 200 &&
      citizenLoginRes.data.success === true &&
      citizenLoginRes.data.data.accessToken &&
      citizenLoginRes.data.data.refreshToken &&
      citizenLoginRes.data.data.user.role === 'citizen' &&
      citizenLoginRes.data.data.user.password === undefined,
      'Valid citizen login returns accessToken, refreshToken, user profile (password not exposed)',
      citizenLoginRes.data
    );

    // 3.2 Valid officer login (seeded credentials)
    const officerLoginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'waseemahmedbaloch2004@gmail.com',
      password: 'Officer123!',
    });
    assert(
      officerLoginRes.status === 200 &&
      officerLoginRes.data.success === true &&
      officerLoginRes.data.data.accessToken &&
      officerLoginRes.data.data.refreshToken &&
      officerLoginRes.data.data.user.role === 'officer',
      'Officer login succeeds with demo credentials and returns officer role',
      officerLoginRes.data
    );
    officerToken = officerLoginRes.data.data.accessToken;
    officerRefreshToken = officerLoginRes.data.data.refreshToken;
    officerId = officerLoginRes.data.data.user.id;

    // 3.3 Wrong password
    const wrongPassRes = await makeRequest('POST', '/api/auth/login', {
      email: uniqueEmail,
      password: 'WrongPassword999!',
    });
    assert(wrongPassRes.status === 401 && wrongPassRes.data.success === false, 'Login with incorrect password rejected with 401 Unauthorized', wrongPassRes.data);

    // 3.4 Nonexistent email
    const nonexistentEmailRes = await makeRequest('POST', '/api/auth/login', {
      email: 'nobody_exists_here_9999@example.com',
      password: 'Password123!',
    });
    assert(nonexistentEmailRes.status === 401, 'Login with non-existent email rejected with 401 Unauthorized', nonexistentEmailRes.data);

    // 3.5 Missing email
    const missingLoginEmailRes = await makeRequest('POST', '/api/auth/login', {
      password: 'Password123!',
    });
    assert(missingLoginEmailRes.status === 400, 'Login with missing email rejected with 400 Bad Request', missingLoginEmailRes.data);

    // 3.6 Missing password
    const missingLoginPassRes = await makeRequest('POST', '/api/auth/login', {
      email: uniqueEmail,
    });
    assert(missingLoginPassRes.status === 400, 'Login with missing password rejected with 400 Bad Request', missingLoginPassRes.data);

    // ----------------------------------------------------
    // Section 4: Access Token Verification
    // ----------------------------------------------------
    console.log('\n--- Section 4: Access Token Verification ---');
    // 4.1 Valid access token accesses protected route
    const validAccessRes = await makeRequest('GET', '/api/auth/me', null, citizenToken);
    assert(validAccessRes.status === 200 && validAccessRes.data.data.email === uniqueEmail, 'Valid access token grants access to protected /api/auth/me', validAccessRes.data);

    // 4.2 Missing Authorization header
    const noAuthRes = await makeRequest('GET', '/api/auth/me');
    assert(noAuthRes.status === 401, 'Protected route without Authorization header rejected with 401 Unauthorized', noAuthRes.data);

    // 4.3 Malformed Authorization header (Not Bearer)
    const malformedHeaderRes = await makeRequest('GET', '/api/auth/me', null, 'Raw Basic 123456');
    assert(malformedHeaderRes.status === 401, 'Malformed Authorization header without Bearer rejected with 401', malformedHeaderRes.data);

    // 4.4 Empty Bearer token
    const emptyBearerRes = await makeRequest('GET', '/api/auth/me', null, 'Raw Bearer');
    assert(emptyBearerRes.status === 401, 'Bearer header without token rejected with 401', emptyBearerRes.data);

    // 4.5 Random string token
    const randomTokenRes = await makeRequest('GET', '/api/auth/me', null, 'random_garbage_string_12345');
    assert(randomTokenRes.status === 401, 'Random invalid token string rejected with 401', randomTokenRes.data);

    // 4.6 Refresh token passed as access token (type isolation)
    const refreshAsAccessRes = await makeRequest('GET', '/api/auth/me', null, citizenRefreshToken);
    assert(refreshAsAccessRes.status === 401, 'Refresh token passed to access-token-protected endpoint is rejected with 401', refreshAsAccessRes.data);

    // 4.7 Expired access token
    const expiredToken = jwt.sign(
      { id: citizenId, role: 'citizen' },
      process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
      { expiresIn: '-1s' }
    );
    const expiredRes = await makeRequest('GET', '/api/auth/me', null, expiredToken);
    assert(expiredRes.status === 401, 'Expired access token is rejected with 401 Unauthorized', expiredRes.data);

    // ----------------------------------------------------
    // Section 5: Refresh Token Flow
    // ----------------------------------------------------
    console.log('\n--- Section 5: Refresh Token Flow ---');
    // 5.1 Refresh token endpoint with valid refresh token
    const refreshRes = await makeRequest('POST', '/api/auth/refresh', {
      refreshToken: citizenRefreshToken,
    });
    assert(
      refreshRes.status === 200 &&
      refreshRes.data.success === true &&
      refreshRes.data.data.accessToken &&
      refreshRes.data.data.refreshToken,
      'POST /api/auth/refresh with valid refresh token returns fresh accessToken + refreshToken',
      refreshRes.data
    );
    const newAccessToken = refreshRes.data.data.accessToken;

    // 5.2 Newly issued access token accesses protected endpoint
    const newAccessTestRes = await makeRequest('GET', '/api/auth/me', null, newAccessToken);
    assert(newAccessTestRes.status === 200, 'Newly refreshed access token successfully authorizes protected routes', newAccessTestRes.data);

    // 5.3 Missing refresh token
    const missingRefreshRes = await makeRequest('POST', '/api/auth/refresh', {});
    assert(missingRefreshRes.status === 400, 'Refresh request with missing token rejected with 400 Bad Request', missingRefreshRes.data);

    // 5.4 Invalid / malformed refresh token
    const invalidRefreshRes = await makeRequest('POST', '/api/auth/refresh', {
      refreshToken: 'bad_invalid_refresh_token_xyz',
    });
    assert(invalidRefreshRes.status === 401, 'Invalid refresh token rejected with 401 Unauthorized', invalidRefreshRes.data);

    // 5.5 Access token passed as refresh token
    const accessAsRefreshRes = await makeRequest('POST', '/api/auth/refresh', {
      refreshToken: citizenToken,
    });
    assert(accessAsRefreshRes.status === 401, 'Access token passed as refresh token is rejected with 401 Unauthorized', accessAsRefreshRes.data);

    // ----------------------------------------------------
    // Section 6: Profile & Role Authorization
    // ----------------------------------------------------
    console.log('\n--- Section 6: Profile & Role Authorization ---');
    // 6.1 Citizen profile
    const meCitizenRes = await makeRequest('GET', '/api/auth/me', null, citizenToken);
    assert(meCitizenRes.status === 200 && meCitizenRes.data.data.role === 'citizen', 'GET /api/auth/me returns citizen role for citizen token', meCitizenRes.data);

    // 6.2 Officer profile
    const meOfficerRes = await makeRequest('GET', '/api/auth/me', null, officerToken);
    assert(meOfficerRes.status === 200 && meOfficerRes.data.data.role === 'officer', 'GET /api/auth/me returns officer role for officer token', meOfficerRes.data);

    // 6.3 Citizen attempting officer endpoints (403 Forbidden)
    const citizenStatsRes = await makeRequest('GET', '/api/complaints/stats', null, citizenToken);
    assert(citizenStatsRes.status === 403, 'Citizen attempting officer-only GET /api/complaints/stats receives 403 Forbidden', citizenStatsRes.data);

    const citizenAiRes = await makeRequest('POST', '/api/ai/officer-summary', {}, citizenToken);
    assert(citizenAiRes.status === 403, 'Citizen attempting officer-only POST /api/ai/officer-summary receives 403 Forbidden', citizenAiRes.data);

    // 6.4 Officer attempting citizen-only endpoints (403 Forbidden)
    const officerCreateCompRes = await makeRequest(
      'POST',
      '/api/complaints',
      { title: 'Test', description: 'Test', category: 'road', area: 'Jinnah Road' },
      officerToken
    );
    assert(officerCreateCompRes.status === 403, 'Officer attempting citizen-only POST /api/complaints receives 403 Forbidden', officerCreateCompRes.data);

    const officerMineRes = await makeRequest('GET', '/api/complaints/mine', null, officerToken);
    assert(officerMineRes.status === 403, 'Officer attempting citizen-only GET /api/complaints/mine receives 403 Forbidden', officerMineRes.data);

    // ----------------------------------------------------
    // Section 7: Complaint Creation
    // ----------------------------------------------------
    console.log('\n--- Section 7: Complaint Creation ---');
    // 7.1 Valid complaint creation
    const createComp1 = await makeRequest(
      'POST',
      '/api/complaints',
      {
        title: 'Deep crater on main university intersection',
        category: 'road',
        description: 'Vehicles bottoming out and traffic slowed severely during peak hours.',
        area: 'University Road',
        createdBy: 'spoofed_creator_id_12345', // Security check: must be ignored
        status: 'resolved', // Security check: must be ignored
        upvotes: 9999, // Security check: must be ignored
      },
      citizenToken
    );
    assert(
      createComp1.status === 201 &&
      createComp1.data.success === true &&
      createComp1.data.data.status === 'pending' &&
      createComp1.data.data.upvotes === 0 &&
      createComp1.data.data.createdBy._id.toString() === citizenId.toString() &&
      createComp1.data.data.priority !== undefined &&
      createComp1.data.data.priorityScore !== undefined &&
      createComp1.data.data.createdAt !== undefined,
      'Citizen creates complaint: status=pending, upvotes=0, spoofed body fields ignored, createdBy securely bound',
      createComp1.data
    );
    testComplaintId = createComp1.data.data._id;

    // 7.2 Create second complaint by second citizen
    const createComp2 = await makeRequest(
      'POST',
      '/api/complaints',
      {
        title: 'Burst water main flooding residential street',
        category: 'water',
        description: 'Clean drinking water wasted for 3 days.',
        area: 'Satellite Town',
      },
      secondCitizenToken
    );
    secondComplaintId = createComp2.data.data._id;

    // 7.3 Missing required fields
    const missingTitleRes = await makeRequest(
      'POST',
      '/api/complaints',
      { category: 'road', description: 'No title provided', area: 'Cantt' },
      citizenToken
    );
    assert(missingTitleRes.status === 400, 'Complaint creation with missing title rejected with 400 Bad Request', missingTitleRes.data);

    const missingCategoryRes = await makeRequest(
      'POST',
      '/api/complaints',
      { title: 'No Category', description: 'Desc', area: 'Cantt' },
      citizenToken
    );
    assert(missingCategoryRes.status === 400, 'Complaint creation with missing category rejected with 400 Bad Request', missingCategoryRes.data);

    const missingAreaRes = await makeRequest(
      'POST',
      '/api/complaints',
      { title: 'No Area', description: 'Desc', category: 'water' },
      citizenToken
    );
    assert(missingAreaRes.status === 400, 'Complaint creation with missing area rejected with 400 Bad Request', missingAreaRes.data);

    const invalidCategoryRes = await makeRequest(
      'POST',
      '/api/complaints',
      { title: 'Alien Invasion', description: 'Desc', category: 'aliens', area: 'Cantt' },
      citizenToken
    );
    assert(invalidCategoryRes.status === 400, 'Complaint creation with invalid category rejected with 400 Bad Request', invalidCategoryRes.data);

    // ----------------------------------------------------
    // Section 8: Complaint Retrieval & Queries
    // ----------------------------------------------------
    console.log('\n--- Section 8: Complaint Retrieval & Queries ---');
    // 8.1 Public feed
    const publicList = await makeRequest('GET', '/api/complaints');
    assert(
      publicList.status === 200 &&
      publicList.data.success === true &&
      Array.isArray(publicList.data.data) &&
      publicList.data.data.length >= 14 &&
      publicList.data.data[0].createdBy.password === undefined,
      'Public GET /api/complaints returns complaints list with safe populated creator (no passwords)',
      publicList.data
    );

    // 8.2 Category filter
    const catFilter = await makeRequest('GET', '/api/complaints?category=road');
    assert(
      catFilter.status === 200 &&
      catFilter.data.data.every((c) => c.category === 'road'),
      'Filter ?category=road returns only road complaints',
      catFilter.data
    );

    // 8.3 Status filter
    const statusFilter = await makeRequest('GET', '/api/complaints?status=pending');
    assert(
      statusFilter.status === 200 &&
      statusFilter.data.data.every((c) => c.status === 'pending'),
      'Filter ?status=pending returns only pending complaints',
      statusFilter.data
    );

    // 8.4 Area filter
    const areaFilter = await makeRequest('GET', '/api/complaints?area=University%20Road');
    assert(
      areaFilter.status === 200 &&
      areaFilter.data.data.every((c) => c.area.toLowerCase().includes('university road')),
      'Filter ?area=University Road returns matching area complaints',
      areaFilter.data
    );

    // 8.5 Combined filter
    const combinedFilter = await makeRequest('GET', '/api/complaints?category=water&status=pending');
    assert(
      combinedFilter.status === 200 &&
      combinedFilter.data.data.every((c) => c.category === 'water' && c.status === 'pending'),
      'Combined filter ?category=water&status=pending returns only matching complaints',
      combinedFilter.data
    );

    // 8.6 Sort by recent
    const recentSort = await makeRequest('GET', '/api/complaints?sort=recent');
    const isSortedRecent = recentSort.data.data.every((c, i, arr) => {
      if (i === 0) return true;
      return new Date(arr[i - 1].createdAt) >= new Date(c.createdAt);
    });
    assert(recentSort.status === 200 && isSortedRecent, 'Sort ?sort=recent orders complaints newest first', recentSort.data);

    // 8.7 Sort by upvotes
    const upvotesSort = await makeRequest('GET', '/api/complaints?sort=upvotes');
    const isSortedUpvotes = upvotesSort.data.data.every((c, i, arr) => {
      if (i === 0) return true;
      return (arr[i - 1].upvotes || 0) >= (c.upvotes || 0);
    });
    assert(upvotesSort.status === 200 && isSortedUpvotes, 'Sort ?sort=upvotes orders complaints highest upvotes first', upvotesSort.data);

    // ----------------------------------------------------
    // Section 9: Search Tests
    // ----------------------------------------------------
    console.log('\n--- Section 9: Search Tests ---');
    // 9.1 Search by title keyword
    const searchTitle = await makeRequest('GET', '/api/complaints?search=crater');
    assert(
      searchTitle.status === 200 &&
      searchTitle.data.data.some((c) => c.title.toLowerCase().includes('crater')),
      'Search ?search=crater finds complaints by title keyword',
      searchTitle.data
    );

    // 9.2 Search by description keyword
    const searchDesc = await makeRequest('GET', '/api/complaints?search=vehicles%20bottoming');
    assert(
      searchDesc.status === 200 &&
      searchDesc.data.data.length > 0,
      'Search ?search=vehicles bottoming finds complaints by description keyword',
      searchDesc.data
    );

    // 9.3 Search by area keyword with case variation
    const searchArea = await makeRequest('GET', '/api/complaints?search=uNiVeRsItY');
    assert(
      searchArea.status === 200 &&
      searchArea.data.data.length > 0,
      'Search ?search=uNiVeRsItY matches case-insensitively across area and title',
      searchArea.data
    );

    // 9.4 Search with non-existent keyword
    const searchNone = await makeRequest('GET', '/api/complaints?search=nonexistent_xyz_phrase_123');
    assert(
      searchNone.status === 200 &&
      searchNone.data.data.length === 0,
      'Search with non-existent keyword returns empty array []',
      searchNone.data
    );

    // ----------------------------------------------------
    // Section 10: Get My Complaints & Single Complaint
    // ----------------------------------------------------
    console.log('\n--- Section 10: My Complaints & Single Complaint ---');
    // 10.1 Citizen A's complaints
    const myComplaintsA = await makeRequest('GET', '/api/complaints/mine', null, citizenToken);
    assert(
      myComplaintsA.status === 200 &&
      myComplaintsA.data.data.every((c) => c.createdBy._id.toString() === citizenId.toString()) &&
      myComplaintsA.data.data.some((c) => c._id.toString() === testComplaintId.toString()),
      'GET /api/complaints/mine returns only Citizen A submissions',
      myComplaintsA.data
    );

    // 10.2 Verify Citizen B cannot see Citizen A's items in /mine
    const myComplaintsB = await makeRequest('GET', '/api/complaints/mine', null, secondCitizenToken);
    assert(
      myComplaintsB.status === 200 &&
      !myComplaintsB.data.data.some((c) => c._id.toString() === testComplaintId.toString()),
      'Citizen B /mine excludes Citizen A complaints',
      myComplaintsB.data
    );

    // 10.3 Single complaint retrieval
    const singleCompRes = await makeRequest('GET', `/api/complaints/${testComplaintId}`);
    assert(
      singleCompRes.status === 200 &&
      singleCompRes.data.data._id.toString() === testComplaintId.toString() &&
      singleCompRes.data.data.priority !== undefined,
      'GET /api/complaints/:id returns complete details with dynamic priority',
      singleCompRes.data
    );

    // 10.4 Malformed ID (400)
    const malformedIdRes = await makeRequest('GET', '/api/complaints/not-a-valid-objectid');
    assert(malformedIdRes.status === 400, 'GET /api/complaints/invalid-id handles malformed ObjectId with 400', malformedIdRes.data);

    // 10.5 Non-existent valid ObjectId (404)
    const nonExistentIdRes = await makeRequest('GET', '/api/complaints/60b8d295f1d24a0015f8e999');
    assert(nonExistentIdRes.status === 404, 'GET /api/complaints/non-existent returns 404 Not Found', nonExistentIdRes.data);

    // ----------------------------------------------------
    // Section 11: Upvote & Duplicate Prevention
    // ----------------------------------------------------
    console.log('\n--- Section 11: Upvote & Duplicate Prevention ---');
    // 11.1 Citizen A upvotes complaint
    const initialUpvotes = singleCompRes.data.data.upvotes || 0;
    const upvote1 = await makeRequest('PATCH', `/api/complaints/${testComplaintId}/upvote`, { upvotes: 999999 }, citizenToken);
    assert(
      upvote1.status === 200 &&
      upvote1.data.data.upvotes === initialUpvotes + 1 &&
      upvote1.data.data.upvotedBy.some((uid) => uid.toString() === citizenId.toString()),
      'Citizen A upvotes complaint: count increments atomically by 1, spoofed body upvotes ignored',
      upvote1.data
    );

    // 11.2 Citizen A attempts duplicate upvote
    const dupUpvote1 = await makeRequest('PATCH', `/api/complaints/${testComplaintId}/upvote`, null, citizenToken);
    assert(
      dupUpvote1.status === 400 &&
      dupUpvote1.data.success === false &&
      dupUpvote1.data.message === 'You have already upvoted this complaint',
      'Citizen A duplicate upvote rejected with 400 Bad Request',
      dupUpvote1.data
    );

    // 11.3 Citizen B upvotes same complaint
    const upvote2 = await makeRequest('PATCH', `/api/complaints/${testComplaintId}/upvote`, null, secondCitizenToken);
    assert(
      upvote2.status === 200 &&
      upvote2.data.data.upvotes === initialUpvotes + 2,
      'Citizen B upvotes same complaint: count increments to +2',
      upvote2.data
    );

    // ----------------------------------------------------
    // Section 12: Dynamic Priority Calculation Verification
    // ----------------------------------------------------
    console.log('\n--- Section 12: Priority Boundaries Verification ---');
    const p4 = calculatePriority({ upvotes: 2, createdAt: new Date() }); // 2*2 + 0 = 4 -> low
    const p5 = calculatePriority({ upvotes: 2, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1) }); // 4 + 1 = 5 -> medium
    const p15 = calculatePriority({ upvotes: 7, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1) }); // 14 + 1 = 15 -> medium
    const p16 = calculatePriority({ upvotes: 8, createdAt: new Date() }); // 16 + 0 = 16 -> high
    const p30 = calculatePriority({ upvotes: 15, createdAt: new Date() }); // 30 + 0 = 30 -> high
    const p31 = calculatePriority({ upvotes: 15, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1) }); // 30 + 1 = 31 -> critical

    assert(p4.priority === 'low' && p4.priorityScore === 4, 'Priority score 4 is classified as low');
    assert(p5.priority === 'medium' && p5.priorityScore === 5, 'Priority score 5 is classified as medium');
    assert(p15.priority === 'medium' && p15.priorityScore === 15, 'Priority score 15 is classified as medium');
    assert(p16.priority === 'high' && p16.priorityScore === 16, 'Priority score 16 is classified as high');
    assert(p30.priority === 'high' && p30.priorityScore === 30, 'Priority score 30 is classified as high');
    assert(p31.priority === 'critical' && p31.priorityScore === 31, 'Priority score 31 is classified as critical');

    // ----------------------------------------------------
    // Section 13: Duplicate Complaint Detection
    // ----------------------------------------------------
    console.log('\n--- Section 13: Duplicate Complaint Detection ---');
    // 13.1 Same category + same area (should find duplicates)
    const dupCheck1 = await makeRequest(
      'GET',
      '/api/complaints/duplicates?category=road&area=University%20Road',
      null,
      citizenToken
    );
    assert(
      dupCheck1.status === 200 &&
      dupCheck1.data.success === true &&
      Array.isArray(dupCheck1.data.data.duplicates) &&
      dupCheck1.data.data.duplicates.length > 0 &&
      dupCheck1.data.data.duplicates.every((d) => d.status !== 'resolved'),
      'GET /api/complaints/duplicates finds matching active (pending/in-progress) complaints, excludes resolved',
      dupCheck1.data
    );

    // 13.2 Case insensitive area normalization test
    const dupCheckCase = await makeRequest(
      'GET',
      '/api/complaints/duplicates?category=road&area=uNiVeRsItY%20rOaD',
      null,
      citizenToken
    );
    assert(
      dupCheckCase.status === 200 &&
      dupCheckCase.data.data.duplicates.length > 0,
      'Duplicate detection area matching is case-insensitive',
      dupCheckCase.data
    );

    // ----------------------------------------------------
    // Section 14: Officer Status Updates
    // ----------------------------------------------------
    console.log('\n--- Section 14: Officer Status Updates ---');
    // 14.1 Officer moves pending -> in-progress
    const setInProgress = await makeRequest(
      'PATCH',
      `/api/complaints/${testComplaintId}/status`,
      { status: 'in-progress', remark: 'Municipal road asphalt crew dispatched.' },
      officerToken
    );
    assert(
      setInProgress.status === 200 &&
      setInProgress.data.data.status === 'in-progress' &&
      setInProgress.data.data.officerRemark === 'Municipal road asphalt crew dispatched.',
      'Officer updates status to in-progress with officer remark',
      setInProgress.data
    );

    // 14.2 Officer moves in-progress -> resolved
    const setResolved = await makeRequest(
      'PATCH',
      `/api/complaints/${testComplaintId}/status`,
      { status: 'resolved', remark: 'Crater leveled and repaved with hot bitumen mix.' },
      officerToken
    );
    assert(
      setResolved.status === 200 &&
      setResolved.data.data.status === 'resolved' &&
      setResolved.data.data.feedbackPending === true &&
      setResolved.data.data.resolvedAt !== null,
      'Officer resolves complaint: status=resolved, feedbackPending=true, resolvedAt timestamp set',
      setResolved.data
    );

    // 14.3 Invalid status value
    const badStatusRes = await makeRequest(
      'PATCH',
      `/api/complaints/${testComplaintId}/status`,
      { status: 'invalid_status_xyz' },
      officerToken
    );
    assert(badStatusRes.status === 400, 'Invalid complaint status value is rejected with 400 Bad Request', badStatusRes.data);

    // 14.4 Citizen attempting status update (403)
    const citizenBadStatusRes = await makeRequest(
      'PATCH',
      `/api/complaints/${testComplaintId}/status`,
      { status: 'in-progress' },
      citizenToken
    );
    assert(citizenBadStatusRes.status === 403, 'Citizen attempting status update rejected with 403 Forbidden', citizenBadStatusRes.data);

    // ----------------------------------------------------
    // Section 15: Citizen Feedback Workflow
    // ----------------------------------------------------
    console.log('\n--- Section 15: Citizen Feedback Workflow ---');
    // 15.1 Non-owner citizen attempts feedback on Citizen A's complaint (403 Forbidden)
    const nonOwnerFeedback = await makeRequest(
      'PATCH',
      `/api/complaints/${testComplaintId}/feedback`,
      { rating: 5, comment: 'Trying to rate someone else complaint' },
      secondCitizenToken
    );
    assert(nonOwnerFeedback.status === 403, 'Non-owner citizen attempting feedback is rejected with 403 Forbidden', nonOwnerFeedback.data);

    // 15.2 Feedback on non-resolved complaint
    const unresFeedback = await makeRequest(
      'PATCH',
      `/api/complaints/${secondComplaintId}/feedback`, // second complaint is still pending
      { rating: 5, comment: 'Feedback on pending issue' },
      secondCitizenToken
    );
    assert(unresFeedback.status === 400, 'Feedback on unresolved complaint rejected with 400 Bad Request', unresFeedback.data);

    // 15.3 Invalid rating: rating 0
    const rating0Res = await makeRequest('PATCH', `/api/complaints/${testComplaintId}/feedback`, { rating: 0 }, citizenToken);
    assert(rating0Res.status === 400, 'Rating 0 rejected with 400 Bad Request', rating0Res.data);

    // 15.4 Invalid rating: rating 6
    const rating6Res = await makeRequest('PATCH', `/api/complaints/${testComplaintId}/feedback`, { rating: 6 }, citizenToken);
    assert(rating6Res.status === 400, 'Rating 6 rejected with 400 Bad Request', rating6Res.data);

    // 15.5 Invalid rating: non-number string
    const ratingStrRes = await makeRequest('PATCH', `/api/complaints/${testComplaintId}/feedback`, { rating: 'super_good' }, citizenToken);
    assert(ratingStrRes.status === 400, 'Non-number rating string rejected with 400 Bad Request', ratingStrRes.data);

    // 15.6 Valid feedback submission by complaint owner
    const validFeedbackRes = await makeRequest(
      'PATCH',
      `/api/complaints/${testComplaintId}/feedback`,
      { rating: 5, comment: 'Road was repaired very quickly. Excellent work!' },
      citizenToken
    );
    assert(
      validFeedbackRes.status === 200 &&
      validFeedbackRes.data.data.feedbackGiven === true &&
      validFeedbackRes.data.data.feedbackPending === false &&
      validFeedbackRes.data.data.feedbackRating === 5 &&
      validFeedbackRes.data.data.feedbackComment === 'Road was repaired very quickly. Excellent work!',
      'Complaint owner submits feedback: rating, comment saved, feedbackGiven=true, feedbackPending=false',
      validFeedbackRes.data
    );

    // 15.7 Duplicate feedback submission attempt
    const dupFeedbackRes = await makeRequest(
      'PATCH',
      `/api/complaints/${testComplaintId}/feedback`,
      { rating: 4, comment: 'Trying to rate a second time' },
      citizenToken
    );
    assert(
      dupFeedbackRes.status === 400 && dupFeedbackRes.data.success === false,
      'Duplicate feedback submission attempt rejected with 400 Bad Request',
      dupFeedbackRes.data
    );

    // ----------------------------------------------------
    // Section 16: Officer Statistics
    // ----------------------------------------------------
    console.log('\n--- Section 16: Officer Statistics & DB Cross-Check ---');
    const officerStatsRes = await makeRequest('GET', '/api/complaints/stats', null, officerToken);
    assert(
      officerStatsRes.status === 200 &&
      officerStatsRes.data.success === true &&
      typeof officerStatsRes.data.data.total === 'number' &&
      typeof officerStatsRes.data.data.pending === 'number' &&
      typeof officerStatsRes.data.data.inProgress === 'number' &&
      typeof officerStatsRes.data.data.resolved === 'number' &&
      typeof officerStatsRes.data.data.critical === 'number' &&
      typeof officerStatsRes.data.data.high === 'number' &&
      Array.isArray(officerStatsRes.data.data.topCategories) &&
      Array.isArray(officerStatsRes.data.data.topAreas) &&
      typeof officerStatsRes.data.data.averageFeedbackRating === 'number',
      'GET /api/complaints/stats returns aggregated metrics across all categories and areas',
      officerStatsRes.data
    );

    // Cross check with DB counts
    const dbTotal = await Complaint.countDocuments({});
    const dbPending = await Complaint.countDocuments({ status: 'pending' });
    const dbResolved = await Complaint.countDocuments({ status: 'resolved' });
    assert(
      officerStatsRes.data.data.total === dbTotal &&
      officerStatsRes.data.data.pending === dbPending &&
      officerStatsRes.data.data.resolved === dbResolved,
      'Statistics metrics match exact MongoDB collection document counts'
    );

    // ----------------------------------------------------
    // Section 16b: CSV Export (Section 5.14)
    // ----------------------------------------------------
    console.log('\n--- Section 16b: CSV Export (Section 5.14) & Role Security ---');
    const csvExportRes = await makeRequest('GET', '/api/complaints/export?category=road', null, officerToken);
    const csvText = typeof csvExportRes.data === 'string' ? csvExportRes.data : csvExportRes.data?.raw;
    assert(
      csvExportRes.status === 200 &&
      csvExportRes.headers['content-type'] &&
      csvExportRes.headers['content-type'].includes('text/csv') &&
      typeof csvText === 'string' &&
      csvText.includes('Ticket ID') &&
      csvText.includes('Category'),
      'GET /api/complaints/export streams formatted CSV file with Content-Type text/csv',
      csvExportRes.data
    );

    const citizenCsvRes = await makeRequest('GET', '/api/complaints/export', null, citizenToken);
    assert(
      citizenCsvRes.status === 403,
      'Citizen attempting CSV export rejected with 403 Forbidden',
      citizenCsvRes.data
    );

    // ----------------------------------------------------
    // Section 17: Gemini AI Officer Briefing & Privacy Verification
    // ----------------------------------------------------
    console.log('\n--- Section 17: Gemini AI Officer Briefing & Privacy Verification ---');
    // 17.1 Real Gemini AI Call
    const aiBriefingRes = await makeRequest('POST', '/api/ai/officer-summary', {}, officerToken);
    assert(
      aiBriefingRes.status === 200 &&
      aiBriefingRes.data.success === true &&
      typeof aiBriefingRes.data.data.summary === 'string' &&
      aiBriefingRes.data.data.summary.length > 20,
      'POST /api/ai/officer-summary returns real Gemini-generated operational summary',
      aiBriefingRes.data
    );

    if (aiBriefingRes.status === 200) {
      console.log('\n\x1b[36m[Real Gemini AI Generated Briefing]:\x1b[0m');
      console.log(`"${aiBriefingRes.data.data.summary}"\n`);
    }

    // 17.2 Privacy Verification: Inspect payload passed to Gemini
    assert(
      aiBriefingRes.data.data.stats !== undefined &&
      aiBriefingRes.data.data.stats.citizenNames === undefined &&
      aiBriefingRes.data.data.stats.citizenEmails === undefined &&
      aiBriefingRes.data.data.stats.passwords === undefined,
      'Gemini AI payload privacy verified: strictly aggregated numbers, NO citizen PII'
    );

    // 17.3 Gemini Failure Handling when unconfigured (503 Service Unavailable)
    const savedApiKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = '';
    const unconfiguredAiRes = await makeRequest('POST', '/api/ai/officer-summary', {}, officerToken);
    assert(
      unconfiguredAiRes.status === 503 && unconfiguredAiRes.data.success === false,
      'Unconfigured Gemini API key gracefully returns 503 Service Unavailable without server crash',
      unconfiguredAiRes.data
    );
    process.env.GEMINI_API_KEY = savedApiKey;

    // ----------------------------------------------------
    // Section 18: Malformed Request & Error Handling
    // ----------------------------------------------------
    console.log('\n--- Section 18: Malformed Request & Error Handling ---');
    // 18.1 Malformed JSON body
    const badJsonRes = await makeRequest('POST', '/api/auth/login', null, null, '{ bad_json_syntax: true');
    assert(
      badJsonRes.status === 400 && badJsonRes.data.success === false,
      'Malformed JSON body in request returns 400 Bad Request with standardized error message',
      badJsonRes.data
    );

    // 18.2 Nonexistent route
    const notFoundRes = await makeRequest('GET', '/api/unknown_route_xyz_123');
    assert(
      notFoundRes.status === 404 && notFoundRes.data.success === false,
      'Non-existent route returns 404 Not Found in standard JSON format',
      notFoundRes.data
    );

    // ----------------------------------------------------
    // Section 19: Full End-to-End User Story
    // ----------------------------------------------------
    console.log('\n--- Section 19: Full End-to-End User Journey ---');
    const flowCitizenEmail = `journey_citizen_${Date.now()}@example.com`;
    const flowSignup = await makeRequest('POST', '/api/auth/signup', {
      name: 'Journey Citizen',
      email: flowCitizenEmail,
      password: 'Password123!',
    });
    const flowCitizenToken = flowSignup.data.data.accessToken;

    const flowCreate = await makeRequest(
      'POST',
      '/api/complaints',
      {
        title: 'Open transformer door in residential area',
        description: 'Children playing nearby exposed to high voltage.',
        category: 'electricity',
        area: 'Brewery Road',
      },
      flowCitizenToken
    );
    const flowComplaintId = flowCreate.data.data._id;

    // Citizen B logs in & upvotes
    const flowUpvote = await makeRequest('PATCH', `/api/complaints/${flowComplaintId}/upvote`, null, secondCitizenToken);
    assert(flowUpvote.status === 200 && flowUpvote.data.data.upvotes === 1, 'End-to-End: Citizen B upvotes newly created complaint');

    // Citizen B second upvote rejected
    const flowDupUpvote = await makeRequest('PATCH', `/api/complaints/${flowComplaintId}/upvote`, null, secondCitizenToken);
    assert(flowDupUpvote.status === 400, 'End-to-End: Citizen B duplicate upvote is rejected');

    // Officer sets In Progress
    const flowProg = await makeRequest(
      'PATCH',
      `/api/complaints/${flowComplaintId}/status`,
      { status: 'in-progress', remark: 'High voltage electrical squad dispatched.' },
      officerToken
    );
    assert(flowProg.status === 200 && flowProg.data.data.status === 'in-progress', 'End-to-End: Officer updates status to in-progress with remark');

    // Officer sets Resolved
    const flowResolv = await makeRequest(
      'PATCH',
      `/api/complaints/${flowComplaintId}/status`,
      { status: 'resolved', remark: 'Padlock installed and circuit box secured.' },
      officerToken
    );
    assert(flowResolv.status === 200 && flowResolv.data.data.status === 'resolved', 'End-to-End: Officer updates status to resolved');

    // Citizen submits feedback
    const flowFeed = await makeRequest(
      'PATCH',
      `/api/complaints/${flowComplaintId}/feedback`,
      { rating: 5, comment: 'Thank you for securing the electrical box so quickly!' },
      flowCitizenToken
    );
    assert(flowFeed.status === 200 && flowFeed.data.data.feedbackGiven === true, 'End-to-End: Citizen submits feedback on resolved issue');

    // Citizen duplicate feedback rejected
    const flowDupFeed = await makeRequest(
      'PATCH',
      `/api/complaints/${flowComplaintId}/feedback`,
      { rating: 5, comment: 'Submitting duplicate feedback' },
      flowCitizenToken
    );
    assert(flowDupFeed.status === 400, 'End-to-End: Duplicate feedback attempt rejected');

    console.log('\n  \x1b[32m✔ End-to-End Multi-Actor Journey Completed Successfully!\x1b[0m');

  } catch (err) {
    console.error('\x1b[31m[Test Suite Fatal Error]:\x1b[0m', err);
    failedTests++;
  } finally {
    console.log('\n======================================================');
    console.log(`   FINAL TEST RESULTS SUMMARY:`);
    console.log(`   Total Tests:  ${totalTests}`);
    console.log(`   \x1b[32mPassed:\x1b[0m        ${passedTests}`);
    console.log(`   \x1b[31mFailed:\x1b[0m        ${failedTests}`);
    console.log('======================================================\n');

    if (server) {
      server.close();
    }
    process.exit(failedTests > 0 ? 1 : 0);
  }
};

const bootstrapAndRun = async () => {
  try {
    await connectDB();
    await seedDatabase();

    server = app.listen(PORT, async () => {
      baseUrl = `http://127.0.0.1:${PORT}`;
      console.log(`[Test Runner] Live test server listening on ${baseUrl}`);
      await runAggressiveSuite();
    });
  } catch (err) {
    console.error('[Test Runner Bootstrap Error]:', err);
    process.exit(1);
  }
};

bootstrapAndRun();
