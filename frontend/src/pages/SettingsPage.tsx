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
  Users,
  Plus,
  Pencil,
  Check,
  Sun,
  Moon,
  Monitor,
  Type,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import { dataSourcesApi, aiConfigApi, adminApi } from '@/services/api'
import type { DataSource, AiProvider, UserRole, UserDetailResponse, CreateUserRequest, UpdateUserRequest } from '@/types'
import { useAppStore } from '@/store'

type SettingsTab = 'profile' | 'connections' | 'ai' | 'notifications' | 'security' | 'appearance' | 'users'

const ROLE_OPTIONS: UserRole[] = ['ADMIN', 'ANALYST', 'FINANCE', 'IT_ADMIN', 'OPERATIONS', 'COMPLIANCE', 'VIEWER']

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin',
  ANALYST: 'Analyst',
  FINANCE: 'Finance',
  IT_ADMIN: 'IT Admin',
  OPERATIONS: 'Operations',
  COMPLIANCE: 'Compliance',
  VIEWER: 'Viewer',
}

const SettingsPage = () => {
  const { currentUser } = useAppStore()
  const isAdmin = currentUser?.role === 'ADMIN'

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const queryClient = useQueryClient()

  // --- User Management state ---
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [newUserForm, setNewUserForm] = useState<CreateUserRequest>({ name: '', email: '', role: 'VIEWER' })
  const [createdTempPassword, setCreatedTempPassword] = useState<string | null>(null)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [editingUser, setEditingUser] = useState<UpdateUserRequest>({})

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

  // Fetch AI configuration
  const { data: aiConfigResponse, isLoading: isAiConfigLoading } = useQuery({
    queryKey: ['aiConfig'],
    queryFn: () => aiConfigApi.getConfig(),
  })

  const aiConfig = aiConfigResponse?.data

  // Update AI provider mutation
  const updateAiProviderMutation = useMutation({
    mutationFn: (provider: AiProvider) => aiConfigApi.updateConfig({ provider }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiConfig'] })
    },
  })

  // Fetch users (admin only)
  const { data: usersResponse, isLoading: isUsersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.listUsers(),
    enabled: isAdmin,
  })

  const users = usersResponse?.data || []

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => adminApi.createUser(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setCreatedTempPassword(res.data.tempPassword)
      setShowCreateUser(false)
      setNewUserForm({ name: '', email: '', role: 'VIEWER' })
    },
  })

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setEditingUserId(null)
      setEditingUser({})
    },
  })

  const allTabs: { id: SettingsTab; label: string; icon: typeof User; adminOnly?: boolean }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'connections', label: 'Data Sources', icon: Database },
    { id: 'ai', label: 'AI Settings', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'users', label: 'Users', icon: Users, adminOnly: true },
  ]

  const visibleTabs = allTabs.filter((t) => !t.adminOnly || isAdmin)

  const handleTabClick = (tab: SettingsTab) => setActiveTab(tab)

  const handleTabKeyDown = (e: React.KeyboardEvent, tab: SettingsTab) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleTabClick(tab)
    }
  }

  const handleTestConnection = (id: number) => {
    testConnectionMutation.mutate(id)
  }

  const renderUsersTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Management</CardTitle>
            <Button size="sm" onClick={() => { setShowCreateUser(true); setCreatedTempPassword(null) }}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Temp password display after creation */}
          {createdTempPassword && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-800">User created — share this temp password out-of-band:</p>
              <code className="mt-1 block text-sm font-mono text-amber-900 bg-amber-100 px-2 py-1 rounded">
                {createdTempPassword}
              </code>
              <Button variant="ghost" size="sm" className="mt-2 text-amber-700" onClick={() => setCreatedTempPassword(null)}>
                Dismiss
              </Button>
            </div>
          )}

          {/* Create user form */}
          {showCreateUser && (
            <div className="mb-4 rounded-lg border p-4 space-y-3">
              <h3 className="text-sm font-semibold">New User</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-medium text-neutral-600">Name</label>
                  <Input
                    className="mt-1"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-600">Email</label>
                  <Input
                    className="mt-1"
                    type="email"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    placeholder="user@company.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-600">Role</label>
                  <select
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => createUserMutation.mutate(newUserForm)}
                  disabled={createUserMutation.isPending || !newUserForm.name || !newUserForm.email}
                >
                  {createUserMutation.isPending ? 'Creating…' : 'Create User'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowCreateUser(false)}>Cancel</Button>
              </div>
              {createUserMutation.isError && (
                <p className="text-sm text-destructive">
                  {createUserMutation.error instanceof Error ? createUserMutation.error.message : 'Failed to create user'}
                </p>
              )}
            </div>
          )}

          {isUsersLoading ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <Users className="mb-2 h-12 w-12 opacity-20" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-medium text-neutral-500">
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Email</th>
                    <th className="pb-2 pr-4">Role</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(users as UserDetailResponse[]).map((u) => (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{u.name}</td>
                      <td className="py-3 pr-4 text-neutral-600">{u.email}</td>
                      <td className="py-3 pr-4">
                        {editingUserId === u.id ? (
                          <select
                            className="rounded border border-input bg-background px-2 py-1 text-xs"
                            value={editingUser.role ?? u.role}
                            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                            ))}
                          </select>
                        ) : (
                          <Badge variant="outline" className="text-xs">{ROLE_LABELS[u.role]}</Badge>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {editingUserId === u.id ? (
                          <select
                            className="rounded border border-input bg-background px-2 py-1 text-xs"
                            value={editingUser.active !== undefined ? String(editingUser.active) : String(u.active)}
                            onChange={(e) => setEditingUser({ ...editingUser, active: e.target.value === 'true' })}
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        ) : (
                          <Badge variant={u.active ? 'success' : 'secondary'} className="text-xs">
                            {u.active ? 'Active' : 'Inactive'}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3">
                        {editingUserId === u.id ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateUserMutation.mutate({ id: u.id, data: editingUser })}
                              disabled={updateUserMutation.isPending}
                            >
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setEditingUserId(null); setEditingUser({}) }}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setEditingUserId(u.id); setEditingUser({ role: u.role, active: u.active }) }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

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
                  <Input id="firstName" defaultValue={currentUser?.name.split(' ')[0] ?? ''} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="lastName">
                    Last Name
                  </label>
                  <Input id="lastName" defaultValue={currentUser?.name.split(' ').slice(1).join(' ') ?? ''} className="mt-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={currentUser?.email ?? ''}
                  className="mt-1"
                  disabled
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="role">
                  Role
                </label>
                <Input
                  id="role"
                  defaultValue={currentUser?.role ? ROLE_LABELS[currentUser.role] : ''}
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
              {isAiConfigLoading ? (
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                  Loading AI configuration...
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium" htmlFor="aiProvider">
                      AI Provider
                    </label>
                    <select
                      id="aiProvider"
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={aiConfig?.currentProvider || 'anthropic'}
                      onChange={(e) => {
                        const provider = e.target.value as AiProvider
                        updateAiProviderMutation.mutate(provider)
                      }}
                      disabled={updateAiProviderMutation.isPending || !isAdmin}
                    >
                      <option value="anthropic">Anthropic Claude</option>
                      <option value="openai">OpenAI GPT-4</option>
                      <option value="deepseek">DeepSeek</option>
                    </select>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {!isAdmin
                        ? 'Only admins can change the AI provider.'
                        : updateAiProviderMutation.isPending
                        ? 'Saving...'
                        : updateAiProviderMutation.isSuccess
                        ? '✅ Saved! Restart the application for changes to take effect.'
                        : 'Select the AI provider for intelligent features'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium" htmlFor="apiKey">
                      API Key
                    </label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="Configured via .env file"
                      className="mt-1"
                      disabled
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      API keys are configured in the .env file for security
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
                            disabled
                            className="rounded border-input"
                          />
                          <span className="text-sm text-muted-foreground">{feature.label}</span>
                        </label>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      All AI features are currently enabled by default
                    </p>
                  </div>
                </>
              )}
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
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Theme & Visuals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Theme Selector */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold tracking-tight">Interface Theme</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'light', label: 'Light', icon: Sun, color: 'bg-white border-neutral-200' },
                      { id: 'dark', label: 'Dark', icon: Moon, color: 'bg-neutral-900 border-neutral-800 text-white' },
                      { id: 'system', label: 'System', icon: Monitor, color: 'bg-gradient-to-br from-white to-neutral-900 border-neutral-200' },
                    ].map((t) => {
                      const Icon = t.icon
                      const isActive = useAppStore.getState().theme === t.id
                      return (
                        <button
                          key={t.id}
                          onClick={() => useAppStore.getState().setTheme(t.id as any)}
                          className={cn(
                            'group relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200 hover:border-primary/50',
                            isActive ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-transparent bg-muted/30 hover:bg-muted/50'
                          )}
                        >
                          <div className={cn('flex h-12 w-full items-center justify-center rounded-lg border shadow-sm transition-transform group-hover:scale-105', t.color)}>
                            <Icon className={cn('h-6 w-6', isActive ? 'text-primary' : 'text-muted-foreground')} />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-wider">{t.label}</span>
                          {isActive && (
                            <div className="absolute -right-1 -top-1 rounded-full bg-primary p-1 text-primary-foreground shadow-lg">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Accent Color */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold tracking-tight">Accent Color</label>
                    <Badge variant="outline" className="font-mono text-[10px] uppercase">SmartRecon Palette</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { id: 'indigo', color: 'bg-indigo-500', label: 'Indigo' },
                      { id: 'emerald', color: 'bg-emerald-500', label: 'Emerald' },
                      { id: 'rose', color: 'bg-rose-500', label: 'Rose' },
                      { id: 'amber', color: 'bg-amber-500', label: 'Amber' },
                      { id: 'slate', color: 'bg-slate-700', label: 'Slate' },
                    ].map((c) => {
                      const isActive = useAppStore.getState().accentColor === c.id
                      return (
                        <button
                          key={c.id}
                          onClick={() => useAppStore.getState().setAccentColor(c.id as any)}
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all hover:scale-110 active:scale-95',
                            isActive ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-transparent'
                          )}
                          title={c.label}
                        >
                          <div className={cn('h-7 w-7 rounded-full shadow-inner', c.color)} />
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Display Density */}
                <div className="space-y-3 pt-4 border-t">
                  <label className="text-sm font-semibold tracking-tight">Interface Density</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => { if (useAppStore.getState().compactMode) useAppStore.getState().toggleCompactMode() }}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border p-4 transition-all',
                        !useAppStore.getState().compactMode ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/30 hover:bg-muted/50'
                      )}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-background shadow-sm">
                        <Maximize2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">Standard</p>
                        <p className="text-xs text-muted-foreground">Spacious & comfortable</p>
                      </div>
                    </button>
                    <button
                      onClick={() => { if (!useAppStore.getState().compactMode) useAppStore.getState().toggleCompactMode() }}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border p-4 transition-all',
                        useAppStore.getState().compactMode ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/30 hover:bg-muted/50'
                      )}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-background shadow-sm">
                        <Minimize2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">Compact</p>
                        <p className="text-xs text-muted-foreground">More data on screen</p>
                      </div>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-primary" />
                  Localization & Regional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="language">Language</label>
                    <select
                      id="language"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                      defaultValue="en"
                    >
                      <option value="en">English (US)</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="ja">Japanese</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="dateFormat">Date Format</label>
                    <select
                      id="dateFormat"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                      defaultValue="mdy"
                    >
                      <option value="mdy">MM/DD/YYYY</option>
                      <option value="dmy">DD/MM/YYYY</option>
                      <option value="ymd">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-xs text-muted-foreground italic">
                    Changes will be saved automatically to your profile.
                  </p>
                  <Button size="sm">
                    <Save className="mr-2 h-4 w-4" />
                    Apply Globally
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'users':
        return isAdmin ? renderUsersTab() : null

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
          {visibleTabs.map((tab) => {
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
