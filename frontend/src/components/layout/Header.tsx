import { Bell, Search, Sparkles } from 'lucide-react'
import { Button, Input, Avatar, Badge } from '@/components/ui'
import { useAppStore } from '@/store'

const Header = () => {
  const { activeView } = useAppStore()

  const getPageTitle = () => {
    switch (activeView) {
      case 'home':
        return 'Dashboard'
      case 'chat':
        return 'AI Assistant'
      case 'reconciliations':
        return 'Reconciliations'
      case 'exceptions':
        return 'Exception Queue'
      case 'rules':
        return 'Rule Builder'
      case 'settings':
        return 'Settings'
      default:
        return 'Dashboard'
    }
  }

  const getPageDescription = () => {
    switch (activeView) {
      case 'home':
        return 'AI-powered reconciliation insights'
      case 'chat':
        return 'Chat with your reconciliation AI'
      case 'reconciliations':
        return 'Manage and track all reconciliations'
      case 'exceptions':
        return 'Review and resolve exceptions'
      case 'rules':
        return 'Configure intelligent matching rules'
      case 'settings':
        return 'Customize your experience'
      default:
        return 'AI-powered reconciliation insights'
    }
  }

  return (
    <header className="flex h-20 items-center justify-between border-b bg-gradient-to-r from-card to-secondary/20 px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {getPageTitle()}
          </h1>
          <p className="text-xs text-muted-foreground hidden md:block">
            {getPageDescription()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reconciliations..."
            className="w-72 pl-9 bg-background/50 backdrop-blur-sm"
            aria-label="Search"
          />
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="View notifications"
          className="relative hover:bg-primary/5"
        >
          <Bell className="h-5 w-5" />
          <Badge className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
            3
          </Badge>
        </Button>

        {/* User Menu */}
        <div className="flex items-center gap-3 pl-4 border-l">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-muted-foreground">Finance Analyst</p>
          </div>
          <Avatar fallback="JD" className="h-9 w-9 ring-2 ring-primary/10" />
        </div>
      </div>
    </header>
  )
}

export { Header }
