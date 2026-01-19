
import React, { useState } from 'react';
import { 
  FileText, 
  ClipboardList, 
  Activity, 
  Scale, 
  LayoutTemplate, 
  Banknote, 
  Save,
  ArrowRight,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

import FicheTechnique from './FicheTechnique';
import Gamme from './Gamme';
import AnalyseTechnologique from './AnalyseTechnologique';
import Balancing from './Balancing';
import Implantation from './Implantation';
import CostCalculator from './CostCalculator';

import { Machine, Operation, ComplexityFactor, StandardTime, Guide, Poste, FicheData } from '../types';

interface ModelWorkflowProps {
  // Shared Data Props
  machines: Machine[];
  operations: Operation[];
  setOperations: React.Dispatch<React.SetStateAction<Operation[]>>;
  speedFactors: any[];
  complexityFactors: ComplexityFactor[];
  standardTimes: StandardTime[];
  guides: Guide[];
  
  // Project State
  articleName: string;
  setArticleName: (name: string) => void;
  efficiency: number;
  setEfficiency: React.Dispatch<React.SetStateAction<number>>;
  numWorkers: number;
  setNumWorkers: React.Dispatch<React.SetStateAction<number>>;
  presenceTime: number;
  setPresenceTime: React.Dispatch<React.SetStateAction<number>>;
  bf: number;
  globalStats: { totalTime: number; tempsArticle: number; bf: number };
  
  // Fiche Specifics
  ficheData: FicheData;
  setFicheData: React.Dispatch<React.SetStateAction<FicheData>>;
  ficheImages: { front: string | null; back: string | null };
  setFicheImages: React.Dispatch<React.SetStateAction<{ front: string | null; back: string | null }>>;

  // Balancing & Implantation State
  assignments: Record<string, string[]>;
  setAssignments: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  postes: Poste[];
  setPostes: React.Dispatch<React.SetStateAction<Poste[]>>;

  // Autocomplete
  isAutocompleteEnabled: boolean;
  userVocabulary: string[];
  setUserVocabulary: React.Dispatch<React.SetStateAction<string[]>>;

  // Actions
  onSaveToLibrary: () => void;
}

export default function ModelWorkflow({
  machines, operations, setOperations, speedFactors, complexityFactors, standardTimes, guides,
  articleName, setArticleName, efficiency, setEfficiency, numWorkers, setNumWorkers, presenceTime, setPresenceTime, bf, globalStats,
  ficheData, setFicheData, ficheImages, setFicheImages,
  assignments, setAssignments, postes, setPostes,
  isAutocompleteEnabled, userVocabulary, setUserVocabulary,
  onSaveToLibrary
}: ModelWorkflowProps) {

  const [currentStep, setCurrentStep] = useState<'fiche' | 'gamme' | 'analyse' | 'equilibrage' | 'implantation' | 'couts'>('fiche');

  const steps = [
    { id: 'fiche', label: '1. Fiche Technique', icon: FileText },
    { id: 'gamme', label: '2. Gamme', icon: ClipboardList },
    { id: 'analyse', label: '3. Analyse', icon: Activity },
    { id: 'equilibrage', label: '4. Équilibrage', icon: Scale },
    { id: 'implantation', label: '5. Implantation', icon: LayoutTemplate },
    { id: 'couts', label: '6. Coûts & Budget', icon: Banknote },
  ];

  const handleNext = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1].id as any);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      
      {/* WORKFLOW HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 pt-4 pb-0 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <span className="bg-slate-900 text-white px-2 py-1 rounded text-xs uppercase tracking-widest">Atelier</span>
                    {articleName || 'Nouveau Modèle'}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Conception et Industrialisation</p>
            </div>
            <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-end">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Temps Total</span>
                    <span className="font-mono font-bold text-slate-700 text-xs">{globalStats.tempsArticle.toFixed(2)} min</span>
                </div>
                <button 
                    onClick={onSaveToLibrary}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md shadow-emerald-200 transition-all active:scale-95"
                >
                    <Save className="w-4 h-4" />
                    <span>Enregistrer le Modèle</span>
                </button>
            </div>
        </div>

        {/* TABS SCROLL */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0">
            {steps.map((step, idx) => {
                const isActive = currentStep === step.id;
                const isPast = steps.findIndex(s => s.id === currentStep) > idx;
                
                return (
                    <button
                        key={step.id}
                        onClick={() => setCurrentStep(step.id as any)}
                        className={`
                            relative flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap
                            ${isActive ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-t-lg'}
                        `}
                    >
                        <div className={`p-1 rounded-full ${isActive ? 'bg-indigo-100 text-indigo-600' : (isPast ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400')}`}>
                            {isPast ? <CheckCircle2 className="w-3 h-3" /> : <step.icon className="w-3 h-3" />}
                        </div>
                        {step.label}
                    </button>
                );
            })}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="max-w-[1600px] mx-auto min-h-full">
            
            {currentStep === 'fiche' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <FicheTechnique 
                        data={ficheData} setData={setFicheData}
                        articleName={articleName} setArticleName={setArticleName}
                        totalTime={globalStats.totalTime} tempsArticle={globalStats.tempsArticle}
                        numWorkers={numWorkers} setNumWorkers={setNumWorkers}
                        efficiency={efficiency} setEfficiency={setEfficiency}
                        images={ficheImages} setImages={setFicheImages}
                        onNext={handleNext}
                    />
                </div>
            )}

            {currentStep === 'gamme' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <Gamme 
                        machines={machines} operations={operations} setOperations={setOperations}
                        articleName={articleName} setArticleName={setArticleName}
                        efficiency={efficiency} setEfficiency={setEfficiency}
                        numWorkers={numWorkers} setNumWorkers={setNumWorkers}
                        presenceTime={presenceTime} setPresenceTime={setPresenceTime}
                        bf={globalStats.bf} complexityFactors={complexityFactors}
                        standardTimes={standardTimes} guides={guides}
                        isAutocompleteEnabled={isAutocompleteEnabled}
                        userVocabulary={userVocabulary} setUserVocabulary={setUserVocabulary}
                    />
                    <div className="flex justify-end mt-4">
                        <button onClick={handleNext} className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline">
                            Continuer vers Analyse <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {currentStep === 'analyse' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <AnalyseTechnologique 
                        machines={machines} operations={operations} setOperations={setOperations}
                        articleName={articleName} efficiency={efficiency} setEfficiency={setEfficiency}
                        numWorkers={numWorkers} setNumWorkers={setNumWorkers}
                        presenceTime={presenceTime} setPresenceTime={setPresenceTime}
                        bf={globalStats.bf} complexityFactors={complexityFactors} standardTimes={standardTimes}
                    />
                </div>
            )}

            {currentStep === 'equilibrage' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <Balancing 
                        operations={operations} efficiency={efficiency} setEfficiency={setEfficiency}
                        bf={globalStats.bf} articleName={articleName}
                        numWorkers={numWorkers} setNumWorkers={setNumWorkers}
                        presenceTime={presenceTime} setPresenceTime={setPresenceTime}
                        assignments={assignments} setAssignments={setAssignments}
                        postes={postes} setPostes={setPostes} machines={machines}
                    />
                </div>
            )}

            {currentStep === 'implantation' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full">
                    <Implantation 
                        bf={globalStats.bf} operations={operations}
                        numWorkers={numWorkers} setNumWorkers={setNumWorkers}
                        presenceTime={presenceTime} setPresenceTime={setPresenceTime}
                        efficiency={efficiency} setEfficiency={setEfficiency}
                        articleName={articleName}
                        assignments={assignments} postes={postes} setPostes={setPostes} machines={machines}
                    />
                </div>
            )}

            {currentStep === 'couts' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <CostCalculator 
                        initialArticleName={articleName}
                        initialTotalTime={globalStats.tempsArticle}
                        initialImage={ficheImages.front}
                        initialDate={ficheData.date}
                        initialCostMinute={ficheData.costMinute}
                    />
                </div>
            )}

        </div>
      </div>
    </div>
  );
}
