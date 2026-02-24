/*
 * App.tsx
 * The root component of the application. It manages global state 
 * (like the current user), handles basic tab-based routing, and toggles 
 * between the authentication screens and the main dashboard.
 */

import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import GroupsManager from './components/GroupsManager';
import api from './api/axios';
import type { User } from './types';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';

function App() {
  // Lazy initialization: reads from localStorage only once on the first render
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentGroupId, setCurrentGroupId] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'groups'>('dashboard');
  const [userNetWorth, setUserNetWorth] = useState<number>(0);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setCurrentGroupId(0);
    setActiveTab('dashboard');
  };

  // The Gatekeeper: If there is no user in state, force them to Login/Register
  if (!user) {
    return authMode === 'login' 
      ? <LoginView onLogin={setUser} onSwitchToRegister={() => setAuthMode('register')} />
      : <RegisterView onRegister={setUser} onSwitchToLogin={() => setAuthMode('login')} />;
  }

  // Fetches the global summary for the Profile tab
  const fetchUserSummary = async () => {
    if (!user) return;
    try {
      const res = await api.get<{ netBalance: number }>(`/users/${user.id}/summary`);
      setUserNetWorth(res.data.netBalance);
    } catch (error) {
      console.error("Error fetching summary", error);
    }
  };

  // Handles client-side "routing" by switching the active component
  const handleTabChange = (tab: 'dashboard' | 'profile' | 'groups') => {
    setActiveTab(tab);
    if (tab === 'profile') fetchUserSummary();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Configuration */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-blue-600">Social Ledger</h1>

            <div className="flex space-x-4">
              <button 
                onClick={() => handleTabChange('dashboard')}
                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition ${activeTab === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Dashboard
              </button>

              <button 
                onClick={() => handleTabChange('groups')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition ${activeTab === 'groups' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Groups
              </button>

              <button 
                onClick={() => handleTabChange('profile')}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition ${activeTab === 'profile' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Profile
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600">{user.name}</span>
            <button onClick={handleLogout} className="text-red-500 text-sm font-bold hover:underline">Logout</button>
          </div>
        </div>
      </nav>

      {/* Main Content Area - Renders the active tab */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        {activeTab === 'dashboard' && (
          <Dashboard 
            groupId={currentGroupId} 
            onGroupChange={setCurrentGroupId}
            onSwitchToGroups={() => handleTabChange('groups')}
          />
        )}
        {activeTab === 'groups' && (<GroupsManager />)}
        {activeTab === 'profile' && (
          <Profile 
            user={user} 
            netWorth={userNetWorth} 
          />
        )}
      </main>

      <footer className="py-8 text-center text-gray-400 text-xs">
        CS50 2026
      </footer>
    </div>
  );
}

export default App;