import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Settings,
  Filter,
  RefreshCw,
  Eye,
  MoreHorizontal,
  Flag
} from "lucide-react";

interface ConversationMetrics {
  totalConversations: number;
  activeUsers: number;
  avgResponseTime: number;
  satisfactionScore: number;
  languageDistribution: { language: string; percentage: number; count: number }[];
  intentDistribution: { intent: string; count: number; accuracy: number }[];
  hourlyActivity: { hour: number; conversations: number }[];
}

interface FraudAlert {
  id: string;
  type: 'suspicious_login' | 'unusual_transaction' | 'account_takeover' | 'phishing_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  description: string;
  timestamp: Date;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  location: string;
  riskScore: number;
}

interface UserSession {
  id: string;
  userId: string;
  userName: string;
  startTime: Date;
  lastActivity: Date;
  messageCount: number;
  language: string;
  location: string;
  device: string;
  status: 'active' | 'idle' | 'ended';
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<ConversationMetrics | null>(null);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [activeSessions, setActiveSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  // Generate realistic metrics data
  useEffect(() => {
    const generateMetrics = (): ConversationMetrics => {
      const now = new Date();
      const hourlyActivity = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        conversations: Math.floor(Math.random() * 100) + 20
      }));

      return {
        totalConversations: 2847,
        activeUsers: 156,
        avgResponseTime: 1.2,
        satisfactionScore: 4.3,
        languageDistribution: [
          { language: 'العربية', percentage: 45, count: 1281 },
          { language: 'Français', percentage: 35, count: 996 },
          { language: 'الدارجة', percentage: 20, count: 570 }
        ],
        intentDistribution: [
          { intent: 'balance_inquiry', count: 456, accuracy: 95.2 },
          { intent: 'card_services', count: 342, accuracy: 91.8 },
          { intent: 'loan_inquiry', count: 289, accuracy: 88.5 },
          { intent: 'branch_locator', count: 234, accuracy: 96.7 },
          { intent: 'transfer_money', count: 198, accuracy: 89.3 },
          { intent: 'complaint', count: 145, accuracy: 85.1 }
        ],
        hourlyActivity
      };
    };

