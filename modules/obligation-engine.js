import { formatDate, roundCurrency, uid } from './utils.js';

export function buildObligationModel({ approvals, planningAllocations, authorizedRecords, selectedFy }) {
  const authorizedIndex = new Map(authorizedRecords.map((row) => [row.authorized_bonus_id, row]));
  const actualObligations = approvals
    .filter((record) => record.status === 'Approved' && record.is_valid)
    .map((record) => ({
      obligation_record_id: uid('obligation-actual'),
      source_mode: 'Actual',
      source_record_id: record.approved_bonus_record_id,
      approved_bonus_record_id: record.approved_bonus_record_id,
      authorized_bonus_id: record.match_authorized_bonus_id,
      category: record.category,
      budget_line_item: record.budget_line_item,
      oe: record.oe,
      bonus_type: record.bonus_type,
      obligation_date: formatDate(record.obligation_date || record.approval_date),
      obligation_fy: record.obligation_fy,
      obligation_amount: roundCurrency(record.approved_amount),
      installment_structure: record.match_authorized_bonus_id ? authorizedIndex.get(record.match_authorized_bonus_id)?.installment_structure : null,
      exception_flag: record.exception_flag || record.match_status !== 'Matched',
      match_status: record.match_status,
    }))
    .filter((record) => !selectedFy || record.obligation_fy === selectedFy);

  const planningFy = selectedFy || (new Date().getUTCFullYear() + 1);
  const projectedDate = `${planningFy - 1}-10-01`;
  const projectedObligations = planningAllocations
    .filter((row) => row.final_takers > 0)
    .map((row) => ({
      obligation_record_id: uid('obligation-projected'),
      source_mode: 'Projected',
      source_record_id: row.authorized_bonus_id,
      approved_bonus_record_id: null,
      authorized_bonus_id: row.authorized_bonus_id,
      category: row.category,
      budget_line_item: row.budget_line_item,
      oe: row.oe,
      bonus_type: row.bonus_type,
      obligation_date: projectedDate,
      obligation_fy: selectedFy,
      obligation_amount: roundCurrency(row.projected_obligation),
      taker_count: row.final_takers,
      authorized_amount: row.authorized_amount,
      installment_structure: row.installment_structure,
      exception_flag: false,
      match_status: 'Projected',
    }));

  return {
    actualObligations,
    projectedObligations,
    totals: {
      totalActualObligations: roundCurrency(actualObligations.reduce((sum, row) => sum + row.obligation_amount, 0)),
      totalProjectedObligations: roundCurrency(projectedObligations.reduce((sum, row) => sum + row.obligation_amount, 0)),
    },
  };
}
