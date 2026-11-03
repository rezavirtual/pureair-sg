import { ProfitOptimizer } from '../src/profit-optimizer.js';

async function run() {
  console.log('================================================================================');
  console.log('📊 GLOWDEVICE SG: SALES & MARKETING PROFIT OPTIMIZATION ENGINE');
  console.log('================================================================================\n');

  const optimizer = new ProfitOptimizer();
  const result = await optimizer.executeOptimization();

  console.log('\n================================================================================');
  console.log('✨ CATALOG OPTIMIZATION COMPLETED');
  console.log(`Top Revenue Anchor:     ${result.topItem}`);
  console.log(`Projected Yield/100:   S$${result.topYield} SGD`);
  console.log(`Output Directory:       ${result.distPath}`);
  console.log('================================================================================\n');
}

run();
