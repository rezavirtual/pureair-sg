const targetAsins = [
  { asin: 'B0D6Z74WJY', name: 'Tractive Smart Dog GPS Tracker' },
  { asin: 'B0H6GGW9RH', name: 'Life360 Pet GPS Tracker for Dogs' },
  { asin: 'B0D63657GY', name: 'Tile by Life360 Mate (2024) Bluetooth Tracker' },
  { asin: 'B00VKPTWIK', name: 'Nite Ize NiteHowl Rechargeable LED Collar' },
  { asin: 'B0G52NY6HZ', name: 'Tractive XL Smarter Dog GPS Tracker' },
  { asin: 'B08HLT5PNV', name: 'PETLIBRO Automatic Pet Feeder Granary 6L' },
  { asin: 'B0B5ZJBC8L', name: 'PETLIBRO Smart Feeder with 1080p Video Camera' },
  { asin: 'B09S8WMJY9', name: 'PETLIBRO Automatic Cat Feeder 5G WiFi' },
  { asin: 'B0G6ZMT8T3', name: 'PETLIBRO Stainless Steel Cordless Water Fountain' },
  { asin: 'B09DSVFNRW', name: 'Tomxcute Stainless Steel Smart Water Fountain' },
  { asin: 'B0021L8W6K', name: 'PetSafe BOLT Interactive Laser Cat Toy' },
  { asin: 'B0F1SBK31K', name: 'Pawfit Lite 4G Smart GPS Pet Activity Tracker' },
  { asin: 'B0GKGDZ726', name: 'Tractive Smart Cat GPS & Health Tracker Mini' }
];

async function verifyAll13() {
  console.log(`Verifying target 13 Amazon.sg listings...\n`);
  let allPass = true;

  for (let i = 0; i < targetAsins.length; i++) {
    const item = targetAsins[i];
    const url = `https://www.amazon.sg/dp/${item.asin}/?tag=pettechsg-22&linkCode=ogi&th=1&psc=1`;
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      const body = await res.text();
      const titleMatch = body.match(/<span id="productTitle"[^>]*>([\s\S]*?)<\/span>/i);
      const isProduct = res.status === 200 && titleMatch && !body.includes('Page Not Found');

      if (isProduct) {
        console.log(`✔ [${i + 1}/13] PASS (200 OK): [${item.asin}] ${item.name}`);
        console.log(`   Direct Amazon.sg Title: "${titleMatch[1].trim().substring(0, 60)}..."`);
      } else {
        console.error(`❌ [${i + 1}/13] FAIL: [${item.asin}] Status=${res.status}`);
        allPass = false;
      }
    } catch (e) {
      console.error(`❌ [${i + 1}/13] ERROR: [${item.asin}] ${e.message}`);
      allPass = false;
    }
  }

  console.log('\n==================================================');
  if (allPass) {
    console.log('✨ 100% SUCCESS: ALL 13 ASINs ARE LIVE, 200 OK SINGLE PRODUCT PAGES ON AMAZON.SG!');
  } else {
    console.error('❌ SOME ASINs FAILED!');
    process.exit(1);
  }
}

verifyAll13();
