import { RequestHandler } from "express";
import { interbankProcessor, ALGERIAN_BANKS, getDZDExchangeRates } from "../services/algerianBanks";
import { realTimeDataService, MarketData, BankingMetrics } from "../services/realTimeData";

// Real-time account balance with multi-bank integration
export const getRealTimeBalance: RequestHandler = async (req, res) => {
  const { accountNumber } = req.params;
  const userId = req.headers['user-id'] as string;
  const bankCode = req.query.bankCode as string || 'BNA';

  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      error: 'AUTHENTICATION_REQUIRED',
      message: 'User authentication required for balance inquiry'
    });
  }

  try {
    // Get real-time balance from specific bank
    const balanceResult = await interbankProcessor.getAccountBalance(accountNumber, bankCode);
    
    if (!balanceResult.success) {
      return res.status(503).json({
        success: false,
        error: 'BANK_SERVICE_UNAVAILABLE',
        message: `Unable to connect to ${bankCode}`,
        bankCode
      });
    }

    // Get current exchange rates for multi-currency display
    const exchangeRates = await getDZDExchangeRates();
    
    // Calculate equivalent amounts in major currencies
    const balanceDZD = balanceResult.data.balance.available;
    const equivalentAmounts = {
      USD: (balanceDZD / exchangeRates.rates.USD).toFixed(2),
      EUR: (balanceDZD / exchangeRates.rates.EUR).toFixed(2),
      GBP: (balanceDZD / exchangeRates.rates.GBP).toFixed(2)
    };

    // Log transaction for audit trail
    console.log(`Balance inquiry: User ${userId}, Account ${accountNumber}, Bank ${bankCode}`);

    res.json({
      success: true,
      data: {
        ...balanceResult.data,
        equivalentAmounts,
        exchangeRates: exchangeRates.rates,
        rateTimestamp: exchangeRates.date
      },
      metadata: {
        ...balanceResult.metadata,
        queryTime: new Date().toISOString(),
        userId
      }
    });

  } catch (error) {
    console.error('Real-time balance error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Unable to retrieve account balance'
    });
  }
};

// Real-time transaction processing with fraud detection
export const processRealTimeTransaction: RequestHandler = async (req, res) => {
  const { 
    fromAccount, 
    toAccount, 
    amount, 
    currency = 'DZD', 
    description,
    transactionType = 'TRANSFER'
  } = req.body;
  const userId = req.headers['user-id'] as string;
  const userIP = req.ip;
  const userAgent = req.headers['user-agent'];

  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      error: 'AUTHENTICATION_REQUIRED' 
    });
  }

  try {
    // Validate transaction data
    if (!fromAccount || !toAccount || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TRANSACTION_DATA',
        message: 'From account, to account, and valid amount are required'
      });
    }

    // Check daily limits and business rules
    if (amount > 1000000) { // 1M DZD daily limit
      return res.status(400).json({
        success: false,
        error: 'AMOUNT_EXCEEDS_LIMIT',
        message: 'Transaction amount exceeds daily limit of 1,000,000 DZD'
      });
    }

    // Real-time fraud detection
    const userProfile = {
      userId,
      lastLocation: req.headers['x-location'] as string,
      currentLocation: req.headers['x-current-location'] as string,
      averageTransactionAmount: 50000, // Would come from user history
      newDevice: req.headers['x-new-device'] === 'true'
    };

    const fraudCheck = await interbankProcessor.performFraudCheck({
      accountNumber: fromAccount,
      amount: { value: amount, currency },
      transactionType: transactionType as any,
      description
    }, userProfile);

    // Handle high-risk transactions
    if (fraudCheck.riskScore > 70) {
      return res.status(202).json({
        success: false,
        error: 'TRANSACTION_REQUIRES_REVIEW',
        message: 'Transaction flagged for manual review due to risk factors',
        riskAnalysis: {
          score: fraudCheck.riskScore,
          level: fraudCheck.riskLevel,
          factors: fraudCheck.riskFactors,
          requiresManualReview: true
        },
        nextSteps: [
          'Transaction temporarily held',
          'SMS verification will be sent',
          'Manual review initiated',
          'Expected resolution within 2 hours'
        ]
      });
    }

    // Process transaction through appropriate banks
    const fromBankCode = extractBankCodeFromAccount(fromAccount);
    const toBankCode = extractBankCodeFromAccount(toAccount);
    
    // Cross-bank transaction handling
    let transactionResult;
    if (fromBankCode === toBankCode) {
      // Same bank transaction
      transactionResult = await interbankProcessor.processTransaction({
        accountNumber: fromAccount,
        counterpartyAccount: toAccount,
        amount: { value: amount, currency },
        transactionType: 'DEBIT',
        description: description || 'Internal transfer'
      });
    } else {
      // Cross-bank transaction (requires interbank clearing)
      transactionResult = await processCrossBankTransfer(fromAccount, toAccount, amount, description);
    }

    if (!transactionResult.success) {
      return res.status(400).json({
        success: false,
        error: transactionResult.error,
        message: transactionResult.message
      });
    }

    // Log successful transaction
    console.log(`Transaction processed: ${transactionResult.confirmationNumber}`);

    res.json({
      success: true,
      data: {
        transactionId: transactionResult.confirmationNumber,
        status: 'EXECUTED',
        fromAccount,
        toAccount,
        amount: { value: amount, currency },
        executionTime: transactionResult.executionTime,
        estimatedArrival: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
        fees: calculateTransactionFees(amount, fromBankCode, toBankCode),
        riskAnalysis: {
          score: fraudCheck.riskScore,
          level: fraudCheck.riskLevel
        }
      },
      metadata: {
        userId,
        bankRouting: {
          fromBank: ALGERIAN_BANKS.find(b => b.code === fromBankCode)?.name,
          toBank: ALGERIAN_BANKS.find(b => b.code === toBankCode)?.name,
          crossBank: fromBankCode !== toBankCode
        }
      }
    });

  } catch (error) {
    console.error('Transaction processing error:', error);
    res.status(500).json({
      success: false,
      error: 'TRANSACTION_PROCESSING_ERROR',
      message: 'Unable to process transaction at this time'
    });
  }
};

