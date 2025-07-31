import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Shield
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  language?: string;
  intent?: string;
  confidence?: number;
}

interface BankingIntent {
  intent: string;
  patterns: string[];
  responses: string[];
  requiresAuth?: boolean;
  action?: string;
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'ar' | 'fr' | 'dz'>('ar');
  const [isTyping, setIsTyping] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Real banking intents with NLP patterns
  const bankingIntents: BankingIntent[] = [
    {
      intent: 'greeting',
      patterns: ['سلام', 'مرحبا', 'أهلا', 'bonjour', 'salut', 'hello', 'hi', 'salam'],
      responses: [
        'أهلاً وسهلاً! أنا مساعدك البنكي الذكي. كيف يمكنني مساعدتك اليوم؟',
        'Bonjour! Je suis votre assistant bancaire intelligent. Comment puis-je vous aider?',
        'مرحبا بيك! كيفاش نقدر نعاونك اليوم؟'
      ]
    },
    {
      intent: 'balance_inquiry',
      patterns: ['رصيد', 'balance', 'solde', 'كم رصيدي', 'حسابي', 'compte', 'account balance'],
      responses: [
        'لعرض رصيد حسابك، أحتاج إلى التحقق من هويتك أولاً. يرجى تسجيل الدخول.',
        'Pour consulter votre solde, je dois vérifier votre identité. Veuillez vous connecter.',
        'باش نوريك رصيدك، لازم نتأكد من هويتك. دخل على حسابك.'
      ],
      requiresAuth: true,
      action: 'show_balance'
    },
    {
      intent: 'card_services',
      patterns: ['بطاقة', 'carte', 'card', 'إيقاف البطاقة', 'bloquer carte', 'block card', 'كارطا'],
      responses: [
        'خدمات البطاقات المتاحة: إيقاف البطاقة، طلب بطاقة جديدة، تغيير الرقم السري. ماذا تحتاج؟',
        'Services cartes disponibles: bloquer carte, commander nouvelle carte, changer PIN. Que souhaitez-vous?',
        'خدمات الكارطا: بلوكاج، طلب كارطا جديدة، تبديل الكود. شنو تحتاج؟'
      ],
      action: 'card_services'
    },
    {
      intent: 'loan_inquiry',
      patterns: ['قرض', 'prêt', 'crédit', 'loan', 'تمويل', 'finance', 'قريضة'],
      responses: [
        'يمكنني مساعدتك في محاكاة القرض وحساب الأقساط. هل تريد بدء محاكاة قرض؟',
        'Je peux vous aider avec une simulation de prêt et calculer les mensualités. Voulez-vous commencer?',
        'نقدر نعاونك في حساب القرض والأقساط. تحب نبداو؟'
      ],
      action: 'loan_simulation'
    },
    {
      intent: 'branch_locator',
      patterns: ['فرع', 'agence', 'branch', 'موقع', 'location', 'أين', 'où', 'where'],
      responses: [
        'يمكنني العثور على أقرب فرع أو صراف آلي إليك. شارك موقعك أو اذكر المدينة.',
        'Je peux trouver la agence ou DAB le plus proche. Partagez votre localisation ou mentionnez la ville.',
        'نقدر نلقالك أقرب فرع ولا داب. قولي فين راك؟'
      ],
      action: 'branch_locator'
    }
  ];

  const languages = {
    ar: { name: 'العربية', flag: '🇩🇿' },
    fr: { name: 'Français', flag: '🇫🇷' },
    dz: { name: 'الدارجة', flag: '🇩🇿' }
  };

