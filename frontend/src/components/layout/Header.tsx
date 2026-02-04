import { Bell, Search, Sparkles } from 'lucide-react'
import { Button, Input, Avatar, Badge } from '@/components/ui'
import { useAppStore } from '@/store'

const Header = () => {
  const { activeView } = useAppStore()

  const getPageTitle = () => {
    switch (activeView) {
      case 'home':
        return 'Quantum Dashboard'
      case 'chat':
        return 'AI Intelligence'
      case 'reconciliations':
        return 'Reconciliations'
      case 'exceptions':
        return 'Exception Matrix'
      case 'rules':
        return 'Rule Engine'
      case 'files':
        return 'Data Sources'
      case 'settings':
        return 'Configuration'
      default:
        return 'Dashboard'
    }
  }

  const getPageDescription = () => {
    switch (activeView) {
      case 'home':
        return 'Real-time intelligence and insights'
      case 'chat':
        return 'Conversational AI assistant'
      case 'reconciliations':
        return 'Track and manage reconciliation workflows'
      case 'exceptions':
        return 'Resolve discrepancies with AI guidance'
      case 'rules':
        return 'Configure intelligent matching algorithms'
      case 'files':
        return 'Manage your data sources'
      case 'settings':
        return 'Customize your quantum experience'
      default:
        return 'AI-powered reconciliation intelligence'
    }
  }

  return (
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-space-600 px-6 glass-strong backdrop-blur-xl">
      <div className="flex items-center gap-4">
        {/* AI Icon with animated gradient */}
        <div className="hidden md:flex items-center justify-center h-11 w-11 rounded-xl gradient-neural shadow-glow-violet animate-pulse-glow">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          {/* Page title with gradient */}
          <h1 className="text-xl font-bold text-gradient-neural">
            {getPageTitle()}
          </h1>
          <p className="text-xs text-gray-400 hidden md:block mt-0.5">
            {getPageDescription()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search with glowing focus */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="search"
            placeholder="Search intelligence..."
            className="w-80 pl-10 bg-space-800/80 backdrop-blur-sm border-space-600 focus:border-violet-500 focus:shadow-glow-violet"
            aria-label="Search"
          />
        </div>

        {/* Notifications with glowing badge */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="View notifications"
          className="relative hover:bg-space-750 hover:text-violet-400 rounded-lg"
        >
          <Bell className="h-5 w-5" />
          <Badge
            variant="glow"
            pulse
            className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center p-0 text-xs border-2 border-background"
          >
            3
          </Badge>
        </Button>

        {/* User Menu with glowing border */}
        <div className="flex items-center gap-3 pl-4 border-l border-space-600">
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-foreground">John Doe</p>
            <p className="text-xs text-cyan-400">Quantum Analyst</p>
          </div>
          <Avatar
            fallback="JD"
            className="h-10 w-10 ring-2 ring-violet-500/50 hover:ring-violet-400 hover:shadow-glow-violet transition-all cursor-pointer"
          />
        </div>
      </div>
    </header>
  )
}

export { Header }
