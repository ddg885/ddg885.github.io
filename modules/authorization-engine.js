import { MATCH_CONFIDENCE, MATCH_STATUS } from './constants.js';
import { buildLookupKey, deriveFiscalYear, parseDate, roundCurrency } from './utils.js';

function amountMatches(left, right) {
  return Math.abs(roundCurrency(left || 0) - roundCurrency(right || 0)) <= 0.01;
}

function approvalFiscalYear(approval) {
  return approval.obligation_fy || deriveFiscalYear(approval.approval_date);
}

/**
 * Mandatory matching fix:
 * - preserves exact hierarchy order
 * - uses same-FY + latest-effective-date-not-after-approval tie breaks
 * - never auto-links a residual tie (Partial + Low + no match_authorized_bonus_id)
 */
function chooseBestCandidate(candidates, approval) {
  if (!candidates.length) return null;

  const approvalFy = approvalFiscalYear(approval);
  const approvalDateValue = parseDate(approval.approval_date)?.getTime() ?? Number.MAX_SAFE_INTEGER;

  const scored = candidates
    .map((candidate) => {
      const effectiveDateValue = parseDate(candidate.effective_date)?.getTime() ?? Number.MIN_SAFE_INTEGER;
      const effectiveOnOrBeforeApproval = effectiveDateValue <= approvalDateValue;
      return {
        candidate,
        sameFy: candidate.fy === approvalFy,
        effectiveOnOrBeforeApproval,
        effectiveDateValue,
      };
    })
    .sort((left, right) => {
      if (left.sameFy !== right.sameFy) return left.sameFy ? -1 : 1;
      if (left.effectiveOnOrBeforeApproval !== right.effectiveOnOrBeforeApproval) {
        return left.effectiveOnOrBeforeApproval ? -1 : 1;
      }
      return right.effectiveDateValue - left.effectiveDateValue;
    });

  const winner = scored[0];
  const runnerUp = scored[1];
  if (runnerUp
    && winner.sameFy === runnerUp.sameFy
    && winner.effectiveOnOrBeforeApproval === runnerUp.effectiveOnOrBeforeApproval
    && winner.effectiveDateValue === runnerUp.effectiveDateValue) {
    return { ambiguous: true, candidate: null };
  }

  return { ambiguous: false, candidate: winner.candidate };
}

function buildIndexes(validAuthorized) {
  const indexes = {
    bonusIdentifier: new Map(),
    lineIdentifier: new Map(),
    hierarchy3: new Map(),
    hierarchy4: new Map(),
    hierarchy5: new Map(),
  };

  validAuthorized.forEach((record) => {
    if (record.bonus_identifier) {
      const key = buildLookupKey([record.bonus_identifier]);
      indexes.bonusIdentifier.set(key, [...(indexes.bonusIdentifier.get(key) || []), record]);
    }
    if (record.line_identifier) {
      const key = buildLookupKey([record.line_identifier]);
      indexes.lineIdentifier.set(key, [...(indexes.lineIdentifier.get(key) || []), record]);
    }

    const key3 = buildLookupKey([record.fy, record.category, record.bonus_type, record.oe, roundCurrency(record.authorized_amount)]);
    indexes.hierarchy3.set(key3, [...(indexes.hierarchy3.get(key3) || []), record]);

    const key4 = buildLookupKey([record.fy, record.category, record.bonus_type, roundCurrency(record.authorized_amount)]);
    indexes.hierarchy4.set(key4, [...(indexes.hierarchy4.get(key4) || []), record]);

    const key5 = buildLookupKey([record.category, record.bonus_type, roundCurrency(record.authorized_amount)]);
    indexes.hierarchy5.set(key5, [...(indexes.hierarchy5.get(key5) || []), record]);
  });

  return indexes;
}

