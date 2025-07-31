import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Camera, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  User, 
  CreditCard,
  MapPin,
  Smartphone,
  Eye,
  RefreshCw,
  Download,
  X,
  ArrowRight,
  ArrowLeft,
  Shield
} from "lucide-react";

interface KYCStep {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  completed: boolean;
  required: boolean;
}

interface DocumentData {
  type: 'national_id' | 'passport' | 'residence_permit' | 'utility_bill' | 'bank_statement';
  file: File | null;
  extractedData: any;
  verificationStatus: 'pending' | 'processing' | 'verified' | 'rejected';
  confidence: number;
}

interface BiometricData {
  facePhoto: File | null;
  livenessCheck: boolean;
  verificationStatus: 'pending' | 'processing' | 'verified' | 'rejected';
}

export default function KYC() {
  const [currentStep, setCurrentStep] = useState(0);
  const [documents, setDocuments] = useState<Record<string, DocumentData>>({});
  const [biometric, setBiometric] = useState<BiometricData>({
    facePhoto: null,
    livenessCheck: false,
    verificationStatus: 'pending'
  });
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: 'Algerian',
    phoneNumber: '',
    email: '',
    address: '',
    occupation: '',
    monthlyIncome: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const kycSteps: KYCStep[] = [
    {
      id: 'personal_info',
      title: 'Personal Information',
      titleAr: 'المعلومات الشخصية',
      description: 'Enter your basic personal details',
      completed: false,
      required: true
    },
    {
      id: 'document_upload',
      title: 'Document Verification',
      titleAr: 'التحقق من الوثائق',
      description: 'Upload government-issued identification',
      completed: false,
      required: true
    },
    {
      id: 'address_verification',
      title: 'Address Verification',
      titleAr: 'التحقق من العنوان',
      description: 'Provide proof of residence',
      completed: false,
      required: true
    },
    {
      id: 'biometric_verification',
      title: 'Biometric Verification',
      titleAr: 'التحقق البيومتري',
      description: 'Facial recognition and liveness check',
      completed: false,
      required: true
    },
    {
      id: 'final_review',
      title: 'Final Review',
      titleAr: 'المراجعة النهائية',
      description: 'Review and submit your application',
      completed: false,
      required: true
    }
  ];

  const documentTypes = {
    national_id: { name: 'National ID Card', nameAr: 'بطاقة الهوية الوطنية', icon: CreditCard },
    passport: { name: 'Passport', nameAr: 'جواز السفر', icon: FileText },
    residence_permit: { name: 'Residence Permit', nameAr: 'تصريح الإقامة', icon: FileText },
    utility_bill: { name: 'Utility Bill', nameAr: 'فاتورة مرافق', icon: FileText },
    bank_statement: { name: 'Bank Statement', nameAr: 'كشف حساب', icon: FileText }
  };

  // OCR and document processing simulation
  const processDocument = async (file: File, type: string): Promise<any> => {
    setIsProcessing(true);
    
    // Simulate OCR processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockExtractedData = {
      national_id: {
        fullName: 'Ahmed Ben Ali',
        dateOfBirth: '1985-03-15',
        idNumber: '123456789012345',
        placeOfBirth: 'Algiers',
        nationality: 'Algerian',
        expiryDate: '2030-03-15'
      },
      passport: {
        fullName: 'Ahmed Ben Ali',
        passportNumber: 'A1234567',
        nationality: 'Algerian',
        dateOfBirth: '1985-03-15',
        expiryDate: '2029-03-15'
      },
      utility_bill: {
        fullName: 'Ahmed Ben Ali',
        address: '123 Rue des Martyrs, Algiers 16000',
        billDate: '2024-01-15',
        provider: 'Sonelgaz'
      }
    };

    const extractedData = mockExtractedData[type as keyof typeof mockExtractedData] || {};
    const confidence = Math.random() * 20 + 80; // 80-100% confidence

    setIsProcessing(false);
    return { extractedData, confidence };
  };

  // Handle file upload
  const handleFileUpload = async (file: File, documentType: string) => {
    const result = await processDocument(file, documentType);
    
    setDocuments(prev => ({
      ...prev,
      [documentType]: {
        type: documentType as any,
        file,
        extractedData: result.extractedData,
        verificationStatus: result.confidence > 90 ? 'verified' : 'processing',
        confidence: result.confidence
      }
    }));

    // Auto-fill personal info if it's from ID document
    if (documentType === 'national_id' || documentType === 'passport') {
      setPersonalInfo(prev => ({
        ...prev,
        fullName: result.extractedData.fullName || prev.fullName,
        dateOfBirth: result.extractedData.dateOfBirth || prev.dateOfBirth,
        nationality: result.extractedData.nationality || prev.nationality
      }));
    }
  };

  // Handle camera capture
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      alert('Camera access denied or unavailable');
    }
  };

  const capturePhoto = () => {
    if (cameraRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = cameraRef.current.videoWidth;
        canvas.height = cameraRef.current.videoHeight;
        context.drawImage(cameraRef.current, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'biometric_photo.jpg', { type: 'image/jpeg' });
            setBiometric(prev => ({ ...prev, facePhoto: file }));
            setIsCameraActive(false);
            
            // Stop camera stream
            const stream = cameraRef.current?.srcObject as MediaStream;
            stream?.getTracks().forEach(track => track.stop());
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  // Validate current step
  const validateStep = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Personal Info
        return personalInfo.fullName && personalInfo.dateOfBirth && personalInfo.phoneNumber && personalInfo.email;
      case 1: // Document Upload
        return documents.national_id?.verificationStatus === 'verified' || documents.passport?.verificationStatus === 'verified';
      case 2: // Address Verification
        return documents.utility_bill?.verificationStatus === 'verified';
      case 3: // Biometric
        return biometric.facePhoto !== null && biometric.livenessCheck;
      default:
        return true;
    }
  };

  // Navigate steps
  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < kycSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / kycSteps.length) * 100;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">KYC Verification</h1>
          <p className="text-muted-foreground">التحقق من هوية العميل • Vérification d'identité client</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-3 mb-4" />
            
            {/* Step Indicators */}
            <div className="flex justify-between">
              {kycSteps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < currentStep ? 'bg-green-500 text-white' :
                    index === currentStep ? 'bg-primary text-primary-foreground' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {index < currentStep ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  <div className="mt-2 max-w-20">
                    <p className="text-xs font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.titleAr}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{kycSteps[currentStep].title}</CardTitle>
            <CardDescription>{kycSteps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 0: Personal Information */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={personalInfo.fullName}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={personalInfo.dateOfBirth}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={personalInfo.phoneNumber}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="+213 XXX XXX XXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={personalInfo.occupation}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, occupation: e.target.value }))}
                      placeholder="Your profession"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyIncome">Monthly Income (DZD)</Label>
                    <Input
                      id="monthlyIncome"
                      type="number"
                      value={personalInfo.monthlyIncome}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, monthlyIncome: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Input
                    id="address"
                    value={personalInfo.address}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Street, City, Postal Code"
                  />
                </div>
              </div>
            )}

            {/* Step 1: Document Upload */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Please upload a clear photo of your government-issued ID
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['national_id', 'passport'].map((docType) => {
                    const doc = documents[docType];
                    const docInfo = documentTypes[docType as keyof typeof documentTypes];
                    
                    return (
                      <Card key={docType} className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                        <CardContent className="p-6 text-center">
                          <docInfo.icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="font-medium mb-2">{docInfo.name}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{docInfo.nameAr}</p>
                          
                          {!doc ? (
                            <div className="space-y-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(file, docType);
                                }}
                                className="hidden"
                                id={`file-${docType}`}
                              />
                              <Button 
                                variant="outline" 
                                onClick={() => document.getElementById(`file-${docType}`)?.click()}
                                className="w-full"
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                              </Button>
                              <Button variant="ghost" size="sm" className="w-full">
                                <Camera className="h-4 w-4 mr-2" />
                                Take Photo
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Badge 
                                variant={doc.verificationStatus === 'verified' ? 'default' : 'secondary'}
                                className="mb-2"
                              >
                                {doc.verificationStatus === 'verified' ? 'Verified' : 'Processing'} 
                                ({Math.round(doc.confidence)}%)
                              </Badge>
                              <div className="text-sm space-y-1">
                                {doc.extractedData?.fullName && (
                                  <p><strong>Name:</strong> {doc.extractedData.fullName}</p>
                                )}
                                {doc.extractedData?.idNumber && (
                                  <p><strong>ID:</strong> {doc.extractedData.idNumber}</p>
                                )}
                                {doc.extractedData?.dateOfBirth && (
                                  <p><strong>DOB:</strong> {doc.extractedData.dateOfBirth}</p>
                                )}
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setDocuments(prev => {
                                  const newDocs = { ...prev };
                                  delete newDocs[docType];
                                  return newDocs;
                                })}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {isProcessing && (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Processing document with OCR...</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Address Verification */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Address Verification</h3>
                  <p className="text-muted-foreground">
                    Upload a recent utility bill or bank statement to verify your address
                  </p>
                </div>

                <Card className="border-2 border-dashed border-border">
                  <CardContent className="p-8 text-center">
                    {!documents.utility_bill ? (
                      <div className="space-y-4">
                        <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
                        <div>
                          <h4 className="font-medium mb-2">Upload Proof of Address</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Accepted documents: Utility bill, bank statement, rental agreement (less than 3 months old)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'utility_bill');
                          }}
                          className="hidden"
                          id="address-doc"
                        />
                        <Button 
                          onClick={() => document.getElementById('address-doc')?.click()}
                          size="lg"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Select Document
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                        <div>
                          <h4 className="font-medium mb-2">Address Verified</h4>
                          <div className="text-sm space-y-1">
                            <p><strong>Name:</strong> {documents.utility_bill.extractedData?.fullName}</p>
                            <p><strong>Address:</strong> {documents.utility_bill.extractedData?.address}</p>
                            <p><strong>Document Date:</strong> {documents.utility_bill.extractedData?.billDate}</p>
                          </div>
                        </div>
                        <Badge variant="default">
                          Verified ({Math.round(documents.utility_bill.confidence)}%)
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Biometric Verification */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <User className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Biometric Verification</h3>
                  <p className="text-muted-foreground">
                    Take a selfie to verify your identity and complete the liveness check
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Camera/Photo Capture */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Face Verification</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!biometric.facePhoto ? (
                        <div className="space-y-4">
                          {isCameraActive ? (
                            <div className="space-y-4">
                              <video 
                                ref={cameraRef}
                                autoPlay 
                                playsInline
                                className="w-full rounded-lg"
                              />
                              <div className="flex space-x-2">
                                <Button onClick={capturePhoto} className="flex-1">
                                  <Camera className="h-4 w-4 mr-2" />
                                  Capture
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setIsCameraActive(false)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center space-y-4">
                              <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                                <Camera className="h-16 w-16 text-muted-foreground" />
                              </div>
                              <Button onClick={startCamera} className="w-full">
                                <Camera className="h-4 w-4 mr-2" />
                                Start Camera
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="text-center">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Photo captured successfully</p>
                          </div>
                          <Button 
                            variant="outline" 
                            onClick={() => setBiometric(prev => ({ ...prev, facePhoto: null }))}
                            className="w-full"
                          >
                            Retake Photo
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Liveness Check */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Liveness Check</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center">
                          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground mb-4">
                            Follow the instructions to prove you're a real person
                          </p>
                        </div>
                        
                        {!biometric.livenessCheck ? (
                          <Button 
                            onClick={() => {
                              // Simulate liveness check
                              setTimeout(() => {
                                setBiometric(prev => ({ ...prev, livenessCheck: true }));
                              }, 2000);
                            }}
                            className="w-full"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Start Liveness Check
                          </Button>
                        ) : (
                          <div className="text-center">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                            <p className="text-sm text-green-600 font-medium">Liveness verified</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 4: Final Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Review Your Information</h3>
                  <p className="text-muted-foreground">
                    Please review all information before submitting your KYC application
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span>{personalInfo.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date of Birth:</span>
                        <span>{personalInfo.dateOfBirth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span>{personalInfo.phoneNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{personalInfo.email}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Verification Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Verification Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Identity Document</span>
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Address Proof</span>
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Biometric Check</span>
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    By submitting this application, you agree to our Terms of Service and Privacy Policy
                  </p>
                  <Button size="lg" className="px-8">
                    <FileText className="h-4 w-4 mr-2" />
                    Submit KYC Application
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation */}
            <Separator />
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="text-sm text-muted-foreground self-center">
                Step {currentStep + 1} of {kycSteps.length}
              </div>
              
              <Button 
                onClick={nextStep}
                disabled={!validateStep(currentStep) || currentStep === kycSteps.length - 1}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
