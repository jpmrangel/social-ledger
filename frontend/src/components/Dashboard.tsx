/*
 * Dashboard.tsx
 * The main application view. It orchestrates the loading of financial 
 * data for the currently selected group, handles edge cases (like deleted groups), 
 * and renders the Input form, Net Balances, Settle Up instructions, and History.
 */

import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import type { Group, Balance, Expense, Settlement, User } from '../types';
import AddExpenseForm from './AddExpenseForm';
import ExpenseHistory from './ExpenseHistory';
import GroupSelector from './GroupSelector';

interface Props {
  groupId: number;
  onGroupChange: (id: number) => void;
  onSwitchToGroups: () => void;
}

const Dashboard: React.FC<Props> = ({ groupId, onGroupChange, onSwitchToGroups }) => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<User[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Derived state calculations
  const totalGroupSpending = expenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
  const averageSpendingPerPerson = totalGroupSpending / (members.length || 1);

  // 1. Separate the "Load Details" logic so it can be re-used after adding/deleting expenses
  const refreshDetails = useCallback(async () => {
    if (groupId === 0) return;
    try {
      const [balRes, setRes, expRes, groupRes] = await Promise.all([
        api.get<Balance[]>(`/groups/${groupId}/balances`),
        api.get<Settlement[]>(`/groups/${groupId}/settle`),
        api.get<Expense[]>(`/groups/${groupId}/expenses`),
        api.get<{ members: User[] }>(`/groups/${groupId}`) 
      ]);
      
      setBalances(balRes.data);
      setSettlements(setRes.data);
      setExpenses(expRes.data);
      setMembers(groupRes.data.members);
    } catch (error) {
      console.error("Error refreshing details", error);
    }
  }, [groupId]);
  
  // 2. The Main Orchestrator Effect
  useEffect(() => {
    let isMounted = true;

    const initDashboard = async () => {
      setIsLoading(true);
      try {
        // Step A: Always fetch the list of groups first to validate context
        const groupsRes = await api.get<Group[]>('/groups');
        const availableGroups = groupsRes.data;

        if (!isMounted) return;

        // Step B: Handle "No Groups" case
        if (availableGroups.length === 0) {
          if (groupId !== 0) {
             onGroupChange(0); // Sync parent state
          }
          setIsLoading(false); // Stop loading to show "Ready to simulate?"
          return;
        }

        // Step C: Validate current ID to prevent 404s (Handles the "Deleted Group" case)
        const currentGroupIsValid = availableGroups.some(g => g.id === groupId);

        if (!currentGroupIsValid) {
          // If our ID is dead (deleted), switch to the first living group
          onGroupChange(availableGroups[0].id);
          return; // The component will re-render with the new valid ID
        }

        // Step D: If the ID is valid, fetch all group data
        await refreshDetails();
        
        if (isMounted) setIsLoading(false);

      } catch (error) {
        console.error("Dashboard sync error", error);
        if (isMounted) setIsLoading(false);
      }
    };

    initDashboard();

    return () => { isMounted = false; };
  }, [groupId, onGroupChange, refreshDetails]);

  // --- Rendering Logic ---

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 font-medium">Updating Ledger...</span>
      </div>
    );
  }

  if (groupId === 0) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center animate-in fade-in duration-700">
        <div className="bg-white p-12 rounded-3xl shadow-xl border-2 border-blue-100">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            📊
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Ready to simulate?</h1>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            You don't have any active groups. Head over to the Groups tab to create a new scenario.
          </p>
          <button 
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg"
            onClick={() => {onSwitchToGroups()}}
          >
            Go to Groups Manager
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Social Ledger Dashboard</h1>

      <div className="mb-8">
        <label className="block text-xs font-bold uppercase text-gray-400 mb-1 ml-1">
          Active Simulation
        </label>
        <GroupSelector 
          selectedGroupId={groupId} 
          onGroupChange={onGroupChange} 
        />
      </div>
      
      {/* 1. INPUT: The Form to add new bills */}
      <AddExpenseForm 
        groupId={groupId} 
        members={members} 
        onExpenseAdded={refreshDetails} 
      />

      {/* Global Financial Summary Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-xl shadow-lg text-white mb-8">
        <h2 className="text-lg font-medium opacity-90">Group Financial Summary</h2>
        <div className="flex justify-between items-end mt-2">
          <div>
            <p className="text-3xl font-bold">${totalGroupSpending.toFixed(2)}</p>
            <p className="text-sm opacity-75">Total Spent</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-semibold">${averageSpendingPerPerson.toFixed(2)}</p>
            <p className="text-sm opacity-75">Average / Member</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* 2. STATUS: Showing who is positive/negative */}
        <section className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Net Balances</h2>
          <div className="space-y-3">
            {balances.map(b => (
              <div key={b.userId} className={`p-3 rounded-md flex justify-between 
                ${b.netBalance >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
              >
                <span className="font-medium">{b.userName}</span>
                <span className="font-bold">${Math.abs(b.netBalance).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. SOLUTION: The "Min-Flow" instructions calculated by the backend */}
        <section className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Settle Up Instructions</h2>
          <ul className="space-y-2">
            {settlements.map((s, idx) => (
              <li key={idx} className="text-gray-700">
                <strong>{s.fromUserName}</strong> ➔ <strong>{s.toUserName}</strong>: 
                <span className="ml-2 font-mono font-bold text-blue-600">${s.amount.toFixed(2)}</span>
              </li>
            ))}
            {settlements.length === 0 && <p className="text-gray-500 italic">Everyone is square!</p>}
          </ul>
        </section>
      </div>

      {/* 4. HISTORY: Table of past expenses */}
      <ExpenseHistory expenses={expenses} onDataChange={refreshDetails} />
    </div>
  );
};

export default Dashboard;