import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Operation, Poste, Machine } from '../types';
import { 
  Users, 
  Clock, 
  RefreshCw,
  MousePointer2,
  ArrowRightLeft,
  Zap,
  Timer,
  Activity,
  LayoutList,
  TableProperties,
  Cpu,
  Palette,
  BarChart3,
  Pin,
  PinOff,
  Briefcase,
  Plus,
  Trash2,
  Eraser,
  Copy,
  Scissors,
  Clipboard,
  CopyPlus,
  X,
  Save,
  AlertCircle,
  Percent
} from 'lucide-react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface BalancingProps {
  operations: Operation[];
  efficiency: number;
  setEfficiency: React.Dispatch<React.SetStateAction<number>>;
  bf: number;
  articleName: string;
  numWorkers: number;
  setNumWorkers: React.Dispatch<React.SetStateAction<number>>;
  presenceTime: number;
  setPresenceTime: React.Dispatch<React.SetStateAction<number>>;
  // Shared State
  assignments: Record<string, string[]>;
  setAssignments: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  postes: Poste[];
  setPostes: React.Dispatch<React.SetStateAction<Poste[]>>;
  machines: Machine[];
}

// --- COLOR PALETTE FOR POSTES ---
const POSTE_COLORS = [
  { name: 'indigo',  bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-700',  badge: 'bg-indigo-100',  fill: '#6366f1', badgeText: 'text-indigo-800' },
  { name: 'rose',    bg: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-700',    badge: 'bg-rose-100',    fill: '#f43f5e', badgeText: 'text-rose-800' },
  { name: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100', fill: '#10b981', badgeText: 'text-emerald-800' },
  { name: 'amber',   bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   badge: 'bg-amber-100',   fill: '#f59e0b', badgeText: 'text-amber-800' },
  { name: 'cyan',    bg: 'bg-cyan-50',    border: 'border-cyan-200',    text: 'text-cyan-700',    badge: 'bg-cyan-100',    fill: '#06b6d4', badgeText: 'text-cyan-800' },
  { name: 'violet',  bg: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-700',  badge: 'bg-violet-100',  fill: '#8b5cf6', badgeText: 'text-violet-800' },
  { name: 'orange',  bg: 'bg-orange-50',  border: 'border-orange-200',  text: 'text-orange-700',  badge: 'bg-orange-100',  fill: '#f97316', badgeText: 'text-orange-800' },
  { name: 'teal',    bg: 'bg-teal-50',    border: 'border-teal-200',    text: 'text-teal-700',    badge: 'bg-teal-100',    fill: '#14b8a6', badgeText: 'text-teal-800' },
  { name: 'fuchsia', bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', text: 'text-fuchsia-700', badge: 'bg-fuchsia-100', fill: '#d946ef', badgeText: 'text-fuchsia-800' },
  { name: 'sky',     bg: 'bg-sky-50',     border: 'border-sky-200',     text: 'text-sky-700',     badge: 'bg-sky-100',     fill: '#0ea5e9', badgeText: 'text-sky-800' },
  { name: 'lime',    bg: 'bg-lime-50',    border: 'border-lime-200',    text: 'text-lime-700',    badge: 'bg-lime-100',    fill: '#84cc16', badgeText: 'text-lime-800' },
  { name: 'pink',    bg: 'bg-pink-50',    border: 'border-pink-200',    text: 'text-pink-700',    badge: 'bg-pink-100',    fill: '#ec4899', badgeText: 'text-pink-800' },
];

const NEUTRAL_COLOR = { 
  name: 'neutral',  
  bg: 'bg-slate-50',  
  border: 'border-slate-200',  
  text: 'text-slate-700',  
  badge: 'bg-slate-100',  
  fill: '#64748b', 
  badgeText: 'text-slate-800' 
};

// Helper for Status Colors
const getStatusColor = (saturation: number) => {
    if (saturation > 115) return { 
        name: 'overload', 
        bg: 'bg-rose-50', 
        border: 'border-rose-200', 
        text: 'text-rose-700', 
        badge: 'bg-rose-100',
        fill: '#f43f5e',
        badgeText: 'text-rose-800'
    };
    if (saturation < 75 && saturation > 0) return { 
        name: 'underload', 
        bg: 'bg-amber-50', 
        border: 'border-amber-200', 
        text: 'text-amber-700', 
        badge: 'bg-amber-100',
        fill: '#fbbf24',
        badgeText: 'text-amber-800'
    };
    return { 
        name: 'good', 
        bg: 'bg-white',
        border: 'border-emerald-200', 
        text: 'text-emerald-700', 
        badge: 'bg-emerald-50',
        fill: '#10b981',
        badgeText: 'text-emerald-800'
    };
};

const getPosteColor = (index: number) => POSTE_COLORS[index % POSTE_COLORS.length];

export default function Balancing({ 
  operations, 
  efficiency,
  setEfficiency,
  bf, 
  articleName,
  numWorkers,
  setNumWorkers,
  presenceTime,
  setPresenceTime,
  assignments,
  setAssignments,
  postes,
  setPostes,
  machines
}: BalancingProps) {

  // --- STATE ---
  const [isManual, setIsManual] = useState(false);
  const [viewMode, setViewMode] = useState<'grouped' | 'matrix'>('matrix');
  const [isSticky, setIsSticky] = useState(true);
  const [showColors, setShowColors] = useState(true);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    posteId: string | null;
  } | null>(null);

  const [clipboard, setClipboard] = useState<{ poste: Poste | null; mode: 'copy' | 'cut' } | null>(null);

  // --- HELPER: SECONDS CONVERTER ---
  const toSec = (min: number) => Math.round(min * 60);
  const bfSeconds = bf * 60;

  // Global click listener to close context menu
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // --- INITIALIZATION / AUTO-BALANCE ---
  const runAutoBalancing = (force = false) => {
    // Prevent overwrite if manual mode is active, unless forced
    if (isManual && !force) return;

    const newAssignments: Record<string, string[]> = {};
    const newPostes: Poste[] = [];

    // Allow 15% tolerance on cycle time
    // If bf is 0 (1 worker or invalid calc), default to infinite limit but we still respect machine changes
    const limitMax = bf > 0 ? bf * 1.15 : Number.MAX_VALUE;

    let currentPosteOps: Operation[] = [];
    let currentTotalTime = 0;
    let currentMachine = '';
    let posteIdx = 1;

    const flush = () => {
        if (currentPosteOps.length === 0) return;
        
        const posteId = `P${posteIdx}`;
        newPostes.push({ 
            id: posteId, 
            name: `P${posteIdx}`, 
            machine: currentMachine || 'MAN'
        });
        
        currentPosteOps.forEach(op => {
            newAssignments[op.id] = [posteId];
        });

        posteIdx++;
        currentPosteOps = [];
        currentTotalTime = 0;
    };

    operations.forEach(op => {
        // Safe Machine Name Check: Try op.machineName, then lookup by ID from machines prop
        let rawName = op.machineName;
        if (!rawName && op.machineId) {
            const foundM = machines.find(m => m.id === op.machineId);
            if (foundM) rawName = foundM.name;
        }
        if (!rawName) rawName = 'MAN';

        let opMachine = rawName.trim().toUpperCase();
        if (opMachine.includes('MANUEL')) opMachine = 'MAN';

        const opTime = op.time || 0;

        // Logic: Group if same machine AND fits in time limit
        // Strict Comparison: currentMachine MUST match opMachine exactly
        
        const isSameMachine = currentPosteOps.length === 0 || opMachine === currentMachine;
        const fits = (currentTotalTime + opTime) <= limitMax;

        if (isSameMachine && fits) {
            currentPosteOps.push(op);
            currentTotalTime += opTime;
            // Initialize machine name for the new group
            if (currentPosteOps.length === 1) currentMachine = opMachine;
        } else {
            flush();
            // Start new poste
            currentPosteOps = [op];
            currentTotalTime = opTime;
            currentMachine = opMachine;
        }
    });
    flush();

    setPostes(newPostes);
    setAssignments(newAssignments);
  };

  // Re-run auto balancing when critical factors change, IF not in manual mode
  useEffect(() => {
    if (!isManual) {
        runAutoBalancing();
    }
  }, [operations, bf, isManual, machines]); // Added dependencies

  // --- CONTEXT MENU HANDLERS ---
  const handleContextMenu = (e: React.MouseEvent, posteId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ visible: true, x: e.pageX, y: e.pageY, posteId });
  };

  const handleContextAction = (action: 'insert' | 'delete' | 'clear' | 'copy' | 'cut' | 'paste') => {
      if (!contextMenu?.posteId) return;
      const idx = postes.findIndex(p => p.id === contextMenu.posteId);
      if (idx === -1) return;

      let newPostes = [...postes];
      let newAssignments = { ...assignments };

      switch(action) {
          case 'insert': {
              const newPoste: Poste = { 
                  id: `P_${Date.now()}`, 
                  name: 'P?', 
                  machine: 'MAN', 
                  notes: '', 
                  operatorName: '' 
              };
              newPostes.splice(idx + 1, 0, newPoste);
              break;
          }
          case 'delete': {
              const pid = newPostes[idx].id;
              newPostes.splice(idx, 1);
              Object.keys(newAssignments).forEach(opId => {
                  newAssignments[opId] = newAssignments[opId].filter(id => id !== pid);
              });
              break;
          }
          case 'clear': {
              const pid = newPostes[idx].id;
              newPostes[idx] = { 
                  ...newPostes[idx], 
                  machine: 'MAN', 
                  timeOverride: undefined, 
                  notes: '', 
                  operatorName: '' 
              };
              Object.keys(newAssignments).forEach(opId => {
                  newAssignments[opId] = newAssignments[opId].filter(id => id !== pid);
              });
              break;
          }
          case 'copy':
              setClipboard({ poste: { ...postes[idx] }, mode: 'copy' });
              break;
          case 'cut':
              setClipboard({ poste: { ...postes[idx] }, mode: 'cut' });
              break;
          case 'paste': {
              if (clipboard?.poste) {
                  const newId = `P_${Date.now()}`;
                  const pastedPoste = {
                      ...clipboard.poste,
                      id: newId,
                      name: 'P?' 
                  };
                  newPostes.splice(idx + 1, 0, pastedPoste);
                  
                  if (clipboard.mode === 'cut') {
                      const oldIdx = newPostes.findIndex(p => p.id === clipboard.poste!.id);
                      if (oldIdx !== -1) {
                          const oldPid = newPostes[oldIdx].id;
                          newPostes.splice(oldIdx, 1);
                          Object.keys(newAssignments).forEach(opId => {
                              newAssignments[opId] = newAssignments[opId].filter(id => id !== oldPid);
                          });
                          setClipboard(null);
                      }
                  }
              }
              break;
          }
      }

      newPostes = newPostes.map((p, i) => ({ ...p, name: `P${i + 1}` }));
      
      setPostes(newPostes);
      setAssignments(newAssignments);
      setContextMenu(null);
  };

  // --- MANUAL MODE HANDLERS ---
  const toggleAssignment = (opId: string, posteId: string) => {
      if (!isManual) return;
      setAssignments(prev => {
          const current = prev[opId] || [];
          const exists = current.includes(posteId);
          let updated;
          if (exists) { updated = current.filter(id => id !== posteId); } 
          else { updated = [...current, posteId]; }
          return { ...prev, [opId]: updated };
      });
  };

  // --- CALCULATIONS ---
  const calculateStats = (currAssignments: Record<string, string[]>, currPostes: Poste[]) => {
      const stats: Record<string, { time: number, nTheo: number, saturation: number }> = {};
      
      currPostes.forEach(p => {
          stats[p.id] = { time: p.timeOverride !== undefined ? p.timeOverride : 0, nTheo: 0, saturation: 0 };
      });

      operations.forEach(op => {
          const assignedIds = currAssignments[op.id] || [];
          const count = assignedIds.length;
          if (count > 0) {
              const timeShare = (op.time || 0) / count;
              assignedIds.forEach(pid => {
                  const poste = currPostes.find(p => p.id === pid);
                  if (stats[pid] && poste && poste.timeOverride === undefined) {
                      stats[pid].time += timeShare;
                  }
              });
          }
      });

      Object.keys(stats).forEach(pid => {
          if (bf > 0) {
              stats[pid].nTheo = stats[pid].time / bf;
              stats[pid].saturation = (stats[pid].time / bf) * 100;
          }
      });
      return stats;
  };

  const posteStats = useMemo(() => calculateStats(assignments, postes), [operations, assignments, postes, bf]);
  
  const totalMin = operations.reduce((sum, op) => sum + (op.time || 0), 0);
  const tempsArticle = totalMin * 1.20;
  const prodDay100 = tempsArticle > 0 ? (presenceTime * numWorkers) / tempsArticle : 0;
  const prodDayEff = prodDay100 * (efficiency / 100);
  const hours = presenceTime / 60;
  const prodHour100 = hours > 0 ? prodDay100 / hours : 0;
  const prodHourEff = hours > 0 ? prodDayEff / hours : 0;

  // --- CHART DATA PREP ---
  const chartData = useMemo(() => {
    const data: any[] = [];
    postes.forEach((p, index) => {
        const stat = posteStats[p.id] || { time: 0, saturation: 0, nTheo: 0 };
        const nReq = stat.nTheo > 1.15 ? Math.ceil(stat.nTheo) : (stat.nTheo > 0 ? 1 : 0);
        
        let colorFill = '';
        if (showColors) {
            colorFill = getPosteColor(index).fill;
        } else {
            const statusColor = getStatusColor(stat.saturation);
            colorFill = statusColor.fill;
        }
        
        if (nReq > 1) {
            const timePerWorker = (stat.time / nReq);
            const satPerWorker = (timePerWorker / bf) * 100;
            if (!showColors) colorFill = getStatusColor(satPerWorker).fill;

            for (let i = 1; i <= nReq; i++) {
                data.push({
                    name: `${p.name.replace('P', '')}.${i}`,
                    fullId: p.name,
                    time: Math.round(timePerWorker * 60),
                    saturation: Math.round(satPerWorker),
                    nTheo: Number((stat.nTheo / nReq).toFixed(2)),
                    machine: p.machine,
                    fill: colorFill 
                });
            }
        } else {
            data.push({
                name: p.name.replace('P', ''),
                fullId: p.name,
                time: Math.round(stat.time * 60),
                saturation: Math.round(stat.saturation),
                nTheo: Number(stat.nTheo.toFixed(2)),
                machine: p.machine,
                fill: colorFill
            });
        }
    });
    return data;
  }, [postes, posteStats, bf, showColors]);

  const totalRequiredWorkers = useMemo(() => {
    return postes.reduce((sum, p) => {
        const stat = posteStats[p.id];
        const nTheo = stat ? stat.nTheo : 0;
        const nReq = nTheo > 1.15 ? Math.ceil(nTheo) : (nTheo > 0 ? 1 : 0);
        return sum + nReq;
    }, 0);
  }, [postes, posteStats]);

  const machineRequirements = useMemo(() => {
    const groups: Record<string, { time: number, count: number }> = {};
    operations.forEach(op => {
        // Safe Machine Name Logic in summary
        let rawName = op.machineName;
        if (!rawName && op.machineId) {
            const foundM = machines.find(m => m.id === op.machineId);
            if (foundM) rawName = foundM.name;
        }
        if (!rawName) rawName = 'MAN';

        let mName = rawName.trim().toUpperCase();
        if(mName.includes('MANUEL')) mName = 'MAN';
        
        if (!groups[mName]) groups[mName] = { time: 0, count: 0 };
        groups[mName].time += (op.time || 0);
        groups[mName].count += 1;
    });
    const rows = Object.entries(groups).map(([name, stats]) => {
        const nTheo = bf > 0 ? stats.time / bf : 0;
        const nReq = Math.ceil(nTheo);
        return {
            name,
            opsCount: stats.count,
            totalTime: stats.time,
            nTheo: nTheo,
            nReq: Math.max(nReq, (stats.time > 0 ? 1 : 0))
        };
    });
    return rows.sort((a, b) => b.nTheo - a.nTheo);
  }, [operations, bf, machines]);

  return (
    <div className="space-y-6 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
       
       {/* 1. SINGLE ROW HEADER - RESPONSIVE */}
       <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-4 p-2 flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar">
            {/* OUVRIERS / HEURES */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 shrink-0">
                <div className="flex flex-col items-center border-r border-slate-200 pr-3 mr-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Ouvriers</span>
                    <input 
                        type="number" 
                        min="1" 
                        value={Math.round(numWorkers)} 
                        onChange={(e) => setNumWorkers(Math.max(1, Math.round(Number(e.target.value))))} 
                        className="w-12 text-center bg-transparent font-black text-slate-700 outline-none text-sm p-0" 
                    />
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Heures</span>
                    <input 
                        type="number" 
                        min="0" 
                        step="0.5" 
                        value={presenceTime / 60} 
                        onChange={(e) => setPresenceTime(Math.max(0, Number(e.target.value)) * 60)} 
                        className="w-10 text-center bg-transparent font-black text-slate-700 outline-none text-sm p-0" 
                    />
                </div>
            </div>

            {/* BF / MIN TOTALES */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50/50 rounded-lg border border-emerald-100 shrink-0">
                <div className="flex flex-col items-center border-r border-emerald-100 pr-3 mr-3">
                    <span className="text-[9px] font-bold text-emerald-600 uppercase flex items-center gap-1"><Zap className="w-3 h-3" /> BF (s)</span>
                    <span className="font-black text-emerald-700 text-sm">{(bf * 60).toFixed(1)}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-emerald-600 uppercase">Min Tot.</span>
                    <span className="font-black text-emerald-700 text-sm">{presenceTime}</span>
                </div>
            </div>

            {/* P/H 100% */}
            <div className="flex flex-col items-center px-3 py-1.5 shrink-0">
                <span className="text-[9px] font-bold text-orange-400 uppercase">P/H (100%)</span>
                <span className="font-black text-orange-500 text-lg leading-none">{Math.round(prodHour100)}</span>
            </div>

            {/* RENDU */}
            <div className="flex flex-col items-center px-3 py-1.5 bg-indigo-50/50 rounded-lg border border-indigo-100 shrink-0">
                <span className="text-[9px] font-bold text-indigo-400 uppercase">% Rendu</span>
                <div className="flex items-baseline gap-0.5">
                    <input 
                        type="number" 
                        min="1" max="100" 
                        value={efficiency} 
                        onChange={(e) => setEfficiency(Math.max(1, Math.min(100, Number(e.target.value))))} 
                        className="w-8 text-center bg-transparent font-black text-indigo-600 outline-none text-sm border-b border-indigo-200 p-0" 
                    />
                    <span className="text-[10px] font-bold text-indigo-400">%</span>
                </div>
            </div>

            {/* TARGETS */}
            <div className="flex items-center gap-4 px-4 border-l border-slate-100 shrink-0">
                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">P/J</span>
                    <span className="font-black text-slate-700 text-lg leading-none">{Math.round(prodDayEff)}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">P/H</span>
                    <span className="font-black text-slate-700 text-lg leading-none">{Math.round(prodHourEff)}</span>
                </div>
            </div>

            {/* T. ARTICLE (Right aligned or flexed) */}
            <div className="ml-auto px-4 py-1.5 bg-purple-100 rounded-lg border border-purple-200 flex flex-col items-end shrink-0">
                <span className="text-[9px] font-bold text-purple-500 uppercase flex items-center gap-1"><Timer className="w-3 h-3" /> T. Article</span>
                <span className="font-black text-purple-700 text-xl leading-none">{tempsArticle.toFixed(2)}</span>
            </div>
       </div>
      
      {/* 2. CONTROLS (VIEW SWITCHER + ACTIONS) */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-3 px-2">
         <div className="flex bg-slate-100/80 p-1 rounded-xl shadow-inner border border-slate-200">
             <button onClick={() => setViewMode('grouped')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'grouped' ? 'bg-white text-slate-700 shadow-sm ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>
                <LayoutList className="w-4 h-4" /> Vue Par Poste
             </button>
             <button onClick={() => setViewMode('matrix')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'matrix' ? 'bg-white text-slate-700 shadow-sm ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>
                <TableProperties className="w-4 h-4" /> Matrice
             </button>
         </div>

         <div className="flex items-center gap-2">
            <button onClick={() => setShowColors(!showColors)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${showColors ? 'bg-purple-50 border-purple-200 text-purple-700 ring-1 ring-purple-100' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`} title={showColors ? "Désactiver les couleurs" : "Activer les couleurs"}>
                <Palette className="w-4 h-4" />
            </button>
            <button onClick={() => setIsManual(!isManual)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${isManual ? 'bg-amber-50 border-amber-200 text-amber-700 ring-2 ring-amber-100' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                {isManual ? <MousePointer2 className="w-3.5 h-3.5" /> : <ArrowRightLeft className="w-3.5 h-3.5" />}
                {isManual ? 'Mode Manuel Actif' : 'Mode Automatique'}
            </button>
            <button onClick={() => runAutoBalancing(true)} className="px-4 py-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all shadow-sm flex items-center gap-2 text-xs font-bold" title="Recalculer">
                <RefreshCw className="w-3.5 h-3.5" />
            </button>
         </div>
      </div>

       {/* 3. MAIN CONTENT (CONDITIONAL VIEW) */}
       {viewMode === 'matrix' ? (
           <div className="bg-white rounded-[1rem] border border-slate-200 shadow-sm overflow-hidden">
               <div className="overflow-x-auto relative custom-scrollbar pb-2">
                   <table className="w-full text-left border-collapse border-spacing-0">
                       <thead>
                           <tr>
                               <th className={`py-2 px-2 bg-slate-50 border-b-2 border-slate-300 border-r border-slate-300 min-w-[200px] ${isSticky ? 'sticky left-0 z-30 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]' : ''}`}>
                                   <div className="flex items-center justify-between">
                                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Séquence Opératoire</span>
                                     <button onClick={() => setIsSticky(!isSticky)} className={`p-1 rounded-md transition-colors ${isSticky ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-200'}`} title={isSticky ? "Détacher la colonne" : "Figer la colonne"}>
                                       {isSticky ? <Pin className="w-3 h-3" /> : <PinOff className="w-3 h-3" />}
                                     </button>
                                   </div>
                               </th>
                               {postes.map((p, i) => {
                                   const color = showColors ? getPosteColor(i) : NEUTRAL_COLOR;
                                   const hasOverride = p.timeOverride !== undefined;
                                   return (
                                       <th 
                                          key={p.id} 
                                          onContextMenu={(e) => handleContextMenu(e, p.id)}
                                          className={`py-2 px-1 text-center min-w-[70px] ${color.bg} border-b-2 ${color.border} border-r border-slate-300 relative cursor-context-menu`}
                                       >
                                           {hasOverride && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-purple-500" title="Temps Forcé"></div>}
                                           <div className="flex flex-col items-center justify-center gap-1 pointer-events-none">
                                               <span className={`inline-block px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold bg-white border ${color.border} ${color.text} uppercase truncate max-w-[65px]`}>{p.machine}</span>
                                               <div className={`flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs shadow-sm bg-white border ${color.border} ${color.text}`}>{p.name.replace('P','')}</div>
                                           </div>
                                       </th>
                                   );
                               })}
                               <th className="py-2 px-2 bg-slate-50 border-b-2 border-slate-300 border-l border-slate-200 min-w-[70px] text-center"><span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">TOTAL</span></th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-200">
                           {operations.map((op, idx) => {
                               const assignedPosts = assignments[op.id] || [];
                               const timeSec = toSec(op.time);
                               const displayTime = assignedPosts.length > 0 ? Math.round(timeSec / assignedPosts.length) : timeSec;
                               // Resolve machine name for display row
                               let displayName = op.machineName;
                               if (!displayName && op.machineId) {
                                   const m = machines.find(m => m.id === op.machineId);
                                   if (m) displayName = m.name;
                               }
                               if (!displayName) displayName = 'MAN';

                               return (
                                   <tr key={op.id} className="group hover:bg-slate-50 transition-colors">
                                       <td className={`py-1.5 px-2 border-r border-slate-300 bg-white group-hover:bg-slate-50 transition-colors border-b border-slate-200 ${isSticky ? 'sticky left-0 z-20 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]' : ''}`}>
                                           <div className="flex items-center gap-2">
                                               <span className="font-mono text-[9px] text-slate-400 font-bold w-4 text-center">{idx + 1}</span>
                                               <div className="flex flex-col min-w-0">
                                                   <span className="font-bold text-slate-700 text-[11px] truncate max-w-[180px]" title={op.description}>{op.description}</span>
                                                   <div className="flex items-center gap-1.5 mt-0.5">
                                                       <span className="text-[8px] font-bold px-1 rounded bg-slate-100 text-slate-500 uppercase">{displayName}</span>
                                                       <span className="text-[9px] font-bold text-emerald-600">{timeSec}s</span>
                                                   </div>
                                               </div>
                                           </div>
                                       </td>
                                       {postes.map((p, i) => {
                                           const isAssigned = assignedPosts.includes(p.id);
                                           const color = showColors ? getPosteColor(i) : NEUTRAL_COLOR;
                                           return (
                                               <td key={p.id} onClick={() => toggleAssignment(op.id, p.id)} className={`text-center p-0.5 border-r border-b border-slate-200 transition-colors relative ${isManual ? 'cursor-pointer hover:bg-indigo-50' : ''}`}>
                                                   <div className="absolute inset-y-0 left-1/2 w-px bg-slate-50 -z-10 group-hover:bg-slate-100"></div>
                                                   {isAssigned && (
                                                       <div className={`mx-auto w-8 py-0.5 rounded font-bold text-[10px] shadow-sm transform hover:scale-110 transition-transform cursor-default text-white`} style={{ backgroundColor: color.fill }}>
                                                          {displayTime}
                                                       </div>
                                                   )}
                                               </td>
                                           );
                                       })}
                                       <td className="border-l border-b border-slate-200 bg-slate-50/20"></td>
                                   </tr>
                               );
                           })}
                       </tbody>
                       <tfoot className="bg-slate-50 border-t-2 border-slate-300 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.05)] sticky bottom-0 z-30">
                           <tr>
                               <td className={`p-2 border-r border-b border-slate-200 bg-white/95 backdrop-blur ${isSticky ? 'sticky left-0 z-40' : ''}`}>
                                   <div className="flex flex-col items-start"><span className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-indigo-500" /> Saturation %</span></div>
                               </td>
                               {postes.map(p => {
                                   const saturation = Math.round(posteStats[p.id]?.saturation || 0);
                                   const isOver = saturation > 115;
                                   const isUnder = saturation < 75;
                                   let colorClass = "text-emerald-700 bg-emerald-100 border-emerald-200";
                                   if (isOver) colorClass = "text-rose-700 bg-rose-100 border-rose-200";
                                   else if (isUnder) colorClass = "text-amber-700 bg-amber-100 border-amber-200";
                                   return <td key={p.id} className="text-center px-1 py-2 border-r border-b border-slate-200 bg-white/50"><span className={`inline-block px-1.5 py-0.5 rounded border font-black text-[10px] ${colorClass}`}>{saturation}%</span></td>
                               })}
                               <td className="text-center px-1 py-2 border-l border-b border-slate-200 bg-white/50"><span className="text-[10px] text-slate-300">-</span></td>
                           </tr>
                           <tr>
                               <td className={`p-2 border-r border-slate-200 bg-slate-50/95 backdrop-blur ${isSticky ? 'sticky left-0 z-40' : ''}`}>
                                   <div className="flex flex-col items-start"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Users className="w-3.5 h-3.5 text-slate-400" /> Effectif Requis</span></div>
                               </td>
                               {postes.map(p => {
                                   const nTheo = posteStats[p.id]?.nTheo || 0;
                                   const nReq = nTheo > 1.15 ? Math.ceil(nTheo) : (nTheo > 0 ? 1 : 0);
                                   return <td key={p.id} className="text-center px-1 py-2 border-r border-slate-200"><span className="font-mono font-bold text-slate-600 text-[10px]">{nReq}</span></td>
                               })}
                               <td className="text-center px-1 py-2 border-l border-slate-200 bg-emerald-50"><span className="font-black text-emerald-700 text-[11px]">{totalRequiredWorkers}</span></td>
                           </tr>
                       </tfoot>
                   </table>
               </div>
           </div>
       ) : (
           <div className="space-y-6">
               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {postes.map((p, index) => {
                      const ops = operations.filter(op => assignments[op.id]?.includes(p.id));
                      const stat = posteStats[p.id];
                      const nReq = stat.nTheo > 1.15 ? Math.ceil(stat.nTheo) : (stat.nTheo > 0 ? 1 : 0);
                      const timeSec = Math.round(stat.time * 60);
                      const timePerWorker = nReq > 0 ? Math.round(timeSec / nReq) : 0;
                      const saturation = nReq > 0 ? (timePerWorker / bfSeconds) * 100 : 0;
                      const statusColor = getStatusColor(saturation);
                      const color = showColors ? getPosteColor(index) : statusColor;
                      const isOverridden = p.timeOverride !== undefined;

                      return (
                          <div 
                            key={p.id} 
                            onContextMenu={(e) => handleContextMenu(e, p.id)}
                            className={`rounded-xl border ${color.border} bg-white p-3 shadow-sm hover:shadow-md transition-all flex flex-col gap-2 relative overflow-hidden cursor-context-menu`}
                          >
                              <div className={`absolute top-0 inset-x-0 h-1`} style={{ backgroundColor: color.fill }}></div>
                              {isOverridden && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500 animate-pulse" title="Temps Forcé"></div>}
                              <div className="flex justify-between items-start mt-1">
                                  <div className="flex items-center gap-2">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-sm`} style={{ backgroundColor: color.fill }}>{p.name.replace('P','')}</div>
                                      <div>
                                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none mb-0.5">Poste</div>
                                          <div className="text-xs font-bold text-slate-800 truncate max-w-[90px] leading-none" title={p.machine}>{p.machine}</div>
                                      </div>
                                  </div>
                                  <div className={`px-1.5 py-0.5 rounded-md text-[10px] font-black border ${statusColor.bg} ${statusColor.border} ${statusColor.text}`}>{nReq} Op.</div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                  <div className="bg-slate-50 rounded-lg p-1.5 border border-slate-100"><span className="text-[8px] font-bold text-slate-400 uppercase block leading-none mb-1">Total</span><span className={`text-base font-black leading-none ${isOverridden ? 'text-purple-600' : 'text-slate-700'}`}>{timeSec}s</span></div>
                                  <div className="bg-slate-50 rounded-lg p-1.5 border border-slate-100"><span className="text-[8px] font-bold text-slate-400 uppercase block leading-none mb-1">Par Op.</span><span className={`text-base font-black leading-none ${statusColor.text}`}>{timePerWorker}s</span></div>
                              </div>
                              <div className="mt-1">
                                  <div className="flex justify-between items-end mb-1"><span className="text-[9px] font-bold text-slate-400 uppercase">Sat.</span><span className={`text-[10px] font-black ${statusColor.text}`}>{Math.round(saturation)}%</span></div>
                                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-500`} style={{ width: `${Math.min(saturation, 100)}%`, backgroundColor: statusColor.fill }} /></div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1.5 max-h-[120px] overflow-y-auto custom-scrollbar">
                                 {ops.length > 0 ? ops.map((op, idx) => (
                                     <div key={op.id} className="flex justify-between items-start gap-1 group">
                                         <span className="text-[9px] text-slate-500 leading-tight truncate w-full" title={op.description}><span className="font-mono text-slate-300 mr-1">{idx+1}.</span>{op.description}</span>
                                         <span className="text-[9px] font-mono font-bold text-slate-700 bg-slate-50 px-1 rounded whitespace-nowrap">{toSec(op.time)}s</span>
                                     </div>
                                 )) : <div className="text-[9px] text-slate-300 italic">Aucune opération (Temps forcé)</div>}
                              </div>
                          </div>
                      );
                  })}
               </div>
           </div>
       )}

       {/* GRAPHS & TABLES */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
           {/* MACHINE REQUIREMENTS TABLE */}
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col h-[350px]">
              <div className="flex justify-between items-center mb-3 shrink-0">
                   <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                       <Cpu className="w-4 h-4 text-indigo-600" />
                       Besoin Matériel
                   </h3>
                   <div className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold border border-slate-200">
                      Calcul sur BF: {bf.toFixed(2)} min
                   </div>
              </div>
              <div className="overflow-auto custom-scrollbar flex-1 -mx-2 px-2">
                  <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 z-10">
                          <tr>
                              <th className="py-2 px-2 bg-slate-50 border-y border-slate-200 text-[9px] font-bold text-slate-500 uppercase tracking-wider w-[40%]">Désignation</th>
                              <th className="py-2 px-2 bg-orange-50/50 border-y border-orange-100 text-[9px] font-bold text-orange-700 uppercase tracking-wider text-center">T. Total</th>
                              <th className="py-2 px-2 bg-indigo-50/50 border-y border-indigo-100 text-[9px] font-bold text-indigo-700 uppercase tracking-wider text-center">N. Théo</th>
                              <th className="py-2 px-2 bg-emerald-50/50 border-y border-emerald-100 text-[9px] font-bold text-emerald-700 uppercase tracking-wider text-center">N. Machines</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {machineRequirements.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-2 px-2 border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-8 rounded-full bg-slate-200"></div>
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-700">{row.name}</div>
                                                <div className="text-[9px] text-slate-400">{row.opsCount} Ops</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2 px-2 text-center border-b border-slate-100 font-mono text-[10px] text-orange-600 font-bold">{Math.round(row.totalTime * 60)}s</td>
                                    <td className="py-2 px-2 text-center border-b border-slate-100 font-mono text-[10px] text-indigo-600 font-bold">{row.nTheo.toFixed(2)}</td>
                                    <td className="py-2 px-2 text-center border-b border-slate-100">
                                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${row.nReq > 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{row.nReq}</span>
                                    </td>
                                </tr>
                            ))}
                      </tbody>
                  </table>
              </div>
           </div>

           {/* DETAILED ANALYSIS CHART */}
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col h-[350px]">
               <div className="flex justify-between items-center mb-3 shrink-0">
                   <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
                       <BarChart3 className="w-4 h-4 text-emerald-600" />
                       Analyse de Saturation
                   </h3>
               </div>
               <div className="flex-1 w-full min-h-0">
                   <ResponsiveContainer width="100%" height="100%">
                       <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                           <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} interval={0} />
                           <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                           <Tooltip 
                                cursor={{ fill: '#f1f5f9' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '0.25rem' }}
                           />
                           <ReferenceLine y={100} stroke="#10b981" strokeDasharray="3 3" />
                           <Bar dataKey="saturation" radius={[4, 4, 0, 0]} barSize={30}>
                               {chartData.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.fill} />
                               ))}
                           </Bar>
                           <Line type="monotone" dataKey="saturation" stroke="#64748b" strokeWidth={2} dot={{ r: 3, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 5 }} />
                       </ComposedChart>
                   </ResponsiveContainer>
               </div>
           </div>
       </div>

       {/* CONTEXT MENU VIA PORTAL */}
       {contextMenu && contextMenu.visible && createPortal(
            <div 
                className="absolute bg-white border border-slate-200 rounded-xl shadow-2xl z-[9999] py-1.5 w-52 text-xs font-bold text-slate-700 animate-in fade-in zoom-in-95 duration-100 origin-top-left overflow-hidden ring-4 ring-slate-100/50"
                style={{ top: contextMenu.y, left: contextMenu.x }}
                onClick={(e) => e.stopPropagation()} 
            >
                <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-1">
                    Options Poste
                </div>
                <button onClick={() => handleContextAction('insert')} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 transition-colors group">
                    <Plus className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" /> 
                    <span>Insérer Poste</span>
                </button>
                <div className="h-px bg-slate-100 my-1 mx-2"></div>
                <button onClick={() => handleContextAction('cut')} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 transition-colors group">
                    <Scissors className="w-4 h-4 text-slate-400 group-hover:text-slate-600" /> 
                    <span>Couper</span>
                </button>
                <button onClick={() => handleContextAction('copy')} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 transition-colors group">
                    <Copy className="w-4 h-4 text-slate-400 group-hover:text-slate-600" /> 
                    <span>Copier</span>
                </button>
                <button onClick={() => handleContextAction('paste')} disabled={!clipboard} className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 transition-colors group ${!clipboard ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Clipboard className="w-4 h-4 text-slate-400 group-hover:text-slate-600" /> 
                    <span>Coller</span>
                </button>
                <div className="h-px bg-slate-100 my-1 mx-2"></div>
                <button onClick={() => handleContextAction('clear')} className="w-full text-left px-4 py-2.5 hover:bg-amber-50 flex items-center gap-2.5 text-amber-600 transition-colors">
                    <Eraser className="w-4 h-4" /> 
                    <span>Vider le contenu</span>
                </button>
                <button onClick={() => handleContextAction('delete')} className="w-full text-left px-4 py-2.5 hover:bg-rose-50 flex items-center gap-2.5 text-rose-600 transition-colors">
                    <Trash2 className="w-4 h-4" /> 
                    <span>Supprimer</span>
                </button>
            </div>,
            document.body
       )}
    </div>
  );
}