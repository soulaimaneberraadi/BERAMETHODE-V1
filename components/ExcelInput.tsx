
import React, { useState, useEffect } from 'react';

interface ExcelInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  containerClassName?: string;
}

export default function ExcelInput({ 
  value, 
  onChange, 
  suggestions, 
  className, 
  containerClassName,
  onBlur,
  onFocus,
  onKeyDown,
  ...props 
}: ExcelInputProps) {
  const [suggestionSuffix, setSuggestionSuffix] = useState('');
  const [activeSuggestion, setActiveSuggestion] = useState('');

  useEffect(() => {
    if (!value || value.trim() === '') {
      setSuggestionSuffix('');
      setActiveSuggestion('');
      return;
    }

    const valLower = value.toLowerCase();

    // Find first match safely
    const match = suggestions.find(s => s && typeof s === 'string' && s.toLowerCase().startsWith(valLower));
    
    if (match) {
      // Calculate only the part that hasn't been typed yet
      // Example: User="Mac", Match="Machine" -> Suffix="hine"
      const suffix = match.slice(value.length);
      setActiveSuggestion(match);
      setSuggestionSuffix(suffix);
    } else {
      setSuggestionSuffix('');
      setActiveSuggestion('');
    }
  }, [value, suggestions]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only trigger autocomplete if the text isn't fully typed yet
    const isIncomplete = activeSuggestion && activeSuggestion.length > value.length;

    if ((e.key === 'Tab' || e.key === 'Enter') && isIncomplete) {
      e.preventDefault();
      e.stopPropagation(); 
      onChange(activeSuggestion);
      setSuggestionSuffix('');
      // Keep focus on input for continued typing if needed
      return;
    }
    
    if (onKeyDown) onKeyDown(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setSuggestionSuffix(''); 
    if (onBlur) onBlur(e);
  };

  return (
    <div className={`relative w-full ${containerClassName || ''}`}>
      {/* 
        Ghost Overlay Layer (Background)
        - Removed 'flex items-center' to align text baseline perfectly with input
        - z-0: Sits behind
        - whitespace-pre: Preserves spaces so multi-word suggestions align perfectly
      */}
      <div 
        className={`${className} absolute inset-0 z-0 !bg-transparent !border-transparent !shadow-none !ring-0 pointer-events-none overflow-hidden whitespace-pre`}
        aria-hidden="true"
      >
         {/* Invisible duplicate of user text -> Pushes the suffix to the exact cursor position */}
         <span className="opacity-0 text-transparent">{value}</span>
         {/* The Suffix -> Visible grey text */}
         <span className="text-slate-400 opacity-60">{suggestionSuffix}</span>
      </div>

      {/* 
        Real Input Layer (Foreground)
        - z-10: Sits on top (clickable)
        - bg-transparent: Allows seeing the ghost text behind
      */}
      <input
        {...props}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={onFocus}
        className={`${className} relative z-10 bg-transparent focus:bg-transparent placeholder:text-slate-300`}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
      />
    </div>
  );
}
