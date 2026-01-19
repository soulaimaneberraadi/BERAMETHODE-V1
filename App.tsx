
import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  Activity,
  FolderOpen,
  Scissors,
  Info
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import Machin from './components/Machin';
import Library from './components/Library';
import InfoPage from './components/Info'; // Renamed Profil to Info
import ModelWorkflow from './components/ModelWorkflow';

import { Machine, Operation, SpeedFactor, ComplexityFactor, StandardTime, Guide, Poste, FicheData, ModelData } from './types';

// Mock Data Initialization
const INITIAL_MACHINES: Machine[] = [
  { id: 'm1', name: 'Piqueuse Plate', classe: '301', speed: 3000, speedMajor: 1.01, cofs: 1.12, active: true },
  { id: 'm2', name: 'Surjeteuse', classe: '504', speed: 5500, speedMajor: 1.01, cofs: 1.12, active: true },
  { id: 'm3', name: 'Recouvreuse', classe: '256', speed: 4500, speedMajor: 1.01, cofs: 1.12, active: true },
  { id: 'm4', name: 'Boutonnière', classe: 'BTN', speed: 2500, speedMajor: 1.0, cofs: 1.0, active: true },
  { id: 'm5', name: 'Pose Bouton', classe: 'POSE', speed: 2000, speedMajor: 1.0, cofs: 1.0, active: true },
  { id: 'm6', name: 'Bartack', classe: 'BRIDE', speed: 2500, speedMajor: 1.0, cofs: 1.0, active: true },
  { id: 'm7', name: 'Manuel', classe: 'MAN', speed: 0, speedMajor: 1.0, cofs: 1.0, active: true },
  { id: 'm8', name: 'Repassage', classe: 'FER', speed: 0, speedMajor: 1.0, cofs: 1.0, active: true },
];

const INITIAL_FACTORS: ComplexityFactor[] = [
    { id: 'c1', label: 'Standard (1.1)', value: 1.1 },
    { id: 'c2', label: 'Facile (1.0)', value: 1.0 },
    { id: 'c3', label: 'Difficile (1.2)', value: 1.2 },
    { id: 'c4', label: 'Très Difficile (1.3)', value: 1.3 },
];

const INITIAL_SPEED_FACTORS: SpeedFactor[] = [
    { id: 'sf1', min: 0, max: 2500, value: 1.0 },
    { id: 'sf2', min: 2501, max: 4000, value: 1.05 },
    { id: 'sf3', min: 4001, max: 5500, value: 1.10 },
    { id: 'sf4', min: 5501, max: 9999, value: 1.15 },
];

const INITIAL_STANDARD_TIMES: StandardTime[] = [
    { id: 'st1', label: 'Prise de pièce', value: 0.04, unit: 'min' },
    { id: 'st2', label: 'Positionnement sous pied', value: 0.03, unit: 'min' },
    { id: 'st3', label: 'Evacuation', value: 0.03, unit: 'min' },
    { id: 'st4', label: 'Coupe fil manuel', value: 0.08, unit: 'min' },
    { id: 'st5', label: 'Changement canette', value: 0.50, unit: 'min' },
];

