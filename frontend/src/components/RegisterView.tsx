/*
 * RegisterView.tsx
 * Handles new user registration with basic password confirmation 
 * validation. Mirrors the LoginView's exit animation logic for a seamless UX.
 */

import React, { useState } from 'react';
import api from '../api/axios';
import type { User } from '../types';

interface Props {
  onRegister: (user: User) => void;
  onSwitchToLogin: () => void;
}

const RegisterView: React.FC<Props> = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmation: '' });
  const [isClosing, setIsClosing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmation) {
      return alert("Passwords do not match!");
    }
    try {
      const res = await api.post<User>('/auth/register', formData);
      localStorage.setItem('user', JSON.stringify(res.data));
      onRegister(res.data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert("Registration failed. Email might already be in use.");
    }
  };

  // Triggers the shrink animation, waits 200ms, then tells the App to swap views
  const handleSwitch = () => {
    setIsClosing(true);
    setTimeout(() => {
      onSwitchToLogin();
    }, 200); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div 
        className={`max-w-md w-full bg-white p-8 rounded-2xl shadow-xl origin-center
        ${isClosing ? 'animate-shrink' : 'animate-grow'}`}
      >
        <h2 className="text-3xl font-bold text-center text-green-600 mb-8">Join Social Ledger</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Name" required className="w-full p-3 border rounded-xl"
            onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <input type="email" placeholder="Email" required className="w-full p-3 border rounded-xl"
            onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <input type="password" placeholder="Password" required className="w-full p-3 border rounded-xl"
            onChange={(e) => setFormData({...formData, password: e.target.value})} />
          <input type="password" placeholder="Confirm Password" required className="w-full p-3 border rounded-xl"
            onChange={(e) => setFormData({...formData, confirmation: e.target.value})} />
          
          <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">
            Create Account
          </button>
        </form>
        
        <button onClick={handleSwitch} className="w-full mt-4 text-sm text-gray-500 hover:underline">
          Already have an account? Login
        </button>
      </div>
    </div>
  );
};

export default RegisterView;