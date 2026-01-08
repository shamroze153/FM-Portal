
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
// Import types from the shared types file
import { AssetStatus, TicketStatus, Severity, ACAsset, Ticket, TechProfile, Tool, Refrigerant } from './types';

/** 
 * TYPES - Moved to types.ts
 */

/**
 * CONSTANTS & MOCK DATA
 */
const INITIAL_TECHS: TechProfile[] = [
  { name: 'Bilal', points: 150, demerits: 0, attendance: true, tasks: ['Routine Filter Cleaning - 3rd Floor', 'Check Gas Pressure - Server Room'] },
  { name: 'Asad', points: 120, demerits: 25, attendance: true, tasks: ['Capacitor Replacement - Ground Floor'] },
  { name: 'Taimoor', points: 180, demerits: 0, attendance: true, tasks: ['Thermostat Calibration - Admin Block'] },
  { name: 'Saboor', points: 90, demerits: 50, attendance: false, tasks: ['Outdoor Unit Descaling - Library'] },
];

const DEFAULT_TOOLS: Tool[] = [
  { name: 'Adjustable Wrench', quantity: 4 }, { name: 'Pliers Set', quantity: 2 },
  { name: 'Amp Meter', quantity: 2 }, { name: 'High Pressure Gauge', quantity: 2 },
  { name: 'Charging Line', quantity: 6 }, { name: 'Tool Bag', quantity: 2 },
];

const INITIAL_REFRIGERANTS: Refrigerant[] = [
  { name: 'R22', type: 'AC', kg: 40 }, { name: 'R410', type: 'AC', kg: 32 },
  { name: 'R32', type: 'AC', kg: 15 }, { name: 'R600', type: 'Fridge', kg: 8 },
];

/**
 * AI SERVICES
 */
// Initialize GoogleGenAI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function smartAssignTask(ticket: Ticket, techs: TechProfile[]): Promise<string> {
  const activeTechs = techs.filter(t => t.attendance).map(t => ({ name: t.name, taskCount: t.tasks.length }));
  if (activeTechs.length === 0) return 'Manual Dispatch Required';
  
  try {
    // Generate content using the new SDK pattern
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest a tech name from: ${JSON.stringify(activeTechs)} for a ${ticket.severity} issue: "${ticket.issue}". Choose based on lowest taskCount. Output ONLY the name.`
    });
    // Correctly access .text property
    return response.text?.trim() || activeTechs[0].name;
  } catch (e) {
    return activeTechs[0].name;
  }
}

/**
 * SHARED UI COMPONENTS
 */
const NavBtn = ({ active, icon, label, onClick }: any) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center transition-all ${active ? 'opacity-100 scale-110 text-slate-900' : 'opacity-40 scale-100 text-slate-400'}`}>
    <i className={`fas ${icon} text-xl mb-1`}></i>
    <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
    {active && <div className="h-1 w-4 bg-slate-900 rounded-full mt-1"></div>}
  </button>
);

/**
 * MAIN VIEWS
 */
