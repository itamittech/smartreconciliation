import { useState, useRef } from 'react'
import { Send, Paperclip } from 'lucide-react'
import { Button, Input } from '@/components/ui'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  onFileUpload?: (files: FileList) => void
  isLoading?: boolean
}

const ChatInput = ({ onSendMessage, onFileUpload, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    onSendMessage(message.trim())
    setMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onFileUpload) {
      onFileUpload(e.target.files)
      e.target.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-space-600 glass-strong p-4 relative z-10">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.json,.xml"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload file"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleFileClick}
          aria-label="Attach file"
          className="hover:bg-space-750 hover:text-violet-400"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <Input
          type="text"
          placeholder="Ask about your reconciliation data, exceptions, or rules..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="flex-1"
          aria-label="Chat message"
        />

        <Button
          type="submit"
          disabled={!message.trim() || isLoading}
          aria-label="Send message"
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          Send
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {['Reconcile bank statement', 'Show exceptions', 'Create matching rule'].map(
          (suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setMessage(suggestion)}
              className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300 transition-all hover:bg-violet-500/20 hover:border-violet-400 hover:text-violet-200"
              aria-label={`Suggestion: ${suggestion}`}
            >
              {suggestion}
            </button>
          )
        )}
      </div>
    </form>
  )
}

export { ChatInput }