const INITIAL_GUIDES: Guide[] = [
    { id: 'g1', name: 'Guide Bordeur', category: 'Bordeurs & Ourleurs', machineType: 'Piqueuse Plate (301)', description: 'Pour poser un biais à cheval sur le bord du tissu.', useCase: 'Encolure, Emmanchure' },
    { id: 'g2', name: 'Pied Fronceur', category: 'Fronces & Plis', machineType: 'Piqueuse Plate (301)', description: 'Permet de froncer le tissu inférieur tout en cousant le tissu supérieur.', useCase: 'Robes, Jupes' },
    { id: 'g3', name: 'Pied Téflon', category: 'Matières Difficiles', machineType: 'Piqueuse Plate (301)', description: 'Glisse mieux sur les matières plastiques, cuir, ou simili.', useCase: 'Cuir, Simili, Vinyle' },
    { id: 'g4', name: 'Guide Ourleur', category: 'Bordeurs & Ourleurs', machineType: 'Piqueuse Plate (301)', description: 'Réalise un ourlet roulotté propre et régulier.', useCase: 'Bas de chemise, Foulards' },
    { id: 'g5', name: 'Guide Aimanté', category: 'Guides & Jauges', machineType: 'Toutes', description: 'Se fixe magnétiquement sur la plaque pour guider le tissu.', useCase: 'Opérations droites' },
    { id: 'g6', name: 'Pied Compensé', category: 'Surpiqûre & Précision', machineType: 'Piqueuse Plate (301)', description: 'Idéal pour les surpiqûres régulières (1mm, 5mm...).', useCase: 'Cols, Poignets' },
    { id: 'g7', name: 'Guide Passepoil', category: 'Opérations Spéciales', machineType: 'Piqueuse Plate (301)', description: 'Facilite la pose de passepoil entre deux épaisseurs.', useCase: 'Poches, Coussins' },
    { id: 'g8', name: 'Guide Rabatteur', category: 'Bordeurs & Ourleurs', machineType: 'Piqueuse Plate (301)', description: 'Pour réaliser des coutures rabattues (double piqure).', useCase: 'Chemises, Jeans' },
    { id: 'g9', name: 'Pied Fermeture', category: 'Opérations Spéciales', machineType: 'Piqueuse Plate (301)', description: 'Pied étroit pour coudre au plus près des mailles du zip.', useCase: 'Fermetures Éclair' },
];

