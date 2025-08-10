import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, User } from '../../../shared/types';

interface ChatSystemProps {
  user: User;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export function ChatSystem({ 
  user, 
  messages, 
  onSendMessage, 
  isMinimized = false, 
  onToggleMinimize 
}: ChatSystemProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isOpen, setIsOpen] = useState(!isMinimized);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    onSendMessage(inputMessage.trim());
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (onToggleMinimize) onToggleMinimize();
  };

  const getMessageColor = (message: ChatMessage) => {
    switch (message.type) {
      case 'system': return 'text-yellow-300';
      case 'announcement': return 'text-blue-300';
      default: return 'text-white';
    }
  };

  const getUsername = (message: ChatMessage) => {
    if (message.type === 'system') return 'System';
    if (message.type === 'announcement') return 'Announcement';
    return message.username;
  };

  return (
    <div className={`absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg transition-all duration-300 ${
      isOpen ? 'w-80 h-64' : 'w-20 h-10'
    }`}>
      {/* Chat Header */}
      <div 
        className="flex items-center justify-between p-2 border-b border-gray-600 cursor-pointer"
        onClick={toggleChat}
      >
        <span className="text-white font-bold text-sm">
          {isOpen ? 'Chat' : '💬'}
        </span>
        {isOpen && (
          <span className="text-gray-400 text-xs">
            {messages.length} messages
          </span>
        )}
      </div>

      {isOpen && (
        <>
          {/* Messages Area */}
          <div className="h-40 overflow-y-auto p-2 space-y-1">
            {messages.length === 0 ? (
              <div className="text-gray-400 text-sm italic">
                No messages yet. Say hello!
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="text-sm">
                  <span className="text-gray-400 text-xs">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  <span className={`ml-2 font-bold ${getMessageColor(message)}`}>
                    {getUsername(message)}:
                  </span>
                  <span className={`ml-1 ${getMessageColor(message)}`}>
                    {message.message}
                  </span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-2 border-t border-gray-600">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-gray-700 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Type a message..."
                maxLength={200}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Quick chat buttons for common messages
interface QuickChatProps {
  onSendMessage: (message: string) => void;
}

export function QuickChat({ onSendMessage }: QuickChatProps) {
  const quickMessages = [
    "Hello! 👋",
    "Good race! 🏁",
    "Nice car! 🚗",
    "Thanks! 👍",
    "Good game! 🎮",
    "See you later! 👋"
  ];

  return (
    <div className="absolute bottom-20 left-4 bg-black/70 p-2 rounded-lg">
      <div className="text-white text-xs mb-2 font-bold">Quick Chat:</div>
      <div className="grid grid-cols-2 gap-1">
        {quickMessages.map((message, index) => (
          <button
            key={index}
            onClick={() => onSendMessage(message)}
            className="bg-gray-600 hover:bg-gray-500 text-white text-xs px-2 py-1 rounded transition-colors"
          >
            {message}
          </button>
        ))}
      </div>
    </div>
  );
}