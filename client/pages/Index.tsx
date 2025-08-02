import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Shield,
  BarChart3,
  CreditCard,
  Languages,
  Zap,
  CheckCircle,
  Star,
  ArrowRight,
  Users,
  Building,
  HeadphonesIcon,
  TrendingUp,
  Lock,
  Globe,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

export default function Index() {
  const [isVisible, setIsVisible] = useState(false);
  const { language, setLanguage, isChanging, t } = useLanguage();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: MessageSquare,
      title: "Digital Banking Assistant",
      description:
        "24/7 multilingual customer support in Arabic, French, and Darija",
      details: [
        "Account management",
        "Transaction processing",
        "Credit services",
        "Branch information",
      ],
    },
    {
      icon: Shield,
      title: "Advanced Security System",
      description: "Real-time fraud prevention and transaction monitoring",
      details: [
        "Behavioral analysis",
        "Transaction monitoring",
        "Risk assessment",
        "Identity verification",
      ],
    },
    {
      icon: BarChart3,
      title: "Management Dashboard",
      description:
        "Comprehensive analytics and reporting tools for banking operations",
      details: [
        "Real-time analytics",
        "Performance metrics",
        "User management",
        "Data export",
      ],
    },
    {
      icon: CreditCard,
      title: "Credit Services",
      description: "Automated loan processing and credit evaluation system",
      details: [
        "Loan applications",
        "Credit scoring",
        "Risk assessment",
        "Automated approval",
      ],
    },
  ];

  const stats = [
    { value: "99.9%", label: "System Reliability" },
    { value: "24/7", label: "Service Availability" },
    { value: "3", label: "Language Support" },
    { value: "Bank-Grade", label: "Security Standards" },
  ];

  const testimonials = [
    {
      quote:
        "BankGenie has significantly improved our customer service efficiency and reduced processing times.",
      author: "Ahmed Benali",
      role: "Operations Director, Banque Nationale d'Algérie",
      rating: 5,
    },
    {
      quote:
        "The multilingual support and security features have been essential for our digital transformation.",
      author: "Sarah Khaled",
      role: "IT Manager, Crédit Populaire d'Algérie",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                BankGenie
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('services')}
              </a>
              <a
                href="#security"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('security')}
              </a>
              <a
                href="#pricing"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('pricing')}
              </a>
              <div className="flex items-center space-x-2">
                <Languages className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${
                  isChanging ? 'rotate-180 scale-110' : ''
                }`} />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  disabled={isChanging}
                  className={`bg-background border border-border rounded-md px-2 py-1 text-sm transition-all duration-300 ${
                    isChanging ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'
                  }`}
                >
                  <option value="ar">🇩🇿 العربية</option>
                  <option value="fr">🇫🇷 Français</option>
                  <option value="dz">🇩🇿 الدارجة</option>
                </select>
              </div>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  {t('login')}
                </Button>
              </Link>
              <Link to="/chat">
                <Button size="sm">{t('get_started')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <Badge variant="secondary" className="mb-4 transition-all duration-300">
              {t('enterprise_banking')}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight transition-all duration-500">
              {t('modern_banking')}
              <span className="text-primary block mt-2">{t('made_simple')}</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed transition-all duration-500">
              {t('platform_description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/chat">
                <Button size="lg" className="h-12 px-8 transition-all duration-200">
                  {t('try_platform')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/loan-simulator">
                <Button variant="outline" size="lg" className="h-12 px-8">
                  Credit Calculator
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Complete Banking Solution
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything your financial institution needs to deliver exceptional
              customer service
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-border hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-base mt-2">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-accent" />
                        <span className="text-muted-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Target Users Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Designed for Every Banking Professional
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: "Retail Banking",
                desc: "Individual customer services",
              },
              {
                icon: Building,
                title: "Corporate Banking",
                desc: "Business & enterprise solutions",
              },
              {
                icon: HeadphonesIcon,
                title: "Support Teams",
                desc: "Customer service operations",
              },
              {
                icon: TrendingUp,
                title: "Management",
                desc: "Analytics & decision making",
              },
            ].map((user, index) => (
              <Card key={index} className="text-center border-border">
                <CardHeader>
                  <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <user.icon className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">{user.title}</CardTitle>
                  <CardDescription>{user.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Enterprise Security & Compliance
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Built with banking-grade security standards and full regulatory
                compliance for the Algerian financial sector.
              </p>
              <div className="space-y-4">
                {[
                  "End-to-end encryption with AES-256 standards",
                  "Multi-factor authentication and biometric support",
                  "GDPR-compliant data handling and storage",
                  "Bank of Algeria regulatory compliance",
                  "Role-based access control system",
                  "Complete audit trails and monitoring",
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Lock, title: "AES-256", desc: "Encryption" },
                  { icon: Shield, title: "ISO 27001", desc: "Certified" },
                  { icon: Globe, title: "GDPR", desc: "Compliant" },
                  { icon: Zap, title: "99.9%", desc: "Uptime SLA" },
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="h-12 w-12 bg-background rounded-lg flex items-center justify-center mx-auto mb-3">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-lg font-semibold text-foreground">
                      {item.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by Financial Institutions
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border">
                <CardHeader>
                  <div className="flex space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <CardDescription className="text-lg italic">
                    "{testimonial.quote}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.author}
                    </div>
                    <div className="text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Flexible Pricing Solutions
            </h2>
            <p className="text-xl text-muted-foreground">
              Scalable pricing that grows with your institution
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Essential",
                price: "From 1,500 DZD",
                period: "per user/month",
                features: [
                  "Basic platform access",
                  "Standard support",
                  "Core banking integration",
                  "Basic reporting",
                ],
              },
              {
                name: "Professional",
                price: "From 3,000 DZD",
                period: "per user/month",
                features: [
                  "Advanced features",
                  "Fraud detection",
                  "Multilingual support",
                  "Advanced analytics",
                  "Priority support",
                ],
                popular: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "pricing",
                features: [
                  "On-premise deployment",
                  "Custom integrations",
                  "Dedicated support",
                  "Training & onboarding",
                  "SLA guarantees",
                ],
              },
            ].map((plan, index) => (
              <Card
                key={index}
                className={`border-border relative ${plan.popular ? "ring-2 ring-primary" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Recommended
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      {plan.period}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-accent" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-6"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Modernize Your Banking Operations?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join financial institutions across Algeria that trust BankGenie for
            their digital transformation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/kyc">
              <Button size="lg" className="h-12 px-8">
                Start Implementation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="outline" size="lg" className="h-12 px-8">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">BankGenie</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Enterprise banking platform for the Algerian financial sector.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>+213 XX XXX XXXX</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>contact@bankgenie.dz</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Algiers, Algeria</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Services
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Security
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Integrations
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Partners
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    System Status
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>
              &copy; 2024 BankGenie. All rights reserved. Licensed banking
              technology provider.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
