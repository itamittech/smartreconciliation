import { useState, useEffect } from 'react'
import { Modal, Button } from '@/components/ui'
import { useUploadKnowledge } from '@/services/hooks'
import type { KnowledgeDomain, DomainDetectionResult } from '@/services/types'

const DOMAINS: KnowledgeDomain[] = [
  'BANKING',
  'TRADING',
  'ACCOUNTS_PAYABLE',
  'INVENTORY',
  'INTERCOMPANY',
  'ECOMMERCE',
  'TECHNICAL',
  'GENERAL',
]

const DOMAIN_LABELS: Record<KnowledgeDomain, string> = {
  BANKING: 'Banking',
  TRADING: 'Trading',
  ACCOUNTS_PAYABLE: 'Accounts Payable',
  INVENTORY: 'Inventory',
  INTERCOMPANY: 'Intercompany',
  ECOMMERCE: 'E-Commerce',
  TECHNICAL: 'Technical',
  GENERAL: 'General',
}

interface Props {
  file: File | null
  detected: DomainDetectionResult | null
  isOpen: boolean
  onClose: () => void
  onUploaded: () => void
}

export function DomainConfirmModal({ file, detected, isOpen, onClose, onUploaded }: Props) {
  const [selectedDomain, setSelectedDomain] = useState<KnowledgeDomain>('GENERAL')
  const uploadKnowledge = useUploadKnowledge()

  useEffect(() => {
    if (detected) setSelectedDomain(detected.domain)
  }, [detected])

  const handleConfirm = () => {
    if (!file) return
    uploadKnowledge.mutate(
      { file, domain: selectedDomain },
      { onSuccess: onUploaded }
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Knowledge Domain" size="sm">
      <div className="space-y-4">
        {file && (
          <p className="text-sm text-muted-foreground">
            File: <span className="font-medium text-foreground">{file.name}</span>
          </p>
        )}

        {detected && detected.confidence > 0 && (
          <div className="rounded-md bg-primary/10 px-3 py-2 text-sm">
            AI detected: <strong>{DOMAIN_LABELS[detected.domain]}</strong>{' '}
            <span className="text-muted-foreground">
              ({Math.round(detected.confidence * 100)}% confidence)
            </span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="domain-select">
            Domain
          </label>
          <select
            id="domain-select"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value as KnowledgeDomain)}
          >
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {DOMAIN_LABELS[d]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={uploadKnowledge.isPending}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={uploadKnowledge.isPending}>
            {uploadKnowledge.isPending ? 'Uploading...' : 'Confirm & Upload'}
          </Button>
        </div>

        {uploadKnowledge.isError && (
          <p className="text-xs text-destructive">
            Upload failed. Please try again.
          </p>
        )}
      </div>
    </Modal>
  )
}
