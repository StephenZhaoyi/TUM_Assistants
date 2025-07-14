import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../translations'
import { 
  MessageSquare, 
  RotateCcw, 
  Copy, 
  Save,
  Loader2,
  Sparkles,
  Check
} from 'lucide-react'
import ToneSelector from '../components/ToneSelector'

const FreePromptInput = () => {
  const navigate = useNavigate()
  const { t, isInitialized } = useTranslation()
  const [prompt, setPrompt] = useState('')
  const [tone, setTone] = useState('neutral')
  const [generatedDraft, setGeneratedDraft] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [showCopySuccess, setShowCopySuccess] = useState(false)

  const examplePrompts = [
    'Write a notice to inform students about exam schedule changes',
    'Create a formal letter to faculty members about upcoming meeting',
    'Generate a holiday announcement for the university',
    'Write a course registration reminder for students'
  ]

  const generateDraft = async () => {
    if (!prompt.trim()) {
      setError(t('freePrompt.error'))
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/free_prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, tone })
      })
      if (!response.ok) throw new Error(t('freePrompt.generationError'))
      const data = await response.json()
      
      // 只保存到本地状态，不保存到后端
      const localDraft = {
        type: 'freeTextGeneration',
        title: `${t('freePrompt.title')} - ${new Date().toLocaleDateString()}`,
        content: data.content,
        tone,
        prompt,
        createdAt: new Date().toISOString()
      }
      
      setGeneratedDraft(localDraft)
    } catch (err) {
      console.error('Free prompt generation error:', err)
      setError(err.message || t('freePrompt.generationError'))
    } finally {
      setIsGenerating(false)
    }
  }

  // 复制为富文本（HTML）
  const handleCopy = async () => {
    if (generatedDraft) {
      try {
        // 使用 Clipboard API 写入 HTML 和纯文本
        await navigator.clipboard.write([
          new window.ClipboardItem({
            'text/html': new Blob([generatedDraft.content], { type: 'text/html' }),
            'text/plain': new Blob([
              (() => {
                const tmp = document.createElement('div');
                tmp.innerHTML = generatedDraft.content;
                return tmp.innerText || tmp.textContent || '';
              })()
            ], { type: 'text/plain' })
          })
        ]);
        setShowCopySuccess(true)
        setTimeout(() => {
          setShowCopySuccess(false)
        }, 3000)
      } catch (err) {
        setError('Copy failed. Please try again.')
      }
    }
  }

  const handleSave = async () => {
    if (!generatedDraft) return;
    
    try {
      // 保存到后端
      const saveRes = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedDraft)
      })
      
      if (!saveRes.ok) {
        const errorData = await saveRes.json().catch(() => ({}))
        throw new Error(errorData.detail || t('draftEditor.saveError'))
      }
      
      const savedDraft = await saveRes.json()
      // 导航到编辑页面
      navigate(`/draft/${savedDraft.id}`)
    } catch (err) {
      console.error('Save error:', err)
      setError(err.message || t('draftEditor.saveError'))
    }
  }

  const handleRegenerate = () => {
    setGeneratedDraft(null)
    generateDraft()
  }

  const handleExampleClick = (example) => {
    setPrompt(example)
  }

  if (!isInitialized) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">
          {t('freePrompt.title')}
        </h1>
        <p className="text-lg text-neutral-600">
          {t('freePrompt.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">
              {t('freePrompt.form.title')}
            </h2>

            <div className="space-y-6">
              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('freePrompt.form.description')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t('freePrompt.form.placeholder')}
                  className="textarea w-full"
                  rows={4}
                />
              </div>

              {/* Example Prompts */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  {t('freePrompt.form.examples')}
                </label>
                <div className="space-y-2">
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className="w-full text-left p-3 text-sm text-neutral-600 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone Selector */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('freePrompt.form.tone')}
                </label>
                <ToneSelector
                  selectedTone={tone}
                  onToneChange={setTone}
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <button
                onClick={generateDraft}
                disabled={isGenerating}
                className="btn-primary w-full flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {t('freePrompt.generating')}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    {t('freePrompt.generateDraft')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-2">
          <div className="card p-0 flex flex-col h-[600px] min-h-[400px]">
            {/* 内容区 */}
            <div className="p-6 flex-1 overflow-auto">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">
                {t('freePrompt.output.title')}
              </h2>
              {!generatedDraft ? (
                <div className="text-center py-16">
                  <MessageSquare className="h-20 w-20 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-500 text-lg">
                    {t('freePrompt.output.fillForm')}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-neutral-900 text-lg">
                      {generatedDraft.title}
                    </h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {t('documentTypes.freeTextGeneration')}
                    </span>
                  </div>
                  <div
                    className="bg-neutral-50 rounded-lg p-6 font-arial text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: generatedDraft.content }}
                  />
                </div>
              )}
            </div>
            {/* 按钮栏 */}
            <div className="flex gap-3 p-4 border-t border-neutral-200 bg-white shrink-0 relative">
              {/* Copy Success Toast */}
              {showCopySuccess && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-[9999]">
                  <Check className="h-4 w-4" />
                  <span>{t('messages.copySuccess')}</span>
                </div>
              )}
              <button 
                onClick={handleCopy} 
                disabled={!generatedDraft}
                className="btn-outline flex-1 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
              >
                <Copy className="h-5 w-5 mr-2" />
                {t('freePrompt.output.copyContent')}
              </button>
              <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center">
                <Save className="h-5 w-5 mr-2" />
                {t('freePrompt.output.saveEdit')}
              </button>
              <button onClick={handleRegenerate} className="btn-secondary flex items-center justify-center" title={t('freePrompt.output.regenerate')}>
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FreePromptInput 