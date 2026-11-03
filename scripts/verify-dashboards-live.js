import https from 'https';

function fetchBody(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function verifyAllDashboards() {
  console.log('================================================================');
  console.log('🌐 LIVE PRODUCTION DASHBOARD INTEGRITY VERIFICATION');
  console.log('================================================================\n');

  const tests = [
    {
      store: 'PetTech SG',
      url: 'https://pettech-sg.netlify.app/dashboard/',
      expectTitle: 'PetTech Singapore',
      expectProducts: ['Tractive Smart Dog GPS Tracker', 'Life360 Pet GPS Tracker'],
      forbiddenTerms: ['ERGOMAKER', 'Standing Desk', 'Sapphire', 'IPL'],
      expectedTag: 'pettechsg-22'
    },
    {
      store: 'ErgoDesk SG',
      url: 'https://ergodesk-sg.netlify.app/dashboard/',
      expectTitle: 'ErgoDesk Singapore',
      expectProducts: ['ERGOMAKER Electric Standing Desk', 'ErGear Electric Height-Adjustable Desk'],
      forbiddenTerms: ['Tractive', 'Life360', 'Sapphire', 'IPL'],
      expectedTag: 'pettechsg-22'
    },
    {
      store: 'GlowDevice SG',
      url: 'https://glowdevice-sg.netlify.app/dashboard/',
      expectTitle: 'GlowDevice SG',
      expectProducts: ['GlowPro Sapphire', 'Nourished Bodynskin'],
      forbiddenTerms: ['ERGOMAKER', 'Standing Desk', 'Tractive', 'Life360'],
      expectedTag: 'pettechsg-22'
    }
  ];

  let allPassed = true;

  for (const t of tests) {
    console.log(`Auditing ${t.store} (${t.url})...`);
    const html = await fetchBody(t.url);

    const hasTitle = html.includes(t.expectTitle);
    const hasTag = html.includes(`Tracking Associate Tag: <strong>${t.expectedTag}</strong>`);
    const prodsFound = t.expectProducts.filter(p => html.includes(p));
    const forbiddenFound = t.forbiddenTerms.filter(f => html.includes(f));

    console.log(`  • Title Check:       ${hasTitle ? '✅ MATCH (' + t.expectTitle + ')' : '❌ FAIL'}`);
    console.log(`  • Master Tag:        ${hasTag ? '✅ MATCH (' + t.expectedTag + ')' : '❌ FAIL'}`);
    console.log(`  • Product Matching:  ${prodsFound.length}/${t.expectProducts.length} verified [${prodsFound.join(', ')}]`);
    console.log(`  • Cross-Pollution:   ${forbiddenFound.length === 0 ? '✅ NONE (Clean Isolation)' : '❌ DETECTED: ' + forbiddenFound.join(', ')}`);

    if (!hasTitle || !hasTag || prodsFound.length !== t.expectProducts.length || forbiddenFound.length > 0) {
      allPassed = false;
      console.log(`  🚨 VERIFICATION FAILED FOR ${t.store}\n`);
    } else {
      console.log(`  ✔ ${t.store} is 100% compliant and isolated.\n`);
    }
  }

  if (allPassed) {
    console.log('================================================================');
    console.log('🎉 ALL 3 DASHBOARDS ARE 100% ACCURATE, ISOLATED, AND LIVE!');
    console.log('================================================================');
  } else {
    console.error('❌ One or more dashboards failed verification.');
    process.exit(1);
  }
}

verifyAllDashboards().catch(err => {
  console.error('Audit fatal error:', err);
  process.exit(1);
});
