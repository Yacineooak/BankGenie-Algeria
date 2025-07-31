import { EventEmitter } from 'events';

// Real-time data sources for Algerian financial market
interface MarketData {
  timestamp: string;
  dzdRates: {
    [currency: string]: number;
  };
  interestRates: {
    centralBankRate: number;
    averageLendingRate: number;
    averageDepositRate: number;
  };
  inflationRate: number;
  economicIndicators: {
    gdpGrowth: number;
    unemploymentRate: number;
    oilPriceImpact: number;
  };
}

interface RealTimeAlert {
  id: string;
  type: 'TRANSACTION' | 'FRAUD' | 'SYSTEM' | 'REGULATORY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: string;
  message: string;
  timestamp: string;
  metadata?: any;
}

interface BankingMetrics {
  totalTransactions: number;
  totalVolume: number;
  averageTransactionSize: number;
  fraudDetectionRate: number;
  systemUptime: number;
  apiResponseTimes: {
    [bankCode: string]: number;
  };
}

class RealTimeDataService extends EventEmitter {
  private static instance: RealTimeDataService;
  private marketData: MarketData | null = null;
  private bankingMetrics: BankingMetrics | null = null;
  private activeAlerts: RealTimeAlert[] = [];
  private dataUpdateInterval: NodeJS.Timeout | null = null;
  private metricsUpdateInterval: NodeJS.Timeout | null = null;

  static getInstance(): RealTimeDataService {
    if (!RealTimeDataService.instance) {
      RealTimeDataService.instance = new RealTimeDataService();
    }
    return RealTimeDataService.instance;
  }

  // Start real-time data streaming
  startRealTimeUpdates(): void {
    console.log('Starting real-time data updates...');

    // Update market data every 30 seconds
    this.dataUpdateInterval = setInterval(() => {
      this.updateMarketData();
    }, 30000);

    // Update banking metrics every 10 seconds  
    this.metricsUpdateInterval = setInterval(() => {
      this.updateBankingMetrics();
    }, 10000);

    // Initial data load
    this.updateMarketData();
    this.updateBankingMetrics();
    this.simulateRealTimeAlerts();
  }

  stopRealTimeUpdates(): void {
    if (this.dataUpdateInterval) {
      clearInterval(this.dataUpdateInterval);
      this.dataUpdateInterval = null;
    }
    if (this.metricsUpdateInterval) {
      clearInterval(this.metricsUpdateInterval);
      this.metricsUpdateInterval = null;
    }
    console.log('Real-time data updates stopped');
  }

  // Fetch real-time market data (would connect to Bank of Algeria, Reuters, Bloomberg)
  private async updateMarketData(): Promise<void> {
    try {
      // In production, this would fetch from:
      // - Bank of Algeria official rates API
      // - Central Bank monetary policy rates
      // - International market data providers
      // - Economic statistics from ONS (Office National des Statistiques)

      const newMarketData: MarketData = {
        timestamp: new Date().toISOString(),
        dzdRates: await this.fetchDZDExchangeRates(),
        interestRates: await this.fetchInterestRates(),
        inflationRate: await this.fetchInflationRate(),
        economicIndicators: await this.fetchEconomicIndicators()
      };

      // Check for significant changes
      if (this.hasSignificantChange(this.marketData, newMarketData)) {
        this.generateMarketAlert(newMarketData);
      }

      this.marketData = newMarketData;
      this.emit('marketDataUpdate', newMarketData);
      
    } catch (error) {
      console.error('Failed to update market data:', error);
      this.generateSystemAlert('MARKET_DATA_ERROR', 'Failed to fetch market data');
    }
  }

  // Fetch real exchange rates from multiple sources
  private async fetchDZDExchangeRates(): Promise<{ [currency: string]: number }> {
    try {
      // Primary source: Bank of Algeria
      // Backup sources: Commercial banks, parallel market rates
      
      // Simulate real-time rate fluctuations
      const baseRates = {
        'USD': 135.50,  // Official DZD/USD rate
        'EUR': 147.30,  // Official DZD/EUR rate
        'GBP': 168.20,  // Official DZD/GBP rate
        'SAR': 36.15,   // DZD/SAR rate
        'TND': 43.20,   // DZD/TND rate
        'MAD': 13.45,   // DZD/MAD rate
        'CNY': 19.10,   // DZD/CNY rate
        'JPY': 0.91     // DZD/JPY rate
      };

      // Add realistic fluctuations (±0.5%)
      const fluctuatedRates: { [currency: string]: number } = {};
      for (const [currency, rate] of Object.entries(baseRates)) {
        const fluctuation = (Math.random() - 0.5) * 0.01; // ±0.5%
        fluctuatedRates[currency] = parseFloat((rate * (1 + fluctuation)).toFixed(4));
      }

      return fluctuatedRates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      throw error;
    }
  }