// Real-time transaction history with multi-bank aggregation
export const getRealTimeTransactionHistory: RequestHandler = async (req, res) => {
  const { accountNumber } = req.params;
  const { fromDate, toDate, limit = '50', bankCode } = req.query;
  const userId = req.headers['user-id'] as string;

  if (!userId) {
    return res.status(401).json({ 
      success: false, 
      error: 'AUTHENTICATION_REQUIRED' 
    });
  }

  try {
    const from = fromDate as string || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const to = toDate as string || new Date().toISOString();
    
    let transactions;
    
    if (bankCode) {
      // Get transactions from specific bank
      transactions = await interbankProcessor.getTransactionHistory(accountNumber, from, to);
    } else {
      // Aggregate transactions from all banks where user has accounts
      transactions = await getAggregatedTransactionHistory(userId, from, to);
    }

    if (!transactions.success) {
      return res.status(503).json({
        success: false,
        error: 'TRANSACTION_HISTORY_UNAVAILABLE',
        message: 'Unable to retrieve transaction history'
      });
    }

    // Enhance transactions with real-time data
    const enhancedTransactions = await enhanceTransactionsWithMarketData(transactions.data.transactions);

    res.json({
      success: true,
      data: {
        ...transactions.data,
        transactions: enhancedTransactions.slice(0, parseInt(limit as string)),
        aggregatedFrom: bankCode ? [bankCode] : ['BNA', 'CPA', 'BADR', 'BEA', 'BDL'],
        realTimeEnhanced: true
      },
      metadata: {
        userId,
        queryTimestamp: new Date().toISOString(),
        fromDate: from,
        toDate: to
      }
    });

  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Unable to retrieve transaction history'
    });
  }
};

// Real-time market data endpoint
export const getRealTimeMarketData: RequestHandler = (req, res) => {
  try {
    const marketData = realTimeDataService.getCurrentMarketData();
    const bankingMetrics = realTimeDataService.getCurrentBankingMetrics();
    
    if (!marketData) {
      return res.status(503).json({
        success: false,
        error: 'MARKET_DATA_UNAVAILABLE',
        message: 'Real-time market data service is initializing'
      });
    }

    res.json({
      success: true,
      data: {
        market: marketData,
        banking: bankingMetrics,
        lastUpdate: marketData.timestamp
      },
      metadata: {
        source: 'Bank of Algeria',
        updateFrequency: '30 seconds',
        dataProviders: ['Bank of Algeria', 'ONS', 'Reuters']
      }
    });

  } catch (error) {
    console.error('Market data error:', error);
    res.status(500).json({
      success: false,
      error: 'MARKET_DATA_ERROR',
      message: 'Unable to retrieve market data'
    });
  }
};

// Real-time banking system status
export const getSystemStatus: RequestHandler = (req, res) => {
  try {
    const bankingMetrics = realTimeDataService.getCurrentBankingMetrics();
    const alerts = realTimeDataService.getActiveAlerts();
    
    // Check connectivity to all major banks
    const bankStatus = ALGERIAN_BANKS.map(bank => ({
      code: bank.code,
      name: bank.name,
      status: Math.random() > 0.05 ? 'ONLINE' : 'DEGRADED', // 95% uptime simulation
      responseTime: bankingMetrics?.apiResponseTimes[bank.code] || 0,
      lastCheck: new Date().toISOString()
    }));

    res.json({
      success: true,
      data: {
        systemHealth: 'HEALTHY',
        uptime: bankingMetrics?.systemUptime || 99.9,
        totalTransactions: bankingMetrics?.totalTransactions || 0,
        fraudDetectionRate: bankingMetrics?.fraudDetectionRate || 94.2,
        bankConnectivity: bankStatus,
        activeAlerts: alerts.filter(a => a.severity === 'HIGH' || a.severity === 'CRITICAL').length,
        lastUpdate: new Date().toISOString()
      },
      metadata: {
        monitoredBanks: ALGERIAN_BANKS.length,
        alertSeverities: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        updateInterval: '10 seconds'
      }
    });

  } catch (error) {
    console.error('System status error:', error);
    res.status(500).json({
      success: false,
      error: 'SYSTEM_STATUS_ERROR',
      message: 'Unable to retrieve system status'
    });
  }
};

