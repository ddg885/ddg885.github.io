export const APP_TITLE = 'Bonus Ecosystem Platform';
export const APP_VERSION = 'MVP';

export const PAGE_DEFINITIONS = [
  { id: 'home', label: 'Home' },
  { id: 'data-intake', label: 'Data Intake' },
  { id: 'reference-tables', label: 'Reference Tables' },
  { id: 'planning-costing', label: 'Planning & Costing' },
  { id: 'authorized-construct', label: 'Authorized Construct' },
  { id: 'approvals-obligations', label: 'Approvals & Obligations' },
  { id: 'payout-engine', label: 'Payout Engine' },
  { id: 'executive-dashboard', label: 'Executive Dashboard' },
  { id: 'execution-monitoring', label: 'Execution Monitoring' },
];

export const SOURCE_TYPES = {
  AUTHORIZED: 'Authorized Bonus Source',
  APPROVAL: 'Approval / Execution Source',
  BUDGET: 'Budget Source',
  REFERENCE: 'Reference / Crosswalk Source',
  ASSUMPTIONS: 'Assumptions Source',
  PERSONNEL: 'Personnel / Population Source',
};

export const SOURCE_TYPE_OPTIONS = Object.values(SOURCE_TYPES);

export const MODEL_READINESS = {
  READY: 'Ready',
  WARNING: 'Warning',
  NOT_READY: 'Not Ready',
};

export const MATCH_STATUS = {
  MATCHED: 'Matched',
  PARTIAL: 'Partial',
  UNMATCHED: 'Unmatched',
};

export const MATCH_CONFIDENCE = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
  NONE: 'None',
};

export const STANDARD_STATUSES = ['Approved', 'Cancelled', 'Pending', 'Unknown'];
export const STATUS_METRIC_ELIGIBLE = ['Approved', 'Cancelled'];

export const WARNING_THRESHOLDS = {
  varianceWarningThresholdPercent: 0.1,
  cancellationRateWarningThreshold: 0.1,
  unmappedRecordWarningThreshold: 0.05,
  futureLiabilityConcentrationThreshold: 0.5,
  budgetOverrunThreshold: 0,
  payoutReconciliationTolerance: 0.01,
};

export const STORAGE_KEYS = {
  DB_NAME: 'bonus-ecosystem-platform-db',
  DB_STORE: 'appState',
  DB_KEY: 'currentState',
  UI_PREFS: 'bonus-ecosystem-platform-ui-prefs',
};

export const INSTALLMENT_RULE_FIELDS = [
  'installment_structure',
  'installment_count',
  'initial_payment_type',
  'initial_payment_value',
  'anniversary_interval_months',
  'anniversary_amount_method',
  'rounding_method',
];

export const DEFAULT_INSTALLMENT_RULES = [
  {
    installment_structure: 'Lump Sum',
    installment_count: 1,
    initial_payment_type: 'full_amount',
    initial_payment_value: 1,
    anniversary_interval_months: 12,
    anniversary_amount_method: 'none',
    rounding_method: 'final_installment_true_up',
    warning: false,
  },
  {
    installment_structure: 'Initial + Anniversary',
    installment_count: 2,
    initial_payment_type: 'percent_of_total',
    initial_payment_value: 0.5,
    anniversary_interval_months: 12,
    anniversary_amount_method: 'equal_remaining',
    rounding_method: 'final_installment_true_up',
    warning: false,
  },
  {
    installment_structure: 'Initial + Multiple Anniversary',
    installment_count: 4,
    initial_payment_type: 'percent_of_total',
    initial_payment_value: 0.5,
    anniversary_interval_months: 12,
    anniversary_amount_method: 'equal_remaining',
    rounding_method: 'final_installment_true_up',
    warning: false,
  },
  {
    installment_structure: 'Unknown',
    installment_count: 1,
    initial_payment_type: 'full_amount',
    initial_payment_value: 1,
    anniversary_interval_months: 12,
    anniversary_amount_method: 'none',
    rounding_method: 'final_installment_true_up',
    warning: true,
  },
];

