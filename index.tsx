
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { AssetStatus, TicketStatus, Severity, ACAsset, Ticket, TechProfile, Refrigerant } from './types';

/**
 * MOCK DATA GENERATOR
 */
const INITIAL_TECHS: TechProfile[] = [
  { name: 'Bilal', points: 450, demerits: 10, attendance: true, tasks: ['Filter Clean - F3'] },
  { name: 'Asad', points: 320, demerits: 0, attendance: true, tasks: ['Unit Reset - G2'] },
  { name: 'Taimoor', points: 510, demerits: 5, attendance: true, tasks: ['Gas Top-up - Admin'] },
  { name: 'Saboor', points: 190, demerits: 80, attendance: false, tasks: [] },
];

const INITIAL_GAS: Refrigerant[] = [
  { name: 'R22', type: 'AC', kg: 38 },
  { name: 'R410A', type: 'AC', kg: 24 },
  { name: 'R32', type: 'AC', kg: 12 },
];

/**
 * AI CORE
 */
const getAIResponse = async (prompt: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return null;
  }
};

/**
 * UI COMPONENTS
 */
const Card = ({ children, className = "" }: any) => (
  <div className={`bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 ${className}`}>
    {children}
  </div>
);

const NavItem = ({ active, icon, label, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-slate-900 scale-110' : 'text-slate-400 opacity-50'}`}>
    <div className={`w-12 h-8 rounded-2xl flex items-center justify-center transition-colors ${active ? 'bg-slate-100' : ''}`}>
      <i className={`fas ${icon} text-lg`}></i>
    </div>
    <span className="text-[10px] font-extrabold uppercase tracking-tighter">{label}</span>
  </button>
);

/**
 * VIEWS
 */
const Dashboard = ({ techs, gas }: any) => (
  <div className="p-6 space-y-6 fade-in pb-32">
    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
      <div className="absolute -right-4 -top-4 opacity-10 rotate-12">
        <i className="fas fa-snowflake text-[10rem]"></i>
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Facility Health</p>
      <div className="flex items-center gap-4">
        <h2 className="text-5xl font-extrabold tracking-tighter">94%</h2>
        <div className="h-10 w-px bg-white/20"></div>
        <div>
          <p className="text-xs font-bold">Grid Optimal</p>
          <p className="text-[10px] opacity-50">163 Active Units</p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <Card>
        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Pending</p>
        <p className="text-3xl font-extrabold">04</p>
      </Card>
      <Card>
        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Resolved</p>
        <p className="text-3xl font-extrabold text-emerald-500">12</p>
      </Card>
    </div>

    <Card>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-extrabold text-lg">Gas Reserves</h3>
        <i className="fas fa-cylinder text-slate-200"></i>
      </div>
      <div className="space-y-4">
        {gas.map((g: any) => (
          <div key={g.name} className="space-y-2">
            <div className="flex justify-between text-[11px] font-black uppercase">
              <span>{g.name}</span>
              <span className="text-slate-400">{g.kg}kg</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(g.kg / 50) * 100}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </Card>

    <div className="bg-indigo-600 rounded-[2.5rem] p-6 text-white shadow-xl">
      <h3 className="font-extrabold mb-4 flex items-center gap-2"><i className="fas fa-bolt text-yellow-400"></i> Top Technician</h3>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-black text-xl">B</div>
        <div>
          <p className="font-extrabold">{techs[0].name}</p>
          <p className="text-[10px] font-bold opacity-60">PECHS ZONE COMMANDER</p>
        </div>
      </div>
    </div>
  </div>
);

const Operations = ({ assets, tickets, onAddTicket, techs }: any) => {
  const [loading, setLoading] = useState(false);
  const [issue, setIssue] = useState("");

  const handleQuickReport = async (assetId: number) => {
    if (!issue) return alert("Please specify the issue");
    setLoading(true);
    
    const newTicket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      assetId,
      severity: Severity.MINOR,
      issue,
      status: TicketStatus.OPEN,
      timestamp: new Date().toLocaleTimeString(),
    };

    // AI Logic for assignment
    const prompt = `Assign a technician for this HVAC issue: "${issue}". Techs available: ${techs.filter(t => t.attendance).map(t => t.name).join(", ")}. Return ONLY the name.`;
    const suggestedName = await getAIResponse(prompt);
    newTicket.assignedTo = suggestedName || techs[0].name;

    onAddTicket(newTicket);
    setLoading(false);
    setIssue("");
  };

  return (
    <div className="p-6 space-y-6 fade-in pb-32">
      <Card className="!bg-red-50 !border-red-100">
        <h3 className="font-extrabold text-red-600 mb-4">Quick Dispatch</h3>
        <input 
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          placeholder="What's wrong?" 
          className="w-full bg-white border-none p-4 rounded-2xl text-sm font-bold shadow-sm mb-4"
        />
        <div className="grid grid-cols-2 gap-2">
          {assets.slice(0, 4).map((a: any) => (
            <button 
              key={a.id}
              disabled={loading}
              onClick={() => handleQuickReport(a.id)}
              className="bg-white p-3 rounded-xl border border-red-100 text-[10px] font-black uppercase text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95"
            >
              Unit #{a.id} ({a.room})
            </button>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="font-extrabold text-slate-400 text-xs uppercase tracking-widest px-2">Active Queue</h3>
        {tickets.map((t: any) => (
          <Card key={t.id} className="relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[9px] font-black bg-slate-900 text-white px-2 py-1 rounded">#{t.id}</span>
              <span className="text-[10px] font-bold text-slate-400">{t.timestamp}</span>
            </div>
            <p className="font-extrabold text-sm mb-4">{t.issue}</p>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-50">
              <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[8px] font-black">{t.assignedTo?.[0]}</div>
              <span className="text-[10px] font-black text-slate-500 uppercase">{t.assignedTo}</span>
            </div>
          </Card>
        ))}
        {tickets.length === 0 && (
          <div className="text-center py-10 opacity-20 font-black uppercase text-xs">Queue Empty</div>
        )}
      </div>
    </div>
  );
};

/**
 * MAIN APP
 */
const App = () => {
  const [tab, setTab] = useState<'dash' | 'ops' | 'tech'>('dash');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [techs, setTechs] = useState<TechProfile[]>(INITIAL_TECHS);
  const [gas] = useState(INITIAL_GAS);
  const [assets, setAssets] = useState<ACAsset[]>([]);

  useEffect(() => {
    const mock = Array.from({ length: 50 }, (_, i) => ({
      id: 101 + i,
      campus: 'PECHS',
      floor: String(Math.floor(i / 10)),
      room: `Room ${i + 1}`,
      type: 'Split',
      capacity: '1.5T',
      status: AssetStatus.ACTIVE,
      complaints: 0,
      health: 100,
      issuesThisMonth: 0
    }));
    setAssets(mock);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="glass safe-top z-40 border-b border-slate-100">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold tracking-tighter italic">DISRUPT FM</h1>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Zone: Karachi PECHS</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-black text-emerald-500 uppercase leading-none">Live</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase">v4.3.2-AI</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-900"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar">
        {tab === 'dash' && <Dashboard techs={techs} gas={gas} />}
        {tab === 'ops' && <Operations assets={assets} tickets={tickets} onAddTicket={(t: any) => setTickets([t, ...tickets])} techs={techs} />}
        {tab === 'tech' && (
          <div className="p-6 space-y-4 fade-in">
             <h2 className="font-extrabold text-2xl mb-6">Staff Roster</h2>
             {techs.map(t => (
               <Card key={t.name} className="flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${t.attendance ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <div>
                      <p className="font-extrabold">{t.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{t.points} Credits</p>
                    </div>
                 </div>
                 <i className="fas fa-chevron-right text-slate-100"></i>
               </Card>
             ))}
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="glass border-t border-slate-100 safe-bottom fixed bottom-0 left-0 right-0 z-50">
        <div className="px-8 py-3 flex justify-between items-center">
          <NavItem active={tab === 'dash'} icon="fa-th-large" label="Stats" onClick={() => setTab('dash')} />
          <NavItem active={tab === 'ops'} icon="fa-bolt" label="Dispat" onClick={() => setTab('ops')} />
          <NavItem active={tab === 'tech'} icon="fa-users" label="Team" onClick={() => setTab('tech')} />
        </div>
      </nav>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
