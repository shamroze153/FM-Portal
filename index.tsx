
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { AssetStatus, TicketStatus, Severity, ACAsset, Ticket, TechProfile, Tool, Refrigerant } from './types';

/**
 * CONSTANTS & MOCK DATA
 */
const INITIAL_TECHS: TechProfile[] = [
  { name: 'Bilal', points: 150, demerits: 0, attendance: true, tasks: ['Filter Cleaning - F3', 'Pressure Check - Server'] },
  { name: 'Asad', points: 120, demerits: 25, attendance: true, tasks: ['Capacitor - Ground Floor'] },
  { name: 'Taimoor', points: 180, demerits: 0, attendance: true, tasks: ['Thermostat - Admin Block'] },
  { name: 'Saboor', points: 90, demerits: 50, attendance: false, tasks: ['Descaling - Library'] },
];

const INITIAL_REFRIGERANTS: Refrigerant[] = [
  { name: 'R22', type: 'AC', kg: 40 }, { name: 'R410', type: 'AC', kg: 32 },
  { name: 'R32', type: 'AC', kg: 15 }, { name: 'R600', type: 'Fridge', kg: 8 },
];

/**
 * AI SERVICES
 */
async function smartAssignTask(ticket: Ticket, techs: TechProfile[]): Promise<string> {
  const activeTechs = techs.filter(t => t.attendance).map(t => ({ name: t.name, tasks: t.tasks.length }));
  if (activeTechs.length === 0) return 'Manual Dispatch';
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Who should handle this ${ticket.severity} issue: "${ticket.issue}"? Techs: ${JSON.stringify(activeTechs)}. Choose one name based on lowest workload. Output ONLY the name.`
    });
    return response.text?.trim() || activeTechs[0].name;
  } catch (e) {
    console.error("AI Assignment failed", e);
    return activeTechs[0].name;
  }
}

/**
 * COMPONENTS
 */
const NavBtn = ({ active, icon, label, onClick }: any) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center transition-all ${active ? 'opacity-100 scale-110 text-slate-900' : 'opacity-40 scale-100 text-slate-400'}`}>
    <i className={`fas ${icon} text-xl mb-1`}></i>
    <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
    {active && <div className="h-1 w-4 bg-slate-900 rounded-full mt-1"></div>}
  </button>
);

