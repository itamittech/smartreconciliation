import { useRef, useEffect, useState, useCallback } from 'react'
import { Sparkles, AlertCircle, MessageSquare, FileText, List, HelpCircle } from 'lucide-react'
import { ChatMessage, AssistantMessageContent } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { useAppStore } from '@/store'
import type { ChatMessage as ChatMessageType } from '@/types'
import { useUploadFile } from '@/services/hooks'
import { post } from '@/services/api'
import type { ChatResponse as ApiChatResponse } from '@/services/types'

const ChatContainer = () => {
  const { chatMessages, addChatMessage } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingIntervalRef = useRef<number | null>(null)
  const typingQueueRef = useRef('')
  const renderedStreamingRef = useRef('')
  const typingDrainResolverRef = useRef<(() => void) | null>(null)
  const uploadFile = useUploadFile()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, streamingContent])

  const stopTyping = useCallback(() => {
    if (typingIntervalRef.current !== null) {
      window.clearInterval(typingIntervalRef.current)
      typingIntervalRef.current = null
    }
  }, [])

  const resolveTypingDrain = useCallback(() => {
    if (typingDrainResolverRef.current) {
      typingDrainResolverRef.current()
      typingDrainResolverRef.current = null
    }
  }, [])

  const startTyping = useCallback(() => {
    if (typingIntervalRef.current !== null) {
      return
    }

    typingIntervalRef.current = window.setInterval(() => {
      if (!typingQueueRef.current) {
        stopTyping()
        resolveTypingDrain()
        return
      }

      const nextSlice = typingQueueRef.current.slice(0, 2)
      typingQueueRef.current = typingQueueRef.current.slice(nextSlice.length)
      renderedStreamingRef.current += nextSlice
      setStreamingContent(renderedStreamingRef.current)

      if (!typingQueueRef.current) {
        stopTyping()
        resolveTypingDrain()
      }
    }, 22)
  }, [resolveTypingDrain, stopTyping])

  const queueStreamingChunk = useCallback(
    (chunk: string) => {
      typingQueueRef.current += chunk
      startTyping()
    },
    [startTyping]
  )

  const waitForTypingToDrain = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (!typingQueueRef.current) {
        resolve()
        return
      }
      typingDrainResolverRef.current = resolve
    })
  }, [])

  const resetTypingState = useCallback(() => {
    stopTyping()
    typingQueueRef.current = ''
    renderedStreamingRef.current = ''
    resolveTypingDrain()
  }, [resolveTypingDrain, stopTyping])

  useEffect(() => {
    return () => {
      resetTypingState()
    }
  }, [resetTypingState])

  const handleSendMessage = useCallback(
    async (content: string) => {
      setError(null)
      resetTypingState()

      const userMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      }
      addChatMessage(userMessage)
      setIsLoading(true)
      setStreamingContent('')

      const appendAssistantMessage = (messageContent: string) => {
        const aiResponse: ChatMessageType = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: messageContent,
          timestamp: new Date().toISOString(),
        }
        addChatMessage(aiResponse)
      }

      try {
        const syncResponse = await post<ApiChatResponse>('/chat/message', {
          message: content,
          sessionId: activeSessionId ?? undefined,
        })

        const reply = syncResponse.data?.response
        if (syncResponse.data?.sessionId) {
          setActiveSessionId(syncResponse.data.sessionId)
        }

        if (!reply?.trim()) {
          appendAssistantMessage('No response received from the AI assistant. Please try again.')
          return
        }

        queueStreamingChunk(reply)
        await waitForTypingToDrain()
        appendAssistantMessage(reply)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get AI response'
        setError(errorMessage)
        const errorResponse: ChatMessageType = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Unable to reach the AI assistant: ${errorMessage}. Please check your connection and try again.`,
          timestamp: new Date().toISOString(),
        }
        addChatMessage(errorResponse)
      } finally {
        resetTypingState()
        setStreamingContent(null)
        setIsLoading(false)
      }
    },
    [activeSessionId, addChatMessage, queueStreamingChunk, resetTypingState, waitForTypingToDrain]
  )

  const handleFileUpload = async (files: FileList) => {
    setError(null)
    const fileArray = Array.from(files)

    for (const file of fileArray) {
      const userMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        role: 'user',
        content: `Uploading file: ${file.name}`,
        timestamp: new Date().toISOString(),
      }
      addChatMessage(userMessage)
      setIsLoading(true)

      try {
        const response = await uploadFile.mutateAsync({ file })
        const uploadedFile = response.data

        const successMessage: ChatMessageType = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content:
            `File "${uploadedFile?.originalFilename || file.name}" uploaded and parsed successfully.\n\n` +
            `File Summary:\n` +
            `- Rows: ${uploadedFile?.rowCount ?? 'N/A'}\n` +
            `- Columns: ${uploadedFile?.columnCount ?? 'N/A'}\n` +
            `- Size: ${(file.size / 1024).toFixed(1)} KB\n\n` +
            `You can now use this file in a reconciliation. Would you like help setting up a rule set or running a reconciliation?`,
          timestamp: new Date().toISOString(),
        }
        addChatMessage(successMessage)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload file'
        setError(errorMessage)

        const errorResponse: ChatMessageType = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Upload failed for "${file.name}": ${errorMessage}`,
          timestamp: new Date().toISOString(),
        }
        addChatMessage(errorResponse)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {error && (
        <div className="shrink-0 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-xs underline hover:text-destructive"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {chatMessages.length === 0 && streamingContent === null ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              AI Reconciliation Assistant
            </h2>
            <p className="mb-8 max-w-md text-sm leading-relaxed text-muted-foreground">
              Ask questions about your reconciliation data, get help analysing exceptions,
              or request assistance creating matching rules.
            </p>
            <div className="grid w-full max-w-xl gap-3 sm:grid-cols-2">
              {[
                { icon: FileText, text: 'Reconcile bank statement with ledger' },
                { icon: AlertCircle, text: 'Analyse pending exceptions' },
                { icon: List, text: 'Create a matching rule' },
                { icon: HelpCircle, text: 'What can you help me with?' },
              ].map(({ icon: Icon, text }) => (
                <button
                  key={text}
                  onClick={() => handleSendMessage(text)}
                  className="group rounded-lg border border-border bg-card p-4 text-left text-sm transition-smooth hover:border-primary/50 hover:bg-primary/5"
                  aria-label={`Start conversation: ${text}`}
                  disabled={isLoading}
                >
                  <Icon className="mb-2 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  <span className="text-foreground transition-colors group-hover:text-primary">{text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-1 overflow-x-hidden p-4">
            {chatMessages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {streamingContent !== null && (
              <div className="flex gap-3 rounded-lg border border-border bg-card p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-800 ring-2 ring-border shadow-sm">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1 text-foreground">
                  <AssistantMessageContent content={streamingContent} />
                  <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary" />
                </div>
              </div>
            )}

            {isLoading && streamingContent === '' && (
              <div className="flex gap-3 rounded-lg border border-border bg-card p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 ring-2 ring-border shadow-sm">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <ChatInput
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUpload}
        isLoading={isLoading}
      />
    </div>
  )
}

export { ChatContainer }
