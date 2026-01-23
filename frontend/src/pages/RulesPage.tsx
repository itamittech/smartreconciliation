import { useState } from 'react'
import {
  Plus,
  Search,
  GitBranch,
  ArrowRight,
  Edit2,
  Copy,
  Trash2,
  Sparkles,
  Check,
} from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'

interface RuleSet {
  id: string
  name: string
  description: string
  sourceFields: string[]
  targetFields: string[]
  mappings: { source: string; target: string; transform?: string }[]
  matchingRules: { type: string; tolerance?: string }[]
  isAiGenerated: boolean
  version: number
  lastUsed?: string
  matchRate?: number
}

const mockRuleSets: RuleSet[] = [
  {
    id: '1',
    name: 'Bank Statement Reconciliation',
    description: 'Standard rules for matching bank transactions with accounting entries',
    sourceFields: ['Date', 'Description', 'Amount', 'Reference'],
    targetFields: ['Transaction_Date', 'Vendor', 'Debit', 'Credit', 'Invoice_No'],
    mappings: [
      { source: 'Date', target: 'Transaction_Date' },
      { source: 'Description', target: 'Vendor', transform: 'fuzzy_match' },
      { source: 'Amount', target: 'Debit', transform: 'absolute_value' },
      { source: 'Reference', target: 'Invoice_No' },
    ],
    matchingRules: [
      { type: 'date_tolerance', tolerance: '±1 day' },
      { type: 'amount_tolerance', tolerance: '±$0.01' },
    ],
    isAiGenerated: true,
    version: 3,
    lastUsed: '2026-01-23',
    matchRate: 97.2,
  },
  {
    id: '2',
    name: 'Invoice to Payment Matching',
    description: 'Match invoices with their corresponding payments',
    sourceFields: ['Invoice_No', 'Amount', 'Due_Date', 'Customer'],
    targetFields: ['Payment_Ref', 'Paid_Amount', 'Payment_Date', 'Payer'],
    mappings: [
      { source: 'Invoice_No', target: 'Payment_Ref', transform: 'extract_digits' },
      { source: 'Amount', target: 'Paid_Amount' },
      { source: 'Customer', target: 'Payer', transform: 'fuzzy_match' },
    ],
    matchingRules: [
      { type: 'exact_match', tolerance: 'Invoice_No' },
      { type: 'amount_tolerance', tolerance: '±2%' },
    ],
    isAiGenerated: false,
    version: 1,
    lastUsed: '2026-01-20',
    matchRate: 94.5,
  },
  {
    id: '3',
    name: 'Payroll Reconciliation',
    description: 'Match payroll records with HR system data',
    sourceFields: ['Employee_ID', 'Gross_Pay', 'Net_Pay', 'Pay_Date'],
    targetFields: ['Staff_ID', 'Salary', 'Take_Home', 'Period_End'],
    mappings: [
      { source: 'Employee_ID', target: 'Staff_ID' },
      { source: 'Gross_Pay', target: 'Salary' },
      { source: 'Net_Pay', target: 'Take_Home' },
      { source: 'Pay_Date', target: 'Period_End' },
    ],
    matchingRules: [
      { type: 'exact_match', tolerance: 'Employee_ID' },
      { type: 'amount_tolerance', tolerance: '±$0.00' },
    ],
    isAiGenerated: true,
    version: 2,
    lastUsed: '2026-01-19',
    matchRate: 99.5,
  },
]

const RulesPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRule, setSelectedRule] = useState<RuleSet | null>(null)

  const filteredRules = mockRuleSets.filter((rule) =>
    rule.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateRule = () => {
    console.log('Create new rule')
  }

  const handleSelectRule = (rule: RuleSet) => {
    setSelectedRule(rule.id === selectedRule?.id ? null : rule)
  }

  const handleKeyDown = (e: React.KeyboardEvent, rule: RuleSet) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelectRule(rule)
    }
  }

  return (
    <div className="flex h-full">
      {/* Rule List */}
      <div className="flex w-96 flex-col border-r">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Rule Library</h2>
            <Button size="sm" onClick={handleCreateRule}>
              <Plus className="mr-1 h-4 w-4" />
              New
            </Button>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              aria-label="Search rules"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-2">
          {filteredRules.map((rule) => (
            <div
              key={rule.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSelectRule(rule)}
              onKeyDown={(e) => handleKeyDown(e, rule)}
              className={cn(
                'mb-2 cursor-pointer rounded-lg border p-3 transition-colors',
                selectedRule?.id === rule.id
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-muted/50'
              )}
              aria-selected={selectedRule?.id === rule.id}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{rule.name}</span>
                </div>
                {rule.isAiGenerated && (
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="mr-1 h-3 w-3" />
                    AI
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {rule.description}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span>v{rule.version}</span>
                {rule.matchRate && (
                  <span className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-success" />
                    {rule.matchRate}%
                  </span>
                )}
                {rule.lastUsed && <span>Used {rule.lastUsed}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rule Details / Builder */}
      <div className="flex-1 overflow-auto">
        {selectedRule ? (
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{selectedRule.name}</h2>
                  {selectedRule.isAiGenerated && (
                    <Badge variant="secondary">
                      <Sparkles className="mr-1 h-3 w-3" />
                      AI Generated
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-muted-foreground">
                  {selectedRule.description}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit2 className="mr-1 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="mr-1 h-4 w-4" />
                  Duplicate
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="mr-1 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Visual Mapping */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Field Mappings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-8">
                  {/* Source Fields */}
                  <div className="flex-1">
                    <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                      Source Fields
                    </h4>
                    <div className="space-y-2">
                      {selectedRule.sourceFields.map((field) => (
                        <div
                          key={field}
                          className="rounded-md border bg-secondary/50 px-3 py-2 text-sm"
                        >
                          {field}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mapping Arrows */}
                  <div className="flex flex-col justify-center">
                    {selectedRule.mappings.map((mapping, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 py-2"
                      >
                        <ArrowRight className="h-4 w-4 text-primary" />
                        {mapping.transform && (
                          <Badge variant="outline" className="text-xs">
                            {mapping.transform}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Target Fields */}
                  <div className="flex-1">
                    <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                      Target Fields
                    </h4>
                    <div className="space-y-2">
                      {selectedRule.targetFields.map((field) => (
                        <div
                          key={field}
                          className="rounded-md border bg-secondary/50 px-3 py-2 text-sm"
                        >
                          {field}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Matching Rules */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Matching Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedRule.matchingRules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium capitalize">
                          {rule.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {rule.tolerance && (
                        <Badge variant="secondary">{rule.tolerance}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-success">
                      {selectedRule.matchRate}%
                    </p>
                    <p className="text-sm text-muted-foreground">Match Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{selectedRule.version}</p>
                    <p className="text-sm text-muted-foreground">Version</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {selectedRule.mappings.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Mappings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <GitBranch className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-medium">Select a Rule</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a rule from the library to view or edit its configuration
              </p>
              <Button className="mt-4" onClick={handleCreateRule}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Rule
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export { RulesPage }
