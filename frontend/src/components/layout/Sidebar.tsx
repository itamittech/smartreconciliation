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
        'flex h-full flex-col border-r border-[var(--color-neutral-200)] bg-white transition-all duration-300 shadow-[var(--shadow-sm)]',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo - Enhanced with brand colors */}
      <div className="flex h-20 items-center justify-between border-b border-[var(--color-neutral-200)] px-4 bg-gradient-subtle">
        {sidebarOpen && (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl gradient-primary shadow-brand">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base text-[var(--color-neutral-900)]">Smart Recon</span>
              <p className="text-xs text-[var(--color-brand-600)] font-medium">AI Powered</p>
            </div>
          </div>
        )}
        {!sidebarOpen && (
          <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-xl gradient-primary shadow-brand">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className={cn('rounded-lg hover:bg-[var(--color-brand-50)]', !sidebarOpen && 'hidden')}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation - Enhanced with brand styling */}
      <nav className="flex-1 space-y-1.5 p-3">
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
                'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200',
                isActive
                  ? 'bg-[var(--color-brand-500)] text-white shadow-[var(--shadow-sm)]'
                  : 'text-[var(--color-neutral-600)] hover:bg-[var(--color-brand-50)] hover:text-[var(--color-brand-700)]',
                !sidebarOpen && 'justify-center'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </div>
          )
        })}
      </nav>

      {/* Footer - Enhanced styling */}
      <div className="border-t border-[var(--color-neutral-200)] p-4 bg-[var(--color-neutral-50)]">
        {sidebarOpen ? (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[var(--color-neutral-900)]">
              Smart Reconciliation
            </p>
            <p className="text-xs text-[var(--color-neutral-600)]">
              Version 1.0.0
            </p>
            <p className="text-xs text-[var(--color-brand-600)] font-medium">
              Powered by AI
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="text-xs font-bold text-[var(--color-brand-600)]">v1</div>
          </div>
        )}
      </div>
    </aside>
  )
}

export { Sidebar }
