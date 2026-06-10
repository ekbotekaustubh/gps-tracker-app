import React from 'react';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Operational Overview</h1>
        <p className="text-slate-500 text-sm">System metrics summary compiled in real-time.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Gross Operational Revenue', value: '$42,120', change: '+14.2%', color: 'text-emerald-600' },
          { title: 'Concurrent User Sessions', value: '3,812', change: '+22.4%', color: 'text-emerald-600' },
          { title: 'Active Server Threads', value: '94.8%', change: 'Stable', color: 'text-indigo-600' }
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{card.title}</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-bold text-slate-800">{card.value}</span>
              <span className={`text-sm font-semibold ${card.color}`}>{card.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-72 flex items-center justify-center text-slate-400 border-dashed border-2">
        Primary Content Node - [Mount custom data tables, charts, and configurations here]
      </div>
    </div>
  );
};

export default Dashboard;
