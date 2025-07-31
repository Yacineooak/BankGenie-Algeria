import { RequestHandler } from "express";

// Interfaces for API responses
interface Account {
  id: string;
  accountNumber: string;
  type: 'checking' | 'savings' | 'loan';
  balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'closed';
}

interface Transaction {
  id: string;
  accountId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: Date;
  balance: number;
  reference: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  response: string;
  intent: string;
  confidence: number;
  timestamp: Date;
  language: 'ar' | 'fr' | 'dz';
}

interface FraudAlert {
  id: string;
  userId: string;
  type: string;
  severity: string;
  description: string;
  timestamp: Date;
  status: string;
  riskScore: number;
}

// Mock data stores (in production, these would be database queries)
const mockAccounts: Account[] = [
  {
    id: 'acc_001',
    accountNumber: '1234567890123456',
    type: 'checking',
    balance: 250750.00,
    currency: 'DZD',
    status: 'active'
  },
  {
    id: 'acc_002', 
    accountNumber: '1234567890123457',
    type: 'savings',
    balance: 125000.00,
    currency: 'DZD',
    status: 'active'
  }
];

const mockTransactions: Transaction[] = [
  {
    id: 'txn_001',
    accountId: 'acc_001',
    type: 'debit',
    amount: -1500.00,
    description: 'ATM Withdrawal - Algiers Centre',
    timestamp: new Date('2024-01-15T10:30:00Z'),
    balance: 250750.00,
    reference: 'REF123456'
  },
  {
    id: 'txn_002',
    accountId: 'acc_001', 
    type: 'credit',
    amount: 45000.00,
    description: 'Salary Deposit - Company XYZ',
    timestamp: new Date('2024-01-14T08:00:00Z'),
    balance: 252250.00,
    reference: 'SAL789012'
  }
];

const mockChatMessages: ChatMessage[] = [];
const mockFraudAlerts: FraudAlert[] = [];

// Get user accounts
export const getUserAccounts: RequestHandler = (req, res) => {
  const userId = req.headers['user-id'] as string;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Filter accounts by user (in real app, this would be a database query)
  const userAccounts = mockAccounts.filter(account => 
    account.id.includes('001') || account.id.includes('002')
  );

  res.json({
    success: true,
    data: userAccounts
  });
};

// Get account balance
export const getAccountBalance: RequestHandler = (req, res) => {
  const { accountId } = req.params;
  const userId = req.headers['user-id'] as string;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const account = mockAccounts.find(acc => acc.id === accountId);
  
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  res.json({
    success: true,
    data: {
      accountNumber: account.accountNumber.slice(-4).padStart(16, '*'),
      balance: account.balance,
      currency: account.currency,
      lastUpdated: new Date().toISOString()
    }
  });
};

// Get transaction history
export const getTransactionHistory: RequestHandler = (req, res) => {
  const { accountId } = req.params;
  const { limit = '10', offset = '0' } = req.query;
  const userId = req.headers['user-id'] as string;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const account = mockAccounts.find(acc => acc.id === accountId);
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  const transactions = mockTransactions
    .filter(txn => txn.accountId === accountId)
    .slice(Number(offset), Number(offset) + Number(limit));

  res.json({
    success: true,
    data: transactions,
    pagination: {
      total: mockTransactions.length,
      limit: Number(limit),
      offset: Number(offset)
    }
  });
};

// Process chat message with NLP
export const processChatMessage: RequestHandler = async (req, res) => {
  const { message, language = 'ar' } = req.body;
  const userId = req.headers['user-id'] as string || 'anonymous';

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Simulate NLP processing
  const intents = [
    { pattern: /رصيد|balance|solde/, intent: 'balance_inquiry', confidence: 0.95 },
    { pattern: /قرض|loan|crédit/, intent: 'loan_inquiry', confidence: 0.90 },
    { pattern: /بطاقة|carte|card/, intent: 'card_services', confidence: 0.88 },
    { pattern: /فرع|agence|branch/, intent: 'branch_locator', confidence: 0.92 },
    { pattern: /تحويل|transfer|virement/, intent: 'money_transfer', confidence: 0.89 }
  ];

  let detectedIntent = 'general_inquiry';
  let confidence = 0.5;

  for (const { pattern, intent, confidence: conf } of intents) {
    if (pattern.test(message.toLowerCase())) {
      detectedIntent = intent;
      confidence = conf;
      break;
    }
  }

  // Generate response based on intent
  const responses = {
    balance_inquiry: {
      ar: 'رصيد حسابك الجاري هو 250,750.00 دج. آخر تحديث اليوم الساعة 14:30.',
      fr: 'Le solde de votre compte courant est de 250 750,00 DZD. Dernière mise à jour aujourd\'hui à 14h30.',
      dz: 'رصيد حسابك راهو 250,750.00 دج. آخر تحديث اليوم في 14:30.'
    },
    loan_inquiry: {
      ar: 'يمكنني مساعدتك في محاكاة قرض. الحد الأدنى 50,000 دج والحد الأقصى 2,000,000 دج.',
      fr: 'Je peux vous aider avec une simulation de prêt. Minimum 50 000 DZD, maximum 2 000 000 DZD.',
      dz: 'نقدر نعاونك في حساب القرض. من 50,000 دج لغاية 2,000,000 دج.'
    },
    general_inquiry: {
      ar: 'كيف يمكنني مساعدتك اليوم؟ يمكنني الإجابة على أسئلة حول الحسابات والقروض والخدمات.',
      fr: 'Comment puis-je vous aider aujourd\'hui? Je peux répondre aux questions sur les comptes, prêts et services.',
      dz: 'كيفاش نقدر نعاونك اليوم؟ نقدر نجاوبك على أسئلة الحسابات والقروض والخدمات.'
    }
  };

  const response = responses[detectedIntent as keyof typeof responses]?.[language as keyof typeof responses.general_inquiry] 
    || responses.general_inquiry[language as keyof typeof responses.general_inquiry];

  // Store chat message
  const chatMessage: ChatMessage = {
    id: `msg_${Date.now()}`,
    userId,
    message,
    response,
    intent: detectedIntent,
    confidence,
    timestamp: new Date(),
    language: language as 'ar' | 'fr' | 'dz'
  };

  mockChatMessages.push(chatMessage);

  res.json({
    success: true,
    data: {
      response,
      intent: detectedIntent,
      confidence,
      messageId: chatMessage.id
    }
  });
};

