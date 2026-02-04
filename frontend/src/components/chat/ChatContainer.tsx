import { useRef, useEffect, useState } from 'react'
import { Sparkles, AlertCircle, Brain, Zap } from 'lucide-react'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { useAppStore } from '@/store'
import type { ChatMessage as ChatMessageType } from '@/types'
import { useQuickChat, useUploadFile } from '@/services/hooks'

const ChatContainer = () => {
  const { chatMessages, addChatMessage } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const quickChat = useQuickChat()
  const uploadFile = useUploadFile()

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

      const errorResponse: ChatMessageType = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Neural network error: ${errorMessage}. Verify backend connectivity.`,
        timestamp: new Date().toISOString(),
      }
      addChatMessage(errorResponse)
    } finally {
      setIsLoading(false)
    }
  }

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
          content: `✨ File "${uploadedFile?.originalFilename || file.name}" analyzed successfully!\n\n` +
            `📊 **Data Matrix:**\n` +
            `• Rows: ${uploadedFile?.rowCount || 'Computing...'}\n` +
            `• Columns: ${uploadedFile?.columnCount || 'Computing...'}\n` +
            `• Size: ${(file.size / 1024).toFixed(1)} KB\n\n` +
            `Ready for quantum reconciliation processing.`,
          timestamp: new Date().toISOString(),
        }
        addChatMessage(successMessage)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload file'
        setError(errorMessage)

        const errorResponse: ChatMessageType = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `❌ Upload failed for "${file.name}": ${errorMessage}`,
          timestamp: new Date().toISOString(),
        }
        addChatMessage(errorResponse)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="flex h-full flex-col relative">
      {/* Particle background */}
      <div className="absolute inset-0 particles opacity-40 pointer-events-none" />

      {/* Error Banner with glow */}
      {error && (
        <div className="flex items-center gap-2 bg-pink-500/20 border-b border-pink-500/50 px-4 py-2 text-sm text-pink-300 backdrop-blur-md relative z-10">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-xs underline hover:text-pink-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto relative z-10">
        {chatMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-6 rounded-2xl gradient-neural p-6 shadow-glow-violet animate-pulse-glow">
              <Brain className="h-12 w-12 text-white" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gradient-neural">
              Quantum AI Intelligence
            </h2>
            <p className="mb-8 max-w-md text-gray-400 leading-relaxed">
              Neural network-powered reconciliation assistant. Upload data matrices
              or describe your requirements—I'll process transactions with quantum precision.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 w-full max-w-xl">
              {[
                { icon: Zap, text: 'Reconcile bank statement with ledger' },
                { icon: AlertCircle, text: 'Analyze pending exceptions' },
                { icon: Brain, text: 'Create intelligent matching rule' },
                { icon: Sparkles, text: 'What are your capabilities?' },
              ].map(({ icon: Icon, text }) => (
                <button
                  key={text}
                  onClick={() => handleSendMessage(text)}
                  className="glass border border-violet-500/30 rounded-xl p-4 text-left text-sm transition-all hover:border-violet-400 hover:shadow-glow-violet hover:-translate-y-1 group"
                  aria-label={`Start conversation with: ${text}`}
                  disabled={isLoading}
                >
                  <Icon className="h-5 w-5 text-violet-400 mb-2 group-hover:text-violet-300" />
                  <span className="text-gray-300 group-hover:text-white">{text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-4">
            {chatMessages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex gap-3 p-4 glass rounded-xl border border-violet-500/30 animate-pulse-glow">
                <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-neural shadow-glow-violet">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-400 font-mono">
                    Neural processing...
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
