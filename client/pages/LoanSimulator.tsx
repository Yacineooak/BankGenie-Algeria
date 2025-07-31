import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  FileText,
  Building,
  User,
  CreditCard,
  PieChart,
  Download
} from "lucide-react";

interface LoanDetails {
  amount: number;
  term: number; // months
  interestRate: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  eligibilityScore: number;
}

interface CreditProfile {
  monthlyIncome: number;
  currentDebts: number;
  employmentType: 'permanent' | 'temporary' | 'self_employed' | 'government';
  employmentDuration: number; // months
  age: number;
  hasCollateral: boolean;
  creditHistory: 'excellent' | 'good' | 'fair' | 'poor' | 'none';
  debtToIncomeRatio: number;
}

interface LoanProduct {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  type: 'personal' | 'home' | 'car' | 'business';
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  baseRate: number;
  requirements: string[];
  features: string[];
}

export default function LoanSimulator() {
  const [loanAmount, setLoanAmount] = useState<number>(500000);
  const [loanTerm, setLoanTerm] = useState<number>(60);
  const [selectedProduct, setSelectedProduct] = useState<string>('personal');
  const [creditProfile, setCreditProfile] = useState<CreditProfile>({
    monthlyIncome: 80000,
    currentDebts: 15000,
    employmentType: 'permanent',
    employmentDuration: 36,
    age: 35,
    hasCollateral: false,
    creditHistory: 'good',
    debtToIncomeRatio: 0
  });
  
  const [loanDetails, setLoanDetails] = useState<LoanDetails | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Algerian banking loan products
  const loanProducts: LoanProduct[] = [
    {
      id: 'personal',
      name: 'Personal Loan',
      nameAr: 'قرض شخصي',
      nameFr: 'Crédit personnel',
      type: 'personal',
      minAmount: 50000,
      maxAmount: 2000000,
      minTerm: 12,
      maxTerm: 84,
      baseRate: 8.5,
      requirements: ['Minimum 30,000 DZD monthly income', 'Permanent employment', 'Age 21-65'],
      features: ['No collateral required', 'Quick approval', 'Flexible repayment']
    },
    {
      id: 'home',
      name: 'Home Loan',
      nameAr: 'قرض سكني',
      nameFr: 'Crédit immobilier',
      type: 'home',
      minAmount: 1000000,
      maxAmount: 15000000,
      minTerm: 60,
      maxTerm: 300,
      baseRate: 6.25,
      requirements: ['Minimum 80,000 DZD monthly income', 'Down payment 20%', 'Property insurance'],
      features: ['Low interest rates', 'Long term repayment', 'Tax benefits']
    },
    {
      id: 'car',
      name: 'Auto Loan',
      nameAr: 'قرض سيارة',
      nameFr: 'Crédit automobile',
      type: 'car',
      minAmount: 200000,
      maxAmount: 5000000,
      minTerm: 12,
      maxTerm: 84,
      baseRate: 7.5,
      requirements: ['Minimum 40,000 DZD monthly income', 'Valid driving license', 'Car insurance'],
      features: ['Competitive rates', 'New and used cars', 'Insurance options']
    },
    {
      id: 'business',
      name: 'Business Loan',
      nameAr: 'قرض تجاري',
      nameFr: 'Crédit professionnel',
      type: 'business',
      minAmount: 500000,
      maxAmount: 50000000,
      minTerm: 12,
      maxTerm: 120,
      baseRate: 9.0,
      requirements: ['Business license', 'Financial statements', 'Business plan'],
      features: ['Flexible terms', 'Growth financing', 'Expert advice']
    }
  ];

  // Credit scoring algorithm based on Algerian banking standards
  const calculateCreditScore = (profile: CreditProfile): number => {
    let score = 600; // Base score

    // Income factor (35% weight)
    if (profile.monthlyIncome >= 100000) score += 100;
    else if (profile.monthlyIncome >= 60000) score += 70;
    else if (profile.monthlyIncome >= 40000) score += 40;
    else score += 10;

    // Debt-to-income ratio (25% weight)
    const dtiRatio = profile.currentDebts / profile.monthlyIncome;
    if (dtiRatio <= 0.2) score += 80;
    else if (dtiRatio <= 0.35) score += 50;
    else if (dtiRatio <= 0.5) score += 20;
    else score -= 30;

    // Employment stability (20% weight)
    if (profile.employmentType === 'government') score += 60;
    else if (profile.employmentType === 'permanent') score += 40;
    else if (profile.employmentType === 'temporary') score += 20;
    else score += 10;

    if (profile.employmentDuration >= 24) score += 40;
    else if (profile.employmentDuration >= 12) score += 20;

    // Credit history (15% weight)
    switch (profile.creditHistory) {
      case 'excellent': score += 50; break;
      case 'good': score += 35; break;
      case 'fair': score += 15; break;
      case 'poor': score -= 20; break;
      case 'none': score += 0; break;
    }

    // Age factor (5% weight)
    if (profile.age >= 30 && profile.age <= 50) score += 20;
    else if (profile.age >= 25 && profile.age <= 60) score += 10;

    // Collateral bonus
    if (profile.hasCollateral) score += 30;

    return Math.max(300, Math.min(850, score));
  };

  // Interest rate calculation based on credit score and loan type
  const calculateInterestRate = (baseRate: number, creditScore: number): number => {
    let rateAdjustment = 0;

    if (creditScore >= 750) rateAdjustment = -1.0;
    else if (creditScore >= 700) rateAdjustment = -0.5;
    else if (creditScore >= 650) rateAdjustment = 0;
    else if (creditScore >= 600) rateAdjustment = 0.5;
    else if (creditScore >= 550) rateAdjustment = 1.0;
    else rateAdjustment = 2.0;

    return Math.max(4.0, baseRate + rateAdjustment);
  };

  // PMT calculation for loan payments
  const calculateMonthlyPayment = (principal: number, annualRate: number, termMonths: number): number => {
    const monthlyRate = annualRate / 100 / 12;
    const factor = Math.pow(1 + monthlyRate, termMonths);
    return (principal * monthlyRate * factor) / (factor - 1);
  };

  // Main loan calculation function
  const calculateLoan = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const product = loanProducts.find(p => p.id === selectedProduct);
      if (!product) return;

      // Update debt-to-income ratio
      const updatedProfile = {
        ...creditProfile,
        debtToIncomeRatio: creditProfile.currentDebts / creditProfile.monthlyIncome
      };

      const creditScore = calculateCreditScore(updatedProfile);
      const interestRate = calculateInterestRate(product.baseRate, creditScore);
      const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTerm);
      const totalPayment = monthlyPayment * loanTerm;
      const totalInterest = totalPayment - loanAmount;

      const eligibilityScore = Math.min(100, (creditScore - 300) / 5.5);

      setLoanDetails({
        amount: loanAmount,
        term: loanTerm,
        interestRate,
        monthlyPayment,
        totalPayment,
        totalInterest,
        eligibilityScore
      });

      setIsCalculating(false);
    }, 1500);
  };

  // Format currency for display
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get eligibility status
  const getEligibilityStatus = (score: number) => {
    if (score >= 80) return { status: 'Excellent', color: 'text-green-600 bg-green-100', icon: CheckCircle };
    if (score >= 60) return { status: 'Good', color: 'text-blue-600 bg-blue-100', icon: CheckCircle };
    if (score >= 40) return { status: 'Fair', color: 'text-yellow-600 bg-yellow-100', icon: AlertCircle };
    return { status: 'Poor', color: 'text-red-600 bg-red-100', icon: AlertCircle };
  };

  // Auto-calculate when inputs change
  useEffect(() => {
    if (loanAmount && loanTerm) {
      const timer = setTimeout(calculateLoan, 500);
      return () => clearTimeout(timer);
    }
  }, [loanAmount, loanTerm, selectedProduct, creditProfile]);

  const currentProduct = loanProducts.find(p => p.id === selectedProduct);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Loan Simulator</h1>
          <p className="text-muted-foreground">محاكي القروض • Simulateur de crédit</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loan Product Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Loan Product</CardTitle>
                <CardDescription>Choose the type of loan that suits your needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loanProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedProduct === product.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-muted-foreground'
                      }`}
                      onClick={() => setSelectedProduct(product.id)}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          {product.type === 'personal' && <User className="h-4 w-4 text-primary" />}
                          {product.type === 'home' && <Building className="h-4 w-4 text-primary" />}
                          {product.type === 'car' && <CreditCard className="h-4 w-4 text-primary" />}
                          {product.type === 'business' && <TrendingUp className="h-4 w-4 text-primary" />}
                        </div>
                        <div>
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.nameAr}</p>
                        </div>
                      </div>
                      <div className="text-sm space-y-1">
                        <p>Amount: {formatCurrency(product.minAmount)} - {formatCurrency(product.maxAmount)}</p>
                        <p>Term: {product.minTerm} - {product.maxTerm} months</p>
                        <p>Rate: From {product.baseRate}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Loan Parameters */}
            <Card>
              <CardHeader>
                <CardTitle>Loan Parameters</CardTitle>
                <CardDescription>Enter your desired loan amount and term</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Loan Amount (DZD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    min={currentProduct?.minAmount}
                    max={currentProduct?.maxAmount}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Min: {formatCurrency(currentProduct?.minAmount || 0)}</span>
                    <span>Max: {formatCurrency(currentProduct?.maxAmount || 0)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="term">Loan Term (Months)</Label>
                  <Input
                    id="term"
                    type="number"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                    min={currentProduct?.minTerm}
                    max={currentProduct?.maxTerm}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Min: {currentProduct?.minTerm} months</span>
                    <span>Max: {currentProduct?.maxTerm} months</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Credit Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Your Financial Profile</CardTitle>
                <CardDescription>Help us assess your eligibility</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="income" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="income">Income</TabsTrigger>
                    <TabsTrigger value="employment">Employment</TabsTrigger>
                    <TabsTrigger value="credit">Credit History</TabsTrigger>
                  </TabsList>

                  <TabsContent value="income" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="income">Monthly Income (DZD)</Label>
                        <Input
                          id="income"
                          type="number"
                          value={creditProfile.monthlyIncome}
                          onChange={(e) => setCreditProfile(prev => ({
                            ...prev,
                            monthlyIncome: Number(e.target.value)
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="debts">Current Monthly Debts (DZD)</Label>
                        <Input
                          id="debts"
                          type="number"
                          value={creditProfile.currentDebts}
                          onChange={(e) => setCreditProfile(prev => ({
                            ...prev,
                            currentDebts: Number(e.target.value)
                          }))}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="employment" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="employment">Employment Type</Label>
                        <select
                          id="employment"
                          value={creditProfile.employmentType}
                          onChange={(e) => setCreditProfile(prev => ({
                            ...prev,
                            employmentType: e.target.value as any
                          }))}
                          className="w-full p-2 border border-border rounded-md bg-background"
                        >
                          <option value="permanent">Permanent Employee</option>
                          <option value="government">Government Employee</option>
                          <option value="temporary">Temporary Contract</option>
                          <option value="self_employed">Self-Employed</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Employment Duration (Months)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={creditProfile.employmentDuration}
                          onChange={(e) => setCreditProfile(prev => ({
                            ...prev,
                            employmentDuration: Number(e.target.value)
                          }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={creditProfile.age}
                        onChange={(e) => setCreditProfile(prev => ({
                          ...prev,
                          age: Number(e.target.value)
                        }))}
                        min={18}
                        max={70}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="credit" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="history">Credit History</Label>
                      <select
                        id="history"
                        value={creditProfile.creditHistory}
                        onChange={(e) => setCreditProfile(prev => ({
                          ...prev,
                          creditHistory: e.target.value as any
                        }))}
                        className="w-full p-2 border border-border rounded-md bg-background"
                      >
                        <option value="excellent">Excellent (Never missed payments)</option>
                        <option value="good">Good (Rarely missed payments)</option>
                        <option value="fair">Fair (Some missed payments)</option>
                        <option value="poor">Poor (Frequent missed payments)</option>
                        <option value="none">No Credit History</option>
                      </select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="collateral"
                        checked={creditProfile.hasCollateral}
                        onChange={(e) => setCreditProfile(prev => ({
                          ...prev,
                          hasCollateral: e.target.checked
                        }))}
                        className="rounded border-border"
                      />
                      <Label htmlFor="collateral">I have collateral to secure the loan</Label>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Calculation Results */}
            {loanDetails && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5" />
                    <span>Loan Calculation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isCalculating ? (
                    <div className="text-center py-8">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Calculating...</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Loan Amount:</span>
                          <span className="font-medium">{formatCurrency(loanDetails.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Interest Rate:</span>
                          <span className="font-medium">{loanDetails.interestRate.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Term:</span>
                          <span className="font-medium">{loanDetails.term} months</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg">
                          <span className="font-medium">Monthly Payment:</span>
                          <span className="font-bold text-primary">{formatCurrency(loanDetails.monthlyPayment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Payment:</span>
                          <span className="font-medium">{formatCurrency(loanDetails.totalPayment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Interest:</span>
                          <span className="font-medium">{formatCurrency(loanDetails.totalInterest)}</span>
                        </div>
                      </div>

                      {/* Eligibility Score */}
                      <div className="space-y-3 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Eligibility Score</span>
                          <Badge className={getEligibilityStatus(loanDetails.eligibilityScore).color}>
                            {getEligibilityStatus(loanDetails.eligibilityScore).status}
                          </Badge>
                        </div>
                        <Progress value={loanDetails.eligibilityScore} className="h-2" />
                        <p className="text-sm text-muted-foreground">
                          {Math.round(loanDetails.eligibilityScore)}% likelihood of approval
                        </p>
                      </div>

                      <Button className="w-full mt-6">
                        <FileText className="h-4 w-4 mr-2" />
                        Apply for Loan
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Loan Product Details */}
            {currentProduct && (
              <Card>
                <CardHeader>
                  <CardTitle>{currentProduct.name}</CardTitle>
                  <CardDescription>{currentProduct.nameAr} • {currentProduct.nameFr}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Requirements:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {currentProduct.requirements.map((req, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Features:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {currentProduct.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-blue-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
