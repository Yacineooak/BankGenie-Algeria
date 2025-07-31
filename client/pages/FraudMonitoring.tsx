import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  MapPin, 
  Clock, 
  TrendingUp,
  Users,
  CreditCard,
  Smartphone,
  Monitor,
  Flag,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";

interface FraudAlert {
  id: string;
  userId: string;
  userName: string;
  type: 'account_takeover' | 'suspicious_login' | 'unusual_transaction' | 'phishing_attempt' | 'sim_swap' | 'device_fraud';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  location: string;
  ipAddress: string;
  deviceInfo: string;
  riskScore: number;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  evidence: string[];
  actions: string[];
}

interface SecurityMetrics {
  totalAlerts: number;
  criticalAlerts: number;
  resolvedToday: number;
  falsePositiveRate: number;
  avgResponseTime: number;
  blockedAttempts: number;
}

interface RiskPattern {
  type: string;
  count: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  locations: string[];
  timePatterns: string[];
}

export default function FraudMonitoring() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [riskPatterns, setRiskPatterns] = useState<RiskPattern[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Generate realistic fraud alerts
  useEffect(() => {
    const generateAlerts = (): FraudAlert[] => {
      const alertTypes = ['account_takeover', 'suspicious_login', 'unusual_transaction', 'phishing_attempt', 'sim_swap', 'device_fraud'];
      const severities = ['low', 'medium', 'high', 'critical'];
      const statuses = ['new', 'investigating', 'resolved', 'false_positive'];
      const locations = ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Setif', 'Batna', 'Tlemcen'];
      const devices = ['iPhone 12', 'Samsung Galaxy S21', 'Chrome Browser', 'Firefox', 'Android App', 'iOS App'];

      return Array.from({ length: 25 }, (_, i) => ({
        id: `alert_${String(i + 1).padStart(3, '0')}`,
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        userName: `User ${Math.floor(Math.random() * 1000)}`,
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)] as any,
        severity: severities[Math.floor(Math.random() * severities.length)] as any,
        description: getAlertDescription(alertTypes[Math.floor(Math.random() * alertTypes.length)]),
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        location: locations[Math.floor(Math.random() * locations.length)],
        ipAddress: `41.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        deviceInfo: devices[Math.floor(Math.random() * devices.length)],
        riskScore: Math.floor(Math.random() * 40) + 60,
        status: statuses[Math.floor(Math.random() * statuses.length)] as any,
        assignedTo: Math.random() > 0.5 ? 'Security Team' : undefined,
        evidence: ['Geolocation mismatch', 'Device fingerprint change', 'Unusual transaction pattern'],
        actions: ['Account temporarily frozen', 'SMS verification sent', 'Security team notified']
      }));
    };

    const generateMetrics = (): SecurityMetrics => ({
      totalAlerts: 127,
      criticalAlerts: 8,
      resolvedToday: 23,
      falsePositiveRate: 12.5,
      avgResponseTime: 8.2,
      blockedAttempts: 1847
    });

    const generateRiskPatterns = (): RiskPattern[] => [
      {
        type: 'Multiple login attempts',
        count: 34,
        trend: 'increasing',
        locations: ['Algiers', 'Oran'],
        timePatterns: ['Late night (22:00-02:00)', 'Weekend peaks']
      },
      {
        type: 'Cross-border transactions',
        count: 12,
        trend: 'stable',
        locations: ['Tunisia border', 'Morocco border'],
        timePatterns: ['Business hours', 'End of month spikes']
      },
      {
        type: 'Device spoofing',
        count: 8,
        trend: 'decreasing',
        locations: ['Constantine', 'Setif'],
        timePatterns: ['Random distribution']
      }
    ];

    setTimeout(() => {
      setAlerts(generateAlerts());
      setMetrics(generateMetrics());
      setRiskPatterns(generateRiskPatterns());
      setIsLoading(false);
    }, 1000);
  }, []);

  const getAlertDescription = (type: string): string => {
    const descriptions = {
      account_takeover: 'Potential account takeover detected - unusual access patterns',
      suspicious_login: 'Login attempt from unrecognized device/location',
      unusual_transaction: 'Transaction amount significantly above user average',
      phishing_attempt: 'User reported suspicious communication',
      sim_swap: 'SIM card replacement detected - verify user identity',
      device_fraud: 'Device fingerprint indicates potential fraud'
    };
    return descriptions[type as keyof typeof descriptions] || 'Security alert detected';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-red-600 bg-red-100';
      case 'investigating': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'false_positive': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && alert.status !== filterStatus) return false;
    return true;
  });

  const updateAlertStatus = (alertId: string, newStatus: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: newStatus as any } : alert
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading fraud monitoring system...</p>
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
            <h1 className="text-3xl font-bold text-foreground">Fraud Monitoring</h1>
            <p className="text-muted-foreground">مراقبة الاحتيال • Surveillance de la fraude</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalAlerts}</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
              <Flag className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics?.criticalAlerts}</div>
              <p className="text-xs text-muted-foreground">Require immediate action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics?.resolvedToday}</div>
              <p className="text-xs text-muted-foreground">+15% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">False Positive</CardTitle>
              <XCircle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.falsePositiveRate}%</div>
              <p className="text-xs text-muted-foreground">-2% improvement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.avgResponseTime}m</div>
              <p className="text-xs text-muted-foreground">Response time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blocked</CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.blockedAttempts}</div>
              <p className="text-xs text-muted-foreground">Threats blocked</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
            <TabsTrigger value="patterns">Risk Patterns</TabsTrigger>
            <TabsTrigger value="realtime">Real-time Monitor</TabsTrigger>
          </TabsList>

          {/* Security Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Alert Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-medium">Severity:</span>
                    <select 
                      value={filterSeverity}
                      onChange={(e) => setFilterSeverity(e.target.value)}
                      className="bg-background border border-border rounded-md px-2 py-1"
                    >
                      <option value="all">All</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Status:</span>
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-background border border-border rounded-md px-2 py-1"
                    >
                      <option value="all">All</option>
                      <option value="new">New</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                      <option value="false_positive">False Positive</option>
                    </select>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredAlerts.length} of {alerts.length} alerts
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alerts List */}
            <Card>
              <CardHeader>
                <CardTitle>Security Alerts</CardTitle>
                <CardDescription>Real-time fraud detection and monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {filteredAlerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        className="border border-border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedAlert(alert)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {alert.type.replace('_', ' ')}
                            </Badge>
                            <div className="text-sm text-muted-foreground">
                              Risk: {alert.riskScore}%
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(alert.status)}>
                              {alert.status.replace('_', ' ')}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <h4 className="font-medium text-foreground mb-1">{alert.description}</h4>
                          <p className="text-sm text-muted-foreground">User: {alert.userName} ({alert.userId})</p>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{alert.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Monitor className="h-3 w-3" />
                            <span>{alert.deviceInfo}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{alert.timestamp.toLocaleString()}</span>
                          </div>
                          <div>IP: {alert.ipAddress}</div>
                        </div>
                        
                        {alert.status === 'new' && (
                          <div className="flex space-x-2 mt-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateAlertStatus(alert.id, 'investigating');
                              }}
                            >
                              Investigate
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateAlertStatus(alert.id, 'false_positive');
                              }}
                            >
                              Mark False Positive
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Patterns Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {riskPatterns.map((pattern, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{pattern.type}</CardTitle>
                      {getTrendIcon(pattern.trend)}
                    </div>
                    <CardDescription>{pattern.count} incidents detected</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Top Locations:</h4>
                        <div className="flex flex-wrap gap-1">
                          {pattern.locations.map((location, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {location}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Time Patterns:</h4>
                        <div className="space-y-1">
                          {pattern.timePatterns.map((time, idx) => (
                            <div key={idx} className="text-xs text-muted-foreground">
                              • {time}
                            </div>
                          ))}
                        </div>
                      </div>
                      <Progress value={(pattern.count / 50) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Real-time Monitor Tab */}
          <TabsContent value="realtime" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Live Activity Feed</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {Array.from({ length: 10 }, (_, i) => (
                        <div key={i} className="flex items-center space-x-3 p-3 bg-muted/30 rounded">
                          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                          <div className="flex-1">
                            <p className="text-sm">Login attempt from Algiers blocked</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(Date.now() - Math.random() * 300000).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Fraud Detection Engine</span>
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>ML Model Accuracy</span>
                      <span className="font-medium">94.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Transaction Monitoring</span>
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Alert Processing</span>
                      <span className="font-medium">1.2s avg</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Database Status</span>
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Healthy
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Alert Detail Modal */}
        {selectedAlert && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Alert Details</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedAlert(null)}>
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Alert Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>ID:</strong> {selectedAlert.id}</div>
                      <div><strong>Type:</strong> {selectedAlert.type.replace('_', ' ')}</div>
                      <div><strong>Severity:</strong> {selectedAlert.severity}</div>
                      <div><strong>Risk Score:</strong> {selectedAlert.riskScore}%</div>
                      <div><strong>Status:</strong> {selectedAlert.status}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">User & Device</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>User:</strong> {selectedAlert.userName}</div>
                      <div><strong>User ID:</strong> {selectedAlert.userId}</div>
                      <div><strong>Device:</strong> {selectedAlert.deviceInfo}</div>
                      <div><strong>IP:</strong> {selectedAlert.ipAddress}</div>
                      <div><strong>Location:</strong> {selectedAlert.location}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedAlert.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Evidence</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {selectedAlert.evidence.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Actions Taken</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {selectedAlert.actions.map((action, idx) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex space-x-2 pt-4 border-t">
                  <Button 
                    size="sm"
                    onClick={() => {
                      updateAlertStatus(selectedAlert.id, 'resolved');
                      setSelectedAlert(null);
                    }}
                  >
                    Mark Resolved
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      updateAlertStatus(selectedAlert.id, 'false_positive');
                      setSelectedAlert(null);
                    }}
                  >
                    False Positive
                  </Button>
                  <Button variant="outline" size="sm">
                    Escalate
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
