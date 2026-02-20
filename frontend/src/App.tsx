import { useEffect } from 'react'
import { Sidebar, Header, Footer } from '@/components/layout'
import {
  LoginPage,
  HomePage,
  ChatPage,
  ReconciliationsPage,
  ExceptionsPage,
  RulesPage,
  FilesPage,
  SettingsPage,
} from '@/pages'
import { useAppStore } from '@/store'

const App = () => {
  const { activeView, token, setActiveView, theme, accentColor, compactMode } = useAppStore()

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement
    // Remove existing accent classes
    root.classList.forEach((cls) => {
      if (cls.startsWith('accent-')) root.classList.remove(cls)
    })
    root.classList.add(`accent-${accentColor}`)
  }, [accentColor])

  useEffect(() => {
    const root = window.document.documentElement
    if (compactMode) {
      root.classList.add('compact')
    } else {
      root.classList.remove('compact')
    }
  }, [compactMode])

  useEffect(() => {
    const validViews = new Set(['home', 'chat', 'reconciliations', 'exceptions', 'rules', 'files', 'settings'])
    const syncViewFromUrl = () => {
      const params = new URLSearchParams(window.location.search)
      const view = params.get('view')
      if (view && validViews.has(view)) {
        setActiveView(view as typeof activeView)
      }
    }

    syncViewFromUrl()
    window.addEventListener('popstate', syncViewFromUrl)
    return () => window.removeEventListener('popstate', syncViewFromUrl)
  }, [setActiveView])

  // Auth guard — show login if no token
  if (!token) {
    return <LoginPage />
  }

  const renderPage = () => {
    switch (activeView) {
      case 'home':
        return <HomePage />
      case 'chat':
        return <ChatPage />
      case 'reconciliations':
        return <ReconciliationsPage />
      case 'exceptions':
        return <ExceptionsPage />
      case 'rules':
        return <RulesPage />
      case 'files':
        return <FilesPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <HomePage />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default App
