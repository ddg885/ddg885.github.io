import { calculateAchievedAverage, calculateInitialPaymentAmount, calculateProjectedBudgetUsed, performPass1Allocation, performPass2Shift } from './allocation-engine.js';
import { groupBy, roundCurrency, safeDivide } from './utils.js';

export function buildPlanningModel({ authorizedRecords, budgetRecords, assumptionRecords, referenceManager, selectedFy }) {
  const validAuthorized = authorizedRecords.filter((record) => record.is_valid && (!selectedFy || record.fy === selectedFy));
  const validBudget = budgetRecords.filter((record) => record.is_valid && (!selectedFy || record.fy === selectedFy));
  const validAssumptions = assumptionRecords.filter((record) => record.is_valid && (!selectedFy || record.fy === selectedFy));
  const authorizedByCategory = groupBy(validAuthorized, (row) => row.category || 'Unmapped');
  const budgetByCategory = groupBy(validBudget, (row) => row.category || 'Unmapped');
  const assumptionsByCategory = groupBy(validAssumptions, (row) => row.category || 'Unmapped');

  const categoryRows = [];
  const allocationRows = [];

  Object.entries(authorizedByCategory).forEach(([category, rows]) => {
    const assumption = assumptionsByCategory[category]?.[0] || null;
    const categoryBudget = (budgetByCategory[category] || []).reduce((sum, row) => sum + Number(row.budget_amount || 0), 0);
    const plannedNeed = Number(assumption?.planned_need || 0);
    const takeRate = assumption?.take_rate;

    // Critical planning fix: lock projected_taker_target to round(planned_need * take_rate).
    const projectedTakerTarget = takeRate === null || takeRate === undefined
      ? plannedNeed
      : Math.round(plannedNeed * takeRate);

    const pass1 = performPass1Allocation(rows, projectedTakerTarget, categoryBudget);
    const pass2 = performPass2Shift(rows, pass1.allocations, assumption?.target_avg_initial_bonus ?? null, categoryBudget, referenceManager);
    const finalTakerCount = rows.reduce((sum, row) => sum + (pass2.allocations.get(row.authorized_bonus_id) || 0), 0);
    const projectedBudgetUsed = calculateProjectedBudgetUsed(rows, pass2.allocations);
    const achievedAvgInitialBonus = calculateAchievedAverage(rows, pass2.allocations, referenceManager);

    categoryRows.push({
      fy: selectedFy,
      category,
      projected_taker_target: projectedTakerTarget,
      supportable_takers: finalTakerCount,
      unfunded_need: Math.max(projectedTakerTarget - finalTakerCount, 0),
      category_budget: roundCurrency(categoryBudget),
      projected_obligations: roundCurrency(projectedBudgetUsed),
      target_avg_initial_bonus: assumption?.target_avg_initial_bonus ?? null,
      achieved_avg_initial_bonus: achievedAvgInitialBonus,
      shift_count: pass2.shiftCount,
      execution_rate_vs_budget: safeDivide(projectedBudgetUsed, categoryBudget),
    });

    rows.forEach((row) => {
      const finalTakers = pass2.allocations.get(row.authorized_bonus_id) || 0;
      const pass1Takers = pass1.allocations.get(row.authorized_bonus_id) || 0;
      allocationRows.push({
        fy: row.fy,
        category: row.category,
        budget_line_item: row.budget_line_item,
        oe: row.oe,
        bonus_type: row.bonus_type,
        authorized_amount: roundCurrency(row.authorized_amount),
        initial_payment_amount: calculateInitialPaymentAmount(row, referenceManager),
        pass1_takers: pass1Takers,
        final_takers: finalTakers,
        projected_obligation: roundCurrency(finalTakers * Number(row.authorized_amount || 0)),
        target_avg_initial_bonus: assumption?.target_avg_initial_bonus ?? null,
        achieved_avg_initial_bonus: achievedAvgInitialBonus,
        shift_count: pass2.shiftCount,
        authorized_bonus_id: row.authorized_bonus_id,
        installment_structure: row.installment_structure,
        effective_date: row.effective_date,
      });
    });
  });

  return {
    categoryRows,
    allocationRows,
    totals: {
      projected_taker_target: categoryRows.reduce((sum, row) => sum + row.projected_taker_target, 0),
      supportable_takers: categoryRows.reduce((sum, row) => sum + row.supportable_takers, 0),
      projected_obligations: roundCurrency(categoryRows.reduce((sum, row) => sum + row.projected_obligations, 0)),
      unfunded_need: categoryRows.reduce((sum, row) => sum + row.unfunded_need, 0),
    },
  };
}
