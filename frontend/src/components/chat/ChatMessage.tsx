import type { ReactNode } from 'react'
import { Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui'
import type { ChatMessage as ChatMessageType } from '@/types'

interface ChatMessageProps {
  message: ChatMessageType
}

const renderInlineMarkdown = (text: string): ReactNode[] => {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean)

  return tokens.map((token, index) => {
    if (token.startsWith('`') && token.endsWith('`') && token.length > 1) {
      return (
        <code
          key={`inline-code-${index}`}
          className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[12px] text-neutral-900"
        >
          {token.slice(1, -1)}
        </code>
      )
    }

    if (token.startsWith('**') && token.endsWith('**') && token.length > 3) {
      return (
        <strong key={`inline-bold-${index}`} className="font-semibold text-neutral-900">
          {token.slice(2, -2)}
        </strong>
      )
    }

    return token
  })
}

const normalizeContentForDisplay = (content: string): string => {
  const normalized = content.replace(/\r\n/g, '\n')
  const lines = normalized.split('\n')
  const nonEmptyLines = lines.map((line) => line.trim()).filter(Boolean)

  if (nonEmptyLines.length < 12) {
    return normalized
  }

  const shortLineCount = nonEmptyLines.filter((line) => {
    if (/^#{1,6}\s+/.test(line)) return false
    if (/^[-*]\s+/.test(line)) return false
    if (/^\d+\.\s+/.test(line)) return false
    return line.length <= 24
  }).length

  const shortLineRatio = shortLineCount / nonEmptyLines.length
  if (shortLineRatio < 0.65) {
    return normalized
  }

  // Recover from malformed streams where tokens are split with line breaks.
  return nonEmptyLines
    .join(' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

const AssistantMessageContent = ({ content }: { content: string }) => {
  const lines = normalizeContentForDisplay(content).split('\n')
  const blocks: ReactNode[] = []
  let listItems: string[] = []
  let listType: 'ul' | 'ol' | null = null
  let keyCounter = 0

  const flushList = () => {
    if (!listType || listItems.length === 0) {
      listType = null
      listItems = []
      return
    }

    if (listType === 'ul') {
      blocks.push(
        <ul key={`ul-${keyCounter++}`} className="list-disc space-y-1 pl-5">
          {listItems.map((item, itemIndex) => (
            <li key={`ul-item-${itemIndex}`} className="break-words [overflow-wrap:anywhere]">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      )
    } else {
      blocks.push(
        <ol key={`ol-${keyCounter++}`} className="list-decimal space-y-1 pl-5">
          {listItems.map((item, itemIndex) => (
            <li key={`ol-item-${itemIndex}`} className="break-words [overflow-wrap:anywhere]">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ol>
      )
    }

    listType = null
    listItems = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      flushList()
      continue
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      flushList()
      const headingLevel = Math.min(3, headingMatch[1].length)
      const headingText = headingMatch[2]
      const headingClass =
        headingLevel === 1
          ? 'text-base font-semibold'
          : headingLevel === 2
            ? 'text-sm font-semibold'
            : 'text-sm font-semibold text-neutral-800'

      blocks.push(
        <p
          key={`heading-${keyCounter++}`}
          className={cn(headingClass, 'break-words [overflow-wrap:anywhere]')}
        >
          {renderInlineMarkdown(headingText)}
        </p>
      )
      continue
    }

    const unorderedMatch = line.match(/^[-*]\s+(.*)$/)
    if (unorderedMatch) {
      if (listType === 'ol') flushList()
      listType = 'ul'
      listItems.push(unorderedMatch[1])
      continue
    }

    const orderedMatch = line.match(/^\d+\.\s+(.*)$/)
    if (orderedMatch) {
      if (listType === 'ul') flushList()
      listType = 'ol'
      listItems.push(orderedMatch[1])
      continue
    }

    flushList()
    blocks.push(
      <p key={`p-${keyCounter++}`} className="break-words [overflow-wrap:anywhere]">
        {renderInlineMarkdown(line)}
      </p>
    )
  }

  flushList()

  return <div className="space-y-2 text-sm leading-relaxed">{blocks}</div>
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg p-3 transition-smooth',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <Avatar
        fallback={isUser ? 'U' : 'AI'}
        className={cn(
          'h-10 w-10 shrink-0 ring-2',
          isUser
            ? 'bg-brand-500 ring-brand-200'
            : 'bg-neutral-700 ring-neutral-200'
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
          'min-w-0 max-w-[75%] rounded-lg border px-4 py-3',
          isUser
            ? 'border-brand-300 bg-brand-50 text-neutral-900'
            : 'border-neutral-200 bg-white text-neutral-900'
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed [overflow-wrap:anywhere]">
            {message.content}
          </p>
        ) : (
          <AssistantMessageContent content={message.content} />
        )}
        <p
          className={cn(
            'mt-2 text-xs font-mono',
            isUser ? 'text-brand-700/80' : 'text-neutral-500'
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}

export { ChatMessage, AssistantMessageContent }