const DashboardView = ({ assets, weather, techs, refrigerants }: any) => {
  const statusCounts = {
    Total: assets.length,
    Active: assets.filter((a: any) => a.status === AssetStatus.ACTIVE).length,
    Maintenance: assets.filter((a: any) => a.status === AssetStatus.MAINTENANCE).length,
  };

  const sortedTechs = [...techs].sort((a, b) => (b.points - b.demerits) - (a.points - a.demerits));

  return (
    <div className="p-6 space-y-6 fade-in pb-28">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10"><i className="fas fa-fan text-9xl"></i></div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-50">Local Atmosphere</p>
        <div className="flex items-center gap-4">
          <h3 className="text-5xl font-black">{weather.temp}°C</h3>
          <div className="h-10 w-[2px] bg-white/20"></div>
          <div>
            <p className="font-black text-lg">{weather.desc}</p>
            <p className="text-[10px] font-bold opacity-50 uppercase">PECHS, Karachi</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Unit Health</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-500">{statusCounts.Active}</span>
            <span className="text-xs font-bold text-slate-300">/ {statusCounts.Total}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Repairs</p>
          <span className="text-3xl font-black text-red-500">{statusCounts.Maintenance}</span>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-900 mb-6">Gas Inventory</h3>
        <div className="grid grid-cols-2 gap-4">
          {refrigerants.map((r: any) => (
            <div key={r.name} className="p-4 bg-slate-50 rounded-3xl relative overflow-hidden group">
              <div className="flex justify-between items-center mb-1">
                <span className="font-black text-sm">{r.name}</span>
                <span className="text-[8px] font-black opacity-30 uppercase">{r.type}</span>
              </div>
              <p className="text-xl font-black">{r.kg} <span className="text-[10px] font-bold opacity-40">kg</span></p>
              <div className="h-1 w-full bg-slate-200 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-blue-500 transition-all" style={{ width: `${(r.kg / 40) * 100}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black">Elite Squad</h3>
          <i className="fas fa-trophy text-yellow-500"></i>
        </div>
        <div className="space-y-4">
          {sortedTechs.slice(0, 3).map((t: any, i: number) => (
            <div key={t.name} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black opacity-20">{i + 1}</span>
                <span className="font-bold">{t.name}</span>
              </div>
              <span className="font-black text-indigo-400">{t.points - t.demerits} <span className="text-[8px] opacity-50 uppercase">pts</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const OpsView = ({ assets, tickets, onAddTicket, onResolveTicket, techs }: any) => {
  const [showForm, setShowForm] = useState(false);
  const [assetId, setAssetId] = useState('');
  const [issue, setIssue] = useState('');
  const [sev, setSev] = useState(Severity.MINOR);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!assetId || !issue) return;
    setLoading(true);
    const newTicket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      assetId: Number(assetId),
      severity: sev,
      issue,
      status: TicketStatus.OPEN,
      timestamp: new Date().toLocaleString(),
    };
    newTicket.assignedTo = await smartAssignTask(newTicket, techs);
    onAddTicket(newTicket);
    setLoading(false);
    setShowForm(false);
    setIssue('');
  };

  return (
    <div className="p-6 space-y-6 fade-in pb-28">
      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="w-full bg-red-600 text-white p-8 rounded-[2.5rem] shadow-xl flex justify-between items-center active:scale-95 transition-all">
          <div className="text-left">
            <h3 className="text-2xl font-black">Report Leak/Issue</h3>
            <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">HVAC Emergency System</p>
          </div>
          <i className="fas fa-plus text-2xl"></i>
        </button>
      ) : (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Select Unit</label>
              <select value={assetId} onChange={e => setAssetId(e.target.value)} className="w-full bg-slate-50 border-none p-5 rounded-[1.5rem] text-sm font-bold mt-2" required>
                <option value="">Choose Asset...</option>
                {assets.map((a: any) => <option key={a.id} value={a.id}>Unit #{a.id} - {a.room}</option>)}
              </select>
            </div>
            
            <div className="flex gap-3">
              <button type="button" onClick={() => setSev(Severity.MINOR)} className={`flex-1 p-4 rounded-2xl text-[10px] font-black transition-all ${sev === Severity.MINOR ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>ROUTINE</button>
              <button type="button" onClick={() => setSev(Severity.MAJOR)} className={`flex-1 p-4 rounded-2xl text-[10px] font-black transition-all ${sev === Severity.MAJOR ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>CRITICAL</button>
            </div>

            <textarea value={issue} onChange={e => setIssue(e.target.value)} className="w-full bg-slate-50 border-none p-5 rounded-[1.5rem] text-sm font-bold h-32" placeholder="Describe the failure..." required />
            
            <div className="flex gap-4">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-slate-100 text-slate-500 p-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest">Cancel</button>
              <button type="submit" disabled={loading} className="flex-[2] bg-slate-900 text-white p-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3">
                {loading ? <i className="fas fa-sync fa-spin"></i> : 'Dispatch AI'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-black text-slate-900 ml-2">Live Tickets</h3>
        {tickets.length === 0 ? (
          <div className="text-center py-20 opacity-20"><i className="fas fa-check-circle text-5xl mb-4"></i><p className="font-black text-xs uppercase tracking-widest">All Clear</p></div>
        ) : (
          tickets.map((t: any) => (
            <div key={t.id} className={`bg-white p-6 rounded-[2rem] border transition-all ${t.status === TicketStatus.RESOLVED ? 'opacity-40 grayscale' : 'border-slate-100 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg text-white ${t.severity === Severity.MAJOR ? 'bg-red-600' : 'bg-indigo-600'}`}>
                  {t.severity === Severity.MAJOR ? 'CRITICAL' : 'ROUTINE'}
                </span>
                <span className="text-[10px] font-bold text-slate-400">{t.timestamp}</span>
              </div>
              <p className="font-bold text-slate-800 mb-4">{t.issue}</p>
              <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-black text-[10px] text-slate-400">{t.assignedTo?.[0]}</div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.assignedTo}</span>
                </div>
                {t.status === TicketStatus.OPEN && (
                  <button onClick={() => {
                    const name = prompt("Enter tech name to sign off:");
                    if (name) onResolveTicket(t.id, name);
                  }} className="bg-emerald-600 text-white text-[9px] font-black px-4 py-2 rounded-xl">RESOLVE</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const TechHubView = ({ techs, onUpdateAttendance }: any) => {
  return (
    <div className="p-6 space-y-6 fade-in pb-28">
      <div className="grid grid-cols-2 gap-4">
        {techs.map((t: any) => (
          <div key={t.name} className={`bg-white p-6 rounded-[2.5rem] border-2 transition-all ${t.attendance ? 'border-emerald-100 shadow-sm' : 'border-red-100 opacity-60'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`w-3 h-3 rounded-full ${t.attendance ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.attendance ? 'Active' : 'Offline'}</span>
            </div>
            <h4 className="font-black text-slate-900 mb-1">{t.name}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">{t.tasks.length} Current Tasks</p>
            <button onClick={() => onUpdateAttendance(t.name, !t.attendance)} className={`w-full py-3 rounded-2xl text-[9px] font-black text-white ${t.attendance ? 'bg-red-500' : 'bg-emerald-600'}`}>
              {t.attendance ? 'SET OFFLINE' : 'SET ONLINE'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * ROOT APP
 */
const App = () => {
  const [activeTab, setActiveTab] = useState<'dash' | 'ops' | 'tech'>('dash');
  const [assets, setAssets] = useState<ACAsset[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [techs, setTechs] = useState<TechProfile[]>(INITIAL_TECHS);
  const [refrigerants] = useState<Refrigerant[]>(INITIAL_REFRIGERANTS);
  const [weather] = useState({ temp: 33, desc: 'Scorching Heat' });

  useEffect(() => {
    const mockAssets: ACAsset[] = Array.from({ length: 163 }, (_, i) => ({
      id: i + 1,
      campus: 'PECHS',
      floor: ['G', '1', '2', '3'][i % 4],
      room: `Hall ${100 + i}`,
      type: 'Split Unit',
      capacity: '2.0 Ton',
      status: i % 20 === 0 ? AssetStatus.MAINTENANCE : AssetStatus.ACTIVE,
      complaints: 0,
      health: 100,
      issuesThisMonth: 0
    }));
    setAssets(mockAssets);
  }, []);

  const addTicket = (t: Ticket) => setTickets(prev => [t, ...prev]);
  const resolveTicket = (id: string, name: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: TicketStatus.RESOLVED, resolver: name } : t));
  };
  const updateAttendance = (name: string, present: boolean) => {
    setTechs(prev => prev.map(t => t.name === name ? { ...t, attendance: present } : t));
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans">
      <div className="bg-white/90 backdrop-blur-md p-6 flex justify-between items-center z-20 border-b border-slate-100">
        <h2 className="text-xl font-black italic tracking-tighter">DISRUPT <span className="text-[8px] font-bold not-italic bg-slate-900 text-white px-2 py-1 rounded ml-2">v4.3.2 AI</span></h2>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Grid</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeTab === 'dash' && <DashboardView assets={assets} weather={weather} techs={techs} refrigerants={refrigerants} />}
        {activeTab === 'ops' && <OpsView assets={assets} tickets={tickets} onAddTicket={addTicket} onResolveTicket={resolveTicket} techs={techs} />}
        {activeTab === 'tech' && <TechHubView techs={techs} onUpdateAttendance={updateAttendance} />}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl pb-10 pt-4 px-10 border-t border-slate-100 flex justify-between items-center rounded-t-[3.5rem] shadow-[0_-15px_40px_rgba(0,0,0,0.04)] z-30">
        <NavBtn active={activeTab === 'dash'} icon="fa-chart-pie" label="Stats" onClick={() => setActiveTab('dash')} />
        <NavBtn active={activeTab === 'ops'} icon="fa-tasks" label="Ops" onClick={() => setActiveTab('ops')} />
        <NavBtn active={activeTab === 'tech'} icon="fa-user-astronaut" label="Tech" onClick={() => setActiveTab('tech')} />
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