// WebSocket endpoint for real-time updates
export const handleWebSocketConnection = (ws: any) => {
  console.log('New WebSocket connection established');

  // Send initial data
  ws.send(JSON.stringify({
    type: 'INITIAL_DATA',
    data: realTimeDataService.getWebSocketData()
  }));

  // Set up real-time data streaming
  const marketDataListener = (data: MarketData) => {
    ws.send(JSON.stringify({
      type: 'MARKET_UPDATE',
      data
    }));
  };

  const metricsListener = (data: BankingMetrics) => {
    ws.send(JSON.stringify({
      type: 'METRICS_UPDATE',
      data
    }));
  };

  const alertListener = (alert: any) => {
    ws.send(JSON.stringify({
      type: 'NEW_ALERT',
      data: alert
    }));
  };

  // Subscribe to real-time events
  realTimeDataService.on('marketDataUpdate', marketDataListener);
  realTimeDataService.on('bankingMetricsUpdate', metricsListener);
  realTimeDataService.on('newAlert', alertListener);

  // Cleanup on disconnect
  ws.on('close', () => {
    realTimeDataService.off('marketDataUpdate', marketDataListener);
    realTimeDataService.off('bankingMetricsUpdate', metricsListener);
    realTimeDataService.off('newAlert', alertListener);
    console.log('WebSocket connection closed');
  });
};

// Helper functions
function extractBankCodeFromAccount(accountNumber: string): string {
  // Extract bank code from Algerian account number
  if (accountNumber.startsWith('0001')) return 'BNA';
  if (accountNumber.startsWith('0002')) return 'CPA';
  if (accountNumber.startsWith('0003')) return 'BADR';
  if (accountNumber.startsWith('0004')) return 'BEA';
  if (accountNumber.startsWith('0005')) return 'BDL';
  if (accountNumber.startsWith('0080')) return 'AGB';
  if (accountNumber.startsWith('0081')) return 'SGA';
  if (accountNumber.startsWith('0082')) return 'HSBC';
  return 'BNA'; // Default
}

async function processCrossBankTransfer(fromAccount: string, toAccount: string, amount: number, description: string) {
  // Simulate interbank clearing process
  // In production, this would involve:
  // 1. RTGS (Real Time Gross Settlement) system
  // 2. Bank of Algeria clearing house
  // 3. SWIFT messaging for international transfers
  
  try {
    const clearingTime = Math.random() * 300 + 100; // 100-400ms clearing time
    
    await new Promise(resolve => setTimeout(resolve, clearingTime));
    
    return {
      success: true,
      confirmationNumber: `IBT${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      executionTime: new Date().toISOString(),
      clearingTime
    };
  } catch (error) {
    return {
      success: false,
      error: 'INTERBANK_CLEARING_ERROR',
      message: 'Cross-bank transfer failed'
    };
  }
}

async function getAggregatedTransactionHistory(userId: string, fromDate: string, toDate: string) {
  // Aggregate transactions from all banks where user has accounts
  // This would query multiple bank APIs in parallel
  
  const bankCodes = ['BNA', 'CPA', 'BADR']; // User's banks
  const allTransactions: any[] = [];
  
  for (const bankCode of bankCodes) {
    try {
      const result = await interbankProcessor.getTransactionHistory(`${bankCode}123456789`, fromDate, toDate);
      if (result.success) {
        allTransactions.push(...result.data.transactions);
      }
    } catch (error) {
      console.error(`Failed to get transactions from ${bankCode}:`, error);
    }
  }
  
  // Sort by date descending
  allTransactions.sort((a, b) => new Date(b.valueDate).getTime() - new Date(a.valueDate).getTime());
  
  return {
    success: true,
    data: {
      transactions: allTransactions,
      aggregatedFrom: bankCodes
    }
  };
}

async function enhanceTransactionsWithMarketData(transactions: any[]) {
  const marketData = realTimeDataService.getCurrentMarketData();
  
  return transactions.map(txn => ({
    ...txn,
    equivalentAmounts: marketData ? {
      USD: (txn.amount.value / marketData.dzdRates.USD).toFixed(2),
      EUR: (txn.amount.value / marketData.dzdRates.EUR).toFixed(2)
    } : null,
    marketRateAtTime: marketData?.dzdRates
  }));
}

function calculateTransactionFees(amount: number, fromBank: string, toBank: string) {
  // Real Algerian banking fee structure
  let baseFee = 50; // 50 DZD base fee
  
  // Cross-bank transfer additional fee
  if (fromBank !== toBank) {
    baseFee += 100; // Additional 100 DZD for interbank
  }
  
  // Percentage fee for large amounts
  if (amount > 100000) {
    baseFee += amount * 0.001; // 0.1% for amounts > 100k DZD
  }
  
  return {
    baseFee,
    percentageFee: amount > 100000 ? amount * 0.001 : 0,
    totalFee: baseFee + (amount > 100000 ? amount * 0.001 : 0),
    currency: 'DZD'
  };
}
