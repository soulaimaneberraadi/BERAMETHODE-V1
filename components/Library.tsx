
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  FolderOpen, 
  MoreVertical, 
  FileJson, 
  Clock, 
  Users, 
  Calendar, 
  Download, 
  Copy, 
  Trash2, 
  Edit2, 
  SortAsc, 
  Filter, 
  Upload,
  AlertTriangle
} from 'lucide-react';
import { ModelData } from '../types';

interface LibraryProps {
  models: ModelData[];
  onLoadModel: (model: ModelData) => void;
  onImportModel: (file: File) => void;
  onDeleteModel: (id: string) => void;
  onDuplicateModel: (model: ModelData) => void;
  onRenameModel: (id: string, newName: string) => void;
}

export default function Library({ 
  models, 
  onLoadModel, 
  onImportModel,
  onDeleteModel, 
  onDuplicateModel, 
  onRenameModel 
}: LibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "time">("date");
  
  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; modelId: string } | null>(null);
  
  // Rename State
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, name: string } | null>(null);

  // Close context menu on global click
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // --- ACTIONS ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          onImportModel(file);
      }
  };

  const triggerFileInput = () => {
      if (fileInputRef.current) {
          // Reset value to allow selecting the same file again if needed
          fileInputRef.current.value = '';
          fileInputRef.current.click();
      }
  };

  const handleRenameStart = (model: ModelData) => {
    setRenamingId(model.id);
    setRenameValue(model.meta_data.nom_modele);
    setContextMenu(null);
  };

  const handleRenameSubmit = (id: string) => {
    if (!renameValue.trim()) {
        setRenamingId(null);
        return;
    }
    onRenameModel(id, renameValue);
    setRenamingId(null);
  };

  const handleDuplicate = (model: ModelData) => {
    onDuplicateModel(model);
    setContextMenu(null);
  };

  const handleExport = (model: ModelData) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(model, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", model.filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setContextMenu(null);
  };

  // --- FILTER & SORT ---
  const filteredModels = models
    .filter(m => 
      m.meta_data.nom_modele.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.filename.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.meta_data.date_creation).getTime() - new Date(a.meta_data.date_creation).getTime();
      if (sortBy === 'name') return a.meta_data.nom_modele.localeCompare(b.meta_data.nom_modele);
      if (sortBy === 'time') return b.meta_data.total_temps - a.meta_data.total_temps;
      return 0;
    });

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-300 pb-20 p-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-indigo-500" />
            Bibliothèque
          </h1>
          <p className="text-slate-500 text-sm mt-1">Gérez vos modèles de production sauvegardés</p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* IMPORT BUTTON */}
          <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange} 
          />
          <button 
              onClick={triggerFileInput}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-sm border border-indigo-200 transition-colors"
          >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Importer</span>
          </button>

          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher un modèle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <SortAsc className="w-4 h-4 text-slate-400" />
            </div>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:border-indigo-500 cursor-pointer appearance-none"
            >
              <option value="date">Date (Récent)</option>
              <option value="name">Nom (A-Z)</option>
              <option value="time">Complexité (Temps)</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* GRID VIEW */}
      {filteredModels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredModels.map((model) => (
            <div 
              key={model.id}
              onDoubleClick={() => onLoadModel(model)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ x: e.pageX, y: e.pageY, modelId: model.id });
              }}
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-200 hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col"
            >
              {/* Card Header Icon OR Image */}
              <div className="h-40 bg-slate-50 border-b border-slate-100 flex items-center justify-center group-hover:bg-indigo-50/50 transition-colors relative overflow-hidden">
                 {model.image ? (
                     <img src={model.image} alt={model.meta_data.nom_modele} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                 ) : (
                     <div className="flex flex-col items-center gap-2">
                        <FileJson className="w-12 h-12 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                        <span className="text-[10px] text-slate-400 font-medium">Aucune image</span>
                     </div>
                 )}
                 
                 <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setContextMenu({ x: e.pageX, y: e.pageY, modelId: model.id });
                      }}
                      className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-slate-500 hover:text-indigo-600 hover:bg-white"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>
                 </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="mb-3">
                  {renamingId === model.id ? (
                    <input 
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => handleRenameSubmit(model.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(model.id)}
                      autoFocus
                      className="w-full text-sm font-bold border-b-2 border-indigo-500 outline-none pb-1"
                    />
                  ) : (
                    <h3 className="font-bold text-slate-800 text-sm truncate" title={model.meta_data.nom_modele}>
                      {model.meta_data.nom_modele}
                    </h3>
                  )}
                  {model.meta_data.date_lancement && (
                      <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Lancement: {new Date(model.meta_data.date_lancement).toLocaleDateString('fr-FR')}
                      </p>
                  )}
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2">
                   <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 flex flex-col items-center justify-center">
                      <Clock className="w-3.5 h-3.5 text-slate-400 mb-1" />
                      <span className="text-xs font-bold text-slate-700">{model.meta_data.total_temps.toFixed(2)}m</span>
                   </div>
                   <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 flex flex-col items-center justify-center">
                      <Users className="w-3.5 h-3.5 text-slate-400 mb-1" />
                      <span className="text-xs font-bold text-slate-700">{model.meta_data.effectif} Op.</span>
                   </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                   <span>Créé le: {model.meta_data.date_creation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 min-h-[400px] border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
           <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
              <FolderOpen className="w-8 h-8 text-slate-300" />
           </div>
           <h3 className="font-bold text-slate-600 mb-1">Aucun modèle trouvé</h3>
           <p className="text-sm mb-4">La bibliothèque est vide.</p>
           <div className="flex gap-3">
               <button onClick={triggerFileInput} className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-bold border border-indigo-200 transition-colors">
                   Importer un fichier
               </button>
           </div>
        </div>
      )}

      {/* CONTEXT MENU PORTAL */}
      {contextMenu && createPortal(
        <div 
          className="fixed bg-white rounded-xl shadow-2xl border border-slate-100 w-48 z-[9999] py-1.5 animate-in fade-in zoom-in-95 duration-100 origin-top-left overflow-hidden"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {models.find(m => m.id === contextMenu.modelId) && (
            <>
              <button 
                onClick={() => {
                    const m = models.find(mod => mod.id === contextMenu.modelId);
                    if(m) onLoadModel(m);
                    setContextMenu(null);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
              >
                <FolderOpen className="w-4 h-4" /> Ouvrir
              </button>
              
              <div className="h-px bg-slate-100 my-1"></div>

              <button 
                onClick={() => handleRenameStart(models.find(m => m.id === contextMenu.modelId)!)}
                className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Renommer
              </button>

              <button 
                onClick={() => handleDuplicate(models.find(m => m.id === contextMenu.modelId)!)}
                className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
              >
                <Copy className="w-4 h-4" /> Dupliquer
              </button>

              <button 
                onClick={() => handleExport(models.find(m => m.id === contextMenu.modelId)!)}
                className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" /> Exporter (JSON)
              </button>

              <div className="h-px bg-slate-100 my-1"></div>

              <button 
                onClick={() => { 
                    const m = models.find(mod => mod.id === contextMenu.modelId);
                    if (m) setDeleteConfirm({ id: m.id, name: m.meta_data.nom_modele });
                    setContextMenu(null); 
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Supprimer
              </button>
            </>
          )}
        </div>,
        document.body
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center transform scale-100 transition-all">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
                    <Trash2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Confirmer la suppression</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                    Êtes-vous sûr de vouloir supprimer le modèle <br/>
                    <span className="font-bold text-slate-800">"{deleteConfirm.name}"</span> ? <br/>
                    <span className="text-rose-500 font-medium text-xs">Cette action est irréversible.</span>
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setDeleteConfirm(null)} 
                        className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-sm transition-colors"
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={() => { onDeleteModel(deleteConfirm.id); setDeleteConfirm(null); }} 
                        className="flex-1 px-4 py-2.5 bg-rose-600 text-white hover:bg-rose-700 rounded-xl font-bold text-sm shadow-lg shadow-rose-200 transition-colors"
                    >
                        Supprimer
                    </button>
                </div>
            </div>
        </div>,
        document.body
      )}

    </div>
  );
}
