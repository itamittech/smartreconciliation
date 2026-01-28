import { useState, useRef } from 'react'
import {
  Search,
  FolderOpen,
  Upload,
  Eye,
  Trash2,
  Loader2,
  AlertCircle,
  FileText,
  X,
} from 'lucide-react'
import { Button, Input, Card, Badge } from '@/components/ui'
import { useFiles, useDeleteFile, useUploadFile, useFilePreview } from '@/services/hooks'

const FilesPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [previewFileId, setPreviewFileId] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: filesResponse, isLoading, isError, error } = useFiles()
  const deleteFile = useDeleteFile()
  const uploadFile = useUploadFile()

  const files = filesResponse?.data || []

  const filteredFiles = files.filter((file) =>
    file.originalFilename.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile.mutate({ file })
    }
    // Reset input so same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this file?')) {
      deleteFile.mutate(id)
    }
  }

  const handlePreview = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setPreviewFileId(id)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'success' | 'warning' | 'destructive' => {
    switch (status.toUpperCase()) {
      case 'PROCESSED':
      case 'READY':
        return 'success'
      case 'PROCESSING':
        return 'warning'
      case 'FAILED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading files...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <p className="font-semibold text-lg">Failed to load files</p>
            <p className="text-muted-foreground text-sm">
              {error instanceof Error ? error.message : 'Unable to connect to backend API'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Uploaded Files</h2>
            <p className="text-sm text-muted-foreground">
              Manage your data files for reconciliation
            </p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button onClick={handleUploadClick} disabled={uploadFile.isPending}>
              {uploadFile.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Upload File
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              aria-label="Search files"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Rows
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Columns
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file) => (
                  <tr
                    key={file.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-secondary p-2">
                          <FileText className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{file.originalFilename}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatFileSize(file.fileSize)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {file.rowCount?.toLocaleString() || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {file.columnCount || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusVariant(file.status)}>
                        {file.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Preview file"
                          onClick={(e) => handlePreview(e, file.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete file"
                          onClick={(e) => handleDelete(e, file.id)}
                          disabled={deleteFile.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredFiles.length === 0 && (
              <div className="py-12 text-center">
                <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  {files.length === 0
                    ? 'No files uploaded yet. Upload your first file!'
                    : 'No files found matching your search'
                  }
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Preview Modal */}
      {previewFileId && (
        <FilePreviewModal
          fileId={previewFileId}
          onClose={() => setPreviewFileId(null)}
        />
      )}
    </div>
  )
}

interface FilePreviewModalProps {
  fileId: number
  onClose: () => void
}

const FilePreviewModal = ({ fileId, onClose }: FilePreviewModalProps) => {
  const { data: previewResponse, isLoading, isError, error } = useFilePreview(fileId, 10)
  const preview = previewResponse?.data

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative max-h-[80vh] w-full max-w-4xl overflow-hidden rounded-lg bg-background shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold">File Preview (First 10 rows)</h3>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close preview">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(80vh-80px)] overflow-auto p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-muted-foreground">
                {error instanceof Error ? error.message : 'Failed to load preview'}
              </p>
            </div>
          )}

          {preview && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {preview.headers?.map((header, idx) => (
                      <th
                        key={idx}
                        className="whitespace-nowrap px-3 py-2 text-left font-medium text-muted-foreground"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows?.map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-b">
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className="whitespace-nowrap px-3 py-2"
                        >
                          {cell ?? '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!preview.rows || preview.rows.length === 0) && (
                <p className="py-8 text-center text-muted-foreground">No data to preview</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { FilesPage }
