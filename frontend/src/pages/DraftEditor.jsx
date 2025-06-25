import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from '../translations'
import { 
  Save, 
  Copy, 
  RotateCcw, 
  ArrowLeft,
  Loader2,
  Lightbulb,
  Check
} from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

const DraftEditor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, language } = useTranslation()
  const [draft, setDraft] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)

  // Memoize placeholder to avoid editor recreation
  const placeholder = useMemo(() => t('draftEditor.placeholder'), [t])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      // Handle content changes here
    },
  }, [language])

  // Load draft data (only depends on id)
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const res = await fetch(`/api/drafts/${id}`)
        if (!res.ok) throw new Error('Not found')
        const foundDraft = await res.json()
        setDraft(foundDraft)
      } catch (error) {
        setDraft({ id, content: '', type: 'announcement', createdAt: new Date().toISOString() })
      }
    }
    loadDraft()
  }, [id])

  // Sync content when both editor and draft are ready
  useEffect(() => {
    if (editor && draft) {
      try {
        editor.commands.setContent(draft.content || '')
        setIsLoading(false)
      } catch (error) {
        console.error('Error setting editor content:', error)
        setIsLoading(false)
      }
    }
  }, [editor, draft])

  // Reset loading state when id changes
  useEffect(() => {
    setIsLoading(true)
  }, [id])

  const handleSave = async () => {
    if (!editor) return
    setIsSaving(true)
    try {
      const updatedDraft = {
        ...draft,
        content: editor.getHTML(),
        updatedAt: new Date().toISOString(),
        type: draft.type || 'announcement',
      }
      setDraft(updatedDraft)
      await fetch(`/api/drafts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDraft)
      })
      setTimeout(() => setIsSaving(false), 1000)
    } catch (error) {
      setIsSaving(false)
    }
  }

  const handleCopy = () => {
    if (editor) {
      navigator.clipboard.writeText(editor.getText())
    }
  }

  const handleRegenerate = async () => {
    if (!editor) return
    
    // Could call API to regenerate content here
    const currentContent = editor.getText()
    
    // Simulate regeneration
    const regeneratedContent = `Regenerated content:

${currentContent}

This is a regenerated version based on your current content. Please adjust as needed.`
    
    editor.commands.setContent(regeneratedContent)
  }

  const generateSuggestions = async () => {
    if (!editor) return
    
    setIsGeneratingSuggestions(true)
    setShowSuggestions(true)
    
    try {
      // Simulate API call to generate suggestions
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockSuggestions = [
        {
          id: 1,
          original: 'Please make necessary modifications and adjustments according to actual circumstances',
          suggestion: 'Please make appropriate modifications and adjustments based on specific circumstances',
          reason: t('draftEditor.moreFormal')
        },
        {
          id: 2,
          original: 'If you have any questions',
          suggestion: 'If you have any questions or need further clarification',
          reason: t('draftEditor.moreDetailed')
        },
        {
          id: 3,
          original: 'contact the relevant department promptly',
          suggestion: 'please contact the relevant responsible department promptly',
          reason: t('draftEditor.morePolite')
        }
      ]
      
      setSuggestions(mockSuggestions)
    } catch (error) {
      console.error(t('draftEditor.suggestionsError'), error)
    } finally {
      setIsGeneratingSuggestions(false)
    }
  }

  const applySuggestion = (suggestion) => {
    if (!editor) return
    
    const currentContent = editor.getHTML()
    const updatedContent = currentContent.replace(
      suggestion.original,
      suggestion.suggestion
    )
    
    editor.commands.setContent(updatedContent)
  }

  // 渲染标题时用 type key 动态翻译
  const getDraftTitle = () => {
    if (!draft) return ''
    if (draft.type && t(`documentTypes.${draft.type}`) !== `documentTypes.${draft.type}`) {
      return t(`documentTypes.${draft.type}`)
    }
    // 兼容旧数据
    return draft.title || t('draftEditor.title')
  }

  if (isLoading || !editor || !draft) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            {t('draftEditor.title')}
          </h1>
          <p className="text-lg text-neutral-600">
            {draft.title}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="btn-secondary"
          >
            {t('draftEditor.copy')}
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
            disabled={isSaving}
          >
            {isSaving ? t('draftEditor.saving') : t('draftEditor.save')}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="generated-content" dangerouslySetInnerHTML={{ __html: draft.content }} />
      </div>
    </div>
  )
}

export default DraftEditor 