import { Github, Twitter, Linkedin, Mail, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-space-600 bg-space-900/50 backdrop-blur-md relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pattern-grid opacity-20 pointer-events-none" />

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Company Info with glowing logo */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl gradient-neural shadow-glow-violet">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gradient-violet">Smart Reconciliation</h3>
            </div>
            <p className="text-sm text-gray-400 mb-6 max-w-md leading-relaxed">
              Quantum AI-powered financial reconciliation platform. Transform complex data matching
              into intelligent, automated workflows with neural network precision.
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="GitHub"
                className="h-9 w-9 hover:bg-space-750 hover:text-violet-400 hover:shadow-glow-violet"
              >
                <Github className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Twitter"
                className="h-9 w-9 hover:bg-space-750 hover:text-cyan-400 hover:shadow-glow-cyan"
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="LinkedIn"
                className="h-9 w-9 hover:bg-space-750 hover:text-violet-400 hover:shadow-glow-violet"
              >
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Email"
                className="h-9 w-9 hover:bg-space-750 hover:text-cyan-400 hover:shadow-glow-cyan"
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-violet-300">Product</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a href="#features" className="hover:text-violet-400 transition-colors">
                  AI Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-violet-400 transition-colors">
                  Quantum Pricing
                </a>
              </li>
              <li>
                <a href="#integrations" className="hover:text-violet-400 transition-colors">
                  Integrations
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-violet-400 transition-colors">
                  Neural Security
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-cyan-300">Company</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a href="#about" className="hover:text-cyan-400 transition-colors">
                  About Quantum
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-cyan-400 transition-colors">
                  Connect
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-cyan-400 transition-colors">
                  Privacy Matrix
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-cyan-400 transition-colors">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with gradient */}
        <div className="mt-10 pt-6 border-t border-space-600 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} Smart Reconciliation. Powered by Quantum Intelligence.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400">
              v1.0.0
            </span>
            <span className="px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              AI Enabled
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
