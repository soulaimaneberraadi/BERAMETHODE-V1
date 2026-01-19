import React, { useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Operation, Poste, Machine } from '../types';
import { 
  Zap, 
  Briefcase, 
  Printer,
  Grid as GridIcon,
  ArrowRight,
  ArrowDown,
  MoveRight,
  Plus,
  Minus,
  AlertCircle,
  Calculator,
  AlignJustify,
  User,
  FileText,
  X,
  Trash2,
  Check,
  PenTool,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  Layers,
  CornerDownRight,
  Ruler,
  Truck,
  Scissors,
  Package,
  ArrowUp,
  ArrowLeftRight,
  Eye,
  ArrowRightLeft,
  Clock,
  Sparkles,
  Thermometer,
  Scaling,
  ZoomIn,
  ZoomOut,
  Maximize,
  GripHorizontal,
  Component,
  Download,
  Timer,
  Users,
  Percent
} from 'lucide-react';

interface ImplantationProps {
  bf: number;
  operations: Operation[];
  numWorkers: number;
  setNumWorkers: React.Dispatch<React.SetStateAction<number>>;
  presenceTime: number;
  setPresenceTime: React.Dispatch<React.SetStateAction<number>>;
  efficiency: number;
  setEfficiency: React.Dispatch<React.SetStateAction<number>>;
  articleName: string;
  // Shared State from App/Balancing
  assignments?: Record<string, string[]>;
  postes?: Poste[];
  setPostes?: React.Dispatch<React.SetStateAction<Poste[]>>;
  machines: Machine[];
}

