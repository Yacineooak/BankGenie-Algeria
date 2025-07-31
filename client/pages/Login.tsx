import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Lock, 
  User, 
  Building, 
  CreditCard,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Fingerprint
} from "lucide-react";
import { Link } from "react-router-dom";

interface LoginCredentials {
  identifier: string; // Can be username, email, or customer ID
  password: string;
  loginType: 'customer' | 'admin' | 'employee';
}

interface OTPState {
  isRequested: boolean;
  code: string;
  timeRemaining: number;
  method: 'sms' | 'email';
}

export default function Login() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    identifier: '',
    password: '',
    loginType: 'customer'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpState, setOtpState] = useState<OTPState>({
    isRequested: false,
    code: '',
    timeRemaining: 0,
    method: 'sms'
  });
  
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Demo users for different roles
  const demoUsers = {
    customer: {
      identifier: 'customer123',
      name: 'Ahmed Benali',
      role: 'customer',
      permissions: ['view_balance', 'transfer_money', 'loan_application', 'chat_support']
    },
    admin: {
      identifier: 'admin',
      name: 'Sarah Khaled',
      role: 'admin',
      permissions: ['manage_users', 'view_analytics', 'fraud_monitoring', 'system_config']
    },
    employee: {
      identifier: 'employee',
      name: 'Mohamed Larbi',
      role: 'employee',
      permissions: ['customer_support', 'view_customer_data', 'process_applications']
    }
  };

  // Check for biometric support
  useState(() => {
    if ('credentials' in navigator) {
      setBiometricSupported(true);
    }
  }, []);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!credentials.identifier) {
      newErrors.identifier = 'Please enter your username, email, or customer ID';
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check demo credentials
      const demoUser = demoUsers[credentials.loginType];
      if (credentials.identifier === demoUser.identifier && credentials.password === 'password123') {
        // Request OTP for additional security
        requestOTP();
      } else {
        setErrors({ general: 'Invalid credentials. Use demo credentials: admin/password123' });
      }
    } catch (error) {
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Request OTP
  const requestOTP = () => {
    setOtpState({
      isRequested: true,
      code: '',
      timeRemaining: 120,
      method: 'sms'
    });

    // Start countdown timer
    const timer = setInterval(() => {
      setOtpState(prev => {
        if (prev.timeRemaining <= 1) {
          clearInterval(timer);
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
  };

  // Verify OTP
  const verifyOTP = async () => {
    if (otpState.code === '123456') {
      setIsLoading(true);
      
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store session and redirect
      const user = demoUsers[credentials.loginType];
      localStorage.setItem('bankgenie_user', JSON.stringify(user));
      
      // Redirect based on role
      if (credentials.loginType === 'admin') {
        window.location.href = '/admin';
      } else if (credentials.loginType === 'customer') {
        window.location.href = '/chat';
      } else {
        window.location.href = '/dashboard';
      }
    } else {
      setErrors({ otp: 'Invalid OTP code. Demo code is 123456' });
    }
  };

  // Biometric login
  const handleBiometricLogin = async () => {
    if (!biometricSupported) return;

    try {
      setIsLoading(true);
      
      // Simulate biometric authentication
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Auto-login as customer for demo
      const user = demoUsers.customer;
      localStorage.setItem('bankgenie_user', JSON.stringify(user));
      window.location.href = '/chat';
    } catch (error) {
      setErrors({ general: 'Biometric authentication failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">BankGenie AI</h1>
          <p className="text-muted-foreground">نظام البنك الذكي • Système bancaire intelligent</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Secure Login</CardTitle>
            <CardDescription>
              Access your banking services securely
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!otpState.isRequested ? (
              // Main Login Form
              <form onSubmit={handleLogin} className="space-y-4">
                {/* User Type Selection */}
                <Tabs 
                  value={credentials.loginType} 
                  onValueChange={(value) => setCredentials(prev => ({ ...prev, loginType: value as any }))}
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="customer" className="text-xs">
                      <User className="h-3 w-3 mr-1" />
                      Customer
                    </TabsTrigger>
                    <TabsTrigger value="employee" className="text-xs">
                      <Building className="h-3 w-3 mr-1" />
                      Employee
                    </TabsTrigger>
                    <TabsTrigger value="admin" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Login Fields */}
                <div className="space-y-2">
                  <Label htmlFor="identifier">
                    {credentials.loginType === 'customer' ? 'Customer ID / Email' : 'Username'}
                  </Label>
                  <Input
                    id="identifier"
                    type="text"
                    value={credentials.identifier}
                    onChange={(e) => setCredentials(prev => ({ ...prev, identifier: e.target.value }))}
                    placeholder={credentials.loginType === 'customer' ? 'Enter customer ID or email' : 'Enter username'}
                    error={!!errors.identifier}
                  />
                  {errors.identifier && (
                    <p className="text-sm text-red-600">{errors.identifier}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={credentials.password}
                      onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter password"
                      error={!!errors.password}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Demo Credentials Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</h4>
                  <div className="text-xs text-blue-800 space-y-1">
                    <p><strong>Customer:</strong> customer123 / password123</p>
                    <p><strong>Employee:</strong> employee / password123</p>
                    <p><strong>Admin:</strong> admin / password123</p>
                  </div>
                </div>

                {errors.general && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{errors.general}</span>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>

                {/* Alternative Login Methods */}
                <div className="space-y-3 pt-4 border-t">
                  <p className="text-sm text-muted-foreground text-center">Or sign in with</p>
                  
                  {biometricSupported && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleBiometricLogin}
                      disabled={isLoading}
                    >
                      <Fingerprint className="h-4 w-4 mr-2" />
                      Biometric Login
                    </Button>
                  )}

                  <div className="text-center">
                    <Link to="/" className="text-sm text-primary hover:underline">
                      ← Back to Home
                    </Link>
                  </div>
                </div>
              </form>
            ) : (
              // OTP Verification
              <div className="space-y-4">
                <div className="text-center">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    We've sent a verification code to your registered {otpState.method === 'sms' ? 'phone number' : 'email'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otpState.code}
                    onChange={(e) => setOtpState(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    error={!!errors.otp}
                  />
                  {errors.otp && (
                    <p className="text-sm text-red-600">{errors.otp}</p>
                  )}
                </div>

                {/* Demo OTP Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <strong>Demo OTP:</strong> 123456
                  </p>
                </div>

                <Button 
                  onClick={verifyOTP}
                  className="w-full" 
                  disabled={otpState.code.length !== 6 || isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify & Continue
                    </>
                  )}
                </Button>

                <div className="text-center space-y-2">
                  {otpState.timeRemaining > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Resend code in {formatTime(otpState.timeRemaining)}
                    </p>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={requestOTP}>
                      Resend Code
                    </Button>
                  )}
                  
                  <div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setOtpState(prev => ({ ...prev, isRequested: false }))}
                    >
                      ← Back to Login
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground bg-background/80 px-4 py-2 rounded-lg">
            <Shield className="h-4 w-4" />
            <span>Protected by 256-bit SSL encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}
