import React, { useState, useEffect } from 'react';
import { User } from '../../../shared/types';

interface UserLoginProps {
  onLogin: (user: User) => void;
}

export function UserLogin({ onLogin }: UserLoginProps) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim()) return;
    
    setIsLoading(true);
    
    // Create user account
    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: username.trim(),
      createdAt: new Date(),
      lastSeen: new Date()
    };
    
    // Store in localStorage for persistence
    localStorage.setItem('gameUser', JSON.stringify(user));
    
    setTimeout(() => {
      onLogin(user);
      setIsLoading(false);
    }, 500);
  };

  const handleGuestLogin = () => {
    const guestUser: User = {
      id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: `Guest${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date(),
      lastSeen: new Date()
    };
    
    localStorage.setItem('gameUser', JSON.stringify(guestUser));
    onLogin(guestUser);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="bg-white/95 backdrop-blur-sm shadow-2xl p-8 rounded-xl max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome!</h1>
          <p className="text-gray-600">Join the 3D Game Framework</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose a Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your username..."
              maxLength={20}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          
          <button
            onClick={handleLogin}
            disabled={!username.trim() || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            {isLoading ? 'Creating Account...' : 'Join Game'}
          </button>
          
          <div className="text-center">
            <span className="text-gray-500 text-sm">or</span>
          </div>
          
          <button
            onClick={handleGuestLogin}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Continue as Guest
          </button>
        </div>
        
        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>Your username will be visible to other players</p>
          <p>Guest accounts are temporary and won't save progress</p>
        </div>
      </div>
    </div>
  );
}

interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

export function UserProfile({ user, onLogout }: UserProfileProps) {
  return (
    <div className="absolute top-4 right-4 bg-black/70 text-white p-3 rounded-lg min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-green-300">{user.username}</span>
        <button
          onClick={onLogout}
          className="text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded transition-colors"
        >
          Logout
        </button>
      </div>
      <div className="text-xs text-gray-300">
        <div>ID: {user.id.slice(-8)}</div>
        <div>Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
      </div>
    </div>
  );
}