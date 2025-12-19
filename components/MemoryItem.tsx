
import React from 'react';
import { Memory } from '../types';
import { Tag, Calendar, Layers, Info } from 'lucide-react';

interface MemoryItemProps {
  memory: Memory;
}

const MemoryItem: React.FC<MemoryItemProps> = ({ memory }) => {
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Thought': return 'text-sky-400 border-sky-400/20 bg-sky-400/5';
      case 'Decision': return 'text-amber-400 border-amber-400/20 bg-amber-400/5';
      case 'Goal': return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5';
      case 'Learning': return 'text-indigo-400 border-indigo-400/20 bg-indigo-400/5';
      case 'Idea': return 'text-pink-400 border-pink-400/20 bg-pink-400/5';
      default: return 'text-zinc-400 border-zinc-800 bg-zinc-900/50';
    }
  };

  return (
    <div className="group border border-zinc-800 rounded-xl p-5 bg-zinc-900/20 hover:bg-zinc-900/40 transition-all hover:border-zinc-700">
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${getCategoryColor(memory.category)}`}>
          {memory.category}
        </span>
        <span className="text-[10px] text-zinc-500 font-mono">
          {new Date(memory.timestamp).toLocaleDateString()}
        </span>
      </div>
      
      <p className="text-sm text-zinc-200 leading-relaxed mb-4">
        {memory.content}
      </p>

      {memory.metadata.facts && memory.metadata.facts.length > 0 && (
        <div className="space-y-1.5 mb-4">
           <div className="flex items-center space-x-1.5 text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
             <Info size={10} />
             <span>Extracted Facts</span>
           </div>
           <div className="flex flex-wrap gap-1.5">
             {memory.metadata.facts.map((fact, idx) => (
               <span key={idx} className="text-[11px] text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded">
                 {fact}
               </span>
             ))}
           </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
        <div className="flex space-x-2">
          {memory.metadata.tags?.map(tag => (
            <span key={tag} className="flex items-center space-x-1 text-[10px] text-zinc-600">
              <Tag size={10} />
              <span>{tag}</span>
            </span>
          ))}
        </div>
        {memory.inferredLifePhase && (
          <div className="flex items-center space-x-1 text-[10px] text-zinc-600">
            <Layers size={10} />
            <span>{memory.inferredLifePhase}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryItem;
