import { ProfitOptimizer } from '../src/profit-optimizer.js';
import { DailySalesTracker } from './daily-sales-tracker.js';
import { WeeklyMobileReporter } from './send-weekly-mobile-report.js';

async function runWeeklyReview() {
  console.log('================================================================================');
  console.log('📅 GLOWDEVICE SG: WEEKLY SALES & MARKETING PERFORMANCE REVIEW');
  console.log('================================================================================\n');

  // 1. Audit daily sales snapshot
  const tracker = new DailySalesTracker();
  await tracker.runDailyAudit();

  // 2. Generate strategic profit recommendations
  const optimizer = new ProfitOptimizer();
  const report = optimizer.generateWeeklyReview();

  console.log(`Review Timestamp:           ${report.reviewDate}`);
  console.log(`Active Products in Catalog:  ${report.catalogSize}`);
  console.log(`Projected Monthly Comm:     S$${report.projectedMonthlyCommissionSgd} SGD`);
  console.log(`\n🏆 TOP REVENUE PRODUCER:`);
  console.log(`   Product: ${report.topPerformer.title}`);
  console.log(`   ASIN:    ${report.topPerformer.asin}`);
  console.log(`   Yield:   S$${report.topPerformer.yieldPer100Clicks} SGD / 100 clicks`);
  console.log(`\n⚡ TOP IMPULSE COOKIE TRIGGER:`);
  console.log(`   Product: ${report.topCookieTrigger.title}`);
  console.log(`   ASIN:    ${report.topCookieTrigger.asin}`);
  console.log(`   Est CV:  ${report.topCookieTrigger.cvRate}`);
  console.log(`\n📋 STRATEGY DECISION CENTER:`);
  console.log(`   Total Action Proposals:     ${report.recommendedActionsCount}`);
  console.log(`   User Approved Actions:      ${report.approvedActionsCount}`);
  console.log('\n================================================================================');
  console.log('✨ Weekly review completed. Dashboard updated with latest recommendations.');
  console.log('================================================================================\n');

  // 3. Dispatch weekly mobile digest
  const reporter = new WeeklyMobileReporter();
  await reporter.executeWeeklyReport();
}

runWeeklyReview();
