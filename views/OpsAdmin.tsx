
import React, { useState, useMemo } from 'react';
import { ACAsset, Ticket, TicketStatus, Severity, TechProfile } from '../types';
import { smartAssignTask } from '../services/geminiService';

interface OpsAdminProps {
  assets: ACAsset[];
  tickets: Ticket[];
  onAddTicket: (ticket: Ticket) => void;
  onResolveTicket: (id: string, resolver: string) => void;
  techs: TechProfile[];
}

const OpsAdmin: React.FC<OpsAdminProps> = ({ assets, tickets, onAddTicket, onResolveTicket, techs }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<number | ''>('');
  const [severity, setSeverity] = useState<Severity>(Severity.MINOR);
  const [issue, setIssue] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const selectedAsset = useMemo(() => {
    return assets.find(a => a.id === selectedAssetId);
  }, [assets, selectedAssetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !issue) return;

    setIsAssigning(true);
    const newTicket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      assetId: Number(selectedAssetId),
      severity,
      issue,
      status: TicketStatus.OPEN,
      timestamp: new Date().toLocaleString()
    };

    // AI logic for assignment
    const assignedTech = await smartAssignTask(newTicket, techs);
    newTicket.assignedTo = assignedTech;

    onAddTicket(newTicket);
    setIsAssigning(false);
    setShowForm(false);
    setSelectedAssetId('');
    setIssue('');
  };

  return (
    <div className="p-6 space-y-6 fade-in">
      {!showForm ? (
        <button 
          onClick={() => setShowForm(true)}
          className="w-full bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl flex justify-between items-center group active:scale-95 transition-all"
        >
          <div className="text-left">
            <h3 className="text-2xl font-black">Report Issue</h3>
            <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Submit New Complaint</p>
          </div>
          <i className="fas fa-exclamation-triangle text-2xl text-red-400 group-hover:rotate-12 transition-transform"></i>
        </button>
      ) : (
        <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100 fade-in">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-900">New Complaint</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400"><i className="fas fa-times"></i></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset ID (1-163)</label>
              <select 
                value={selectedAssetId} 
                onChange={(e) => setSelectedAssetId(Number(e.target.value))}
                className={`w-full bg-slate-50 border-2 p-4 rounded-2xl text-sm font-bold mt-1 transition-colors ${selectedAssetId ? 'border-emerald-200' : 'border-red-100'}`}
                required
              >
                <option value="">Select ID</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>ID #{a.id} - {a.room}</option>
                ))}
              </select>
            </div>

            {selectedAsset && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Campus</p>
                  <p className="text-xs font-black text-slate-900">{selectedAsset.campus}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Floor</p>
                  <p className="text-xs font-black text-slate-900">{selectedAsset.floor}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Room/Location</p>
                  <p className="text-xs font-black text-slate-900">{selectedAsset.room}</p>
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Severity</label>
              <div className="flex gap-2 mt-1">
                <button 
                  type="button" 
                  onClick={() => setSeverity(Severity.MINOR)}
                  className={`flex-1 p-3 rounded-2xl text-[10px] font-black uppercase transition-all ${severity === Severity.MINOR ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                >MI (Minor)</button>
                <button 
                  type="button" 
                  onClick={() => setSeverity(Severity.MAJOR)}
                  className={`flex-1 p-3 rounded-2xl text-[10px] font-black uppercase transition-all ${severity === Severity.MAJOR ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                >MJ (Major)</button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issue Details</label>
              <textarea 
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                className={`w-full bg-slate-50 border-2 p-4 rounded-2xl text-sm font-bold mt-1 h-32 transition-colors ${issue.length > 5 ? 'border-emerald-200' : 'border-red-100'}`}
                placeholder="Describe the issue..."
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isAssigning}
              className="w-full bg-slate-900 text-white p-5 rounded-[2rem] font-black text-lg active:scale-95 transition-all shadow-xl disabled:opacity-50"
            >
              {isAssigning ? <i className="fas fa-spinner fa-spin mr-2"></i> : 'SUBMIT & AI ASSIGN'}
            </button>
          </form>
        </div>
      )}

      {/* Ticket Queue */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 min-h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-900">Live Ticket Queue</h3>
          <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-lg font-bold animate-pulse">LIVE</span>
        </div>
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <i className="fas fa-clipboard-list text-6xl mb-4"></i>
              <p className="font-bold">No Active Tickets</p>
            </div>
          ) : (
            tickets.map(t => (
              <div key={t.id} className={`p-4 rounded-3xl border ${t.status === TicketStatus.RESOLVED ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg text-white ${t.severity === Severity.MAJOR ? 'bg-red-600' : 'bg-blue-600'}`}>
                      {t.severity === Severity.MAJOR ? 'MJ' : 'MI'}
                    </span>
                    <h4 className="font-bold text-slate-900">ID #{t.assetId}</h4>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                    t.status === TicketStatus.OPEN ? 'bg-orange-100 text-orange-600' : 
                    t.status === TicketStatus.RESOLVED ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                  }`}>{t.status}</span>
                </div>
                <p className="text-sm font-medium text-slate-600 mb-4">{t.issue}</p>
                <div className="flex justify-between items-center">
                   <div className="flex flex-col">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned To</p>
                      <p className="text-xs font-black text-slate-900">{t.assignedTo || 'Unassigned'}</p>
                   </div>
                   {t.status !== TicketStatus.RESOLVED && (
                     <button 
                       onClick={() => {
                         const resolver = prompt("Enter resolver name:");
                         if (resolver) onResolveTicket(t.id, resolver);
                       }}
                       className="bg-emerald-600 text-white text-[10px] font-bold px-4 py-2 rounded-xl active:scale-95 transition-all shadow-md"
                     >RESOLVE</button>
                   )}
                </div>
                {t.resolvedAt && (
                   <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                      <span>Resolved: {t.resolvedAt}</span>
                      <span>By: {t.resolver}</span>
                   </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OpsAdmin;
