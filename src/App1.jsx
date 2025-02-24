import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Plus, X, ChevronDown, ChevronRight, Grip, Calendar, List, Search } from 'lucide-react';
import { operators, availableColumns } from './constants';
import './FilterBuilder.scss';
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
          return <Calendar className="column-icon" />;
        case 'number':
          return <List className="column-icon" />;
        default:
          return <Grip className="column-icon" />;
      }
    };
  
    return (
      <div
        ref={drag}
        onClick={() => onClick(column)}
        className={`column ${isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''}`}
      >
        {getTypeIcon(column.type)}
        <span>{column.name}</span>
        <span className="column-shortcode">{column.shortCode}</span>
      </div>
    );
  };
  

  // Condition Component
  const Condition = ({ condition, onDelete, isSelected, onClick }) => {
    return (
      <div 
        className={`condition ${isSelected ? 'selected' : ''}`}
        onClick={() => onClick(condition)}
      >
        <span>{condition.column}</span>
        <span className="separator">|</span>
        <span>{condition.operator}</span>
        {condition.value && (
          <>
            <span className="separator">|</span>
            <span>{condition.value}</span>
          </>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(condition.id);
          }}
          className="delete-button"
        >
          <X className="icon" />
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
        if (monitor.didDrop()) return;
        if (!monitor.isOver({ shallow: true })) return;
  
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
  
    return (
      <div
        ref={dropWithRef}
        className={`group-container ${isOver && canDrop ? 'droppable' : ''}`}
        style={{ marginLeft: `${depth * 20}px` }}
      >
        <div className="group-header">
          <div className="group-controls">
            <button onClick={() => setIsExpanded(!isExpanded)} className="group-button">
              {isExpanded ? <ChevronDown className="icon" /> : <ChevronRight className="icon" />}
            </button>
            <select
              value={group.operator}
              onChange={(e) => onUpdate(group.id, { ...group, operator: e.target.value })}
              className="group-dropdown"
            >
              <option value="AND">AND</option>
              <option value="OR">OR</option>
            </select>
          </div>
          <div className="group-controls">
            {depth === 0 && (
              <button onClick={handleAddNestedGroup} className="group-button">
                <Plus className="icon" /> GROUP
              </button>
            )}
            <button onClick={() => onDelete(group.id)} className="group-button delete-button">
              <X className="icon" />
            </button>
          </div>
        </div>
        {isExpanded && (
          <div className="nested-group">
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
              <div className={`empty-drop-zone ${isOver && canDrop ? 'active' : ''}`}>
                Drop columns here to add conditions
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // Editor Panel Component
  const EditorPanel = ({ selectedCondition, setSelectedCondition, updateCondition, validateField }) => {
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
      <div className="editor-panel">
        <div className="editor-header">
          <h3>{selectedCondition.column}</h3>
          <button onClick={() => setSelectedCondition(null)} className="close-button">
            <X className="icon" />
          </button>
        </div>
  
        <div className="form-group">
          <label>Short Code</label>
          <input type="text" value={column?.shortCode || ''} disabled />
        </div>
  
        <div className="form-group">
          <label>Data Type</label>
          <input type="text" value={selectedCondition.columnType.toUpperCase()} disabled />
        </div>
  
        <div className="form-group">
          <label>Operator</label>
          <select value={operator} onChange={(e) => setOperator(e.target.value)}>
            {columnOperators.map(op => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </select>
        </div>
  
        <div className="form-group">
          <label>Value</label>
          <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter value" />
        </div>
  
        <button onClick={handleSave} className="save-button">
          Save Changes
        </button>
      </div>
    );
  };
  
  

  return (
    <div className="page-container">
      <div className="page-content">
        {/* Header */}
        <div className="page-header">
          <h1>Add Filters</h1>
          <div className="button-group">
            <button className="button">Cancel</button>
            <button
              className={`button save-button ${!isDirty ? 'disabled' : ''}`}
              onClick={handleSave}
              disabled={!isDirty}
            >
              Save
            </button>
          </div>
        </div>
  
        {/* Layout Grid */}
        <div className="layout-grid">
          {/* Columns Panel */}
          <div className="panel column-panel">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search columns..."
                onChange={onSearch}
              />
              <Search className="search-icon" />
            </div>
            <div className="columns-list">
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
          <div className="panel filter-builder-panel">
            <div className="filter-header">
              <h2>Workflow Criteria</h2>
              <button onClick={handleAddGroup} className="add-group-button">
                <Plus className="icon" /> GROUP
              </button>
            </div>
            <div className="filter-list">
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
          <div className="panel editor-panel">
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

