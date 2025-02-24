export const operators = {
    string: [
      { value: 'equals', label: 'Equals', inputType: 'text' },
      { value: 'not_equals', label: 'Not Equals', inputType: 'text' },
      { value: 'contains', label: 'Contains', inputType: 'text' },
      { value: 'not_contains', label: 'Does Not Contain', inputType: 'text' },
      { value: 'starts_with', label: 'Starts With', inputType: 'text' },
      { value: 'ends_with', label: 'Ends With', inputType: 'text' },
      { value: 'in_list', label: 'In List', inputType: 'list' },
      { value: 'not_in_list', label: 'Not In List', inputType: 'list' },
      { value: 'is_blank', label: 'Is Blank', inputType: 'none' },
      { value: 'is_not_blank', label: 'Is Not Blank', inputType: 'none' }
    ],
    number: [
      { value: 'equals', label: 'Equals', inputType: 'number' },
      { value: 'not_equals', label: 'Not Equals', inputType: 'number' },
      { value: 'greater_than', label: 'Greater Than', inputType: 'number' },
      { value: 'less_than', label: 'Less Than', inputType: 'number' },
      { value: 'greater_equal', label: 'Greater Than or Equal To', inputType: 'number' },
      { value: 'less_equal', label: 'Less Than or Equal To', inputType: 'number' },
      { value: 'between', label: 'Between', inputType: 'number' },
      { value: 'not_between', label: 'Not Between', inputType: 'number' },
      { value: 'in_list', label: 'In List', inputType: 'list' },
      { value: 'not_in_list', label: 'Not In List', inputType: 'list' },
      { value: 'is_blank', label: 'Is Blank', inputType: 'none' },
      { value: 'is_not_blank', label: 'Is Not Blank', inputType: 'none' }
    ],
    datetime: [
      { value: 'equals', label: 'Equals', inputType: 'date' },
      { value: 'not_equals', label: 'Not Equals', inputType: 'date' },
      { value: 'before', label: 'Before', inputType: 'date' },
      { value: 'after', label: 'After', inputType: 'date' },
      { value: 'between', label: 'Between', inputType: 'date' },
      { value: 'today', label: 'Today', inputType: 'none' },
      { value: 'yesterday', label: 'Yesterday', inputType: 'none' },
      { value: 'tomorrow', label: 'Tomorrow', inputType: 'none' },
      { value: 'last_7_days', label: 'Last 7 Days', inputType: 'none' },
      { value: 'last_30_days', label: 'Last 30 Days', inputType: 'none' },
      { value: 'this_month', label: 'This Month', inputType: 'none' },
      { value: 'last_month', label: 'Last Month', inputType: 'none' },
      { value: 'this_year', label: 'This Year', inputType: 'none' },
      { value: 'custom_range', label: 'Custom Range', inputType: 'date' },
      { value: 'is_blank', label: 'Is Blank', inputType: 'none' },
      { value: 'is_not_blank', label: 'Is Not Blank', inputType: 'none' }
    ]
  };
  
  export const availableColumns = [
    { id: 'item_id', name: 'Item ID', type: 'string', shortCode: 'ITM' },
    { id: 'beneficial_owner_id', name: 'Beneficial Owner Id', type: 'string', shortCode: 'BOI' },
    { id: 'internal_comments', name: 'Internal Comments', type: 'string', shortCode: 'CMT' },
    { id: 'beneficial_owner_name', name: 'Beneficial Owner Name', type: 'string', shortCode: 'BON' },
    { id: 'investor_type', name: 'Investor Type', type: 'string', shortCode: 'INV' },
    { id: 'gti_account', name: 'GTI Account', type: 'string', shortCode: 'GTI' },
    { id: 'amount', name: 'Amount', type: 'number', shortCode: 'AMT' },
    { id: 'created_at', name: 'Created At', type: 'datetime', shortCode: 'CRT' },
    { id: 'updated_at', name: 'Updated At', type: 'datetime', shortCode: 'UPD' }
  ];