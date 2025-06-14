import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../translations'
import { 
  FileText, 
  Users, 
  MessageSquare, 
  RotateCcw, 
  Copy, 
  Save,
  Loader2 
} from 'lucide-react'
import ToneSelector from '../components/ToneSelector'

const StructuredInput = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    documentType: '',
    targetAudience: [],
    keyPoints: '',
    tone: 'neutral'
  })
  const [generatedDraft, setGeneratedDraft] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const documentTypes = [
    { value: 'announcement', label: t('documentTypes.announcement') },
    { value: 'student_notice', label: t('documentTypes.studentNotice') },
    { value: 'meeting_minutes', label: t('documentTypes.meetingMinutes') },
    { value: 'formal_letter', label: t('documentTypes.formalLetter') }
  ]

  const audienceOptions = [
    { value: 'students', label: t('audience.students') },
    { value: 'faculty', label: t('audience.faculty') },
    { value: 'department', label: t('audience.department') },
    { value: 'all', label: t('audience.all') }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAudienceChange = (audience) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.includes(audience)
        ? prev.targetAudience.filter(a => a !== audience)
        : [...prev.targetAudience, audience]
    }))
  }

  const generateDraft = async () => {
    if (!formData.documentType || formData.targetAudience.length === 0 || !formData.keyPoints) {
      setError(t('structuredInput.error'))
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockDraft = {
        id: Date.now().toString(),
        title: `${documentTypes.find(t => t.value === formData.documentType)?.label} - ${new Date().toLocaleDateString()}`,
        content: `Based on your requirements, I have generated a ${documentTypes.find(t => t.value === formData.documentType)?.label} for you.

Main content includes:
${formData.keyPoints}

This ${documentTypes.find(t => t.value === formData.documentType)?.label} is intended for ${formData.targetAudience.map(a => audienceOptions.find(opt => opt.value === a)?.label).join(', ')}.

Please make necessary modifications and adjustments according to actual circumstances.`,
        type: documentTypes.find(t => t.value === formData.documentType)?.label,
        tone: formData.tone,
        createdAt: new Date().toISOString(),
        ...formData
      }

      setGeneratedDraft(mockDraft)
      
      // Save to localStorage
      const existingDrafts = JSON.parse(localStorage.getItem('drafts') || '[]')
      localStorage.setItem('drafts', JSON.stringify([mockDraft, ...existingDrafts]))
      
    } catch (err) {
      setError(t('structuredInput.generationError'))
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

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">
          {t('structuredInput.title')}
        </h1>
        <p className="text-lg text-neutral-600">
          {t('structuredInput.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">
              {t('structuredInput.form.title')}
            </h2>

            <div className="space-y-6">
              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('structuredInput.form.documentType')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.documentType}
                  onChange={(e) => handleInputChange('documentType', e.target.value)}
                  className="select w-full"
                >
                  <option value="">{t('structuredInput.form.selectType')}</option>
                  {documentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('structuredInput.form.targetAudience')} <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {audienceOptions.map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.targetAudience.includes(option.value)}
                        onChange={() => handleAudienceChange(option.value)}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-neutral-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Key Points */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('structuredInput.form.keyPoints')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.keyPoints}
                  onChange={(e) => handleInputChange('keyPoints', e.target.value)}
                  placeholder={t('structuredInput.form.describePoints')}
                  className="textarea w-full"
                  rows={4}
                />
              </div>

              {/* Tone Selector */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('structuredInput.form.tone')}
                </label>
                <ToneSelector
                  selectedTone={formData.tone}
                  onToneChange={(tone) => handleInputChange('tone', tone)}
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
                    {t('structuredInput.generating')}
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5 mr-2" />
                    {t('structuredInput.generateDraft')}
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
                {t('structuredInput.output.title')}
              </h2>
              {!generatedDraft ? (
                <div className="text-center py-16">
                  <FileText className="h-20 w-20 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-500 text-lg">
                    {t('structuredInput.form.fillForm')}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-neutral-900 text-lg">
                      {generatedDraft.title}
                    </h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                      {generatedDraft.type}
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
              <button onClick={handleCopy} className="btn-outline flex-1"> <Copy className="h-5 w-5 mr-2" /> {t('structuredInput.output.copyContent')} </button>
              <button onClick={handleSave} className="btn-primary flex-1"> <Save className="h-5 w-5 mr-2" /> {t('structuredInput.output.saveEdit')} </button>
              <button onClick={handleRegenerate} className="btn-secondary" title={t('structuredInput.output.regenerate')}> <RotateCcw className="h-5 w-5" /> </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StructuredInput 