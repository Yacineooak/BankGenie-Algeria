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

  const getStats = () => [
    { value: "99.9%", label: t("system_reliability") },
    { value: "24/7", label: t("service_availability") },
    { value: "4", label: t("language_support") },
    { value: "Bank-Grade", label: t("security_standards") },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Premium Navigation */}
      <nav className="glass-effect border-b border-white/20 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BankGenie
              </span>
              <Badge className="bg-green-500/20 text-green-700 border-green-300/30 text-xs">Pro</Badge>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("services")}
              </a>
              <a
                href="#security"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("security")}
              </a>
              <a
                href="#pricing"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("pricing")}
              </a>
              <div className="flex items-center space-x-2 bg-muted/30 rounded-lg px-3 py-2 hover:bg-muted/50 transition-all duration-300">
                <Languages
                  className={`h-4 w-4 text-muted-foreground transition-all duration-300 ${
                    isChanging
                      ? "rotate-180 scale-110 text-primary"
                      : "hover:text-primary"
                  }`}
                />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  disabled={isChanging}
                  className={`bg-transparent border-0 text-sm font-medium focus:outline-none transition-all duration-300 ${
                    isChanging
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:text-primary cursor-pointer"
                  }`}
                >
                  <option value="ar" className="bg-background text-foreground">
                    🇩🇿 العربية
                  </option>
                  <option value="fr" className="bg-background text-foreground">
                    🇫🇷 Français
                  </option>
                  <option value="dz" className="bg-background text-foreground">
                    🇩🇿 الدارجة
                  </option>
                  <option value="en" className="bg-background text-foreground">
                    🇺🇸 English
                  </option>
                </select>
                {isChanging && (
                  <div className="h-3 w-3 animate-spin border border-primary border-t-transparent rounded-full"></div>
                )}
              </div>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  {t("login")}
                </Button>
              </Link>
              <Link to="/chat">
                <Button size="sm">{t("get_started")}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Premium Hero Section */}
      <section className="relative py-32 px-4 gradient-bg-banking overflow-hidden">
        <div className="absolute inset-0 hero-gradient"></div>
        <div className="absolute inset-0 floating-elements"></div>

        {/* Floating Money Elements */}
        <div className="absolute top-20 left-10 text-6xl opacity-10 money-float">💰</div>
        <div className="absolute top-40 right-20 text-5xl opacity-10 money-float" style={{animationDelay: '2s'}}>💎</div>
        <div className="absolute bottom-40 left-1/4 text-4xl opacity-10 money-float" style={{animationDelay: '4s'}}>🏦</div>
        <div className="absolute top-60 right-1/3 text-5xl opacity-10 money-float" style={{animationDelay: '1s'}}>💳</div>
        <div className="absolute bottom-60 right-10 text-4xl opacity-10 money-float" style={{animationDelay: '3s'}}>📈</div>

        <div className="container mx-auto text-center relative z-10">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <Badge
              variant="secondary"
              className="mb-6 px-6 py-2 text-sm font-semibold glass-effect border-0 text-white transition-all duration-300 hover:scale-105"
            >
              ✨ {t("enterprise_banking")}
            </Badge>
            <h1 className="text-5xl md:text-8xl font-bold mb-8 leading-tight transition-all duration-500">
              <span className="text-white drop-shadow-lg">
                {t("modern_banking")}
              </span>
              <span className="gradient-text block mt-4 text-6xl md:text-9xl">
                {t("made_simple")}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-12 leading-relaxed transition-all duration-500 drop-shadow-sm">
              {t("platform_description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/chat">
                <Button
                  size="lg"
                  className="h-16 px-12 text-lg font-semibold premium-button border-0 text-white hover:text-white"
                >
                  <Zap className="mr-3 h-5 w-5" />
                  {t("try_platform")}
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>

              <Link to="/loan-simulator">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-16 px-12 text-lg font-semibold glass-effect border-white/20 text-white hover:text-white hover:bg-white/10 transition-all duration-300"
                >
                  <BarChart3 className="mr-3 h-5 w-5" />
                  {t("credit_calculator")}
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-white/70">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">Bank-Grade Security</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">ISO 27001 Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <span className="text-sm font-medium">4 Languages</span>
              </div>
            </div>
          </div>

          {/* Premium Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            {getStats().map((stat, index) => (
              <div
                key={index}
                className="card-3d glass-effect p-8 rounded-2xl text-center group hover:scale-105 transition-all duration-300"
                style={{animationDelay: `${index * 200}ms`}}
              >
                <div className="text-5xl md:text-6xl font-bold text-white stats-glow mb-4 group-hover:scale-110 transition-all duration-300">
                  {stat.value}
                </div>
                <div className={`text-white/80 text-sm font-medium ${
                  (language === 'ar' || language === 'dz') ? 'text-ar-enhanced' : ''
                }`}>{stat.label}</div>

                {/* Decorative Icons */}
                <div className="absolute top-4 right-4 text-2xl opacity-20">
                  {index === 0 && '⚡'}
                  {index === 1 && '🌍'}
                  {index === 2 && '🗣️'}
                  {index === 3 && '🛡️'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section id="features" className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <Badge className="mb-6 px-4 py-2 bg-blue-500/20 text-blue-300 border-blue-400/30">
              🏆 Enterprise Features
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 gradient-text">
              {t('complete_banking_solution')}
            </h2>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              {t('everything_description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="card-3d glass-effect border-white/10 bg-white/5 group hover:bg-white/10 transition-all duration-500"
                style={{animationDelay: `${index * 300}ms`}}
              >
                <CardHeader className="pb-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-white font-bold mb-2">{feature.title}</CardTitle>
                      <CardDescription className="text-lg text-white/80 leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center space-x-3 group/item">
                        <div className="h-6 w-6 bg-green-500/20 rounded-full flex items-center justify-center group-hover/item:bg-green-500/40 transition-all duration-200">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        </div>
                        <span className="text-white/70 group-hover/item:text-white transition-all duration-200">{detail}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Premium indicator */}
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-blue-300">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">Enterprise Ready</span>
                    </div>
                    <div className="text-white/50 text-sm">
                      {index === 0 && '🤖 AI Powered'}
                      {index === 1 && '🔒 Secure'}
                      {index === 2 && '📊 Analytics'}
                      {index === 3 && '💳 Payments'}
                    </div>
                  </div>
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
