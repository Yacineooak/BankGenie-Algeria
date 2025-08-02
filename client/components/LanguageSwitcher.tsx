import { Languages, Loader2 } from "lucide-react";
import { useLanguage, type Language } from "@/contexts/LanguageContext";

interface LanguageSwitcherProps {
  variant?: 'navbar' | 'chatbot';
  className?: string;
}

const languageOptions: { value: Language; flag: string; name: string }[] = [
  { value: 'ar', flag: '🇩🇿', name: 'العربية' },
  { value: 'fr', flag: '🇫🇷', name: 'Français' },
  { value: 'dz', flag: '🇩🇿', name: 'الدارجة' },
  { value: 'en', flag: '🇺🇸', name: 'English' }
];

export function LanguageSwitcher({ variant = 'navbar', className = '' }: LanguageSwitcherProps) {
  const { language, setLanguage, isChanging } = useLanguage();

  const baseStyles = variant === 'chatbot' 
    ? 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
    : 'bg-muted/30 hover:bg-muted/50';

  const iconStyles = variant === 'chatbot'
    ? 'text-white/80 hover:text-white'
    : 'text-muted-foreground hover:text-primary';

  const selectStyles = variant === 'chatbot'
    ? 'text-white hover:text-white/90'
    : 'hover:text-primary';

  return (
    <div className={`flex items-center space-x-2 rounded-lg px-3 py-2 transition-all duration-300 ${baseStyles} ${className}`}>
      <Languages className={`h-4 w-4 transition-all duration-300 ${iconStyles} ${
        isChanging ? 'rotate-180 scale-110' : ''
      }`} />
      
      <div className="relative">
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value as Language)}
          disabled={isChanging}
          className={`bg-transparent border-0 text-sm font-medium focus:outline-none transition-all duration-300 cursor-pointer ${selectStyles} ${
            isChanging ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {languageOptions.map((option) => (
            <option 
              key={option.value} 
              value={option.value} 
              className="bg-background text-foreground font-medium"
            >
              {option.flag} {option.name}
            </option>
          ))}
        </select>
        
        {isChanging && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`h-3 w-3 animate-spin border rounded-full ${
              variant === 'chatbot' 
                ? 'border-white border-t-transparent' 
                : 'border-primary border-t-transparent'
            }`} />
          </div>
        )}
      </div>
    </div>
  );
}