const DashboardView = ({ assets, weather, techs, refrigerants, onUpdateGas, onUpdateDemerit }: any) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const statusCounts = {
    Total: assets.length,
    Active: assets.filter((a: any) => a.status === AssetStatus.ACTIVE).length,
    Maintenance: assets.filter((a: any) => a.status === AssetStatus.MAINTENANCE).length,
  };

  const handleSecretClick = (id: string, action: () => void) => {
    const key = `click_${id}`;
    (window as any)[key] = ((window as any)[key] || 0) + 1;
    if ((window as any)[key] >= 5) {
      action();
      (window as any)[key] = 0;
    }
  };

  return (
    <div className="p-6 space-y-6 fade-in pb-24">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[2rem] p-6 text-white shadow-xl flex justify-between items-center">
        <div>
          <p className="text-[10px] font-bold uppercase opacity-70 mb-1 tracking-widest">Live PECHS Forecast</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black">{weather.temp}°C</h3>
            <span className="text-sm font-bold">{weather.desc}</span>
          </div>
        </div>
        <i className="fas fa-wind text-4xl opacity-50"></i>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-900 mb-6">Asset Health</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 bg-slate-50 rounded-2xl text-center">
            <p className="text-2xl font-black">{statusCounts.Total}</p>
            <span className="text-[9px] font-black text-slate-400 uppercase">Total</span>
          </div>
          <div className="p-4 bg-emerald-50 rounded-2xl text-center">
            <p className="text-2xl font-black text-emerald-600">{statusCounts.Active}</p>
            <span className="text-[9px] font-black text-emerald-400 uppercase">Active</span>
          </div>
          <div className="p-4 bg-red-50 rounded-2xl text-center">
            <p className="text-2xl font-black text-red-600">{statusCounts.Maintenance}</p>
            <span className="text-[9px] font-black text-red-400 uppercase">Repair</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-900 mb-6">Refrigerant Bank</h3>
        <div className="grid grid-cols-2 gap-4">
          {refrigerants.map((r: any) => (
            <div 
              key={r.name} 
              className="p-4 bg-slate-50 rounded-3xl border border-slate-100 cursor-pointer active:bg-slate-100"
              onClick={() => handleSecretClick(r.name, () => {
                const val = prompt(`Update ${r.name} kg:`, r.kg);
                if (val) onUpdateGas(r.name, parseFloat(val));
              })}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black">{r.name}</span>
                <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-md font-bold text-slate-500 uppercase">{r.type}</span>
              </div>
              <p className="text-xl font-black text-slate-900">{r.kg} kg</p>
              <div className="h-1 w-full bg-slate-200 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${(r.kg / 40) * 100}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl">
        <h3 className="text-xl font-black mb-6">Tech Leaderboard</h3>
        <div className="space-y-4">
          {techs.sort((a: any, b: any) => (b.points - b.demerits) - (a.points - a.demerits)).slice(0, 3).map((t: any, i: number) => (
            <div key={t.name} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-black text-xs">{i+1}</div>
                <span className="font-bold text-sm">{t.name}</span>
              </div>
              <span className="font-black text-indigo-400">{t.points - t.demerits} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const OpsView = ({ assets, tickets, onAddTicket, onResolveTicket, techs }: any) => {
  const [showForm, setShowForm] = useState(false);
  const [assetId, setAssetId] = useState<any>('');
  const [issue, setIssue] = useState('');
  const [sev, setSev] = useState(Severity.MINOR);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const newTicket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      assetId: Number(assetId),
      severity: sev,
      issue,
      status: TicketStatus.OPEN,
      timestamp: new Date().toLocaleString()
    };
    newTicket.assignedTo = await smartAssignTask(newTicket, techs);
    onAddTicket(newTicket);
    setLoading(false);
    setShowForm(false);
    setIssue('');
  };

  return (
    <div className="p-6 space-y-6 fade-in pb-24">
      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="w-full bg-red-600 text-white p-6 rounded-[2rem] shadow-xl flex justify-between items-center group active:scale-95 transition-all">
          <div className="text-left">
            <h3 className="text-2xl font-black">Report Issue</h3>
            <p className="text-xs font-bold opacity-70 uppercase">AC System Maintenance</p>
          </div>
          <i className="fas fa-plus text-2xl"></i>
        </button>
      ) : (
        <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100 fade-in">
          <form onSubmit={handleSubmit} className="space-y-4">
            <select value={assetId} onChange={e => setAssetId(e.target.value)} className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold" required>
              <option value="">Select Asset ID</option>
              {assets.slice(0, 50).map((a: any) => <option key={a.id} value={a.id}>Unit #{a.id} - {a.room}</option>)}
            </select>
            <div className="flex gap-2">
              <button type="button" onClick={() => setSev(Severity.MINOR)} className={`flex-1 p-3 rounded-xl text-[10px] font-black ${sev === Severity.MINOR ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>MINOR</button>
              <button type="button" onClick={() => setSev(Severity.MAJOR)} className={`flex-1 p-3 rounded-xl text-[10px] font-black ${sev === Severity.MAJOR ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400'}`}>MAJOR</button>
            </div>
            <textarea value={issue} onChange={e => setIssue(e.target.value)} className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold h-24" placeholder="Issue details..." required />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-slate-100 text-slate-400 p-4 rounded-2xl font-black">CANCEL</button>
              <button type="submit" disabled={loading} className="flex-[2] bg-slate-900 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2">
                {loading ? <i className="fas fa-spinner fa-spin"></i> : 'AI ASSIGN'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 min-h-[400px]">
        <h3 className="text-xl font-black text-slate-900 mb-6">Ticket Queue</h3>
        <div className="space-y-4">
          {tickets.map((t: any) => (
            <div key={t.id} className={`p-4 rounded-3xl border transition-all ${t.status === TicketStatus.RESOLVED ? 'opacity-50 grayscale' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[9px] font-black px-2 py-1 rounded-md text-white ${t.severity === Severity.MAJOR ? 'bg-red-600' : 'bg-blue-600'}`}>
                  {t.severity === Severity.MAJOR ? 'CRITICAL' : 'ROUTINE'}
                </span>
                <span className="text-[10px] font-bold text-slate-400">{t.timestamp}</span>
              </div>
              <p className="text-sm font-bold text-slate-800 mb-3">{t.issue}</p>
              <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black">{t.assignedTo?.[0]}</div>
                  <span className="text-[10px] font-black text-slate-500 uppercase">{t.assignedTo}</span>
                </div>
                {t.status === TicketStatus.OPEN && (
                  <button onClick={() => {
                    const name = prompt("Enter resolver name:");
                    if (name) onResolveTicket(t.id, name);
                  }} className="bg-emerald-600 text-white text-[9px] font-black px-3 py-1.5 rounded-lg active:scale-95 transition-all">RESOLVE</button>
                )}
              </div>
            </div>
          ))}
          {tickets.length === 0 && <p className="text-center py-20 text-slate-300 font-bold uppercase tracking-widest text-xs">Queue Empty</p>}
        </div>
      </div>
    </div>
  );
};

const TechHubView = ({ techs, onUpdateAttendance }: any) => {
  const [activeSub, setActiveSub] = useState<'home' | 'attendance'>('home');

  if (activeSub === 'attendance') {
    return (
      <div className="p-6 space-y-6 fade-in pb-24">
         <button onClick={() => setActiveSub('home')} className="text-slate-400 font-black text-xs flex items-center gap-2"><i className="fas fa-arrow-left"></i> BACK</button>
         <h3 className="text-2xl font-black text-slate-900">Attendance</h3>
         <div className="grid grid-cols-2 gap-4">
           {techs.map((t: any) => (
             <div key={t.name} className={`p-6 rounded-[2rem] border-2 transition-all ${t.attendance ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
               <h4 className="font-black text-slate-900 mb-4">{t.name}</h4>
               <button onClick={() => onUpdateAttendance(t.name, !t.attendance)} className={`w-full py-2 rounded-xl text-[9px] font-black text-white ${t.attendance ? 'bg-emerald-600' : 'bg-red-600'}`}>
                 {t.attendance ? 'PRESENT' : 'ABSENT'}
               </button>
             </div>
           ))}
         </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 fade-in pb-24">
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => setActiveSub('attendance')} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 active:scale-95 transition-all">
          <i className="fas fa-user-check text-2xl text-indigo-500"></i>
          <span className="font-black text-[10px] uppercase tracking-wider text-slate-900">Attendance</span>
        </button>
        <button className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 active:scale-95 transition-all">
          <i className="fas fa-clipboard-list text-2xl text-emerald-500"></i>
          <span className="font-black text-[10px] uppercase tracking-wider text-slate-900">Checklists</span>
        </button>
        <button className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 active:scale-95 transition-all">
          <i className="fas fa-toolbox text-2xl text-amber-500"></i>
          <span className="font-black text-[10px] uppercase tracking-wider text-slate-900">Inventory</span>
        </button>
        <button className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 active:scale-95 transition-all">
          <i className="fas fa-bolt text-2xl text-blue-500"></i>
          <span className="font-black text-[10px] uppercase tracking-wider text-slate-900">AI Demand</span>
        </button>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-900 mb-6">Your Team</h3>
        <div className="space-y-4">
          {techs.map((t: any) => (
            <div key={t.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${t.attendance ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <span className="font-bold text-sm">{t.name}</span>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.tasks.length} Active Tasks</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * ROOT APP COMPONENT
 */
const App: React.FC = () => {
  const [screen, setScreen] = useState<'landing' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<'dash' | 'ops' | 'tech'>('dash');
  const [assets, setAssets] = useState<ACAsset[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [techs, setTechs] = useState<TechProfile[]>(INITIAL_TECHS);
  const [refrigerants, setRefrigerants] = useState<Refrigerant[]>(INITIAL_REFRIGERANTS);
  const [weather] = useState({ temp: 33, desc: 'Partly Cloudy' });

  useEffect(() => {
    const mock: ACAsset[] = Array.from({ length: 163 }, (_, i) => ({
      id: i + 1,
      campus: ['Main', 'North', 'South'][i % 3],
      floor: ['G', '1', '2', '3', 'R'][i % 5],
      room: `Room ${100 + i}`,
      type: 'Split AC', capacity: '1.5 Ton',
      status: i % 15 === 0 ? AssetStatus.MAINTENANCE : AssetStatus.ACTIVE,
      complaints: 0, health: 100, issuesThisMonth: 0
    }));
    setAssets(mock);
  }, []);

  const addTicket = (t: Ticket) => setTickets(prev => [t, ...prev]);
  const resolveTicket = (id: string, name: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: TicketStatus.RESOLVED, resolvedAt: new Date().toLocaleString(), resolver: name } : t));
  };
  const updateGas = (name: string, kg: number) => setRefrigerants(prev => prev.map(r => r.name === name ? { ...r, kg } : r));
  const updateDemerit = (name: string, pts: number) => setTechs(prev => prev.map(t => t.name === name ? { ...t, demerits: t.demerits + pts } : t));
  const updateAttendance = (name: string, present: boolean) => setTechs(prev => prev.map(t => t.name === name ? { ...t, attendance: present } : t));

  if (screen === 'landing') {
    return (
      <div className="h-screen bg-slate-900 flex flex-col justify-center px-8 text-white fade-in">
        <div className="mb-12">
          <h1 className="text-6xl font-black tracking-tighter mb-2 italic">DISRUPT</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Facility Operations v4.3.2 AI</p>
        </div>
        <button onClick={() => setScreen('app')} className="w-full bg-white text-slate-900 p-8 rounded-[2.5rem] shadow-2xl flex items-center justify-between group active:scale-95 transition-all">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center text-3xl"><i className="fas fa-fan"></i></div>
            <div className="text-left">
              <h3 className="text-2xl font-black leading-tight">AC Portal</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase">163 Assets Live</p>
            </div>
          </div>
          <i className="fas fa-chevron-right text-slate-300"></i>
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <div className="bg-white/90 backdrop-blur-md px-6 py-4 flex justify-between items-center z-20 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen('landing')} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"><i className="fas fa-arrow-left"></i></button>
          <h2 className="text-lg font-black text-slate-900">{activeTab === 'dash' ? 'Performance' : activeTab === 'ops' ? 'Live Queue' : 'Tech Hub'}</h2>
        </div>
        <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-[10px]">v4.3</div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeTab === 'dash' && <DashboardView assets={assets} weather={weather} techs={techs} refrigerants={refrigerants} onUpdateGas={updateGas} onUpdateDemerit={updateDemerit} />}
        {activeTab === 'ops' && <OpsView assets={assets} tickets={tickets} onAddTicket={addTicket} onResolveTicket={resolveTicket} techs={techs} />}
        {activeTab === 'tech' && <TechHubView techs={techs} onUpdateAttendance={updateAttendance} />}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg pb-10 pt-4 px-8 border-t border-slate-100 flex justify-between items-center rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
        <NavBtn active={activeTab === 'dash'} icon="fa-chart-pie" label="Stats" onClick={() => setActiveTab('dash')} />
        <NavBtn active={activeTab === 'ops'} icon="fa-tasks" label="Ops" onClick={() => setActiveTab('ops')} />
        <NavBtn active={activeTab === 'tech'} icon="fa-user-astronaut" label="Team" onClick={() => setActiveTab('tech')} />
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);
