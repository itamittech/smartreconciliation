import { Github, Twitter, Linkedin, Mail } from 'lucide-react'
import { Button } from '@/components/ui'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-3">Smart Reconciliation</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              AI-powered financial reconciliation platform that transforms complex data matching
              into intelligent, automated workflows. Save time, reduce errors, and gain insights
              with our advanced reconciliation engine.
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="GitHub"
                className="h-8 w-8"
              >
                <Github className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Twitter"
                className="h-8 w-8"
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="LinkedIn"
                className="h-8 w-8"
              >
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Email"
                className="h-8 w-8"
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-foreground transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-foreground transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#integrations" className="hover:text-foreground transition-colors">
                  Integrations
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-foreground transition-colors">
                  Security
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#about" className="hover:text-foreground transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Smart Reconciliation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
