
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Operation, Poste, Machine, ComplexityFactor, StandardTime } from '../types';
import ExcelInput from './ExcelInput';
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
  Percent, 
  Minimize, 
  List, 
  Link as LinkIcon, 
  GitMerge, 
  GitCommit, 
  Flower2, 
  ArrowDownToLine, 
  LayoutDashboard, 
  Inbox,
  AlertTriangle,
  ArrowLeftRight as SwapIcon,
  ListPlus,
  AlignHorizontalSpaceAround,
  AlignVerticalSpaceAround,
  Bot,
  Hand,
  Save,
  RefreshCw,
  Edit,
  Link2,
  Unlink2,
  LayoutGrid,
  SquareDashed,
  Magnet,
  ListOrdered
} from 'lucide-react';

interface ImplantationProps {
  bf: number;
  operations: Operation[];
  setOperations: React.Dispatch<React.SetStateAction<Operation[]>>;
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
  // Calculation Params
  speedFactors: any[];
  complexityFactors: ComplexityFactor[];
  standardTimes: StandardTime[];
  fabricSettings: any;
  // Actions
  onSave?: () => void;
}

// --- GROUP COLOR PALETTE (IMPORTED FROM GAMME/BALANCING) ---
const GROUP_COLORS = [
  { bg: 'bg-indigo-50', border: 'border-indigo-500', text: 'text-indigo-700' },
  { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-700' },
  { bg: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-700' },
  { bg: 'bg-rose-50', border: 'border-rose-500', text: 'text-rose-700' },
  { bg: 'bg-cyan-50', border: 'border-cyan-500', text: 'text-cyan-700' },
  { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-700' },
  { bg: 'bg-violet-50', border: 'border-violet-500', text: 'text-violet-700' },
  { bg: 'bg-lime-50', border: 'border-lime-500', text: 'text-lime-700' },
  { bg: 'bg-fuchsia-50', border: 'border-fuchsia-500', text: 'text-fuchsia-700' },
  { bg: 'bg-teal-50', border: 'border-teal-500', text: 'text-teal-700' },
  { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700' },
  { bg: 'bg-sky-50', border: 'border-sky-500', text: 'text-sky-700' },
];

const getGroupStyle = (groupId: string) => {
    if (!groupId) return null;
    let hash = 0;
    for (let i = 0; i < groupId.length; i++) {
        hash = groupId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % GROUP_COLORS.length;
    return GROUP_COLORS[index];
};

// --- COLOR PALETTE (SYNCHRONIZED WITH BALANCING) ---
const POSTE_COLORS = [
  { name: 'indigo',  bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-700',  badge: 'bg-indigo-100',  fill: '#6366f1', badgeText: 'text-indigo-800' },
  { name: 'orange',  bg: 'bg-orange-50',  border: 'border-orange-200',  text: 'text-orange-700',  badge: 'bg-orange-100',  fill: '#f97316', badgeText: 'text-orange-800' },
  { name: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100', fill: '#10b981', badgeText: 'text-emerald-800' },
  { name: 'rose',    bg: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-700',    badge: 'bg-rose-100',    fill: '#f43f5e', badgeText: 'text-rose-800' },
  { name: 'cyan',    bg: 'bg-cyan-50',    border: 'border-cyan-200',    text: 'text-cyan-700',    badge: 'bg-cyan-100',    fill: '#06b6d4', badgeText: 'text-cyan-800' },
  { name: 'amber',   bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   badge: 'bg-amber-100',   fill: '#f59e0b', badgeText: 'text-amber-800' },
  { name: 'violet',  bg: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-700',  badge: 'bg-violet-100',  fill: '#8b5cf6', badgeText: 'text-violet-800' },
  { name: 'lime',    bg: 'bg-lime-50',    border: 'border-lime-200',    text: 'text-lime-700',    badge: 'bg-lime-100',    fill: '#84cc16', badgeText: 'text-lime-800' },
  { name: 'fuchsia', bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', text: 'text-fuchsia-700', badge: 'bg-fuchsia-100', fill: '#d946ef', badgeText: 'text-fuchsia-800' },
  { name: 'teal',    bg: 'bg-teal-50',    border: 'border-teal-200',    text: 'text-teal-700',    badge: 'bg-teal-100',    fill: '#14b8a6', badgeText: 'text-teal-800' },
  { name: 'red',     bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-700',     badge: 'bg-red-100',     fill: '#ef4444', badgeText: 'text-red-800' },
  { name: 'sky',     bg: 'bg-sky-50',     border: 'border-sky-200',     text: 'text-sky-700',     badge: 'bg-sky-100',     fill: '#0ea5e9', badgeText: 'text-sky-800' },
];

const SPECIAL_COLORS = {
  controle: { name: 'orange', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', fill: '#f97316', badge: 'bg-orange-100', badgeText: 'text-orange-800' }, 
  fer:      { name: 'rose',   bg: 'bg-rose-100',  border: 'border-rose-300',   text: 'text-rose-800',   fill: '#e11d48', badge: 'bg-rose-200', badgeText: 'text-rose-900' },
  finition: { name: 'purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', fill: '#a855f7', badge: 'bg-purple-100', badgeText: 'text-purple-800' },
  vide:     { name: 'vide',   bg: 'bg-transparent',  border: 'border-slate-300 border-2 border-dashed', text: 'text-slate-400', fill: 'transparent', badge: 'bg-slate-100', badgeText: 'text-slate-500' },
};

const getPosteColor = (index: number, machineName: string, colorName?: string) => {
  // 0. Empty Slot Check
  if (machineName === 'VIDE') return SPECIAL_COLORS.vide;

  // 1. Priority: Persistent Color Name (from Balancing)
  if (colorName) {
      const found = POSTE_COLORS.find(c => c.name === colorName);
      if (found) return found;
  }

  // 2. Fallback: Special Machines
  const name = machineName.toUpperCase();
  if (name.includes('CONTROL') || name.includes('CONTROLE')) return SPECIAL_COLORS.controle;
  if (name.includes('FER') || name.includes('REPASSAGE')) return SPECIAL_COLORS.fer;
  if (name.includes('FINITION')) return SPECIAL_COLORS.finition;
  
  // 3. Fallback: Index
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
  groups: string[]; // List of Group IDs present in this station
  // Flow properties
  feedsInto?: string; // ID of station this station feeds into
  isFeeder?: boolean; // True if this station feeds another
  targetStationName?: string; // For display
  gammeOrderMin: number; // The lowest operation order in this station (for sorting fallback)
  // Manual Assignment
  isPlaced?: boolean;
  status?: 'ok' | 'panne'; // New Status
}

// ... (Connectors components remain the same) ...
const ConnectorVertical = ({ active = false, passed = false }) => {
    return null;
};
const ConnectorHorizontal = ({ active = false, passed = false }) => {
    return null;
};
const ConnectorDiagonal = ({ active = false, passed = false }) => {
    return null;
};
const ConnectorVerticalLong = ({ active = false, passed = false }) => {
    return null;
};

const DimensionMarkerHorizontal = ({ label }: { label: string }) => (
    <div className="flex flex-col items-center w-full px-2 opacity-70 scale-90">
        <div className="flex items-center w-full text-[8px] text-slate-500 font-mono font-bold whitespace-nowrap">
            <div className="h-1.5 w-px bg-slate-400"></div>
            <div className="h-px bg-slate-400 flex-1 relative"><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[140%] bg-white px-0.5">{label}</span></div>
            <div className="h-1.5 w-px bg-slate-400"></div>
        </div>
    </div>
);
const DimensionMarkerVertical = ({ label, height = 'h-full' }: { label: string, height?: string }) => (
    <div className={`flex flex-row items-center justify-center ${height} opacity-70 scale-90`}>
        <div className="flex flex-col items-center h-full text-[8px] text-slate-500 font-mono font-bold whitespace-nowrap">
            <div className="w-1.5 h-px bg-slate-400"></div>
            <div className="w-px bg-slate-400 flex-1 relative"><span className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-[140%] bg-white py-0.5 rotate-90">{label}</span></div>
            <div className="w-1.5 h-px bg-slate-400"></div>
        </div>
    </div>
);
const SpecialZoneControl = ({ label, type, icon: Icon, color, currentCount, onAdd, onRemove }: any) => (
    <div className={`flex items-center gap-2 px-2 py-0.5 rounded-lg border ${color.bg} ${color.border} shadow-sm transition-colors`}>
        <div className={`flex items-center gap-1 ${color.text}`}><Icon className="w-3 h-3" /><span className="text-[9px] font-bold uppercase">{label}</span></div>
        <div className="flex items-center bg-white rounded border border-slate-200 overflow-hidden shadow-sm">
             <button onClick={() => onRemove(type)} className="p-0.5 hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-colors border-r border-slate-100"><Minus className="w-2.5 h-2.5" /></button>
             <span className="w-5 text-center text-[9px] font-bold text-slate-700">{currentCount}</span>
             <button onClick={() => onAdd(type)} className="p-0.5 hover:bg-slate-100 text-slate-400 hover:text-emerald-500 transition-colors"><Plus className="w-2.5 h-2.5" /></button>
        </div>
    </div>
);

export default function Implantation({ 
    bf, 
    operations, 
    setOperations,
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
    machines,
    speedFactors,
    complexityFactors,
    standardTimes,
    fabricSettings,
    onSave
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
  const [layoutType, setLayoutType] = useState<'zigzag' | 'snake' | 'grid' | 'wheat'>('zigzag'); // Forced zigzag as main
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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const matDragStart = useRef({ x: 0, y: 0, w: 0, h: 0, startX: 0, startY: 0 });
  
  // MANUAL ASSIGNMENT STATE
  const [isManualMode, setIsManualMode] = useState(false);
  const [groupDragMode, setGroupDragMode] = useState(true); // Toggle for dragging whole groups
  const [saveSuccess, setSaveSuccess] = useState(false);
  // NEW: Magnetic Mode State (Default False for Freedom)
  const [isMagnetic, setIsMagnetic] = useState(false);

  // --- SWAP & CONTEXT MENU STATES ---
  const [swapSourceId, setSwapSourceId] = useState<string | null>(null); // For "Swap Post" feature
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    station: Workstation | null;
  } | null>(null);

  // MODIFIED: Context Menu is now primarily for location, but triggers a Center Modal
  const [editModal, setEditModal] = useState<{ 
      isOpen: boolean; 
      stationIndex: number; 
      data: Poste; 
      color: typeof POSTE_COLORS[0];
      operators: number;
  } | null>(null);
  
  // DELETE CONFIRMATION STATE
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canEdit = !!setPostes && !!postes && postes.length > 0;
  
  // Refs
  const fullscreenWrapperRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Close context menu on click elsewhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // --- NATIVE FULLSCREEN LOGIC ---
  const toggleFullScreen = () => {
      if (!document.fullscreenElement) {
          if (fullscreenWrapperRef.current) {
              fullscreenWrapperRef.current.requestFullscreen().catch((err) => {
                  console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
              });
          }
      } else {
          document.exitFullscreen();
      }
  };

  useEffect(() => {
      const handleFullScreenChange = () => {
          setIsFullScreen(!!document.fullscreenElement);
      };
      document.addEventListener('fullscreenchange', handleFullScreenChange);
      return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  // --- MOUSE WHEEL ZOOM LOGIC ---
  useEffect(() => {
      const handleWheel = (e: WheelEvent) => {
          if (e.ctrlKey) {
              e.preventDefault();
              const delta = e.deltaY > 0 ? -0.1 : 0.1;
              setZoom(prev => Math.min(2, Math.max(0.5, prev + delta)));
          }
      };
      
      const container = scrollContainerRef.current;
      if (container) {
          container.addEventListener('wheel', handleWheel, { passive: false });
      }
      return () => {
          if (container) container.removeEventListener('wheel', handleWheel);
      };
  }, []);

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
      const handleMouseUp = () => { setIsDraggingMat(false); setIsResizingMat(false); };
      if (isDraggingMat || isResizingMat) { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); }
      return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [isDraggingMat, isResizingMat]);

  // --- LOGIC FOR RE-CALCULATING TIME ON EDIT ---
  // Reusing logic similar to Gamme.tsx but contained
  const calculateOpTimeForEdit = (op: Operation) => {
      const machine = machines.find(m => m.id === op.machineId) || machines.find(m => (m.name || '').toLowerCase() === (op.machineName || '').toLowerCase());
      const machineNameUpper = (machine?.name || op.machineName || 'MAN').toUpperCase();
      const isMan = machineNameUpper === 'MAN' || machineNameUpper.includes('MANUEL');
      
      const isCounterMachine = 
          machineNameUpper.includes('BOUTON') || 
          machineNameUpper.includes('BRIDE') || 
          machineNameUpper.includes('BARTACK') || 
          machineNameUpper.includes('TROU') || 
          machineNameUpper.includes('OEILLET') ||
          machineNameUpper.includes('POSE');

      // Get cycle time
      const getStandardCycleTime = (mName: string) => {
          const name = (mName || '').toLowerCase();
          const matchedStd = standardTimes.find(s => {
              const label = (s.label || '').toLowerCase();
              if (name.includes('bouton') && (label.includes('bouton') || label.includes('botonière'))) return true;
              if (name.includes('botonière') && (label.includes('bouton') || label.includes('botonière'))) return true;
              if (name.includes('bride') && label.includes('bride')) return true;
              if (name.includes('bartack') && (label.includes('bartack') || label.includes('bride'))) return true;
              if (name.includes('oeillet') && label.includes('oeillet')) return true;
              return false;
          });
          if (matchedStd) return matchedStd.unit === 'sec' ? matchedStd.value / 60 : matchedStd.value;
          if (name.includes('bouton') || name.includes('botonière')) return 4/60; 
          if (name.includes('bride')) return 4/60; 
          return 0.15;
      };

      const L = parseFloat(String(op.length)) || 0;
      const stitchLengthMm = op.stitchCount !== undefined ? parseFloat(String(op.stitchCount)) : 4; 
      const rpm = parseFloat(String(op.rpm)) || (machine?.speed || 2500);
      const speedFact = parseFloat(String(op.speedFactor)) || (machine?.speedMajor || 1.01);
      const guideFact = op.guideFactor !== undefined && op.guideFactor !== 0 ? parseFloat(String(op.guideFactor)) : (isCounterMachine ? 1.0 : 1.1);
      const endPrecision = op.endPrecision !== undefined ? parseFloat(String(op.endPrecision)) : (isMan ? 0 : 0.01);
      const stop = op.startStop !== undefined ? parseFloat(String(op.startStop)) : (isMan ? 0 : 0.01);
      const maj = parseFloat(String(op.majoration)) || (machine?.cofs || 1.12);

      let tMac = 0;
      if (!isMan) {
          if (isCounterMachine) {
             const quantity = L;
             const cycleTimePerUnit = getStandardCycleTime(machine?.name || op.machineName || ''); 
             tMac = (quantity * cycleTimePerUnit) * guideFact;
          } else if (rpm > 0) {
             const density = stitchLengthMm > 0 ? 10 / stitchLengthMm : 4;
             const baseSewing = (L * density) / rpm;
             tMac = (baseSewing * speedFact * guideFact) + endPrecision + stop;
          }
      }

      let tMan = parseFloat(String(op.manualTime));
      if (tMac > 0 && (!tMan || tMan === 0)) {
         if (L > 0 || isCounterMachine) {
             if (isCounterMachine) tMan = 0.18;
             else tMan = Number(Math.max(0.15, L * 0.005).toFixed(2)); 
         } else {
             tMan = 0.18; 
         }
      } else if (!tMan) {
         tMan = 0;
      }
      
      let fabricPenalty = 0;
      if (fabricSettings && fabricSettings.enabled) {
          const penaltySec = fabricSettings.values[fabricSettings.selected];
          fabricPenalty = penaltySec / 60; 
      }

      const totalMin = ((tMac + tMan) * maj) + fabricPenalty;
      return totalMin;
  };

  const handleUpdateOperation = (opId: string, field: keyof Operation, value: any) => {
      setOperations(prev => prev.map(op => {
          if (op.id !== opId) return op;
          
          let updatedOp = { ...op, [field]: value };
          
          // If editing forcedTime, don't recalculate
          if (field === 'forcedTime') {
              updatedOp.time = value; // assuming forcedTime overrides
          } else {
              if (field !== 'description' && field !== 'guideName') {
                  updatedOp.forcedTime = undefined; // clear forced time if params change
              }
              // Machine Change Logic
              if (field === 'machineName') {
                  const m = machines.find(mac => (mac.name || '').toLowerCase() === (value || '').toLowerCase());
                  updatedOp.machineId = m ? m.id : '';
              }
              updatedOp.time = calculateOpTimeForEdit(updatedOp);
          }
          return updatedOp;
      }));
  };

  // --- INTELLIGENT SORTING & LINKING ---
  const workstations = useMemo(() => {
    if (postes && postes.length > 0 && assignments) {
        
        let initialStations: Workstation[] = postes.map((p, realIndex) => {
             let totalTime = 0; let saturation = 0; let operators = 1;
             // Match operations to this post OR its original parent group if split
             const assignedOps = operations.filter(op => assignments[op.id]?.some(aid => aid === p.id || (p.originalId && aid === p.originalId)));
             const groups = [...new Set(assignedOps.map(op => op.groupId).filter(Boolean) as string[])];
             const gammeOrderMin = assignedOps.length > 0 ? Math.min(...assignedOps.map(o => o.order)) : 9999;

             if (p.timeOverride !== undefined) {
                 totalTime = p.timeOverride;
                 // If overriding, we assume it's set for this specific post
                 if (bf > 0) {
                     const nTheo = totalTime / bf;
                     operators = 1; // For manual mode override, usually 1
                     saturation = (totalTime / bf) * 100;
                 }
             } else {
                 assignedOps.forEach(op => { 
                     // Check how many posts share this operation ID (including split ones)
                     // If p.originalId is set, it means we split the post. 
                     // We count how many posts share this originalId.
                     let sharingCount = 1;
                     if (p.originalId) {
                         sharingCount = postes.filter(x => x.originalId === p.originalId).length;
                     } else {
                         sharingCount = assignments[op.id]?.length || 1;
                     }
                     
                     totalTime += (op.time || 0) / sharingCount; 
                 });
                 
                 const nTheo = bf > 0 ? totalTime / bf : 0;
                 operators = nTheo > 1.15 ? Math.ceil(nTheo) : (nTheo > 0 ? 1 : 0);
                 
                 // If it's a split post (physical unit), force operators to 1 but show saturation
                 if (p.originalId) {
                     operators = 1; 
                 }
                 
                 saturation = (operators > 0 && bf > 0) ? (totalTime / (operators * bf)) * 100 : 0;
             }
             operators = Math.max(1, operators);
             // Use stored color name if available to keep color fixed during moves
             // MODIFIED: Use number from name if possible to keep color consistent during moves
             const pNum = parseInt(p.name.replace(/^P/i, ''));
             const effectiveIndex = !isNaN(pNum) ? pNum - 1 : realIndex;
             const color = getPosteColor(effectiveIndex, p.machine, p.colorName);
             
             let feedsInto: string | undefined = undefined;
             let isFeeder = false;
             
             for (const op of assignedOps) {
                 if (op.targetOperationId) {
                     const targetStation = postes.find(st => assignments[op.targetOperationId!]?.includes(st.id));
                     if (targetStation && targetStation.id !== p.id) {
                         feedsInto = targetStation.id;
                         isFeeder = true;
                         break; 
                     }
                 }
             }

             const isBroken = p.notes?.includes('#PANNE');
             
             return { ...p, index: 0, originalIndex: realIndex, operations: assignedOps, totalTime, saturation, operators, color, groups, feedsInto, isFeeder, gammeOrderMin, isPlaced: p.isPlaced, status: isBroken ? 'panne' : 'ok' };
        });

        const sortedStations = [...initialStations]; 

        // Expand by Operators (ONLY IF NOT SPLIT ALREADY)
        const expandedResult: Workstation[] = [];
        sortedStations.forEach((st, idx) => {
            // IF MANUAL MODE: Only show if isPlaced is true
            const showOnCanvas = isManualMode ? (st.isPlaced === true) : true;
            
            if (showOnCanvas) {
                // If it is a split post (physical), don't expand further.
                if (st.originalId) {
                    expandedResult.push({
                         ...st,
                         index: expandedResult.length + 1,
                         // Keep calculated totalTime (already divided in map above)
                         isPlaced: true
                     });
                } else {
                    // For logical groups (Auto Mode or consolidated), expand visually
                    for(let i=1; i<=st.operators; i++) {
                         expandedResult.push({
                             ...st,
                             id: `${st.id}__${i}`, 
                             name: st.operators > 1 ? `${st.name.replace('P','').split('.')[0]}.${i}` : st.name,
                             index: expandedResult.length + 1,
                             totalTime: st.totalTime / st.operators,
                             isPlaced: true
                         });
                    }
                }
            }
        });

        return expandedResult;
    }
    return [];
  }, [operations, bf, assignments, postes, isManualMode]);

  // Mini-Gamme Data (Stations NOT placed yet)
  const waitingStations = useMemo(() => {
      if (!isManualMode || !postes) return [];
      
      // Filter stations where isPlaced is falsy (undefined or false)
      // Exclude 'VIDE' stations from waiting list
      return postes.filter(p => !p.isPlaced && p.machine !== 'VIDE').map((p, idx) => {
          const assignedOps = operations.filter(op => assignments?.[op.id]?.some(aid => aid === p.id || (p.originalId && aid === p.originalId)));
          const groups = [...new Set(assignedOps.map(op => op.groupId).filter(Boolean) as string[])];
          const realIndex = postes.findIndex(station => station.id === p.id);
          
          // MODIFIED: Use number from name if possible
          const pNum = parseInt(p.name.replace(/^P/i, ''));
          const effectiveIndex = !isNaN(pNum) ? pNum - 1 : realIndex;
          const realColor = getPosteColor(effectiveIndex, p.machine, p.colorName);
          
          let totalTime = 0; let saturation = 0; let operators = 1;
          if (p.timeOverride !== undefined) {
                 totalTime = p.timeOverride;
                 if (bf > 0) {
                     operators = 1;
                     saturation = (totalTime / bf) * 100;
                 }
          } else {
             assignedOps.forEach(op => { 
                 let sharingCount = 1;
                 if (p.originalId) {
                     sharingCount = postes.filter(x => x.originalId === p.originalId).length;
                 } else {
                     sharingCount = assignments[op.id]?.length || 1;
                 }
                 totalTime += (op.time || 0) / sharingCount; 
             });
             
             const nTheo = bf > 0 ? totalTime / bf : 0;
             operators = nTheo > 1.15 ? Math.ceil(nTheo) : (nTheo > 0 ? 1 : 0);
             
             if (p.originalId) {
                 operators = 1;
             }
             
             saturation = (operators > 0 && bf > 0) ? (totalTime / (operators * bf)) * 100 : 0;
          }
          operators = Math.max(1, operators);

          return { 
              ...p, 
              operations: assignedOps, 
              color: realColor,
              groups: groups,
              totalTime,
              saturation,
              operators: operators,
              index: 0,
              originalIndex: realIndex // Use REAL index
          } as Workstation;
      }).sort((a, b) => {
          // Sort waiting list by Gamme order
          const minA = a.operations.length > 0 ? Math.min(...a.operations.map(o => o.order)) : 9999;
          const minB = b.operations.length > 0 ? Math.min(...b.operations.map(o => o.order)) : 9999;
          return minA - minB;
      });
  }, [postes, isManualMode, operations, assignments, bf]);

  const compactPostes = () => {
      if (!setPostes || !postes) return;
      const placed = postes.filter(p => p.isPlaced && p.machine !== 'VIDE');
      const unplaced = postes.filter(p => !p.isPlaced && p.machine !== 'VIDE');
      // Generate standard empty slots at the end to keep grid size if wanted
      const emptySlotsNeeded = Math.max(0, 20 - placed.length);
      const empties: Poste[] = Array.from({length: emptySlotsNeeded}).map((_, i) => ({
          id: `empty-auto-${Date.now()}-${i}`,
          name: `Slot`,
          machine: 'VIDE',
          isPlaced: true,
          colorName: 'vide'
      }));
      
      // Update P names
      let pCount = 1;
      const newPlaced = placed.map(p => ({ ...p, name: `P${pCount++}` }));
      
      setPostes([...newPlaced, ...empties, ...unplaced]);
  };

  const renumberStations = () => {
      if (!setPostes || !postes) return;
      
      let pCount = 1;
      const reindexed = postes.map((p) => {
          if (p.isPlaced && p.machine !== 'VIDE') {
              return { ...p, name: `P${pCount++}` };
          }
          return p;
      });
      setPostes(reindexed);
  };

  const toggleMagnetic = () => {
      if (!isMagnetic) {
          // Switching TO Magnetic: Compact everything now
          compactPostes();
      }
      setIsMagnetic(!isMagnetic);
  };

  const handleManualDrop = (stationId: string) => {
      // Find the poste and set isPlaced = true
      if (setPostes && postes) {
          // Check if dragging from waiting list
          const stationFromWaiting = postes.find(p => p.id === stationId && !p.isPlaced);
          
          if (stationFromWaiting) {
              // Dragging from Waiting List to Canvas Background
              const newPostes = [...postes];
              const idx = newPostes.findIndex(p => p.id === stationId);
              
              if (idx !== -1) {
                  const item = { ...newPostes[idx], isPlaced: true };
                  newPostes.splice(idx, 1);
                  
                  if (isMagnetic) {
                      // MAGNETIC: Fill first hole or append compactly
                      const firstEmptySlotIdx = newPostes.findIndex(p => p.machine === 'VIDE' && p.isPlaced);
                      if (firstEmptySlotIdx !== -1) {
                          newPostes[firstEmptySlotIdx] = item;
                      } else {
                          // Insert before first unplaced
                          const placed = newPostes.filter(p => p.isPlaced);
                          const unplaced = newPostes.filter(p => !p.isPlaced);
                          newPostes.splice(0, newPostes.length, ...placed, item, ...unplaced);
                      }
                  } else {
                      // FREE MODE FIX:
                      // Try to place in the first available empty slot (VIDE) to avoid appending to end
                      // This mimics "dropping on the grid" even if they miss a specific card
                      const firstVideIndex = newPostes.findIndex(p => p.isPlaced && p.machine === 'VIDE');
                      
                      if (firstVideIndex !== -1) {
                          newPostes[firstVideIndex] = item;
                      } else {
                          // No empty slot, append to end of placed list
                          const placed = newPostes.filter(p => p.isPlaced);
                          const unplaced = newPostes.filter(p => !p.isPlaced);
                          newPostes.splice(0, newPostes.length, ...placed, item, ...unplaced);
                      }
                  }
                  
                  setPostes(newPostes);
              }
          }
      }
  };

  const handleRemoveFromCanvas = (stationIdBase: string) => {
      if (setPostes && postes) {
          const idx = postes.findIndex(p => p.id === stationIdBase);
          if (idx !== -1) {
              const newPostes = [...postes];
              const itemToRemove = { ...newPostes[idx], isPlaced: false };
              
              if (isMagnetic) {
                  // MAGNETIC: Remove and shift up (Close the gap)
                  newPostes.splice(idx, 1);
                  // Add item back to unplaced list
                  newPostes.push(itemToRemove);
                  // Ensure we maintain grid size if needed? Or just let it shrink.
                  // Usually better to append a new VIDE at end to keep grid size.
                  const videItem: Poste = {
                      id: `empty-auto-fill-${Date.now()}`,
                      name: 'Slot',
                      machine: 'VIDE',
                      isPlaced: true,
                      colorName: 'vide'
                  };
                  // Insert VIDE after last placed item
                  let lastPlacedIdx = -1;
                  for (let i = newPostes.length - 1; i >= 0; i--) {
                      if (newPostes[i].isPlaced) {
                          lastPlacedIdx = i;
                          break;
                      }
                  }
                  newPostes.splice(lastPlacedIdx + 1, 0, videItem);

              } else {
                  // FREE: Replace with VIDE (Leave a hole)
                  const videItem: Poste = {
                      id: `empty-replaced-${Date.now()}`,
                      name: 'Slot',
                      machine: 'VIDE',
                      isPlaced: true,
                      colorName: 'vide'
                  };
                  newPostes[idx] = videItem;
                  newPostes.push(itemToRemove);
              }
              
              setPostes(newPostes);
          }
      }
  };

  // --- SKELETON GENERATION ---
  const generateSkeleton = () => {
      if (!setPostes || !postes) return;
      const currentPlaced = postes.filter(p => p.isPlaced && p.machine !== 'VIDE');
      const waiting = postes.filter(p => !p.isPlaced && p.machine !== 'VIDE');
      
      const skeletonSize = 20; // Generate 20 slots by default
      const emptySlots: Poste[] = [];
      for(let i=0; i<skeletonSize; i++) {
          emptySlots.push({
              id: `empty-${Date.now()}-${i}`,
              name: `P${i+1}`, // Temp name
              machine: 'VIDE',
              isPlaced: true,
              colorName: 'vide'
          });
      }
      
      setPostes([...emptySlots, ...currentPlaced, ...waiting]);
  };
  
  const addSingleEmptySlot = () => {
      if (!setPostes || !postes) return;
      const newSlot: Poste = {
          id: `empty-manual-${Date.now()}`,
          name: 'Slot',
          machine: 'VIDE',
          isPlaced: true,
          colorName: 'vide'
      };
      
      // Insert at end of placed items
      const placed = postes.filter(p => p.isPlaced);
      const unplaced = postes.filter(p => !p.isPlaced);
      setPostes([...placed, newSlot, ...unplaced]);
  };

  // --- ACTIONS ---
  const activateManualMode = () => {
      setIsManualMode(true);
      if (setPostes && postes) {
          const splitPosts: Poste[] = [];
          
          // 1. Process existing real stations - SPLIT IF NEEDED
          const realStations = postes.filter(p => p.machine !== 'VIDE');
          
          realStations.forEach(p => {
              // Calculate operators count for this station
              let totalTime = 0;
              if (p.timeOverride !== undefined) {
                  totalTime = p.timeOverride;
              } else {
                  // Only count if assignment exists
                  const assignedOps = operations.filter(op => assignments?.[op.id]?.includes(p.id));
                  assignedOps.forEach(op => { 
                      const numAssigned = assignments[op.id]?.length || 1; 
                      totalTime += (op.time || 0) / numAssigned; 
                  });
              }
              const nTheo = bf > 0 ? totalTime / bf : 0;
              let operatorCount = nTheo > 1.15 ? Math.ceil(nTheo) : (nTheo > 0 ? 1 : 0);
              operatorCount = Math.max(1, operatorCount);

              // If multiple operators needed, split into separate physical posts
              // Only split if not already split (check originalId)
              if (operatorCount > 1 && !p.originalId) {
                  for (let i = 1; i <= operatorCount; i++) {
                      splitPosts.push({
                          ...p,
                          id: `${p.id}__split__${i}`, // Unique ID for layout
                          originalId: p.id,           // Reference to logical group for data
                          name: `${p.name}.${i}`,
                          isPlaced: false
                      });
                  }
              } else {
                  // Keep as is
                  splitPosts.push({ ...p, isPlaced: false });
              }
          });
          
          // 2. Generate Empty Slots Grid
          const emptySlots: Poste[] = Array.from({ length: 20 }).map((_, i) => ({
              id: `empty-${Date.now()}-${i}`,
              name: `P${i+1}`,
              machine: 'VIDE',
              isPlaced: true,
              colorName: 'vide'
          }));

          // 3. Set Postes: Empties first (Grid), then split/real posts (Waiting List)
          setPostes([...emptySlots, ...splitPosts]);
      }
  };

  const activateAutoMode = () => {
      setIsManualMode(false);
      if (setPostes && postes) {
          const newPostes = postes
              .filter(p => p.machine !== 'VIDE')
              .map(p => ({ ...p, isPlaced: true }));
          setPostes(newPostes);
      }
  };

  const refreshAuto = () => {
      setIsManualMode(false);
      if (setPostes && postes) {
          const newPostes = postes
              .filter(p => p.machine !== 'VIDE')
              .map(p => ({ ...p, isPlaced: true }));
          setPostes(newPostes);
      }
  };

  const saveManualLayout = () => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
  };

  useEffect(() => {
    let interval: any; const totalSteps = Math.max(0, (workstations.length * 2) + 2);
    if (simulationActive) { interval = setInterval(() => { setSimStep(prev => { if (prev >= totalSteps) { setSimulationActive(false); return totalSteps; } return prev + 1; }); }, 500); }
    return () => clearInterval(interval);
  }, [simulationActive, workstations.length]);

  const toggleSimulation = () => { if (simulationActive) { setSimulationActive(false); } else { setSimStep(-1); setSimulationActive(true); } };
  const resetSimulation = () => { setSimulationActive(false); setSimStep(-1); };
  
  // --- ZIGZAG PAIRING ---
  const zigZagPairs = useMemo(() => { 
      const pairs = [];
      const usedIndices = new Set<number>();

      if (isManualMode) {
          // Sequential Pairing for Manual Mode
          // Just take 0,1 then 2,3 etc. from the visible workstations list
          for (let i = 0; i < workstations.length; i += 2) {
              const top = workstations[i];
              const bottom = workstations[i+1]; // might be undefined
              pairs.push({ top, bottom });
          }
      } else {
          // Intelligent Pairing for Auto Mode
          for (let i = 0; i < workstations.length; i++) {
              if (usedIndices.has(i)) continue;
              const current = workstations[i];
              
              let bottomCandidateIndex = -1;
              // Logic for vertical stacking based on Flux
              if (current.isFeeder) {
                  const targetBaseId = current.feedsInto;
                  for (let j = i + 1; j < workstations.length; j++) {
                      if (usedIndices.has(j)) continue;
                      const candidate = workstations[j];
                      const candidateBaseId = candidate.id.split('__')[0];
                      if (candidateBaseId === targetBaseId) {
                          bottomCandidateIndex = j;
                          break; 
                      }
                  }
              }

              if (bottomCandidateIndex !== -1) {
                  pairs.push({ top: current, bottom: workstations[bottomCandidateIndex] });
                  usedIndices.add(i);
                  usedIndices.add(bottomCandidateIndex);
              } else {
                  let nextIndex = i + 1;
                  while (usedIndices.has(nextIndex) && nextIndex < workstations.length) nextIndex++;

                  if (nextIndex < workstations.length) {
                      pairs.push({ top: current, bottom: workstations[nextIndex] });
                      usedIndices.add(i);
                      usedIndices.add(nextIndex);
                  } else {
                      pairs.push({ top: current, bottom: undefined });
                      usedIndices.add(i);
                  }
              }
          }
      }
      return pairs; 
  }, [workstations, isManualMode]);

  // --- SONBOLA (WHEAT) GROUPS ---
  const wheatGroups = useMemo(() => {
      const groups = [];
      let currentGroup: { left: Workstation | null, right: Workstation | null } = { left: null, right: null };
      
      workstations.forEach((st, i) => {
          if (!currentGroup.left) {
              currentGroup.left = st;
          } else {
              currentGroup.right = st;
              groups.push(currentGroup);
              currentGroup = { left: null, right: null };
          }
      });
      
      if (currentGroup.left) {
          groups.push(currentGroup);
      }
      
      return groups;
  }, [workstations]);

  const machinesSummary = useMemo(() => { const summary: Record<string, number> = {}; let total = 0; workstations.forEach(st => { const mName = st.machine.toUpperCase().includes('MAN') ? 'MAN' : st.machine; if (!summary[mName]) summary[mName] = 0; summary[mName] += 1; total += 1; }); return { counts: Object.entries(summary), total }; }, [workstations]);

  // --- DRAG HANDLERS ---
  const handleDragStart = (e: React.DragEvent, index: number, isWaitingList = false, stationId?: string) => { 
      if (isWaitingList && stationId) {
          e.dataTransfer.setData("stationId", stationId);
          e.dataTransfer.effectAllowed = "copy";
      } else if (!canEdit || !isManualMode) {
          // In Auto Mode, dragging is disabled to prevent confusion
          return; 
      } else {
          setDraggedStationIdx(index); 
          e.dataTransfer.effectAllowed = "move"; 
      }
      setEditModal(null); 
  };
  
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  
  const handleDrop = (e: React.DragEvent, targetPosteIdx: number) => { 
      e.preventDefault(); 
      e.stopPropagation(); // Prevents bubbling to container drop zone
      
      const droppedStationId = e.dataTransfer.getData("stationId"); // From waiting list
      
      if (isManualMode && setPostes && postes) {
          let newPostes = [...postes];
          
          // Target ITEM in the main array
          // Note: targetPosteIdx is the index in the original 'postes' array (passed from StationCard's originalIndex)
          const targetItem = newPostes[targetPosteIdx];
          if (!targetItem) return;

          if (droppedStationId) {
              // DROP FROM WAITING LIST
              const waitingStationIdx = newPostes.findIndex(p => p.id === droppedStationId);
              if (waitingStationIdx === -1) return;
              
              const stationToPlace = { ...newPostes[waitingStationIdx], isPlaced: true };
              
              // Remove the waiting station first (it's moving)
              newPostes.splice(waitingStationIdx, 1);
              
              // If we removed an item before our target index, shift target index
              let adjustedTargetIdx = targetPosteIdx;
              if (waitingStationIdx < targetPosteIdx) {
                  adjustedTargetIdx--;
              }

              if (isMagnetic) {
                  // MAGNETIC: Insert and Shift
                  newPostes.splice(adjustedTargetIdx, 0, stationToPlace);
              } else {
                  // FREE MODE:
                  const currentTarget = newPostes[adjustedTargetIdx];
                  if (currentTarget && currentTarget.machine === 'VIDE') {
                      // 1. If target is VIDE, replace it (perfect placement).
                      newPostes[adjustedTargetIdx] = stationToPlace;
                  } else {
                      // 2. If target is occupied, Insert before it (shift others).
                      newPostes.splice(adjustedTargetIdx, 0, stationToPlace);
                  }
              }

          } else if (draggedStationIdx !== null && draggedStationIdx !== undefined) {
              // REORDER ON CANVAS (Drag Source to Target)
              
              const sourceRealIdx = draggedStationIdx;
              if (sourceRealIdx === -1 || sourceRealIdx >= newPostes.length) return;
              if (sourceRealIdx === targetPosteIdx) {
                  setDraggedStationIdx(null);
                  return;
              }
              
              const sourceItem = newPostes[sourceRealIdx];
              const targetSlotItem = newPostes[targetPosteIdx];
              
              if (!sourceItem || !targetSlotItem) return;

              if (isMagnetic) {
                  // MAGNETIC: Standard Reorder (Remove then Insert)
                  newPostes.splice(sourceRealIdx, 1);
                  
                  // If removal affected target index
                  let finalTargetIdx = targetPosteIdx;
                  if (sourceRealIdx < targetPosteIdx) finalTargetIdx--;
                  
                  newPostes.splice(finalTargetIdx, 0, sourceItem);
              } else {
                  // FREE: Strict Swap (A <-> B)
                  // This preserves holes and grid structure
                  newPostes[targetPosteIdx] = sourceItem;
                  newPostes[sourceRealIdx] = targetSlotItem;
              }
          }
          
          setPostes(newPostes);
          setDraggedStationIdx(null);
      }
  };

  const handleAddPost = () => { if (!setPostes || !postes) return; const newId = `P${postes.length + 1}`; const newPoste: Poste = { id: newId, name: newId, machine: selectedMachineToAdd, notes: '', operatorName: '', isPlaced: isManualMode }; setPostes([...postes, newPoste]); };
  const reorderPostes = (list: Poste[], isSwapped: boolean) => { const isControl = (p: Poste) => { const m = p.machine.toUpperCase(); return m.includes('CONTROLE') || m.includes('CONTROL'); }; const isFinition = (p: Poste) => { const m = p.machine.toUpperCase(); return m.includes('FINITION'); }; const control = list.filter(isControl); const finition = list.filter(isFinition); const others = list.filter(p => !isControl(p) && !isFinition(p)); const newOrder = isSwapped ? [...others, ...control, ...finition] : [...others, ...finition, ...control]; return newOrder.map((p, i) => ({ ...p, name: `P${i+1}` })); };
  const handleSwapZones = () => { if (!setPostes || !postes) return; const newState = !swapControlFinition; setSwapControlFinition(newState); setPostes(reorderPostes(postes, newState)); };
  const handleAddSpecial = (type: 'CONTROLE' | 'FINITION') => { if (!setPostes || !postes) return; const newPoste: Poste = { id: `P_${Date.now()}`, name: 'P?', machine: type, notes: '', operatorName: '', isPlaced: isManualMode }; const newList = [...postes, newPoste]; setPostes(reorderPostes(newList, swapControlFinition)); };
  const handleRemoveSpecial = (type: 'CONTROLE' | 'FINITION') => { if (!setPostes || !postes) return; const reversedPostes = [...postes].reverse(); const indexToRemoveReversed = reversedPostes.findIndex(p => { const m = p.machine.toUpperCase(); if (type === 'CONTROLE') return m.includes('CONTROLE') || m.includes('CONTROL'); if (type === 'FINITION') return m.includes('FINITION'); return false; }); if (indexToRemoveReversed !== -1) { const realIndex = postes.length - 1 - indexToRemoveReversed; const newPostes = [...postes]; newPostes.splice(realIndex, 1); setPostes(reorderPostes(newPostes, swapControlFinition)); } };
  
  // --- CONTEXT MENU HANDLERS ---
  const handleContextMenu = (e: React.MouseEvent, station: Workstation) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({
          visible: true,
          x: e.pageX,
          y: e.pageY,
          station: station
      });
  };

  const handleContextAction = (action: string) => {
      if (!contextMenu?.station || !setPostes || !postes) return;
      const currentStation = contextMenu.station;
      const currentIndex = postes.findIndex(p => p.id === currentStation.id.split('__')[0]);

      if (currentIndex === -1) return;

      switch(action) {
          case 'modify':
              handleOpenEditModal(null, currentStation); 
              break;
          case 'swap':
              setSwapSourceId(currentStation.id);
              break;
          case 'insert':
              // Assign a color from the palette based on current length to maintain rotation
              const nextColorIndex = postes.length % POSTE_COLORS.length;
              const assignedColorName = POSTE_COLORS[nextColorIndex].name;
              
              const newPoste: Poste = { 
                  id: `P_${Date.now()}`, 
                  name: 'P?', 
                  machine: 'MAN', 
                  notes: '', 
                  operatorName: '', 
                  isPlaced: isManualMode,
                  colorName: assignedColorName // Assign color immediately
              };
              const newPostesInsert = [...postes];
              newPostesInsert.splice(currentIndex + 1, 0, newPoste);
              setPostes(newPostesInsert.map((p, i) => ({ ...p, name: `P${i + 1}` })));
              break;
          case 'delete':
              if (isManualMode) {
                  // In manual mode, remove from placed stations (back to waiting list)
                  handleRemoveFromCanvas(currentStation.id.split('__')[0]);
              } else {
                  // In auto mode, delete from data
                  const newPostesDel = [...postes];
                  newPostesDel.splice(currentIndex, 1);
                  setPostes(newPostesDel.map((p, i) => ({ ...p, name: `P${i + 1}` })));
              }
              break;
      }
      setContextMenu(null);
  };

  // --- SWAP HANDLING ---
  const handleStationClick = (targetStation: Workstation) => {
      if (swapSourceId && setPostes && postes) {
          if (swapSourceId === targetStation.id) {
              setSwapSourceId(null); 
              return;
          }

          const sourceBaseId = swapSourceId.split('__')[0];
          const targetBaseId = targetStation.id.split('__')[0];
          
          const sourceIndex = postes.findIndex(p => p.id === sourceBaseId);
          const targetIndex = postes.findIndex(p => p.id === targetBaseId);

          if (sourceIndex !== -1 && targetIndex !== -1) {
              const newPostes = [...postes];
              const sourceItem = newPostes[sourceIndex];
              const targetItem = newPostes[targetIndex];
              
              newPostes[sourceIndex] = targetItem;
              newPostes[targetIndex] = sourceItem;
              
              const reindexed = newPostes.map((p, i) => ({ ...p, name: `P${i + 1}` }));
              setPostes(reindexed);
          }
          setSwapSourceId(null);
      }
  };

  // MODIFIED: Open centered modal with color and all data
  const handleOpenEditModal = (e: React.MouseEvent | null, station: Workstation) => { 
      if (e) {
          e.preventDefault(); 
          e.stopPropagation();
      }
      if (!canEdit) return; 
      
      const realIdx = postes!.findIndex(p => p.id === station.id.split('__')[0]);
      if (realIdx === -1) return;

      setShowDeleteConfirm(false); 

      setEditModal({
          isOpen: true,
          stationIndex: realIdx,
          data: { ...postes![realIdx] },
          color: station.color,
          operators: station.operators
      });
  };

  const closeEditModal = () => {
      setEditModal(null);
      setShowDeleteConfirm(false);
  };
  
  const saveStationMetadata = (updatedData: Partial<Poste>) => { 
      if (!setPostes || !postes || !editModal) return; 
      
      setEditModal(prev => prev ? ({ ...prev, data: { ...prev.data, ...updatedData } }) : null);
      
      const newPostes = [...postes]; 
      newPostes[editModal.stationIndex] = { ...newPostes[editModal.stationIndex], ...updatedData }; 
      setPostes(newPostes); 
  };

  const deleteFromModal = () => { 
      if (!setPostes || !postes || !editModal) return; 
      const newPostes = [...postes]; 
      newPostes.splice(editModal.stationIndex, 1); 
      const reindexed = newPostes.map((p, i) => ({ ...p, name: `P${i + 1}` })); 
      setPostes(reindexed); 
      closeEditModal(); 
  };

  // -- DYNAMIC OPS LIST FOR MODAL --
  const modalOps = useMemo(() => {
      if (!editModal || !assignments) return [];
      const stationId = editModal.data.id;
      // Check for assignments to this specific ID OR its parent originalId
      const parentId = editModal.data.originalId;
      
      return operations.filter(op => {
          const assignedTo = assignments[op.id] || [];
          return assignedTo.includes(stationId) || (parentId && assignedTo.includes(parentId));
      }).sort((a, b) => a.order - b.order);
  }, [editModal, operations, assignments]);

  const StationCard: React.FC<{ station: Workstation; isGrid?: boolean; isMini?: boolean }> = ({ station, isGrid = false, isMini = false }) => {
      const color = station.color; 
      const isVide = station.machine === 'VIDE';
      const timeInSeconds = Math.round(station.totalTime * 60); 
      const hasNotes = station.notes && station.notes.trim().length > 0; 
      const hasOperator = station.operatorName && station.operatorName.trim().length > 0; 
      const isOverridden = station.timeOverride !== undefined; 
      const mySimIndex = station.index - 1; 
      const isActive = !isMini && simStep === mySimIndex; 
      const isPassed = simStep > mySimIndex; 
      
      const isControl = station.machine.toUpperCase().includes('CONTROLE'); 
      const isFer = station.machine.toUpperCase().includes('FER') || station.machine.toUpperCase().includes('REPASSAGE'); 
      const isFinition = station.machine.toUpperCase().includes('FINITION'); 
      
      const isBroken = station.notes?.includes('#PANNE');

      let bodyBgClass = 'bg-white'; 
      if (isControl) bodyBgClass = 'bg-orange-50'; 
      if (isFer) bodyBgClass = 'bg-rose-50'; 
      if (isFinition) bodyBgClass = 'bg-purple-50'; 
      const isSpecial = isControl || isFer || isFinition;

      const isFeeder = station.isFeeder;
      if (isFeeder) bodyBgClass = 'bg-blue-50/50';

      const isSwapSource = swapSourceId === station.id;
      const isSwapTarget = swapSourceId && swapSourceId !== station.id;

      const cardHeightClass = isGrid ? 'min-h-[140px]' : (isMini ? 'min-h-[80px]' : 'h-full min-h-[140px]');
      const cardWidthClass = isMini ? 'w-full' : (isGrid ? 'w-full' : 'w-44 sm:w-48 shrink-0'); // Increased width slightly

      const miniCardStyle = isMini ? `${color.bg} ${color.border} border-2` : `bg-white border-2`;

      // Cursor Logic: Move if Manual Mode and not Mini, else default/pointer
      const cursorClass = (canEdit && isManualMode && !swapSourceId) ? 'cursor-move' : 'cursor-default';

      if (isVide && !isMini) {
          // EMPTY SLOT RENDER (DASHED BOX)
          return (
            <div 
                onDragOver={handleDragOver} 
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDrop(e, station.originalIndex);
                }}
                className={`relative rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-2 group z-10 transition-all ${cardWidthClass} ${cardHeightClass} ${isManualMode ? 'hover:bg-indigo-50 hover:border-indigo-300' : ''}`}
            >
                <div className="text-[10px] font-bold text-slate-400 uppercase">Emplacement Vide</div>
                {isManualMode && <div className="absolute inset-0 bg-transparent cursor-pointer" title="Déposez un poste ici"></div>}
            </div>
          );
      }

      return (
          <div 
            onClick={() => handleStationClick(station)}
            onContextMenu={(e) => {
                // Always allow context menu
                handleContextMenu(e, station);
            }}
            onDoubleClick={(e) => handleOpenEditModal(e, station)}
            draggable={canEdit && isManualMode && !swapSourceId} 
            onDragStart={(e) => handleDragStart(e, station.originalIndex, isMini, station.id)} 
            onDragEnd={() => setDraggedStationIdx(null)}
            onDragOver={handleDragOver} 
            onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDrop(e, station.originalIndex);
            }} 
            className={`relative rounded-xl overflow-hidden group z-10 shadow-sm
                ${cardWidthClass} ${cardHeightClass} 
                ${canEdit && isManualMode ? 'hover:-translate-y-1 hover:shadow-lg' : ''} 
                ${cursorClass}
                ${isActive ? 'ring-4 ring-emerald-400 border-emerald-500 scale-105 shadow-xl z-20' : 
                  isSwapSource ? 'ring-4 ring-indigo-500 border-indigo-600 scale-105 shadow-xl z-30' :
                  isSwapTarget ? 'cursor-pointer hover:ring-4 hover:ring-indigo-300 hover:border-indigo-400' :
                  isPassed ? 'border-emerald-200 opacity-90' : (isMini ? color.border : color.border)} 
                ${isBroken ? 'ring-2 ring-rose-500 border-rose-600 bg-rose-50' : ''}
                ${miniCardStyle}
                transition-all duration-300 flex flex-col select-none`}
          >
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isActive ? 'bg-emerald-500' : (isBroken ? 'bg-rose-500' : color.fill)}`}></div>

              <div className={`px-2 pl-3 py-1.5 flex justify-between items-center ${isActive ? 'bg-emerald-500' : (isPassed ? 'bg-emerald-50' : (isMini ? color.bg : color.bg))} border-b ${isActive ? 'border-emerald-600' : color.border} transition-colors duration-500 relative`}>
                  {isOverridden && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500 ring-1 ring-white animate-pulse" title="Temps Forcé"></div>}
                  {isBroken && <div className="absolute top-1 right-3 w-3 h-3 text-rose-600 animate-pulse"><AlertTriangle className="w-3 h-3 fill-current" /></div>}
                  
                  <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-black ${isActive ? 'text-emerald-600 bg-white' : color.text} w-5 h-5 flex items-center justify-center bg-white rounded-md shadow-sm border border-black/5`}>
                          {station.name.replace('P','').split('.')[0]}
                      </span>
                      <span className={`text-[9px] font-black uppercase truncate max-w-[80px] ${isActive ? 'text-white' : color.text}`} title={station.name}>
                          {station.machine}
                      </span>
                  </div>
                  {!isMini && (
                      <div className="flex items-center gap-0.5">
                          {isFeeder && <div title={`Alimente: ${station.targetStationName || 'Poste Suivant'}`}><GitMerge className={`w-3 h-3 ${isActive ? 'text-white' : 'text-blue-500'}`} /></div>}
                          {hasOperator && <div title={station.operatorName}><User className={`w-3 h-3 ${isActive ? 'text-white' : 'text-slate-400'}`} /></div>}
                          {hasNotes && <div title="Notes"><FileText className={`w-3 h-3 ${isActive ? 'text-yellow-300' : 'text-amber-400'}`} /></div>}
                      </div>
                  )}
              </div>

              <div className={`p-2 pl-3 flex-1 flex flex-col justify-between gap-1 ${isMini ? 'bg-white' : bodyBgClass}`}>
                  
                  {station.groups && station.groups.length > 0 && !isMini && (
                      <div className="flex flex-wrap gap-1 mb-1">
                          {station.groups.slice(0, 2).map(grp => (
                              <span key={grp} className="text-[7px] font-black uppercase text-indigo-600 bg-indigo-100 px-1 py-0.5 rounded border border-indigo-200 truncate max-w-full">
                                  {grp}
                              </span>
                          ))}
                          {station.groups.length > 2 && <span className="text-[7px] text-slate-400">+{station.groups.length - 2}</span>}
                      </div>
                  )}

                  <div className="space-y-1">
                      {station.operations.length > 0 ? (
                          <>
                              {station.operations.slice(0, isMini ? 100 : 3).map((op, i) => {
                                  const groupStyle = op.groupId ? getGroupStyle(op.groupId) : null;
                                  return (
                                  <div key={i} className={`flex justify-between items-center gap-1.5 py-0.5 ${groupStyle && isMini ? groupStyle.bg + ' px-1.5 rounded-md -mx-1.5 my-0.5 border border-transparent hover:border-indigo-200' : ''}`}>
                                      <span className={`font-mono text-[9px] font-bold px-1 rounded border shrink-0 ${groupStyle && isMini ? 'bg-white/50 border-transparent ' + groupStyle.text : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                          {op.order}
                                      </span>
                                      <div className={`text-[9px] font-bold leading-tight line-clamp-2 flex-1 ${groupStyle && isMini ? groupStyle.text : 'text-slate-600'}`} title={op.description}>
                                          {op.description}
                                      </div>
                                      {groupStyle && isMini && <LinkIcon className={`w-2.5 h-2.5 shrink-0 ${groupStyle.text}`} />}
                                  </div>
                              )})}
                              {station.operations.length > (isMini ? 100 : 3) && <div className="text-[8px] text-slate-400 italic font-medium">... +{station.operations.length - (isMini ? 100 : 3)}</div>}
                          </>
                      ) : (
                          <div className={`text-[9px] italic flex items-center justify-center ${isMini ? 'h-8' : 'h-12'} ${isOverridden ? 'text-purple-500 font-bold' : (isSpecial ? 'text-slate-400/70' : 'text-slate-300')}`}>
                              {isOverridden ? 'Temps Forcé' : 'Vide'}
                          </div>
                      )}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-slate-100">
                      <div className="flex flex-col">
                          <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                          <span className={`text-sm font-bold ${isActive ? 'text-emerald-600' : (isOverridden ? 'text-purple-600' : color.text)}`}>{timeInSeconds}s</span>
                      </div>
                      <div className="flex flex-col items-end">
                          <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider">Sat.</span>
                          <div className="flex items-center gap-1">
                              {station.operators > 1 && <span className={`text-[9px] font-black px-1 rounded bg-amber-100 text-amber-700`}>x{station.operators}</span>}
                              <span className={`text-[9px] font-black ${station.saturation > 100 ? 'text-rose-500' : 'text-emerald-500'}`}>{Math.round(station.saturation)}%</span>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="absolute bottom-0 left-0 h-1 bg-slate-200 w-full">
                  <div className={`h-full ${isActive ? 'bg-emerald-400' : (isFer ? 'bg-rose-500' : (isControl ? 'bg-orange-500' : (isFinition ? 'bg-purple-500' : color.fill)))}`} style={{ width: `${Math.min(station.saturation, 100)}%` }}></div>
              </div>
          </div>
      );
  };

  return (
    <div className="flex flex-col h-full gap-2 relative">
       {/* ... (Header remains same) ... */}
       <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-2 p-2 flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
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

            {/* T. ARTICLE */}
            <div className="ml-auto px-4 py-1.5 bg-purple-100 rounded-lg border border-purple-200 flex flex-col items-end shrink-0">
                <span className="text-[9px] font-bold text-purple-500 uppercase flex items-center gap-1"><Timer className="w-3 h-3" /> T. Article</span>
                <span className="font-black text-purple-700 text-xl leading-none">{tempsArticle.toFixed(2)}</span>
            </div>
       </div>

       {/* FULLSCREEN WRAPPER */}
       <div ref={fullscreenWrapperRef} className={`flex flex-col flex-1 min-h-0 relative transition-all duration-300 ${isFullScreen ? 'bg-white p-4 overflow-hidden fixed inset-0 z-[5000]' : ''}`}>
           
           {/* TOOLBAR */}
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1 flex flex-wrap items-center justify-between gap-2 shrink-0 z-30 mb-1">
               
               {/* --- GROUP 1: MODES (LEFT) --- */}
               <div className="flex items-center gap-2">
                   {/* AUTO MODE */}
                   <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                       <button 
                           onClick={activateAutoMode} 
                           className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${!isManualMode ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                           title="Calcul Automatique"
                       >
                           <Bot className="w-3.5 h-3.5" />
                           Mode Auto
                       </button>
                       <div className="w-px h-4 bg-slate-300 mx-0.5"></div>
                       <button 
                           onClick={refreshAuto} 
                           disabled={isManualMode}
                           className={`p-1.5 rounded-md transition-colors ${!isManualMode ? 'hover:bg-white text-slate-500 hover:text-emerald-600' : 'text-slate-300 cursor-not-allowed'}`}
                           title="Actualiser l'Auto-Équilibrage"
                       >
                           <RefreshCw className="w-3.5 h-3.5" />
                       </button>
                   </div>

                   {/* MANUAL MODE */}
                   <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 relative">
                       <button 
                           onClick={activateManualMode} 
                           className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${isManualMode ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                           title="Modification Manuelle"
                       >
                           <Hand className="w-3.5 h-3.5" />
                           Mode Manuel
                       </button>
                       {isManualMode && (
                           <>
                               <div className="w-px h-4 bg-slate-300 mx-0.5"></div>
                               <button 
                                   onClick={toggleMagnetic}
                                   className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${isMagnetic ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:bg-white hover:text-indigo-600'}`}
                                   title={isMagnetic ? "Arrangement Magnétique (Compact)" : "Arrangement Libre (Grille)"}
                               >
                                   <Magnet className={`w-3.5 h-3.5 ${isMagnetic ? 'fill-current' : ''}`} />
                                   <span className="hidden sm:inline">{isMagnetic ? "Magnétique" : "Libre"}</span>
                               </button>
                               <div className="w-px h-4 bg-slate-300 mx-0.5"></div>
                               <button 
                                   onClick={renumberStations}
                                   className="p-1.5 rounded-md transition-colors hover:bg-white text-slate-500 hover:text-indigo-600"
                                   title="Réorganiser les numéros (P1, P2...)"
                               >
                                   <ListOrdered className="w-3.5 h-3.5" />
                               </button>
                               <div className="w-px h-4 bg-slate-300 mx-0.5"></div>
                               <button 
                                   onClick={() => { if(onSave) onSave(); saveManualLayout(); }} 
                                   className={`p-1.5 rounded-md transition-colors relative hover:bg-white text-slate-500 hover:text-amber-600`}
                                   title="Sauvegarder l'implantation"
                               >
                                   <Save className="w-3.5 h-3.5" />
                                   {saveSuccess && <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>}
                               </button>
                               <div className="w-px h-4 bg-slate-300 mx-0.5"></div>
                               <button 
                                   onClick={addSingleEmptySlot}
                                   className="p-1.5 rounded-md text-slate-500 hover:bg-white hover:text-indigo-600 transition-colors"
                                   title="Ajouter un emplacement vide (Place)"
                               >
                                   <SquareDashed className="w-3.5 h-3.5" />
                               </button>
                           </>
                       )}
                   </div>
               </div>

               {/* ... (Center & Right Toolbars remain same) ... */}
               <div className="flex items-center gap-2">
                   {/* Layout Type */}
                   <div className="flex items-center bg-slate-50 p-0.5 rounded-lg border border-slate-200">
                       <button onClick={() => setLayoutType('zigzag')} className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${layoutType === 'zigzag' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>U (2 Lignes)</button>
                       <button onClick={() => setLayoutType('snake')} className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${layoutType === 'snake' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>Serpent</button>
                       <button onClick={() => setLayoutType('grid')} className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${layoutType === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>Grille</button>
                   </div>

                   {/* Orientation */}
                   <div className="flex items-center bg-slate-50 p-0.5 rounded-lg border border-slate-200">
                       <button onClick={() => setOrientation('landscape')} className={`p-1 rounded-md transition-all ${orientation === 'landscape' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`} title="Horizontal"><AlignHorizontalSpaceAround className="w-3.5 h-3.5" /></button>
                       <button onClick={() => setOrientation('portrait')} className={`p-1 rounded-md transition-all ${orientation === 'portrait' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`} title="Vertical"><AlignVerticalSpaceAround className="w-3.5 h-3.5" /></button>
                   </div>
               </div>
               
               {/* --- GROUP 3: TOOLS (RIGHT) --- */}
               <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <div className="flex items-center gap-0.5 bg-slate-50 p-0.5 rounded-lg border border-slate-200">
                        <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1 hover:bg-white rounded text-slate-500"><ZoomOut className="w-3 h-3" /></button>
                        <span className="text-[9px] font-bold text-slate-400 w-8 text-center">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1 hover:bg-white rounded text-slate-500"><ZoomIn className="w-3 h-3" /></button>
                    </div>

                    <button onClick={() => setShowMaterialsPanel(!showMaterialsPanel)} className={`p-1.5 rounded-lg border transition-all ${showMaterialsPanel ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`} title="Matériel"><Calculator className="w-3.5 h-3.5" /></button>
                    <button onClick={toggleFullScreen} className="p-1.5 rounded-lg border bg-white border-slate-200 text-slate-500 hover:text-indigo-600 transition-all" title="Plein Écran">
                        {isFullScreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => window.print()} className="p-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors shadow-sm" title="Imprimer"><Printer className="w-3.5 h-3.5" /></button>
               </div>
           </div>

           {/* SWAP MODE BANNER */}
           {swapSourceId && (
               <div className="bg-indigo-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md mb-2 rounded-lg animate-in slide-in-from-top-2">
                   <div className="flex items-center gap-2">
                       <SwapIcon className="w-4 h-4" />
                       <span>Mode Échange Actif : Sélectionnez le poste cible pour échanger.</span>
                   </div>
                   <button 
                       onClick={() => setSwapSourceId(null)} 
                       className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-md text-[10px] transition-colors"
                   >
                       Annuler
                   </button>
               </div>
           )}

           {/* 2. ZONES INDICATOR - UNCHANGED */}
           <div className="bg-slate-50 border border-slate-200 rounded-xl p-1.5 flex items-center gap-1 overflow-x-auto text-[10px] font-bold uppercase text-slate-400 shadow-inner shrink-0 mb-1">
               <div className="flex items-center gap-2 px-2 py-0.5 bg-white rounded-lg border border-slate-200 opacity-60 shrink-0"><Package className="w-3 h-3 text-slate-400" /> Stock Tissu</div><ArrowRight className="w-3 h-3 text-slate-300 shrink-0" /><div className="flex items-center gap-2 px-2 py-0.5 bg-white rounded-lg border border-slate-200 opacity-60 shrink-0"><Scissors className="w-3 h-3 text-slate-400" /> Coupe & Prep</div><ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" /><div className="flex items-center gap-2 px-2 py-0.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-700 shadow-sm shrink-0"><Layers className="w-3 h-3" /> Montage (Atelier)</div><ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
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
               <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" /><div className="flex items-center gap-2 px-2 py-0.5 bg-white rounded-lg border border-slate-200 opacity-60 shrink-0"><Truck className="w-3 h-3 text-slate-400" /> Expédition</div>
           </div>

           {/* 3. CANVAS (With Wrapper & Styles for Scrollbars) */}
           <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 relative h-full">
               
               {/* MINI-GAMME SIDEBAR (VISIBLE IN MANUAL MODE) */}
               {isManualMode && (
                   <div className="w-full lg:w-64 bg-slate-50 border border-slate-200 rounded-xl shadow-inner flex flex-col overflow-hidden shrink-0 transition-all duration-300 animate-in slide-in-from-left-2">
                       <div className="p-3 border-b border-slate-200 bg-white flex justify-between items-center">
                           <div>
                               <h3 className="font-bold text-xs uppercase text-slate-500 flex items-center gap-2">
                                   <Inbox className="w-4 h-4" /> Gamme d'attente
                               </h3>
                               <p className="text-[9px] text-slate-400 mt-0.5">Glissez vers la zone</p>
                           </div>
                           <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setGroupDragMode(!groupDragMode)}
                                    className={`p-1.5 rounded-md transition-colors border ${groupDragMode ? 'bg-indigo-100 text-indigo-600 border-indigo-200' : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'}`}
                                    title={groupDragMode ? "Déplacement Groupé Actif" : "Déplacement Simple"}
                                >
                                    {groupDragMode ? <LinkIcon className="w-3.5 h-3.5" /> : <Unlink2 className="w-3.5 h-3.5" />}
                                </button>
                               <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600">{waitingStations.length}</span>
                           </div>
                       </div>
                       <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                           {waitingStations.map(station => (
                               <div key={station.id} className="cursor-grab active:cursor-grabbing">
                                   <StationCard station={station as Workstation} isMini={true} />
                               </div>
                           ))}
                           {waitingStations.length === 0 && (
                               <div className="text-center py-8 text-slate-400 text-xs italic">
                                   Tous les postes sont placés.
                               </div>
                           )}
                       </div>
                   </div>
               )}

               {/* ... (Main Canvas Area with force-scrollbar styles same as before) ... */}
               <div className="flex-1 rounded-2xl bg-slate-100 border border-slate-200 shadow-inner relative overflow-hidden flex flex-col transition-all duration-300">
                   
                   {/* Injected Styles for Scrollbars */}
                   <style>{`
                       .force-scrollbar {
                           scrollbar-width: thin;
                           scrollbar-color: #cbd5e1 transparent;
                       }
                       .force-scrollbar::-webkit-scrollbar {
                           display: block;
                           width: 8px;
                           height: 8px;
                       }
                       .force-scrollbar::-webkit-scrollbar-track {
                           background: transparent;
                       }
                       .force-scrollbar::-webkit-scrollbar-thumb {
                           background-color: #94a3b8;
                           border-radius: 20px;
                           border: 2px solid transparent;
                           background-clip: content-box;
                       }
                       .force-scrollbar::-webkit-scrollbar-thumb:hover {
                           background-color: #6366f1;
                       }
                       .force-scrollbar::-webkit-scrollbar-corner {
                           background: transparent;
                       }
                   `}</style>

                   <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                   
                   {/* DROPPABLE AREA FOR MANUAL MODE */}
                   <div 
                        ref={scrollContainerRef}
                        className={`flex-1 overflow-auto p-4 relative z-10 custom-scrollbar force-scrollbar flex flex-col ${orientation === 'portrait' ? 'items-center' : 'items-start pl-4'}`}
                        onDragOver={(e) => isManualMode && e.preventDefault()}
                        onDrop={(e) => {
                            if (isManualMode) {
                                e.preventDefault();
                                const id = e.dataTransfer.getData("stationId");
                                if (id) {
                                    handleManualDrop(id);
                                } else if (draggedStationIdx !== null) {
                                    // Handle dragging existing item from canvas to background (reorder to end)
                                    // This re-uses handleDrop logic but for background (not on another card)
                                    // Effectively it just moves to end.
                                    // But handleDrop handles reorder. Let's just let it be handled by handleDrop logic
                                    // if drop target is valid. If dropped on background, usually means append.
                                }
                            }
                        }}
                   >
                       <div className={`transition-transform duration-200 ease-out origin-top-left ${layoutType === 'grid' ? 'w-full' : 'min-w-max'}`} style={{ transform: `scale(${zoom})` }}>
                       
                       {/* ... (Layout rendering logic: WHEAT, ZIGZAG, GRID - Same as existing, but using workstations derived from isPlaced) ... */}
                       {layoutType === 'wheat' && (
                           <div className="flex flex-col gap-12 items-center pb-20 w-full min-w-max px-8 pt-8">
                               {wheatGroups.map((group, idx) => {
                                   const left = group.left;
                                   const right = group.right;
                                   
                                   return (
                                       <div key={idx} className="flex flex-col items-center relative">
                                           {/* CENTRAL SPINE CONNECTOR */}
                                           <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1.5 bg-slate-300 -z-10 rounded-full h-[140%]" />

                                           <div className="flex items-center gap-16 relative">
                                               {/* LEFT WING */}
                                               <div className="relative w-44">
                                                   {left ? (
                                                       <>
                                                           <StationCard station={left} />
                                                           {/* Connector Arm to Spine */}
                                                           <div className="absolute top-1/2 left-full w-8 h-1.5 bg-slate-300 -translate-y-1/2 z-0"></div>
                                                           <div className="absolute top-1/2 left-full translate-x-4 -translate-y-1/2 w-3 h-3 bg-white border-2 border-slate-300 rounded-full z-10"></div>
                                                       </>
                                                   ) : (
                                                       <div className="h-20 w-full border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 text-xs font-bold uppercase">
                                                           Emplacement Libre
                                                       </div>
                                                   )}
                                               </div>

                                               {/* CENTER NODE */}
                                               <div className="relative z-10 w-4 h-4 bg-slate-800 rounded-full border-2 border-white shadow-sm shrink-0"></div>

                                               {/* RIGHT WING */}
                                               <div className="relative w-44">
                                                   {right ? (
                                                       <>
                                                           <StationCard station={right} />
                                                           {/* Connector Arm to Spine */}
                                                           <div className="absolute top-1/2 right-full w-8 h-1.5 bg-slate-300 -translate-y-1/2 z-0"></div>
                                                           <div className="absolute top-1/2 right-full -translate-x-7 -translate-y-1/2 w-3 h-3 bg-white border-2 border-slate-300 rounded-full z-10"></div>
                                                       </>
                                                   ) : (
                                                       <div className="h-20 w-full border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 text-xs font-bold uppercase">
                                                           Emplacement Libre
                                                       </div>
                                                   )}
                                               </div>
                                           </div>
                                       </div>
                                   );
                                })}
                               <div className="mt-8 flex flex-col items-center relative z-10">
                                   <div className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl shadow-lg border-2 border-slate-700">
                                       <Truck className="w-5 h-5" /> <span className="text-sm font-bold uppercase">Expédition</span>
                                   </div>
                               </div>
                           </div>
                       )}

                       {layoutType === 'zigzag' && (
                           <div className={`flex gap-3 pb-20 min-w-max ${orientation === 'landscape' ? 'flex-col items-start' : 'flex-row items-start pl-4'}`}>
                               <div className="relative">
                                   
                                   <div className={`flex shrink-0 ${orientation === 'landscape' ? 'flex-row pl-12 mb-2 w-full gap-[12rem]' : 'flex-col pt-12 mr-4 w-12 gap-16'}`}>
                                       {zigZagPairs.map((pair, idx) => (
                                           <div key={idx} className={`flex items-center justify-center text-[10px] font-black text-slate-300 uppercase ${orientation === 'landscape' ? 'w-48 text-center' : 'h-28 -rotate-90'}`}>
                                               {orientation === 'landscape' ? `Col ${idx + 1}` : `Rang ${idx + 1}`}
                                           </div>
                                       ))}
                                   </div>
                                   <div className={`flex items-start gap-12 relative z-10 ${orientation === 'landscape' ? 'flex-row' : 'flex-col'}`}>
                                       {zigZagPairs.map((pair, i) => {
                                           const isLastCol = i === zigZagPairs.length - 1;
                                           const topIdx = pair.top.originalIndex;
                                           const botIdx = pair.bottom?.originalIndex;
                                           
                                           const isCluster = pair.top.isFeeder && pair.bottom && pair.top.feedsInto === pair.bottom.id.split('__')[0];

                                           return (
                                               <div key={i} className={`flex gap-20 relative ${orientation === 'landscape' ? 'flex-col' : 'flex-row items-center items-stretch'}`}>
                                                   {showDimensions && (<div className={`absolute ${orientation === 'landscape' ? '-top-6 left-1/2 -translate-x-1/2 w-0.5 h-[150%]' : 'left-1/2 top-1/2 -translate-y-1/2 h-0.5 w-[150%]'} bg-yellow-400/30 z-0`}></div>)}
                                                   
                                                   <div className="relative">
                                                       <StationCard station={pair.top} />
                                                       {showDimensions && <div className="absolute -top-5 left-0 w-full text-center text-[8px] font-bold text-yellow-600 bg-yellow-50 rounded">Rail Élec.</div>}
                                                   </div>
                                                   
                                                   {/* Bottom Card Wrapper with SHIFT */}
                                                   <div className={`relative ${orientation === 'landscape' ? 'translate-x-32' : ''}`}>
                                                       {pair.bottom ? (<><StationCard station={pair.bottom} />{showDimensions && !isLastCol && (<div className={`absolute ${orientation === 'landscape' ? 'top-1/2 -right-6 w-6 h-px' : 'left-1/2 -bottom-6 h-6 w-px'} bg-slate-300 flex items-center justify-center`}><div className={`text-[7px] bg-slate-100 text-slate-500 font-bold px-0.5 rounded ${orientation === 'landscape' ? 'transform -rotate-90' : ''}`}>1.2m</div></div>)}</>) : (
                                                           !isManualMode && <div className="w-36 sm:w-40 h-16 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-300 font-bold uppercase">Zone Tampon</div>
                                                       )}
                                                       {showDimensions && !isLastCol && pair.bottom && (<div className={`absolute ${orientation === 'landscape' ? 'top-1/2 -right-6 w-6' : 'left-1/2 -bottom-6 h-6'}`}>{orientation === 'landscape' ? <DimensionMarkerHorizontal label="0.6m" /> : <DimensionMarkerVertical label="0.6m" />}</div>)}
                                                   </div>
                                               </div>
                                           );
                                       })}
                                       <div className={`flex flex-col justify-end h-full pb-6 pl-3 ${orientation === 'landscape' ? '' : 'pt-6'}`}>
                                           <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-lg shadow-lg">
                                               <Truck className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Expédition</span>
                                           </div>
                                       </div>
                                   </div>
                               </div>
                           </div>
                       )}
                           
                           {/* OTHER LAYOUTS REMAIN SAME */}
                           {layoutType === 'grid' && (
                               <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                   {workstations.map(st => <StationCard key={st.id} station={st} isGrid={true} />)}
                               </div>
                           )}
                       </div>
                   </div>
               </div>
               
               {/* FLOATING MATERIAL PANEL */}
               {showMaterialsPanel && (
                    <div className="fixed z-[5010] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col" style={{ left: matPanel.x, top: matPanel.y, width: matPanel.w, height: matPanel.h }}>
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

           {/* Fullscreen Close Button */}
           {isFullScreen && (
               <button 
                   onClick={toggleFullScreen} 
                   className="absolute top-4 right-4 z-50 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all hover:scale-110"
                   title="Quitter plein écran"
               >
                   <X className="w-6 h-6" />
               </button>
           )}
       </div>

       {/* ... (Existing Edit Modal & Context Menu Portals - no changes needed there) ... */}
       {editModal && createPortal(
           <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
               {/* BACKDROP */}
               <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeEditModal} />
               {/* MODAL CONTENT */}
               <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                   {/* DYNAMIC HEADER COLOR */}
                   <div className={`px-6 py-4 border-b flex justify-between items-center shrink-0 ${editModal.color.bg} ${editModal.color.border}`}>
                       {/* ... same header ... */}
                       <div className="flex items-center gap-3">
                           <div className={`p-2 bg-white rounded-lg shadow-sm border ${editModal.color.border}`}>
                               <PenTool className={`w-5 h-5 ${editModal.color.text}`} />
                           </div>
                           <div>
                               <h3 className={`font-bold text-lg leading-tight ${editModal.color.text}`}>Modifier Poste {editModal.data.name}</h3>
                               <p className="text-[10px] uppercase font-bold text-slate-500 opacity-80 flex items-center gap-2">
                                   {editModal.data.machine}
                                   <span className="w-px h-3 bg-slate-300"></span>
                                   {modalOps.length} Opérations
                               </p>
                           </div>
                       </div>
                       <div className="flex items-center gap-2 ml-auto mr-4">
                           <div className="relative group">
                                <User className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Opérateur..."
                                    value={editModal.data.operatorName || ''}
                                    onChange={(e) => saveStationMetadata({ operatorName: e.target.value })}
                                    className="pl-7 pr-2 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white/80 focus:bg-white focus:border-indigo-400 outline-none w-32"
                                />
                           </div>
                           <div className="relative group">
                                <Clock className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input 
                                    type="number" 
                                    placeholder="T. Forcé"
                                    value={editModal.data.timeOverride !== undefined ? Math.round(editModal.data.timeOverride * 60) : ''}
                                    onChange={(e) => { const val = e.target.value === '' ? undefined : Number(e.target.value); saveStationMetadata({ timeOverride: val !== undefined ? val / 60 : undefined }); }}
                                    className="pl-7 pr-2 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white/80 focus:bg-white focus:border-purple-400 outline-none w-24 text-purple-600 placeholder:text-slate-400"
                                    title="Forcer temps poste (sec)"
                                />
                           </div>
                       </div>
                       <button onClick={closeEditModal} className={`p-1.5 hover:bg-white/50 rounded-lg transition-colors ${editModal.color.text}`}><X className="w-5 h-5" /></button>
                   </div>
                   {/* SCROLLABLE TABLE BODY */}
                   <div className="flex-1 overflow-auto custom-scrollbar bg-slate-50 p-4">
                       <table className="w-full text-left border-collapse bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                           <thead className="bg-slate-100 text-xs font-bold text-slate-500 uppercase sticky top-0 z-10 shadow-sm">
                               <tr>
                                   <th className="py-3 px-4 w-12 text-center border-b border-slate-200">N°</th>
                                   <th className="py-3 px-4 border-b border-slate-200">Description</th>
                                   <th className="py-3 px-4 w-40 border-b border-slate-200">Machine</th>
                                   <th className="py-3 px-4 w-20 text-center border-b border-slate-200">L / Qté</th>
                                   <th className="py-3 px-4 w-20 text-center border-b border-slate-200">F.Guide</th>
                                   <th className="py-3 px-4 w-24 text-center border-b border-slate-200 text-emerald-600">Temps</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 text-sm">
                               {modalOps.map((op, idx) => {
                                   const isForced = op.forcedTime !== undefined;
                                   return (
                                       <tr key={op.id} className="hover:bg-slate-50 transition-colors group">
                                           <td className="py-2 px-2 text-center font-mono text-slate-400 font-bold border-r border-slate-50">{op.order}</td>
                                           <td className="py-2 px-2">
                                               <input 
                                                   type="text" 
                                                   value={op.description} 
                                                   onChange={(e) => handleUpdateOperation(op.id, 'description', e.target.value)}
                                                   className="w-full bg-transparent outline-none font-medium text-slate-700 placeholder:text-slate-300 focus:bg-white focus:shadow-sm rounded px-2 py-1 transition-all"
                                                   placeholder="Description..."
                                               />
                                           </td>
                                           <td className="py-2 px-2">
                                               <ExcelInput 
                                                   suggestions={machines.map(m => m.name)}
                                                   value={op.machineName || ''}
                                                   onChange={(val) => handleUpdateOperation(op.id, 'machineName', val)}
                                                   className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-600 outline-none focus:border-indigo-400 focus:bg-white transition-all uppercase"
                                                   placeholder="MAC"
                                               />
                                           </td>
                                           <td className="py-2 px-2 text-center">
                                               <input 
                                                   type="number" 
                                                   value={op.length !== undefined && op.length !== null ? op.length : ''} 
                                                   onChange={(e) => handleUpdateOperation(op.id, 'length', Number(e.target.value))}
                                                   className="w-full text-center bg-transparent outline-none font-mono text-slate-600 focus:bg-white focus:shadow-sm rounded px-1 py-1"
                                                   placeholder="-"
                                               />
                                           </td>
                                           <td className="py-2 px-2 text-center">
                                               <select 
                                                   value={op.guideFactor || 1.1} 
                                                   onChange={(e) => handleUpdateOperation(op.id, 'guideFactor', Number(e.target.value))}
                                                   className="bg-transparent outline-none text-xs font-bold text-slate-500 cursor-pointer hover:text-indigo-600 appearance-none text-center w-full"
                                               >
                                                   {complexityFactors.map(f => (
                                                       <option key={f.id} value={f.value}>{f.value}</option>
                                                   ))}
                                               </select>
                                           </td>
                                           <td className="py-2 px-2 text-center bg-slate-50/50">
                                               <div className="relative">
                                                   <input 
                                                       type="number" 
                                                       step="0.01"
                                                       value={Math.round((op.time || 0) * 60)} 
                                                       readOnly 
                                                       className={`w-full text-center font-bold outline-none bg-transparent ${isForced ? 'text-purple-600' : 'text-emerald-600'}`}
                                                       disabled
                                                   />
                                                   <span className="text-[9px] text-slate-400 absolute right-0 top-1/2 -translate-y-1/2">s</span>
                                               </div>
                                           </td>
                                       </tr>
                                   );
                                })}
                               {modalOps.length === 0 && (
                                   <tr>
                                       <td colSpan={6} className="py-8 text-center text-slate-400 italic bg-white">
                                           Aucune opération assignée. Utilisez le mode Manuel pour ajouter des opérations.
                                       </td>
                                   </tr>
                               )}
                           </tbody>
                           <tfoot className="bg-slate-50 border-t border-slate-200">
                               <tr>
                                   <td colSpan={5} className="py-3 px-4 text-right font-bold text-xs uppercase text-slate-500">Total Poste:</td>
                                   <td className="py-3 px-4 text-center font-black text-emerald-700 bg-emerald-50 border-l border-emerald-100">
                                       {Math.round(modalOps.reduce((sum, op) => sum + (op.time || 0), 0) * 60)}s
                                   </td>
                               </tr>
                           </tfoot>
                       </table>
                   </div>
                   {/* FOOTER ACTIONS - WITH DELETE CONFIRMATION */}
                   <div className="p-4 bg-white border-t border-slate-200 flex justify-between gap-3 shrink-0 transition-all">
                       {showDeleteConfirm ? (
                           <div className="flex items-center justify-between w-full bg-rose-50 p-2 rounded-lg border border-rose-100 animate-in fade-in slide-in-from-bottom-2">
                               <div className="flex items-center gap-2 text-rose-700 font-bold text-xs px-2">
                                   <AlertTriangle className="w-4 h-4" />
                                   <span>Êtes-vous sûr de vouloir supprimer ce poste ?</span>
                               </div>
                               <div className="flex gap-2">
                                   <button 
                                       onClick={() => setShowDeleteConfirm(false)} 
                                       className="px-3 py-1.5 bg-white text-slate-600 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
                                   >
                                       Annuler
                                   </button>
                                   <button 
                                       onClick={() => deleteFromModal()} 
                                       className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 shadow-sm transition-colors"
                                   >
                                       Confirmer
                                   </button>
                               </div>
                           </div>
                       ) : (
                           <>
                               <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 rounded-xl text-xs font-bold transition-all shadow-sm text-slate-500">
                                   <Trash2 className="w-4 h-4" />
                                   <span>Supprimer</span>
                               </button>
                               <div className="flex gap-2">
                                   <button 
                                       onClick={() => closeEditModal()} 
                                       className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-colors"
                                   >
                                       Fermer
                                   </button>
                                   <button 
                                       onClick={() => closeEditModal()} 
                                       className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100 transition-colors"
                                   >
                                       Enregistrer
                                   </button>
                               </div>
                           </>
                       )}
                   </div>
               </div>
           </div>,
           document.body
       )}

       {/* CONTEXT MENU PORTAL */}
       {contextMenu && contextMenu.visible && createPortal(
           <div 
               className="absolute z-[9999] bg-white border border-slate-200 rounded-xl shadow-2xl py-1 w-56 text-xs font-medium text-slate-700 animate-in fade-in zoom-in-95 duration-100 origin-top-left overflow-hidden ring-4 ring-slate-100/50"
               style={{ top: contextMenu.y, left: contextMenu.x }}
               onClick={(e) => e.stopPropagation()} 
           >
               <button onClick={() => handleContextAction('modify')} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 transition-colors"><PenTool className="w-3.5 h-3.5 text-indigo-500" /> Modifier Poste</button>
               <button onClick={() => handleContextAction('swap')} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 transition-colors"><ArrowRightLeft className="w-3.5 h-3.5 text-orange-500" /> Échanger (Swap)</button>
               <div className="h-px bg-slate-100 my-1"></div>
               <button onClick={() => handleContextAction('insert')} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 transition-colors"><Plus className="w-3.5 h-3.5 text-emerald-500" /> Insérer Vide</button>
               <button onClick={() => handleContextAction('delete')} className="w-full text-left px-4 py-2.5 hover:bg-rose-50 text-rose-600 flex items-center gap-2 transition-colors"><Trash2 className="w-3.5 h-3.5" /> Supprimer</button>
           </div>,
           document.body
       )}
    </div>
  );
}