  // Fetch current interest rates from Bank of Algeria
  private async fetchInterestRates(): Promise<any> {
    try {
      // These would come from Bank of Algeria monetary policy API
      return {
        centralBankRate: 3.25, // Current Bank of Algeria key rate
        averageLendingRate: 8.50, // Average commercial bank lending rate
        averageDepositRate: 2.75  // Average deposit rate
      };
    } catch (error) {
      console.error('Error fetching interest rates:', error);
      throw error;
    }
  }

  // Fetch inflation data
  private async fetchInflationRate(): Promise<number> {
    try {
      // Would connect to ONS (Office National des Statistiques) API
      // Current inflation rate with small monthly variations
      const baseInflation = 4.2; // Current Algeria inflation rate
      const variation = (Math.random() - 0.5) * 0.2;
      return parseFloat((baseInflation + variation).toFixed(2));
    } catch (error) {
      console.error('Error fetching inflation rate:', error);
      throw error;
    }
  }

  // Fetch economic indicators
  private async fetchEconomicIndicators(): Promise<any> {
    try {
      // Would connect to multiple official sources:
      // - Ministry of Finance
      // - ONS (Office National des Statistiques)
      // - IMF data for Algeria
      // - World Bank indicators
      
      return {
        gdpGrowth: 3.1, // GDP growth rate %
        unemploymentRate: 11.8, // Unemployment rate %
        oilPriceImpact: 0.85 // Oil price correlation factor
      };
    } catch (error) {
      console.error('Error fetching economic indicators:', error);
      throw error;
    }
  }

  // Update real-time banking metrics
  private async updateBankingMetrics(): Promise<void> {
    try {
      const newMetrics: BankingMetrics = {
        totalTransactions: this.generateRealisticTransactionCount(),
        totalVolume: this.generateRealisticVolume(),
        averageTransactionSize: this.generateAverageTransactionSize(),
        fraudDetectionRate: this.generateFraudDetectionRate(),
        systemUptime: this.calculateSystemUptime(),
        apiResponseTimes: this.measureApiResponseTimes()
      };

      this.bankingMetrics = newMetrics;
      this.emit('bankingMetricsUpdate', newMetrics);
      
    } catch (error) {
      console.error('Failed to update banking metrics:', error);
    }
  }

  // Generate realistic transaction volumes based on time of day
  private generateRealisticTransactionCount(): number {
    const hour = new Date().getHours();
    let baseCount = 1000;

    // Peak hours: 9-11 AM and 2-4 PM
    if ((hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16)) {
      baseCount *= 2.5;
    }
    // Evening hours: 6-8 PM
    else if (hour >= 18 && hour <= 20) {
      baseCount *= 1.8;
    }
    // Night hours: 10 PM - 6 AM
    else if (hour >= 22 || hour <= 6) {
      baseCount *= 0.3;
    }

    // Add random variation
    const variation = (Math.random() - 0.5) * 0.3;
    return Math.round(baseCount * (1 + variation));
  }

  private generateRealisticVolume(): number {
    const transactionCount = this.bankingMetrics?.totalTransactions || 1000;
    const avgSize = this.generateAverageTransactionSize();
    return transactionCount * avgSize;
  }

  private generateAverageTransactionSize(): number {
    // Average transaction size in DZD with realistic variations
    const base = 25000; // 25,000 DZD average
    const variation = (Math.random() - 0.5) * 0.4;
    return Math.round(base * (1 + variation));
  }

  private generateFraudDetectionRate(): number {
    // Fraud detection rate as percentage
    const base = 94.2; // 94.2% detection rate
    const variation = (Math.random() - 0.5) * 2;
    return parseFloat((base + variation).toFixed(2));
  }

  private calculateSystemUptime(): number {
    // System uptime percentage (should be very high)
    return parseFloat((99.5 + Math.random() * 0.5).toFixed(3));
  }

