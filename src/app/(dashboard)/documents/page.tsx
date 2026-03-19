'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DropZone } from '@/components/drop-zone'
import { DocumentUploadDialog } from '@/components/document-upload-dialog'
import { useDocuments } from '@/hooks/use-documents'
import { formatDate, formatFileSize } from '@/lib/format'
import type { DocumentType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { FileText, Download, Trash2, AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

const DOC_TYPE_BADGES: Record<string, string> = {
  pitch_deck: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  cap_table: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  financial_model: 'bg-green-500/20 text-green-400 border-green-500/30',
  legal: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const DOC_TYPE_LABELS: Record<string, string> = {
  pitch_deck: 'Pitch Deck',
  cap_table: 'Cap Table',
  financial_model: 'Financial',
  legal: 'Legal',
  other: 'Other',
}

export default function DocumentsPage() {
  const { documents, isLoading, error, uploadDocument, deleteDocument, getDownloadUrl, refetch } = useDocuments()
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setPendingFile(files[0])
      setShowUploadDialog(true)
    }
  }, [])

  const handleUploadSubmit = useCallback(async (metadata: {
    title: string
    document_type: DocumentType
    company_id?: string | null
  }) => {
    if (!pendingFile) return false
    const success = await uploadDocument(pendingFile, metadata)
    if (success) {
      toast.success('Document uploaded')
      setPendingFile(null)
    } else {
      toast.error('Upload failed')
    }
    return success
  }, [pendingFile, uploadDocument])

  const handleDownload = useCallback(async (storagePath: string, fileName: string) => {
    const url = await getDownloadUrl(storagePath)
    if (url) {
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.target = '_blank'
      a.click()
    } else {
      toast.error('Failed to generate download link')
    }
  }, [getDownloadUrl])

  const handleDelete = useCallback(async (id: string, storagePath: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    const success = await deleteDocument(id, storagePath)
    if (success) {
      toast.success('Document deleted')
    } else {
      toast.error('Delete failed')
    }
  }, [deleteDocument])

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Documents</h1>
        <Button variant="ghost" size="sm" onClick={refetch} aria-label="Refresh">
          <RefreshCw size={14} />
        </Button>
      </div>

      {/* Upload zone */}
      <DropZone onFilesSelected={handleFilesSelected} />

      {/* Upload dialog */}
      <DocumentUploadDialog
        open={showUploadDialog}
        onOpenChange={(open) => {
          setShowUploadDialog(open)
          if (!open) setPendingFile(null)
        }}
        file={pendingFile}
        onSubmit={handleUploadSubmit}
      />

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <Card>
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !error && documents.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No documents yet</p>
          <p className="text-xs text-muted-foreground/50 mt-1">Drop a file above to get started</p>
        </div>
      )}

      {/* Documents table */}
      {!isLoading && documents.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Company</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Size</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="truncate">{doc.title}</p>
                          <p className="text-[10px] text-muted-foreground/60 truncate">{doc.file_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] px-1.5 py-0', DOC_TYPE_BADGES[doc.document_type] || DOC_TYPE_BADGES.other)}
                      >
                        {DOC_TYPE_LABELS[doc.document_type] || doc.document_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {doc.company_name || '—'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-right font-mono tabular-nums text-sm">
                      {formatFileSize(doc.file_size)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {formatDate(doc.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(doc.storage_path, doc.file_name)}
                          aria-label="Download"
                          title="Download"
                        >
                          <Download size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc.id, doc.storage_path, doc.title)}
                          aria-label="Delete"
                          title="Delete"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  )
}