export function matchApprovalsToAuthorized(approvals = [], authorized = []) {
  const validAuthorized = authorized.filter((record) => record.is_valid);
  const indexes = buildIndexes(validAuthorized);

  return approvals.map((approval) => {
    const clone = structuredClone(approval);
    const fy = approvalFiscalYear(clone);
    const searchSteps = [
      {
        label: 'bonus_identifier',
        candidates: clone.bonus_identifier ? indexes.bonusIdentifier.get(buildLookupKey([clone.bonus_identifier])) || [] : [],
        confidence: MATCH_CONFIDENCE.HIGH,
      },
      {
        label: 'line_identifier',
        candidates: clone.line_identifier ? indexes.lineIdentifier.get(buildLookupKey([clone.line_identifier])) || [] : [],
        confidence: MATCH_CONFIDENCE.HIGH,
      },
      {
        label: 'fy-category-bonus-oe-amount',
        candidates: indexes.hierarchy3.get(buildLookupKey([fy, clone.category, clone.bonus_type, clone.oe, roundCurrency(clone.approved_amount)])) || [],
        confidence: MATCH_CONFIDENCE.MEDIUM,
      },
      {
        label: 'fy-category-bonus-amount',
        candidates: indexes.hierarchy4.get(buildLookupKey([fy, clone.category, clone.bonus_type, roundCurrency(clone.approved_amount)])) || [],
        confidence: MATCH_CONFIDENCE.MEDIUM,
      },
      {
        label: 'category-bonus-amount',
        candidates: indexes.hierarchy5.get(buildLookupKey([clone.category, clone.bonus_type, roundCurrency(clone.approved_amount)])) || [],
        confidence: MATCH_CONFIDENCE.LOW,
      },
    ];

    clone.match_status = MATCH_STATUS.UNMATCHED;
    clone.match_confidence = MATCH_CONFIDENCE.NONE;
    clone.match_authorized_bonus_id = null;

    for (const step of searchSteps) {
      const exactAmountCandidates = step.candidates.filter((candidate) => amountMatches(candidate.authorized_amount, clone.approved_amount));
      if (!exactAmountCandidates.length) continue;

      const choice = chooseBestCandidate(exactAmountCandidates, clone);
      if (!choice || choice.ambiguous || !choice.candidate) {
        clone.match_status = MATCH_STATUS.PARTIAL;
        clone.match_confidence = MATCH_CONFIDENCE.LOW;
        clone.exception_flag = true;
        // Mandatory fix: do not auto-link unresolved ties.
        clone.match_authorized_bonus_id = null;
        return clone;
      }

      clone.match_status = MATCH_STATUS.MATCHED;
      clone.match_confidence = step.confidence;
      clone.match_authorized_bonus_id = choice.candidate.authorized_bonus_id;
      if (!clone.category && choice.candidate.category) clone.category = choice.candidate.category;
      if (!clone.budget_line_item && choice.candidate.budget_line_item) clone.budget_line_item = choice.candidate.budget_line_item;
      if (!clone.oe && choice.candidate.oe) clone.oe = choice.candidate.oe;
      if (!clone.bonus_type && choice.candidate.bonus_type) clone.bonus_type = choice.candidate.bonus_type;
      return clone;
    }

    clone.exception_flag = true;
    return clone;
  });
}

export function summarizeAuthorized(authorizedRecords = []) {
  const validRows = authorizedRecords.filter((record) => record.is_valid);
  const totalAuthorized = validRows.reduce((sum, row) => sum + Number(row.authorized_amount || 0), 0);
  const averageAuthorizedAmount = validRows.length ? totalAuthorized / validRows.length : 0;
  return {
    validRows,
    totalAuthorized,
    averageAuthorizedAmount,
    lineItemCount: new Set(validRows.map((row) => row.line_identifier || `${row.category}|${row.budget_line_item}|${row.bonus_type}`)).size,
    unmappedRowsCount: authorizedRecords.filter((row) => row.mapping_status !== 'Mapped' || row.exception_flag).length,
  };
}
