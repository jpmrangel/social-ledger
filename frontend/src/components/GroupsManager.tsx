/*
 * GroupsManager.tsx
 * A comprehensive management dashboard for creating and editing 
 * simulation groups, as well as registering "Guest" users. It includes logic 
 * to protect "Real" registered accounts from being accidentally deleted.
 */

import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import type { Group, User } from '../types';

const GroupsManager: React.FC = () => {
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [userName, setUserName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const getCurrentUser = (): User | null => {
    const json = localStorage.getItem('user');
    return json ? JSON.parse(json) : null;
  }

  // Initial data fetch on component mount
  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    const currentUser = getCurrentUser();
    try {
      const [uRes, gRes] = await Promise.all([
        api.get<User[]>('/users'),
        api.get<Group[]>('/groups')
      ]);

      let usersList = uRes.data;

      // Ensure the currently logged-in user is always at the top of the list
      if (currentUser && !usersList.some(u => u.id === currentUser.id)) {
        usersList = [currentUser, ...usersList];
      }
      
      setAvailableUsers(usersList);
      setAvailableGroups(gRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  // UX Polish: Automatically scroll down when the Group Creation form opens
  useEffect(() => {
    if (isFormOpen && !isClosing) {
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight, 
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [isFormOpen, isClosing]);

  // --- User Management Logic ---

  const handleAddPerson = async () => {
    if (!userName) return;
    try {
      await api.post('/users', { name: userName });
      setUserName('');
      fetchData();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert("Error adding person.");
    }
  };

  const handleDeletePerson = async (user: User) => {
    const currentUser = getCurrentUser();
    
    if (currentUser && user.id === currentUser.id) {
      alert("You cannot delete yourself from the available list.");
      return;
    }

    // Security Gate: Protect real accounts from deletion
    const isSimulation = user.email && user.email.endsWith("@simulation.local");
    if (user.email && !isSimulation) {
      alert("You cannot delete a registered user account.");
      return;
    }

    if (window.confirm(`Delete "${user.name}"? This cannot be undone.`)) {
      try {
        await api.delete(`/users/${user.id}`);
        fetchData();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        // Handle backend foreign key constraint rejections
        if (error.response?.status === 500 || error.response?.status === 409) {
          alert("Cannot delete this person: They are currently part of a group or have active expenses. Remove them from all groups first!");
        } else {
          alert("An error occurred while trying to delete this user.");
        }
      }
    }
  };

  // --- Group Management Logic ---

  const handleSaveGroup = async () => {
    if (!groupName.trim()) {
      alert("Please enter a name for the group.");
      return;
    }
    
    if (selectedUserIds.size === 0) {
      alert("Please select at least one member.");
      return;
    }

    const payload = { name: groupName.trim(), userIds: Array.from(selectedUserIds) };
    try {
      if (editingGroupId) {
        await api.put(`/groups/${editingGroupId}`, payload);
      } else {
        await api.post('/groups', payload);
      }
      await fetchData();
      setIsFormOpen(false);
      resetForm();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert("Error saving group. Please try again.");
    }
  };

  const handleDeleteGroup = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this group simulation? All associated expenses will be lost.")) {
      try {
        await api.delete(`/groups/${id}`);
        fetchData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        alert("Error deleting group.");
      }
    }
  };

  // --- Form View State Handlers ---

  const startEdit = (group: Group) => {
    setEditingGroupId(group.id);
    setGroupName(group.name);
    setSelectedUserIds(new Set(group.members?.map(m => m.id) || []));
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setEditingGroupId(null);
    setGroupName('');
    setSelectedUserIds(new Set());
    setIsFormOpen(false);
  };

  const handleNewGroup = () => {
    resetForm();
    setIsFormOpen(true);
  }

  const closeForm = () => {
    setIsClosing(true);
    // Wait for the CSS shrink animation to finish before removing from DOM
    setTimeout(() => {
      setIsFormOpen(false);
      setIsClosing(false);
      resetForm();
    }, 300); 
  };

  const currentUser = getCurrentUser();

  return (
    <div className="space-y-8 max-w-2xl mx-auto mt-8 animate-in fade-in duration-500">
      
      {/* 1. REGISTER PEOPLE SECTION */}
      <section className="bg-white p-6 rounded-2xl shadow-md">
        <h3 className="text-lg font-bold mb-4">Register People</h3>
        
        <div className="flex space-x-2 mb-4">
          <input 
            type="text" value={userName} onChange={(e) => 
            setUserName(e.target.value)} 
            placeholder="Name" 
            className="flex-grow border p-3 rounded-lg" 
          />
          <button 
            onClick={handleAddPerson} 
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {availableUsers.map(u => {
            // Determine visual styling based on user type
            const isMe = currentUser && u.id === currentUser.id;
            const isSimulation = u.email && u.email.endsWith("@simulation.local");
            const isRealAccount = u.email && !isSimulation;

            return (
              <span 
                key={u.id} 
                className={`px-3 py-1 rounded-full text-sm flex items-center border 
                  ${isMe 
                    ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' 
                    : isRealAccount
                      ? 'bg-purple-50 border-purple-200 text-purple-700'
                      : 'bg-gray-100 border-gray-200 text-gray-600'
                  }`}
              >
                {u.name} 
                {isMe && " (You)"}
                {isRealAccount && !isMe && " (User)"}

                {/* Only show delete button for Simulated Guest users */}
                {!isMe && !isRealAccount &&(
                  <button 
                    onClick={() => handleDeletePerson(u)} 
                    className="ml-2 text-gray-400 hover:text-red-500 font-bold transition"
                    title="Delete guest"
                  >
                    ×
                  </button>
                )}
              </span>
            );
          })}
        </div>
      </section>

      {/* 2. LIST EXISTING GROUPS SECTION */}
      <section className="bg-white p-6 rounded-2xl shadow-md">
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <h3 className="text-lg font-bold text-gray-800">Existing Groups</h3>
          <button 
            onClick={() => handleNewGroup()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm"
          >
            + New Group
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {availableGroups.length === 0 ? (
            <div className="text-center py-10 px-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <p className="text-gray-500 font-medium text-lg mb-1">No groups found</p>
              <p className="text-gray-400 text-sm">
                Create a new group to start tracking expenses.
              </p>
            </div>
          ) : (
            availableGroups.map(g => (
              <div key={g.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50 hover:border-blue-200 transition shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">{g.name}</h4>
                    <p className="text-xs text-gray-400">ID: {g.id}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => startEdit(g)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition" title="Edit Group">
                      <span className="text-sm font-bold">Edit</span>
                    </button>
                    <button onClick={() => handleDeleteGroup(g.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition" title="Delete Group">
                      <span className="text-sm font-bold">Delete</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {g.members && g.members.length > 0 ? (
                    g.members.map(m => (
                      <span key={m.id} className="px-2 py-1 bg-white border border-gray-200 text-gray-600 text-xs rounded-md shadow-sm">
                        {m.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic">No members assigned</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 3. CONDITIONAL FORM SECTION (CREATE/EDIT GROUP) */}
      {isFormOpen && (
      <section 
        className={`bg-white p-6 rounded-2xl shadow-xl border-2 border-blue-100 origin-top
          ${isClosing ? 'animate-shrink' : 'animate-grow'}`}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {editingGroupId ? `Editing: ${groupName}` : 'Create New Group'}
          </h3>
          <button 
            onClick={closeForm} 
            className="text-gray-400 hover:text-gray-600 text-2xl transition-transform hover:rotate-90 duration-200"
          >
            &times;
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Group Name</label>
            <input 
              type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} 
              placeholder="e.g., Saturday BBQ" 
              className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Include Members</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableUsers.map(user => {
                 const isMe = currentUser && user.id === currentUser.id;
                 return (
                  <button 
                    key={user.id} 
                    onClick={() => {
                      const next = new Set(selectedUserIds);
                      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                      next.has(user.id) ? next.delete(user.id) : next.add(user.id);
                      setSelectedUserIds(next);
                    }}
                    className={`p-3 rounded-xl text-sm font-medium border transition-all ${
                      selectedUserIds.has(user.id) 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]' 
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {user.name} {isMe && "(You)"}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button 
              onClick={handleSaveGroup} 
              disabled={!groupName.trim() || selectedUserIds.size === 0}
              className={`flex-grow py-4 rounded-2xl font-bold transition shadow-lg ${
                (!groupName.trim() || selectedUserIds.size === 0) 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
              }`}
            >
              {editingGroupId ? 'Update' : 'Save'}
            </button>
            <button 
              onClick={closeForm} 
              className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </section>
    )}
    </div>
  );
};

export default GroupsManager;