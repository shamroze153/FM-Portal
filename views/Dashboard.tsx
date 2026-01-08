
import React, { useState } from 'react';
import { ACAsset, AssetStatus, TechProfile, Refrigerant } from '../types';
import { DEMERIT_REASONS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  assets: ACAsset[];
  weather: { temp: number; desc: string };
  techs: TechProfile[];
  refrigerants: Refrigerant[];
  onUpdateGas: (name: string, kg: number) => void;
  onUpdateDemerit: (name: string, points: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ assets, weather, techs, refrigerants, onUpdateGas, onUpdateDemerit }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [clickCounts, setClickCounts] = useState<{ [key: string]: number }>({});

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const handleSecretClick = (id: string, limit: number, action: () => void) => {
    setClickCounts(prev => {
      const current = (prev[id] || 0) + 1;
      if (current >= limit) {
        action();
        return { ...prev, [id]: 0 };
      }
      return { ...prev, [id]: current };
    });
  };

  const highAlertAssets = assets.filter(a => a.issuesThisMonth >= 4);
  const statusCounts = {
    Total: assets.length,
    Active: assets.filter(a => a.status === AssetStatus.ACTIVE).length,
    Maintenance: assets.filter(a => a.status === AssetStatus.MAINTENANCE).length,
    Spare: assets.filter(a => a.status === AssetStatus.SPARE).length,
    Disposed: assets.filter(a => a.status === AssetStatus.DISPOSED).length,
    Obsolete: assets.filter(a => a.status === AssetStatus.OBSOLETE).length,
  };

  const demeritData = techs.map(t => ({ name: t.name, demerits: t.demerits }));

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Weather Widget */}
      <div className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-[2rem] p-6 text-white shadow-lg flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase opacity-80 mb-1 tracking-widest">Live Weather (PECHS)</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black">{weather.temp}°C</h3>
            <span className="text-sm font-bold opacity-90">{weather.desc}</span>
          </div>
        </div>
        <i className="fas fa-cloud-sun text-5xl opacity-80"></i>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 overflow-hidden transition-all duration-300">
        <div onClick={() => toggleSection('health')} className="flex justify-between items-center cursor-pointer">
          <h3 className="text-xl font-black text-slate-900">System Health</h3>
          <i className={`fas fa-chevron-${expandedSection === 'health' ? 'up' : 'down'} text-slate-300`}></i>
        </div>
        {expandedSection === 'health' && (
          <div className="mt-6 space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {assets.slice(0, 10).map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-slate-400 text-xs shadow-sm border border-slate-100">{a.id}</div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{a.room}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{a.campus} • {a.floor}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-sm ${a.health < 90 ? 'text-red-500' : 'text-emerald-500'}`}>{a.health.toFixed(1)}%</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Health</p>
                </div>
              </div>
            ))}
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase pt-2">Showing Top 10 • Total 163 Assets</p>
          </div>
        )}
      </div>

      {/* Asset Overview */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <div onClick={() => toggleSection('overview')} className="flex justify-between items-center cursor-pointer mb-6">
          <h3 className="text-xl font-black text-slate-900">Asset Overview</h3>
          <i className={`fas fa-chevron-${expandedSection === 'overview' ? 'up' : 'down'} text-slate-300`}></i>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
            <p className="text-xl font-black text-slate-900">{statusCounts.Total}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-emerald-600 uppercase">Active</span>
            <p className="text-xl font-black text-emerald-600">{statusCounts.Active}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-red-600 uppercase">Maint</span>
            <p className="text-xl font-black text-red-600">{statusCounts.Maintenance}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-blue-600 uppercase">Spare</span>
            <p className="text-xl font-black text-blue-600">{statusCounts.Spare}</p>
          </div>
          <div className="p-3 bg-slate-100 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Disposed</span>
            <p className="text-xl font-black text-slate-500">{statusCounts.Disposed}</p>
          </div>
          <div className="p-3 bg-slate-900 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Obsolete</span>
            <p className="text-xl font-black text-white">{statusCounts.Obsolete}</p>
          </div>
        </div>
        {expandedSection === 'overview' && (
           <div className="mt-6 space-y-2 max-h-[250px] overflow-y-auto">
             {assets.slice(0, 15).map(a => (
               <div key={a.id} className="flex justify-between items-center p-2 border-b border-slate-50">
                 <span className="text-xs font-bold text-slate-600">ID #{a.id} - {a.room}</span>
                 <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                   a.status === AssetStatus.ACTIVE ? 'bg-emerald-100 text-emerald-700' : 
                   a.status === AssetStatus.MAINTENANCE ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                 }`}>{a.status}</span>
               </div>
             ))}
           </div>
        )}
      </div>

      {/* High Alert (Replace Zombie) */}
      {highAlertAssets.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-[2rem] p-6 shadow-lg animate-pulse">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <i className="fas fa-biohazard text-red-600 text-2xl"></i>
              <h3 className="text-xl font-black text-red-600">High Alert!</h3>
            </div>
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg">CRITICAL</span>
          </div>
          <p className="text-xs text-red-500 font-bold mb-4 uppercase tracking-tight">The following units have reported 4+ issues this month and require urgent replacement/overhaul.</p>
          <div className="space-y-3">
            {highAlertAssets.slice(0, 3).map(a => (
              <div key={a.id} className="bg-white/80 p-4 rounded-2xl flex justify-between items-center border border-red-100">
                <div>
                  <h4 className="font-bold text-slate-900">Unit ID #{a.id}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{a.room}</p>
                </div>
                <button className="bg-red-600 text-white text-[10px] font-bold px-4 py-2 rounded-xl active:scale-95 transition-transform">Resolved</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checklist Compliance */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <div onClick={() => toggleSection('compliance')} className="flex justify-between items-center cursor-pointer mb-6">
          <h3 className="text-xl font-black text-slate-900">Checklist Compliance</h3>
          <i className={`fas fa-chevron-${expandedSection === 'compliance' ? 'up' : 'down'} text-slate-300`}></i>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <ComplianceBar label="Daily" percentage={85} color="bg-blue-600" />
          <ComplianceBar label="Monthly" percentage={45} color="bg-purple-600" />
          <ComplianceBar label="Quarterly" percentage={12} color="bg-orange-600" />
        </div>
        {expandedSection === 'compliance' && (
          <div className="mt-8 space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">From Date</label>
                <input type="date" className="w-full bg-slate-50 border-none p-3 rounded-2xl text-xs font-bold mt-1" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">To Date</label>
                <input type="date" className="w-full bg-slate-50 border-none p-3 rounded-2xl text-xs font-bold mt-1" />
              </div>
            </div>
            <button className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black text-sm active:scale-95 transition-transform flex items-center justify-center gap-3">
              <i className="fas fa-file-export"></i> EXPORT CSV
            </button>
          </div>
        )}
      </div>

      {/* Refrigerant Status */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <div onClick={() => toggleSection('gas')} className="flex justify-between items-center cursor-pointer mb-6">
          <h3 className="text-xl font-black text-slate-900">Refrigerant Status</h3>
          <i className={`fas fa-chevron-${expandedSection === 'gas' ? 'up' : 'down'} text-slate-300`}></i>
        </div>
        {expandedSection === 'gas' && (
          <div className="grid grid-cols-2 gap-6 py-4">
            {refrigerants.map(r => (
              <div 
                key={r.name} 
                className="flex flex-col items-center gap-2 cursor-pointer"
                onClick={() => handleSecretClick(`gas-${r.name}`, 5, () => {
                  const newQty = prompt(`Enter new quantity for ${r.name} (Current: ${r.kg}kg):`, r.kg.toString());
                  if (newQty) onUpdateGas(r.name, parseFloat(newQty));
                })}
              >
                <div className={`w-20 h-28 ${r.type === 'AC' ? 'bg-red-500' : 'bg-slate-800'} rounded-t-3xl rounded-b-xl shadow-lg relative overflow-hidden group`}>
                   <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-2 bg-slate-400 rounded-full"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-white font-black text-xs">{r.name}</span>
                   </div>
                   <div 
                     className="absolute bottom-0 left-0 right-0 bg-white/20 animate-pulse" 
                     style={{ height: `${(r.kg / 40) * 100}%` }}
                   ></div>
                </div>
                <span className="text-xs font-black text-slate-900">{r.kg} kg</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{r.type} GAS</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard Summary */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <div onClick={() => toggleSection('leaderboard')} className="flex justify-between items-center cursor-pointer mb-6">
          <h3 className="text-xl font-black text-slate-900">Leaderboard</h3>
          <i className={`fas fa-chevron-${expandedSection === 'leaderboard' ? 'up' : 'down'} text-slate-300`}></i>
        </div>
        <div className="space-y-4">
          {techs.sort((a, b) => (b.points - b.demerits) - (a.points - a.demerits)).slice(0, 3).map((t, i) => (
            <div key={t.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                  i === 0 ? 'bg-yellow-100 text-yellow-600' : 
                  i === 1 ? 'bg-slate-200 text-slate-600' : 
                  'bg-orange-100 text-orange-600'
                }`}>{i + 1}</div>
                <span className="font-bold text-sm">{t.name}</span>
              </div>
              <span className="font-black text-sm text-slate-900">{t.points - t.demerits} pts</span>
            </div>
          ))}
        </div>
        {expandedSection === 'leaderboard' && (
          <div className="mt-8 space-y-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Full Ranks & Demerits</h4>
            <div className="space-y-4">
              {techs.map(t => (
                <div 
                  key={t.name} 
                  className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl"
                  onClick={() => handleSecretClick(`tech-${t.name}`, 5, () => {
                    const reason = prompt(`Enter demerit reason for ${t.name}:`);
                    const pts = prompt(`Enter points to deduct:`);
                    if (reason && pts) onUpdateDemerit(t.name, parseInt(pts));
                  })}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{t.name}</span>
                    <span className="text-[10px] text-red-500 font-bold">-{t.demerits} demerits</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-emerald-600">{t.points} earned</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-40 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demeritData}>
                  <XAxis dataKey="name" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="demerits" radius={[10, 10, 0, 0]}>
                    {demeritData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.demerits > 30 ? '#ef4444' : '#64748b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-center text-[10px] font-bold text-slate-400 uppercase mt-2">Demerits Distribution</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ComplianceBar: React.FC<{ label: string; percentage: number; color: string }> = ({ label, percentage, color }) => (
  <div>
    <div className="flex justify-between items-end mb-2">
      <span className="text-xs font-bold text-slate-700">{label}</span>
      <span className="text-[10px] font-black text-slate-400">{percentage}%</span>
    </div>
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
    </div>
  </div>
);

export default Dashboard;
