'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Document, DocumentType } from '@/lib/types'

interface UploadMetadata {
  title: string
  document_type: DocumentType
  company_id?: string | null
  deal_id?: string | null
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('documents')
      .select('*, companies(name)')
      .order('created_at', { ascending: false })

    if (err) {
      // Table might not exist yet
      setError(err.message)
      setDocuments([])
      setIsLoading(false)
      return
    }

    const mapped: Document[] = (data || []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      title: row.title as string,
      file_name: row.file_name as string,
      file_size: row.file_size as number | null,
      file_type: row.file_type as string | null,
      storage_path: row.storage_path as string,
      company_id: row.company_id as string | null,
      deal_id: row.deal_id as string | null,
      document_type: (row.document_type as DocumentType) || 'other',
      uploaded_by: row.uploaded_by as string | null,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      company_name: (row.companies as Record<string, unknown> | null)?.name as string | null,
    }))

    setDocuments(mapped)
    setIsLoading(false)
  }, [])

  useEffect(() => { fetchDocuments() }, [fetchDocuments])

  const uploadDocument = useCallback(async (file: File, metadata: UploadMetadata): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id

    // Generate unique path
    const ext = file.name.split('.').pop() || 'bin'
    const storagePath = `${userId || 'anonymous'}/${Date.now()}-${file.name}`

    // Upload to storage
    const { error: uploadErr } = await supabase.storage
      .from('angelos-documents')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadErr) {
      setError(`Upload failed: ${uploadErr.message}`)
      return false
    }

    // Insert metadata row
    const { error: insertErr } = await supabase
      .from('documents')
      .insert({
        title: metadata.title,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type || ext,
        storage_path: storagePath,
        company_id: metadata.company_id || null,
        deal_id: metadata.deal_id || null,
        document_type: metadata.document_type,
        uploaded_by: userId,
      })

    if (insertErr) {
      // Rollback: remove uploaded file
      await supabase.storage.from('angelos-documents').remove([storagePath])
      setError(`Metadata save failed: ${insertErr.message}`)
      return false
    }

    await fetchDocuments()
    return true
  }, [fetchDocuments])

  const deleteDocument = useCallback(async (id: string, storagePath: string): Promise<boolean> => {
    const { error: storageErr } = await supabase.storage
      .from('angelos-documents')
      .remove([storagePath])

    if (storageErr) {
      setError(`Delete from storage failed: ${storageErr.message}`)
      return false
    }

    const { error: dbErr } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)

    if (dbErr) {
      setError(`Delete from database failed: ${dbErr.message}`)
      return false
    }

    await fetchDocuments()
    return true
  }, [fetchDocuments])

  const getDownloadUrl = useCallback(async (storagePath: string): Promise<string | null> => {
    const { data, error: err } = await supabase.storage
      .from('angelos-documents')
      .createSignedUrl(storagePath, 3600) // 1 hour

    if (err) {
      setError(`Download URL failed: ${err.message}`)
      return null
    }

    return data.signedUrl
  }, [])

  return { documents, isLoading, error, uploadDocument, deleteDocument, getDownloadUrl, refetch: fetchDocuments }
}
