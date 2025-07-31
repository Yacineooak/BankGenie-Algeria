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
  Shield,
  Zap,
  TrendingUp,
  AlertCircle
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  language?: string;
  intent?: string;
  confidence?: number;
  data?: any; // For rich responses with real data
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
  const [selectedLanguage, setSelectedLanguage] = useState<'ar' | 'fr' | 'dz'>('ar');
  const [isTyping, setIsTyping] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({});
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const languages = {
    ar: { name: 'العربية', flag: '🇩🇿' },
    fr: { name: 'Français', flag: '🇫🇷' },
    dz: { name: 'الدارجة', flag: '🇩🇿' }
  };

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    // Check authentication status
    const user = localStorage.getItem('bankgenie_user');
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
      // Fetch initial real-time data
      const marketResponse = await fetch('/api/realtime/market-data');
      const systemResponse = await fetch('/api/realtime/system-status');
      
      if (marketResponse.ok && systemResponse.ok) {
        const marketData = await marketResponse.json();
        const systemData = await systemResponse.json();
        
        setRealTimeData({
          marketData: marketData.data,
          systemStatus: systemData.data.systemHealth
        });
      }

      // Initialize WebSocket for live updates (if available)
      try {
        const ws = new WebSocket(`ws://${window.location.host}/ws`);
        
        ws.onmessage = (event) => {
          const update = JSON.parse(event.data);
          handleRealTimeUpdate(update);
        };
        
        ws.onopen = () => {
          console.log('Real-time connection established');
          setWsConnection(ws);
        };
        
        ws.onerror = () => {
          console.log('WebSocket not available, using polling for updates');
          startPollingUpdates();
        };
      } catch (error) {
        console.log('WebSocket not available, using polling for updates');
        startPollingUpdates();
      }
    } catch (error) {
      console.error('Failed to initialize real-time connection:', error);
    }
  };

  const startPollingUpdates = () => {
    // Fallback to polling if WebSocket is not available
    setInterval(async () => {
      try {
        const response = await fetch('/api/realtime/market-data');
        if (response.ok) {
          const data = await response.json();
          setRealTimeData(prev => ({ ...prev, marketData: data.data }));
        }
      } catch (error) {
        console.error('Polling update failed:', error);
      }
    }, 30000); // Poll every 30 seconds
  };

  const handleRealTimeUpdate = (update: any) => {
    switch (update.type) {
      case 'MARKET_UPDATE':
        setRealTimeData(prev => ({ ...prev, marketData: update.data }));
        break;
      case 'METRICS_UPDATE':
        setRealTimeData(prev => ({ ...prev, bankingMetrics: update.data }));
        break;
      case 'NEW_ALERT':
        if (update.data.severity === 'HIGH' || update.data.severity === 'CRITICAL') {
          addSystemMessage(`تنبيه أمني: ${update.data.message}`, 'security_alert');
        }
        break;
    }
  };

  // Enhanced message processing with real banking APIs
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

    try {
      // Send to real-time chat processing API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': isAuthenticated ? 'user_123' : 'anonymous'
        },
        body: JSON.stringify({
          message: inputText,
          language: userMessage.language,
          context: {
            authenticated: isAuthenticated,
            previousMessages: messages.slice(-3),
            realTimeData: realTimeData
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: result.data.response,
          sender: 'bot',
          timestamp: new Date(),
          intent: result.data.intent,
          confidence: result.data.confidence,
          data: result.data.additionalData
        };

        setMessages(prev => [...prev, botMessage]);

        // Handle special intents with real data
        await handleSpecialIntents(result.data.intent, botMessage);
      } else {
        addErrorMessage("عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.");
      }
    } catch (error) {
      console.error('Chat processing error:', error);
      addErrorMessage("عذراً، الخدمة ��ير متاحة حالياً. يرجى المحاولة لاحقاً.");
    } finally {
      setIsTyping(false);
    }
  };

  // Handle special intents with real banking data
  const handleSpecialIntents = async (intent: string, botMessage: Message) => {
    switch (intent) {
      case 'balance_inquiry':
        if (isAuthenticated) {
          await fetchRealTimeBalance();
        }
        break;
        
      case 'market_rates':
        await showCurrentMarketRates();
        break;
        
      case 'transaction_history':
        if (isAuthenticated) {
          await fetchTransactionHistory();
        }
        break;
        
      case 'system_status':
        await showSystemStatus();
        break;
    }
  };

  // Fetch real-time account balance
  const fetchRealTimeBalance = async () => {
    try {
      const response = await fetch('/api/realtime/balance/0001234567890123', {
        headers: {
          'user-id': 'user_123'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const balanceMessage: Message = {
          id: Date.now().toString(),
          text: `رصيد حسابك الجاري: ${data.data.balance.available.toLocaleString()} د.ج\nآخر تحديث: ${new Date(data.data.lastUpdated).toLocaleString('ar-DZ')}`,
          sender: 'bot',
          timestamp: new Date(),
          data: data.data
        };
        setMessages(prev => [...prev, balanceMessage]);

        // Show equivalent amounts
        if (data.data.equivalentAmounts) {
          const equivalentMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: `المبلغ المعادل:\n💵 ${data.data.equivalentAmounts.USD} USD\n💶 ${data.data.equivalentAmounts.EUR} EUR\n💷 ${data.data.equivalentAmounts.GBP} GBP`,
            sender: 'bot',
            timestamp: new Date(),
            data: data.data.equivalentAmounts
          };
          setMessages(prev => [...prev, equivalentMessage]);
        }
      }
    } catch (error) {
      console.error('Balance fetch error:', error);
      addErrorMessage("عذراً، لا يمكن الوصول لرصيد الحساب حالياً.");
    }
  };

  // Show current market rates
  const showCurrentMarketRates = async () => {
    if (realTimeData.marketData) {
      const rates = realTimeData.marketData.market.dzdRates;
      const ratesText = `أسعار الصرف الحالية (د.ج):\n` +
        `💵 الدولار الأمريكي: ${rates.USD}\n` +
        `💶 اليورو: ${rates.EUR}\n` +
        `💷 الجنيه الإسترليني: ${rates.GBP}\n` +
        `🇸🇦 الريال السعودي: ${rates.SAR}\n` +
        `آخر تحديث: ${new Date(realTimeData.marketData.market.timestamp).toLocaleString('ar-DZ')}`;
      
      const ratesMessage: Message = {
        id: Date.now().toString(),
        text: ratesText,
        sender: 'bot',
        timestamp: new Date(),
        data: rates
      };
      setMessages(prev => [...prev, ratesMessage]);
    }
  };

  // Fetch transaction history
  const fetchTransactionHistory = async () => {
    try {
      const response = await fetch('/api/realtime/transactions/0001234567890123?limit=5', {
        headers: {
          'user-id': 'user_123'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const transactions = data.data.transactions.slice(0, 3);
        
        let historyText = "آخر 3 عمليات:\n";
        transactions.forEach((txn: any, index: number) => {
          const type = txn.transactionType === 'CREDIT' ? '⬆️ إيداع' : '⬇️ سحب';
          const amount = txn.amount.value.toLocaleString();
          const date = new Date(txn.valueDate).toLocaleDateString('ar-DZ');
          historyText += `\n${index + 1}. ${type}: ${amount} د.ج - ${date}\n   ${txn.description}`;
        });
        
        const historyMessage: Message = {
          id: Date.now().toString(),
          text: historyText,
          sender: 'bot',
          timestamp: new Date(),
          data: transactions
        };
        setMessages(prev => [...prev, historyMessage]);
      }
    } catch (error) {
      console.error('Transaction history error:', error);
      addErrorMessage("عذراً، لا يمكن الوصول لتاريخ العمليات حالياً.");
    }
  };

  // Show system status
  const showSystemStatus = async () => {
    try {
      const response = await fetch('/api/realtime/system-status');
      if (response.ok) {
        const data = await response.json();
        const statusText = `حالة النظام:\n` +
          `🟢 النظام: ${data.data.systemHealth}\n` +
          `⏰ معدل التشغيل: ${data.data.uptime}%\n` +
          `📊 إجمالي العمليات: ${data.data.totalTransactions.toLocaleString()}\n` +
          `🛡️ معدل اكتشاف الاحتيال: ${data.data.fraudDetectionRate}%\n` +
          `🏦 البنوك المتصلة: ${data.data.bankConnectivity.filter((b: any) => b.status === 'ONLINE').length}/8`;
        
        const statusMessage: Message = {
          id: Date.now().toString(),
          text: statusText,
          sender: 'bot',
          timestamp: new Date(),
          data: data.data
        };
        setMessages(prev => [...prev, statusMessage]);
      }
    } catch (error) {
      addErrorMessage("عذراً، لا يمكن الوصول لحالة النظام حالياً.");
    }
  };

  // Add system message
  const addSystemMessage = (text: string, type: string) => {
    const systemMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      intent: type
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  // Add error message
  const addErrorMessage = (text: string) => {
    const errorMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      intent: 'error'
    };
    setMessages(prev => [...prev, errorMessage]);
  };

  // Auto-detect language
  const detectLanguage = (text: string): 'ar' | 'fr' | 'dz' => {
    const arabicPattern = /[\u0600-\u06FF]/;
    const frenchPattern = /[àâäçéèêëïîôùûüÿ]/i;
    
    if (arabicPattern.test(text)) {
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

  // Voice recognition
  const toggleVoiceRecognition = () => {
    if (!isListening) {
      setIsListening(true);
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

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with professional welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '0',
      text: 'أهلاً وسهلاً بك في بنك جيني الذكي\n\nأنا مساعدك المصرفي الذكي، متصل مباشرة بالنظام المصرفي الجزائري لتقديم خدمات فورية ودقيقة.\n\nيمكنني مساعدتك في:\n• الاستعلام عن أرصدة حساباتك\n• عرض تاريخ العمليات المصرفية\n• متابعة أسعار صرف العملات\n• محاكاة القروض وحساب الأقساط\n• خدمات البطاقات المصرفية\n• معلومات الفروع والصرافات\n\nكيف يمكنني خدمتك اليوم؟',
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Enhanced Header with Real-time Status */}
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                  <Bot className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">BankGenie AI Assistant</CardTitle>
                  <div className="flex items-center space-x-2">
                    <p className="text-muted-foreground">مساعد بنكي ذكي • Assistant bancaire intelligent</p>
                    {realTimeData.systemStatus && (
                      <Badge variant="default" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        Live Data
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
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
            
            {/* Real-time Status Bar */}
            {realTimeData.marketData && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                      USD: {realTimeData.marketData.market.dzdRates.USD} DZD
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1 text-blue-500" />
                      EUR: {realTimeData.marketData.market.dzdRates.EUR} DZD
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">Live Updates</span>
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}
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
                            : message.intent === 'error'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : message.intent === 'security_alert'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <p className="text-sm whitespace-pre-line">{message.text}</p>
                        </div>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                          {message.intent && message.confidence && (
                            <Badge variant="outline" className="text-xs">
                              {message.intent} ({Math.round(message.confidence * 100)}%)
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
          
          {/* Enhanced Input Area */}
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
              <Button onClick={handleSendMessage} disabled={!inputText.trim() || isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Enhanced Quick Actions with Real-time Features */}
            <div className="flex flex-wrap gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={() => setInputText("رصيد حسابي الفوري")}>
                <CreditCard className="h-3 w-3 mr-1" />
                رصيد فوري
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInputText("أسعار الصرف الحالية")}>
                <TrendingUp className="h-3 w-3 mr-1" />
                أسعار الصرف
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInputText("آخر 5 عمليات")}>
                <FileText className="h-3 w-3 mr-1" />
                العمليات الأخيرة
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInputText("حالة النظام البنكي")}>
                <Shield className="h-3 w-3 mr-1" />
                حالة النظام
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInputText("أقرب فرع")}>
                <MapPin className="h-3 w-3 mr-1" />
                مواقع الفروع
              </Button>
            </div>
          </div>
        </Card>

        {/* Enhanced Auth Status with Real-time Features */}
        {!isAuthenticated ? (
          <Card className="mt-4 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-yellow-800">
                  سجل دخولك للوصول إلى البيانات الحية والخدمات المصرفية الكاملة • Connectez-vous pour accéder aux données en temps réel
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
        ) : (
          <Card className="mt-4 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-green-800">
                    متصل بالنظام المصرفي الحي • Connecté au système bancaire en temps réel
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {realTimeData.systemStatus === 'HEALTHY' && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <Zap className="h-3 w-3 mr-1" />
                      Live Data Active
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
