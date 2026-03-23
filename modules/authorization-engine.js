import { MATCH_CONFIDENCE, MATCH_STATUS } from './constants.js';
import { buildLookupKey, roundCurrency } from './utils.js';

function amountMatches(left, right) {
  return Math.abs(roundCurrency(left || 0) - roundCurrency(right || 0)) <= 0.01;
}

function chooseBestCandidate(candidates, approval) {
  if (!candidates.length) return null;
  const scored = candidates.map((candidate) => {
    const sameFy = candidate.fy === approval.obligation_fy || candidate.fy === approval.approval_fy;
    const effectiveDate = candidate.effective_date ? new Date(candidate.effective_date).getTime() : 0;
    const approvalDate = approval.approval_date ? new Date(approval.approval_date).getTime() : Number.MAX_SAFE_INTEGER;
    const datePenalty = effectiveDate > approvalDate ? 1 : 0;
    return {
      candidate,
      sameFy,
      effectiveDate,
      datePenalty,
    };
  }).sort((a, b) => {
    if (a.sameFy !== b.sameFy) return a.sameFy ? -1 : 1;
    if (a.datePenalty !== b.datePenalty) return a.datePenalty - b.datePenalty;
    return b.effectiveDate - a.effectiveDate;
  });

  const first = scored[0];
  const second = scored[1];
  if (second && first.sameFy === second.sameFy && first.datePenalty === second.datePenalty && first.effectiveDate === second.effectiveDate) {
    return { ambiguous: true, candidate: first.candidate };
  }
  return { ambiguous: false, candidate: first.candidate };
}

export function matchApprovalsToAuthorized(approvals = [], authorized = []) {
  const validAuthorized = authorized.filter((record) => record.is_valid);
  const byBonusIdentifier = new Map();
  const byLineIdentifier = new Map();
  const byHierarchy3 = new Map();
  const byHierarchy4 = new Map();
  const byHierarchy5 = new Map();

  validAuthorized.forEach((record) => {
    if (record.bonus_identifier) {
      const key = buildLookupKey([record.bonus_identifier]);
      byBonusIdentifier.set(key, [...(byBonusIdentifier.get(key) || []), record]);
    }
    if (record.line_identifier) {
      const key = buildLookupKey([record.line_identifier]);
      byLineIdentifier.set(key, [...(byLineIdentifier.get(key) || []), record]);
    }
    const key3 = buildLookupKey([record.fy, record.category, record.bonus_type, record.oe, roundCurrency(record.authorized_amount)]);
    byHierarchy3.set(key3, [...(byHierarchy3.get(key3) || []), record]);
    const key4 = buildLookupKey([record.fy, record.category, record.bonus_type, roundCurrency(record.authorized_amount)]);
    byHierarchy4.set(key4, [...(byHierarchy4.get(key4) || []), record]);
    const key5 = buildLookupKey([record.category, record.bonus_type, roundCurrency(record.authorized_amount)]);
    byHierarchy5.set(key5, [...(byHierarchy5.get(key5) || []), record]);
  });

  return approvals.map((approval) => {
    const clone = structuredClone(approval);
    clone.approval_fy = clone.approval_date ? new Date(clone.approval_date).getUTCFullYear() + (new Date(clone.approval_date).getUTCMonth() >= 9 ? 1 : 0) : null;

    const searchSteps = [
      { type: 'identifier', key: clone.bonus_identifier ? buildLookupKey([clone.bonus_identifier]) : null, index: byBonusIdentifier, confidence: MATCH_CONFIDENCE.HIGH },
      { type: 'line', key: clone.line_identifier ? buildLookupKey([clone.line_identifier]) : null, index: byLineIdentifier, confidence: MATCH_CONFIDENCE.HIGH },
      { type: 'fy-category-bonus-oe-amount', key: buildLookupKey([clone.obligation_fy || clone.approval_fy, clone.category, clone.bonus_type, clone.oe, roundCurrency(clone.approved_amount)]), index: byHierarchy3, confidence: MATCH_CONFIDENCE.MEDIUM },
      { type: 'fy-category-bonus-amount', key: buildLookupKey([clone.obligation_fy || clone.approval_fy, clone.category, clone.bonus_type, roundCurrency(clone.approved_amount)]), index: byHierarchy4, confidence: MATCH_CONFIDENCE.MEDIUM },
      { type: 'category-bonus-amount', key: buildLookupKey([clone.category, clone.bonus_type, roundCurrency(clone.approved_amount)]), index: byHierarchy5, confidence: MATCH_CONFIDENCE.LOW },
    ];

    let matched = null;
    for (const step of searchSteps) {
      if (!step.key) continue;
      const candidates = (step.index.get(step.key) || []).filter((candidate) => amountMatches(candidate.authorized_amount, clone.approved_amount));
      if (!candidates.length) continue;
      const choice = chooseBestCandidate(candidates, clone);
      if (choice.ambiguous) {
        clone.match_status = MATCH_STATUS.PARTIAL;
        clone.match_confidence = MATCH_CONFIDENCE.LOW;
        clone.exception_flag = true;
        matched = choice.candidate;
        break;
      }
      clone.match_status = MATCH_STATUS.MATCHED;
      clone.match_confidence = step.confidence;
      matched = choice.candidate;
      break;
    }

    if (!matched) {
      clone.match_status = MATCH_STATUS.UNMATCHED;
      clone.match_confidence = MATCH_CONFIDENCE.NONE;
      clone.exception_flag = true;
      return clone;
    }

    clone.match_authorized_bonus_id = matched.authorized_bonus_id;
    if (!clone.category && matched.category) clone.category = matched.category;
    if (!clone.budget_line_item && matched.budget_line_item) clone.budget_line_item = matched.budget_line_item;
    if (!clone.oe && matched.oe) clone.oe = matched.oe;
    if (!clone.bonus_type && matched.bonus_type) clone.bonus_type = matched.bonus_type;
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
