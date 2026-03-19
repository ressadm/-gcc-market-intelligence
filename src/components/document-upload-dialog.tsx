'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatFileSize } from '@/lib/format'
import type { DocumentType } from '@/lib/types'

interface DocumentUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: File | null
  onSubmit: (metadata: {
    title: string
    document_type: DocumentType
    company_id?: string | null
  }) => Promise<boolean>
}

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'pitch_deck', label: 'Pitch Deck' },
  { value: 'cap_table', label: 'Cap Table' },
  { value: 'financial_model', label: 'Financial Model' },
  { value: 'legal', label: 'Legal' },
  { value: 'other', label: 'Other' },
]

export function DocumentUploadDialog({ open, onOpenChange, file, onSubmit }: DocumentUploadDialogProps) {
  const [title, setTitle] = useState('')
  const [documentType, setDocumentType] = useState<DocumentType>('other')
  const [companyId, setCompanyId] = useState<string>('')
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([])
  const [saving, setSaving] = useState(false)

  // Pre-fill title from filename
  useEffect(() => {
    if (file) {
      const name = file.name.replace(/\.[^.]+$/, '') // Remove extension
      setTitle(name)
    }
  }, [file])

  // Load companies for optional association
  useEffect(() => {
    if (!open) return
    supabase
      .from('portfolio_summary')
      .select('company_id, name')
      .order('name')
      .then(({ data }) => {
        if (data) {
          setCompanies(data.map(c => ({ id: c.company_id, name: c.name })))
        }
      })
  }, [open])

  function reset() {
    setTitle('')
    setDocumentType('other')
    setCompanyId('')
  }

  async function handleSubmit() {
    if (!title.trim()) return
    setSaving(true)
    const success = await onSubmit({
      title: title.trim(),
      document_type: documentType,
      company_id: companyId || null,
    })
    setSaving(false)
    if (success) {
      reset()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* File info */}
          {file && (
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
              <span className="font-medium text-foreground">{file.name}</span>
              <span className="ml-2 text-xs">{formatFileSize(file.size)}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="doc-title" className="text-xs">Title</Label>
            <Input
              id="doc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title"
            />
          </div>

          {/* Document Type */}
          <div className="space-y-1.5">
            <Label className="text-xs">Document Type</Label>
            <Select value={documentType} onValueChange={(v) => setDocumentType(v as DocumentType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map(dt => (
                  <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Company (optional) */}
          <div className="space-y-1.5">
            <Label className="text-xs">Company (optional)</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {companies.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !title.trim()}>
            {saving && <Loader2 size={14} className="animate-spin mr-1.5" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
