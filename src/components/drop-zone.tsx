'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void
  accept?: string
  maxSizeMB?: number
  className?: string
}

const DEFAULT_ACCEPT = '.pdf,.png,.jpg,.jpeg,.xlsx,.csv,.doc,.docx'
const DEFAULT_MAX_MB = 50

export function DropZone({
  onFilesSelected,
  accept = DEFAULT_ACCEPT,
  maxSizeMB = DEFAULT_MAX_MB,
  className,
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return
    const maxBytes = maxSizeMB * 1024 * 1024
    const valid = Array.from(files).filter(f => f.size <= maxBytes)
    if (valid.length > 0) {
      onFilesSelected(valid)
    }
  }, [maxSizeMB, onFilesSelected])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
        isDragOver
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-muted-foreground/50',
        className
      )}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = '' // Reset for re-upload
        }}
      />
      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
      <p className="text-sm text-muted-foreground">
        Drop files here or{' '}
        <span className="text-primary font-medium">browse</span>
      </p>
      <p className="text-[10px] text-muted-foreground/50 mt-1">
        PDF, PNG, JPG, XLSX, CSV, DOC up to {maxSizeMB}MB
      </p>
    </div>
  )
}
