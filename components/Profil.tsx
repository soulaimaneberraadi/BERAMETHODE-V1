import React from 'react';
import { User } from 'lucide-react';

export default function Profil() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-10 text-center relative overflow-hidden">
        
        {/* Subtle top Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500"></div>

        <div className="w-16 h-16 bg-emerald-50 rounded-2xl mx-auto flex items-center justify-center mb-6 text-emerald-600">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Profil Utilisateur</h2>
        <p className="text-slate-500 text-sm">
          Cet espace est prêt pour vos informations personnelles.
        </p>
      </div>
    </div>
  );
}