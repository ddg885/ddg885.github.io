import { STANDARD_STATUSES, WARNING_THRESHOLDS } from './constants.js';
import { groupBy, roundCurrency, safeDivide } from './utils.js';

export function buildExecutionModel({ authorizedSummary, approvals, planningModel, obligationModel, payoutModel, budgetRecords, selectedFy }) {
  const approvedRows = approvals.filter((record) => record.status === 'Approved' && record.is_valid);
  const cancelledRows = approvals.filter((record) => record.status === 'Cancelled' && record.is_valid);
  const totalRelevantApprovalRows = approvals.length || 1;

  // KPI consistency fix: Actual Obligations must be based directly on Approved rows, not mixed via projected/derived logic.
  const actualObligations = roundCurrency(approvedRows.reduce((sum, row) => sum + Number(row.approved_amount || 0), 0));
  const projectedObligations = roundCurrency(planningModel.totals.projected_obligations || 0);
  const budgetTotal = budgetRecords
    .filter((record) => record.is_valid && (!selectedFy || record.fy === selectedFy))
    .reduce((sum, record) => sum + Number(record.budget_amount || 0), 0);

  const kpis = {
    totalAuthorizedDollars: roundCurrency(authorizedSummary.totalAuthorized),
    totalProjectedObligations: projectedObligations,
    totalActualObligations: actualObligations,
    totalProjectedPayouts: roundCurrency(payoutModel.selectedFyTotals.projectedPayouts),
    totalActualPayouts: roundCurrency(payoutModel.selectedFyTotals.actualPayouts),
    remainingHeadroom: roundCurrency(budgetTotal - actualObligations),
    approvedTakers: approvedRows.length,
    futureLiability: roundCurrency(payoutModel.selectedFyTotals.futureLiability),
  };

  const variances = {
    takerVariance: approvedRows.length - planningModel.totals.supportable_takers,
    obligationVariance: roundCurrency(actualObligations - projectedObligations),
    payoutVariance: roundCurrency(payoutModel.selectedFyTotals.actualPayouts - payoutModel.selectedFyTotals.projectedPayouts),
    executionRate: safeDivide(actualObligations, authorizedSummary.totalAuthorized),
    cancellationRate: safeDivide(cancelledRows.length, approvedRows.length + cancelledRows.length),
    unmappedRecordRate: safeDivide(approvals.filter((record) => record.exception_flag || !record.is_valid).length, totalRelevantApprovalRows),
  };

  const categoryPlans = groupBy(planningModel.categoryRows, (row) => row.category);
  const categoryActuals = groupBy(approvedRows, (row) => row.category || 'Unmapped');
  const varianceTable = Object.keys({ ...categoryPlans, ...categoryActuals }).map((category) => {
    const planRow = categoryPlans[category]?.[0] || { projected_taker_target: 0, supportable_takers: 0, projected_obligations: 0 };
    const actualRows = categoryActuals[category] || [];
    const actualCategoryObligations = actualRows.reduce((sum, row) => sum + Number(row.approved_amount || 0), 0);
    const actualCategoryPayouts = payoutModel.actualPayouts.filter((row) => row.category === category && (!selectedFy || row.payout_fy === selectedFy)).reduce((sum, row) => sum + row.payout_amount, 0);
    const projectedCategoryPayouts = payoutModel.projectedPayouts.filter((row) => row.category === category && (!selectedFy || row.payout_fy === selectedFy)).reduce((sum, row) => sum + row.payout_amount, 0);
    return {
      category,
      projected_takers: planRow.supportable_takers,
      actual_approved_takers: actualRows.length,
      taker_variance: actualRows.length - planRow.supportable_takers,
      projected_obligations: roundCurrency(planRow.projected_obligations),
      actual_obligations: roundCurrency(actualCategoryObligations),
      obligation_variance: roundCurrency(actualCategoryObligations - planRow.projected_obligations),
      projected_payouts: roundCurrency(projectedCategoryPayouts),
      actual_payouts: roundCurrency(actualCategoryPayouts),
      payout_variance: roundCurrency(actualCategoryPayouts - projectedCategoryPayouts),
    };
  });

  const alerts = [];
  if (Math.abs(variances.obligationVariance) > Math.abs(projectedObligations) * WARNING_THRESHOLDS.varianceWarningThresholdPercent) {
    alerts.push('Obligation variance exceeds configured threshold.');
  }
  if (variances.cancellationRate > WARNING_THRESHOLDS.cancellationRateWarningThreshold) {
    alerts.push('Cancellation rate exceeds configured threshold.');
  }
  if (variances.unmappedRecordRate > WARNING_THRESHOLDS.unmappedRecordWarningThreshold) {
    alerts.push('Unmapped / exception rate exceeds configured threshold.');
  }
  if (kpis.remainingHeadroom < -WARNING_THRESHOLDS.budgetOverrunThreshold) {
    alerts.push('Actual obligations exceed budget headroom.');
  }
  const futureLiabilityBase = payoutModel.actualPayouts.concat(payoutModel.projectedPayouts).reduce((sum, row) => sum + row.payout_amount, 0) || 1;
  if ((kpis.futureLiability / futureLiabilityBase) > WARNING_THRESHOLDS.futureLiabilityConcentrationThreshold) {
    alerts.push('Future liability concentration exceeds configured threshold.');
  }

  return {
    kpis,
    variances,
    alerts,
    varianceTable,
    statusCounts: STANDARD_STATUSES.map((status) => ({ status, count: approvals.filter((record) => record.status === status).length })),
  };
}
