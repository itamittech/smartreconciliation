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
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-[var(--color-neutral-200)] px-6 shadow-sm glass">
      <div className="flex items-center gap-4">
        {/* AI Icon with gradient background */}
        <div className="hidden md:flex items-center justify-center h-11 w-11 rounded-xl gradient-primary shadow-brand">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          {/* Page title with brand gradient */}
          <h1 className="text-xl font-bold text-gradient">
            {getPageTitle()}
          </h1>
          <p className="text-xs text-[var(--color-neutral-600)] hidden md:block mt-0.5">
            {getPageDescription()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search with enhanced styling */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-neutral-500)]" />
          <Input
            type="search"
            placeholder="Search reconciliations..."
            className="w-80 pl-10 bg-white/80 backdrop-blur-sm border-[var(--color-neutral-200)] focus:border-[var(--color-brand-400)] shadow-[var(--shadow-xs)]"
            aria-label="Search"
          />
        </div>

        {/* Notifications with refined styling */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="View notifications"
          className="relative hover:bg-[var(--color-brand-50)] hover:text-[var(--color-brand-600)] rounded-lg"
        >
          <Bell className="h-5 w-5" />
          <Badge className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-[var(--color-brand-500)] border-2 border-white">
            3
          </Badge>
        </Button>

        {/* User Menu with enhanced styling */}
        <div className="flex items-center gap-3 pl-4 border-l border-[var(--color-neutral-200)]">
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-[var(--color-neutral-900)]">John Doe</p>
            <p className="text-xs text-[var(--color-neutral-600)]">Finance Analyst</p>
          </div>
          <Avatar
            fallback="JD"
            className="h-10 w-10 ring-2 ring-[var(--color-brand-500)]/20 hover:ring-[var(--color-brand-500)]/40 transition-all cursor-pointer"
          />
        </div>
      </div>
    </header>
  )
}

export { Header }