// --- COLOR PALETTE ---
const POSTE_COLORS = [
  { name: 'indigo',  bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-700',  fill: '#6366f1' },
  { name: 'cyan',    bg: 'bg-cyan-50',    border: 'border-cyan-200',    text: 'text-cyan-700',    fill: '#06b6d4' },
  { name: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', fill: '#10b981' },
  { name: 'violet',  bg: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-700',  fill: '#8b5cf6' },
];

const SPECIAL_COLORS = {
  controle: { name: 'orange', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', fill: '#f97316' }, 
  fer:      { name: 'rose',   bg: 'bg-rose-100',  border: 'border-rose-300',   text: 'text-rose-800',   fill: '#e11d48' },
  finition: { name: 'purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', fill: '#a855f7' },
};

const getPosteColor = (index: number, machineName: string) => {
  const name = machineName.toUpperCase();
  if (name.includes('CONTROL') || name.includes('CONTROLE')) return SPECIAL_COLORS.controle;
  if (name.includes('FER') || name.includes('REPASSAGE')) return SPECIAL_COLORS.fer;
  if (name.includes('FINITION')) return SPECIAL_COLORS.finition;
  return POSTE_COLORS[index % POSTE_COLORS.length];
};

interface Workstation extends Poste {
  index: number;
  originalIndex: number; // Index in the main 'postes' array
  operations: Operation[];
  totalTime: number;
  saturation: number;
  operators: number;
  color: typeof POSTE_COLORS[0];
}

// ... (Connectors components remain the same, kept for brevity) ...
// Vertical Connector (Down)
const ConnectorVertical = ({ active = false, passed = false }) => {
    const lineColor = active || passed ? 'bg-emerald-500' : 'bg-slate-300';
    const badgeBorder = active || passed ? 'border-emerald-500' : 'border-slate-300';
    const iconColor = active || passed ? 'text-emerald-600' : 'text-slate-400';
    const shadow = active ? 'shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'shadow-sm';
    return (
        <div className="flex flex-col items-center justify-center h-16 shrink-0 relative py-1">
            <div className={`h-full w-[3px] rounded-full ${lineColor} transition-colors duration-500`}></div>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border-2 rounded-full p-0.5 z-10 ${badgeBorder} ${shadow} transition-all duration-500`}>
                <ArrowDown className={`w-3 h-3 ${iconColor}`} />
            </div>
        </div>
    );
};
const ConnectorHorizontal = ({ active = false, passed = false }) => {
    const lineColor = active || passed ? 'bg-emerald-500' : 'bg-slate-300';
    const badgeBorder = active || passed ? 'border-emerald-500' : 'border-slate-300';
    const iconColor = active || passed ? 'text-emerald-600' : 'text-slate-400';
    const shadow = active ? 'shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'shadow-sm';
    return (
        <div className="flex flex-row items-center justify-center w-16 shrink-0 relative px-1">
            <div className={`w-full h-[3px] rounded-full ${lineColor} transition-colors duration-500`}></div>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border-2 rounded-full p-0.5 z-10 ${badgeBorder} ${shadow} transition-all duration-500`}>
                <ArrowRight className={`w-3 h-3 ${iconColor}`} />
            </div>
        </div>
    );
};
const ConnectorDiagonal = ({ active = false, passed = false }) => {
    const iconColor = active || passed ? 'text-emerald-600' : 'text-slate-400';
    return (
        <div className="absolute left-[60%] top-[40%] w-[120%] h-[150%] pointer-events-none z-0" style={{ transform: 'translate(-50%, -50%)' }}>
             <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                 <path d="M 0 100 Q 50 100 50 50 T 100 0" fill="none" stroke={active || passed ? '#10b981' : '#cbd5e1'} strokeWidth="2" vectorEffect="non-scaling-stroke" className="transition-colors duration-500" />
             </svg>
             <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-0.5 border ${active || passed ? 'border-emerald-500' : 'border-slate-200'}`}>
                 <div className="transform -rotate-45"><ArrowRight className={`w-3 h-3 ${iconColor}`} /></div>
             </div>
        </div>
    );
};
const ConnectorVerticalLong = ({ active = false, passed = false }) => {
    const lineColor = active || passed ? 'bg-emerald-500' : 'bg-slate-300';
    const iconColor = active || passed ? 'text-emerald-600' : 'text-slate-400';
    return (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-40px] h-[40px] w-10 flex justify-center pointer-events-none z-0">
             <div className={`h-full w-[3px] rounded-full ${lineColor} transition-colors duration-500`}></div>
             <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-0.5 border ${active || passed ? 'border-emerald-500' : 'border-slate-200'}`}>
                 <ArrowDown className={`w-3 h-3 ${iconColor}`} />
             </div>
        </div>
    );
};
const DimensionMarkerHorizontal = ({ label }: { label: string }) => (
    <div className="flex flex-col items-center w-full px-2 opacity-70">
        <div className="flex items-center w-full text-[9px] text-slate-500 font-mono font-bold whitespace-nowrap">
            <div className="h-2 w-px bg-slate-400"></div>
            <div className="h-px bg-slate-400 flex-1 relative"><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[140%] bg-white px-1">{label}</span></div>
            <div className="h-2 w-px bg-slate-400"></div>
        </div>
    </div>
);
const DimensionMarkerVertical = ({ label, height = 'h-full' }: { label: string, height?: string }) => (
    <div className={`flex flex-row items-center justify-center ${height} opacity-70`}>
        <div className="flex flex-col items-center h-full text-[9px] text-slate-500 font-mono font-bold whitespace-nowrap">
            <div className="w-2 h-px bg-slate-400"></div>
            <div className="w-px bg-slate-400 flex-1 relative"><span className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-[140%] bg-white py-1 rotate-90">{label}</span></div>
            <div className="w-2 h-px bg-slate-400"></div>
        </div>
    </div>
);
const SpecialZoneControl = ({ label, type, icon: Icon, color, currentCount, onAdd, onRemove }: any) => (
    <div className={`flex items-center gap-2 px-2 py-1 rounded-lg border ${color.bg} ${color.border} shadow-sm transition-colors`}>
        <div className={`flex items-center gap-1 ${color.text}`}><Icon className="w-3 h-3" /><span className="text-[10px] font-bold uppercase">{label}</span></div>
        <div className="flex items-center bg-white rounded border border-slate-200 overflow-hidden shadow-sm">
             <button onClick={() => onRemove(type)} className="p-1 hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-colors border-r border-slate-100"><Minus className="w-2.5 h-2.5" /></button>
             <span className="w-6 text-center text-[10px] font-bold text-slate-700">{currentCount}</span>
             <button onClick={() => onAdd(type)} className="p-1 hover:bg-slate-100 text-slate-400 hover:text-emerald-500 transition-colors"><Plus className="w-2.5 h-2.5" /></button>
        </div>
    </div>
);

export default function Implantation({ 
    bf, 
    operations, 
    numWorkers,
    setNumWorkers,
    presenceTime,
    setPresenceTime,
    efficiency,
    setEfficiency,
    articleName,
    assignments,
    postes,
    setPostes,
    machines
}: ImplantationProps) {

  // --- CALCULATIONS FOR HEADER ---
  const totalMin = useMemo(() => operations.reduce((sum, op) => sum + (op.time || 0), 0), [operations]);
  const tempsArticle = totalMin * 1.20; 

  const prodDay100 = tempsArticle > 0 ? (presenceTime * numWorkers) / tempsArticle : 0;
  const prodDayEff = prodDay100 * (efficiency / 100);
  const hours = presenceTime / 60;
  const prodHour100 = hours > 0 ? prodDay100 / hours : 0;
  const prodHourEff = hours > 0 ? prodDayEff / hours : 0;

  // --- STATE ---
  const [layoutType, setLayoutType] = useState<'zigzag' | 'snake' | 'grid'>('zigzag');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [draggedStationIdx, setDraggedStationIdx] = useState<number | null>(null);
  const [selectedMachineToAdd, setSelectedMachineToAdd] = useState<string>('MAN');
  const [showDimensions, setShowDimensions] = useState(false);
  const [swapControlFinition, setSwapControlFinition] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [simulationActive, setSimulationActive] = useState(false);
  const [simStep, setSimStep] = useState(-1);
  const [showMaterialsPanel, setShowMaterialsPanel] = useState(false);
  const [matPanel, setMatPanel] = useState({ x: window.innerWidth - 340, y: 120, w: 300, h: 400 });
  const [isDraggingMat, setIsDraggingMat] = useState(false);
  const [isResizingMat, setIsResizingMat] = useState(false);
  const matDragStart = useRef({ x: 0, y: 0, w: 0, h: 0, startX: 0, startY: 0 });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; stationIndex: number; data: Poste; width: number; height: number; } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const canEdit = !!setPostes && !!postes && postes.length > 0;
  const [isDraggingMenu, setIsDraggingMenu] = useState(false);
  const [isResizingMenu, setIsResizingMenu] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const startSize = useRef({ w: 0, h: 0, x: 0, y: 0 });

  // ... (All logic functions like startDragMenu, workstation calculation, etc. remain the same) ...
  const startDragMenu = (e: React.MouseEvent) => {
      if (!contextMenu) return;
      setIsDraggingMenu(true);
      dragOffset.current = { x: e.clientX - contextMenu.x, y: e.clientY - contextMenu.y };
  };
  const startResizeMenu = (e: React.MouseEvent) => {
      if (!contextMenu) return;
      e.preventDefault(); e.stopPropagation();
      setIsResizingMenu(true);
      startSize.current = { w: contextMenu.width, h: contextMenu.height, x: e.clientX, y: e.clientY };
  };
  const startDragMat = (e: React.MouseEvent) => {
      setIsDraggingMat(true);
      matDragStart.current = { startX: e.clientX, startY: e.clientY, x: matPanel.x, y: matPanel.y, w: matPanel.w, h: matPanel.h };
  };
  const startResizeMat = (e: React.MouseEvent) => {
      e.preventDefault(); e.stopPropagation();
      setIsResizingMat(true);
      matDragStart.current = { startX: e.clientX, startY: e.clientY, x: matPanel.x, y: matPanel.y, w: matPanel.w, h: matPanel.h };
  };

  useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
          if (isDraggingMenu && contextMenu) {
              e.preventDefault();
              setContextMenu(prev => prev ? ({ ...prev, x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y }) : null);
          } else if (isResizingMenu && contextMenu) {
              e.preventDefault();
              const deltaX = e.clientX - startSize.current.x;
              const deltaY = e.clientY - startSize.current.y;
              setContextMenu(prev => prev ? ({ ...prev, width: Math.max(300, startSize.current.w + deltaX), height: Math.max(200, startSize.current.h + deltaY) }) : null);
          }
          if (isDraggingMat) {
              e.preventDefault();
              const dx = e.clientX - matDragStart.current.startX;
              const dy = e.clientY - matDragStart.current.startY;
              setMatPanel(prev => ({ ...prev, x: matDragStart.current.x + dx, y: matDragStart.current.y + dy }));
          } else if (isResizingMat) {
              e.preventDefault();
              const dx = e.clientX - matDragStart.current.startX;
              const dy = e.clientY - matDragStart.current.startY;
              setMatPanel(prev => ({ ...prev, w: Math.max(250, matDragStart.current.w + dx), h: Math.max(200, matDragStart.current.h + dy) }));
          }
      };
      const handleMouseUp = () => { setIsDraggingMenu(false); setIsResizingMenu(false); setIsDraggingMat(false); setIsResizingMat(false); };
      if (isDraggingMenu || isResizingMenu || isDraggingMat || isResizingMat) { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); }
      return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [isDraggingMenu, isResizingMenu, isDraggingMat, isResizingMat, contextMenu]);

  const workstations = useMemo(() => {
    if (postes && postes.length > 0 && assignments && Object.keys(assignments).length > 0) {
        const result: Workstation[] = [];
        postes.forEach((p, realIndex) => {
             if (!p) return;
             let totalTime = 0; let saturation = 0; let operators = 1;
             const assignedOps = operations.filter(op => assignments[op.id]?.includes(p.id));
             if (p.timeOverride !== undefined) {
                 totalTime = p.timeOverride;
                 const nTheo = bf > 0 ? totalTime / bf : 0;
                 operators = nTheo > 1.15 ? Math.ceil(nTheo) : (nTheo > 0 ? 1 : 0);
                 saturation = (operators > 0 && bf > 0) ? (totalTime / (operators * bf)) * 100 : 0;
             } else {
                 assignedOps.forEach(op => { const numAssigned = assignments[op.id]?.length || 1; totalTime += (op.time || 0) / numAssigned; });
                 const nTheo = bf > 0 ? totalTime / bf : 0;
                 operators = nTheo > 1.15 ? Math.ceil(nTheo) : (nTheo > 0 ? 1 : 0);
                 saturation = (operators > 0 && bf > 0) ? (totalTime / (operators * bf)) * 100 : 0;
             }
             operators = Math.max(1, operators);
             const color = getPosteColor(realIndex, p.machine);
             for(let i=1; i<=operators; i++) {
                 result.push({ ...p, id: `${p.id}__${i}`, name: operators > 1 ? `${p.name}.${i}` : p.name, index: result.length + 1, originalIndex: realIndex, operations: assignedOps, totalTime: totalTime / operators, saturation: saturation, operators: 1, color: color });
             }
        });
        return result;
    }
    return [];
  }, [operations, bf, assignments, postes]);

  useEffect(() => {
    let interval: any; const totalSteps = Math.max(0, (workstations.length * 2) + 2);
    if (simulationActive) { interval = setInterval(() => { setSimStep(prev => { if (prev >= totalSteps) { setSimulationActive(false); return totalSteps; } return prev + 1; }); }, 500); }
    return () => clearInterval(interval);
  }, [simulationActive, workstations.length]);

  const toggleSimulation = () => { if (simulationActive) { setSimulationActive(false); } else { setSimStep(-1); setSimulationActive(true); } };
  const resetSimulation = () => { setSimulationActive(false); setSimStep(-1); };
  const ITEMS_PER_ROW_SNAKE = 4;
  const snakeRows = useMemo(() => { const result = []; for (let i = 0; i < workstations.length; i += ITEMS_PER_ROW_SNAKE) { result.push(workstations.slice(i, i + ITEMS_PER_ROW_SNAKE)); } return result; }, [workstations]);
  const zigZagPairs = useMemo(() => { const pairs = []; for (let i = 0; i < workstations.length; i += 2) { pairs.push({ top: workstations[i], bottom: workstations[i + 1] }); } return pairs; }, [workstations]);
  const machinesSummary = useMemo(() => { const summary: Record<string, number> = {}; let total = 0; workstations.forEach(st => { const mName = st.machine.toUpperCase().includes('MAN') ? 'MAN' : st.machine; if (!summary[mName]) summary[mName] = 0; summary[mName] += 1; total += 1; }); return { counts: Object.entries(summary), total }; }, [workstations]);

  const handleDragStart = (e: React.DragEvent, index: number) => { if (!canEdit) return; setDraggedStationIdx(index); e.dataTransfer.effectAllowed = "move"; setContextMenu(null); };
  const handleDragOver = (e: React.DragEvent) => { if (!canEdit) return; e.preventDefault(); };
  const handleDrop = (e: React.DragEvent, dropIndex: number) => { e.preventDefault(); if (draggedStationIdx === null || draggedStationIdx === undefined || draggedStationIdx === dropIndex || !setPostes || !postes) return; const newPostes = [...postes]; const movedItem = newPostes[draggedStationIdx]; newPostes.splice(draggedStationIdx, 1); newPostes.splice(dropIndex, 0, movedItem); const reindexed = newPostes.map((p, i) => ({ ...p, name: `P${i + 1}` })); setPostes(reindexed); setDraggedStationIdx(null); };
  const handleAddPost = () => { if (!setPostes || !postes) return; const newId = `P${postes.length + 1}`; const newPoste: Poste = { id: newId, name: newId, machine: selectedMachineToAdd, notes: '', operatorName: '' }; setPostes([...postes, newPoste]); };
  const reorderPostes = (list: Poste[], isSwapped: boolean) => { const isControl = (p: Poste) => { const m = p.machine.toUpperCase(); return m.includes('CONTROLE') || m.includes('CONTROL'); }; const isFinition = (p: Poste) => { const m = p.machine.toUpperCase(); return m.includes('FINITION'); }; const control = list.filter(isControl); const finition = list.filter(isFinition); const others = list.filter(p => !isControl(p) && !isFinition(p)); const newOrder = isSwapped ? [...others, ...control, ...finition] : [...others, ...finition, ...control]; return newOrder.map((p, i) => ({ ...p, name: `P${i+1}` })); };
  const handleSwapZones = () => { if (!setPostes || !postes) return; const newState = !swapControlFinition; setSwapControlFinition(newState); setPostes(reorderPostes(postes, newState)); };
  const handleAddSpecial = (type: 'CONTROLE' | 'FINITION') => { if (!setPostes || !postes) return; const newPoste: Poste = { id: `P_${Date.now()}`, name: 'P?', machine: type, notes: '', operatorName: '' }; const newList = [...postes, newPoste]; setPostes(reorderPostes(newList, swapControlFinition)); };
  const handleRemoveSpecial = (type: 'CONTROLE' | 'FINITION') => { if (!setPostes || !postes) return; const reversedPostes = [...postes].reverse(); const indexToRemoveReversed = reversedPostes.findIndex(p => { const m = p.machine.toUpperCase(); if (type === 'CONTROLE') return m.includes('CONTROLE') || m.includes('CONTROL'); if (type === 'FINITION') return m.includes('FINITION'); return false; }); if (indexToRemoveReversed !== -1) { const realIndex = postes.length - 1 - indexToRemoveReversed; const newPostes = [...postes]; newPostes.splice(realIndex, 1); setPostes(reorderPostes(newPostes, swapControlFinition)); } };
  const handleContextMenu = (e: React.MouseEvent, station: Workstation) => { e.preventDefault(); if (!canEdit) return; const w = 340; const h = 480; let x = e.clientX; let y = e.clientY; if (x + w > window.innerWidth) x = window.innerWidth - w - 20; if (y + h > window.innerHeight) y = window.innerHeight - h - 20; setContextMenu({ x, y, width: w, height: h, stationIndex: station.originalIndex, data: { ...postes![station.originalIndex] } }); };
  const closeContextMenu = () => setContextMenu(null);
  const saveContextChanges = (updatedData: Partial<Poste>) => { if (!setPostes || !postes || !contextMenu) return; const newPostes = [...postes]; newPostes[contextMenu.stationIndex] = { ...newPostes[contextMenu.stationIndex], ...updatedData }; setPostes(newPostes); setContextMenu(prev => prev ? { ...prev, data: { ...prev.data, ...updatedData } } : null); };
  const deleteFromContext = () => { if (!setPostes || !postes || !contextMenu) return; const newPostes = [...postes]; newPostes.splice(contextMenu.stationIndex, 1); const reindexed = newPostes.map((p, i) => ({ ...p, name: `P${i + 1}` })); setPostes(reindexed); closeContextMenu(); };
  useEffect(() => { const handleClick = (e: MouseEvent) => { if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) { if (!isDraggingMenu && !isResizingMenu) { closeContextMenu(); } } }; if (contextMenu && !isDraggingMenu) document.addEventListener('mousedown', handleClick); return () => document.removeEventListener('mousedown', handleClick); }, [contextMenu, isDraggingMenu, isResizingMenu]);

  const StationCard: React.FC<{ station: Workstation; isGrid?: boolean }> = ({ station, isGrid = false }) => {
      const color = station.color; const timeInSeconds = Math.round(station.totalTime * 60); const hasNotes = station.notes && station.notes.trim().length > 0; const hasOperator = station.operatorName && station.operatorName.trim().length > 0; const isOverridden = station.timeOverride !== undefined; const mySimIndex = station.index - 1; const isActive = simStep === mySimIndex; const isPassed = simStep > mySimIndex; const isControl = station.machine.toUpperCase().includes('CONTROLE'); const isFer = station.machine.toUpperCase().includes('FER') || station.machine.toUpperCase().includes('REPASSAGE'); const isFinition = station.machine.toUpperCase().includes('FINITION'); let bodyBgClass = 'bg-white'; if (isControl) bodyBgClass = 'bg-orange-50'; if (isFer) bodyBgClass = 'bg-rose-50'; if (isFinition) bodyBgClass = 'bg-purple-50'; const isSpecial = isControl || isFer || isFinition;
      return (
          <div onContextMenu={(e) => handleContextMenu(e, station)} draggable={canEdit} onDragStart={(e) => handleDragStart(e, station.originalIndex)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, station.originalIndex)} className={`relative bg-white border shadow-sm rounded-xl overflow-hidden group z-10 ${isGrid ? 'w-full min-h-[120px]' : 'w-44 sm:w-48 shrink-0'} ${canEdit ? 'cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:shadow-md' : ''} ${isActive ? 'ring-4 ring-emerald-400 ring-opacity-50 border-emerald-500 scale-105 shadow-xl z-20' : isPassed ? 'border-emerald-200 opacity-90' : 'border-slate-200'} transition-all duration-300 flex flex-col select-none`}>
              <div className={`px-2 py-1.5 flex justify-between items-center ${isActive ? 'bg-emerald-500' : (isPassed ? 'bg-emerald-50' : color.bg)} border-b ${isActive ? 'border-emerald-600' : color.border} transition-colors duration-500 relative`}>{isOverridden && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-purple-500 ring-1 ring-white" title="Temps Forcé"></div>}<div className="flex items-center gap-2"><span className={`text-[10px] font-black ${isActive ? 'text-emerald-600 bg-white' : color.text} w-5 h-5 flex items-center justify-center bg-white rounded shadow-sm`}>{station.name.replace('P','').split('.')[0]}</span><span className={`text-[9px] font-bold uppercase truncate max-w-[80px] ${isActive ? 'text-white' : color.text}`} title={station.name}>{station.machine} {station.name.includes('.') ? `.${station.name.split('.')[1]}` : ''}</span></div><div className="flex items-center gap-1">{isControl && <Eye className={`w-3 h-3 ${isActive ? 'text-white' : 'text-orange-500'}`} />}{isFer && <Thermometer className={`w-3 h-3 ${isActive ? 'text-white' : 'text-rose-500'}`} />}{isFinition && <Sparkles className={`w-3 h-3 ${isActive ? 'text-white' : 'text-purple-500'}`} />}{hasOperator && <div title={station.operatorName}><User className={`w-3 h-3 ${isActive ? 'text-white' : 'text-slate-400'}`} /></div>}{hasNotes && <div title="Notes"><FileText className={`w-3 h-3 ${isActive ? 'text-yellow-300' : 'text-amber-400'}`} /></div>}</div></div>
              <div className={`p-2 flex-1 flex flex-col justify-between gap-2 ${bodyBgClass}`}><div className="space-y-1">{station.operations.length > 0 ? (<>{station.operations.slice(0, 3).map((op, i) => (<div key={i} className="flex justify-between items-start gap-1"><div className="text-[10px] text-slate-600 font-medium leading-tight truncate flex-1" title={op.description}>{op.description}</div>{op.guideFactor !== undefined && op.guideFactor > 1 && (<span className="shrink-0 text-[8px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-1 rounded flex items-center h-3.5" title={`Guide / Difficulté: ${op.guideFactor}`}><Component className="w-2 h-2 mr-0.5" />G{op.guideFactor}</span>)}</div>))}{station.operations.length > 3 && <div className="text-[9px] text-slate-400 italic">... +{station.operations.length - 3}</div>}</>) : (<div className={`text-[10px] italic ${isOverridden ? 'text-purple-500 font-bold' : (isSpecial ? 'text-slate-400/70' : 'text-slate-300')}`}>{isOverridden ? 'Temps Forcé Manuel' : 'Aucune opération'}</div>)}</div><div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100"><div className="flex flex-col"><span className="text-[8px] font-bold text-slate-400 uppercase">Temps</span><span className={`text-xs font-black ${isActive ? 'text-emerald-600' : (isOverridden ? 'text-purple-600' : 'text-slate-700')}`}>{timeInSeconds}s</span></div><div className="flex flex-col items-end"><span className="text-[8px] font-bold text-slate-400 uppercase">Op.</span><span className={`text-[10px] font-black px-1.5 rounded ${station.operators > 1 ? 'bg-amber-100 text-amber-700' : 'bg-white text-slate-600 border border-slate-100 shadow-sm'}`}>{station.operators}</span></div></div></div>
              <div className="absolute bottom-0 left-0 h-0.5 bg-slate-200 w-full"><div className={`h-full ${isActive ? 'bg-emerald-400' : (isFer ? 'bg-rose-500' : (isControl ? 'bg-orange-500' : (isFinition ? 'bg-purple-500' : 'bg-indigo-500')))}`} style={{ width: `${Math.min(station.saturation, 100)}%` }}></div></div>
          </div>
      );
  };

  return (
    <div className="flex flex-col h-full gap-4 relative">
       
       {/* 1. SINGLE ROW HEADER - RESPONSIVE */}
       <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-4 p-2 flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
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

       {/* 1. TOP TOOLBAR (REDESIGNED: Single Line Compact) */}
       <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1.5 flex flex-nowrap items-center justify-between gap-3 overflow-x-auto shrink-0 z-30 mb-2 no-scrollbar">
           {/* Left Group: Layout Selectors & Toggle */}
           <div className="flex items-center gap-2 shrink-0">
               <div className="flex items-center bg-slate-50 p-0.5 rounded-lg border border-slate-200">
                   <button onClick={() => setLayoutType('zigzag')} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all whitespace-nowrap flex items-center gap-1 ${layoutType === 'zigzag' ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-indigo-100' : 'text-slate-500 hover:text-slate-700'}`}><AlignJustify className="w-3 h-3" /> U (2 Lines)</button>
                   <button onClick={() => setLayoutType('snake')} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all whitespace-nowrap flex items-center gap-1 ${layoutType === 'snake' ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-indigo-100' : 'text-slate-500 hover:text-slate-700'}`}><Layers className="w-3 h-3" /> Serpent</button>
                   <button onClick={() => setLayoutType('grid')} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all whitespace-nowrap flex items-center gap-1 ${layoutType === 'grid' ? 'bg-white shadow-sm text-indigo-600 ring-1 ring-indigo-100' : 'text-slate-500 hover:text-slate-700'}`}><GridIcon className="w-3 h-3" /> Grille</button>
               </div>
               <button onClick={() => setOrientation(prev => prev === 'landscape' ? 'portrait' : 'landscape')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border whitespace-nowrap ${orientation === 'portrait' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{orientation === 'landscape' ? 'Horizontale' : 'Verticale'}</button>
           </div>
           <div className="h-6 w-px bg-slate-200 shrink-0"></div>
           {/* Center Group: Zoom Controls */}
           <div className="flex items-center gap-0.5 bg-slate-50 p-0.5 rounded-lg border border-slate-200 shrink-0">
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1 hover:bg-white rounded text-slate-500 hover:text-indigo-600 transition-colors"><ZoomOut className="w-3 h-3" /></button>
                <span className="text-[9px] font-bold text-slate-400 w-8 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1 hover:bg-white rounded text-slate-500 hover:text-indigo-600 transition-colors"><ZoomIn className="w-3 h-3" /></button>
                <div className="w-px h-3 bg-slate-200 mx-0.5"></div>
                <button onClick={() => setZoom(1)} className="p-1 hover:bg-white rounded text-slate-500 hover:text-indigo-600 transition-colors" title="Réinitialiser"><Maximize className="w-3 h-3" /></button>
           </div>
           <div className="h-6 w-px bg-slate-200 shrink-0"></div>
           {/* Right Group: Tools & Actions */}
           <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setShowMaterialsPanel(!showMaterialsPanel)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border whitespace-nowrap ${showMaterialsPanel ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}><Calculator className="w-3 h-3" /> Matériel</button>
                <button onClick={() => setShowDimensions(!showDimensions)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border whitespace-nowrap ${showDimensions ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}><Ruler className="w-3 h-3" /> Cotations</button>
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                    <button onClick={toggleSimulation} className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold transition-all whitespace-nowrap ${simulationActive ? 'bg-amber-100 text-amber-700' : 'bg-white text-emerald-700 shadow-sm'}`}>{simulationActive ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}{simulationActive ? 'Pause' : 'Simulation'}</button>
                    <button onClick={resetSimulation} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white rounded-md transition-colors"><RotateCcw className="w-3 h-3" /></button>
                </div>
                {canEdit && (
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200 ml-2">
                         <select value={selectedMachineToAdd} onChange={(e) => setSelectedMachineToAdd(e.target.value)} className="bg-transparent text-[10px] font-bold text-slate-700 py-1 pl-2 pr-1 outline-none w-14 truncate cursor-pointer">
                            <option value="MAN">MAN</option>
                            <option value="CONTROLE">CONTROLE</option>
                            <option value="FINITION">FINITION</option>
                            <option value="FER">FER</option>
                            {machines.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                         </select>
                         <button onClick={handleAddPost} className="p-1 bg-white border border-slate-200 rounded text-emerald-600 hover:bg-emerald-50 transition-colors ml-1"><Plus className="w-3 h-3" /></button>
                    </div>
                )}
               <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-[10px] font-bold shadow-sm ml-2 whitespace-nowrap"><Printer className="w-3 h-3" /> Exporter</button>
           </div>
       </div>

       {/* 2. ZONES INDICATOR */}
       <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 flex items-center gap-1 overflow-x-auto text-[10px] font-bold uppercase text-slate-400 shadow-inner shrink-0">
           <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-slate-200 opacity-60 shrink-0"><Package className="w-3 h-3 text-slate-400" /> Stock Tissu</div><ArrowRight className="w-3 h-3 text-slate-300 shrink-0" /><div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-slate-200 opacity-60 shrink-0"><Scissors className="w-3 h-3 text-slate-400" /> Coupe & Prep</div><ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" /><div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-700 shadow-sm shrink-0"><Layers className="w-3 h-3" /> Montage (Atelier)</div><ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
           <div className="flex items-center gap-3">
             {swapControlFinition ? (
                <>
                    <SpecialZoneControl label="Contrôle" type="CONTROLE" icon={Eye} color={{ bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', hoverBg: 'hover:bg-orange-100' }} currentCount={postes?.filter(p => p.machine.toUpperCase().includes('CONTROLE')).length || 0} onAdd={handleAddSpecial} onRemove={handleRemoveSpecial} />
                    <button onClick={handleSwapZones} className="p-1 hover:bg-slate-200 rounded-full transition-colors shrink-0 transform active:rotate-180 duration-300" title="Inverser ordre"><ArrowRightLeft className="w-3 h-3 text-slate-400" /></button>
                    <SpecialZoneControl label="Finition" type="FINITION" icon={Sparkles} color={{ bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', hoverBg: 'hover:bg-purple-100' }} currentCount={postes?.filter(p => p.machine.toUpperCase().includes('FINITION')).length || 0} onAdd={handleAddSpecial} onRemove={handleRemoveSpecial} />
                </>
             ) : (
                <>
                    <SpecialZoneControl label="Finition" type="FINITION" icon={Sparkles} color={{ bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', hoverBg: 'hover:bg-purple-100' }} currentCount={postes?.filter(p => p.machine.toUpperCase().includes('FINITION')).length || 0} onAdd={handleAddSpecial} onRemove={handleRemoveSpecial} />
                    <button onClick={handleSwapZones} className="p-1 hover:bg-slate-200 rounded-full transition-colors shrink-0 transform active:rotate-180 duration-300" title="Inverser ordre"><ArrowRightLeft className="w-3 h-3 text-slate-400" /></button>
                    <SpecialZoneControl label="Contrôle" type="CONTROLE" icon={Eye} color={{ bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', hoverBg: 'hover:bg-orange-100' }} currentCount={postes?.filter(p => p.machine.toUpperCase().includes('CONTROLE')).length || 0} onAdd={handleAddSpecial} onRemove={handleRemoveSpecial} />
                </>
             )}
           </div>
           <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" /><div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-slate-200 opacity-60 shrink-0"><Truck className="w-3 h-3 text-slate-400" /> Expédition</div>
       </div>

       {/* 3. CANVAS */}
       <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 relative">
           <div className="flex-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner relative overflow-hidden flex flex-col">
               <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
               <div className="flex-1 overflow-auto p-8 relative z-10 custom-scrollbar flex flex-col items-start pl-8">
                   <div className={`transition-transform duration-200 ease-out origin-top-left ${layoutType === 'grid' ? 'w-full' : 'min-w-max'}`} style={{ transform: `scale(${zoom})` }}>
                   {layoutType === 'zigzag' && (
                       <div className={`flex gap-4 pb-20 min-w-max ${orientation === 'landscape' ? 'flex-col items-start' : 'flex-row items-start pl-4'}`}>
                           <div className={`flex shrink-0 ${orientation === 'landscape' ? 'flex-row pl-12 mb-4 w-full' : 'flex-col pt-12 mr-4 w-12 gap-16'}`}>
                               {zigZagPairs.map((pair, idx) => (
                                   <div key={idx} className={`flex items-center justify-center text-[10px] font-black text-slate-300 uppercase ${orientation === 'landscape' ? 'w-56 text-center' : 'h-40 -rotate-90'}`}>
                                       {orientation === 'landscape' ? `Col ${idx + 1}` : `Rang ${idx + 1}`}
                                   </div>
                               ))}
                           </div>
                           <div className={`flex items-start gap-8 ${orientation === 'landscape' ? 'flex-row' : 'flex-col'}`}>
                               {zigZagPairs.map((pair, i) => {
                                   const isLastCol = i === zigZagPairs.length - 1;
                                   const topIdx = pair.top.originalIndex;
                                   const botIdx = pair.bottom?.originalIndex;
                                   return (
                                       <div key={i} className={`flex gap-0 relative ${orientation === 'landscape' ? 'flex-col' : 'flex-row items-center'}`}>
                                           {showDimensions && (<div className={`absolute ${orientation === 'landscape' ? '-top-6 left-1/2 -translate-x-1/2 w-0.5 h-[150%]' : 'left-1/2 top-1/2 -translate-y-1/2 h-0.5 w-[150%]'} bg-yellow-400/30 z-0`}></div>)}
                                           <div className="relative">
                                               <StationCard station={pair.top} />
                                               {showDimensions && <div className="absolute -top-5 left-0 w-full text-center text-[8px] font-bold text-yellow-600 bg-yellow-50 rounded">Rail Élec.</div>}
                                           </div>
                                           <div className={`${orientation === 'landscape' ? 'h-40 flex-col py-1' : 'w-24 flex-row px-1'} relative flex items-center justify-center`}>
                                                {pair.bottom && (orientation === 'landscape' ? <ConnectorVertical active={simStep === topIdx} passed={simStep > topIdx} /> : <ConnectorHorizontal active={simStep === topIdx} passed={simStep > topIdx} />)}
                                                {showDimensions && (<div className={`absolute ${orientation === 'landscape' ? 'right-full top-1/2 -translate-y-1/2 mr-2 h-full' : 'bottom-full left-1/2 -translate-x-1/2 mb-2 w-full'} flex items-center justify-center`}>{orientation === 'landscape' ? <DimensionMarkerVertical label="2.00m (Couloir)" height="h-32" /> : <DimensionMarkerHorizontal label="2.00m" />}</div>)}
                                                {pair.bottom && !isLastCol && (orientation === 'landscape' ? <ConnectorDiagonal active={simStep === botIdx} passed={simStep > botIdx} /> : <ConnectorVerticalLong active={simStep === botIdx} passed={simStep > botIdx} />)}
                                                {!pair.bottom && !isLastCol && orientation === 'landscape' && (<div className="absolute top-0 right-0 w-full h-full border-t-2 border-dashed border-slate-300 transform rotate-12 origin-top-left"></div>)}
                                           </div>
                                           <div className="relative">
                                               {pair.bottom ? (<><StationCard station={pair.bottom} />{showDimensions && !isLastCol && (<div className={`absolute ${orientation === 'landscape' ? 'top-1/2 -right-8 w-8 h-px' : 'left-1/2 -bottom-8 h-8 w-px'} bg-slate-300 flex items-center justify-center`}><div className={`text-[8px] bg-slate-100 text-slate-500 font-bold px-1 rounded ${orientation === 'landscape' ? 'transform -rotate-90' : ''}`}>1.2m</div></div>)}</>) : (<div className="w-44 sm:w-48 h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-300 font-bold uppercase">Zone Tampon</div>)}
                                           </div>
                                           {showDimensions && !isLastCol && (<div className={`absolute ${orientation === 'landscape' ? 'top-1/2 -right-8 w-8' : 'left-1/2 -bottom-8 h-8'}`}>{orientation === 'landscape' ? <DimensionMarkerHorizontal label="0.6m" /> : <DimensionMarkerVertical label="0.6m" />}</div>)}
                                       </div>
                                   );
                               })}
                               <div className={`flex flex-col justify-end h-full pb-10 pl-4 ${orientation === 'landscape' ? '' : 'pt-10'}`}>
                                   <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-lg shadow-lg">
                                       <Truck className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Expédition</span>
                                   </div>
                               </div>
                           </div>
                       </div>
                   )}
                   {layoutType === 'snake' && (
                       <div className="flex flex-col gap-0">
                           {snakeRows.map((rowItems, rowIndex) => {
                               const isEvenRow = rowIndex % 2 === 0;
                               const isLastRow = rowIndex === snakeRows.length - 1;
                               return (
                                   <React.Fragment key={rowIndex}>
                                       <div className={`flex items-center gap-0 ${isEvenRow ? 'flex-row' : 'flex-row-reverse'}`}>
                                           {rowItems.map((st, i) => { const isLastInRow = i === rowItems.length - 1; return (<React.Fragment key={st.id}><StationCard station={st} />{!isLastInRow && (<div className="w-8 h-1 bg-slate-200"></div>)}</React.Fragment>); })}
                                       </div>
                                       {!isLastRow && <div className="h-8 w-1 bg-slate-200 ml-10"></div>}
                                   </React.Fragment>
                               );
                           })}
                       </div>
                   )}
                   {layoutType === 'grid' && (
                       <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                           {workstations.map(st => <StationCard key={st.id} station={st} isGrid={true} />)}
                       </div>
                   )}
                   </div>
               </div>
           </div>
           
           {/* FLOATING MATERIAL PANEL */}
           {showMaterialsPanel && (
                <div className="fixed z-40 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col" style={{ left: matPanel.x, top: matPanel.y, width: matPanel.w, height: matPanel.h }}>
                    <div onMouseDown={startDragMat} className="p-4 bg-slate-50 border-b border-slate-100 cursor-move select-none flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm pointer-events-none"><Calculator className="w-4 h-4 text-indigo-500" /> Total Matériel</h3>
                        <button onClick={() => setShowMaterialsPanel(false)} onMouseDown={(e) => e.stopPropagation()} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4"/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        <table className="w-full text-left border-collapse"><tbody>{machinesSummary.counts.map(([name, count]) => (<tr key={name} className="border-b border-slate-50 hover:bg-slate-50"><td className="py-2 px-3 text-xs font-medium text-slate-600">{name}</td><td className="py-2 px-3 text-right"><span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded-full min-w-[24px]">{count}</span></td></tr>))}</tbody></table>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100 relative"><div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-500 uppercase">Total Postes</span><span className="text-lg font-black text-indigo-600">{machinesSummary.total}</span></div><div onMouseDown={startResizeMat} className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-center justify-center opacity-50 hover:opacity-100"><Scaling className="w-4 h-4 text-slate-400 rotate-90" /></div></div>
                </div>
           )}
       </div>

       {/* CONTEXT MENU VIA PORTAL */}
       {contextMenu && createPortal(
           <div ref={contextMenuRef} className="fixed z-[9999] bg-white rounded-xl shadow-2xl border-2 border-purple-600 animate-in fade-in zoom-in-95 duration-150 flex flex-col overflow-hidden" style={{ top: contextMenu.y, left: contextMenu.x, width: contextMenu.width, height: contextMenu.height }}>
               <div onMouseDown={startDragMenu} className="bg-white px-4 py-3 border-b border-purple-100 flex justify-between items-center cursor-move select-none shrink-0"><div className="flex items-center gap-2 pointer-events-none"><PenTool className="w-4 h-4 text-purple-600 fill-purple-100" /><span className="font-bold text-purple-900 text-sm">Modifier Poste</span></div><button onClick={closeContextMenu} className="text-slate-400 hover:text-purple-600" onMouseDown={(e) => e.stopPropagation()}><X className="w-4 h-4" /></button></div>
               <div className="h-0.5 w-full bg-gradient-to-r from-purple-400 to-purple-600 shrink-0"></div>
               <div className="p-5 space-y-4 bg-white flex-1 overflow-y-auto custom-scrollbar">
                   <div className="group"><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider group-focus-within:text-purple-600 transition-colors">Nom du Poste</label><input type="text" value={contextMenu.data.name} onChange={(e) => saveContextChanges({ name: e.target.value })} className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all"/></div>
                   <div className="group"><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider group-focus-within:text-purple-600 transition-colors">Machine</label><input list="ctx-machines" value={contextMenu.data.machine} onChange={(e) => saveContextChanges({ machine: e.target.value })} className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all"/><datalist id="ctx-machines"><option value="MAN">MAN</option><option value="CONTROLE">CONTROLE</option><option value="FINITION">FINITION</option><option value="FER">FER/FINITION</option>{machines.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}</datalist></div>
                   <div className="group"><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1 group-focus-within:text-purple-600 transition-colors"><User className="w-3 h-3" /> Opérateur</label><input type="text" value={contextMenu.data.operatorName || ''} onChange={(e) => saveContextChanges({ operatorName: e.target.value })} placeholder="Nom..." className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all"/></div>
                   <div className="group"><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1 group-focus-within:text-purple-600 transition-colors"><Clock className="w-3 h-3" /> Temps Forcé (Sec)</label><input type="number" step="1" value={contextMenu.data.timeOverride !== undefined ? Math.round(contextMenu.data.timeOverride * 60) : ''} onChange={(e) => { const val = e.target.value === '' ? undefined : Number(e.target.value); saveContextChanges({ timeOverride: val !== undefined ? val / 60 : undefined }); }} placeholder="Auto (Calculé)" className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-purple-700 outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-slate-300" /></div>
                   <div className="group"><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1 group-focus-within:text-purple-600 transition-colors"><Ruler className="w-3 h-3" /> Longueur (cm)</label><input type="number" step="1" value={contextMenu.data.length || ''} onChange={(e) => { const l = Number(e.target.value); const mName = contextMenu.data.machine; const matchedM = machines.find(m => m.name.toUpperCase() === mName.toUpperCase()); const speed = matchedM?.speed || 2500; let newTimeOverride = undefined; if (l > 0) { const sewTime = (l * 4.5) / speed; newTimeOverride = (sewTime * 1.2) + 0.15; } saveContextChanges({ length: l, timeOverride: newTimeOverride }); }} placeholder="Calcul Auto..." className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-slate-300" /></div>
                   <div className="group"><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1 group-focus-within:text-purple-600 transition-colors"><FileText className="w-3 h-3" /> Notes</label><textarea rows={2} value={contextMenu.data.notes || ''} onChange={(e) => saveContextChanges({ notes: e.target.value })} placeholder="Remarques..." className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all resize-none"/></div>
               </div>
               <div onMouseDown={startDragMenu} className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between gap-2 items-center shrink-0 cursor-move relative"><button onClick={deleteFromContext} onMouseDown={(e) => e.stopPropagation()} className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 rounded-lg text-xs font-bold transition-all shadow-sm"><Trash2 className="w-3.5 h-3.5" /> Supprimer</button><button onClick={closeContextMenu} onMouseDown={(e) => e.stopPropagation()} className="flex items-center gap-1 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 rounded-lg text-xs font-bold transition-all shadow-md shadow-purple-200 active:scale-95"><Printer className="w-3.5 h-3.5" /> OK</button><div onMouseDown={startResizeMenu} className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize flex items-center justify-center opacity-50 hover:opacity-100"><Scaling className="w-3 h-3 text-slate-400 rotate-90" /></div></div>
           </div>,
           document.body
       )}
    </div>
  );
}