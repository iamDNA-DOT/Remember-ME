
import React from 'react';
import { Memory } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface StatisticsProps {
  memories: Memory[];
}

const Statistics: React.FC<StatisticsProps> = ({ memories }) => {
  const categories = memories.reduce((acc: any, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  const data = Object.keys(categories).map(cat => ({
    name: cat,
    value: categories[cat]
  }));

  const COLORS = ['#38bdf8', '#fbbf24', '#34d399', '#818cf8', '#f472b6', '#a78bfa', '#fb7185'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xl">
          <p className="text-xs font-bold text-zinc-100 uppercase tracking-widest">{payload[0].name}</p>
          <p className="text-lg font-bold text-zinc-100">{payload[0].value}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">Occurrences</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Category Breakdown */}
      <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-8">Conceptual Distribution</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#71717a', fontSize: 10}} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#18181b'}} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Identity Graph Placeholder */}
      <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-8 self-start">Identity Evolution</h3>
        <div className="h-64 w-full flex items-center justify-center">
          {memories.length > 5 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-zinc-600 space-y-2">
              <p className="text-xs">INSUFFICIENT DATA FOR IDENTITY MAPPING</p>
              <p className="text-[10px] uppercase">Record more memories to reveal patterns.</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Deepest Focus', value: data.sort((a,b) => b.value - a.value)[0]?.name || 'N/A' },
          { label: 'Capture Velocity', value: `${(memories.length / 7).toFixed(1)}/day` },
          { label: 'Longest Streak', value: '4 Days' },
          { label: 'Data Entropy', value: 'Low' },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900/20 border border-zinc-800/50 p-4 rounded-xl">
             <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">{stat.label}</div>
             <div className="text-lg font-semibold text-zinc-200">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Statistics;
