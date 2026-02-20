import { Bell, Search, BarChart3, LogOut } from 'lucide-react'
import { Button, Input, Avatar, Badge } from '@/components/ui'
import { useAppStore } from '@/store'

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'System Admin',
  ANALYST: 'Analyst',
  FINANCE: 'Finance',
  IT_ADMIN: 'IT Admin',
  OPERATIONS: 'Operations',
  COMPLIANCE: 'Compliance',
  VIEWER: 'Viewer',
}

const Header = () => {
  const { activeView, currentUser, clearAuth } = useAppStore()

  const getPageTitle = () => {
    switch (activeView) {
      case 'home':
        return 'Dashboard'
      case 'chat':
        return 'AI Assistant'
      case 'reconciliations':
        return 'Reconciliations'
      case 'exceptions':
        return 'Exceptions'
      case 'rules':
        return 'Rule Sets'
      case 'files':
        return 'Data Sources'
      case 'settings':
        return 'Settings'
      default:
        return 'Dashboard'
    }
  }

  const getPageDescription = () => {
    switch (activeView) {
      case 'home':
        return 'Overview and insights'
      case 'chat':
        return 'AI-powered assistance'
      case 'reconciliations':
        return 'Track and manage reconciliation workflows'
      case 'exceptions':
        return 'Resolve discrepancies efficiently'
      case 'rules':
        return 'Configure matching algorithms'
      case 'files':
        return 'Manage your data sources'
      case 'settings':
        return 'Customize your experience'
      default:
        return 'AI-powered reconciliation platform'
    }
  }

  const userInitials = currentUser
    ? currentUser.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-neutral-200 px-6 bg-white backdrop-blur-sm">
      <div className="flex items-center gap-4">
        {/* Page Icon */}
        <div className="hidden md:flex items-center justify-center h-11 w-11 rounded-md bg-brand-50">
          <BarChart3 className="h-5 w-5 text-brand-600" />
        </div>
        <div>
          {/* Page title */}
          <h1 className="text-xl font-bold text-neutral-900">
            {getPageTitle()}
          </h1>
          <p className="text-xs text-neutral-500 hidden md:block mt-0.5">
            {getPageDescription()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-80 pl-10"
            aria-label="Search"
          />
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="View notifications"
          className="relative rounded-md"
        >
          <Bell className="h-5 w-5" />
          <Badge
            variant="destructive"
            className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center p-0 text-xs border-2 border-background"
          >
            3
          </Badge>
        </Button>

        {/* User Menu */}
        <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-neutral-900">
              {currentUser?.name ?? 'Unknown'}
            </p>
            <p className="text-xs text-neutral-500">
              {currentUser ? ROLE_LABELS[currentUser.role] ?? currentUser.role : ''}
            </p>
          </div>
          <Avatar
            fallback={userInitials}
            className="h-10 w-10 ring-2 ring-neutral-200 hover:ring-brand-300 transition-smooth cursor-pointer"
          />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            className="rounded-md text-neutral-500 hover:text-red-600"
            onClick={clearAuth}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export { Header }
