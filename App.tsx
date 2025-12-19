
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Clock, 
  Activity, 
  Database, 
  Brain, 
  Terminal, 
  ChevronRight,
  Shield,
  Trash2,
  Calendar,
  RotateCcw,
  RotateCw
} from 'lucide-react';
import { Memory, ChatMessage, MemoryCategory } from './types';
import { processInput } from './geminiService';
import MemoryItem from './components/MemoryItem';
import Statistics from './components/Statistics';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [view, setView] = useState<'timeline' | 'insights' | 'archive'>('timeline');
  
  // Undo/Redo stacks
  const [history, setHistory] = useState<{ memories: Memory[], messages: ChatMessage[] }[]>([]);
  const [redoStack, setRedoStack] = useState<{ memories: Memory[], messages: ChatMessage[] }[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Load state
  useEffect(() => {
    const savedMemories = localStorage.getItem('life_os_memories');
    if (savedMemories) setMemories(JSON.parse(savedMemories));
    
    const savedMessages = localStorage.getItem('life_os_messages');
    if (savedMessages) setMessages(JSON.parse(savedMessages));
  }, []);

  // Save state
  useEffect(() => {
    localStorage.setItem('life_os_memories', JSON.stringify(memories));
    localStorage.setItem('life_os_messages', JSON.stringify(messages));
  }, [memories, messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, memories]);

  const saveToHistory = () => {
    setHistory(prev => [...prev, { memories: [...memories], messages: [...messages] }].slice(-10)); // Keep last 10 states
    setRedoStack([]); // Clear redo stack on new action
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setRedoStack(prev => [...prev, { memories: [...memories], messages: [...messages] }]);
    setMemories(previousState.memories);
    setMessages(previousState.messages);
    setHistory(prev => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setHistory(prev => [...prev, { memories: [...memories], messages: [...messages] }]);
    setMemories(nextState.memories);
    setMessages(nextState.messages);
    setRedoStack(prev => prev.slice(0, -1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    // Save current state to history before modification
    saveToHistory();

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsProcessing(true);

    try {
      const result = await processInput(currentInput, memories);

      if (result.type === 'storage') {
        const newMemory: Memory = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          content: currentInput,
          category: result.data.category as MemoryCategory,
          metadata: {
            intent: result.data.intent,
            facts: result.data.facts,
            emotions: result.data.emotions,
            importance: result.data.importance,
            tags: result.data.tags
          },
          inferredLifePhase: result.data.lifePhase
        };
        setMemories(prev => [newMemory, ...prev]);
        
        const systemMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'system',
          content: '[Stored]',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, systemMessage]);
      } else {
        const systemMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'system',
          content: result.data,
          timestamp: new Date().toISOString(),
          isRetrieval: true
        };
        setMessages(prev => [...prev, systemMessage]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearData = () => {
    if (window.confirm("Permanently erase all cognitive records?")) {
      setMemories([]);
      setMessages([]);
      setHistory([]);
      setRedoStack([]);
      localStorage.removeItem('life_os_memories');
      localStorage.removeItem('life_os_messages');
    }
  };

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 flex flex-col p-4 space-y-8 bg-[#0c0c0e]">
        <div className="flex items-center space-x-2 text-indigo-400">
          <Brain size={24} />
          <h1 className="text-xl font-bold tracking-tighter mono">LIFE OS</h1>
        </div>

        <nav className="flex-1 space-y-1">
          <button 
            onClick={() => setView('timeline')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${view === 'timeline' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}`}
          >
            <Clock size={18} />
            <span className="text-sm font-medium">Timeline</span>
          </button>
          <button 
            onClick={() => setView('insights')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${view === 'insights' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}`}
          >
            <Activity size={18} />
            <span className="text-sm font-medium">Insights</span>
          </button>
          <button 
            onClick={() => setView('archive')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${view === 'archive' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'}`}
          >
            <Database size={18} />
            <span className="text-sm font-medium">Memory Pool</span>
          </button>
        </nav>

        <div className="pt-4 border-t border-zinc-800 space-y-4">
          <div className="flex items-center space-x-2 text-xs text-zinc-500 uppercase tracking-widest px-3">
            <Shield size={12} />
            <span>Local Encryption</span>
          </div>
          <button 
            onClick={clearData}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-red-500/70 hover:text-red-500 hover:bg-red-500/5 transition-colors text-sm"
          >
            <Trash2 size={18} />
            <span>Format System</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col h-full relative">
        
        {/* Header (Stats/Status) */}
        <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-xs font-medium mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-zinc-400">STATUS: PASSIVE CAPTURE ACTIVE</span>
            </div>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center space-x-4">
              <div className="text-xs text-zinc-500">MEMORIES: <span className="text-zinc-300">{memories.length}</span></div>
            </div>
            {/* Undo/Redo Buttons */}
            <div className="flex items-center space-x-1 ml-4">
              <button 
                onClick={handleUndo}
                disabled={history.length === 0}
                title="Undo last capture (Ctrl+Z)"
                className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <RotateCcw size={14} />
              </button>
              <button 
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                title="Redo (Ctrl+Y)"
                className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <RotateCw size={14} />
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Calendar size={16} className="text-zinc-500" />
            <span className="text-xs text-zinc-400 uppercase tracking-tight">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {view === 'timeline' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col" ref={scrollRef}>
              <div className="max-w-3xl mx-auto w-full space-y-8 py-8">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center space-y-4 py-20 opacity-40">
                    <Terminal size={48} />
                    <p className="text-sm font-medium tracking-wide">AWAITING COGNITIVE INPUT...</p>
                    <p className="text-xs max-w-xs text-center">Life OS is monitoring your stream of consciousness. Just type to record a memory.</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-zinc-100 text-zinc-950 ml-12 rounded-tr-none' 
                        : msg.isRetrieval 
                          ? 'bg-indigo-600/10 border border-indigo-500/30 text-indigo-100 mr-12 rounded-tl-none font-light leading-relaxed' 
                          : 'bg-zinc-900 text-zinc-400 mr-12 rounded-tl-none font-mono text-xs italic'
                    }`}>
                      {msg.isRetrieval && (
                        <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-indigo-500/20 text-indigo-400 font-bold text-xs uppercase tracking-widest">
                          <Brain size={12} />
                          <span>Cognitive Retrieval</span>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      <div className={`mt-2 text-[10px] ${msg.role === 'user' ? 'text-zinc-500' : 'text-zinc-600'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'archive' && (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-semibold tracking-tight">Structured Life Storage</h2>
                  <div className="flex space-x-2">
                    {['Thought', 'Goal', 'Idea', 'Event'].map(cat => (
                      <span key={cat} className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {memories.map((memory) => (
                    <MemoryItem key={memory.id} memory={memory} />
                  ))}
                </div>
                {memories.length === 0 && (
                  <div className="text-center py-20 text-zinc-500">No memories found in the archive.</div>
                )}
              </div>
            </div>
          )}

          {view === 'insights' && (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-semibold tracking-tight mb-8">Pattern Analysis</h2>
                <Statistics memories={memories} />
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-6 border-t border-zinc-800 bg-[#0c0c0e]/50 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-500 transition-colors">
              <Plus size={20} />
            </div>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isProcessing}
              placeholder={isProcessing ? "SYNCHRONIZING..." : "Capture memory or query retrieval (e.g., 'remember when...')"}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-full py-4 pl-12 pr-16 focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 transition-all placeholder-zinc-600 text-zinc-100 disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={isProcessing || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full text-black hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:bg-zinc-800"
            >
              <ChevronRight size={20} />
            </button>
          </form>
          <div className="max-w-4xl mx-auto mt-3 flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-medium px-4">
             <div className="flex items-center space-x-4">
               <span>Input mode: {input.toLowerCase().includes('remember') || input.toLowerCase().includes('what') ? 'RETRIEVAL' : 'PASSIVE CAPTURE'}</span>
               <span className="text-zinc-800">|</span>
               <span>Privacy: LOCAL ONLY</span>
             </div>
             <div>
               v1.0.4-COGNITIVE-CORE
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
