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
        'flex h-full flex-col glass-strong border-r border-space-600 transition-all duration-300 relative overflow-hidden',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 pattern-dots opacity-30 pointer-events-none" />

      {/* Logo with glowing effect */}
      <div className="flex h-20 items-center justify-between border-b border-space-600 px-4 relative z-10">
        {sidebarOpen && (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl gradient-neural shadow-glow-violet animate-pulse-glow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base text-gradient-violet">Smart Recon</span>
              <p className="text-xs text-cyan-400 font-medium">Quantum AI</p>
            </div>
          </div>
        )}
        {!sidebarOpen && (
          <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-xl gradient-neural shadow-glow-violet animate-pulse-glow">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
        )}
        {sidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
            className="rounded-lg hover:bg-space-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation with glowing active states */}
      <nav className="flex-1 space-y-1.5 p-3 relative z-10">
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
                'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-300 relative',
                isActive
                  ? 'bg-gradient-to-r from-violet-500/30 to-violet-600/30 text-white border border-violet-500/50 shadow-glow-violet'
                  : 'text-gray-400 hover:bg-space-750 hover:text-white hover:border hover:border-space-600',
                !sidebarOpen && 'justify-center'
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-violet-300')} />
              {sidebarOpen && <span>{item.label}</span>}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent rounded-lg pointer-events-none" />
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer with gradient */}
      <div className="border-t border-space-600 p-4 relative z-10 bg-space-900/50">
        {sidebarOpen ? (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gradient-violet">
              Smart Reconciliation
            </p>
            <p className="text-xs text-gray-400">
              Version 1.0.0
            </p>
            <p className="text-xs text-cyan-400 font-medium">
              Powered by Quantum AI
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="text-xs font-bold text-violet-400">v1</div>
          </div>
        )}
      </div>

      {/* Expand button when collapsed */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          aria-label="Expand sidebar"
          className="absolute bottom-24 right-0 translate-x-1/2 h-8 w-8 rounded-full glass border border-violet-500/50 flex items-center justify-center hover:shadow-glow-violet transition-all duration-300 z-20"
        >
          <ChevronRight className="h-4 w-4 text-violet-400" />
        </button>
      )}
    </aside>
  )
}

export { Sidebar }
