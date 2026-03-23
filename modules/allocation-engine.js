import { roundCurrency } from './utils.js';

export function calculateInitialPaymentAmount(authorizedRow, referenceManager) {
  const rule = referenceManager.getInstallmentRule(authorizedRow.installment_structure);
  const total = Number(authorizedRow.authorized_amount || 0);
  if (rule.initial_payment_type === 'full_amount') return roundCurrency(total);
  if (rule.initial_payment_type === 'fixed_amount') return roundCurrency(Math.min(total, Number(rule.initial_payment_value || 0)));
  return roundCurrency(total * Number(rule.initial_payment_value || 0));
}

export function performPass1Allocation(rows, takerTarget, categoryBudget) {
  const eligible = rows.filter((row) => row.is_valid && Number(row.authorized_amount || 0) > 0);
  const allocations = new Map(eligible.map((row) => [row.authorized_bonus_id, 0]));
  if (!eligible.length || takerTarget <= 0 || categoryBudget <= 0) {
    return { allocations, supportableTakers: 0 };
  }

  let assigned = 0;
  let budgetUsed = 0;
  while (assigned < takerTarget) {
    let progress = false;
    for (const row of eligible) {
      if (assigned >= takerTarget) break;
      const nextBudget = budgetUsed + Number(row.authorized_amount || 0);
      if (nextBudget > categoryBudget + 0.01) continue;
      allocations.set(row.authorized_bonus_id, (allocations.get(row.authorized_bonus_id) || 0) + 1);
      assigned += 1;
      budgetUsed = nextBudget;
      progress = true;
      if (assigned >= takerTarget) break;
    }
    if (!progress) break;
  }

  return { allocations, supportableTakers: assigned };
}

export function performPass2Shift(rows, allocations, targetAvgInitialBonus, categoryBudget, referenceManager) {
  if (!targetAvgInitialBonus) {
    return { allocations, shiftCount: 0, achievedAvgInitialBonus: calculateAchievedAverage(rows, allocations, referenceManager) };
  }
  const working = new Map(allocations);
  let shiftCount = 0;
  let improved = true;
  const maxIterations = 200;
  let iterations = 0;

  while (improved && iterations < maxIterations) {
    iterations += 1;
    improved = false;
    const currentAvg = calculateAchievedAverage(rows, working, referenceManager);
    const currentDelta = Math.abs(currentAvg - targetAvgInitialBonus);

    for (const fromRow of rows) {
      const fromCount = working.get(fromRow.authorized_bonus_id) || 0;
      if (fromCount <= 0) continue;
      for (const toRow of rows) {
        if (fromRow.authorized_bonus_id === toRow.authorized_bonus_id) continue;
        const nextBudget = calculateProjectedBudgetUsed(rows, working) - Number(fromRow.authorized_amount || 0) + Number(toRow.authorized_amount || 0);
        if (nextBudget > categoryBudget + 0.01) continue;
        const test = new Map(working);
        test.set(fromRow.authorized_bonus_id, fromCount - 1);
        test.set(toRow.authorized_bonus_id, (test.get(toRow.authorized_bonus_id) || 0) + 1);
        const nextAvg = calculateAchievedAverage(rows, test, referenceManager);
        const nextDelta = Math.abs(nextAvg - targetAvgInitialBonus);
        if (nextDelta + 0.01 < currentDelta) {
          working.clear();
          test.forEach((value, key) => working.set(key, value));
          shiftCount += 1;
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }

  return { allocations: working, shiftCount, achievedAvgInitialBonus: calculateAchievedAverage(rows, working, referenceManager) };
}

export function calculateProjectedBudgetUsed(rows, allocations) {
  return rows.reduce((sum, row) => sum + (allocations.get(row.authorized_bonus_id) || 0) * Number(row.authorized_amount || 0), 0);
}

export function calculateAchievedAverage(rows, allocations, referenceManager) {
  const weightedInitial = rows.reduce((sum, row) => sum + calculateInitialPaymentAmount(row, referenceManager) * (allocations.get(row.authorized_bonus_id) || 0), 0);
  const totalTakers = rows.reduce((sum, row) => sum + (allocations.get(row.authorized_bonus_id) || 0), 0);
  return totalTakers ? roundCurrency(weightedInitial / totalTakers) : 0;
}
