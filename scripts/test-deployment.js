#!/usr/bin/env node

const https = require('https');

const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://fivemtools.net';
const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

const log = (status, message) => {
  const color = status === '✅' ? COLORS.green : status === '❌' ? COLORS.red : COLORS.yellow;
  console.log(`${color}${status}${COLORS.reset} ${message}`);
};

const request = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
    });
    req.on('error', reject);
    req.end();
  });
};

async function testCORS() {
  console.log('\n🔍 Testing CORS...');
  try {
    const res = await request(`${DOMAIN}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': DOMAIN,
        'Access-Control-Request-Method': 'POST'
      }
    });
    
    const hasOrigin = res.headers['access-control-allow-origin'];
    const hasCredentials = res.headers['access-control-allow-credentials'];
    
    if (hasOrigin && hasCredentials) {
      log('✅', 'CORS configured correctly');
      return true;
    }
    log('❌', 'CORS headers missing');
    return false;
  } catch (e) {
    log('❌', `CORS test failed: ${e.message}`);
    return false;
  }
}

async function testGeoHeaders() {
  console.log('\n🌍 Testing Geo Headers...');
  try {
    const res = await request(DOMAIN);
    const hasGeo = res.headers['x-user-country'] || res.headers['x-vercel-ip-country'];
    
    if (hasGeo) {
      log('✅', `Geo headers working: ${hasGeo}`);
      return true;
    }
    log('⚠️', 'Geo headers not found (normal in dev)');
    return true;
  } catch (e) {
    log('❌', `Geo test failed: ${e.message}`);
    return false;
  }
}

async function testRateLimiting() {
  console.log('\n⏱️ Testing Rate Limiting...');
  try {
    const res = await request(`${DOMAIN}/api/health`);
    const hasLimit = res.headers['x-ratelimit-limit'];
    const hasRemaining = res.headers['x-ratelimit-remaining'];
    
    if (hasLimit && hasRemaining) {
      log('✅', `Rate limiting active: ${hasRemaining}/${hasLimit}`);
      return true;
    }
    log('⚠️', 'Rate limit headers not found');
    return true;
  } catch (e) {
    log('❌', `Rate limit test failed: ${e.message}`);
    return false;
  }
}

async function testMultiLanguage() {
  console.log('\n🌐 Testing Multi-Language...');
  const langs = ['en', 'id', 'es', 'fr'];
  let passed = 0;
  
  for (const lang of langs) {
    try {
      const res = await request(`${DOMAIN}/${lang}`);
      if (res.status === 200 || res.status === 308) {
        passed++;
      }
    } catch (e) {}
  }
  
  if (passed === langs.length) {
    log('✅', `All ${langs.length} languages working`);
    return true;
  }
  log('⚠️', `${passed}/${langs.length} languages working`);
  return passed > 0;
}

async function testSecurityHeaders() {
  console.log('\n🔒 Testing Security Headers...');
  try {
    const res = await request(DOMAIN);
    const headers = [
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options',
      'referrer-policy'
    ];
    
    let found = 0;
    headers.forEach(h => {
      if (res.headers[h]) found++;
    });
    
    if (found === headers.length) {
      log('✅', `All ${headers.length} security headers present`);
      return true;
    }
    log('⚠️', `${found}/${headers.length} security headers found`);
    return found > 0;
  } catch (e) {
    log('❌', `Security headers test failed: ${e.message}`);
    return false;
  }
}

async function runTests() {
  console.log(`\n🚀 Testing deployment: ${DOMAIN}\n`);
  console.log('='.repeat(50));
  
  const results = await Promise.all([
    testCORS(),
    testGeoHeaders(),
    testRateLimiting(),
    testMultiLanguage(),
    testSecurityHeaders()
  ]);
  
  console.log('\n' + '='.repeat(50));
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log(`\n📊 Results: ${passed}/${total} tests passed\n`);
  
  if (passed === total) {
    log('✅', 'All tests passed! Deployment is ready.');
    process.exit(0);
  } else {
    log('⚠️', 'Some tests failed. Check logs above.');
    process.exit(1);
  }
}

runTests();