export const SOURCE_SCHEMAS = {
  [SOURCE_TYPES.AUTHORIZED]: {
    logicalFields: {
      fy: { required: true, aliases: ['FY', 'Fiscal Year'], type: 'integer' },
      category: { required: true, aliases: ['Category', 'Bonus Category'], type: 'string' },
      budget_line_item: { required: true, aliases: ['Budget Line Item', 'BudgetLineItem', 'Line Item'], type: 'string' },
      oe: { required: true, aliases: ['O/E', 'OE', 'OfficerEnlisted'], type: 'string' },
      bonus_type: { required: true, aliases: ['Bonus Type', 'BonusType', 'Incentive Type'], type: 'string' },
      amount: { required: true, aliases: ['Amount', 'Authorized Amount', 'Bonus Amount'], type: 'number' },
      installment_structure: { required: true, aliases: ['Installment Structure', 'InstallmentStructure', 'Payout Structure'], type: 'string' },
      effective_date: { required: true, aliases: ['Effective Date', 'EffectiveDate'], type: 'date' },
      expiration_date: { required: false, aliases: ['Expiration Date', 'ExpirationDate'], type: 'date' },
      line_identifier: { required: false, aliases: ['Line Identifier', 'LineID', 'Authorized Line ID'], type: 'string' },
      bonus_identifier: { required: false, aliases: ['Bonus Identifier', 'BonusID'], type: 'string' },
    },
  },
  [SOURCE_TYPES.APPROVAL]: {
    logicalFields: {
      member_record_key: { required: true, aliases: ['Member ID', 'MemberID', 'Record Key', 'RecordKey', 'SSN', 'EDIPI', 'Unique Record ID'], type: 'string' },
      status: { required: true, aliases: ['Status', 'SRB Status', 'Approval Status'], type: 'string' },
      approval_date: { required: true, aliases: ['Approval Date', 'ApprovalDate', 'Approved Date'], type: 'date' },
      amount: { required: true, aliases: ['Amount', 'Approved Amount', 'Bonus Amount'], type: 'number' },
      bonus_identifier: { required: false, aliases: ['Bonus Identifier', 'BonusID'], type: 'string' },
      category: { required: false, aliases: ['Category'], type: 'string' },
      budget_line_item: { required: false, aliases: ['Budget Line Item', 'Line Item'], type: 'string' },
      oe: { required: false, aliases: ['O/E', 'OE'], type: 'string' },
      bonus_type: { required: false, aliases: ['Bonus Type'], type: 'string' },
      installment_count: { required: false, aliases: ['Installment Count', 'Installments', 'Num Installments'], type: 'integer' },
      initial_amount: { required: false, aliases: ['Initial Amount', 'Initial Payment', 'Initial Installment'], type: 'number' },
      obligation_date: { required: false, aliases: ['Obligation Date', 'ObligationDate'], type: 'date' },
      payment_date: { required: false, aliases: ['Payment Date', 'PaymentDate'], type: 'date' },
      cancellation_date: { required: false, aliases: ['Cancellation Date', 'Cancel Date'], type: 'date' },
      line_identifier: { required: false, aliases: ['Line Identifier', 'LineID'], type: 'string' },
    },
  },
  [SOURCE_TYPES.BUDGET]: {
    logicalFields: {
      fy: { required: true, aliases: ['FY', 'Fiscal Year'], type: 'integer' },
      budget_line_item: { required: true, aliases: ['Budget Line Item', 'BudgetLineItem', 'Line Item'], type: 'string' },
      category: { required: true, aliases: ['Category'], type: 'string' },
      oe: { required: true, aliases: ['O/E', 'OE'], type: 'string' },
      bonus_type: { required: true, aliases: ['Bonus Type'], type: 'string' },
      amount: { required: true, aliases: ['Amount', 'Budget Amount', 'Budget'], type: 'number' },
    },
  },
  [SOURCE_TYPES.REFERENCE]: {
    logicalFields: {
      reference_type: { required: true, aliases: ['Reference Type', 'ReferenceType'], type: 'string' },
      raw_value: { required: true, aliases: ['Raw Value', 'RawValue'], type: 'string' },
      standard_value: { required: true, aliases: ['Standard Value', 'StandardValue'], type: 'string' },
      is_active: { required: true, aliases: ['Active Flag', 'Active', 'Is Active'], type: 'string' },
      effective_date: { required: false, aliases: ['Effective Date', 'EffectiveDate'], type: 'date' },
      expiration_date: { required: false, aliases: ['Expiration Date', 'ExpirationDate'], type: 'date' },
      notes: { required: false, aliases: ['Notes', 'Comment', 'Comments'], type: 'string' },
    },
  },
  [SOURCE_TYPES.ASSUMPTIONS]: {
    logicalFields: {
      fy: { required: true, aliases: ['FY', 'Fiscal Year'], type: 'integer' },
      category: { required: true, aliases: ['Category'], type: 'string' },
      target_avg_initial_bonus: { required: false, aliases: ['Target Avg Initial Bonus', 'Target Average Initial Bonus', 'TargetInitialAvg'], type: 'number' },
      planned_need: { required: false, aliases: ['Planned Need', 'Need', 'Projected Need'], type: 'integer' },
      take_rate: { required: false, aliases: ['Take Rate', 'TakeRate'], type: 'number' },
      priority_rank: { required: false, aliases: ['Priority Rank', 'Priority'], type: 'integer' },
      distribution_rule: { required: false, aliases: ['Distribution Rule', 'Distribution'], type: 'string' },
      notes: { required: false, aliases: ['Notes'], type: 'string' },
    },
  },
};