    const generateFraudAlerts = (): FraudAlert[] => {
      const alertTypes = ['suspicious_login', 'unusual_transaction', 'account_takeover', 'phishing_attempt'];
      const severities = ['low', 'medium', 'high', 'critical'];
      const locations = ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Setif'];
      
      return Array.from({ length: 12 }, (_, i) => ({
        id: `alert_${i + 1}`,
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)] as any,
        severity: severities[Math.floor(Math.random() * severities.length)] as any,
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        description: getAlertDescription(alertTypes[Math.floor(Math.random() * alertTypes.length)]),
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        status: ['new', 'investigating', 'resolved'][Math.floor(Math.random() * 3)] as any,
        location: locations[Math.floor(Math.random() * locations.length)],
        riskScore: Math.floor(Math.random() * 100) + 1
      }));
    };

    const generateActiveSessions = (): UserSession[] => {
      const devices = ['iPhone 12', 'Samsung Galaxy S21', 'Web Browser', 'Android App'];
      const locations = ['Algiers', 'Oran', 'Constantine', 'Annaba'];
      const languages = ['ar', 'fr', 'dz'];
      
      return Array.from({ length: 8 }, (_, i) => ({
        id: `session_${i + 1}`,
        userId: `user_${i + 100}`,
        userName: `User ${i + 100}`,
        startTime: new Date(Date.now() - Math.random() * 3600000),
        lastActivity: new Date(Date.now() - Math.random() * 300000),
        messageCount: Math.floor(Math.random() * 20) + 1,
        language: languages[Math.floor(Math.random() * languages.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        device: devices[Math.floor(Math.random() * devices.length)],
        status: ['active', 'idle'][Math.floor(Math.random() * 2)] as any
      }));
    };

    setTimeout(() => {
      setMetrics(generateMetrics());
      setFraudAlerts(generateFraudAlerts());
      setActiveSessions(generateActiveSessions());
      setIsLoading(false);
    }, 1000);
  }, [selectedTimeRange]);

  const getAlertDescription = (type: string): string => {
    const descriptions = {
      suspicious_login: 'Multiple failed login attempts from new device',
      unusual_transaction: 'Large transaction outside normal pattern',
      account_takeover: 'Account accessed from suspicious location',
      phishing_attempt: 'User received suspicious communication'
    };
    return descriptions[type as keyof typeof descriptions] || 'Security alert detected';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const exportData = (type: string) => {
    const data = type === 'conversations' ? metrics : 
                 type === 'fraud' ? fraudAlerts : activeSessions;
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">لوحة تحكم المشرفين • Tableau de bord administrateur</p>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-background border border-border rounded-md px-3 py-2"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalConversations.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.5%</span> from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8.2%</span> from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.avgResponseTime}s</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">-0.3s</span> improvement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.satisfactionScore}/5</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+0.2</span> from last period
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
            <TabsTrigger value="sessions">Live Sessions</TabsTrigger>
            <TabsTrigger value="nlp">NLP Management</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Language Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Language Distribution</CardTitle>
                  <CardDescription>Conversation languages in the last {selectedTimeRange}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {metrics?.languageDistribution.map((lang, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{lang.language}</span>
                          <span className="text-sm text-muted-foreground">{lang.count} ({lang.percentage}%)</span>
                        </div>
                        <Progress value={lang.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Intent Accuracy */}
              <Card>
                <CardHeader>
                  <CardTitle>Intent Recognition Accuracy</CardTitle>
                  <CardDescription>NLP model performance by intent</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {metrics?.intentDistribution.map((intent, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium capitalize">{intent.intent.replace('_', ' ')}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">{intent.count}</span>
                            <Badge variant={intent.accuracy > 90 ? "default" : intent.accuracy > 80 ? "secondary" : "destructive"}>
                              {intent.accuracy}%
                            </Badge>
                          </div>
                        </div>
                        <Progress value={intent.accuracy} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Export Data */}
            <Card>
              <CardHeader>
                <CardTitle>Data Export</CardTitle>
                <CardDescription>Download analytics data in various formats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button variant="outline" onClick={() => exportData('conversations')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Conversations (JSON)
                  </Button>
                  <Button variant="outline" onClick={() => exportData('analytics')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Analytics (CSV)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fraud Detection Tab */}
          <TabsContent value="fraud" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Security Alerts</CardTitle>
                    <CardDescription>Real-time fraud detection and monitoring</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => exportData('fraud')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {fraudAlerts.map((alert) => (
                      <div key={alert.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {alert.type.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm text-muted-foreground">Risk: {alert.riskScore}%</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={
                              alert.status === 'new' ? "default" :
                              alert.status === 'investigating' ? "secondary" :
                              alert.status === 'resolved' ? "outline" : "destructive"
                            }>
                              {alert.status}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-foreground mb-2">{alert.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>User: {alert.userId}</span>
                          <span>Location: {alert.location}</span>
                          <span>Time: {alert.timestamp.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active User Sessions</CardTitle>
                <CardDescription>Real-time monitoring of user interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeSessions.map((session) => (
                    <div key={session.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`h-3 w-3 rounded-full ${
                            session.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                          }`} />
                          <div>
                            <p className="font-medium">{session.userName}</p>
                            <p className="text-sm text-muted-foreground">
                              {session.device} • {session.location} • {session.language.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{session.messageCount} messages</p>
                          <p className="text-xs text-muted-foreground">
                            Started: {session.startTime.toLocaleTimeString()}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NLP Management Tab */}
          <TabsContent value="nlp" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Model Performance</CardTitle>
                  <CardDescription>NLP model accuracy and training status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Overall Accuracy</span>
                      <Badge variant="default">91.2%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Arabic Processing</span>
                      <Badge variant="default">89.5%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>French Processing</span>
                      <Badge variant="default">93.1%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Darija Processing</span>
                      <Badge variant="secondary">85.7%</Badge>
                    </div>
                    <Button className="w-full mt-4">
                      <Settings className="h-4 w-4 mr-2" />
                      Retrain Model
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Intent Management</CardTitle>
                  <CardDescription>Add and manage conversation intents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Manage Intent Library
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Training Data Analysis
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Flag className="h-4 w-4 mr-2" />
                      Review Failed Conversations
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Filter className="h-4 w-4 mr-2" />
                      Conversation Quality Filter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
