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
  BarChart3,
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
  { icon: Home, label: 'Dashboard', view: 'home' },
  { icon: MessageSquare, label: 'AI Assistant', view: 'chat' },
  { icon: FileStack, label: 'Reconciliations', view: 'reconciliations' },
  { icon: AlertTriangle, label: 'Exceptions', view: 'exceptions' },
  { icon: GitBranch, label: 'Rule Sets', view: 'rules' },
  { icon: FolderOpen, label: 'Data Sources', view: 'files' },
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
        'flex h-full flex-col bg-card border-r border-border transition-all duration-300 relative',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex h-20 items-center justify-between border-b border-border px-4">
        {sidebarOpen && (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-base text-foreground">Smart Recon</span>
              <p className="text-xs text-muted-foreground font-medium">Professional</p>
            </div>
          </div>
        )}
        {!sidebarOpen && (
          <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-md bg-primary">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
        {sidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
            className="rounded-md"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
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
                'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-smooth relative',
                isActive
                  ? 'bg-primary/10 text-primary border-l-4 border-primary pl-2'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                !sidebarOpen && 'justify-center border-l-0 pl-3'
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
              {sidebarOpen && <span>{item.label}</span>}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4 bg-muted/30">
        {sidebarOpen ? (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">
              Smart Reconciliation
            </p>
            <p className="text-xs text-muted-foreground">
              Version 1.0.0
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="text-xs font-bold text-muted-foreground">v1</div>
          </div>
        )}
      </div>

      {/* Expand button when collapsed */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          aria-label="Expand sidebar"
          className="absolute bottom-24 right-0 translate-x-1/2 h-8 w-8 rounded-full bg-muted hover:bg-accent border border-border flex items-center justify-center transition-smooth z-20 shadow-sm"
        >
          <ChevronRight className="h-4 w-4 text-foreground" />
        </button>
      )}
    </aside>
  )
}

export { Sidebar }
