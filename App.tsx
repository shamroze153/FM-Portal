
import React, { useState, useEffect, useCallback } from 'react';
import { 
  AssetStatus, 
  ACAsset, 
  Ticket, 
  TicketStatus, 
  Severity, 
  TechProfile, 
  Tool, 
  Refrigerant,
  ChecklistType
} from './types';
import { 
  INITIAL_TECHS, 
  DEFAULT_TOOLS, 
  INITIAL_REFRIGERANTS, 
  WEB_APP_URL 
} from './constants';
import Dashboard from './views/Dashboard';
import OpsAdmin from './views/OpsAdmin';
import TechEra from './views/TechEra';

const App: React.FC = () => {
  const [screen, setScreen] = useState<'landing' | 'menu' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<'view-dashboard' | 'view-ops' | 'view-tech'>('view-dashboard');
  const [assets, setAssets] = useState<ACAsset[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [techs, setTechs] = useState<TechProfile[]>(INITIAL_TECHS);
  const [tools, setTools] = useState<Tool[]>(DEFAULT_TOOLS);
  const [refrigerants, setRefrigerants] = useState<Refrigerant[]>(INITIAL_REFRIGERANTS);
  const [weather, setWeather] = useState({ temp: 32, desc: 'Sunny' });

  // Initialize Assets (1-163)
  useEffect(() => {
    const mockAssets: ACAsset[] = Array.from({ length: 163 }, (_, i) => ({
      id: i + 1,
      campus: ['Main Campus', 'North Campus', 'South Campus'][i % 3],
      floor: ['Ground', '1st', '2nd', '3rd', 'Roof'][i % 5],
      room: `Room ${100 + i}`,
      type: 'Split AC',
      capacity: i % 2 === 0 ? '1.5 Ton' : '2.0 Ton',
      status: i % 10 === 0 ? AssetStatus.MAINTENANCE : AssetStatus.ACTIVE,
      complaints: Math.floor(Math.random() * 5),
      health: 100 - (Math.floor(Math.random() * 5) * 0.5),
      issuesThisMonth: Math.floor(Math.random() * 6)
    }));
    setAssets(mockAssets);

    // Mock weather for PECHS, Karachi
    setTimeout(() => {
      setWeather({ temp: 34, desc: 'Mostly Clear' });
    }, 1000);
  }, []);

  const addTicket = useCallback((ticket: Ticket) => {
    setTickets(prev => [ticket, ...prev]);
    // Simulate updating asset
    setAssets(prev => prev.map(a => 
      a.id === ticket.assetId 
        ? { ...a, complaints: a.complaints + 1, health: a.health - 0.5, issuesThisMonth: a.issuesThisMonth + 1 } 
        : a
    ));
  }, []);

  const resolveTicket = useCallback((id: string, resolver: string) => {
    setTickets(prev => prev.map(t => 
      t.id === id 
        ? { ...t, status: TicketStatus.RESOLVED, resolvedAt: new Date().toLocaleString(), resolver } 
        : t
    ));
  }, []);

  const updateTechAttendance = (name: string, present: boolean) => {
    setTechs(prev => prev.map(t => t.name === name ? { ...t, attendance: present } : t));
  };

  const awardPoints = (name: string, points: number) => {
    setTechs(prev => prev.map(t => t.name === name ? { ...t, points: t.points + points } : t));
  };

  const deductDemerits = (name: string, points: number) => {
    setTechs(prev => prev.map(t => t.name === name ? { ...t, demerits: t.demerits + points } : t));
  };

  const updateToolQuantity = (name: string, qty: number) => {
    setTools(prev => prev.map(t => t.name === name ? { ...t, quantity: qty } : t));
  };

  const updateGasQuantity = (name: string, kg: number) => {
    setRefrigerants(prev => prev.map(r => r.name === name ? { ...r, kg } : r));
  };

  if (screen === 'landing') {
    return (
      <div className="h-screen bg-slate-900 flex flex-col justify-center px-8 text-white fade-in">
        <div className="mb-12">
          <h1 className="text-5xl font-black tracking-tighter mb-2">DISRUPT</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Facilities Portal v4.3.2 AI</p>
        </div>
        <button 
          onClick={() => setScreen('menu')}
          className="w-full bg-white text-slate-900 p-6 rounded-[2rem] shadow-2xl flex items-center justify-between group active:scale-95 transition-all"
        >
          <div className="flex items-center">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mr-5 group-hover:scale-110 transition-transform">
              <i className="fas fa-fan"></i>
            </div>
            <div className="text-left">
              <h3 className="text-xl font-black">AC / HVAC</h3>
              <p className="text-xs font-bold text-slate-400">163 Assets Loaded</p>
            </div>
          </div>
          <i className="fas fa-chevron-right text-slate-300"></i>
        </button>
      </div>
    );
  }

  if (screen === 'menu') {
    return (
      <div className="h-screen bg-slate-50 flex flex-col">
        <div className="px-8 pt-12 pb-6 flex items-center gap-4">
          <button onClick={() => setScreen('landing')} className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400">
            <i className="fas fa-arrow-left"></i>
          </button>
          <h2 className="text-4xl font-black text-slate-900">AC Stats</h2>
        </div>
        <div className="flex-1 px-6 pb-12 overflow-y-auto space-y-4">
          <button onClick={() => { setScreen('app'); setActiveTab('view-dashboard'); }} className="bg-white w-full p-6 rounded-[2rem] flex items-center gap-5 shadow-sm active:scale-95 transition-all">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl"><i className="fas fa-chart-pie"></i></div>
            <div className="text-left"><h3 className="text-xl font-black text-slate-900">Dashboard</h3><p className="text-xs text-slate-400 font-bold uppercase">Analytics & Health</p></div>
          </button>
          <button onClick={() => { setScreen('app'); setActiveTab('view-ops'); }} className="bg-white w-full p-6 rounded-[2rem] flex items-center gap-5 shadow-sm active:scale-95 transition-all">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-3xl"><i className="fas fa-tasks"></i></div>
            <div className="text-left"><h3 className="text-xl font-black text-slate-900">Ops & Admin</h3><p className="text-xs text-slate-400 font-bold uppercase">Live Ticket Queue</p></div>
          </button>
          <button onClick={() => { setScreen('app'); setActiveTab('view-tech'); }} className="bg-white w-full p-6 rounded-[2rem] flex items-center gap-5 shadow-sm active:scale-95 transition-all">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl"><i className="fas fa-user-astronaut"></i></div>
            <div className="text-left"><h3 className="text-xl font-black text-slate-900">Tech Era</h3><p className="text-xs text-slate-400 font-bold uppercase">Performance & Checklists</p></div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Top Navbar */}
      <div className="bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-sm z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen('menu')} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors">
            <i className="fas fa-arrow-left"></i>
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-none">
              {activeTab === 'view-dashboard' ? 'Dashboard' : activeTab === 'view-ops' ? 'Ops & Admin' : 'Tech Era'}
            </h2>
          </div>
        </div>
        <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-xs">FM</div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'view-dashboard' && (
          <Dashboard 
            assets={assets} 
            weather={weather} 
            techs={techs} 
            refrigerants={refrigerants} 
            onUpdateGas={updateGasQuantity}
            onUpdateDemerit={deductDemerits}
          />
        )}
        {activeTab === 'view-ops' && (
          <OpsAdmin 
            assets={assets} 
            tickets={tickets} 
            onAddTicket={addTicket} 
            onResolveTicket={resolveTicket}
            techs={techs}
          />
        )}
        {activeTab === 'view-tech' && (
          <TechEra 
            assets={assets}
            techs={techs} 
            tools={tools} 
            onUpdateAttendance={updateTechAttendance}
            onUpdateTools={updateToolQuantity}
            onAwardPoints={awardPoints}
            onDeductDemerits={deductDemerits}
            refrigerants={refrigerants}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg pb-8 pt-4 px-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[2.5rem] z-30 border-t border-slate-50">
        <div className="flex justify-between items-end">
          <NavBtn 
            active={activeTab === 'view-dashboard'} 
            icon="fa-chart-pie" 
            label="Dashboard" 
            onClick={() => setActiveTab('view-dashboard')} 
          />
          <NavBtn 
            active={activeTab === 'view-ops'} 
            icon="fa-tasks" 
            label="Ops & Admin" 
            onClick={() => setActiveTab('view-ops')} 
          />
          <NavBtn 
            active={activeTab === 'view-tech'} 
            icon="fa-user-astronaut" 
            label="Tech Era" 
            onClick={() => setActiveTab('view-tech')} 
          />
        </div>
      </div>
    </div>
  );
};

const NavBtn: React.FC<{ active: boolean; icon: string; label: string; onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center transition-all ${active ? 'opacity-100 scale-110 text-slate-900' : 'opacity-40 scale-100 text-slate-400'}`}>
    <i className={`fas ${icon} text-xl mb-1`}></i>
    <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
    {active && <div className="h-1 w-4 bg-slate-900 rounded-full mt-1"></div>}
  </button>
);

export default App;