// Calculate loan eligibility and payments
export const calculateLoan: RequestHandler = (req, res) => {
  const { 
    amount, 
    termMonths, 
    loanType = 'personal',
    monthlyIncome = 80000,
    currentDebts = 15000,
    creditHistory = 'good'
  } = req.body;

  if (!amount || !termMonths) {
    return res.status(400).json({ error: 'Amount and term are required' });
  }

  // Credit scoring algorithm
  let creditScore = 600; // Base score

  // Income factor
  if (monthlyIncome >= 100000) creditScore += 100;
  else if (monthlyIncome >= 60000) creditScore += 70;
  else if (monthlyIncome >= 40000) creditScore += 40;

  // Debt-to-income ratio
  const dtiRatio = currentDebts / monthlyIncome;
  if (dtiRatio <= 0.2) creditScore += 80;
  else if (dtiRatio <= 0.35) creditScore += 50;
  else if (dtiRatio <= 0.5) creditScore += 20;

  // Credit history
  const historyBonus = { excellent: 50, good: 35, fair: 15, poor: -20, none: 0 };
  creditScore += historyBonus[creditHistory as keyof typeof historyBonus] || 0;

  // Interest rate based on loan type and credit score
  const baseRates = { personal: 8.5, home: 6.25, car: 7.5, business: 9.0 };
  let interestRate = baseRates[loanType as keyof typeof baseRates] || 8.5;

  // Adjust rate based on credit score
  if (creditScore >= 750) interestRate -= 1.0;
  else if (creditScore >= 700) interestRate -= 0.5;
  else if (creditScore >= 650) interestRate += 0;
  else if (creditScore >= 600) interestRate += 0.5;
  else interestRate += 2.0;

  // Calculate monthly payment using PMT formula
  const monthlyRate = interestRate / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, termMonths);
  const monthlyPayment = (amount * monthlyRate * factor) / (factor - 1);
  
  const totalPayment = monthlyPayment * termMonths;
  const totalInterest = totalPayment - amount;
  const eligibilityScore = Math.min(100, (creditScore - 300) / 5.5);

  res.json({
    success: true,
    data: {
      loanAmount: amount,
      termMonths,
      interestRate: Number(interestRate.toFixed(2)),
      monthlyPayment: Number(monthlyPayment.toFixed(2)),
      totalPayment: Number(totalPayment.toFixed(2)),
      totalInterest: Number(totalInterest.toFixed(2)),
      creditScore,
      eligibilityScore: Number(eligibilityScore.toFixed(1)),
      approved: eligibilityScore >= 60
    }
  });
};

// Submit KYC documentation
export const submitKYC: RequestHandler = (req, res) => {
  const { 
    personalInfo, 
    documents, 
    biometricData 
  } = req.body;
  const userId = req.headers['user-id'] as string;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Validate required fields
  if (!personalInfo?.fullName || !personalInfo?.dateOfBirth) {
    return res.status(400).json({ error: 'Personal information is incomplete' });
  }

  // Simulate KYC processing
  const kycApplication = {
    id: `kyc_${Date.now()}`,
    userId,
    personalInfo,
    documents,
    biometricData,
    status: 'under_review',
    submittedAt: new Date(),
    estimatedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
  };

  res.json({
    success: true,
    data: {
      applicationId: kycApplication.id,
      status: 'submitted',
      message: 'KYC application submitted successfully. You will receive updates via SMS and email.',
      estimatedCompletion: kycApplication.estimatedCompletion
    }
  });
};

// Get fraud alerts for admin dashboard
export const getFraudAlerts: RequestHandler = (req, res) => {
  const userRole = req.headers['user-role'] as string;

  if (userRole !== 'admin' && userRole !== 'employee') {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  // Generate some mock fraud alerts
  const alerts = [
    {
      id: 'fraud_001',
      userId: 'user_123',
      type: 'suspicious_login',
      severity: 'high',
      description: 'Multiple failed login attempts from new device',
      timestamp: new Date(),
      status: 'new',
      riskScore: 85
    },
    {
      id: 'fraud_002', 
      userId: 'user_456',
      type: 'unusual_transaction',
      severity: 'medium',
      description: 'Large transaction outside normal pattern',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'investigating',
      riskScore: 72
    }
  ];

  res.json({
    success: true,
    data: alerts
  });
};

// Get analytics data for admin dashboard
export const getAnalytics: RequestHandler = (req, res) => {
  const userRole = req.headers['user-role'] as string;
  const { timeRange = '24h' } = req.query;

  if (userRole !== 'admin' && userRole !== 'employee') {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  // Generate mock analytics
  const analytics = {
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
      { intent: 'branch_locator', count: 234, accuracy: 96.7 }
    ]
  };

  res.json({
    success: true,
    data: analytics,
    timeRange
  });
};
