import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
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
  Quote,
  Undo,
  Redo,
  Trash2
} from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { FontSize } from '../extensions/FontSize'
import { CustomHighlight } from '../extensions/Highlight'
import { apiUrl } from '../utils/api'

function autoParagraph(html) {
  if (/<p[\s>]/.test(html)) return html;
  let text = html.replace(/<br\s*\/?>(\s*)/g, '\n');
  return text
    .split(/([。！？!?]\s*|[\r\n]+)/)
    .filter(Boolean)
    .map(s => s.trim() ? `<p>${s.trim()}</p>` : '')
    .join('');
}

const DraftEditor = () => {
  const { id } = useParams()
  const location = useLocation()
  const { t, language, isInitialized } = useTranslation()
  const navigate = useNavigate()
  const [draft, setDraft] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [showCopySuccess, setShowCopySuccess] = useState(false)
  const [geminiPrompt, setGeminiPrompt] = useState('')
  const [isGeminiLoading, setIsGeminiLoading] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [templateName, setTemplateName] = useState('')

  // Memoize placeholder to avoid editor recreation
  const placeholder = useMemo(() => t('draftEditor.placeholder'), [t])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder,
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      CustomHighlight,
      FontSize
    ],
    content: '',
    onUpdate: ({ editor }) => {
      // Handle content changes here
    },
  }, [language])

  // Load draft data (only depends on id)
  useEffect(() => {
    // Only load if not in template edit mode
    if (location.pathname === '/draft/template-edit') return;
    const loadDraft = async () => {
      try {
        const res = await fetch(apiUrl(`/api/drafts/${id}`))
        if (!res.ok) throw new Error('Not found')
        const foundDraft = await res.json()
        setDraft(foundDraft)
      } catch (error) {
        setDraft({ id, content: '', type: 'announcement', createdAt: new Date().toISOString() })
      }
    }
    loadDraft()
  }, [id, location.pathname])

  // Sync content when both editor and draft are ready
  useEffect(() => {
    // Only sync if not in template edit mode
    if (location.pathname === '/draft/template-edit') return;
    if (editor && draft) {
      try {
        editor.commands.setContent(autoParagraph(draft.content || ''))
        setIsLoading(false)
      } catch (error) {
        console.error('Error setting editor content:', error)
        setIsLoading(false)
      }
    }
  }, [editor, draft, location.pathname, autoParagraph])

  // Reset loading state when id changes
  useEffect(() => {
    setIsLoading(true)
  }, [id])

  // Check if in template edit mode
  const isTemplateEdit = location.pathname === '/draft/template-edit' && location.state && location.state.template;

  // Initialize template edit content
  useEffect(() => {
    if (isTemplateEdit && editor) {
      editor.commands.setContent(autoParagraph(location.state.template.content || ''))
      setDraft({
        id: 'template-edit',
        content: location.state.template.content,
        title: location.state.template.title,
        type: 'template',
        createdAt: location.state.template.date || new Date().toISOString(),
      })
      setIsLoading(false)
    }
  }, [isTemplateEdit, editor, autoParagraph])

  // Add defensive redirect for template edit mode to prevent errors if location.state is lost
  useEffect(() => {
    if (location.pathname === '/draft/template-edit' && (!location.state || !location.state.template)) {
      navigate('/self-customizing-templates');
    }
  }, [location, navigate]);

  useEffect(() => {
    if (location.pathname === '/draft/template-edit') {
      let template = location.state?.template;
      let templateIdx = location.state?.templateIdx;
      // If refresh causes state to be lost, try to get from localStorage
      if (!template && typeof templateIdx === 'number') {
        const templates = JSON.parse(localStorage.getItem('selfCustomizingTemplates') || '[]');
        template = templates[templateIdx];
      }
      if (template && editor) {
        editor.commands.setContent(autoParagraph(template.content || ''))
        setDraft({
          id: 'template-edit',
          content: template.content,
          title: template.title,
          type: 'template',
          createdAt: template.date || new Date().toISOString(),
        })
        setIsLoading(false)
      } else if (!template) {
        navigate('/self-customizing-templates');
      }
    }
  }, [location, editor, navigate, autoParagraph]);

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
      // In template edit mode, save to backend API
      if (isTemplateEdit && location.state && location.state.template) {
        const updatedTemplate = {
          ...location.state.template,
          content: updatedDraft.content,
          title: updatedDraft.title || location.state.template.title,
          date: updatedDraft.updatedAt
        }
        
        // If it's a new template, use POST to create
        if (location.state.isNewTemplate) {
          await fetch(apiUrl('/api/templates'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTemplate)
          })
        } else {
          // If editing an existing template, use PUT to update
          await fetch(apiUrl(`/api/templates/${location.state.template.id}`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTemplate)
          })
        }
        setIsSaving(false)
        // Return to template page
        navigate('/self-customizing-templates')
        return
      }
      await fetch(apiUrl(`/api/drafts/${id}`), {
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
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new window.ClipboardItem({
            'text/html': new Blob([content], { type: 'text/html' }),
            'text/plain': new Blob([div.innerText], { type: 'text/plain' })
          })
        ])
      } else {
        // fallback: only copy plain text
        await navigator.clipboard.writeText(div.innerText)
      }
      setShowCopySuccess(true)
      setTimeout(() => {
        setShowCopySuccess(false)
      }, 3000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  // New: Save as template by removing sensitive information
  const handleSaveAsTemplate = () => {
    setShowTemplateModal(true)
  }

  const handleTemplateModalConfirm = async () => {
    if (!templateName.trim()) {
      alert(t('draftEditor.templateNameRequired'))
      return
    }
    setShowTemplateModal(false)
    setTemplateName('')
    try {
      const res = await fetch(apiUrl('/api/templates'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: templateName.trim(),
          content: editor.getHTML(),
          date: new Date().toISOString()
        })
      })
      if (!res.ok) throw new Error('Failed to save template')
      const savedTemplate = await res.json()
      // Navigate to template edit page, bringing the new template
      navigate('/draft/template-edit', {
        state: {
          template: savedTemplate,
          isNewTemplate: false
        }
      })
    } catch (err) {
      alert(t('draftEditor.saveError') + ': ' + (err.message || err))
    }
  }

  const handleTemplateModalCancel = () => {
    setShowTemplateModal(false)
    setTemplateName('')
  }

  // Render title using type key for dynamic translation
  const getDraftTitle = () => {
    if (!draft) return ''
    if (draft.type && t(`documentTypes.${draft.type}`) !== `documentTypes.${draft.type}`) {
      return t(`documentTypes.${draft.type}`)
    }
    // Compatible with old data
    return draft.title || t('draftEditor.title')
  }

  // Gemini again revise draft (placeholder implementation)
  const handleGeminiEdit = async () => {
    if (!editor || !geminiPrompt.trim()) return
    setIsGeminiLoading(true)
    try {
      const res = await fetch(apiUrl('/api/gemini_edit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editor.getHTML(),
          instruction: geminiPrompt.trim()
        })
      })
      const data = await res.json()
      if (data.content) {
        editor.commands.setContent(autoParagraph(data.content))
      }
    } catch (e) {
      alert('Gemini API call failed')
    } finally {
      setIsGeminiLoading(false)
    }
  }

  function getDocumentTypeLabel(type) {
    if (!type) return '';
    // Support both snake_case and camelCase
    const camelCase = type.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    const translated = t(`documentTypes.${camelCase}`);
    if (translated && translated !== `documentTypes.${camelCase}`) {
      return translated;
    }
    // Also support snake_case
    const mapping = {
      'course_registration': t('documentTypes.courseRegistration'),
      'event_notice': t('documentTypes.eventNotice'),
      'schedule_request': t('documentTypes.scheduleRequest'),
      'schedule_announcement': t('documentTypes.scheduleAnnouncement'),
      'schedule_change': t('documentTypes.scheduleChange'),
      'student_reply': t('documentTypes.studentReply'),
      'holiday_notice': t('documentTypes.holidayNotice'),
      'free_prompt': t('documentTypes.freeTextGeneration'),
      'freeTextGeneration': t('documentTypes.freeTextGeneration'),
      'announcement': t('documentTypes.announcement'),
      'student_notice': t('documentTypes.studentNotice'),
      'meeting_minutes': t('documentTypes.meetingMinutes'),
      'formal_letter': t('documentTypes.formalLetter'),
      'notification': t('documentTypes.notification'),
      'report': t('documentTypes.report'),
      'letter': t('documentTypes.letter'),
      'memo': t('documentTypes.memo'),
      'policy': t('documentTypes.policy'),
      'guideline': t('documentTypes.guideline'),
      'template': t('documentTypes.template'),
    };
    return mapping[type] || type;
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
            {isTemplateEdit ? t('draftEditor.editTemplate') : t('draftEditor.title')}
          </h1>
          {/* <p className="text-lg text-neutral-600">
            {draft.title}
          </p> */}
          {draft.type && !isTemplateEdit && (
            <p className="text-base text-neutral-500 mt-1">
              {getDocumentTypeLabel ? getDocumentTypeLabel(draft.type) : (t(`documentTypes.${draft.type}`) !== `documentTypes.${draft.type}` ? t(`documentTypes.${draft.type}`) : draft.type)}
            </p>
          )}
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
            {isSaving ? t('draftEditor.saving') : (isTemplateEdit ? t('draftEditor.saveChanges') : t('draftEditor.save'))}
          </button>
          {!isTemplateEdit && (
            <button
              onClick={handleSaveAsTemplate}
              className="btn-outline"
            >
              {t('draftEditor.saveAsTemplate')}
            </button>
          )}
        </div>
      </div>

      {/* Editor and Gemini revise input box side by side */}
      <div className="flex gap-6 items-start">
        {/* Gemini again revise input box */}
        <div className="w-full max-w-xs">
          <div className="mb-4 flex flex-col gap-2">
            <textarea
              className="input min-h-[80px] resize-y"
              placeholder={t('draftEditor.geminiEditPrompt')}
              value={geminiPrompt}
              onChange={e => setGeminiPrompt(e.target.value)}
              rows={4}
            />
            <button
              className="btn-primary"
              onClick={handleGeminiEdit}
              disabled={isGeminiLoading || !geminiPrompt.trim()}
            >
              {isGeminiLoading ? t('draftEditor.geminiEditProcessing') : t('draftEditor.geminiEditButton')}
            </button>
            {isTemplateEdit && (
              <>
                <div className="text-base font-semibold text-neutral-900 mt-4 mb-2">{t('freePrompt.form.examples')}</div>
                <button
                  onClick={() => {
                    setGeminiPrompt(t('draftEditor.removeSpecificInfoPrompt'))
                  }}
                  className="btn-outline"
                >
                  {t('draftEditor.removeSpecificInfo')}
                </button>
              </>
            )}
          </div>
        </div>
        {/* Editor main body */}
        <div className="flex-1">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4 border-b border-neutral-200 pb-4">
              <button
                onClick={() => { editor.view.focus(); editor.chain().focus().undo().run(); }}
                disabled={!editor.can().undo()}
                className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded disabled:opacity-50"
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </button>
              <button
                onClick={() => { editor.view.focus(); editor.chain().focus().redo().run(); }}
                disabled={!editor.can().redo()}
                className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded disabled:opacity-50"
                title="Redo"
              >
                <Redo className="h-4 w-4" />
              </button>
              
              <div className="w-px h-6 bg-neutral-300 mx-2"></div>
              
              <button
                onClick={() => { editor.view.focus(); editor.chain().focus().toggleBold().run(); }}
                className={`p-2 rounded ${editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'}`}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                onClick={() => { editor.view.focus(); editor.chain().focus().toggleItalic().run(); }}
                className={`p-2 rounded ${editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'}`}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                onClick={() => { editor.view.focus(); editor.chain().focus().toggleUnderline().run(); }}
                className={`p-2 rounded ${editor.isActive('underline') ? 'bg-blue-100 text-blue-600' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'}`}
                title="Underline"
              >
                <u className="h-4 w-4 font-bold">U</u>
              </button>
              
              <div className="w-px h-6 bg-neutral-300 mx-2"></div>
              
              {/* Font color selector */}
              <select
                className="text-sm border rounded px-1 py-0.5"
                title="Font Color"
                value={editor.getAttributes('textStyle').color || '#000000'}
                onChange={e => editor.chain().focus().setColor(e.target.value).run()}
                style={{ width: 80 }}
              >
                <option value="#000000">Black</option>
                <option value="#ffffff">White</option>
                <option value="#e53935">Red</option>
                <option value="#3070b3">TUM Blue</option>
              </select>
              {/* Font size selector */}
              <select
                className="text-sm border rounded px-1 py-0.5"
                title="Font Size"
                value={editor.getAttributes('textStyle').fontSize || '16px'}
                onChange={e => editor.chain().focus().setFontSize(e.target.value).run()}
                style={{ width: 70 }}
              >
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
                <option value="24px">24px</option>
                <option value="28px">28px</option>
                <option value="32px">32px</option>
              </select>
              {/* Highlight selector */}
              <select
                className="text-sm border rounded px-1 py-0.5"
                title="Highlight Color"
                value={editor.isActive('highlight') ? (editor.getAttributes('highlight').color || '#ffff00') : ''}
                onChange={e => {
                  if (e.target.value) {
                    editor.chain().focus().setHighlight({ color: e.target.value }).run()
                  } else {
                    editor.chain().focus().unsetHighlight().run()
                  }
                }}
                style={{ width: 100 }}
              >
                <option value="" disabled>Highlight</option>
                <option value="">No Highlight</option>
                <option value="#ffff00">Yellow</option>
                <option value="#ff0000">Red</option>
              </select>
            </div>
            
            {/* Editor Content */}
            <div className="min-h-[400px] prose prose-sm max-w-none">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>

      {/* Template Name Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              {t('draftEditor.enterTemplateName')}
            </h3>
            <input
              type="text"
              className="input w-full mb-4"
              placeholder={t('draftEditor.templateNamePlaceholder')}
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  handleTemplateModalConfirm()
                }
              }}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleTemplateModalCancel}
                className="btn-outline"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleTemplateModalConfirm}
                className="btn-primary"
              >
                {t('draftEditor.saveAsTemplate')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DraftEditor 