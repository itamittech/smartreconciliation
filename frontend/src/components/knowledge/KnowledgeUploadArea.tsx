import { useRef, useCallback, useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDetectDomain } from '@/services/hooks'
import type { DomainDetectionResult } from '@/services/types'

interface Props {
  onDetected: (file: File, result: DomainDetectionResult) => void
}

export function KnowledgeUploadArea({ onDetected }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const detectDomain = useDetectDomain()

  const processFile = useCallback(
    async (file: File) => {
      const text = await file.text()
      detectDomain.mutate(text.slice(0, 2000), {
        onSuccess: (res) => onDetected(file, res.data),
        onError: () => onDetected(file, { domain: 'GENERAL', confidence: 0 }),
      })
    },
    [detectDomain, onDetected]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !detectDomain.isPending && inputRef.current?.click()}
      className={cn(
        'cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/30 hover:border-primary/50',
        detectDomain.isPending && 'pointer-events-none'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".md,.pdf,.txt"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) processFile(file)
          e.target.value = ''
        }}
      />
      {detectDomain.isPending ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Detecting domain...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Drop a knowledge file here, or click to browse</p>
          <p className="text-xs text-muted-foreground">Supports .md · .pdf · .txt — up to 100 MB</p>
        </div>
      )}
    </div>
  )
}
