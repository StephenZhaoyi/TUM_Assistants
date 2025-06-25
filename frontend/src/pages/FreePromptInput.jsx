import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../translations'
import { 
  MessageSquare, 
  RotateCcw, 
  Copy, 
  Save,
  Loader2,
  Sparkles 
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

  const examplePrompts = [
    'Write a notice to inform students about exam schedule changes',
    'Generate meeting minutes for department regular meeting discussions',
    'Draft an announcement for new campus management regulations',
    'Write a formal letter to invite experts to academic lectures'
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
      const newDraft = {
        type: 'freeTextGeneration',
        title: `${t('freePrompt.title')} - ${new Date().toLocaleDateString()}`,
        content: data.content,
        tone,
        prompt,
        createdAt: new Date().toISOString()
      }
      // 保存到后端
      const saveRes = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDraft)
      })
      if (!saveRes.ok) {
        const errorData = await saveRes.json().catch(() => ({}))
        throw new Error(errorData.detail || t('draftEditor.saveError'))
      }
      const savedDraft = await saveRes.json()
      setGeneratedDraft(savedDraft)
    } catch (err) {
      console.error('Free prompt generation/save error:', err)
      setError(err.message || t('freePrompt.generationError'))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    if (generatedDraft) {
      navigator.clipboard.writeText(generatedDraft.content)
    }
  }

  const handleSave = () => {
    if (generatedDraft) {
      navigate(`/draft/${generatedDraft.id}`)
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
                className="btn-primary w-full"
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
                  <div className="bg-neutral-50 rounded-lg p-6 font-arial text-base leading-relaxed whitespace-pre-wrap">
                    {generatedDraft.content}
                  </div>
                </div>
              )}
            </div>
            {/* 按钮栏 */}
            <div className="flex gap-3 p-4 border-t border-neutral-200 bg-white shrink-0">
              <button onClick={handleCopy} className="btn-outline flex-1"> <Copy className="h-5 w-5 mr-2" /> {t('freePrompt.output.copyContent')} </button>
              <button onClick={handleSave} className="btn-primary flex-1"> <Save className="h-5 w-5 mr-2" /> {t('freePrompt.output.saveEdit')} </button>
              <button onClick={handleRegenerate} className="btn-secondary" title={t('freePrompt.output.regenerate')}> <RotateCcw className="h-5 w-5" /> </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FreePromptInput 