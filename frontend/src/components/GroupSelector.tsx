/*
 * GroupSelector.tsx
 * A standalone dropdown component that fetches the user's available 
 * groups and allows them to switch the active context of the Dashboard.
 */

import React, { useEffect, useState } from 'react';
import api from '../api/axios';

interface GroupSummary {
  id: number;
  name: string;
}

interface Props {
  onGroupChange: (id: number) => void;
  selectedGroupId: number;
}

const GroupSelector: React.FC<Props> = ({ onGroupChange, selectedGroupId }) => {
  const [groups, setGroups] = useState<GroupSummary[]>([]);

  // Fetch the list of groups only once when the component mounts
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get<GroupSummary[]>('/groups');
        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching groups", error);
      }
    };
    fetchGroups();
  }, []);

  return (
    <div className="mb-6 flex items-center space-x-3 bg-gray-100 p-4 rounded-lg">
      <label htmlFor="group-select" className="font-semibold text-gray-700">
        Current Group:
      </label>
      
      {/* Triggers the parent's state update whenever a new group is selected */}
      <select
        id="group-select"
        value={selectedGroupId}
        onChange={(e) => onGroupChange(Number(e.target.value))}
        className="border p-2 rounded bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
      >
        {groups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GroupSelector;