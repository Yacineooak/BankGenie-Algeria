import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type Language = "ar" | "fr" | "dz" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isChanging: boolean;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

interface Translations {
  [key: string]: {
    [K in Language]: string;
  };
}

const translations: Translations = {
  // Navigation
  services: {
    ar: "الخدمات",
    fr: "Services",
    dz: "الخدمات",
    en: "Services",
  },
  security: {
    ar: "الأمان",
    fr: "Sécurité",
    dz: "الأمان",
    en: "Security",
  },
  pricing: {
    ar: "الأسعار",
    fr: "Tarifs",
    dz: "الأسعار",
    en: "Pricing",
  },
  login: {
    ar: "تسجيل الدخول",
    fr: "Connexion",
    dz: "دخول",
    en: "Login",
  },
  get_started: {
    ar: "ابدأ الآن",
    fr: "Commencer",
    dz: "ابدأ الآن",
    en: "Get Started",
  },

  // Homepage
  enterprise_banking: {
    ar: "منصة مصرفية متقدمة • مبنية للجزائر",
    fr: "Plateforme bancaire avancée • Conçue pour l'Algérie",
    dz: "منصة بنكية متقدمة • مصنوعة للجزائر",
    en: "Enterprise Banking Platform • Built for Algeria",
  },
  modern_banking: {
    ar: "الخدمات المصرفية الحديثة",
    fr: "Services bancaires modernes",
    dz: "الخدمات البنكية العصرية",
    en: "Modern Banking",
  },
  made_simple: {
    ar: "مبسطة ومتطورة",
    fr: "Rendus simples",
    dz: "مبسطة ومتطورة",
    en: "Made Simple",
  },
  platform_description: {
    ar: "منصة مصرفية رقمية شاملة تحدث عمليات خدمة العملاء بدعم متعدد اللغات وأمان متقدم وتكامل سلس.",
    fr: "Plateforme bancaire numérique complète qui modernise les opérations de service client avec support multilingue, sécurité avancée et intégration transparente.",
    dz: "منصة بنكية رقمية شاملة تحدث عمليات خدمة العملاء بدعم متعدد اللغات وأمان متقدم وتكامل سلس.",
    en: "Comprehensive digital banking platform that modernizes customer service operations with multilingual support, advanced security, and seamless integration.",
  },
  try_platform: {
    ar: "جرب المنصة",
    fr: "Essayer la plateforme",
    dz: "جرب المنصة",
    en: "Try Platform",
  },
  credit_calculator: {
    ar: "حاسبة القروض",
    fr: "Calculateur de crédit",
    dz: "حاسبة القروض",
    en: "Credit Calculator",
  },

  // Stats
  system_reliability: {
    ar: "موثوقية النظام",
    fr: "Fiabilité du système",
    dz: "موثوقية النظام",
    en: "System Reliability",
  },
  service_availability: {
    ar: "توفر الخدمة",
    fr: "Disponibilité du service",
    dz: "توفر الخدمة",
    en: "Service Availability",
  },
  language_support: {
    ar: "دعم اللغات",
    fr: "Support linguistique",
    dz: "دعم اللغات",
    en: "Language Support",
  },
  security_standards: {
    ar: "معايير الأمان المصرفي",
    fr: "Normes de sécurité bancaire",
    dz: "معايير الأمان البنكي",
    en: "Security Standards",
  },

  // Features
  complete_banking_solution: {
    ar: "حل مصرفي متكامل",
    fr: "Solution bancaire complète",
    dz: "حل بنكي متكامل",
    en: "Complete Banking Solution",
  },
  everything_description: {
    ar: "كل ما تحتاجه مؤسستك المالية لتقديم خدمة عملاء استثنائية",
    fr: "Tout ce dont votre institution financière a besoin pour offrir un service client exceptionnel",
    dz: "كل ما تحتاجه مؤسستك المالية لتقديم خدمة عملاء استثنائية",
    en: "Everything your financial institution needs to deliver exceptional customer service",
  },
  digital_banking_assistant: {
    ar: "مساعد مصرفي ذكي",
    fr: "Assistant bancaire numérique",
    dz: "مساعد بنكي ذكي",
    en: "Digital Banking Assistant",
  },
  multilingual_support_desc: {
    ar: "دعم عملاء متعدد اللغات 24/7 بالعربية والفرنسية والدارجة والإنجليزية",
    fr: "Support client multilingue 24/7 en arabe, français, darija et anglais",
    dz: "دعم عملاء متعدد اللغات 24/7 بالعربية والفرنسية والدارجة والإنجليزية",
    en: "24/7 multilingual customer support in Arabic, French, Darija, and English",
  },
  language_changed_notification: {
    ar: "تم تغيير اللغة بنجاح",
    fr: "Langue changée avec succès",
    dz: "تبدلت اللغة بنجاح",
    en: "Language changed successfully",
  },
  advanced_security_system: {
    ar: "نظام أمان متقدم",
    fr: "Système de sécurité avancé",
    dz: "نظام أمان متقدم",
    en: "Advanced Security System",
  },
  fraud_prevention_desc: {
    ar: "منع الاحتيال في الوقت الفعلي ومراقبة المعاملات",
    fr: "Prévention de la fraude en temps réel et surveillance des transactions",
    dz: "منع الاحتيال في الوقت الحقيقي ومراقبة المعاملات",
    en: "Real-time fraud prevention and transaction monitoring",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar");
  const [isChanging, setIsChanging] = useState(false);

  const setLanguage = async (newLanguage: Language) => {
    if (newLanguage === language) return;

    setIsChanging(true);

    // Brief pause for visual feedback
    await new Promise((resolve) => setTimeout(resolve, 200));

    setLanguageState(newLanguage);

    // Store in localStorage
    localStorage.setItem("bankgenie_language", newLanguage);

    setTimeout(() => {
      setIsChanging(false);
    }, 300);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || translations[key]?.ar || key;
  };

  // Load language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("bankgenie_language") as Language;
    if (saved && ["ar", "fr", "dz", "en"].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  // Update document direction based on language
  useEffect(() => {
    const isRTL = language === "ar" || language === "dz";
    document.documentElement.dir = isRTL ? "rtl" : "ltr";

    const langMap = {
      ar: "ar",
      fr: "fr",
      dz: "ar-DZ",
      en: "en",
    };
    document.documentElement.lang = langMap[language];
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isChanging, t }}>
      <div
        className={`transition-all duration-300 ${isChanging ? "opacity-90" : "opacity-100"}`}
      >
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
