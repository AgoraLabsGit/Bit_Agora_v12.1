import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Zap, 
  Bitcoin, 
  Moon, 
  CreditCard, 
  BarChart, 
  Users, 
  Package, 
  Check,
  Twitter,
  Github,
  Linkedin
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            <span className="text-xl sm:text-2xl font-light tracking-tight">
              <span className="text-foreground">Bit</span>
              <span className="font-semibold text-foreground">Agora</span>
            </span>
          </div>
          
          <nav className="hidden lg:flex gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/help" className="text-sm font-medium hover:text-primary transition-colors">
              Help
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors touch-manipulation">
              Sign In
            </Link>
            <Button asChild className="h-10 sm:h-12 touch-manipulation">
              <Link href="/register">
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-background/50">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6">
            Modern POS System for the
            <span className="text-primary"> Digital Age</span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto">
            Accept Bitcoin, Lightning, and traditional payments with our sleek, 
            dark-themed point-of-sale system built for modern businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button size="lg" className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold touch-manipulation" asChild>
              <Link href="/register">Start Free Trial</Link>
            </Button>
            <Button variant="ghost" size="lg" className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg touch-manipulation" asChild>
              <Link href="#features" className="text-primary hover:underline">
                View Features
              </Link>
            </Button>
          </div>
          
          <div className="mt-8 sm:mt-12 relative">
            <div className="rounded-lg sm:rounded-xl shadow-2xl border border-border bg-card p-6 sm:p-8">
              <div className="text-center text-muted-foreground">
                <p className="text-sm sm:text-base">Screenshots coming soon...</p>
                <p className="text-xs sm:text-sm mt-2">Real POS interface preview</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Everything You Need to Run Your Business
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              From cryptocurrency payments to employee management, 
              BitAgora POS provides all the tools you need in one sleek package.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-card rounded-lg sm:rounded-xl p-6 border border-border hover:shadow-lg transition-shadow touch-manipulation">
              <Bitcoin className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Crypto Payments</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Accept Bitcoin, Lightning Network, and USDT payments seamlessly 
                with real-time conversion rates.
              </p>
            </div>

            <div className="bg-card rounded-lg sm:rounded-xl p-6 border border-border hover:shadow-lg transition-shadow touch-manipulation">
              <Moon className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Dark UI</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Professional dark theme designed for long hours of use without eye strain.
              </p>
            </div>

            <div className="bg-card rounded-lg sm:rounded-xl p-6 border border-border hover:shadow-lg transition-shadow touch-manipulation">
              <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Multi-Payment</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Cash, credit cards, and multiple cryptocurrency options all in one system.
              </p>
            </div>

            <div className="bg-card rounded-lg sm:rounded-xl p-6 border border-border hover:shadow-lg transition-shadow touch-manipulation">
              <BarChart className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Real-time Analytics</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Track sales, inventory, and performance with beautiful charts and insights.
              </p>
            </div>

            <div className="bg-card rounded-lg sm:rounded-xl p-6 border border-border hover:shadow-lg transition-shadow touch-manipulation">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Employee Management</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage staff with PIN-based access, time tracking, and role-based permissions.
              </p>
            </div>

            <div className="bg-card rounded-lg sm:rounded-xl p-6 border border-border hover:shadow-lg transition-shadow touch-manipulation">
              <Package className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Inventory Tracking</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Monitor stock levels, set alerts, and manage suppliers all from one dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-12 sm:mb-16">
            Choose the plan that works for your business. No hidden fees, no surprises.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-card rounded-lg sm:rounded-xl p-6 sm:p-8 border border-border relative touch-manipulation">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Free</h3>
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">$0</div>
              <p className="text-sm text-muted-foreground mb-6">per month</p>
              
              <div className="space-y-3 mb-6 sm:mb-8">
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Up to 100 transactions/month</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">1 User account</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Basic reporting</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Email support</span>
                </div>
              </div>
              
              <Button className="w-full py-3 h-12 text-base touch-manipulation" variant="outline" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>

            {/* Basic Plan */}
            <div className="bg-card rounded-lg sm:rounded-xl p-6 sm:p-8 border border-border relative touch-manipulation">
              <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                Popular
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Basic</h3>
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">$29</div>
              <p className="text-sm text-muted-foreground mb-6">per month</p>
              
              <div className="space-y-3 mb-6 sm:mb-8">
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Unlimited transactions</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Up to 5 users</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Advanced analytics</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Inventory management</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Priority support</span>
                </div>
              </div>
              
              <Button className="w-full py-3 h-12 text-base touch-manipulation" asChild>
                <Link href="/register">Start Free Trial</Link>
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="bg-card rounded-lg sm:rounded-xl p-6 sm:p-8 border border-border relative touch-manipulation">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Pro</h3>
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">$99</div>
              <p className="text-sm text-muted-foreground mb-6">per month</p>
              
              <div className="space-y-3 mb-6 sm:mb-8">
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Everything in Basic</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Unlimited users</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Multi-location support</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">API access</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">24/7 phone support</span>
                </div>
              </div>
              
              <Button className="w-full py-3 h-12 text-base touch-manipulation" asChild>
                <Link href="/register">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-card border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 sm:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                <span className="text-xl sm:text-2xl font-light tracking-tight">
                  <span className="text-foreground">Bit</span>
                  <span className="font-semibold text-foreground">Agora</span>
                </span>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mt-4 max-w-md">
                The future of point-of-sale systems. Built for modern businesses 
                that want to accept cryptocurrency alongside traditional payments.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm sm:text-base font-semibold text-foreground mb-3">Product</h4>
              <div className="space-y-2">
                <Link href="/features" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors block touch-manipulation">
                  Features
                </Link>
                <Link href="/pricing" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors block touch-manipulation">
                  Pricing
                </Link>
                <Link href="/security" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors block touch-manipulation">
                  Security
                </Link>
                <Link href="/api" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors block touch-manipulation">
                  API
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm sm:text-base font-semibold text-foreground mb-3">Support</h4>
              <div className="space-y-2">
                <Link href="/help" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors block touch-manipulation">
                  Help Center
                </Link>
                <Link href="/contact" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors block touch-manipulation">
                  Contact Us
                </Link>
                <Link href="/status" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors block touch-manipulation">
                  Status
                </Link>
                <Link href="/community" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors block touch-manipulation">
                  Community
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm sm:text-base text-muted-foreground">
              © 2024 BitAgora POS. All rights reserved.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Link href="/privacy" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors touch-manipulation">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors touch-manipulation">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 