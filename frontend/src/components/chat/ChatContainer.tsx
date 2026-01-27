import { useRef, useEffect, useState } from 'react'
import { Sparkles, AlertCircle } from 'lucide-react'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { useAppStore } from '@/store'
import type { ChatMessage as ChatMessageType } from '@/types'
import { useQuickChat } from '@/services/hooks'

const ChatContainer = () => {
  const { chatMessages, addChatMessage } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const quickChat = useQuickChat()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const handleSendMessage = async (content: string) => {
    setError(null)

    const userMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }

    addChatMessage(userMessage)
    setIsLoading(true)

    try {
      const response = await quickChat.mutateAsync({ message: content })

      const aiResponse: ChatMessageType = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.data?.response || 'No response received',
        timestamp: new Date().toISOString(),
      }
      addChatMessage(aiResponse)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI response'
      setError(errorMessage)

      // Add error as assistant message
      const errorResponse: ChatMessageType = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}. Please make sure the backend is running.`,
        timestamp: new Date().toISOString(),
      }
      addChatMessage(errorResponse)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (files: FileList) => {
    const fileNames = Array.from(files).map((f) => f.name).join(', ')
    handleSendMessage(`I've uploaded: ${fileNames}`)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

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
                  disabled={isLoading}
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