  // NLP Intent Detection Engine
  const detectIntent = (text: string): { intent: string; confidence: number } => {
    const normalizedText = text.toLowerCase().trim();
    let bestMatch = { intent: 'unknown', confidence: 0 };

    for (const intentData of bankingIntents) {
      for (const pattern of intentData.patterns) {
        const patternNormalized = pattern.toLowerCase();
        
        // Exact match
        if (normalizedText.includes(patternNormalized)) {
          const confidence = patternNormalized.length / normalizedText.length;
          if (confidence > bestMatch.confidence) {
            bestMatch = { intent: intentData.intent, confidence };
          }
        }
        
        // Fuzzy matching for typos
        if (levenshteinDistance(normalizedText, patternNormalized) <= 2) {
          const confidence = 0.7;
          if (confidence > bestMatch.confidence) {
            bestMatch = { intent: intentData.intent, confidence };
          }
        }
      }
    }

    return bestMatch;
  };

  // Levenshtein distance for fuzzy matching
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  // Auto-detect language
  const detectLanguage = (text: string): 'ar' | 'fr' | 'dz' => {
    const arabicPattern = /[\u0600-\u06FF]/;
    const frenchPattern = /[àâäçéèêëïîôùûüÿ]/i;
    
    if (arabicPattern.test(text)) {
      // Check for Algerian Darija patterns
      const darija_patterns = ['راني', 'كيفاش', 'وين', 'شنو', 'بصح', 'يعني', 'برك'];
      for (const pattern of darija_patterns) {
        if (text.includes(pattern)) return 'dz';
      }
      return 'ar';
    }
    
    if (frenchPattern.test(text) || /\b(le|la|les|un|une|des|je|tu|il|elle|nous|vous|ils|elles)\b/i.test(text)) {
      return 'fr';
    }
    
    return selectedLanguage;
  };

  // Generate response based on intent
  const generateResponse = (intent: string, confidence: number, userLang: 'ar' | 'fr' | 'dz'): string => {
    const intentData = bankingIntents.find(i => i.intent === intent);
    
    if (!intentData) {
      const fallback = {
        ar: 'عذراً، لم أفهم طلبك. يمكنك سؤالي عن: رصيد الحساب، خدمات البطاقات، القروض، أو مواقع الفروع.',
        fr: 'Désolé, je n\'ai pas compris votre demande. Vous pouvez me demander: solde du compte, services cartes, prêts, ou localisation des agences.',
        dz: 'سامحني ما فهمتش. تقدر تسقسيني على: رصيد الحساب، خدمات الكارطا، القروض، ولا فين توجد الفروع.'
      };
      return fallback[userLang];
    }

    // Check authentication requirement
    if (intentData.requiresAuth && !isAuthenticated) {
      const authRequired = {
        ar: 'هذه الخدمة تتطلب تسجيل الدخول. يرجى المصادقة أولاً.',
        fr: 'Ce service nécessite une authentification. Veuillez vous connecter d\'abord.',
        dz: 'هاذ الخدمة تحتاج تسجيل دخول. لازم تدخل على حسابك.'
      };
      return authRequired[userLang];
    }

    // Return response based on language
    const langIndex = userLang === 'ar' ? 0 : userLang === 'fr' ? 1 : 2;
    return intentData.responses[langIndex] || intentData.responses[0];
  };

