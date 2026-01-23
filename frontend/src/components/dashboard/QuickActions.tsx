import { Upload, MessageSquare, FileStack, AlertTriangle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'
import { useAppStore } from '@/store'

const QuickActions = () => {
  const { setActiveView } = useAppStore()

  const actions = [
    {
      icon: Upload,
      label: 'Upload Files',
      description: 'Start a new reconciliation',
      onClick: () => setActiveView('chat'),
      variant: 'default' as const,
    },
    {
      icon: MessageSquare,
      label: 'AI Assistant',
      description: 'Chat with AI helper',
      onClick: () => setActiveView('chat'),
      variant: 'outline' as const,
    },
    {
      icon: FileStack,
      label: 'View All',
      description: 'See all reconciliations',
      onClick: () => setActiveView('reconciliations'),
      variant: 'outline' as const,
    },
    {
      icon: AlertTriangle,
      label: 'Exceptions',
      description: 'Review pending issues',
      onClick: () => setActiveView('exceptions'),
      variant: 'outline' as const,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.label}
                variant={action.variant}
                className="h-auto flex-col items-start gap-2 p-4"
                onClick={action.onClick}
              >
                <Icon className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">{action.label}</p>
                  <p className="text-xs font-normal text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export { QuickActions }
