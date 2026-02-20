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
    <form onSubmit={handleSubmit} className="border-t border-border bg-card p-6 shadow-lg">
      <div className="flex items-center gap-3">
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
          className="h-11 w-11 rounded-full hover:bg-muted"
        >
          <Paperclip className="h-5 w-5 text-muted-foreground" />
        </Button>

        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Type a message or use suggestions below..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1 rounded-2xl border-2 border-border bg-muted/30 focus-visible:border-primary px-5 h-12"
            aria-label="Chat message"
          />
        </div>

        <Button
          type="submit"
          disabled={!message.trim() || isLoading}
          aria-label="Send message"
          className="h-12 rounded-2xl px-6 font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Send className="h-4 w-4" />
          Send
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 pl-1">
        {['Reconcile bank statement', 'Show exceptions', 'Create matching rule'].map(
          (suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setMessage(suggestion)}
              className="rounded-full border border-border bg-muted/40 px-4 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary active:scale-95"
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
