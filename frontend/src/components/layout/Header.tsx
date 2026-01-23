import { Bell, Search } from 'lucide-react'
import { Button, Input, Avatar } from '@/components/ui'
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

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <h1 className="text-xl font-semibold">{getPageTitle()}</h1>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-64 pl-9"
            aria-label="Search"
          />
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="View notifications"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        {/* User Menu */}
        <div className="flex items-center gap-2">
          <Avatar fallback="JD" className="h-8 w-8" />
          <div className="hidden md:block">
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-muted-foreground">Finance Analyst</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export { Header }
