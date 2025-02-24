import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X } from 'lucide-react';
import { updateCondition, setErrors, setSelectedCondition } from '../store/filterSlice';
import { operators, availableColumns } from '../constants';


export const EditorPanel = () => {
  const dispatch = useDispatch();
  const { selectedCondition, errors } = useSelector((state) => state.filters);

  if (!selectedCondition) return null;

  const column = availableColumns.find(col => col.name === selectedCondition.column);
  const columnOperators = operators[selectedCondition.columnType] || operators.string;
  const selectedOperator = columnOperators.find(op => op.value === selectedCondition.operator) || columnOperators[0];

  const validateField = (field, value) => {
    const newErrors= {};
    
    if (field === 'operator' && !value) {
      newErrors.operator = 'Operator is required';
    }
    
    if (field === 'value') {
      if (selectedOperator.inputType !== 'none' && !value) {
        newErrors.value = 'Value is required';
      }
      
      if (selectedCondition.columnType === 'number' && isNaN(Number(value))) {
        newErrors.value = 'Must be a valid number';
      }
      
      if (selectedCondition.columnType === 'datetime' && selectedOperator.inputType === 'date') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          newErrors.value = 'Must be a valid date';
        }
      }
    }
    
    dispatch(setErrors(newErrors));
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    const isOperatorValid = validateField('operator', selectedCondition.operator);
    const isValueValid = validateField('value', selectedCondition.value);
    
    if (isOperatorValid && isValueValid) {
      dispatch(updateCondition(selectedCondition));
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-200">{selectedCondition.column}</h3>
        <button 
          onClick={() => dispatch(setSelectedCondition(null))} 
          className="text-gray-400 hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Short Code
          </label>
          <input
            type="text"
            value={column?.shortCode || ''}
            disabled
            className="bg-gray-700 text-gray-300 rounded px-3 py-2 w-full border border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Data Type
          </label>
          <input
            type="text"
            value={selectedCondition.columnType.toUpperCase()}
            disabled
            className="bg-gray-700 text-gray-300 rounded px-3 py-2 w-full border border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Operator
          </label>
          <select
            value={selectedCondition.operator}
            onChange={(e) => {
              validateField('operator', e.target.value);
              dispatch(updateCondition({ ...selectedCondition, operator: e.target.value }));
            }}
            className={`bg-gray-700 text-gray-300 rounded px-3 py-2 w-full border ${
              errors.operator ? 'border-red-500' : 'border-gray-600'
            }`}
          >
            {columnOperators.map(op => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </select>
          {errors.operator && (
            <p className="mt-1 text-sm text-red-500">{errors.operator}</p>
          )}
        </div>

        {selectedOperator.inputType !== 'none' && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Value
            </label>
            <input
              type={selectedOperator.inputType}
              value={selectedCondition.value || ''}
              onChange={(e) => {
                validateField('value', e.target.value);
                dispatch(updateCondition({ ...selectedCondition, value: e.target.value }));
              }}
              className={`bg-gray-700 text-gray-300 rounded px-3 py-2 w-full border ${
                errors.value ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder={`Enter ${selectedOperator.inputType}`}
            />
            {errors.value && (
              <p className="mt-1 text-sm text-red-500">{errors.value}</p>
            )}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={Object.keys(errors).length > 0}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};