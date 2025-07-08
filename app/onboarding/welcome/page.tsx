import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, CheckCircle } from "lucide-react"

export default function OnboardingWelcomePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-card rounded-lg shadow-lg p-8 text-center">
        {/* Header */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <Zap className="h-8 w-8 text-primary mx-auto" />
            <h1 className="text-3xl font-light tracking-tight">
              <span className="text-foreground">Bit</span>
              <span className="font-semibold text-foreground">Agora</span>
            </h1>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-semibold text-foreground">
            Welcome to BitAgora!
          </h2>
          <p className="text-muted-foreground">
            Your admin account has been created successfully. You're now ready to set up your business and start accepting payments.
          </p>
        </div>

        {/* Next Steps */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-foreground">What's Next?</h3>
          <div className="text-left space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-sm font-medium">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Configure payment methods</p>
                <p className="text-sm text-muted-foreground">Set up crypto wallets and payment processors</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-sm font-medium">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Set up QR payments</p>
                <p className="text-sm text-muted-foreground">Configure regional QR payment systems and custom providers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/onboarding/admin-setup">
              Continue Setup
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/dashboard">
              Skip to Dashboard
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Need help? Check out our{" "}
            <Link href="/help" className="text-primary hover:underline">
              Help Center
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 