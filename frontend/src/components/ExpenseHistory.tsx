/*
 * ExpenseHistory.tsx
 * Renders a chronological table of all expenses for the active group. 
 * Allows users to delete past expenses, which triggers a full recalculation 
 * of the group's debts and balances.
 */

import React from 'react';
import api from '../api/axios';
import type { Expense } from '../types';

interface Props {
  expenses: Expense[];
  onDataChange: () => void;
}

const ExpenseHistory: React.FC<Props> = ({ expenses, onDataChange }) => {
  
  // Handles deletion and immediately requests fresh data from the backend
  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await api.delete(`/expenses/${id}`);
        onDataChange(); // Triggers the Dashboard's refreshDetails() callback
      } catch (error) {
        console.error("Failed to delete expense", error);
      }
    }
  };

  return (
    <div className="mt-8 bg-white rounded shadow overflow-hidden">
      <h2 className="text-xl font-bold p-4 border-b">Expense History</h2>
      
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 border-b">Description</th>
            <th className="p-3 border-b">Payer</th>
            <th className="p-3 border-b text-right">Amount</th>
            <th className="p-3 border-b text-center">Actions</th>
          </tr>
        </thead>
        
        <tbody>
          {/* Map through expenses if they exist */}
          {expenses.map((exp) => (
            <tr key={exp.id} className="hover:bg-gray-50">
              <td className="p-3 border-b">{exp.description}</td>
              <td className="p-3 border-b">{exp.payer.name}</td>
              <td className="p-3 border-b text-right font-mono">
                ${exp.totalAmount.toFixed(2)}
              </td>
              <td className="p-3 border-b text-center">
                <button 
                  onClick={() => handleDelete(exp.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-semibold"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          
          {/* Empty state fallback */}
          {expenses.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                No expenses recorded yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseHistory;