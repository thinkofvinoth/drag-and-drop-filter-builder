import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  groups: [{ id: 1, operator: 'AND', conditions: [], groups: [] }],
  selectedCondition: null,
  selectedColumn: null,
  isDirty: false,
  errors: {}
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    updateGroups: (state, action) => {
      state.groups = action.payload;
      state.isDirty = true;
    },
    setSelectedCondition: (state, action) => {
      state.selectedCondition = action.payload;
      state.selectedColumn = null;
      state.errors = {};
    },
    setSelectedColumn: (state, action) => {
      state.selectedColumn = action.payload;
      state.selectedCondition = null;
    },
    updateCondition: (state, action) => {
      const updateConditionInGroup = (groups) => {
        groups.forEach(group => {
          if (group.conditions) {
            group.conditions = group.conditions.map(c =>
              c.id === action.payload.id ? action.payload : c
            );
          }
          if (group.groups) {
            updateConditionInGroup(group.groups);
          }
        });
      };
      
      updateConditionInGroup(state.groups);
      state.selectedCondition = action.payload;
      state.isDirty = true;
    },
    setErrors: (state, action) => {
      state.errors = action.payload;
    },
    resetDirtyState: (state) => {
      state.isDirty = false;
    }
  }
});

export const {
  updateGroups,
  setSelectedCondition,
  setSelectedColumn,
  updateCondition,
  setErrors,
  resetDirtyState
} = filtersSlice.actions;

export default filtersSlice.reducer;
