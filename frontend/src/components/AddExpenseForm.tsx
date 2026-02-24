/*
 * AddExpenseForm.tsx
 * UI component for logging a new group expense. It manages complex 
 * local state to allow users to dynamically include/exclude members from a bill 
 * and automatically calculates equal split amounts before sending to the backend.
 */

import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import type { User } from '../types';

interface Props {
  groupId: number;
  members: User[];
  onExpenseAdded: () => void;
}

const AddExpenseForm: React.FC<Props> = ({ groupId, members, onExpenseAdded }) => {
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [payerId, setPayerId] = useState<number>(0);
  
  // Tracks the actual monetary amount assigned to each user ID
  const [splits, setSplits] = useState<Record<number, number>>({});
  
  // Tracks which users are currently "checked" to participate in this specific bill
  const [includedMemberIds, setIncludedMemberIds] = useState<Set<number>>(new Set());

  // Initialize the default payer and check all members when the component loads
  useEffect(() => {
    if (members.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPayerId(members[0].id);
      setIncludedMemberIds(new Set(members.map(m => m.id))); 
    }
  }, [members]);

  // Adds or removes a user from the split calculation pool
  const toggleMember = (id: number) => {
    const newSet = new Set(includedMemberIds);
    if (newSet.has(id)) {
      newSet.delete(id);
      // Zero out their debt if they are unchecked from the bill
      setSplits(prev => ({ ...prev, [id]: 0 }));
    } else {
      newSet.add(id);
    }
    setIncludedMemberIds(newSet);
  };

  // Auto-calculates the debt only for members who are checked
  const handleEqualSplit = () => {
    if (includedMemberIds.size === 0) return;

    // Fixes JS floating point issues (e.g., $100 / 3 = 33.33)
    const splitAmount = parseFloat((totalAmount / includedMemberIds.size).toFixed(2));
    const newSplits: Record<number, number> = {};
    
    members.forEach(m => {
      newSplits[m.id] = includedMemberIds.has(m.id) ? splitAmount : 0;
    });
    
    setSplits(newSplits);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sumOfSplits = Object.values(splits).reduce((a, b) => a + b, 0);
    
    // Validates that splits equal the total. 
    // The 0.02 margin accounts for lost pennies in odd divisions (e.g., 33.33 * 3 = 99.99)
    if (Math.abs(sumOfSplits - totalAmount) > 0.02) {
      alert(`The sum of splits ($${sumOfSplits.toFixed(2)}) must equal the total ($${totalAmount.toFixed(2)})`);
      return;
    }

    try {
      await api.post('/expenses', {
        description, totalAmount, payerId, groupId, splits
      });
      
      // Tell the parent component to refresh the data, then clear the form
      onExpenseAdded();
      setDescription('');
      setTotalAmount(0);
      setSplits({});
    } catch (error) {
      console.error("Error saving expense", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-100">
      <h2 className="text-xl font-bold mb-6 text-gray-800">New Expense</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input 
          type="text" placeholder="Description" 
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
          value={description} onChange={(e) => setDescription(e.target.value)} required 
        />
        <input 
          type="number" placeholder="Total Amount" min="0" step="0.01"
          className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
          value={totalAmount || ''} onChange={(e) => setTotalAmount(Number(e.target.value))} required 
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-600 mb-2">Paid by</label>
        <select 
          className="border p-3 rounded-lg w-full bg-gray-50" 
          value={payerId} onChange={(e) => setPayerId(Number(e.target.value))}
        >
          {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <label className="font-semibold text-gray-700">Splits & Participation</label>
          <button 
            type="button" onClick={handleEqualSplit}
            className="text-xs font-bold uppercase tracking-wider bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
          > Split Equally </button>
        </div>

        <div className="space-y-3">
          {members.map(m => (
            <div key={m.id} className="flex items-center space-x-4 bg-gray-50 p-2 rounded-lg">
              <input 
                type="checkbox" 
                checked={includedMemberIds.has(m.id)}
                onChange={() => toggleMember(m.id)}
                className="w-5 h-5 text-blue-600 rounded cursor-pointer"
              />
              <span className="flex-grow font-medium text-gray-700">{m.name}</span>
              <div className="relative">
                <span className="absolute left-2 top-2 text-gray-400">$</span>
                <input 
                  type="number" min="0" step="0.01"
                  className={`border p-2 pl-6 rounded-md w-28 text-right ${!includedMemberIds.has(m.id) ? 'bg-gray-200 text-gray-400' : 'bg-white'}`}
                  value={splits[m.id] || ''}
                  disabled={!includedMemberIds.has(m.id)}
                  onChange={(e) => setSplits({...splits, [m.id]: Number(e.target.value)})}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition shadow-md">
        Save Transaction
      </button>
    </form>
  );
};

export default AddExpenseForm;