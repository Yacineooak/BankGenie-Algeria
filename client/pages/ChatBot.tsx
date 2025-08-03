import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  Mic,
  MicOff,
  Languages,
  User,
  Bot,
  Volume2,
  FileText,
  CreditCard,
  MapPin,
  Shield,
  Zap,
  TrendingUp,
  AlertCircle,
  Copy,
  Star,
  PhoneCall,
  MessageCircle,
  Loader2,
  Clock,
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot" | "system";
  timestamp: Date;
  language?: string;
  intent?: string;
  confidence?: number;
  data?: any;
  type?:
    | "text"
    | "balance"
    | "transactions"
    | "rates"
    | "status"
    | "error"
    | "success";
}

interface RealTimeData {
  marketData?: any;
  bankingMetrics?: any;
  userAccounts?: any[];
  systemStatus?: string;
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<
    "ar" | "fr" | "dz" | "en"
  >("ar");
  const [isLanguageChanging, setIsLanguageChanging] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({});
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const languages = {
    ar: { name: "العربية", flag: "🇩🇿" },
    fr: { name: "Français", flag: "🇫🇷" },
    dz: { name: "الدارجة", flag: "🇩🇿" },
    en: { name: "English", flag: "🇺🇸" },
  };

  // Enhanced language switching with smooth transition
  const handleLanguageChange = async (
    newLanguage: "ar" | "fr" | "dz" | "en",
  ) => {
    if (newLanguage === selectedLanguage) return;

    setIsLanguageChanging(true);

    // Brief pause for visual feedback
    await new Promise((resolve) => setTimeout(resolve, 300));

    setSelectedLanguage(newLanguage);

    // Update interface language and add system message
    const languageNames = {
      ar: "العربية",
      fr: "Français",
      dz: "الدارجة الجزائرية",
      en: "English",
    };

    const confirmationMessages = {
      ar: `تم تغيير اللغة إلى ${languageNames[newLanguage]}. جميع الردود ستكون بهذه اللغة.`,
      fr: `Langue changée vers ${languageNames[newLanguage]}. Toutes les réponses seront dans cette langue.`,
      dz: `تبدلت اللغة ل ${languageNames[newLanguage]}. كلش الأجوبة غادي تكون بهاذ اللغة.`,
      en: `Language changed to ${languageNames[newLanguage]}. All responses will be in this language.`,
    };

    const systemMessage: Message = {
      id: Date.now().toString(),
      text: confirmationMessages[newLanguage],
      sender: "system",
      timestamp: new Date(),
      intent: "language_change",
      type: "success",
    };

    setMessages((prev) => [...prev, systemMessage]);
    setIsLanguageChanging(false);
  };

  // Professional banking responses
  const professionalResponses = {
    greeting: {
      ar: "أهلاً وسهلاً، ك��ف يمكنني مساعدتك في خدماتك المصرفية اليوم؟",
      fr: "Bonjour, comment puis-je vous aider avec vos services bancaires aujourd'hui?",
      dz: "مرحبا، كيفاش نقدر نعاونك في خدماتك البنكية اليوم؟",
    },
    balance_success: {
      ar: "تم استرجاع رصيد حسابك بنجاح. إليك التفاصيل:",
      fr: "Votre solde a été récupéré avec succès. Voici les détails:",
      dz: "ت�� جلب رصيد حسابك بنجاح. هاذي التفاصيل:",
    },
    error_professional: {
      ar: "نعتذر لحدوث خطأ تقني. فريق الدعم الفني يعمل على حل المشكلة. يمكنك المحاولة مرة أخرى أو التواصل معنا.",
      fr: "Nous nous excusons pour cette erreur technique. Notre équipe technique travaille à résoudre le problème. Vous pouvez réessayer ou nous contacter.",
      dz: "نعتذرلك على هاذ الخطأ التقني. فريق الدعم يخدم على حل المشكل. ممكن تعاود المحاولة ولا تتواصل معانا.",
    },
  };