  private measureApiResponseTimes(): { [bankCode: string]: number } {
    // Measure response times to different bank APIs
    const banks = ['BNA', 'CPA', 'BADR', 'BEA', 'BDL', 'AGB', 'SGA', 'HSBC'];
    const responseTimes: { [bankCode: string]: number } = {};

    banks.forEach(bank => {
      // Simulate realistic response times (50-500ms)
      responseTimes[bank] = Math.round(50 + Math.random() * 450);
    });

    return responseTimes;
  }

  // Detect significant market changes
  private hasSignificantChange(oldData: MarketData | null, newData: MarketData): boolean {
    if (!oldData) return true;

    // Check for significant rate changes (>1%)
    for (const currency in newData.dzdRates) {
      const oldRate = oldData.dzdRates[currency];
      const newRate = newData.dzdRates[currency];
      if (oldRate && Math.abs((newRate - oldRate) / oldRate) > 0.01) {
        return true;
      }
    }

    // Check for interest rate changes
    if (Math.abs(newData.interestRates.centralBankRate - oldData.interestRates.centralBankRate) > 0.1) {
      return true;
    }

    return false;
  }

  // Generate market-related alerts
  private generateMarketAlert(marketData: MarketData): void {
    const alert: RealTimeAlert = {
      id: `MARKET_${Date.now()}`,
      type: 'SYSTEM',
      severity: 'MEDIUM',
      source: 'Market Data Service',
      message: 'Significant market movement detected',
      timestamp: new Date().toISOString(),
      metadata: {
        rates: marketData.dzdRates,
        interestRates: marketData.interestRates
      }
    };

    this.addAlert(alert);
  }

  // Generate system alerts
  private generateSystemAlert(type: string, message: string): void {
    const alert: RealTimeAlert = {
      id: `SYS_${Date.now()}`,
      type: 'SYSTEM',
      severity: 'HIGH',
      source: 'System Monitor',
      message,
      timestamp: new Date().toISOString(),
      metadata: { errorType: type }
    };

    this.addAlert(alert);
  }

  // Simulate real-time fraud and transaction alerts
  private simulateRealTimeAlerts(): void {
    setInterval(() => {
      // Generate random alerts to simulate real activity
      if (Math.random() < 0.1) { // 10% chance every interval
        const alertTypes = ['TRANSACTION', 'FRAUD', 'SYSTEM'];
        const severities = ['LOW', 'MEDIUM', 'HIGH'];
        
        const alert: RealTimeAlert = {
          id: `ALERT_${Date.now()}`,
          type: alertTypes[Math.floor(Math.random() * alertTypes.length)] as any,
          severity: severities[Math.floor(Math.random() * severities.length)] as any,
          source: 'Banking System',
          message: this.getRandomAlertMessage(),
          timestamp: new Date().toISOString()
        };

        this.addAlert(alert);
      }
    }, 15000); // Every 15 seconds
  }

  private getRandomAlertMessage(): string {
    const messages = [
      'Large transaction detected - manual review required',
      'Multiple login attempts from new location',
      'System performance degradation in payment processing',
      'Cross-border transaction flagged for review',
      'API response time threshold exceeded',
      'Unusual activity pattern detected',
      'High-value transaction outside normal hours',
      'New device access requires verification'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Alert management
  private addAlert(alert: RealTimeAlert): void {
    this.activeAlerts.unshift(alert);
    
    // Keep only last 100 alerts
    if (this.activeAlerts.length > 100) {
      this.activeAlerts = this.activeAlerts.slice(0, 100);
    }

    this.emit('newAlert', alert);
  }

  // Public getters
  getCurrentMarketData(): MarketData | null {
    return this.marketData;
  }

  getCurrentBankingMetrics(): BankingMetrics | null {
    return this.bankingMetrics;
  }

  getActiveAlerts(): RealTimeAlert[] {
    return this.activeAlerts;
  }

  // WebSocket connection for real-time updates
  getWebSocketData() {
    return {
      marketData: this.marketData,
      bankingMetrics: this.bankingMetrics,
      alerts: this.activeAlerts.slice(0, 10), // Last 10 alerts
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const realTimeDataService = RealTimeDataService.getInstance();

// Types for external use
export type { MarketData, RealTimeAlert, BankingMetrics };
