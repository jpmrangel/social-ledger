/*
 * Profile.tsx
 * A purely presentational component that displays the user's details 
 * and their aggregated "Net Worth" across all active simulation groups.
 */

import React from 'react';
import type { User } from '../types';

interface Props {
  user: User;
  netWorth: number;
}

const Profile: React.FC<Props> = ({ user, netWorth }) => {
  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-10">
      
      {/* User Avatar and Identity Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-8 text-center">
        <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-blue-600 mb-4 shadow-inner">
          {user.name.charAt(0)}
        </div>
        <h2 className="text-2xl font-bold text-white">{user.name}</h2>
        <p className="text-blue-100 opacity-80">{user.email}</p>
      </div>
      
      {/* Financial Standing Summary */}
      <div className="p-6">
        <h3 className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-4">
          Overall Financial Standing
        </h3>
        
        {/* Dynamically applies Green, Red, or Gray styling based on the net worth value */}
        <div className={`p-6 rounded-xl flex flex-col items-center justify-center border-2 
          ${netWorth > 0 ? 'bg-green-50 border-green-200' :
            netWorth < 0 ? 'bg-red-50 border-red-200' : 
            'bg-gray-50 border-gray-200'}`}>
          
          <span className={`text-3xl font-black 
            ${netWorth > 0 ? 'text-green-600' :
              netWorth < 0 ? 'text-red-600' : 
              'text-gray-600'}`}>
            ${Math.abs(netWorth).toFixed(2)}
          </span>

          <span className="text-gray-500 text-sm mt-1 font-medium">
            {netWorth > 0 ? 'You are owed money' :
             netWorth < 0 ? 'You owe money' : 
             'All settled up!'}
          </span>
        </div>
    
      </div>
    </div>
  );
};

export default Profile;