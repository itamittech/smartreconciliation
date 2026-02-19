import { Sidebar, Header, Footer } from '@/components/layout'
import {
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
  const { activeView } = useAppStore()

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