export const DEFAULT_REFERENCE_MAPPINGS = [
  { reference_type: 'status', raw_value: 'A', standard_value: 'Approved', is_active: true },
  { reference_type: 'status', raw_value: 'Approved', standard_value: 'Approved', is_active: true },
  { reference_type: 'status', raw_value: 'C', standard_value: 'Cancelled', is_active: true },
  { reference_type: 'status', raw_value: 'Cancelled', standard_value: 'Cancelled', is_active: true },
  { reference_type: 'status', raw_value: 'P', standard_value: 'Pending', is_active: true },
  { reference_type: 'status', raw_value: 'Pending', standard_value: 'Pending', is_active: true },
  { reference_type: 'status', raw_value: '', standard_value: 'Unknown', is_active: true },
  { reference_type: 'oe', raw_value: 'O', standard_value: 'O', is_active: true },
  { reference_type: 'oe', raw_value: 'Officer', standard_value: 'O', is_active: true },
  { reference_type: 'oe', raw_value: 'E', standard_value: 'E', is_active: true },
  { reference_type: 'oe', raw_value: 'Enlisted', standard_value: 'E', is_active: true },
  { reference_type: 'installment_structure', raw_value: 'Lump Sum', standard_value: 'Lump Sum', is_active: true },
  { reference_type: 'installment_structure', raw_value: 'Initial + Anniversary', standard_value: 'Initial + Anniversary', is_active: true },
  { reference_type: 'installment_structure', raw_value: 'Initial + Multiple Anniversary', standard_value: 'Initial + Multiple Anniversary', is_active: true },
  { reference_type: 'installment_structure', raw_value: 'Unknown', standard_value: 'Unknown', is_active: true },
];

export const TABLE_EXPORT_FILENAME_PREFIX = 'bonus-ecosystem-platform';

