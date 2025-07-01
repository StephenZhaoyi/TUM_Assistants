import React, { useState, useEffect, useMemo } from 'react'
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
import Underline from '@tiptap/extension-underline'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import TextAlign from '@tiptap/extension-text-align'
import ListItem from '@tiptap/extension-list-item'

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
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [removeFields, setRemoveFields] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [templateSuccess, setTemplateSuccess] = useState(false)
  const [geminiPrompt, setGeminiPrompt] = useState('')
  const [isGeminiLoading, setIsGeminiLoading] = useState(false)

  // Memoize placeholder to avoid editor recreation
  const placeholder = useMemo(() => t('draftEditor.placeholder'), [t])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder,
      }),
      Underline,
      BulletList,
      OrderedList,
      ListItem,
      TextAlign.configure({ types: ['heading', 'paragraph'] })
    ],
    content: '',
    onUpdate: ({ editor }) => {
      // Handle content changes here
    },
  }, [language])

  // Load draft data (only depends on id)
  useEffect(() => {
    // 只在非模板编辑模式下加载
    if (location.pathname === '/draft/template-edit') return;
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
  }, [id, location.pathname])

  // Sync content when both editor and draft are ready
  useEffect(() => {
    // 只在非模板编辑模式下同步
    if (location.pathname === '/draft/template-edit') return;
    if (editor && draft) {
      try {
        editor.commands.setContent(draft.content || '')
        setIsLoading(false)
      } catch (error) {
        console.error('Error setting editor content:', error)
        setIsLoading(false)
      }
    }
  }, [editor, draft, location.pathname])

  // Reset loading state when id changes
  useEffect(() => {
    setIsLoading(true)
  }, [id])

  // 检查是否为模板编辑模式
  const isTemplateEdit = location.pathname === '/draft/template-edit' && location.state && location.state.template;

  // 初始化模板编辑内容
  useEffect(() => {
    if (isTemplateEdit && editor) {
      editor.commands.setContent(location.state.template.content || '')
      setDraft({
        id: 'template-edit',
        content: location.state.template.content,
        title: location.state.template.title,
        type: 'template',
        createdAt: location.state.template.date || new Date().toISOString(),
      })
      setIsLoading(false)
    }
  }, [isTemplateEdit, editor])

  // 页面顶部加防御性跳转，防止 location.state 丢失时报错
  useEffect(() => {
    if (location.pathname === '/draft/template-edit' && (!location.state || !location.state.template)) {
      navigate('/self-customizing-templates');
    }
  }, [location, navigate]);

  useEffect(() => {
    if (location.pathname === '/draft/template-edit') {
      let template = location.state?.template;
      let templateIdx = location.state?.templateIdx;
      // 如果刷新导致 state 丢失，尝试从 localStorage 取
      if (!template && typeof templateIdx === 'number') {
        const templates = JSON.parse(localStorage.getItem('selfCustomizingTemplates') || '[]');
        template = templates[templateIdx];
      }
      if (template && editor) {
        editor.commands.setContent(template.content || '')
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
  }, [location, editor, navigate]);

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
      // 模板编辑模式下，保存到 localStorage
      if (isTemplateEdit && location.state && typeof location.state.templateIdx === 'number') {
        const prev = JSON.parse(localStorage.getItem('selfCustomizingTemplates') || '[]')
        prev[location.state.templateIdx] = {
          ...prev[location.state.templateIdx],
          content: updatedDraft.content,
          title: updatedDraft.title || prev[location.state.templateIdx].title,
          date: updatedDraft.updatedAt
        }
        localStorage.setItem('selfCustomizingTemplates', JSON.stringify(prev))
        setIsSaving(false)
        // 返回模板页
        navigate('/self-customizing-templates')
        return
      }
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
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new window.ClipboardItem({
            'text/html': new Blob([content], { type: 'text/html' }),
            'text/plain': new Blob([div.innerText], { type: 'text/plain' })
          })
        ])
      } else {
        // fallback: 只复制纯文本
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

  // 新增：去除关键信息并保存为模板
  const handleSaveAsTemplate = () => {
    setShowTemplateModal(true)
  }

  const handleTemplateConfirm = () => {
    if (!editor || !templateName.trim()) return
    let html = editor.getHTML()
    removeFields.split(',').map(f => f.trim()).forEach(field => {
      if (field) {
        html = html.replaceAll(field, '[关键内容]')
      }
    })
    const prev = JSON.parse(localStorage.getItem('selfCustomizingTemplates') || '[]')
    prev.push({ content: html, date: new Date().toISOString(), title: templateName.trim() })
    localStorage.setItem('selfCustomizingTemplates', JSON.stringify(prev))
    setShowTemplateModal(false)
    setRemoveFields('')
    setTemplateName('')
    setTemplateSuccess(true)
    setTimeout(() => setTemplateSuccess(false), 2000)
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

  // Gemini 再次修改草稿（占位实现）
  const handleGeminiEdit = async () => {
    if (!editor || !geminiPrompt.trim()) return
    setIsGeminiLoading(true)
    try {
      const res = await fetch('/api/gemini_edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editor.getHTML(),
          instruction: geminiPrompt.trim()
        })
      })
      const data = await res.json()
      if (data.content) {
        editor.commands.setContent(data.content)
      }
    } catch (e) {
      alert('Gemini API 调用失败')
    } finally {
      setIsGeminiLoading(false)
    }
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
          <button
            onClick={handleSaveAsTemplate}
            className="btn-outline"
          >
            去除关键信息并保存为模板
          </button>
        </div>
      </div>

      {/* 编辑器与 Gemini revise 输入框并排布局 */}
      <div className="flex gap-6 items-start">
        {/* Gemini 再次修改输入框 */}
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
          </div>
        </div>
        {/* 编辑器主体 */}
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
              
              <button
                onClick={() => { editor.view.focus(); editor.chain().focus().toggleBulletList().run(); }}
                className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'}`}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => { editor.view.focus(); editor.chain().focus().toggleOrderedList().run(); }}
                className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'}`}
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </button>
              <button
                onClick={() => { editor.view.focus(); editor.chain().focus().sinkListItem('listItem').run(); }}
                className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded"
                title="Indent"
              >
                <span className="font-bold">→</span>
              </button>
              <button
                onClick={() => { editor.view.focus(); editor.chain().focus().liftListItem('listItem').run(); }}
                className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded"
                title="Outdent"
              >
                <span className="font-bold">←</span>
              </button>
              <div className="w-px h-6 bg-neutral-300 mx-2"></div>
              <button
                onClick={() => { editor.view.focus(); editor.chain().focus().setTextAlign('left').run(); }}
                className={`p-2 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-600' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'}`}
                title="Align Left"
              >
                <span className="font-bold">L</span>
              </button>
              <button
                onClick={() => { editor.view.focus(); editor.chain().focus().setTextAlign('center').run(); }}
                className={`p-2 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-600' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'}`}
                title="Align Center"
              >
                <span className="font-bold">C</span>
              </button>
              <button
                onClick={() => { editor.view.focus(); editor.chain().focus().setTextAlign('right').run(); }}
                className={`p-2 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-600' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'}`}
                title="Align Right"
              >
                <span className="font-bold">R</span>
              </button>
            </div>
            
            {/* Editor Content */}
            <div className="min-h-[400px] prose prose-sm max-w-none">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>

      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-2">去除关键信息并命名模板</h2>
            <p className="mb-2 text-sm text-neutral-600">请输入要去除的关键信息（如学生名字、地点），多个用逗号分隔：</p>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 mb-2"
              value={removeFields}
              onChange={e => setRemoveFields(e.target.value)}
              placeholder="如：张三, 北京"
            />
            <p className="mb-2 text-sm text-neutral-600">请输入模板名称：</p>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 mb-4"
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
              placeholder="模板名称"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowTemplateModal(false)} className="btn-outline">取消</button>
              <button onClick={handleTemplateConfirm} className="btn-primary" disabled={!templateName.trim()}>确认并保存</button>
            </div>
          </div>
        </div>
      )}
      {templateSuccess && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">模板保存成功！</div>
      )}
    </div>
  )
}

export default DraftEditor 