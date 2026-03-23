import { WARNING_THRESHOLDS } from './constants.js';
import { deriveFiscalYear, formatDate, parseDate, roundCurrency, uid } from './utils.js';

function resolveInstallmentStructure(record, authorizedIndex, referenceManager) {
  const explicit = record.installment_structure;
  if (explicit && referenceManager.getInstallmentRule(explicit)) return explicit;
  if (record.authorized_bonus_id && authorizedIndex.get(record.authorized_bonus_id)?.installment_structure) {
    return authorizedIndex.get(record.authorized_bonus_id).installment_structure;
  }
  return 'Unknown';
}

function addMonths(dateString, months) {
  const date = parseDate(dateString);
  if (!date) return null;
  const clone = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, date.getUTCDate()));
  return formatDate(clone);
}

/**
 * Critical payout fix:
 * - keeps internal precision across non-final installments
 * - uses final_installment_true_up so displayed installments reconcile exactly to obligation
 * - applies anniversary dates at the configured month interval (12 months by default)
 */
function generateSchedule({ sourceMode, sourceRecordId, category, budgetLineItem, authorizedBonusId, totalAmount, obligationDate, installmentStructure, referenceManager }) {
  const rule = referenceManager.getInstallmentRule(installmentStructure);
  const installmentCount = Math.max(Number(rule.installment_count || 1), 1);
  const total = Number(totalAmount || 0);

  let initialAmountInternal = total;
  if (rule.initial_payment_type === 'percent_of_total') {
    initialAmountInternal = total * Number(rule.initial_payment_value || 0);
  } else if (rule.initial_payment_type === 'fixed_amount') {
    initialAmountInternal = Math.min(total, Number(rule.initial_payment_value || 0));
  }

  const internalAmounts = [initialAmountInternal];
  const remainingInstallments = installmentCount - 1;
  const remainingTotal = total - initialAmountInternal;
  if (remainingInstallments > 0) {
    const perInstallmentInternal = rule.anniversary_amount_method === 'equal_remaining'
      ? remainingTotal / remainingInstallments
      : 0;
    for (let index = 0; index < remainingInstallments; index += 1) {
      internalAmounts.push(perInstallmentInternal);
    }
  }

  let displayedRunningTotal = 0;
  return internalAmounts.map((amount, index) => {
    const isFinal = index === internalAmounts.length - 1;
    const displayedAmount = isFinal
      ? roundCurrency(total - displayedRunningTotal)
      : roundCurrency(amount);
    displayedRunningTotal = roundCurrency(displayedRunningTotal + displayedAmount);
    const payoutDate = index === 0
      ? obligationDate
      : addMonths(obligationDate, Number(rule.anniversary_interval_months || 12) * index);

    return {
      installment_record_id: uid('installment'),
      payout_record_id: uid('payout'),
      source_mode: sourceMode,
      source_record_id: sourceRecordId,
      authorized_bonus_id: authorizedBonusId,
      category,
      budget_line_item: budgetLineItem,
      installment_number: index + 1,
      total_installments: installmentCount,
      installment_type: index === 0 ? 'Initial' : 'Anniversary',
      payout_date: payoutDate,
      payout_fy: deriveFiscalYear(payoutDate),
      payout_amount: displayedAmount,
      remaining_balance_after_installment: roundCurrency(Math.max(total - displayedRunningTotal, 0)),
      installment_structure: installmentStructure,
    };
  });
}

export function buildPayoutModel({ actualObligations, projectedObligations, authorizedRecords, referenceManager, selectedFy }) {
  const authorizedIndex = new Map(authorizedRecords.map((row) => [row.authorized_bonus_id, row]));
  const actualPayouts = actualObligations.flatMap((obligation) => generateSchedule({
    sourceMode: 'Actual',
    sourceRecordId: obligation.source_record_id,
    category: obligation.category,
    budgetLineItem: obligation.budget_line_item,
    authorizedBonusId: obligation.authorized_bonus_id,
    totalAmount: obligation.obligation_amount,
    obligationDate: obligation.obligation_date,
    installmentStructure: resolveInstallmentStructure(obligation, authorizedIndex, referenceManager),
    referenceManager,
  }));

  const projectedPayouts = projectedObligations.flatMap((obligation) => generateSchedule({
    sourceMode: 'Projected',
    sourceRecordId: obligation.source_record_id,
    category: obligation.category,
    budgetLineItem: obligation.budget_line_item,
    authorizedBonusId: obligation.authorized_bonus_id,
    totalAmount: obligation.obligation_amount,
    obligationDate: obligation.obligation_date,
    installmentStructure: resolveInstallmentStructure(obligation, authorizedIndex, referenceManager),
    referenceManager,
  }));

  const reconciliationExceptions = [...actualObligations, ...projectedObligations].filter((obligation) => {
    const relevant = [...actualPayouts, ...projectedPayouts].filter((payout) => payout.source_record_id === obligation.source_record_id && payout.source_mode === obligation.source_mode);
    const diff = Math.abs(roundCurrency(relevant.reduce((sum, payout) => sum + payout.payout_amount, 0)) - roundCurrency(obligation.obligation_amount));
    return diff > WARNING_THRESHOLDS.payoutReconciliationTolerance;
  });

  const actualSelectedFy = actualPayouts.filter((payout) => !selectedFy || payout.payout_fy === selectedFy);
  const projectedSelectedFy = projectedPayouts.filter((payout) => !selectedFy || payout.payout_fy === selectedFy);
  const futureLiability = [...actualPayouts, ...projectedPayouts]
    .filter((payout) => selectedFy && payout.payout_fy > selectedFy)
    .reduce((sum, payout) => sum + payout.payout_amount, 0);

  const liabilityByRecord = [...actualObligations, ...projectedObligations].map((obligation) => {
    const payouts = [...actualPayouts, ...projectedPayouts].filter((payout) => payout.source_mode === obligation.source_mode && payout.source_record_id === obligation.source_record_id);
    return {
      source_mode: obligation.source_mode,
      source_record_id: obligation.source_record_id,
      category: obligation.category,
      budget_line_item: obligation.budget_line_item,
      obligation_amount: obligation.obligation_amount,
      payout_count: payouts.length,
      current_fy_payouts: payouts.filter((payout) => !selectedFy || payout.payout_fy === selectedFy).reduce((sum, payout) => sum + payout.payout_amount, 0),
      future_liability: payouts.filter((payout) => selectedFy && payout.payout_fy > selectedFy).reduce((sum, payout) => sum + payout.payout_amount, 0),
    };
  });

  return {
    actualPayouts,
    projectedPayouts,
    selectedFyTotals: {
      actualPayouts: roundCurrency(actualSelectedFy.reduce((sum, payout) => sum + payout.payout_amount, 0)),
      projectedPayouts: roundCurrency(projectedSelectedFy.reduce((sum, payout) => sum + payout.payout_amount, 0)),
      futureLiability: roundCurrency(futureLiability),
    },
    reconciliationExceptions,
    liabilityByRecord,
  };
}
