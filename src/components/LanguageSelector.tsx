
import { motion } from 'motion/react';
import { Languages } from 'lucide-react';
import { Language } from '../lib/translations';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-2 bg-vibrant-black/10 backdrop-blur-md p-1 rounded-xl border border-vibrant-black/10">
      <div className="p-2 text-vibrant-black/50">
        <Languages className="w-4 h-4" />
      </div>
      {(['vi', 'en'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => onLanguageChange(lang)}
          className={`
            px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
            ${currentLanguage === lang 
              ? 'bg-vibrant-black text-white shadow-[2px_2px_0px_rgba(0,0,0,0.2)]' 
              : 'text-vibrant-black/50 hover:bg-vibrant-black/5'}
          `}
        >
          {lang === 'vi' ? 'VN' : 'EN'}
        </button>
      ))}
    </div>
  );
}
