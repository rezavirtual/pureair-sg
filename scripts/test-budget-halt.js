import { BudgetGuard } from '../src/budget-guard.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testLedgerPath = path.join(__dirname, '..', 'data', 'test-budget-halt-ledger.json');

console.log('\n================================================================================');
console.log('🧪 TESTING STRICT API BUDGET HALT ERROR HANDLING');
console.log('================================================================================\n');

// Initialize a test ledger with S$5.00 SGD limit and 85% halt limit (S$4.25 SGD)
const initialTestLedger = {
  maxBudgetSgd: 5.00,
  haltThresholdPercent: 85,
  hardHaltLimitSgd: 4.25,
  totalCostSgd: 4.20, // Already at S$4.20 SGD (84% of budget)
  totalCostUsd: 3.13,
  totalCalls: 85,
  totalPromptTokens: 52000,
  totalCompletionTokens: 68000,
  status: 'WARNING_APPROACHING_LIMIT',
  lastUpdated: new Date().toISOString(),
  history: []
};

fs.writeFileSync(testLedgerPath, JSON.stringify(initialTestLedger, null, 2), 'utf-8');

const guard = new BudgetGuard(testLedgerPath);
console.log(`Current Test Ledger Spend: S$${guard.getLedger().totalCostSgd.toFixed(2)} SGD`);
console.log(`Hard Halt Threshold:      S$${guard.getLedger().hardHaltLimitSgd.toFixed(2)} SGD (85% limit)\n`);

console.log('Simulating an incoming Gemini API call with estimated cost S$0.06 SGD...');
console.log('Projected spend would be: S$4.20 + S$0.06 = S$4.26 SGD (Exceeds S$4.25 limit)\n');

try {
  // This call MUST fail and throw an error to strictly halt the pipeline
  guard.assertBudgetAvailable(0.06);
  console.error('❌ TEST FAILED: Budget assertion did NOT halt the script!');
  process.exit(1);
} catch (err) {
  console.log('\n\x1b[32m✔ TEST PASSED: BudgetGuard successfully intercepted the call and HALTED execution!\x1b[0m');
  console.log(`Captured Error Message: "${err.message}"`);
  
  const updatedLedger = guard.getLedger();
  console.log(`Updated Ledger Status: \x1b[31m${updatedLedger.status}\x1b[0m\n`);
  
  // Cleanup test file
  fs.unlinkSync(testLedgerPath);
  console.log('Test ledger safely cleaned up.');
  console.log('================================================================================\n');
}
