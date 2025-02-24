import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Plus, X, ChevronDown, ChevronRight, Grip, Calendar, List, Search } from 'lucide-react';
import { operators, availableColumns } from './constants';

const FilterBuilder = () => {
  // State
  const [groups, setGroups] = useState([
    { id: 1, operator: 'AND', conditions: [], groups: [] }
  ]);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [filteredColumns, setFilteredColumns] = useState(availableColumns);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState({});

  // Handlers
  const handleGroupUpdate = (groupId, updatedGroup) => {
    const updateGroupInGroups = (groups) => {
      return groups.map(group => {
        if (group.id === groupId) {
          return updatedGroup;
        }
        if (group.groups) {
          return {
            ...group,
            groups: updateGroupInGroups(group.groups)
          };
        }
        return group;
      });
    };

    const updatedGroups = updateGroupInGroups(groups);
    setGroups(updatedGroups);
    setIsDirty(true);
  };

  const handleGroupDelete = (groupId) => {
    const deleteGroupFromGroups = (groups) => {
      return groups.filter(group => {
        if (group.id === groupId) {
          return false;
        }
        if (group.groups) {
          group.groups = deleteGroupFromGroups(group.groups);
        }
        return true;
      });
    };

    const updatedGroups = deleteGroupFromGroups(groups);
    setGroups(updatedGroups);
    setIsDirty(true);
  };

  const handleAddGroup = () => {
    setGroups([
      ...groups,
      { id: Date.now(), operator: 'AND', conditions: [], groups: [] }
    ]);
    setIsDirty(true);
  };

  const onSearch = (event) => {
    const value = event.target.value;
    if (value.trim() !== '') {
      setFilteredColumns(availableColumns.filter((column) => 
        column.name.toLowerCase().includes(value.toLowerCase())
      ));
    } else {
      setFilteredColumns(availableColumns);
    }
  };

  const handleConditionSelect = (condition) => {
    setSelectedCondition(condition);
    setSelectedColumn(null);
    setErrors({});
  };

  const handleColumnSelect = (column) => {
    setSelectedColumn(column);
    setSelectedCondition(null);
  };

  const handleSave = () => {
    console.log('Saving filters:', JSON.stringify(groups, null, 2));
    setIsDirty(false);
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    
    if (field === 'operator' && !value) {
      newErrors.operator = 'Operator is required';
    }
    
    if (field === 'value') {
      if (!value) {
        newErrors.value = 'Value is required';
      }
      
      if (selectedCondition?.columnType === 'number' && isNaN(Number(value))) {
        newErrors.value = 'Must be a valid number';
      }
      
      if (selectedCondition?.columnType === 'datetime') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          newErrors.value = 'Must be a valid date';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateCondition = (updatedCondition) => {
    const updateConditionInGroup = (groups) => {
      return groups.map(group => {
        if (group.conditions) {
          group.conditions = group.conditions.map(c =>
            c.id === updatedCondition.id ? updatedCondition : c
          );
        }
        if (group.groups) {
          group.groups = updateConditionInGroup(group.groups);
        }
        return group;
      });
    };
    
    const updatedGroups = updateConditionInGroup(groups);
    setGroups(updatedGroups);
    setSelectedCondition(updatedCondition);
    setIsDirty(true);
  };

  // Column Component
  const Column = ({ column, onClick, isSelected }) => {
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
        onClick={() => onClick(column)}
        className={`flex items-center gap-2 p-2 text-gray-300 hover:bg-gray-700 cursor-move rounded ${
          isDragging ? 'opacity-50' : 'opacity-100'
        } ${isSelected ? 'bg-gray-700' : ''}`}
      >
        {getTypeIcon(column.type)}
        <span>{column.name}</span>
        <span className="text-xs text-gray-500 ml-auto">{column.type}</span>
      </div>
    );
  };

  // Condition Component
  const Condition = ({ condition, onDelete, isSelected, onClick }) => {
    return (
      <div 
        className={`flex items-center gap-4 p-3 rounded border ${
          isSelected ? 'border-blue-500 bg-gray-800' : 'border-gray-700 bg-gray-700'
        } cursor-pointer`}
        onClick={() => onClick(condition)}
      >
        <span className="text-gray-300">{condition.column}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-300">{condition.operator}</span>
        {condition.value && (
          <>
            <span className="text-gray-400">|</span>
            <span className="text-gray-300">{condition.value}</span>
          </>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(condition.id);
          }}
          className="text-gray-400 hover:text-red-400 ml-auto"
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
    onDelete,
    onConditionSelect,
    selectedCondition,
    depth = 0,
    parentRef = null
  }) => {
    const [{ isOver, canDrop }, drop] = useDrop({
      accept: 'COLUMN',
      drop: (item, monitor) => {
        if (monitor.didDrop()) {
          return;
        }

        if (!monitor.isOver({ shallow: true })) {
          return;
        }

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

        return { handled: true };
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    });

    const dropRef = React.useRef(null);
    const dropWithRef = (el) => {
      dropRef.current = el;
      drop(el);
    };

    const [isExpanded, setIsExpanded] = useState(true);

    const handleAddNestedGroup = () => {
        if (depth === 0) {
            const newGroup = {
                id: Date.now(),
                operator: 'AND',
                conditions: [],
                groups: []
              };
              
              onUpdate(group.id, {
                ...group,
                groups: [...(group.groups || []), newGroup]
              });
        }
      
    };

    const handleNestedGroupUpdate = (groupId, updatedGroup) => {
      if (group.groups) {
        const updatedGroups = group.groups.map(g => 
          g.id === groupId ? updatedGroup : g
        );
        onUpdate(group.id, { ...group, groups: updatedGroups });
      }
    };

    const handleNestedGroupDelete = (groupId) => {
      if (group.groups) {
        const updatedGroups = group.groups.filter(g => g.id !== groupId);
        onUpdate(group.id, { ...group, groups: updatedGroups });
      }
    };
    console.log(depth)
    return (
      <div
        ref={dropWithRef}
        className={`p-4 rounded border ${
          isOver && canDrop ? 'border-blue-500 bg-gray-800' : 'border-gray-700 bg-gray-800'
        } my-2`}
        style={{ marginLeft: `${depth * 20}px` }}
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
          <div className="flex items-center gap-2">
          {depth === 0 && (
 <button
              onClick={handleAddNestedGroup}
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
              disabled={depth > 1}
            >
              <Plus className="w-3 h-3" />
               GROUP
            </button> )}
            <button
              onClick={() => onDelete(group.id)}
              className="text-gray-400 hover:text-red-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {isExpanded && (
          <div className="space-y-2">
            {group.conditions.map((condition) => (
              <Condition
                key={condition.id}
                condition={condition}
                isSelected={selectedCondition?.id === condition.id}
                onClick={onConditionSelect}
                onDelete={() =>
                  onUpdate(group.id, {
                    ...group,
                    conditions: group.conditions.filter((c) => c.id !== condition.id),
                  })
                }
              />
            ))}
            {group.groups?.map((nestedGroup) => (
              <Group
                key={nestedGroup.id}
                group={nestedGroup}
                onUpdate={handleNestedGroupUpdate}
                onDelete={handleNestedGroupDelete}
                onConditionSelect={onConditionSelect}
                selectedCondition={selectedCondition}
                depth={depth + 1}
                parentRef={dropRef}
              />
            ))}
            {group.conditions.length === 0 && (!group.groups || group.groups.length === 0) && (
              <div
                className={`p-3 rounded border border-dashed ${
                  isOver && canDrop ? 'border-blue-500' : 'border-gray-600'
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

  // Editor Panel Component
  const EditorPanel = () => {
    if (!selectedCondition) return null;
  
    const column = availableColumns.find(col => col.name === selectedCondition.column);
    const columnOperators = operators[selectedCondition.columnType] || operators.string;
  
    const [operator, setOperator] = useState(selectedCondition.operator);
    const [value, setValue] = useState(selectedCondition.value || '');
  
    useEffect(() => {
      setOperator(selectedCondition.operator);
      setValue(selectedCondition.value || '');
    }, [selectedCondition]);
  
    const handleSave = () => {
      const isOperatorValid = validateField('operator', operator);
      const isValueValid = validateField('value', value);
  
      if (isOperatorValid && isValueValid) {
        updateCondition({ ...selectedCondition, operator, value });
      }
    };
  
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-200">{selectedCondition.column}</h3>
          <button 
            onClick={() => setSelectedCondition(null)} 
            className="text-gray-400 hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
  
        <div className="space-y-4">
          {/* Short Code Field */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Short Code : <b >{column?.shortCode || ''}</b>
            </label>
          
          </div>
  
          {/* Data Type Field */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Data Type : <b >{selectedCondition.columnType.toUpperCase()}</b>
            </label>
           
          </div>
  
          {/* Operator Field */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Operator
            </label>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="bg-gray-700 text-gray-300 rounded px-3 py-2 w-full border border-gray-600"
            >
              {columnOperators.map(op => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
          </div>
  
          {/* Value Field */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Value
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="bg-gray-700 text-gray-300 rounded px-3 py-2 w-full border border-gray-600"
              placeholder="Enter value"
            />
          </div>
  
          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
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
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
                !isDirty && 'opacity-50 cursor-not-allowed'
              }`}
              onClick={handleSave}
              disabled={!isDirty}
            >
              Save
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Columns Panel */}
          <div className="col-span-3 bg-gray-800 rounded-lg p-4">
            <div className="relative mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search columns..."
                  className="w-full bg-gray-700 text-gray-300 rounded pl-9 pr-3 py-2 border border-gray-600"
                  onChange={onSearch}
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>
            <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
              {filteredColumns.map((column) => (
                <Column 
                  key={column.id} 
                  column={column}
                  onClick={handleColumnSelect}
                  isSelected={selectedColumn?.id === column.id}
                />
              ))}
            </div>
          </div>

          {/* Filter Builder Panel */}
          <div className="col-span-6 bg-gray-800 rounded-lg p-4">
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
            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {groups.map((group) => (
                <Group
                  key={group.id}
                  group={group}
                  onUpdate={handleGroupUpdate}
                  onDelete={handleGroupDelete}
                  onConditionSelect={handleConditionSelect}
                  selectedCondition={selectedCondition}
                />
              ))}
            </div>
          </div>

          {/* Editor Panel */}
          <div className="col-span-3" style={{"height": "100%"}}>
            <EditorPanel />
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

