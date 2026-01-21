
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  ClipboardList, 
  Plus, 
  Trash2, 
  Ruler, 
  GripVertical,
  Users,
  Clock,
  Briefcase,
  Timer,
  Zap,
  Sparkles,
  Loader2,
  X,
  Search,
  Bot,
  MessageSquare,
  Send,
  ArrowDownToLine,
  ChevronDown,
  Shirt,
  Component,
  Info,
  Percent,
  ToggleLeft,
  ToggleRight,
  Wand2,
  Scissors,
  Copy,
  Clipboard,
  Eraser
} from 'lucide-react';
import { Machine, Operation, ComplexityFactor, StandardTime, Guide } from '../types';
import { analyzeTextileContext } from '../services/gemini';
import { VOCABULARY } from '../data/vocabulary';
import ExcelInput from './ExcelInput';

interface GammeProps {
  machines: Machine[];
  operations: Operation[];
  setOperations: React.Dispatch<React.SetStateAction<Operation[]>>;
  articleName: string;
  setArticleName: React.Dispatch<React.SetStateAction<string>>;
  efficiency: number;
  setEfficiency: React.Dispatch<React.SetStateAction<number>>; 
  numWorkers: number;
  setNumWorkers: React.Dispatch<React.SetStateAction<number>>;
  presenceTime: number;
  setPresenceTime: React.Dispatch<React.SetStateAction<number>>;
  bf: number;
  complexityFactors: ComplexityFactor[];
  standardTimes: StandardTime[];
  guides?: Guide[];
  // Autocomplete Props
  isAutocompleteEnabled: boolean;
  userVocabulary: string[];
  setUserVocabulary: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function Gamme({ 
  machines, 
  operations, 
  setOperations,
  articleName,
  setArticleName,
  efficiency,
  setEfficiency,
  numWorkers,
  setNumWorkers,
  presenceTime,
  setPresenceTime,
  bf,
  complexityFactors,
  standardTimes,
  guides = [],
  isAutocompleteEnabled,
  userVocabulary,
  setUserVocabulary
}: GammeProps) {

  const [showLength, setShowLength] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // Shortcut State
  const [globalGuide, setGlobalGuide] = useState<number>(1.1);

  // FABRIC SETTINGS STATE (NEW)
  const [fabricSettings, setFabricSettings] = useState<{
      enabled: boolean;
      selected: 'easy' | 'medium' | 'hard';
      values: { easy: number; medium: number; hard: number };
  }>({
      enabled: false,
      selected: 'easy',
      values: { easy: 0, medium: 3, hard: 6 }
  });

  // UI States
  const [showFabricModal, setShowFabricModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState<{ opId: string, machineName: string } | null>(null);
  const [guideSearch, setGuideSearch] = useState('');

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    opId: string | null;
  } | null>(null);

  const [clipboard, setClipboard] = useState<{ op: Operation | null; mode: 'copy' | 'cut' } | null>(null);

  // Combine Vocabularies (Memoized)
  const fullVocabulary = useMemo(() => [...VOCABULARY, ...userVocabulary], [userVocabulary]);

  // AI Assistant State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, aiResponse]);

  // Global click listener to close context menu
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // --- HELPER: NORMALIZE TEXT (SAFE) ---
  const normalize = (str: string) => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // --- HELPER: FIND GUIDE BASED ON TEXT (SMART MATCHING) ---
  const findBestGuide = (description: string, machineName: string): Guide | undefined => {
      if (!description || !machineName) return undefined;
      
      const descNorm = normalize(description);
      const machNorm = normalize(machineName);

      // 1. Identify Machine Type of the Operation
      const isOpPiqueuse = machNorm.includes('piqueuse') || machNorm.includes('301') || machNorm.includes('plate') || machNorm.includes('automatique') || machNorm.includes('db');
      const isOpSurjet = machNorm.includes('surjet') || machNorm.includes('sj') || machNorm.includes('504') || machNorm.includes('514') || machNorm.includes('516') || machNorm.includes('merrow');
      const isOpRecouvreuse = machNorm.includes('recouvreuse') || machNorm.includes('colleteuse') || machNorm.includes('256') || machNorm.includes('flatlock');
      // If none of above, treat as generic or manual or special

      // 2. Score Candidates
      let bestCandidate: Guide | undefined;
      let maxScore = 0;

      for (const g of guides) {
          const gMachNorm = normalize(g.machineType || '');
          let isCompatible = false;

          // A. COMPATIBILITY CHECK
          if (gMachNorm.includes('toutes') || gMachNorm.includes('divers')) {
              isCompatible = true;
          } 
          else {
              const gIsPiqueuse = gMachNorm.includes('piqueuse') || gMachNorm.includes('301');
              const gIsSurjet = gMachNorm.includes('surjet') || gMachNorm.includes('surjeteuse');
              const gIsRecouvreuse = gMachNorm.includes('recouvreuse') || gMachNorm.includes('colleteuse');

              if (isOpPiqueuse && gIsPiqueuse) isCompatible = true;
              else if (isOpSurjet && gIsSurjet) isCompatible = true;
              else if (isOpRecouvreuse && gIsRecouvreuse) isCompatible = true;
              // Fallback: Name match (e.g. if machine name literally contains guide machine name)
              else if (machNorm.includes(gMachNorm)) isCompatible = true;
          }

          if (!isCompatible) continue;

          // B. SCORING (Description vs Guide Info)
          let score = 0;
          const gInfo = normalize(`${g.name || ''} ${g.category || ''} ${g.useCase || ''}`);
          
          // Weighted Keywords
          const keywords = [
              { word: 'fermeture', weight: 40 }, { word: 'zip', weight: 40 }, { word: 'eclair', weight: 40 },
              { word: 'invisible', weight: 40 },
              { word: 'passepoil', weight: 40 }, { word: 'cordon', weight: 35 },
              { word: 'fronce', weight: 35 }, { word: 'plis', weight: 35 },
              { word: 'biais', weight: 30 }, { word: 'border', weight: 30 },
              { word: 'ourlet', weight: 25 }, { word: 'roulotte', weight: 25 }, { word: 'roulotté', weight: 25 },
              { word: 'elastique', weight: 25 },
              { word: 'cuir', weight: 20 }, { word: 'skai', weight: 20 }, { word: 'simili', weight: 20 },
              { word: 'surpiqure', weight: 15 }, { word: 'piquer', weight: 10 }, { word: 'nervure', weight: 15 },
              { word: 'assemblage', weight: 2 }, // Very low weight for generic term
          ];

          for (const k of keywords) {
              if (descNorm.includes(k.word) && gInfo.includes(k.word)) {
                  score += k.weight;
              }
          }

          // Bonus: Exact guide name parts in description
          const gNameParts = normalize(g.name || '').split(' ');
          for(const part of gNameParts) {
              if (part.length > 3 && descNorm.includes(part)) score += 15;
          }

          if (score > maxScore) {
              maxScore = score;
              bestCandidate = g;
          }
      }

      // C. THRESHOLD
      // Must have a meaningful score to assign (at least 10, meaning matched a weak keyword or strong partial)
      // "Assemblage" (weight 2) alone is not enough.
      return maxScore >= 10 ? bestCandidate : undefined;
  };

  // --- AUTO ASSIGN GUIDES (BATCH) ---
  const handleAutoAssignGuides = () => {
      setOperations(prev => prev.map(op => {
          // Skip if no description or machine
          if (!op.description || !op.machineName) return op;
          
          const suggested = findBestGuide(op.description, op.machineName);
          
          if (suggested) {
              return { 
                  ...op, 
                  guideId: suggested.id, 
                  guideName: suggested.name 
              };
          } else {
              return {
                  ...op,
                  guideId: undefined,
                  guideName: ''
              };
          }
      }));
  };

  // --- FILTER GUIDES FOR MODAL ---
  const filteredGuides = useMemo(() => {
      if (!showGuideModal) return [];
      const searchLower = guideSearch.toLowerCase();
      const targetMachine = (showGuideModal.machineName || '').toLowerCase();
      
      return guides.filter(g => {
          const matchSearch = (g.name || '').toLowerCase().includes(searchLower) || (g.category || '').toLowerCase().includes(searchLower);
          
          const gMachine = (g.machineType || '').toLowerCase();
          const matchMachine = targetMachine ? (gMachine.includes(targetMachine) || targetMachine.includes(gMachine) || gMachine.includes('piqueuse')) : true;
          
          return matchSearch && matchMachine;
      });
  }, [guides, guideSearch, showGuideModal]);

  // --- HELPER: GET STANDARD CYCLE TIME ---
  const getStandardCycleTime = (machineName: string) => {
    const name = (machineName || '').toLowerCase();
    
    const matchedStd = standardTimes.find(s => {
        const label = (s.label || '').toLowerCase();
        if (name.includes('bouton') && (label.includes('bouton') || label.includes('botonière'))) return true;
        if (name.includes('botonière') && (label.includes('bouton') || label.includes('botonière'))) return true;
        if (name.includes('bride') && label.includes('bride')) return true;
        if (name.includes('bartack') && (label.includes('bartack') || label.includes('bride'))) return true;
        if (name.includes('oeillet') && label.includes('oeillet')) return true;
        return false;
    });

    if (matchedStd) {
        return matchedStd.unit === 'sec' ? matchedStd.value / 60 : matchedStd.value;
    }
    
    if (name.includes('bouton') || name.includes('botonière')) return 4/60; 
    if (name.includes('bride')) return 4/60; 
    return 0.15; 
  };

  // --- CALCULATION LOGIC ---
  const calculateOpTimes = (op: Partial<Operation>, machineId: string, machinesList: Machine[]) => {
    let machine = machinesList.find(m => m.id === machineId);
    if (!machine && op.machineName) {
        const val = op.machineName.trim().toLowerCase();
        machine = machinesList.find(m => 
            (m.name || '').toLowerCase().includes(val) || 
            (m.classe || '').toLowerCase().includes(val)
        );
    }
    
    const hasMachineDefinition = !!machine || (op.machineName && op.machineName.trim().length > 0);
    const machineNameUpper = (machine?.name || op.machineName || '').toUpperCase();
    
    const isCounterMachine = 
        machineNameUpper.includes('BOUTON') || 
        machineNameUpper.includes('BRIDE') || 
        machineNameUpper.includes('BARTACK') || 
        machineNameUpper.includes('TROU') ||
        machineNameUpper.includes('OEILLET') ||
        machineNameUpper.includes('POSE');

    const L = parseFloat(String(op.length)) || 0;
    const stitchCount = op.stitchCount !== undefined ? parseFloat(String(op.stitchCount)) : 4; 
    const speed = parseFloat(String(op.rpm)) || (machine?.speed || 2500); 
    const F_Machine = parseFloat(String(op.speedFactor)) || (machine?.speedMajor || 1.01);
    const F_Guide = op.guideFactor !== undefined ? parseFloat(String(op.guideFactor)) : 1.1; 
    const Majoration = parseFloat(String(op.majoration)) || (machine?.cofs || 1.15); 
    
    const isMachine = hasMachineDefinition && (machine?.name.toUpperCase() !== 'MAN' && !op.machineName?.toUpperCase().includes('MAN'));
    
    let T_Machine = 0;
    let T_Manuel = parseFloat(String(op.manualTime)) || 0;

    if (isMachine) {
        if (isCounterMachine) {
            const quantity = L;
            const cycleTimePerUnit = getStandardCycleTime(machine?.name || op.machineName || '');
            T_Machine = (quantity * cycleTimePerUnit) * F_Machine * F_Guide;
        } else if (speed > 0) {
            const C_EndPrecision = op.endPrecision !== undefined ? parseFloat(String(op.endPrecision)) : 0.01;
            const C_StartStop = op.startStop !== undefined ? parseFloat(String(op.startStop)) : 0.01; 
            const baseSewingTime = (L * stitchCount) / speed;
            T_Machine = (baseSewingTime * F_Machine * F_Guide) + C_EndPrecision + C_StartStop;
        }

        if (T_Manuel === 0 && T_Machine > 0) {
             if (L > 0 || isCounterMachine) {
                 T_Manuel = 0.18;
             }
        }
    }

    const T_Total_Calc = (T_Machine + T_Manuel) * Majoration;

    let fabricPenalty = 0;
    if (fabricSettings.enabled) {
        const penaltySec = fabricSettings.values[fabricSettings.selected];
        fabricPenalty = penaltySec / 60; 
    }

    const T_Total = (op.forcedTime !== undefined && op.forcedTime !== null) 
                    ? op.forcedTime 
                    : T_Total_Calc + fabricPenalty;

    return { T_Total, T_Machine, T_Manuel, isMachine, isCounterMachine };
  };

  // --- ACTIONS ---
  const addOperation = () => {
    const newOp: Operation = {
      id: Date.now().toString(),
      order: operations.length + 1,
      description: '',
      machineId: '', 
      machineName: '',
      length: 0,
      manualTime: 0, 
      time: 0,
      guideFactor: 1.1
    };
    setOperations(prev => [...prev, newOp]);
  };

  const updateOperation = (id: string, field: keyof Operation, value: any) => {
    setOperations(prev => prev.map(op => {
      if (op.id !== id) return op;
      
      const updatedOp = { ...op, [field]: value };

      if (field === 'forcedTime') {
         updatedOp.forcedTime = value;
      } else if (field !== 'description' && field !== 'order' && field !== 'guideId' && field !== 'guideName') {
         updatedOp.forcedTime = undefined;
      }
      
      const { T_Total } = calculateOpTimes(updatedOp, updatedOp.machineId || '', machines);
      updatedOp.time = T_Total;
      
      return updatedOp;
    }));
  };

  // --- CONTEXT MENU HANDLERS ---
  const handleContextMenu = (e: React.MouseEvent, opId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
        visible: true,
        x: e.pageX,
        y: e.pageY,
        opId
    });
  };

  const handleContextAction = (action: 'insert' | 'delete' | 'clear' | 'copy' | 'cut' | 'paste') => {
      if (!contextMenu?.opId) return;
      
      const idx = operations.findIndex(o => o.id === contextMenu.opId);
      if (idx === -1) return;

      let newOps = [...operations];

      switch(action) {
          case 'insert':
              const newOp: Operation = {
                  id: Date.now().toString(),
                  order: 0,
                  description: '',
                  machineId: '',
                  machineName: '',
                  length: 0,
                  manualTime: 0,
                  time: 0,
                  guideFactor: 1.1
              };
              newOps.splice(idx + 1, 0, newOp);
              break;
          case 'delete':
              newOps.splice(idx, 1);
              break;
          case 'clear':
              newOps[idx] = {
                  ...newOps[idx],
                  description: '',
                  machineId: '',
                  machineName: '',
                  length: 0,
                  manualTime: 0,
                  time: 0,
                  guideFactor: 1.1,
                  forcedTime: undefined,
                  guideId: undefined,
                  guideName: undefined
              };
              break;
          case 'copy':
              setClipboard({ op: { ...operations[idx] }, mode: 'copy' });
              break;
          case 'cut':
              setClipboard({ op: { ...operations[idx] }, mode: 'cut' });
              break;
          case 'paste':
              if (clipboard?.op) {
                  const pastedOp = { 
                      ...clipboard.op, 
                      id: newOps[idx].id, 
                      order: newOps[idx].order 
                  };
                  newOps[idx] = pastedOp;
                  
                  const { T_Total } = calculateOpTimes(pastedOp, pastedOp.machineId || '', machines);
                  newOps[idx].time = T_Total;

                  if (clipboard.mode === 'cut') {
                      const originalIdx = newOps.findIndex(o => o.id === clipboard.op!.id);
                      if (originalIdx !== -1 && originalIdx !== idx) {
                          newOps.splice(originalIdx, 1);
                      }
                      setClipboard(null);
                  }
              }
              break;
      }

      newOps.forEach((op, i) => op.order = i + 1);
      setOperations(newOps);
      setContextMenu(null);
  };

  // --- RECALCULATE ALL WHEN FABRIC SETTINGS CHANGE ---
  useEffect(() => {
      setOperations(prev => prev.map(op => {
          const { T_Total } = calculateOpTimes(op, op.machineId || '', machines);
          return { ...op, time: T_Total };
      }));
  }, [fabricSettings]);

  // --- AUTOCOMPLETE LOGIC ---
  const handleDescriptionChange = (val: string, opId: string) => {
      setOperations(prev => prev.map(o => {
          if (o.id !== opId) return o;
          
          let newGuideId = o.guideId;
          let newGuideName = o.guideName;
          
          if ((!o.guideName || o.guideName === '') && o.machineName) {
              const suggested = findBestGuide(val, o.machineName);
              if (suggested) {
                  newGuideId = suggested.id;
                  newGuideName = suggested.name;
              }
          }

          const updatedOp = { ...o, description: val, guideId: newGuideId, guideName: newGuideName };
          
          const { T_Total } = calculateOpTimes(updatedOp, updatedOp.machineId || '', machines);
          updatedOp.time = T_Total;
          
          return updatedOp;
      }));
  };

  // --- SELF LEARNING LOGIC ---
  const handleDescriptionBlur = (description: string) => {
      if (!description) return;

      const words = description.split(/\s+/);
      const newWords: string[] = [];

      words.forEach(w => {
          const cleanWord = w.trim();
          if (cleanWord.length > 2 && isNaN(Number(cleanWord))) {
              const exists = fullVocabulary.some(v => (v || '').toLowerCase() === cleanWord.toLowerCase());
              if (!exists) {
                  newWords.push(cleanWord);
              }
          }
      });

      if (newWords.length > 0) {
          setUserVocabulary(prev => [...prev, ...newWords]);
      }
  };

  // ----------------------------------------

  const assignGuide = (opId: string, guide: Guide) => {
      setOperations(prev => prev.map(op => {
          if (op.id !== opId) return op;
          return { ...op, guideId: guide.id, guideName: guide.name };
      }));
      setShowGuideModal(null);
  };

  const updateGuideName = (opId: string, name: string) => {
      setOperations(prev => prev.map(op => {
          if (op.id !== opId) return op;
          return { ...op, guideName: name, guideId: undefined }; 
      }));
  };

  const handleMachineChange = (id: string, value: string) => {
    const matchedMachine = machines.find(m => 
      (m.name || '').toLowerCase() === value.toLowerCase() || 
      (m.classe || '').toLowerCase() === value.toLowerCase()
    );
    
    setOperations(prev => prev.map(op => {
      if (op.id !== id) return op;
      
      const updatedOp = { 
        ...op, 
        machineName: value,
        machineId: matchedMachine ? matchedMachine.id : '',
        forcedTime: undefined 
      };

      if (!updatedOp.guideName || updatedOp.guideName === '') {
          const suggested = findBestGuide(updatedOp.description, value);
          if (suggested) {
              updatedOp.guideId = suggested.id;
              updatedOp.guideName = suggested.name;
          }
      }

      const { T_Total } = calculateOpTimes(updatedOp, updatedOp.machineId || '', machines);
      updatedOp.time = T_Total;
      return updatedOp;
    }));
  };

  const deleteOperation = (id: string) => {
    setOperations(prev => prev.filter(o => o.id !== id));
  };

  const applyGlobalGuide = () => {
    setOperations(prev => prev.map(op => {
      const updatedOp = { ...op, guideFactor: globalGuide, forcedTime: undefined };
      const { T_Total } = calculateOpTimes(updatedOp, updatedOp.machineId || '', machines);
      updatedOp.time = T_Total;
      return updatedOp;
    }));
  };

  const updateFabricValue = (key: 'easy' | 'medium' | 'hard', val: number) => {
      setFabricSettings(prev => ({
          ...prev,
          values: { ...prev.values, [key]: val }
      }));
  };

  const selectFabricLevel = (level: 'easy' | 'medium' | 'hard') => {
      setFabricSettings(prev => ({ ...prev, selected: level }));
  };

  const handleAiAssist = async () => {
    if (!aiPrompt.trim()) return;
    
    const userMsg = aiPrompt;
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setAiPrompt('');
    setIsAnalyzing(true);
    
    try {
      const analysisText = await analyzeTextileContext(operations, machines, userMsg);
      setChatHistory(prev => [...prev, { role: 'ai', content: analysisText || "Je n'ai pas pu analyser la gamme." }]);
    } catch (error: any) {
      setChatHistory(prev => [...prev, { role: 'ai', content: "Erreur de connexion avec l'IA." }]);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newOps = [...operations];
    const itemToMove = newOps[draggedIndex];
    newOps.splice(draggedIndex, 1);
    newOps.splice(index, 0, itemToMove);
    newOps.forEach((op, i) => op.order = i + 1);
    setOperations(newOps);
    setDraggedIndex(null);
  };

  // --- CALCULATIONS FOR HEADER ---
  const totalMin = operations.reduce((sum, op) => sum + (op.time || 0), 0);
  const tempsArticle = totalMin * 1.20; 

  const prodDay100 = tempsArticle > 0 ? (presenceTime * numWorkers) / tempsArticle : 0;
  const prodDayEff = prodDay100 * (efficiency / 100);
  const hours = presenceTime / 60;
  const prodHour100 = hours > 0 ? prodDay100 / hours : 0;
  const prodHourEff = hours > 0 ? prodDayEff / hours : 0;

  // Prepare suggestions for Machine Input (combining name and classe)
  const machineSuggestions = useMemo(() => {
      return machines.flatMap(m => [m.name, m.classe]);
  }, [machines]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
      
       {/* 1. SINGLE ROW HEADER - RESPONSIVE (UNCHANGED) */}
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

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {/* ... Rest of Gamme UI - Toolbar ... */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 text-lg">
            <ClipboardList className="w-5 h-5 text-slate-400" />
            Gamme de Montage
          </h3>

          <div className="flex items-center gap-3 w-full sm:w-auto">
             <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                 <label className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap mr-1">F.Guide:</label>
                 <div className="relative">
                      <select 
                        value={globalGuide}
                        onChange={(e) => setGlobalGuide(Number(e.target.value))}
                        className="appearance-none w-14 px-1 py-1.5 text-xs font-bold border border-slate-200 rounded focus:border-emerald-500 outline-none bg-white shadow-sm transition-all pr-4 cursor-pointer text-center"
                      >
                         {complexityFactors.map(f => (
                           <option key={f.id} value={f.value}>{f.value}</option>
                         ))}
                      </select>
                      <ChevronDown className="absolute right-0.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                 </div>
                 <button 
                    onClick={() => setShowFabricModal(true)}
                    className={`p-1.5 rounded-md border transition-colors shadow-sm ml-1 ${fabricSettings.enabled ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700'}`}
                    title="Choisir selon le tissu"
                 >
                    <Shirt className="w-3.5 h-3.5" />
                 </button>
                 <button onClick={applyGlobalGuide} title="Appliquer à toute la gamme" className="p-1.5 bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-400 rounded-md border border-slate-200 transition-colors shadow-sm ml-1">
                     <ArrowDownToLine className="w-3.5 h-3.5" />
                 </button>
             </div>

             <div className="w-px h-6 bg-slate-200 hidden sm:block mx-1"></div>

             <button 
               onClick={() => setShowLength(prev => !prev)}
               className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition-colors"
             >
               <Ruler className="w-4 h-4" />
               {showLength ? 'Masquer L' : 'Afficher L'}
             </button>
             
             <button 
               onClick={handleAutoAssignGuides}
               className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold shadow-md shadow-orange-100 transition-all active:scale-95 text-xs uppercase tracking-wide"
               title="Attribuer automatiquement les guides"
             >
               <Wand2 className="w-4 h-4" />
               Auto-Guides
             </button>

             <button 
               onClick={addOperation}
               className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg font-bold shadow-md shadow-emerald-100 transition-all active:scale-95 text-xs uppercase tracking-wide"
             >
               <Plus className="w-4 h-4" />
               Ajouter
             </button>
          </div>
        </div>

        {/* ... Table and other components ... */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-slate-500 border-b border-slate-100">
                <th className="py-4 px-4 w-12 text-center font-bold text-[11px] uppercase tracking-wider text-slate-400">N°</th>
                <th className="py-4 px-4 font-bold text-[11px] uppercase tracking-wider text-slate-400">Description de l'opération</th>
                <th className="py-4 px-4 w-48 font-bold text-[11px] uppercase tracking-wider text-slate-400">Machine</th>
                <th className="py-4 px-4 w-28 text-center font-bold text-[11px] uppercase tracking-wider text-slate-400">F. Guide</th>
                {showLength && (
                  <th className="py-4 px-4 w-24 text-center font-bold text-[11px] uppercase tracking-wider text-indigo-600">L (cm) / Qté</th>
                )}
                <th className="py-4 px-4 w-24 text-center font-bold text-[11px] uppercase tracking-wider text-orange-600">Guide/Acc.</th>
                <th className="py-4 px-4 w-32 text-center font-bold text-[11px] uppercase tracking-wider text-emerald-600">CHRONO</th>
                <th className="py-4 px-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {operations.map((op, index) => {
                const machineValue = op.machineName || (op.machineId ? machines.find(m => m.id === op.machineId)?.name : '') || '';
                let matchedMachine = machines.find(m => m.id === op.machineId);
                if (!matchedMachine && machineValue) {
                     const val = machineValue.trim().toLowerCase();
                     matchedMachine = machines.find(m => (m.name || '').toLowerCase().includes(val) || (m.classe || '').toLowerCase().includes(val));
                }
                const isMachineValid = machineValue === '' || !!matchedMachine;
                
                const { T_Total, isMachine, isCounterMachine } = calculateOpTimes(op, matchedMachine ? matchedMachine.id : '', machines);
                
                const currentChronoSec = Math.round(T_Total * 60);
                
                const isForced = op.forcedTime !== undefined && op.forcedTime !== null;
                const chronoInputClass = isForced 
                    ? "bg-purple-50 text-purple-700 border-purple-200 focus:border-purple-500 focus:bg-purple-100 font-black shadow-sm"
                    : (isMachine ? 'bg-slate-50 text-slate-600 border-slate-200 focus:bg-white focus:border-indigo-300' : 'bg-emerald-50/40 border-emerald-100 text-emerald-700 focus:border-emerald-500 focus:bg-white');

                const currentGuide = op.guideFactor ?? 1.1;
                const assignedGuideName = op.guideName || (op.guideId ? guides.find(g => g.id === op.guideId)?.name : '') || '';

                return (
                  <tr 
                    key={op.id} 
                    draggable
                    onContextMenu={(e) => handleContextMenu(e, op.id)}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`group hover:bg-slate-50 transition-colors ${draggedIndex === index ? 'bg-emerald-50 opacity-50' : ''}`}
                  >
                    <td className="py-3 px-2 text-center cursor-move">
                        <div className="flex items-center justify-center w-8 mx-auto gap-1 text-slate-400 group-hover:text-emerald-600 transition-colors">
                            <span className="font-mono text-xs font-bold">{index + 1}</span>
                            <GripVertical className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </td>
                    <td className="py-3 px-4 relative">
                      <div className="relative w-full">
                          {/* USING EXCEL INPUT FOR DESCRIPTION */}
                          <ExcelInput
                            suggestions={fullVocabulary}
                            value={op.description}
                            onChange={(val) => handleDescriptionChange(val, op.id)}
                            onBlur={(e) => handleDescriptionBlur(e.target.value)}
                            placeholder="Saisir description..."
                            className="relative z-10 w-full bg-transparent border-none outline-none font-medium text-slate-700 placeholder:text-slate-300 focus:placeholder:text-slate-400 text-sm"
                            containerClassName="w-full"
                          />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative">
                        {/* USING EXCEL INPUT FOR MACHINES */}
                        <ExcelInput
                          suggestions={machineSuggestions}
                          value={machineValue}
                          onChange={(val) => handleMachineChange(op.id, val)}
                          className={`w-full bg-slate-100/50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400 ${!isMachineValid && machineValue ? 'text-rose-500 font-bold border-rose-200 bg-rose-50/50' : 'text-slate-700'}`}
                          placeholder="Mac / Code"
                          containerClassName="w-full"
                        />
                      </div>
                    </td>
                    {/* ... Rest of row cells ... */}
                    <td className="py-3 px-2">
                         <div className="relative group/select">
                           <select
                            value={currentGuide}
                            onChange={(e) => updateOperation(op.id, 'guideFactor', Number(e.target.value))}
                            className="w-full bg-slate-100/50 border border-slate-200 rounded-lg pl-2 pr-6 py-2 text-center text-xs font-bold outline-none focus:border-emerald-500 transition-all text-slate-600 appearance-none cursor-pointer hover:bg-white hover:shadow-sm"
                           >
                             {complexityFactors.map(f => (
                                 <option key={f.id} value={f.value}>{f.value}</option>
                             ))}
                           </select>
                           <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none group-hover/select:text-emerald-500 transition-colors" />
                        </div>
                    </td>
                    {showLength && (
                      <td className="py-3 px-4">
                        <div className="relative">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            onKeyDown={(e) => ["-", "e", "+", "E", ".", ","].includes(e.key) && e.preventDefault()}
                            value={op.length === 0 ? '' : op.length}
                            onChange={(e) => updateOperation(op.id, 'length', Math.floor(Number(e.target.value)))}
                            onFocus={(e) => e.target.select()}
                            className={`w-full border rounded-lg px-2 py-2 text-center text-xs font-mono font-bold outline-none transition-all ${
                                isCounterMachine 
                                ? 'bg-amber-50 text-amber-700 border-amber-200 focus:border-amber-400' 
                                : 'bg-indigo-50/30 text-indigo-700 border-indigo-100 focus:border-indigo-500'
                            }`}
                            placeholder={isCounterMachine ? "Qté" : "-"}
                          />
                        </div>
                      </td>
                    )}
                    <td className="py-3 px-4 text-center">
                        <div className="relative flex items-center justify-center gap-1 group/guide-col">
                            <input 
                                type="text"
                                value={assignedGuideName}
                                onChange={(e) => updateGuideName(op.id, e.target.value)}
                                placeholder="-"
                                className={`w-full px-2 py-1.5 rounded-lg border text-xs font-bold outline-none transition-all ${
                                    assignedGuideName 
                                    ? 'bg-orange-50 border-orange-200 text-orange-700 focus:ring-1 focus:ring-orange-300' 
                                    : 'bg-white border-dashed border-slate-200 text-slate-500 hover:border-orange-300 focus:border-orange-400'
                                }`}
                            />
                            <button 
                                onClick={() => setShowGuideModal({ opId: op.id, machineName: machineValue })}
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-orange-500 transition-colors opacity-0 group-hover/guide-col:opacity-100"
                                title="Choisir dans la liste"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                    </td>
                    <td className="py-3 px-4">
                       <div className="relative flex items-center justify-center">
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={currentChronoSec === 0 ? '' : currentChronoSec}
                            onKeyDown={(e) => ["-", "e", "+", "E"].includes(e.key) && e.preventDefault()}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => {
                                const valSec = Math.max(0, Number(e.target.value));
                                const valMin = valSec / 60;
                                updateOperation(op.id, 'forcedTime', valMin);
                            }}
                            className={`w-full border rounded-lg px-2 py-2 text-center text-xs font-mono outline-none transition-all placeholder:text-emerald-200 ${chronoInputClass}`}
                            placeholder="0"
                            title={isForced ? "Temps forcé manuellement" : "Temps calculé"}
                          />
                       </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={() => deleteOperation(op.id)} 
                        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {operations.length > 0 && (
                 <tr>
                    <td colSpan={showLength ? 8 : 7} className="py-3 px-4">
                      <button 
                        onClick={addOperation}
                        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 font-medium text-sm group"
                      >
                        <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Ajouter une ligne
                      </button>
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals ... (Unchanged) */}
      {showFabricModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowFabricModal(false)} />
              {/* Content of Fabric Modal - Same as previous but ensures file integrity */}
              <div className="bg-white rounded-xl shadow-xl w-full max-w-sm relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-700 flex items-center gap-2">
                          <Shirt className="w-4 h-4 text-indigo-500" />
                          Type de Tissu
                      </h3>
                      <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setFabricSettings(s => ({...s, enabled: !s.enabled}))}>
                              <span className={`text-[10px] font-bold ${fabricSettings.enabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                                  {fabricSettings.enabled ? 'ACTIF' : 'INACTIF'}
                              </span>
                              <button 
                                className={`w-10 h-5 rounded-full p-1 transition-colors relative flex items-center ${fabricSettings.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                              >
                                <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ${fabricSettings.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                              </button>
                          </div>
                          <button onClick={() => setShowFabricModal(false)} className="text-slate-400 hover:text-slate-600 ml-2"><X className="w-4 h-4" /></button>
                      </div>
                  </div>
                  
                  {/* BODY */}
                  <div className="p-4 space-y-3">
                      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                          Ajustez le temps ajouté automatiquement à <strong className="text-slate-700">chaque opération</strong> en fonction de la difficulté du tissu.
                      </p>
                      
                      {/* EASY */}
                      <div 
                          onClick={() => selectFabricLevel('easy')}
                          className={`w-full p-3 rounded-lg border transition-all text-left flex justify-between items-center cursor-pointer ${
                              fabricSettings.selected === 'easy' 
                              ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-200' 
                              : 'border-slate-200 bg-white hover:border-emerald-200'
                          }`}
                      >
                          <div>
                              <div className="font-bold text-emerald-800 text-sm">Facile / Stable</div>
                              <div className="text-[10px] text-emerald-600">Coton, Popeline</div>
                          </div>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <span className="text-xs text-emerald-600 font-bold">+</span>
                              <input 
                                  type="number" 
                                  min="0"
                                  value={fabricSettings.values.easy} 
                                  onChange={(e) => updateFabricValue('easy', Number(e.target.value))}
                                  className="w-10 bg-white border border-emerald-200 rounded px-1 text-center font-bold text-emerald-700 text-sm outline-none focus:border-emerald-500"
                              />
                              <span className="text-xs text-emerald-600 font-bold">s</span>
                          </div>
                      </div>

                      {/* MEDIUM */}
                      <div 
                          onClick={() => selectFabricLevel('medium')}
                          className={`w-full p-3 rounded-lg border transition-all text-left flex justify-between items-center cursor-pointer ${
                              fabricSettings.selected === 'medium' 
                              ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200' 
                              : 'border-slate-200 bg-white hover:border-indigo-200'
                          }`}
                      >
                          <div>
                              <div className="font-bold text-indigo-800 text-sm">Moyen / Standard</div>
                              <div className="text-[10px] text-indigo-600">Jersey, Twill</div>
                          </div>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <span className="text-xs text-indigo-600 font-bold">+</span>
                              <input 
                                  type="number" 
                                  min="0"
                                  value={fabricSettings.values.medium} 
                                  onChange={(e) => updateFabricValue('medium', Number(e.target.value))}
                                  className="w-10 bg-white border border-indigo-200 rounded px-1 text-center font-bold text-indigo-700 text-sm outline-none focus:border-indigo-500"
                              />
                              <span className="text-xs text-indigo-600 font-bold">s</span>
                          </div>
                      </div>

                      {/* HARD */}
                      <div 
                          onClick={() => selectFabricLevel('hard')}
                          className={`w-full p-3 rounded-lg border transition-all text-left flex justify-between items-center cursor-pointer ${
                              fabricSettings.selected === 'hard' 
                              ? 'border-rose-500 bg-rose-50 ring-1 ring-rose-200' 
                              : 'border-slate-200 bg-white hover:border-rose-200'
                          }`}
                      >
                          <div>
                              <div className="font-bold text-rose-800 text-sm">Difficile / Fragile</div>
                              <div className="text-[10px] text-rose-600">Soie, Mousseline</div>
                          </div>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <span className="text-xs text-rose-600 font-bold">+</span>
                              <input 
                                  type="number" 
                                  min="0"
                                  value={fabricSettings.values.hard} 
                                  onChange={(e) => updateFabricValue('hard', Number(e.target.value))}
                                  className="w-10 bg-white border border-rose-200 rounded px-1 text-center font-bold text-rose-700 text-sm outline-none focus:border-rose-500"
                              />
                              <span className="text-xs text-rose-600 font-bold">s</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* GUIDE SELECTION MODAL */}
      {showGuideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowGuideModal(null)} />
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div>
                          <h3 className="font-bold text-slate-700 flex items-center gap-2">
                              <Component className="w-4 h-4 text-orange-500" />
                              Choisir un Guide
                          </h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Machine: {showGuideModal.machineName || 'Non spécifiée'}</p>
                      </div>
                      <button onClick={() => setShowGuideModal(null)}><X className="w-4 h-4 text-slate-400 hover:text-slate-600" /></button>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="p-3 border-b border-slate-100 bg-white sticky top-0 z-10">
                      <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                              type="text" 
                              placeholder="Rechercher (ex: Téflon, Ourleur...)"
                              value={guideSearch}
                              onChange={(e) => setGuideSearch(e.target.value)}
                              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-orange-400 transition-all"
                              autoFocus
                          />
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
                      {filteredGuides.length > 0 ? (
                          filteredGuides.map(guide => (
                              <button 
                                  key={guide.id} 
                                  onClick={() => assignGuide(showGuideModal.opId, guide)}
                                  className="w-full p-3 rounded-lg border border-slate-100 hover:border-orange-200 hover:bg-orange-50 transition-all text-left group"
                              >
                                  <div className="flex justify-between items-start">
                                      <div className="font-bold text-slate-700 text-sm group-hover:text-orange-700">{guide.name}</div>
                                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 uppercase font-bold">{guide.category}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{guide.description}</p>
                                  {guide.useCase && (
                                      <div className="flex items-center gap-1 mt-1.5">
                                          <Info className="w-3 h-3 text-slate-400" />
                                          <span className="text-[10px] text-slate-400 italic">Pour: {guide.useCase}</span>
                                      </div>
                                  )}
                              </button>
                          ))
                      ) : (
                          <div className="text-center py-8 text-slate-400 text-sm">
                              Aucun guide trouvé pour cette machine.
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* CONTEXT MENU - USING PORTAL */}
      {contextMenu && contextMenu.visible && createPortal(
        <div 
            className="absolute bg-white border border-slate-200 rounded-xl shadow-2xl z-[9999] py-1.5 w-52 text-xs font-bold text-slate-700 animate-in fade-in zoom-in-95 duration-100 origin-top-left overflow-hidden ring-4 ring-slate-100/50"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()} 
        >
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

      {/* AI Assistant Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isAnalyzing && setShowAiModal(false)} />
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                {/* AI Header */}
                <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-5 text-white relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
                        <Sparkles className="w-24 h-24" />
                    </div>
                    <h3 className="text-lg font-bold flex items-center gap-2 relative z-10">
                        <Bot className="w-5 h-5 text-yellow-300" />
                        Assistant Intelligent
                    </h3>
                    <p className="text-rose-100 text-xs mt-1 relative z-10">
                        Je "lis" votre gamme en temps réel pour apprendre et vous aider.
                    </p>
                    <button onClick={() => setShowAiModal(false)} disabled={isAnalyzing} className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-slate-50 space-y-4">
                    {chatHistory.length === 0 && (
                        <div className="text-center py-8 px-4">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                                <MessageSquare className="w-6 h-6 text-rose-400" />
                            </div>
                            <p className="text-slate-500 text-sm font-medium">
                                Bonjour ! J'analyse les <strong className="text-slate-800">{operations.length} opérations</strong> que vous avez saisies.
                            </p>
                            <p className="text-xs text-slate-400 mt-2">
                                Demandez-moi d'identifier le modèle, de vérifier l'équilibrage, ou de suggérer des temps.
                            </p>
                            
                            <div className="flex flex-wrap gap-2 justify-center mt-6">
                                <button onClick={() => { setAiPrompt("Quel est ce modèle ?"); handleAiAssist(); }} className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:border-rose-300 hover:text-rose-600 transition-colors">
                                    Quel est ce modèle ?
                                </button>
                                <button onClick={() => { setAiPrompt("Analyse l'équilibrage"); handleAiAssist(); }} className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:border-rose-300 hover:text-rose-600 transition-colors">
                                    Analyse l'équilibrage
                                </button>
                            </div>
                        </div>
                    )}

                    {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-rose-600 text-white rounded-tr-sm' 
                                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
                            }`}>
                                {msg.content.split('\n').map((line, idx) => (
                                    <p key={idx} className={idx > 0 ? 'mt-1' : ''}>{line}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                    
                    {isAnalyzing && (
                        <div className="flex justify-start">
                            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm flex items-center gap-2 text-sm text-slate-500">
                                <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                                <span>Analyse de la gamme en cours...</span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                    <input 
                        type="text" 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAiAssist()}
                        disabled={isAnalyzing}
                        placeholder="Posez une question sur votre gamme..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                    <button 
                        onClick={handleAiAssist}
                        disabled={!aiPrompt.trim() || isAnalyzing}
                        className={`p-2.5 rounded-xl transition-all ${
                            !aiPrompt.trim() || isAnalyzing 
                            ? 'bg-slate-100 text-slate-300' 
                            : 'bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-200'
                        }`}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