export const SAMPLE_FILE_CONTENTS = {
  'authorized_bonus_sample.csv': `FY,Category,Budget Line Item,O/E,Bonus Type,Amount,Installment Structure,Effective Date,Expiration Date,Line Identifier,Bonus Identifier\n2026,Aviation,Pilot Retention,O,Flight,50000,Initial + Anniversary,2025-10-01,2026-09-30,LINE-100,BONUS-100\n2026,Aviation,Pilot Accession,O,Accession,30000,Lump Sum,2025-10-01,2026-09-30,LINE-101,BONUS-101\n2026,Cyber,Cyber Enlistment,E,Enlistment,20000,Initial + Multiple Anniversary,2025-10-01,2026-09-30,LINE-200,BONUS-200\n2026,Medical,Medical Retention,O,Retention,40000,Initial + Anniversary,2025-10-01,2026-09-30,LINE-300,BONUS-300\n2026,Aviation,Pilot Retention,O,Flight,50000,Initial + Anniversary,2025-10-01,2026-09-30,LINE-100,BONUS-100\n2027,Cyber,Cyber Enlistment,E,Enlistment,21000,Unknown,2026-10-01,2027-09-30,LINE-201,BONUS-201`,
  'approval_execution_sample.csv': `Member ID,Status,Approval Date,Amount,Bonus Identifier,Category,Budget Line Item,O/E,Bonus Type,Installment Count,Initial Amount,Obligation Date,Payment Date,Cancellation Date,Line Identifier\nMEM-001,Approved,2025-10-10,50000,BONUS-100,Aviation,Pilot Retention,O,Flight,2,25000,2025-10-10,2025-10-10,,LINE-100\nMEM-002,C,2025-11-15,30000,BONUS-101,Aviation,Pilot Accession,O,Accession,1,30000,2025-11-15,2025-11-15,2025-12-01,LINE-101\nMEM-003,A,2026-01-12,20000,BONUS-200,Cyber,Cyber Enlistment,E,Enlistment,4,10000,2026-01-12,2026-01-12,,LINE-200\nMEM-004,,2026-02-05,15000,,Cyber,Cyber Enlistment,E,Enlistment,4,7500,2026-02-05,2026-02-05,,\nMEM-005,Pending,2026-03-22,40000,BONUS-300,Medical,Medical Retention,O,Retention,2,20000,2026-03-22,2026-03-22,,LINE-300\nMEM-006,Approved,2026-04-18,50000,,Aviation,Pilot Retention,O,Flight,2,25000,2026-04-18,2026-04-18,,LINE-999\nMEM-007,Approved,2026-06-01,25000,,Space,Orbital Retention,O,Retention,2,12500,2026-06-01,2026-06-01,,LINE-777\nMEM-008,Approved,2026-06-01,-5000,,Cyber,Cyber Enlistment,E,Enlistment,4,1000,2026-06-01,2026-06-01,,LINE-200`,
  'budget_sample.csv': `FY,Budget Line Item,Category,O/E,Bonus Type,Amount\n2026,Pilot Retention,Aviation,O,Flight,160000\n2026,Pilot Accession,Aviation,O,Accession,45000\n2026,Cyber Enlistment,Cyber,E,Enlistment,70000\n2026,Medical Retention,Medical,O,Retention,90000\n2027,Cyber Enlistment,Cyber,E,Enlistment,60000`,
  'reference_crosswalk_sample.csv': `Reference Type,Raw Value,Standard Value,Active Flag,Effective Date,Expiration Date,Notes\nstatus,A,Approved,Y,2025-01-01,,Seed status mapping\nstatus,Approved,Approved,Y,2025-01-01,,Seed status mapping\nstatus,C,Cancelled,Y,2025-01-01,,Seed status mapping\nstatus,Cancelled,Cancelled,Y,2025-01-01,,Seed status mapping\nstatus,P,Pending,Y,2025-01-01,,Seed status mapping\nstatus,Pending,Pending,Y,2025-01-01,,Seed status mapping\noe,O,O,Y,2025-01-01,,Officer seed\noe,E,E,Y,2025-01-01,,Enlisted seed\ncategory,Aviation,Aviation,Y,2025-01-01,,Category seed\ncategory,Cyber,Cyber,Y,2025-01-01,,Category seed\ncategory,Medical,Medical,Y,2025-01-01,,Category seed\ncategory,Space,Space,Y,2025-01-01,,Intentional warning category\nbonus_type,Flight,Flight,Y,2025-01-01,,Bonus type seed\nbonus_type,Accession,Accession,Y,2025-01-01,,Bonus type seed\nbonus_type,Enlistment,Enlistment,Y,2025-01-01,,Bonus type seed\nbonus_type,Retention,Retention,Y,2025-01-01,,Bonus type seed\nbudget_line_item,Pilot Retention,Pilot Retention,Y,2025-01-01,,Line seed\nbudget_line_item,Pilot Accession,Pilot Accession,Y,2025-01-01,,Line seed\nbudget_line_item,Cyber Enlistment,Cyber Enlistment,Y,2025-01-01,,Line seed\nbudget_line_item,Medical Retention,Medical Retention,Y,2025-01-01,,Line seed\nbudget_line_item,Orbital Retention,Orbital Retention,N,2025-01-01,,Inactive to trigger exception\ninstallment_structure,Lump Sum,Lump Sum,Y,2025-01-01,,Installment seed\ninstallment_structure,Initial + Anniversary,Initial + Anniversary,Y,2025-01-01,,Installment seed\ninstallment_structure,Initial + Multiple Anniversary,Initial + Multiple Anniversary,Y,2025-01-01,,Installment seed`,
  'assumptions_sample.csv': `FY,Category,Target Avg Initial Bonus,Planned Need,Take Rate,Priority Rank,Distribution Rule,Notes\n2026,Aviation,26000,4,0.75,1,balanced,Priority community\n2026,Cyber,12000,5,0.8,2,balanced,Supports pipeline need\n2026,Medical,22000,2,0.5,3,balanced,Limited hiring pool\n2027,Cyber,13000,4,0.75,2,balanced,Future year example`,
};

export const BUNDLED_SAMPLE_FILES = [
  { fileName: 'authorized_bonus_sample.csv', sourceType: SOURCE_TYPES.AUTHORIZED },
  { fileName: 'approval_execution_sample.csv', sourceType: SOURCE_TYPES.APPROVAL },
  { fileName: 'budget_sample.csv', sourceType: SOURCE_TYPES.BUDGET },
  { fileName: 'reference_crosswalk_sample.csv', sourceType: SOURCE_TYPES.REFERENCE },
  { fileName: 'assumptions_sample.csv', sourceType: SOURCE_TYPES.ASSUMPTIONS },
];
