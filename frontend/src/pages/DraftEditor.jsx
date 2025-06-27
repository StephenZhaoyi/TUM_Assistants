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
  Check,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Trash2
} from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

const DraftEditor = () => {
  const { id } = useParams()
  const { t, language, isInitialized } = useTranslation()
  const navigate = useNavigate()
  const [draft, setDraft] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const [error, setError] = useState('')
  const [showCopySuccess, setShowCopySuccess] = useState(false)

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

  const handleCopy = async () => {
    try {
      const content = editor.getHTML()
      const div = document.createElement('div')
      div.innerHTML = content
      await navigator.clipboard.writeText(div.innerText)
      setShowCopySuccess(true)
      // 3秒后自动隐藏提示
      setTimeout(() => {
        setShowCopySuccess(false)
      }, 3000)
    } catch (err) {
      console.error('Copy failed:', err)
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Copy Success Toast */}
      {showCopySuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50">
          <Check className="h-4 w-4" />
          <span>{t('messages.copySuccess')}</span>
        </div>
      )}
      
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
            onClick={() => navigate(-1)}
            className="btn-outline flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('draftEditor.back')}
          </button>
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

      {/* Editor Toolbar */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-4 border-b border-neutral-200 pb-4">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded disabled:opacity-50"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded disabled:opacity-50"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>
          
          <div className="w-px h-6 bg-neutral-300 mx-2"></div>
          
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded ${editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'}`}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded ${editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'}`}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
          
          <div className="w-px h-6 bg-neutral-300 mx-2"></div>
          
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'}`}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'}`}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded ${editor.isActive('blockquote') ? 'bg-blue-100 text-blue-600' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'}`}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </button>
        </div>
        
        {/* Editor Content */}
        <div className="min-h-[400px] prose prose-sm max-w-none">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Suggestions Panel */}
      {showSuggestions && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              {t('draftEditor.suggestions')}
            </h3>
            <button
              onClick={() => setShowSuggestions(false)}
              className="text-neutral-500 hover:text-neutral-700"
            >
              ×
            </button>
          </div>
          
          {isGeneratingSuggestions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
              {t('draftEditor.generatingSuggestions')}
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700">
                      {suggestion.reason}
                    </span>
                    <button
                      onClick={() => applySuggestion(suggestion)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      {t('draftEditor.applySuggestion')}
                    </button>
                  </div>
                  <div className="text-sm text-neutral-600">
                    <div className="mb-1">
                      <strong>Original:</strong> {suggestion.original}
                    </div>
                    <div>
                      <strong>Suggestion:</strong> {suggestion.suggestion}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-center py-4">
              {t('draftEditor.noSuggestions')}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={generateSuggestions}
          className="btn-outline flex items-center"
          disabled={isGeneratingSuggestions}
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          {t('draftEditor.suggestions')}
        </button>
        <button
          onClick={handleRegenerate}
          className="btn-secondary flex items-center"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          {t('draftEditor.regenerate')}
        </button>
      </div>
    </div>
  )
}

export default DraftEditor 