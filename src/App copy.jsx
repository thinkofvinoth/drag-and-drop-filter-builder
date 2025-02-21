import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Plus, X, ChevronDown, ChevronRight, Grip, Save, Calendar, List, Settings, Edit } from 'lucide-react';

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
    onUpdate,
    onEdit // New prop to handle edit click
  }) => {
    const columnOperators = operators[condition.columnType] || operators.string;
    const selectedOperator = columnOperators.find(op => op.value === condition.operator) || columnOperators[0];
  
    return (
      <div className="flex items-center gap-4 p-3 bg-gray-800 rounded border border-gray-700">
        <span className="text-gray-300">{condition.column} |</span>
        <span className="text-gray-300">{condition.operator}|{condition.value}</span>
        {/* <select
          value={condition.operator}
          onChange={(e) => onUpdate({ ...condition, operator: e.target.value, value: '' })}
          className="bg-gray-700 text-gray-300 rounded px-2 py-1 border border-gray-600"
        > */}
          {/* {columnOperators.map(op => (
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
        /> */}
        <button
          onClick={() => onEdit(condition)} // Open edit panel
          className="text-gray-400 hover:text-blue-400"
        >
          <Edit className="w-4 h-4" />
        </button>
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
  onDelete,onEdit
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
              onEdit={onEdit}
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

const EditPanel = ({ 
    condition, 
    onSave, 
    onClose 
  }) => {
    const columnOperators = operators[condition.columnType] || operators.string;
    const selectedOperator = columnOperators.find(op => op.value === condition.operator) || columnOperators[0];
  
    const [editedCondition, setEditedCondition] = useState(condition);
  
    const handleChange = (field, value) => {
      setEditedCondition((prev) => ({ ...prev, [field]: value }));
    };
  
    return (
      <div className="fixed top-0 right-0 h-full w-96 bg-gray-800 p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-200">Edit Condition</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Column</label>
            <input
              type="text"
              value={editedCondition.column}
              disabled
              className="w-full bg-gray-700 text-gray-300 rounded px-3 py-2 mt-1 border border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Operator</label>
            <select
              value={editedCondition.operator}
              onChange={(e) => handleChange('operator', e.target.value)}
              className="w-full bg-gray-700 text-gray-300 rounded px-3 py-2 mt-1 border border-gray-600"
            >
              {columnOperators.map(op => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Value</label>
            <ValueInput
              type={selectedOperator.inputType}
              value={editedCondition.value}
              onChange={(value) => handleChange('value', value)}
              secondaryValue={editedCondition.secondaryValue}
              onSecondaryChange={
                selectedOperator.value === 'between' || selectedOperator.value === 'not_between'
                  ? (value) => handleChange('secondaryValue', value)
                  : undefined
              }
            />
          </div>
          <button
            onClick={() => onSave(editedCondition)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    );
  };


// Main Component
const FilterBuilder = () => {
    const [groups, setGroups] = useState([
      { id: 1, operator: 'AND', conditions: [] },
    ]);
    const [filtredColumns, setFilteredColumns] = useState(availableColumns);
    const [editingCondition, setEditingCondition] = useState(null); // Track the condition being edited
  
    const handleGroupUpdate = (groupId, updatedGroup) => {
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group.id === groupId ? updatedGroup : group
        )
      );
    };
  
    const handleEditCondition = (condition) => {
      setEditingCondition(condition); // Open edit panel
    };
  
    const handleSaveCondition = (updatedCondition) => {
      setGroups((prevGroups) =>
        prevGroups.map((group) => ({
          ...group,
          conditions: group.conditions.map((c) =>
            c.id === updatedCondition.id ? updatedCondition : c
          ),
        }))
      );
      setEditingCondition(null); // Close edit panel
    };
    const handleAddGroup = () => {
        setGroups((prevGroups) => [
          ...prevGroups,
          { id: Date.now(), operator: 'AND', conditions: [] },
        ]);
      };
      const handleGroupDelete = (groupId) => {
        setGroups((prevGroups) => prevGroups.filter((group) => group.id !== groupId));
      };    
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-100">Add Filters</h1>
            <div className="flex gap-4">
              <button className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">
                Cancel
              </button>
              <button
        onClick={() => console.log(groups)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        Save
      </button>            </div>
          </div>
  
          <div className="flex gap-6">
            {/* Columns Panel */}
            <div className="w-1/4 bg-gray-800 rounded-lg p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search columns..."
                  className="w-full bg-gray-700 text-gray-300 rounded px-3 py-2 mb-4 border border-gray-600"
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
                    onEdit={handleEditCondition} // Pass edit handler
                  />
                ))}
              </div>
            </div>
          </div>
  
          {/* Edit Panel */}
          {editingCondition && (
            <EditPanel
              condition={editingCondition}
              onSave={handleSaveCondition}
              onClose={() => setEditingCondition(null)}
            />
          )}
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