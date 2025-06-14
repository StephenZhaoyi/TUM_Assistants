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
    const loadDraft = () => {
      try {
        const drafts = JSON.parse(localStorage.getItem('drafts') || '[]')
        let foundDraft = drafts.find(d => d.id === id)
        
        if (!foundDraft) {
          foundDraft = {
            id: id,
            content: '',
            type: 'announcement', // 默认类型 key
            createdAt: new Date().toISOString()
          }
          drafts.unshift(foundDraft)
          localStorage.setItem('drafts', JSON.stringify(drafts))
        }
        
        setDraft(foundDraft)
      } catch (error) {
        console.error('Error loading draft:', error)
        // Create a fallback draft
        setDraft({
          id: id,
          content: '',
          type: 'announcement',
          createdAt: new Date().toISOString()
        })
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
        // 只保留 type key
        type: draft.type || 'announcement',
      }
      
      setDraft(updatedDraft)
      
      // Update localStorage
      const drafts = JSON.parse(localStorage.getItem('drafts') || '[]')
      const updatedDrafts = drafts.map(d => d.id === id ? updatedDraft : d)
      localStorage.setItem('drafts', JSON.stringify(updatedDrafts))
      
      // Show save success notification
      setTimeout(() => {
        setIsSaving(false)
      }, 1000)
      
    } catch (error) {
      console.error(t('draftEditor.saveError'), error)
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="btn-outline"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t('draftEditor.back')}
          </button>
          <h1 className="text-2xl font-bold text-neutral-900">
            {getDraftTitle()}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="btn-outline"
          >
            <Copy className="h-5 w-5 mr-2" />
            {t('draftEditor.copy')}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {t('draftEditor.saving')}
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                {t('draftEditor.save')}
              </>
            )}
          </button>
          <button
            onClick={handleRegenerate}
            className="btn-secondary"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            {t('draftEditor.regenerate')}
          </button>
          <button
            onClick={generateSuggestions}
            disabled={isGeneratingSuggestions}
            className="btn-outline"
          >
            <Lightbulb className="h-5 w-5 mr-2" />
            {t('draftEditor.suggestions')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Editor */}
        <div className="lg:col-span-3">
          <div className="card p-0 flex flex-col h-[600px] min-h-[400px]">
            {/* 编辑器内容区 */}
            <div className="p-6 flex-1 overflow-auto">
              <EditorContent 
                editor={editor} 
                className="prose max-w-none h-full font-arial text-base leading-relaxed"
                style={{ minHeight: '400px' }}
                key={language}
              />
            </div>
            {/* 如需底部按钮栏，可在此添加 */}
          </div>
        </div>

        {/* Suggestions Panel */}
        <div className="lg:col-span-1">
          {showSuggestions && (
            <div className="card p-6 h-[calc(100vh-200px)] overflow-y-auto">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                {t('draftEditor.suggestions')}
              </h3>
              
              {isGeneratingSuggestions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-7 w-7 animate-spin text-primary-600 mr-2" />
                  <span className="text-neutral-600">
                    {t('draftEditor.generatingSuggestions')}
                  </span>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="border border-neutral-200 rounded-lg p-4">
                      <div className="text-sm text-neutral-600 mb-2">
                        <strong>{t('draftEditor.moreFormal')}:</strong> {suggestion.reason}
                      </div>
                      <div className="text-sm mb-2">
                        <div className="text-red-600 line-through">
                          {suggestion.original}
                        </div>
                        <div className="text-green-600 font-medium">
                          {suggestion.suggestion}
                        </div>
                      </div>
                      <button
                        onClick={() => applySuggestion(suggestion)}
                        className="btn-outline btn-sm w-full"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {t('draftEditor.applySuggestion')}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  {t('draftEditor.noSuggestions')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DraftEditor 