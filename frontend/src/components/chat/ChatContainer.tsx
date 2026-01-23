import { useRef, useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { useAppStore } from '@/store'
import type { ChatMessage as ChatMessageType } from '@/types'

const ChatContainer = () => {
  const { chatMessages, addChatMessage } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const simulateAIResponse = (userMessage: string): string => {
    // Simulated AI responses based on user input
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes('reconcile') || lowerMessage.includes('bank')) {
      return `I've analyzed your request. To reconcile bank statements, I'll need:

1. **Bank Statement File** - CSV or Excel format
2. **Accounting Export** - Your internal transaction records

Please upload your files using the attachment button, or describe the data sources you'd like to use.

I can help with:
- Auto-detecting column types
- Suggesting field mappings
- Setting up matching rules
- Identifying exceptions`
    }

    if (lowerMessage.includes('exception')) {
      return `I found **23 pending exceptions** in your recent reconciliations:

- **Critical (5)**: Amount mismatches > $1,000
- **Warning (12)**: Missing records in source system
- **Info (6)**: Date variances within tolerance

Would you like me to show the details or suggest resolutions for the critical ones first?`
    }

    if (lowerMessage.includes('rule')) {
      return `I can help you create matching rules. Here are some common patterns:

1. **Exact Match** - Fields must match exactly
2. **Fuzzy Match** - Allow for minor variations
3. **Date Tolerance** - Match within ±N days
4. **Amount Tolerance** - Match within ±$X or ±%

What type of rule would you like to create?`
    }

    return `I understand you'd like help with: "${userMessage}"

I'm your AI reconciliation assistant. I can help you:
- Upload and analyze data files
- Suggest field mappings between systems
- Create and manage matching rules
- Resolve exceptions automatically

What would you like to do?`
  }

  const handleSendMessage = (content: string) => {
    const userMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }

    addChatMessage(userMessage)
    setIsLoading(true)

    // Simulate AI response with delay
    setTimeout(() => {
      const aiResponse: ChatMessageType = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: simulateAIResponse(content),
        timestamp: new Date().toISOString(),
      }
      addChatMessage(aiResponse)
      setIsLoading(false)
    }, 1000)
  }

  const handleFileUpload = (files: FileList) => {
    const fileNames = Array.from(files).map((f) => f.name).join(', ')
    handleSendMessage(`I've uploaded: ${fileNames}`)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {chatMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">
              Welcome to Smart Reconciliation
            </h2>
            <p className="mb-6 max-w-md text-muted-foreground">
              I'm your AI-powered reconciliation assistant. Upload your data files
              or describe what you need, and I'll help you match and verify
              transactions across systems.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                'Reconcile my bank statement with accounting',
                'Show me pending exceptions',
                'Help me create a matching rule',
                'What can you do?',
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="rounded-lg border p-3 text-left text-sm transition-colors hover:bg-secondary"
                  aria-label={`Start conversation with: ${prompt}`}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {chatMessages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex gap-3 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                  <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground">
                    AI is thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUpload}
        isLoading={isLoading}
      />
    </div>
  )
}

export { ChatContainer }