  // Handle user message
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      language: detectLanguage(inputText)
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Simulate processing delay
    setTimeout(() => {
      const detectedIntent = detectIntent(inputText);
      const response = generateResponse(detectedIntent.intent, detectedIntent.confidence, userMessage.language as any);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date(),
        intent: detectedIntent.intent,
        confidence: detectedIntent.confidence
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

      // Handle special actions
      handleBotAction(detectedIntent.intent);
    }, 1000 + Math.random() * 1000);
  };

  // Handle bot actions
  const handleBotAction = (intent: string) => {
    switch (intent) {
      case 'show_balance':
        if (isAuthenticated) {
          // Simulate showing balance
          setTimeout(() => {
            const balanceMessage: Message = {
              id: Date.now().toString(),
              text: 'رصيد حسابك الجاري: 50,250.00 دج | Solde compte courant: 50,250.00 DZD',
              sender: 'bot',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, balanceMessage]);
          }, 1000);
        }
        break;
      case 'loan_simulation':
        // Could redirect to loan calculator
        console.log('Redirecting to loan simulation...');
        break;
      case 'branch_locator':
        // Could open map or location services
        console.log('Opening branch locator...');
        break;
    }
  };

  // Voice recognition (simulated)
  const toggleVoiceRecognition = () => {
    if (!isListening) {
      setIsListening(true);
      // Simulate voice recognition
      setTimeout(() => {
        setInputText("مرحبا، أريد معرفة رصيد حسابي");
        setIsListening(false);
      }, 3000);
    } else {
      setIsListening(false);
    }
  };

  // Text-to-speech
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage === 'ar' ? 'ar-SA' : selectedLanguage === 'fr' ? 'fr-FR' : 'ar-DZ';
      speechSynthesis.speak(utterance);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '0',
      text: 'مرحباً بك في بنك جيني! أنا مساعدك البنكي الذكي. أتحدث العربية والفرنسية والدارجة الجزائرية. كيف يمكنني مساعدتك؟',
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                  <Bot className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">BankGenie AI Assistant</CardTitle>
                  <p className="text-muted-foreground">مساعد بنكي ذكي • Assistant bancaire intelligent</p>
                </div>
              </div>
              
              {/* Language Selector */}
              <div className="flex items-center space-x-2">
                <Languages className="h-4 w-4 text-muted-foreground" />
                <select 
                  value={selectedLanguage} 
                  onChange={(e) => setSelectedLanguage(e.target.value as any)}
                  className="bg-background border border-border rounded-md px-2 py-1"
                >
                  {Object.entries(languages).map(([code, lang]) => (
                    <option key={code} value={code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Chat Interface */}
        <Card className="h-[600px] flex flex-col">
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] flex items-start space-x-2 ${
                      message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        message.sender === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-accent text-accent-foreground'
                      }`}>
                        {message.sender === 'user' ? 
                          <User className="h-4 w-4" /> : 
                          <Bot className="h-4 w-4" />
                        }
                      </div>
                      <div>
                        <div className={`rounded-lg px-4 py-2 ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <p className="text-sm">{message.text}</p>
                        </div>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                          {message.intent && (
                            <Badge variant="outline" className="text-xs">
                              {message.intent} ({Math.round((message.confidence || 0) * 100)}%)
                            </Badge>
                          )}
                          {message.sender === 'bot' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => speakText(message.text)}
                              className="h-6 w-6 p-0"
                            >
                              <Volume2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="h-8 w-8 bg-accent rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-accent-foreground" />
                      </div>
                      <div className="bg-muted rounded-lg px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
          
          {/* Input Area */}
          <div className="border-t border-border p-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="اكتب رسالتك هنا... / Tapez votre message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="pr-12"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleVoiceRecognition}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                    isListening ? 'text-red-500' : 'text-muted-foreground'
                  }`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              <Button onClick={handleSendMessage} disabled={!inputText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={() => setInputText("رصيد حسابي")}>
                <CreditCard className="h-3 w-3 mr-1" />
                رصيد الحساب
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInputText("قرض شخصي")}>
                <FileText className="h-3 w-3 mr-1" />
                محاكاة قرض
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInputText("أقرب فرع")}>
                <MapPin className="h-3 w-3 mr-1" />
                مواقع الفروع
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInputText("إيقاف البطاقة")}>
                <Shield className="h-3 w-3 mr-1" />
                خدمات البطاقة
              </Button>
            </div>
          </div>
        </Card>

        {/* Auth Status */}
        {!isAuthenticated && (
          <Card className="mt-4 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-yellow-600" />
                <span className="text-yellow-800">
                  سجل دخولك للوصول إلى جميع الخدمات البنكية • Connectez-vous pour accéder à tous les services
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsAuthenticated(true)}
                >
                  تسجيل الدخول
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
