import { useRef, useEffect, useState, useCallback } from 'react'
import { Sparkles, AlertCircle, MessageSquare, FileText, List, HelpCircle } from 'lucide-react'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { useAppStore } from '@/store'
import type { ChatMessage as ChatMessageType } from '@/types'
import { useUploadFile } from '@/services/hooks'
import { streamPost } from '@/services/api'

const ChatContainer = () => {
  const { chatMessages, addChatMessage } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const uploadFile = useUploadFile()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, streamingContent])

  const handleSendMessage = useCallback(
    async (content: string) => {
      setError(null)

      const userMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      }
      addChatMessage(userMessage)
      setIsLoading(true)
      setStreamingContent('')

      let accumulated = ''

      await streamPost(
        '/chat/stream',
        { message: content },
        (chunk) => {
          accumulated += chunk
          setStreamingContent(accumulated)
        },
        () => {
          const aiResponse: ChatMessageType = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: accumulated || 'No response received',
            timestamp: new Date().toISOString(),
          }
          addChatMessage(aiResponse)
          setStreamingContent(null)
          setIsLoading(false)
        },
        (err) => {
          const errorMessage = err.message || 'Failed to get AI response'
          setError(errorMessage)
          const errorResponse: ChatMessageType = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Unable to reach the AI assistant: ${errorMessage}. Please check your connection and try again.`,
            timestamp: new Date().toISOString(),
          }
          addChatMessage(errorResponse)
          setStreamingContent(null)
          setIsLoading(false)
        }
      )
    },
    [addChatMessage]
  )

  const handleFileUpload = async (files: FileList) => {
    setError(null)
    const fileArray = Array.from(files)

    for (const file of fileArray) {
      const userMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        role: 'user',
        content: `📁 Uploading: ${file.name}`,
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
            `**File Summary:**\n` +
            `• Rows: ${uploadedFile?.rowCount ?? 'N/A'}\n` +
            `• Columns: ${uploadedFile?.columnCount ?? 'N/A'}\n` +
            `• Size: ${(file.size / 1024).toFixed(1)} KB\n\n` +
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
    <div className="flex h-full flex-col">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border-b border-red-500/30 px-4 py-2 text-sm text-red-400 shrink-0">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-xs underline hover:text-red-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {chatMessages.length === 0 && streamingContent === null ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20">
              <MessageSquare className="h-8 w-8 text-violet-400" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-white">
              AI Reconciliation Assistant
            </h2>
            <p className="mb-8 max-w-md text-sm text-gray-400 leading-relaxed">
              Ask questions about your reconciliation data, get help analysing exceptions,
              or request assistance creating matching rules.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 w-full max-w-xl">
              {[
                { icon: FileText, text: 'Reconcile bank statement with ledger' },
                { icon: AlertCircle, text: 'Analyse pending exceptions' },
                { icon: List, text: 'Create a matching rule' },
                { icon: HelpCircle, text: 'What can you help me with?' },
              ].map(({ icon: Icon, text }) => (
                <button
                  key={text}
                  onClick={() => handleSendMessage(text)}
                  className="glass border border-space-500 rounded-xl p-4 text-left text-sm transition-all hover:border-violet-500/50 hover:bg-violet-500/5 group"
                  aria-label={`Start conversation: ${text}`}
                  disabled={isLoading}
                >
                  <Icon className="h-4 w-4 text-gray-400 mb-2 group-hover:text-violet-400 transition-colors" />
                  <span className="text-gray-300 group-hover:text-white transition-colors">{text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-4">
            {chatMessages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {/* Live streaming message */}
            {streamingContent !== null && (
              <div className="flex gap-3 p-4 glass rounded-xl border border-violet-500/20">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/20 border border-violet-500/30">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                </div>
                <div className="flex-1 text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {streamingContent}
                  <span className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 animate-pulse" />
                </div>
              </div>
            )}

            {/* Thinking indicator */}
            {isLoading && streamingContent === '' && (
              <div className="flex gap-3 p-4 glass rounded-xl border border-violet-500/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20 border border-violet-500/30">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:300ms]" />
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
