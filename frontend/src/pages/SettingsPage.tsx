import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  User,
  Database,
  Key,
  Bell,
  Shield,
  Palette,
  Save,
  TestTube,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import { dataSourcesApi } from '@/services/api'
import type { DataSource } from '@/types'

type SettingsTab = 'profile' | 'connections' | 'ai' | 'notifications' | 'security' | 'appearance'

const tabs: { id: SettingsTab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'connections', label: 'Data Sources', icon: Database },
  { id: 'ai', label: 'AI Settings', icon: Key },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
]

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const queryClient = useQueryClient()

  // Fetch all data sources
  const { data: dataSourcesResponse, isLoading } = useQuery({
    queryKey: ['dataSources'],
    queryFn: () => dataSourcesApi.getAll(),
  })

  const dataSources = dataSourcesResponse?.data || []

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: (id: number) => dataSourcesApi.testConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataSources'] })
    },
  })

  const handleTabClick = (tab: SettingsTab) => {
    setActiveTab(tab)
  }

  const handleTabKeyDown = (e: React.KeyboardEvent, tab: SettingsTab) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleTabClick(tab)
    }
  }

  const handleTestConnection = (id: number) => {
    testConnectionMutation.mutate(id)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium" htmlFor="firstName">
                    First Name
                  </label>
                  <Input id="firstName" defaultValue="John" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="lastName">
                    Last Name
                  </label>
                  <Input id="lastName" defaultValue="Doe" className="mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="john.doe@company.com"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="role">
                  Role
                </label>
                <Input
                  id="role"
                  defaultValue="Finance Analyst"
                  disabled
                  className="mt-1"
                />
              </div>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        )

      case 'connections':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Data Source Connections</CardTitle>
                <Button size="sm">
                  <Database className="mr-2 h-4 w-4" />
                  Add Connection
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                  Loading data sources...
                </div>
              ) : dataSources.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                  <Database className="mb-2 h-12 w-12 opacity-20" />
                  <p>No data sources configured</p>
                  <p className="text-sm">Add a connection to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dataSources.map((ds: DataSource) => {
                    const isConnected = ds.active && ds.lastTestSuccessful
                    const hasError = ds.lastTestSuccessful === false
                    const lastTested = ds.lastTestedAt
                      ? new Date(ds.lastTestedAt).toLocaleDateString()
                      : 'Never'

                    return (
                      <div
                        key={ds.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn('rounded-full p-2', {
                              'bg-success/10': isConnected,
                              'bg-destructive/10': hasError,
                              'bg-muted': !ds.active || ds.lastTestSuccessful === undefined,
                            })}
                          >
                            <Database
                              className={cn('h-4 w-4', {
                                'text-success': isConnected,
                                'text-destructive': hasError,
                                'text-muted-foreground': !ds.active || ds.lastTestSuccessful === undefined,
                              })}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{ds.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {ds.type} • Last tested: {lastTested}
                            </p>
                            {ds.description && (
                              <p className="text-xs text-muted-foreground">{ds.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              isConnected
                                ? 'success'
                                : hasError
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {isConnected && <CheckCircle2 className="mr-1 h-3 w-3" />}
                            {hasError && <AlertCircle className="mr-1 h-3 w-3" />}
                            {isConnected
                              ? 'connected'
                              : hasError
                              ? 'error'
                              : ds.active
                              ? 'not tested'
                              : 'inactive'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestConnection(ds.id)}
                            disabled={testConnectionMutation.isPending}
                          >
                            <TestTube className="mr-1 h-3 w-3" />
                            {testConnectionMutation.isPending ? 'Testing...' : 'Test'}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 'ai':
        return (
          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium" htmlFor="aiProvider">
                  AI Provider
                </label>
                <select
                  id="aiProvider"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue="anthropic"
                >
                  <option value="anthropic">Anthropic Claude</option>
                  <option value="openai">OpenAI GPT-4</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="ollama">Ollama (Local)</option>
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Select the AI provider for intelligent features
                </p>
              </div>

              <div>
                <label className="text-sm font-medium" htmlFor="apiKey">
                  API Key
                </label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="sk-..."
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Your API key is encrypted and stored securely
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">AI Features</label>
                <div className="mt-2 space-y-2">
                  {[
                    { id: 'autoMapping', label: 'Auto field mapping suggestions' },
                    { id: 'exceptionSuggestions', label: 'Exception resolution suggestions' },
                    { id: 'ruleGeneration', label: 'AI rule generation' },
                    { id: 'chatAssistant', label: 'Chat assistant' },
                  ].map((feature) => (
                    <label
                      key={feature.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-input"
                      />
                      <span className="text-sm">{feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save AI Settings
              </Button>
            </CardContent>
          </Card>
        )

      case 'notifications':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: 'email', label: 'Email notifications', description: 'Receive updates via email' },
                { id: 'reconciliationComplete', label: 'Reconciliation complete', description: 'When a reconciliation finishes processing' },
                { id: 'criticalExceptions', label: 'Critical exceptions', description: 'When critical exceptions are detected' },
                { id: 'weeklyReport', label: 'Weekly summary', description: 'Weekly reconciliation summary report' },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="peer sr-only"
                    />
                    <div className="h-6 w-11 rounded-full bg-muted peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        )

      case 'security':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium">Change Password</h3>
                <div className="mt-2 space-y-3">
                  <Input type="password" placeholder="Current password" />
                  <Input type="password" placeholder="New password" />
                  <Input type="password" placeholder="Confirm new password" />
                </div>
                <Button className="mt-3">Update Password</Button>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
                <Button variant="outline" className="mt-3">
                  Enable 2FA
                </Button>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium">Active Sessions</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage your active sessions across devices
                </p>
                <div className="mt-3 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-xs text-muted-foreground">
                        Windows • Chrome • Active now
                      </p>
                    </div>
                    <Badge variant="success">Current</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 'appearance':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium">Theme</label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {['Light', 'Dark', 'System'].map((theme) => (
                    <button
                      key={theme}
                      className={cn(
                        'rounded-lg border p-3 text-center transition-colors',
                        theme === 'Light'
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted'
                      )}
                    >
                      <Palette className="mx-auto h-6 w-6 text-muted-foreground" />
                      <p className="mt-1 text-sm font-medium">{theme}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium" htmlFor="language">
                  Language
                </label>
                <select
                  id="language"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue="en"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium" htmlFor="dateFormat">
                  Date Format
                </label>
                <select
                  id="dateFormat"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue="mdy"
                >
                  <option value="mdy">MM/DD/YYYY</option>
                  <option value="dmy">DD/MM/YYYY</option>
                  <option value="ymd">YYYY-MM-DD</option>
                </select>
              </div>

              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex h-full">
      {/* Settings Navigation */}
      <nav className="w-64 border-r p-4">
        <h2 className="mb-4 font-semibold">Settings</h2>
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <div
                key={tab.id}
                role="button"
                tabIndex={0}
                onClick={() => handleTabClick(tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                aria-selected={activeTab === tab.id}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </div>
            )
          })}
        </div>
      </nav>

      {/* Settings Content */}
      <div className="flex-1 overflow-auto p-6">{renderContent()}</div>
    </div>
  )
}

export { SettingsPage }