const INITIAL_MOCK_MODELS: ModelData[] = [
  {
    id: "m1",
    filename: "Chemise_H_Classique.json",
    image: null,
    meta_data: { nom_modele: "Chemise Homme Classique", date_creation: "2026-01-15", date_lancement: "2026-02-01", total_temps: 12.50, effectif: 12 },
    gamme_operatoire: []
  },
  {
    id: "m2",
    filename: "Pantalon_Denim_5P.json",
    image: null,
    meta_data: { nom_modele: "Pantalon Denim 5 Poches", date_creation: "2026-01-18", date_lancement: "2026-02-10", total_temps: 18.20, effectif: 18 },
    gamme_operatoire: []
  },
  {
    id: "m3",
    filename: "TShirt_Col_V.json",
    image: null,
    meta_data: { nom_modele: "T-Shirt Col V Basic", date_creation: "2026-01-10", date_lancement: "2026-01-25", total_temps: 4.50, effectif: 6 },
    gamme_operatoire: []
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState('studio');
  
  // Domain Data
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [speedFactors, setSpeedFactors] = useState<SpeedFactor[]>(INITIAL_SPEED_FACTORS);
  const [complexityFactors, setComplexityFactors] = useState<ComplexityFactor[]>(INITIAL_FACTORS);
  const [standardTimes, setStandardTimes] = useState<StandardTime[]>(INITIAL_STANDARD_TIMES);
  const [guides, setGuides] = useState<Guide[]>(INITIAL_GUIDES);

  // Library State
  const [savedModels, setSavedModels] = useState<ModelData[]>(INITIAL_MOCK_MODELS);

  // Project Data
  const [articleName, setArticleName] = useState('');
  const [efficiency, setEfficiency] = useState(85);
  const [numWorkers, setNumWorkers] = useState(12);
  const [presenceTime, setPresenceTime] = useState(480); // 8 hours in minutes

  // Fiche Technique Data
  const [ficheData, setFicheData] = useState<FicheData>({
    date: '',
    client: '',
    designation: '',
    color: '',
    quantity: 0,
    chaine: '',
    targetEfficiency: 85,
    unitCost: 0,
    clientPrice: 0,
    observations: '',
    costMinute: 1.50
  });
  const [ficheImages, setFicheImages] = useState<{front: string | null, back: string | null}>({ front: null, back: null });

  // Balancing State (Shared)
  const [balancingAssignments, setBalancingAssignments] = useState<Record<string, string[]>>({});
  const [balancingPostes, setBalancingPostes] = useState<Poste[]>([]);

  // UI Settings
  const [isAutocompleteEnabled, setIsAutocompleteEnabled] = useState(true);
  const [userVocabulary, setUserVocabulary] = useState<string[]>([]);

  // Derived Stats
  const globalStats = useMemo(() => {
     const totalMin = operations.reduce((sum, op) => sum + (op.time || 0), 0);
     const tempsArticle = totalMin * 1.20; 
     
     const bf = numWorkers > 0 ? tempsArticle / numWorkers : 0;

     return {
         totalTime: totalMin,
         tempsArticle,
         bf
     };
  }, [operations, numWorkers]);

  // Handle Loading a Model from Library
  const handleLoadModel = (model: ModelData) => {
      setArticleName(model.meta_data.nom_modele);
      setOperations(model.gamme_operatoire || []);
      setNumWorkers(model.meta_data.effectif || 12);
      
      setFicheData(prev => ({
          ...prev,
          designation: model.meta_data.nom_modele,
          date: model.meta_data.date_lancement || model.meta_data.date_creation
      }));
      
      if (model.image) {
          setFicheImages({ front: model.image, back: null });
      }

      setCurrentView('studio');
  };

  // Handle Saving current work to Library
  const handleSaveToLibrary = () => {
      if (!articleName) {
          alert("Veuillez donner un nom au modèle avant de sauvegarder.");
          return;
      }

      const newModel: ModelData = {
          id: Date.now().toString(),
          filename: `${articleName.replace(/\s+/g, '_')}_v${new Date().toISOString().split('T')[0]}.json`,
          image: ficheImages.front, 
          meta_data: {
              nom_modele: articleName,
              date_creation: new Date().toISOString().split('T')[0],
              date_lancement: ficheData.date, 
              total_temps: globalStats.tempsArticle,
              effectif: numWorkers
          },
          gamme_operatoire: operations
      };

      setSavedModels(prev => [newModel, ...prev]);
      alert("Modèle sauvegardé dans la bibliothèque !");
      setCurrentView('library');
  };

  // Navigation Menu
  const menuItems = [
    { id: 'studio', label: 'Atelier (Nouveau Modèle)', icon: Scissors },
    { id: 'library', label: 'Bibliothèque', icon: FolderOpen },
    { id: 'parametres', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
        
        {/* TOP NAVIGATION BAR */}
        <header className="bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 py-2 shrink-0 z-50 shadow-md relative h-16 gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-2 pr-6 border-r border-slate-800 mr-2 shrink-0">
                 <div className="text-white bg-slate-800 p-1.5 rounded-lg border border-slate-700">
                    <Activity className="w-5 h-5" />
                 </div>
                 <span className="font-black text-lg text-white tracking-tight hidden sm:inline-block">BERAMETHODE</span>
            </div>

            {/* Responsive Menu */}
            <nav 
                className="flex-1 flex items-center gap-2 px-2 overflow-x-auto no-scrollbar mask-linear-fade"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                            currentView === item.id 
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 ring-1 ring-emerald-500' 
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        <item.icon className={`w-4 h-4 ${currentView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Right Side: Version & Profile */}
            <div className="flex items-center gap-4 pl-4 border-l border-slate-800 shrink-0 ml-2">
                <button 
                    onClick={() => setCurrentView('info')}
                    className={`flex items-center gap-3 transition-opacity hover:opacity-80 group ${currentView === 'info' ? 'opacity-100' : 'opacity-90'}`}
                >
                    <div className="text-right hidden sm:block">
                        <div className={`text-xs font-bold ${currentView === 'info' ? 'text-white' : 'text-slate-300'}`}>Soulaiman</div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase">Créateur</div>
                    </div>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-colors shadow-sm ring-1 overflow-hidden ${currentView === 'info' ? 'bg-indigo-600 text-white border-indigo-600 ring-indigo-200' : 'bg-slate-800 text-slate-300 border-slate-700 ring-slate-800'}`}>
                        SB
                    </div>
                </button>
            </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-slate-50/50">
            <div className="flex-1 overflow-hidden relative"> 
                <div className="w-full h-full"> 
                    
                    {currentView === 'dashboard' && (
                        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto h-full custom-scrollbar">
                            <Dashboard 
                                operations={operations}
                                efficiency={efficiency}
                                setEfficiency={setEfficiency}
                                workHours={presenceTime / 60}
                                setWorkHours={(h) => setPresenceTime(h * 60)}
                            />
                        </div>
                    )}

                    {currentView === 'studio' && (
                        <ModelWorkflow 
                            machines={machines}
                            operations={operations} setOperations={setOperations}
                            speedFactors={speedFactors} complexityFactors={complexityFactors}
                            standardTimes={standardTimes} guides={guides}
                            articleName={articleName} setArticleName={setArticleName}
                            efficiency={efficiency} setEfficiency={setEfficiency}
                            numWorkers={numWorkers} setNumWorkers={setNumWorkers}
                            presenceTime={presenceTime} setPresenceTime={setPresenceTime}
                            bf={globalStats.bf} globalStats={globalStats}
                            ficheData={ficheData} setFicheData={setFicheData}
                            ficheImages={ficheImages} setFicheImages={setFicheImages}
                            assignments={balancingAssignments} setAssignments={setBalancingAssignments}
                            postes={balancingPostes} setPostes={setBalancingPostes}
                            isAutocompleteEnabled={isAutocompleteEnabled}
                            userVocabulary={userVocabulary} setUserVocabulary={setUserVocabulary}
                            onSaveToLibrary={handleSaveToLibrary}
                        />
                    )}

                    {currentView === 'library' && (
                        <div className="h-full overflow-hidden">
                            <Library 
                                models={savedModels} 
                                onLoadModel={handleLoadModel}
                                onDeleteModel={(id) => setSavedModels(prev => prev.filter(m => m.id !== id))}
                                onDuplicateModel={(model) => {
                                    const newModel = { ...model, id: Date.now().toString(), meta_data: { ...model.meta_data, nom_modele: model.meta_data.nom_modele + " (Copie)" }};
                                    setSavedModels(prev => [newModel, ...prev]);
                                }}
                                onRenameModel={(id, newName) => {
                                    setSavedModels(prev => prev.map(m => m.id === id ? { ...m, meta_data: { ...m.meta_data, nom_modele: newName }} : m));
                                }}
                            />
                        </div>
                    )}

                    {currentView === 'parametres' && (
                        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto h-full custom-scrollbar">
                            <Machin 
                                machines={machines}
                                onSave={(m) => setMachines(prev => {
                                    const exists = prev.find(pm => pm.id === m.id);
                                    if(exists) return prev.map(pm => pm.id === m.id ? m : pm);
                                    return [...prev, m];
                                })}
                                onDelete={(id) => setMachines(prev => prev.filter(m => m.id !== id))}
                                onToggle={(id) => setMachines(prev => prev.map(m => m.id === id ? {...m, active: !m.active} : m))}
                                speedFactors={speedFactors} setSpeedFactors={setSpeedFactors}
                                complexityFactors={complexityFactors} setComplexityFactors={setComplexityFactors}
                                standardTimes={standardTimes} setStandardTimes={setStandardTimes}
                                guides={guides} setGuides={setGuides}
                                isAutocompleteEnabled={isAutocompleteEnabled} setIsAutocompleteEnabled={setIsAutocompleteEnabled}
                            />
                        </div>
                    )}

                    {currentView === 'info' && (
                        <InfoPage />
                    )}
                </div>
            </div>
        </main>
    </div>
  );
}
