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

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Banking API routes
  app.get("/api/accounts", getUserAccounts);
  app.get("/api/accounts/:accountId/balance", getAccountBalance);
  app.get("/api/accounts/:accountId/transactions", getTransactionHistory);
  app.post("/api/chat", processChatMessage);
  app.post("/api/loans/calculate", calculateLoan);
  app.post("/api/kyc/submit", submitKYC);
  app.get("/api/admin/fraud-alerts", getFraudAlerts);
  app.get("/api/admin/analytics", getAnalytics);

  return app;
}
