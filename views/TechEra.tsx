
import React, { useState, useMemo } from 'react';
import { TechProfile, Tool, ACAsset, ChecklistType, Refrigerant } from '../types';
import { INITIAL_REFRIGERANTS, DEMERIT_REASONS } from '../constants';

interface TechEraProps {
  assets: ACAsset[];
  techs: TechProfile[];
  tools: Tool[];
  onUpdateAttendance: (name: string, present: boolean) => void;
  onUpdateTools: (name: string, qty: number) => void;
  onAwardPoints: (name: string, pts: number) => void;
  onDeductDemerits: (name: string, pts: number) => void;
  refrigerants: Refrigerant[];
}

const TechEra: React.FC<TechEraProps> = ({ assets, techs, tools, onUpdateAttendance, onUpdateTools, onAwardPoints, onDeductDemerits, refrigerants }) => {
  const [selectedTech, setSelectedTech] = useState<TechProfile | null>(null);
  const [activeSub, setActiveSub] = useState<'home' | 'attendance' | 'leaderboard' | 'checklist' | 'tools' | 'demand'>('home');
  const [zoneControl, setZoneControl] = useState<{ [zone: string]: string }>({});

  // Divide assets into 4 equal zones A-D
  const zones = useMemo(() => {
    const sorted = [...assets].sort((a, b) => a.id - b.id);
    const size = Math.ceil(sorted.length / 4);
    return {
      'A': sorted.slice(0, size),
      'B': sorted.slice(size, size * 2),
      'C': sorted.slice(size * 2, size * 3),
      'D': sorted.slice(size * 3),
    };
  }, [assets]);

  const techZones: { [name: string]: string } = {
    'Bilal': 'A',
    'Asad': 'B',
    'Taimoor': 'C',
    'Saboor': 'D'
  };

  const handleTaskDone = (techName: string, task: string) => {
    const person = prompt(`Who completed this task? (Default: ${techName})`, techName);
    if (person) {
      alert(`Task "${task}" marked as done by ${person}.`);
      onAwardPoints(person, 10);
    }
  };

  const handleShuffle = (task: string) => {
    const techOptions = techs.filter(t => t.attendance).map(t => t.name);
    const target = prompt(`Shuffle task to whom? Options: ${techOptions.join(', ')}`);
    if (target && techOptions.includes(target)) {
      alert(`Task shuffled to ${target}.`);
    }
  };

  if (activeSub === 'attendance') {
    return (
      <div className="p-6 space-y-6 fade-in">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setActiveSub('home')} className="text-slate-400 font-bold flex items-center gap-2"><i className="fas fa-arrow-left"></i> Back</button>
          <h3 className="font-black text-slate-900">Attendance</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {techs.map(t => (
            <div key={t.name} className={`p-6 rounded-[2rem] border-2 transition-all ${t.attendance ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
              <div className="w-12 h-12 rounded-full bg-white shadow-sm mb-4 flex items-center justify-center font-black text-slate-400">{t.name[0]}</div>
              <h4 className="font-black text-slate-900 mb-2">{t.name}</h4>
              <button 
                onClick={() => onUpdateAttendance(t.name, !t.attendance)}
                className={`w-full py-2 rounded-xl text-[10px] font-black uppercase ${t.attendance ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
              >
                {t.attendance ? 'PRESENT' : 'ABSENT'}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSub === 'checklist') {
    return (
      <div className="p-6 space-y-6 fade-in pb-32">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setActiveSub('home')} className="text-slate-400 font-bold flex items-center gap-2"><i className="fas fa-arrow-left"></i> Back</button>
          <h3 className="font-black text-slate-900">Zone Checklists</h3>
        </div>
        <div className="space-y-8">
          {/* Explicitly cast Object.entries(zones) to ensure zoneAssets is recognized as ACAsset[] */}
          {(Object.entries(zones) as [string, ACAsset[]][]).map(([zone, zoneAssets]) => {
            const defaultTech = Object.keys(techZones).find(k => techZones[k] === zone);
            const isAbsent = !techs.find(t => t.name === defaultTech)?.attendance;
            const controller = zoneControl[zone] || defaultTech;

            return (
              <div key={zone} className={`bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 ${isAbsent && !zoneControl[zone] ? 'opacity-80' : ''}`}>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="text-lg font-black text-slate-900">Zone {zone}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Responsibility: {controller}</p>
                  </div>
                  {isAbsent && !zoneControl[zone] && (
                    <button 
                      onClick={() => {
                         const name = prompt("Enter your name to take control and earn points:");
                         if (name) {
                           setZoneControl(prev => ({ ...prev, [zone]: name }));
                           onAwardPoints(name, 20); // Bonus for taking control
                         }
                      }}
                      className="bg-yellow-400 text-slate-900 text-[9px] font-black px-3 py-2 rounded-xl shadow-lg active:scale-95 transition-all"
                    >TAKE CONTROL +20pts</button>
                  )}
                </div>
                
                <div className={`space-y-4 ${isAbsent && !zoneControl[zone] ? 'pointer-events-none grayscale' : ''}`}>
                  {/* Fixing: Property 'slice' does not exist on type 'unknown' by using typed zoneAssets */}
                  {zoneAssets.slice(0, 3).map(a => (
                    <div key={a.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-sm">Asset ID #{a.id} ({a.room})</span>
                        <div className="flex gap-1">
                           <button className="bg-emerald-100 text-emerald-600 text-[8px] font-black px-2 py-1 rounded-md uppercase">Daily</button>
                           <button className="bg-purple-100 text-purple-600 text-[8px] font-black px-2 py-1 rounded-md uppercase">Mon</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => {
                            onAwardPoints(controller!, 1);
                            alert("Logged: All Good. +1 Point awarded.");
                          }}
                          className="bg-emerald-600 text-white text-[10px] font-black py-2 rounded-xl shadow-sm"
                        >ALL GOOD</button>
                        <button 
                          onClick={() => {
                            alert("Opening pre-filled issue report form...");
                            setActiveSub('home');
                          }}
                          className="bg-red-500 text-white text-[10px] font-black py-2 rounded-xl shadow-sm"
                        >REPORT ISSUE</button>
                      </div>
                    </div>
                  ))}
                  {/* Fixing: Property 'length' does not exist on type 'unknown' by using typed zoneAssets */}
                  <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">And {zoneAssets.length - 3} more assets...</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (activeSub === 'tools') {
    return (
      <div className="p-6 space-y-6 fade-in pb-32">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setActiveSub('home')} className="text-slate-400 font-bold flex items-center gap-2"><i className="fas fa-arrow-left"></i> Back</button>
          <h3 className="font-black text-slate-900">Tool Inventory</h3>
        </div>
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 gap-2">
            {tools.map(tool => (
              <div 
                key={tool.name} 
                className="flex items-center justify-between p-3 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 rounded-xl"
                onClick={() => handleSecretClick(`tool-${tool.name}`, 5, () => {
                  const newQty = prompt(`Update quantity for ${tool.name}:`, tool.quantity.toString());
                  if (newQty) onUpdateTools(tool.name, parseInt(newQty));
                })}
              >
                <span className="text-sm font-bold text-slate-600">{tool.name}</span>
                <span className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-[10px]">{tool.quantity}</span>
              </div>
            ))}
          </div>
          <button 
            className="w-full mt-6 bg-slate-100 text-slate-400 py-3 rounded-2xl font-black text-[10px] uppercase border-2 border-dashed border-slate-200"
            onClick={() => {
               const name = prompt("Enter new tool name:");
               const qty = prompt("Enter initial quantity:");
               if (name && qty) alert("Tool added to shared inventory.");
            }}
          >+ ADD NEW TOOL</button>
        </div>
      </div>
    );
  }

  if (activeSub === 'demand') {
    return (
      <div className="p-6 space-y-6 fade-in">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setActiveSub('home')} className="text-slate-400 font-bold flex items-center gap-2"><i className="fas fa-arrow-left"></i> Back</button>
          <h3 className="font-black text-slate-900">Demand Requisition</h3>
        </div>
        <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100">
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Demand submitted successfully."); setActiveSub('home'); }}>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Technician Name</label>
              <select className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold mt-1" required>
                <option value="">Select Tech</option>
                {techs.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Demand Details</label>
              <textarea className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold mt-1 h-24" placeholder="List items needed..." required />
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                <span className="text-xs font-bold text-slate-600">Include Gas Requisition?</span>
              </div>
              <div className="flex gap-2">
                 <select className="flex-1 bg-white border-none p-2 rounded-xl text-xs font-bold">
                   <option>R22</option>
                   <option>R410</option>
                   <option>R32</option>
                   <option>R600</option>
                   <option>R134</option>
                 </select>
                 <input type="number" placeholder="kg" className="w-20 bg-white border-none p-2 rounded-xl text-xs font-bold" />
              </div>
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-[2rem] font-black shadow-xl active:scale-95 transition-all">SUBMIT DEMAND</button>
          </form>
        </div>
      </div>
    );
  }

  const handleSecretClick = (id: string, limit: number, action: () => void) => {
    // Shared helper for secret actions
    const current = (window as any)[id] || 0;
    if (current + 1 >= limit) {
      action();
      (window as any)[id] = 0;
    } else {
      (window as any)[id] = current + 1;
    }
  };

  return (
    <div className="p-6 space-y-6 fade-in">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Technician Hub</h3>
      
      {/* Tech Profile List */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <h4 className="font-black text-slate-900 mb-6">Select Profile</h4>
        <div className="flex justify-between gap-3 overflow-x-auto pb-4 no-scrollbar">
          {techs.map(t => (
            <button 
              key={t.name}
              onClick={() => setSelectedTech(prev => prev?.name === t.name ? null : t)}
              className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${selectedTech?.name === t.name ? 'border-slate-900 bg-slate-50' : 'border-transparent bg-slate-50'}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm ${t.attendance ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {t.name[0]}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{t.name}</span>
            </button>
          ))}
        </div>

        {selectedTech && (
          <div className="mt-6 p-4 bg-slate-900 text-white rounded-[1.5rem] fade-in space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <h5 className="font-black text-lg">{selectedTech.name}</h5>
                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Active Tasks</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black">{selectedTech.points - selectedTech.demerits}</p>
                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Total Points</p>
              </div>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {selectedTech.tasks.length > 0 ? selectedTech.tasks.map((task, i) => (
                <div key={i} className="bg-white/10 p-4 rounded-2xl border border-white/5">
                  <p className="text-xs font-medium mb-4">{task}</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleTaskDone(selectedTech.name, task)}
                      className="flex-1 bg-emerald-500 text-white text-[9px] font-black py-2 rounded-xl active:scale-95 transition-transform"
                    >DONE</button>
                    <button 
                      onClick={() => handleShuffle(task)}
                      className="flex-1 bg-white/10 text-white text-[9px] font-black py-2 rounded-xl active:scale-95 transition-transform"
                    >SHUFFLE</button>
                  </div>
                </div>
              )) : (
                <p className="text-center py-4 text-xs font-bold opacity-30 italic uppercase">No tasks assigned</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Grid Actions */}
      <div className="grid grid-cols-2 gap-4">
        <TechActionBtn icon="fa-user-check" label="Attendance" color="text-indigo-500" onClick={() => setActiveSub('attendance')} />
        <TechActionBtn icon="fa-trophy" label="Leaderboard" color="text-yellow-500" onClick={() => setActiveSub('leaderboard')} />
        <TechActionBtn icon="fa-clipboard-check" label="Checklists" color="text-blue-500" onClick={() => setActiveSub('checklist')} />
        <TechActionBtn icon="fa-box-open" label="Demand" color="text-emerald-500" onClick={() => setActiveSub('demand')} />
        <TechActionBtn icon="fa-bolt" label="Smart Tools" color="text-yellow-600" onClick={() => alert("AI Smart Tools: Analyzing current system loads...")} />
        <TechActionBtn icon="fa-toolbox" label="My Tools" color="text-slate-700" onClick={() => setActiveSub('tools')} />
      </div>

      {activeSub === 'leaderboard' && (
         <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden fade-in">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="flex justify-between items-center mb-6 relative z-10">
               <h3 className="text-xl font-black">Performance Ranks</h3>
               <button onClick={() => setActiveSub('home')} className="text-white/50 font-black text-xs uppercase">Close</button>
            </div>
            <div className="space-y-4 relative z-10">
              {techs.sort((a, b) => (b.points - b.demerits) - (a.points - a.demerits)).map((t, i) => (
                <div key={t.name} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">{i + 1}</div>
                      <div>
                        <p className="font-black text-sm">{t.name}</p>
                        <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">-{t.demerits} demerits</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="font-black text-sm text-emerald-400">{t.points - t.demerits}</p>
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Score</p>
                   </div>
                </div>
              ))}
            </div>
         </div>
      )}
    </div>
  );
};

const TechActionBtn: React.FC<{ icon: string; label: string; color: string; onClick: () => void }> = ({ icon, label, color, onClick }) => (
  <button onClick={onClick} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center gap-3 active:scale-95 transition-transform hover:shadow-md">
    <i className={`fas ${icon} text-2xl ${color}`}></i>
    <span className="font-black text-slate-900 text-[10px] uppercase tracking-wider">{label}</span>
  </button>
);

export default TechEra;
