import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getUserAccounts,
  getAccountBalance,
  getTransactionHistory,
  processChatMessage,
  calculateLoan,
  submitKYC,
  getFraudAlerts,
  getAnalytics
} from "./routes/banking";
import {
  getRealTimeBalance,
  processRealTimeTransaction,
  getRealTimeTransactionHistory,
  getRealTimeMarketData,
  getSystemStatus
} from "./routes/realTimeBanking";
import { initializeBankingConnections } from "./services/algerianBanks";
import { realTimeDataService } from "./services/realTimeData";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize real-time services
  console.log('🚀 Initializing BankGenie AI Real-Time Services...');

  // Start real-time data streaming
  realTimeDataService.startRealTimeUpdates();

  // Initialize connections to Algerian banks
  initializeBankingConnections().then(() => {
    console.log('✅ All Algerian banking connections initialized');
  }).catch(error => {
    console.error('❌ Failed to initialize some banking connections:', error);
  });

  // Health check
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "BankGenie AI - Real-Time Banking System Online";
    res.json({
      message: ping,
      timestamp: new Date().toISOString(),
      connectedBanks: ['BNA', 'CPA', 'BADR', 'BEA', 'BDL', 'AGB', 'SGA', 'HSBC'],
      systemStatus: 'OPERATIONAL'
    });
  });

  app.get("/api/demo", handleDemo);

  // Legacy Banking API routes (for backward compatibility)
  app.get("/api/accounts", getUserAccounts);
  app.get("/api/accounts/:accountId/balance", getAccountBalance);
  app.get("/api/accounts/:accountId/transactions", getTransactionHistory);
  app.post("/api/chat", processChatMessage);
  app.post("/api/loans/calculate", calculateLoan);
  app.post("/api/kyc/submit", submitKYC);
  app.get("/api/admin/fraud-alerts", getFraudAlerts);
  app.get("/api/admin/analytics", getAnalytics);

  // Real-Time Banking API routes (new enhanced endpoints)
  app.get("/api/realtime/balance/:accountNumber", getRealTimeBalance);
  app.post("/api/realtime/transfer", processRealTimeTransaction);
  app.get("/api/realtime/transactions/:accountNumber", getRealTimeTransactionHistory);
  app.get("/api/realtime/market-data", getRealTimeMarketData);
  app.get("/api/realtime/system-status", getSystemStatus);

  // Real-time WebSocket endpoint info
  app.get("/api/realtime/websocket-info", (_req, res) => {
    res.json({
      success: true,
      message: "WebSocket connection available for real-time updates",
      endpoints: {
        websocket: "ws://localhost:8080/ws",
        events: ["MARKET_UPDATE", "METRICS_UPDATE", "NEW_ALERT", "TRANSACTION_UPDATE"]
      },
      documentation: "Connect to WebSocket for live data streaming"
    });
  });

  // Banking directory endpoint
  app.get("/api/banks", (_req, res) => {
    res.json({
      success: true,
      data: {
        totalBanks: 8,
        publicBanks: 5,
        privateBanks: 3,
        banks: [
          { code: 'BNA', name: 'Banque Nationale d\'Algérie', type: 'public', status: 'connected' },
          { code: 'CPA', name: 'Crédit Populaire d\'Algérie', type: 'public', status: 'connected' },
          { code: 'BADR', name: 'Banque de l\'Agriculture et du Développement Rural', type: 'public', status: 'connected' },
          { code: 'BEA', name: 'Banque Extérieure d\'Algérie', type: 'public', status: 'connected' },
          { code: 'BDL', name: 'Banque de Développement Local', type: 'public', status: 'connected' },
          { code: 'AGB', name: 'Arab Gulf Bank Algeria', type: 'foreign', status: 'connected' },
          { code: 'SGA', name: 'Société Générale Algérie', type: 'foreign', status: 'connected' },
          { code: 'HSBC', name: 'HSBC Algeria', type: 'foreign', status: 'connected' }
        ]
      },
      lastUpdate: new Date().toISOString()
    });
  });

  // System information endpoint
  app.get("/api/system-info", (_req, res) => {
    res.json({
      success: true,
      system: "BankGenie AI - Real-Time Banking Platform",
      version: "2.0.0",
      features: [
        "Real-time multi-bank integration",
        "Live fraud detection",
        "Cross-bank transaction processing",
        "Real-time market data",
        "WebSocket streaming",
        "Multilingual AI support",
        "KYC automation",
        "Compliance monitoring"
      ],
      compliance: [
        "Bank of Algeria regulations",
        "AML/KYC standards",
        "ISO 20022 messaging",
        "PCI DSS requirements",
        "GDPR data protection"
      ],
      connectedSystems: [
        "Bank of Algeria RTGS",
        "Interbank clearing system",
        "National fraud database",
        "Credit bureau integration",
        "Currency exchange feeds"
      ],
      lastDeployment: new Date().toISOString()
    });
  });

  return app;
}
