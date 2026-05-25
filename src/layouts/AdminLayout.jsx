import React, { useState } from 'react';
import { LayoutDashboard, Users, Settings, LogOut, Menu, Bell, Search, BarChart3 } from 'lucide-react';

const AdminLayout = ({ onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', active: true },
        { icon: <BarChart3 size={20} />, label: 'Analytics', active: false },
        { icon: <Users size={20} />, label: 'Customers', active: false },
        { icon: <Settings size={20} />, label: 'Settings', active: false },
    ];

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">

            {/* PERSISTENT SIDEBAR */}
            <aside className={`bg-slate-900 text-white transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                    {sidebarOpen && <span className="text-xl font-bold tracking-wider text-indigo-400">NEXUS.IO</span>}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-slate-800 rounded mx-auto cursor-pointer">
                        <Menu size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${item.active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            {item.icon}
                            {sidebarOpen && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* WORKSPACE AREA */}
            <div className="flex-1 flex flex-col overflow-y-auto">

                {/* HEADER NAVBAR */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div className="relative w-64 hidden sm:block">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <Search size={16} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search metrics..."
                            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-full relative cursor-pointer">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full"></span>
                        </button>
                        <div className="h-8 w-px bg-slate-200"></div>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                                AD
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-semibold text-slate-700 leading-none">Admin Executive</p>
                                <span className="text-xs text-slate-400">System Operator</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* METRICS VIEWPORTS */}
                <main className="p-6 max-w-[1600px] w-full mx-auto space-y-6">
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
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;