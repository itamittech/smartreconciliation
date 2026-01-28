import {
  Home,
  MessageSquare,
  FileStack,
  AlertTriangle,
  Settings,
  GitBranch,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store'
import { Button } from '@/components/ui'

interface NavItem {
  icon: React.ElementType
  label: string
  view: 'home' | 'chat' | 'reconciliations' | 'exceptions' | 'rules' | 'files' | 'settings'
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', view: 'home' },
  { icon: MessageSquare, label: 'AI Chat', view: 'chat' },
  { icon: FileStack, label: 'Reconciliations', view: 'reconciliations' },
  { icon: AlertTriangle, label: 'Exceptions', view: 'exceptions' },
  { icon: GitBranch, label: 'Rules', view: 'rules' },
  { icon: FolderOpen, label: 'Files', view: 'files' },
  { icon: Settings, label: 'Settings', view: 'settings' },
]

const Sidebar = () => {
  const { sidebarOpen, toggleSidebar, activeView, setActiveView } = useAppStore()

  const handleNavClick = (view: NavItem['view']) => {
    setActiveView(view)
  }

  const handleKeyDown = (e: React.KeyboardEvent, view: NavItem['view']) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleNavClick(view)
    }
  }

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r bg-card transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-semibold">Smart Recon</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className={cn(!sidebarOpen && 'mx-auto')}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.view

          return (
            <div
              key={item.view}
              role="button"
              tabIndex={0}
              onClick={() => handleNavClick(item.view)}
              onKeyDown={(e) => handleKeyDown(e, item.view)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                !sidebarOpen && 'justify-center'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        {sidebarOpen && (
          <p className="text-xs text-muted-foreground">
            Smart Reconciliation v1.0
          </p>
        )}
      </div>
    </aside>
  )
}

export { Sidebar }
