import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'
import { useKnowledgeDocuments, useDeleteKnowledge } from '@/services/hooks'
import type { KnowledgeDomain } from '@/services/types'

const DOMAIN_COLORS: Record<KnowledgeDomain, string> = {
  BANKING: 'bg-blue-100 text-blue-800',
  TRADING: 'bg-purple-100 text-purple-800',
  ACCOUNTS_PAYABLE: 'bg-amber-100 text-amber-800',
  INVENTORY: 'bg-green-100 text-green-800',
  INTERCOMPANY: 'bg-orange-100 text-orange-800',
  ECOMMERCE: 'bg-pink-100 text-pink-800',
  TECHNICAL: 'bg-gray-100 text-gray-800',
  GENERAL: 'bg-slate-100 text-slate-800',
}

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

export function KnowledgeDocumentList() {
  const { data, isLoading } = useKnowledgeDocuments()
  const deleteKnowledge = useDeleteKnowledge()
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const docs = data?.data ?? []

  const handleDelete = (id: number) => {
    deleteKnowledge.mutate(id, {
      onSuccess: () => setConfirmId(null),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="py-6 text-center text-sm text-muted-foreground">Loading...</div>
        )}

        {!isLoading && docs.length === 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No knowledge documents yet. Upload one above.
          </div>
        )}

        {docs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Title</th>
                  <th className="pb-2 font-medium">Domain</th>
                  <th className="pb-2 font-medium">Chunks</th>
                  <th className="pb-2 font-medium">Uploaded</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{doc.title}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${DOMAIN_COLORS[doc.domain]}`}
                      >
                        {DOMAIN_LABELS[doc.domain]}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{doc.chunkCount}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      {confirmId === doc.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(doc.id)}
                            disabled={deleteKnowledge.isPending}
                          >
                            {deleteKnowledge.isPending ? '...' : 'Delete'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmId(doc.id)}
                          aria-label="Delete document"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
