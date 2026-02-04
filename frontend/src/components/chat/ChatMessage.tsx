import { Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui'
import type { ChatMessage as ChatMessageType } from '@/types'

interface ChatMessageProps {
  message: ChatMessageType
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-xl transition-all',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <Avatar
        fallback={isUser ? 'U' : 'AI'}
        className={cn(
          'h-10 w-10 shrink-0 ring-2',
          isUser
            ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 ring-cyan-500/50'
            : 'gradient-neural ring-violet-500/50 shadow-glow-violet'
        )}
      >
        <div className="flex h-full w-full items-center justify-center">
          {isUser ? (
            <User className="h-5 w-5 text-white" />
          ) : (
            <Bot className="h-5 w-5 text-white" />
          )}
        </div>
      </Avatar>

      <div
        className={cn(
          'max-w-[70%] rounded-xl px-4 py-3 transition-all',
          isUser
            ? 'bg-gradient-to-br from-cyan-600/30 to-cyan-700/30 border border-cyan-500/50 text-white'
            : 'glass border border-violet-500/30 text-gray-100 hover:border-violet-400/50 hover:shadow-glow-violet'
        )}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        <p
          className={cn(
            'mt-2 text-xs font-mono',
            isUser ? 'text-cyan-300/70' : 'text-gray-500'
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}

export { ChatMessage }