  // Initialize WebSocket and real-time data
  useEffect(() => {
    const user = localStorage.getItem("bankgenie_user");
    if (user) {
      setIsAuthenticated(true);
      initializeRealTimeConnection();
    }

    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, []);

  const initializeRealTimeConnection = async () => {
    try {
      const marketResponse = await fetch("/api/realtime/market-data");
      const systemResponse = await fetch("/api/realtime/system-status");

      if (marketResponse.ok && systemResponse.ok) {
        const marketData = await marketResponse.json();
        const systemData = await systemResponse.json();

        setRealTimeData({
          marketData: marketData.data,
          systemStatus: systemData.data.systemHealth,
        });
      }

      try {
        const ws = new WebSocket(`ws://${window.location.host}/ws`);

        ws.onmessage = (event) => {
          const update = JSON.parse(event.data);
          handleRealTimeUpdate(update);
        };

        ws.onopen = () => {
          setWsConnection(ws);
        };

        ws.onerror = () => {
          startPollingUpdates();
        };
      } catch (error) {
        startPollingUpdates();
      }
    } catch (error) {
      console.error("Failed to initialize real-time connection:", error);
    }
  };

  const startPollingUpdates = () => {
    setInterval(async () => {
      try {
        const response = await fetch("/api/realtime/market-data");
        if (response.ok) {
          const data = await response.json();
          setRealTimeData((prev) => ({ ...prev, marketData: data.data }));
        }
      } catch (error) {
        console.error("Polling update failed:", error);
      }
    }, 30000);
  };

  const handleRealTimeUpdate = (update: any) => {
    switch (update.type) {
      case "MARKET_UPDATE":
        setRealTimeData((prev) => ({ ...prev, marketData: update.data }));
        break;
      case "METRICS_UPDATE":
        setRealTimeData((prev) => ({ ...prev, bankingMetrics: update.data }));
        break;
      case "NEW_ALERT":
        if (
          update.data.severity === "HIGH" ||
          update.data.severity === "CRITICAL"
        ) {
          addSystemMessage(
            "تم رصد نشاط مشبوه. فريق الأمان يراجع العملية.",
            "security_alert",
          );
        }
        break;
    }
  };

  // Enhanced message processing
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
      language: detectLanguage(inputText),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": isAuthenticated ? "user_123" : "anonymous",
        },
        body: JSON.stringify({
          message: inputText,
          language: userMessage.language,
          context: {
            authenticated: isAuthenticated,
            previousMessages: messages.slice(-3),
            realTimeData: realTimeData,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: result.data.response,
          sender: "bot",
          timestamp: new Date(),
          intent: result.data.intent,
          confidence: result.data.confidence,
          data: result.data.additionalData,
          type: "text",
        };

        setMessages((prev) => [...prev, botMessage]);
        await handleSpecialIntents(result.data.intent, botMessage);
      } else {
        addErrorMessage(
          "نعتذر لحدوث خطأ تقني. يرجى إعادة المحاولة أو التواصل مع خدمة العملاء.",
        );
      }
    } catch (error) {
      console.error("Chat processing error:", error);
      addErrorMessage(
        "الخدمة غير متاحة مؤقتاً. نعمل على ��صلاح المشكلة، يرجى المحاولة خلال دقائق.",
      );
    } finally {
      setIsTyping(false);
    }
  };

  // Handle special intents with enhanced responses
  const handleSpecialIntents = async (intent: string, botMessage: Message) => {
    switch (intent) {
      case "balance_inquiry":
        if (isAuthenticated) {
          await fetchRealTimeBalance();
        }
        break;
      case "market_rates":
        await showCurrentMarketRates();
        break;
      case "transaction_history":
        if (isAuthenticated) {
          await fetchTransactionHistory();
        }
        break;
      case "system_status":
        await showSystemStatus();
        break;
    }
  };

  // Enhanced balance display
  const fetchRealTimeBalance = async () => {
    try {
      const response = await fetch("/api/realtime/balance/0001234567890123", {
        headers: { "user-id": "user_123" },
      });

      if (response.ok) {
        const data = await response.json();

        const balanceMessage: Message = {
          id: Date.now().toString(),
          text: `رصيد حسابك الجاري\n\n${data.data.balance.available.toLocaleString("ar-DZ")} دينار جزائري\n\nآخر تحديث: ${new Date(
            data.data.lastUpdated,
          ).toLocaleString("ar-DZ", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          sender: "bot",
          timestamp: new Date(),
          data: data.data,
          type: "balance",
        };
        setMessages((prev) => [...prev, balanceMessage]);

        if (data.data.equivalentAmounts) {
          setTimeout(() => {
            const equivalentMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: `المبلغ بالعملات الأجنبية:\n\n• ${data.data.equivalentAmounts.USD} دولار أمريكي\n• ${data.data.equivalentAmounts.EUR} يورو\n• ${data.data.equivalentAmounts.GBP} جنيه إسترليني\n\nحسب أسعار الصرف الحالية`,
              sender: "bot",
              timestamp: new Date(),
              data: data.data.equivalentAmounts,
              type: "rates",
            };
            setMessages((prev) => [...prev, equivalentMessage]);
          }, 800);
        }
      }
    } catch (error) {
      console.error("Balance fetch error:", error);
      addErrorMessage(
        "نعتذر، لا يمكن الوصول لرصيد الحساب في الوقت الحالي. يرجى المحاولة لاحقاً.",
      );
    }
  };

  // Enhanced market rates display
  const showCurrentMarketRates = async () => {
    if (realTimeData.marketData) {
      const rates = realTimeData.marketData.market.dzdRates;
      const timestamp = new Date(realTimeData.marketData.market.timestamp);

      const ratesMessage: Message = {
        id: Date.now().toString(),
        text: `أسعار صرف العملات\n\n• الدولار الأمريكي: ${rates.USD} د.ج\n• اليورو: ${rates.EUR} د.ج\n• الجنيه الإسترليني: ${rates.GBP} د.ج\n• الريال السعودي: ${rates.SAR} د.ج\n• الدرهم المغربي: ${rates.MAD} د.ج\n\nآخر تحديث: ${timestamp.toLocaleString(
          "ar-DZ",
          {
            hour: "2-digit",
            minute: "2-digit",
            day: "numeric",
            month: "long",
          },
        )}`,
        sender: "bot",
        timestamp: new Date(),
        data: rates,
        type: "rates",
      };
      setMessages((prev) => [...prev, ratesMessage]);
    }
  };

  // Enhanced transaction history
  const fetchTransactionHistory = async () => {
    try {
      const response = await fetch(
        "/api/realtime/transactions/0001234567890123?limit=5",
        {
          headers: { "user-id": "user_123" },
        },
      );

      if (response.ok) {
        const data = await response.json();
        const transactions = data.data.transactions.slice(0, 4);

        let historyText = "آخر العمليات المصرفية\n\n";
        transactions.forEach((txn: any, index: number) => {
          const type = txn.transactionType === "CREDIT" ? "إيداع" : "سحب";
          const amount = txn.amount.value.toLocaleString("ar-DZ");
          const date = new Date(txn.valueDate).toLocaleDateString("ar-DZ", {
            month: "short",
            day: "numeric",
          });
          historyText += `• ${type} ${amount} د.ج - ${date}\n  ${txn.description}\n\n`;
        });

        const historyMessage: Message = {
          id: Date.now().toString(),
          text: historyText.trim(),
          sender: "bot",
          timestamp: new Date(),
          data: transactions,
          type: "transactions",
        };
        setMessages((prev) => [...prev, historyMessage]);
      }
    } catch (error) {
      console.error("Transaction history error:", error);
      addErrorMessage(
        "نعتذر، لا يمكن الوصول لتاريخ العمليات حالياً. يرجى المحاو��ة لاحقاً.",
      );
    }
  };

  // Enhanced system status
  const showSystemStatus = async () => {
    try {
      const response = await fetch("/api/realtime/system-status");
      if (response.ok) {
        const data = await response.json();
        const onlineBanks = data.data.bankConnectivity.filter(
          (b: any) => b.status === "ONLINE",
        ).length;

        const statusMessage: Message = {
          id: Date.now().toString(),
          text: `حالة النظام المصرفي\n\n• حالة النظام: ${data.data.systemHealth === "HEALTHY" ? "سليم" : "تحت المراجعة"}\n• معدل التشغيل: ${data.data.uptime}%\n• العمليات اليوم: ${data.data.totalTransactions.toLocaleString("ar-DZ")}\n• أمان العمليات: ${data.data.fraudDetectionRate}%\n• البنوك المتاحة: ${onlineBanks} من 8 بنوك\n\nجميع الخدمات تعمل بشكل طبيعي`,
          sender: "bot",
          timestamp: new Date(),
          data: data.data,
          type: "status",
        };
        setMessages((prev) => [...prev, statusMessage]);
      }
    } catch (error) {
      addErrorMessage("نعتذر، لا يمكن الوصول لحالة النظام حالياً.");
    }
  };

  // Dynamic text based on selected language
  const getLocalizedText = (key: string) => {
    const texts = {
      welcome: {
        ar: "أهلاً وسهلاً بك في بنك جيني الذكي",
        fr: "Bienvenue dans BankGenie Intelligent",
        dz: "مرحبا بيك في بنك جيني الذكي",
        en: "Welcome to BankGenie Intelligent",
      },
      assistant_name: {
        ar: "مساعدك المصرفي الذكي",
        fr: "Votre assistant bancaire intelligent",
        dz: "مساعدك البنكي الذكي",
        en: "Your Intelligent Banking Assistant",
      },
      connected_live: {
        ar: "متصل مباشرة",
        fr: "Connecté en direct",
        dz: "متصل م��اشرة",
        en: "Connected Live",
      },
      live_data: {
        ar: "بيانات حية",
        fr: "Données en direct",
        dz: "بيانات حية",
        en: "Live Data",
      },
      typing: {
        ar: "جاري الكتابة...",
        fr: "En train d'écrire...",
        dz: "راه يكتب...",
        en: "Typing...",
      },
      placeholder: {
        ar: "اكتب استفسارك هنا...",
        fr: "Tapez votre question ici...",
        dz: "اكتب السؤال ديالك هنا...",
        en: "Type your inquiry here...",
      },
    };

    return texts[key]?.[selectedLanguage] || texts[key]?.ar || "";
  };

  // Helper functions
  const addSystemMessage = (text: string, type: string) => {
    const systemMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "system",
      timestamp: new Date(),
      intent: type,
      type: "text",
    };
    setMessages((prev) => [...prev, systemMessage]);
  };

  const addErrorMessage = (text: string) => {
    const errorMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "bot",
      timestamp: new Date(),
      intent: "error",
      type: "error",
    };
    setMessages((prev) => [...prev, errorMessage]);
  };

  const detectLanguage = (text: string): "ar" | "fr" | "dz" | "en" => {
    const arabicPattern = /[\u0600-\u06FF]/;
    const frenchPattern = /[àâäçéèêëïîôùûüÿ]/i;
    const englishPattern =
      /\b(the|and|or|is|are|was|were|have|has|had|will|would|could|should|can|may|might|must|shall|do|does|did|get|got|make|made|take|took|come|came|go|went|see|saw|know|knew|think|thought|say|said|tell|told|give|gave|find|found|work|worked|call|called|try|tried|ask|asked|need|needed|feel|felt|become|became|leave|left|put|put|mean|meant|keep|kept|let|let|begin|began|seem|seemed|help|helped|talk|talked|turn|turned|start|started|show|showed|hear|heard|play|played|run|ran|move|moved|live|lived|believe|believed|hold|held|bring|brought|happen|happened|write|wrote|provide|provided|sit|sat|stand|stood|lose|lost|pay|paid|meet|met|include|included|continue|continued|set|set|learn|learned|change|changed|lead|led|understand|understood|watch|watched|follow|followed|stop|stopped|create|created|speak|spoke|read|read|allow|allowed|add|added|spend|spent|grow|grew|open|opened|walk|walked|win|won|offer|offered|remember|remembered|love|loved|consider|considered|appear|appeared|buy|bought|wait|waited|serve|served|die|died|send|sent|expect|expected|build|built|stay|stayed|fall|fell|cut|cut|reach|reached|kill|killed|remain|remained|suggest|suggested|raise|raised|pass|passed|sell|sold|require|required|report|reported|decide|decided|pull|pulled)\b/i;

    if (arabicPattern.test(text)) {
      const darija_patterns = [
        "راني",
        "كيفاش",
        "وين",
        "شنو",
        "بصح",
        "يعني",
        "برك",
        "كيما",
        "بلاصة",
        "حاجة",
        "واعر",
        "ملير",
      ];
      for (const pattern of darija_patterns) {
        if (text.includes(pattern)) return "dz";
      }
      return "ar";
    }

    if (
      frenchPattern.test(text) ||
      /\b(le|la|les|un|une|des|je|tu|il|elle|nous|vous|ils|elles|bonjour|merci|s'il|vous|plaît|comment|ça|va|très|bien|pour|avec|dans|sur|par|de|du|des|à|au|aux)\b/i.test(
        text,
      )
    ) {
      return "fr";
    }

    if (englishPattern.test(text)) {
      return "en";
    }

    return selectedLanguage;
  };

  const toggleVoiceRecognition = () => {
    if (!isListening) {
      setIsListening(true);
      setTimeout(() => {
        setInputText("أريد معرفة رصيد حسابي");
        setIsListening(false);
      }, 3000);
    } else {
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang =
        selectedLanguage === "ar"
          ? "ar-SA"
          : selectedLanguage === "fr"
            ? "fr-FR"
            : "ar-DZ";
      speechSynthesis.speak(utterance);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Dynamic welcome message based on selected language
  const getWelcomeMessage = (): Message => {
    const welcomeTexts = {
      ar: "أهلاً وسهلاً بك في بنك جيني الذكي\n\nأنا مساعدك المصرفي الذكي، متصل مباشرة بالنظام المصرفي الجزائري لتقديم خدمات فورية ودقيقة.\n\nيمكنني مساعدتك في:\n• الاستعلام عن أرصدة حساباتك\n• عرض تاريخ العمليات المصرفية\n• متابعة أسعار صرف العملات\n• محاكاة القروض وحساب الأقساط\n• خدمات البطاقات المصرفية\n• معلومات الفروع والصرافات\n\nكيف يمكنني خدمتك اليوم؟",
      fr: "Bienvenue dans BankGenie Intelligent\n\nJe suis votre assistant bancaire intelligent, connecté directement au système bancaire algérien pour fournir des services instantanés et précis.\n\nJe peux vous aider avec:\n• Consultation des soldes de vos comptes\n• Affichage de l'historique des transactions\n• Suivi des taux de change\n• Simulation de crédits et calcul d'échéances\n• Services de cartes bancaires\n• Informations sur les agences et distributeurs\n\nComment puis-je vous aider aujourd'hui?",
      dz: "مرحبا بيك في بنك جيني الذكي\n\nراني مساعدك البنكي الذكي، متصل مباشرة بالنظام البنكي الجزائري باش نقدم خدمات فورية ودقيقة.\n\nنقدر نعاونك في:\n• الاستعلام على رصيد حساباتك\n• شوف تاريخ العمليات البنكية\n• تابع أسعار صرف العملات\n• محاكاة القروض وحساب الأقساط\n• خدمات الكارطات البنكية\n• معلومات الفروع والصرافات\n\nكيفاش نقدر نخدمك اليوم؟",
      en: "Welcome to BankGenie Intelligent\n\nI am your intelligent banking assistant, directly connected to the Algerian banking system to provide instant and accurate services.\n\nI can help you with:\n• Account balance inquiries\n• Transaction history display\n• Currency exchange rates tracking\n• Credit simulation and installment calculation\n• Banking card services\n• Branch and ATM information\n\nHow can I serve you today?",
    };

    return {
      id: "0",
      text: welcomeTexts[selectedLanguage],
      sender: "bot",
      timestamp: new Date(),
      type: "text",
    };
  };

  // Professional welcome message with language updates
  useEffect(() => {
    setMessages([getWelcomeMessage()]);
  }, [selectedLanguage]);

  const getMessageStyle = (message: Message) => {
    if (message.sender === "user") {
      return "bg-primary text-primary-foreground";
    }

    switch (message.type) {
      case "error":
        return "bg-red-50 text-red-800 border border-red-200";
      case "success":
        return "bg-green-50 text-green-800 border border-green-200";
      case "balance":
        return "bg-blue-50 text-blue-900 border border-blue-200";
      case "rates":
        return "bg-amber-50 text-amber-900 border border-amber-200";
      case "transactions":
        return "bg-purple-50 text-purple-900 border border-purple-200";
      case "status":
        return "bg-emerald-50 text-emerald-900 border border-emerald-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Enhanced Header */}
        <Card className="mb-4 shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bot className="h-7 w-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white transition-all duration-300">
                    {getLocalizedText("welcome")}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <p className="text-white/90 text-sm transition-all duration-300">
                      {getLocalizedText("assistant_name")}
                    </p>
                    {realTimeData.systemStatus && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-white/20 text-white border-white/30"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        {getLocalizedText("connected_live")}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
                <Languages
                  className={`h-4 w-4 text-white/80 transition-all duration-300 ${
                    isLanguageChanging
                      ? "rotate-180 scale-110 text-white"
                      : "hover:text-white"
                  }`}
                />
                <div className="relative">
                  <select
                    value={selectedLanguage}
                    onChange={(e) =>
                      handleLanguageChange(e.target.value as any)
                    }
                    disabled={isLanguageChanging}
                    className={`bg-transparent border-0 text-white text-sm font-medium focus:outline-none transition-all duration-300 ${
                      isLanguageChanging
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:text-white/90 cursor-pointer"
                    }`}
                  >
                    {Object.entries(languages).map(([code, lang]) => (
                      <option
                        key={code}
                        value={code}
                        className="text-gray-900 bg-white font-medium"
                      >
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                  {isLanguageChanging && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-3 w-3 animate-spin border border-white border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Status Bar */}
            {realTimeData.marketData && (
              <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="flex items-center justify-between text-sm text-white">
                  <div className="flex items-center space-x-6">
                    <span className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      USD: {realTimeData.marketData.market.dzdRates.USD}
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      EUR: {realTimeData.marketData.market.dzdRates.EUR}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date().toLocaleTimeString("ar-DZ", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white/90 transition-all duration-300">
                      {getLocalizedText("live_data")}
                    </span>
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Enhanced Chat Interface */}
        <Card className="h-[600px] flex flex-col shadow-lg border-0">
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] flex items-start space-x-3 ${
                        message.sender === "user"
                          ? "flex-row-reverse space-x-reverse"
                          : ""
                      }`}
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : message.sender === "system"
                              ? "bg-yellow-500 text-white"
                              : "bg-white border-2 border-primary/20 text-primary"
                        }`}
                      >
                        {message.sender === "user" ? (
                          <User className="h-4 w-4" />
                        ) : message.sender === "system" ? (
                          <Shield className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm ${getMessageStyle(message)}`}
                        >
                          <p className="text-sm whitespace-pre-line leading-relaxed">
                            {message.text}
                          </p>
                        </div>
                        <div className="flex items-center mt-2 space-x-3">
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString("ar-DZ", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {message.intent && message.confidence && (
                            <Badge variant="outline" className="text-xs">
                              دقة {Math.round(message.confidence * 100)}%
                            </Badge>
                          )}
                          {message.sender === "bot" && (
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => speakText(message.text)}
                                className="h-6 w-6 p-0 hover:bg-primary/10"
                              >
                                <Volume2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(message.text)}
                                className="h-6 w-6 p-0 hover:bg-primary/10"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 bg-white border-2 border-primary/20 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-muted rounded-2xl px-4 py-3 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground transition-all duration-300">
                            {getLocalizedText("typing")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>

          {/* Enhanced Input Area */}
          <div className="border-t border-border p-4 bg-gradient-to-r from-slate-50 to-blue-50">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={getLocalizedText("placeholder")}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="pr-12 bg-white border-primary/20 focus:border-primary rounded-xl h-12"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleVoiceRecognition}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                    isListening ? "text-red-500" : "text-muted-foreground"
                  }`}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="h-12 px-6 rounded-xl"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Professional Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const queries = {
                    ar: "رصيد حسابي",
                    fr: "solde de compte",
                    dz: "رصيد حسابي",
                    en: "account balance",
                  };
                  setInputText(queries[selectedLanguage]);
                }}
                className="rounded-full transition-all duration-200"
              >
                <CreditCard className="h-3 w-3 mr-1" />
                {selectedLanguage === "ar"
                  ? "رصيد الحساب"
                  : selectedLanguage === "fr"
                    ? "Solde"
                    : selectedLanguage === "dz"
                      ? "رصيد الحساب"
                      : "Balance"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const queries = {
                    ar: "أسعار الصرف",
                    fr: "taux de change",
                    dz: "أسعار الصرف",
                    en: "exchange rates",
                  };
                  setInputText(queries[selectedLanguage]);
                }}
                className="rounded-full transition-all duration-200"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                {selectedLanguage === "ar"
                  ? "أسعار الصرف"
                  : selectedLanguage === "fr"
                    ? "Taux"
                    : selectedLanguage === "dz"
                      ? "أسعار الصرف"
                      : "Rates"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const queries = {
                    ar: "آخر العمليات",
                    fr: "dernières transactions",
                    dz: "آخر العمليات",
                    en: "recent transactions",
                  };
                  setInputText(queries[selectedLanguage]);
                }}
                className="rounded-full transition-all duration-200"
              >
                <FileText className="h-3 w-3 mr-1" />
                {selectedLanguage === "ar"
                  ? "العمليات"
                  : selectedLanguage === "fr"
                    ? "Transactions"
                    : selectedLanguage === "dz"
                      ? "العمليات"
                      : "Transactions"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const queries = {
                    ar: "حالة النظام",
                    fr: "statut système",
                    dz: "حالة النظام",
                    en: "system status",
                  };
                  setInputText(queries[selectedLanguage]);
                }}
                className="rounded-full transition-all duration-200"
              >
                <Shield className="h-3 w-3 mr-1" />
                {selectedLanguage === "ar"
                  ? "حالة النظام"
                  : selectedLanguage === "fr"
                    ? "Statut"
                    : selectedLanguage === "dz"
                      ? "حالة النظام"
                      : "Status"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const queries = {
                    ar: "أقرب فرع",
                    fr: "agence proche",
                    dz: "أقرب فرع",
                    en: "nearest branch",
                  };
                  setInputText(queries[selectedLanguage]);
                }}
                className="rounded-full transition-all duration-200"
              >
                <MapPin className="h-3 w-3 mr-1" />
                {selectedLanguage === "ar"
                  ? "الفروع"
                  : selectedLanguage === "fr"
                    ? "Agences"
                    : selectedLanguage === "dz"
                      ? "الفروع"
                      : "Branches"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Enhanced Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {!isAuthenticated ? (
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-amber-800 font-medium">
                        تسجيل الدخول مطلوب
                      </p>
                      <p className="text-amber-700 text-sm">
                        للوصول لجميع خدماتك المصرفية
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAuthenticated(true)}
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    دخول
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-green-800 font-medium">متصل بأمان</p>
                      <p className="text-green-700 text-sm">
                        جميع خدماتك المصرفية متاحة
                      </p>
                    </div>
                  </div>
                  {realTimeData.systemStatus === "HEALTHY" && (
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800 border-green-200"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      متصل مباشرة
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <PhoneCall className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-blue-800 font-medium">
                      تحتا�� مساعدة إضافية؟
                    </p>
                    <p className="text-blue-700 text-sm">خدمة العملاء 24/7</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    دردشة
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
