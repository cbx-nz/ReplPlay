import { useState, useRef, useEffect } from "react";
import { useMultiplayer } from "../lib/stores/useMultiplayer";

interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

export default function MultiplayerChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const { isConnected, playerId } = useMultiplayer();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Listen for chat messages
  useEffect(() => {
    const { socket } = useMultiplayer.getState();
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat_message') {
          setMessages(prev => [...prev, {
            playerId: data.playerId,
            playerName: data.playerName,
            message: data.message,
            timestamp: Date.now()
          }]);
        }
      } catch (error) {
        console.error("Failed to parse chat message:", error);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, []);

  const sendMessage = () => {
    if (!inputValue.trim() || !isConnected) return;

    const { socket } = useMultiplayer.getState();
    if (socket) {
      socket.send(JSON.stringify({
        type: 'chat_message',
        message: inputValue.trim()
      }));
    }

    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  if (!isConnected) return null;

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute bottom-4 right-20 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors"
        title="Toggle Chat"
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-4 w-80 h-96 bg-black/80 border border-gray-600 rounded-lg flex flex-col">
          {/* Header */}
          <div className="bg-gray-800 text-white p-3 rounded-t-lg flex justify-between items-center">
            <span className="font-semibold">Multiplayer Chat</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto text-white text-sm">
            {messages.length === 0 ? (
              <div className="text-gray-400 text-center mt-8">
                No messages yet. Say hello! 👋
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="mb-2">
                  <span className="text-blue-400 font-semibold">
                    {msg.playerName}:
                  </span>
                  <span className="ml-2">{msg.message}</span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-600">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                maxLength={100}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
