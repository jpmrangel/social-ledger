/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * LoginView.tsx
 * Handles user authentication. Includes localized state to trigger 
 * smooth CSS exit animations before routing the user to the Registration view.
 */

import React, { useState } from 'react';
import api from '../api/axios';
import type { User } from '../types';

interface Props {
  onLogin: (user: User) => void;
  onSwitchToRegister: () => void;
}

const LoginView: React.FC<Props> = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isClosing, setIsClosing] = useState(false); // Controls the exit animation

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post<User>('/auth/login', { email, password });
      localStorage.setItem('user', JSON.stringify(res.data));
      onLogin(res.data);
    } catch (err) {
      alert("Invalid email or password.");
    }
  };

  // Triggers the shrink animation, waits 200ms, then tells the App to swap views
  const handleSwitch = () => {
    setIsClosing(true);
    setTimeout(() => {
      onSwitchToRegister();
    }, 200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div 
        className={`max-w-md w-full bg-white p-8 rounded-2xl shadow-xl origin-center
        ${isClosing ? 'animate-shrink' : 'animate-grow'}`}
      >
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">Social Ledger</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" placeholder="Email Address" required
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Password" required
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">
            Login
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account? 
          <button onClick={handleSwitch} className="ml-1 text-blue-600 font-bold hover:underline">
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginView;