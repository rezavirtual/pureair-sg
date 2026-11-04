import fs from 'fs';

let content = fs.readFileSync('C:\\AI\\PureAir-SG\\src\\site-builder.js', 'utf-8');

// 1. Replace head meta
content = content.replace(
  /<title>PureAir SG[\s\S]*?<\/title>[\s\S]*?<meta name="description" content="[\s\S]*?">[\s\S]*?"description": "Singapore's Premier Smart Beauty & Personal Care Tech Authority"/,
  `<title>PureAir SG - Best Smart Dehumidifiers, HEPA Air Purifiers & Mold Defense Singapore (2026)</title>
  <meta name="description" content="Singapore's premier clean air and tropical humidity defense authority. Independent reviews of compressor dehumidifiers, medical-grade H13 HEPA air purifiers, wardrobe moisture absorbers, and laser air quality monitors.">
  <link rel="stylesheet" href="./assets/styles.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PureAir SG",
    "url": "https://pureair-sg.netlify.app",
    "description": "Singapore's Premier Clean Air & Tropical Moisture Defense Authority"`
);

// 2. Replace Guides header
content = content.replace(
  /Singapore Clinical Skincare & Beauty Tech Guides[\s\S]*?Dermatologist-backed buying blueprints designed specifically for Singapore tropical humidity, sun exposure, and hair frizz\./,
  `Singapore Clean Air & Tropical Moisture Defense Guides
        </h2>
        <p style="color: var(--ergo-text-secondary); font-size: 1.05rem; margin-top: 6px;">
          Engineer-tested moisture extraction blueprints and HEPA air purification guides designed specifically for Singapore HDBs, condos, and tropical humidity.`
);

// 3. Replace getSeoGuidesData
const newGuides = `  getSeoGuidesData(products) {
    return [
      {
        slug: 'compressor-vs-desiccant-dehumidifier-singapore-guide',
        seoTitle: 'Compressor vs Desiccant Dehumidifiers: Which is Best for Singapore HDB Flats? (2026)',
        summary: 'Singapore sits at 80% to 90% ambient relative humidity year-round. Discover why rotary compressor units outperform peltier and desiccant models for tropical mold eradication, energy consumption, and laundry drying.',
        heroProduct: products.find(p => p.asin === 'B0GSX4BP21') || products[0],
        content: \`
          <p>Singapore's ambient relative humidity fluctuates between 75% and 95% across the year. In sealed HDB bedrooms and modern condominiums with concrete walls, this excessive moisture triggers rapid black mold (Aspergillus and Cladosporium) growth on walls, leather bags, and bedframes within weeks.</p>
          <p>While inexpensive semiconductor Peltier units struggle to collect even 300ml of water a day, rotary compressor dehumidifiers extract between 10 and 16 liters every 24 hours. They run on eco-friendly R290 refrigerant, consuming less than 220 watts while rapidly dropping indoor humidity from 85% down to a healthy 50% mold-inhibition threshold.</p>
          <h3>What to Look for in a Singapore Dehumidifier</h3>
          <ul>
            <li><strong>Continuous Drainage Port:</strong> Allows direct hose connection into toilet drains or floor traps, bypassing 2L-4L water tank emptying.</li>
            <li><strong>Digital Humidistat Auto-Off:</strong> Automatically shuts off the compressor once 50% relative humidity is reached, slashing electricity bills.</li>
            <li><strong>Active Carbon Pre-Filters:</strong> Traps musty indoor odors and pet dander while dehumidifying damp laundry indoors on rainy monsoon days.</li>
          </ul>
        \`
      },
      {
        slug: 'singapore-haze-pm25-hepa-air-purifier-buying-guide',
        seoTitle: 'Singapore Haze & PM2.5 Defense: Medical-Grade H13 True HEPA Purifier Buying Guide (2026)',
        summary: 'How to safeguard your family from seasonal transboundary haze, road pollution, and volatile indoor VOCs. What CADR ratings and true HEPA filtration you actually need for Singapore master bedrooms.',
        heroProduct: products.find(p => p.asin === 'B08L73QL1V') || products[1],
        content: \`
          <p>During the regional dry season, transboundary smoke haze can push Singapore's 24-hour PSI and PM2.5 concentrations into the unhealthy bracket without warning. Microscopic PM2.5 particles bypass the nasal lining and enter the bloodstream, aggravating asthma, sinus inflammation, and infant allergies.</p>
          <p>True medical-grade H13 HEPA filters capture 99.97% of airborne particulate matter down to 0.3 microns, including fine combustion smoke, dust mite allergens, and pollen spores. When paired with high Clean Air Delivery Rate (CADR) fans, they circulate and purify the entire volume of a typical 4-room HDB living area in under 15 minutes.</p>
          <h3>Key Features for Singapore HEPA Air Purifiers</h3>
          <ul>
            <li><strong>True H13 Certification:</strong> Avoid generic "HEPA-type" filters that leak particles larger than 2.5 microns.</li>
            <li><strong>Laser PM2.5 Air Quality Sensor:</strong> Real-time color-coded LED display and automated fan ramp-up when cooking fumes or haze spike.</li>
            <li><strong>Whisper-Quiet Sleep Mode (Sub-24dB):</strong> Essential for light sleepers in compact Singapore master bedrooms with air conditioning.</li>
          </ul>
        \`
      },
      {
        slug: 'wardrobe-luxury-bag-mold-prevention-singapore',
        seoTitle: 'Preventing Mold on Leather Handbags & Wardrobes in Singapore: Permanent Solutions',
        summary: 'Why disposable silica gel packs and Thirsty Hippo tubs fail in Singapore humidity within 3 weeks. Comparing renewable mini dehumidifiers, dry-box hygrometers, and airtight sealing for luxury leather care.',
        heroProduct: products.find(p => p.asin === 'B0FVFCB9F6') || products[2],
        content: \`
          <p>Every homeowner in Singapore has experienced the heartbreak of opening a built-in wardrobe to discover white powdery mildew fuzz coating leather Chanel, Hermès, or Louis Vuitton bags and designer dress shoes.</p>
          <p>Disposable calcium chloride moisture absorbers quickly fill with caustic alkaline water, posing leakage risks that permanently stain exotic leathers. Compact rechargeable Peltier and renewable silica cartridges offer a non-toxic, spill-proof alternative that keeps wardrobe microclimates dry for years.</p>
          <h3>Best Practices for Tropical Luxury Wardrobe Defense</h3>
          <ul>
            <li><strong>Renewable Moisture Absorbers:</strong> Cordless heating plug desorbs moisture overnight, allowing 300+ reuse cycles.</li>
            <li><strong>Digital Wardrobe Hygrometers:</strong> Track interior wardrobe humidity to ensure it stays between 45% and 55% RH.</li>
            <li><strong>Periodic Airflow:</strong> Never seal damp items in airtight plastic bags; allow breathable dust covers and active moisture extraction.</li>
          </ul>
        \`
      }
    ];
  }`;

content = content.replace(/getSeoGuidesData\(products\) \{[\s\S]*?\}\s*renderGuidePage/, `${newGuides}\n\n  renderGuidePage`);

// 4. Detail page header
content = content.replace(/Key Ergonomic Features/g, 'Key Clean Air & Climate Features');
content = content.replace(/Singapore HDB Ergonomics Blueprint/g, 'Singapore Clean Air & Climate Blueprint');
content = content.replace(/independent ergonomic research publication/g, 'independent clean air and tropical climate research publication');

fs.writeFileSync('C:\\AI\\PureAir-SG\\src\\site-builder.js', content, 'utf-8');
console.log('PureAir SG site-builder.js successfully patched!');
