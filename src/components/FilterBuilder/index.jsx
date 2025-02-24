import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Column } from './Column';
import { Group } from './Group';
import { availableColumns } from './data';

export const FilterBuilder = () => {
  const [groups, setGroups] = useState([
    { id: 1, operator: 'AND', conditions: [] },
  ]);
  const [filteredColumns, setFilteredColumns] = useState(availableColumns);

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
    const value = event.target.value;
    if (value.trim() !== '') {
      setFilteredColumns(availableColumns.filter((column) => 
        column.name.toLowerCase().includes(value.toLowerCase())
      ));
    } else {
      setFilteredColumns(availableColumns);
    }
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
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => console.log(groups)}
            >
              Save
            </button>
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
              {filteredColumns.map((column) => (
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