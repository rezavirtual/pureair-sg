import fs from 'fs';
import path from 'path';
import { CONFIG } from './config.js';

export class BudgetGuard {
  constructor(ledgerPath = CONFIG.paths.budgetLedger) {
    this.ledgerPath = ledgerPath;
    this.ensureLedgerExists();
  }

  ensureLedgerExists() {
    const dir = path.dirname(this.ledgerPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.ledgerPath)) {
      const initialLedger = {
        maxBudgetSgd: CONFIG.budget.maxBudgetSgd,
        haltThresholdPercent: CONFIG.budget.haltThresholdPercent,
        hardHaltLimitSgd: +(CONFIG.budget.maxBudgetSgd * (CONFIG.budget.haltThresholdPercent / 100)).toFixed(4),
        totalCostSgd: 0.0000,
        totalCostUsd: 0.0000,
        totalCalls: 0,
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        status: 'HEALTHY',
        lastUpdated: new Date().toISOString(),
        history: []
      };
      fs.writeFileSync(this.ledgerPath, JSON.stringify(initialLedger, null, 2), 'utf-8');
    }
  }

  getLedger() {
    try {
      const data = fs.readFileSync(this.ledgerPath, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      this.ensureLedgerExists();
      return JSON.parse(fs.readFileSync(this.ledgerPath, 'utf-8'));
    }
  }

  saveLedger(ledger) {
    ledger.lastUpdated = new Date().toISOString();
    fs.writeFileSync(this.ledgerPath, JSON.stringify(ledger, null, 2), 'utf-8');
  }

  /**
   * Evaluates if an upcoming API call is safe to execute.
   * Halts completely if the accumulated billing approaches or exceeds the threshold.
   */
  assertBudgetAvailable(estimatedCostSgd = 0.001) {
    const ledger = this.getLedger();
    const projectedSpend = ledger.totalCostSgd + estimatedCostSgd;
    const limit = ledger.hardHaltLimitSgd;
    const maxBudget = ledger.maxBudgetSgd;
    const percentSpent = (projectedSpend / maxBudget) * 100;

    if (projectedSpend >= limit) {
      ledger.status = 'HALTED_BUDGET_EXCEEDED';
      this.saveLedger(ledger);

      const errorMsg = [
        '================================================================================',
        '🚨 CRITICAL SAFETY HALT: API BUDGET LIMIT REACHED / APPROACHING CEILING 🚨',
        '================================================================================',
        `Current Spend:        S$${ledger.totalCostSgd.toFixed(4)} SGD`,
        `Estimated Call Cost:  S$${estimatedCostSgd.toFixed(4)} SGD`,
        `Projected Spend:      S$${projectedSpend.toFixed(4)} SGD`,
        `Safety Halt Limit:    S$${limit.toFixed(4)} SGD (${ledger.haltThresholdPercent}% of S$${maxBudget.toFixed(2)} SGD)`,
        `Budget Exhaustion:    ${percentSpent.toFixed(2)}%`,
        '--------------------------------------------------------------------------------',
        'AUTOMATION HAS BEEN COMPLETELY HALTED TO PREVENT BILLING OVERRUNS.',
        'Please review your API budget settings in .env or inspect data/api-budget-ledger.json.',
        '================================================================================'
      ].join('\n');

      console.error('\x1b[31m' + errorMsg + '\x1b[0m');
      throw new Error(`API Budget Exceeded: Projected S$${projectedSpend.toFixed(4)} >= Halt Limit S$${limit.toFixed(4)} SGD`);
    }

    if (percentSpent >= 70) {
      ledger.status = 'WARNING_APPROACHING_LIMIT';
      this.saveLedger(ledger);
      console.warn(`\x1b[33m⚠️ Budget Warning: Spend at ${percentSpent.toFixed(1)}% (S$${ledger.totalCostSgd.toFixed(4)} / S$${maxBudget.toFixed(2)} SGD)\x1b[0m`);
    }
  }

  /**
   * Records completed API call metrics into the ledger.
   */
  recordUsage({ provider = 'gemini', action = 'rewrite_product', promptTokens = 0, completionTokens = 0, customCostUsd = null }) {
    const ledger = this.getLedger();

    let costUsd = 0;
    if (customCostUsd !== null) {
      costUsd = customCostUsd;
    } else {
      const inputCost = (promptTokens / 1_000_000) * CONFIG.gemini.inputCostPer1M;
      const outputCost = (completionTokens / 1_000_000) * CONFIG.gemini.outputCostPer1M;
      costUsd = +(inputCost + outputCost).toFixed(6);
    }

    const costSgd = +(costUsd * CONFIG.budget.sgdUsdRate).toFixed(6);

    ledger.totalCostUsd = +(ledger.totalCostUsd + costUsd).toFixed(6);
    ledger.totalCostSgd = +(ledger.totalCostSgd + costSgd).toFixed(6);
    ledger.totalCalls += 1;
    ledger.totalPromptTokens += promptTokens;
    ledger.totalCompletionTokens += completionTokens;

    const entry = {
      timestamp: new Date().toISOString(),
      provider,
      action,
      promptTokens,
      completionTokens,
      costUsd,
      costSgd,
      accumulatedSgd: ledger.totalCostSgd
    };

    ledger.history.unshift(entry);
    // Keep last 100 entries
    if (ledger.history.length > 100) {
      ledger.history = ledger.history.slice(0, 100);
    }

    // Check status after recording
    if (ledger.totalCostSgd >= ledger.hardHaltLimitSgd) {
      ledger.status = 'HALTED_BUDGET_EXCEEDED';
    } else if ((ledger.totalCostSgd / ledger.maxBudgetSgd) >= 0.70) {
      ledger.status = 'WARNING_APPROACHING_LIMIT';
    } else {
      ledger.status = 'HEALTHY';
    }

    this.saveLedger(ledger);
    return entry;
  }
}
