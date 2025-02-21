import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Plus, X, ChevronDown, ChevronRight, Grip, Save, Calendar, List, Settings } from 'lucide-react';

// Types for operators

// Operator configurations based on data type
const operators = {
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

// Mock data for available columns with proper types
const availableColumns = [
  { id: 'item_id', name: 'Item ID', type: 'string'},
  { id: 'beneficial_owner_id', name: 'Beneficial Owner Id', type: 'string'},
  { id: 'internal_comments', name: 'Internal Comments', type: 'string'},
  { id: 'beneficial_owner_name', name: 'Beneficial Owner Name', type: 'string'},
  { id: 'investor_type', name: 'Investor Type', type: 'string'},
  { id: 'gti_account', name: 'GTI Account', type: 'string'},
  { id: 'amount', name: 'Amount', type: 'number'},
  { id: 'created_at', name: 'Created At', type: 'datetime'},
  { id: 'updated_at', name: 'Updated At', type: 'datetime'}
];


const saveOptions = [
  { id: 'default', label: 'Save as default filter', icon: <Save className="w-4 h-4" /> },
  { id: 'preset', label: 'Save as custom preset', icon: <List className="w-4 h-4" /> },
  { id: 'session', label: 'Save for current session', icon: <Calendar className="w-4 h-4" /> },
  { id: 'all_columns', label: 'Apply to all similar columns', icon: <Settings className="w-4 h-4" /> }
];

// Column Component
const Column = ({ column }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'COLUMN',
    item: { id: column.id, name: column.name, type: column.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'datetime':
        return <Calendar className="w-4 h-4" />;
      case 'number':
        return <List className="w-4 h-4" />;
      default:
        return <Grip className="w-4 h-4" />;
    }
  };

  return (
    <div
      ref={drag}
      className={`flex items-center gap-2 p-2 text-gray-300 hover:bg-gray-700 cursor-move rounded ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      {getTypeIcon(column.type)}
      <span>{column.name}</span>
      <span className="text-xs text-gray-500 ml-auto">{column.type}</span>
    </div>
  );
};

// Value Input Component
const ValueInput = ({ 
  type, 
  value, 
  onChange,
  secondaryValue,
  onSecondaryChange 
}) => {
  if (type === 'none') return null;

  const renderInput = () => {
    switch (type) {
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-gray-700 text-gray-300 rounded px-2 py-1 border border-gray-600"
            placeholder="Enter number"
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-gray-700 text-gray-300 rounded px-2 py-1 border border-gray-600"
          />
        );
      case 'list':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-gray-700 text-gray-300 rounded px-2 py-1 border border-gray-600"
            placeholder="Comma-separated values"
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-gray-700 text-gray-300 rounded px-2 py-1 border border-gray-600"
            placeholder="Enter value"
          />
        );
    }
  };

  return (
    <div className="flex gap-2 items-center">
      {renderInput()}
      {(type === 'number' || type === 'date') && onSecondaryChange && (
        <>
          <span className="text-gray-400">to</span>
          {renderInput()}
        </>
      )}
    </div>
  );
};

// Condition Component
const Condition = ({ 
  condition, 
  onDelete, 
  onUpdate 
}) => {
  const columnOperators = operators[condition.columnType] || operators.string;
  const selectedOperator = columnOperators.find(op => op.value === condition.operator) || columnOperators[0];

  return (
    <div className="flex items-center gap-4 p-3 bg-gray-800 rounded border border-gray-700">
      <span className="text-gray-300">{condition.column}</span>
      <select
        value={condition.operator}
        onChange={(e) => onUpdate({ ...condition, operator: e.target.value, value: '' })}
        className="bg-gray-700 text-gray-300 rounded px-2 py-1 border border-gray-600"
      >
        {columnOperators.map(op => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>
      <ValueInput
        type={selectedOperator.inputType}
        value={condition.value}
        onChange={(value) => onUpdate({ ...condition, value })}
        secondaryValue={condition.secondaryValue}
        onSecondaryChange={
          selectedOperator.value === 'between' || selectedOperator.value === 'not_between'
            ? (value) => onUpdate({ ...condition, secondaryValue: value })
            : undefined
        }
      />
      <button
        onClick={() => onDelete(condition.id)}
        className="text-gray-400 hover:text-red-400"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Group Component
const Group = ({ 
  group, 
  onUpdate, 
  onDelete 
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'COLUMN',
    drop: (item) => {
      onUpdate(group.id, {
        ...group,
        conditions: [
          ...group.conditions,
          {
            id: Date.now(),
            column: item.name,
            columnType: item.type,
            operator: operators[item.type][0].value,
            value: '',
          },
        ],
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      ref={drop}
      className={`p-4 rounded border ${
        isOver ? 'border-blue-500 bg-gray-800' : 'border-gray-700 bg-gray-800'
      } my-2`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-300"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          <select
            value={group.operator}
            onChange={(e) =>
              onUpdate(group.id, { ...group, operator: e.target.value })
            }
            className="bg-gray-700 text-gray-300 rounded px-2 py-1 border border-gray-600"
          >
            <option value="AND">AND</option>
            <option value="OR">OR</option>
          </select>
        </div>
        <button
          onClick={() => onDelete(group.id)}
          className="text-gray-400 hover:text-red-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {isExpanded && (
        <div className="space-y-2">
          {group.conditions.map((condition) => (
            <Condition
              key={condition.id}
              condition={condition}
              onDelete={() =>
                onUpdate(group.id, {
                  ...group,
                  conditions: group.conditions.filter((c) => c.id !== condition.id),
                })
              }
              onUpdate={(updatedCondition) =>
                onUpdate(group.id, {
                  ...group,
                  conditions: group.conditions.map((c) =>
                    c.id === condition.id ? updatedCondition : c
                  ),
                })
              }
            />
          ))}
          {group.conditions.length === 0 && (
            <div
              className={`p-3 rounded border border-dashed ${
                isOver ? 'border-blue-500' : 'border-gray-600'
              } text-gray-400 text-center`}
            >
              Drop columns here to add conditions
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Save Options Menu Component
const SaveOptionsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        Save
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-10">
          {saveOptions.map((option) => (
            <button
              key={option.id}
              className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center gap-2"
              onClick={() => {
                // Handle save option
                setIsOpen(false);
              }}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Component
const FilterBuilder = () => {

  const dummyData = [{"id":1,"operator":"AND","conditions":[{"id":1740138675763,"column":"Internal Comments","columnType":"string","operator":"equals","value":"345"},{"id":1740138693380,"column":"Beneficial Owner Name","columnType":"string","operator":"ends_with","value":""},{"id":1740138724708,"column":"Updated At","columnType":"datetime","operator":"custom_range","value":"2025-02-27"}]},{"id":1740138735041,"operator":"AND","conditions":[{"id":1740138745027,"column":"Updated At","columnType":"datetime","operator":"this_year","value":""}]}];
  const [groups, setGroups] = useState(dummyData || [
    { id: 1, operator: 'AND', conditions: [] },
  ]);
  const [filtredColumns, setFilteredColumns] = useState(availableColumns);

  console.log(JSON.stringify(groups));

  const handleGroupUpdate = (groupId, updatedGroup) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId ? updatedGroup : group
      )
    );
  };

  const handleGroupDelete = (groupId) => {
    setGroups((prevGroups) => prevGroups.filter((group) => group.id !== groupId));
  };

  const handleAddGroup = () => {
    setGroups((prevGroups) => [
      ...prevGroups,
      { id: Date.now(), operator: 'AND', conditions: [] },
    ]);
  };

  const onSearch = (event) => {

    const value = event.target.value
    if(value.trim() !== ''){
        setFilteredColumns(availableColumns.filter((column) => column.name.toLowerCase().includes(value.toLowerCase())));

    }
    else{
        setFilteredColumns(availableColumns);

    }
  }

  console.log(filtredColumns,"filteredColumns");
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-100">Add Filters</h1>
          <div className="flex gap-4">
            <button className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">
              Cancel
            </button>
            <SaveOptionsMenu />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Columns Panel */}
          <div className="w-1/4 bg-gray-800 rounded-lg p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search columns..."
                className="w-full bg-gray-700 text-gray-300 rounded px-3 py-2 mb-4 border border-gray-600"
                onChange={onSearch}
              />
            </div>
            <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
              {filtredColumns.map((column) => (
                <Column key={column.id} column={column} />
              ))}
            </div>
          </div>

          {/* Filter Builder Panel */}
          <div className="flex-1 bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-200">
                Workflow Criteria
              </h2>
              <button
                onClick={handleAddGroup}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
              >
                <Plus className="w-4 h-4" />
                GROUP
              </button>
            </div>
            <div className="space-y-4">
              {groups.map((group) => (
                <Group
                  key={group.id}
                  group={group}
                  onUpdate={handleGroupUpdate}
                  onDelete={handleGroupDelete}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => (
  <DndProvider backend={HTML5Backend}>
    <FilterBuilder />
  </DndProvider>
);

export default App;