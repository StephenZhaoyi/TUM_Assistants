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
  Loader2,
  Calendar,
  Clock,
  StickyNote
} from 'lucide-react'

const StructuredInput = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    documentType: '',
    targetAudience: '',
    startDate: '',
    endDate: '',
    additionalNote: ''
  })
  const [generatedDraft, setGeneratedDraft] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const documentTypes = [
    { value: 'course_registration', label: t('documentTypes.courseRegistration') }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateDraft = async () => {
    if (!formData.documentType || !formData.targetAudience || !formData.startDate || !formData.endDate) {
      setError(t('structuredInput.error'))
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          startDate: formData.startDate,
          endDate: formData.endDate,
          targetAudience: formData.targetAudience,
          additionalNote: formData.additionalNote
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Generation failed' }))
        throw new Error(errorData.detail || 'Generation failed')
      }

      const data = await response.json()
      
      if (data.status === 'success') {
        const newDraft = {
          id: Date.now().toString(),
          type: formData.documentType,
          title: `${formData.documentType} - ${formData.targetAudience}`,
          content: data.content,
          createdAt: new Date().toISOString()
        }
        
        setGeneratedDraft(newDraft)
        
        // 保存到本地存储
        const savedDrafts = JSON.parse(localStorage.getItem('drafts') || '[]')
        savedDrafts.unshift(newDraft)
        localStorage.setItem('drafts', JSON.stringify(savedDrafts))
        
        // 导航到草稿页面
        navigate(`/draft/${newDraft.id}`)
      } else {
        throw new Error(data.message || 'Generation failed')
      }
    } catch (err) {
      console.error('Generation error:', err)
      setError(err.message || t('structuredInput.generationError'))
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          {t('structuredInput.title')}
        </h1>
        <p className="text-lg text-neutral-600">
          {t('structuredInput.subtitle')}
        </p>
      </div>

      {/* Form */}
      <div className="card p-6">
        {/* Document Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-tum-gray-700 mb-2">
            {t('form.type')}
          </label>
          <select
            value={formData.documentType}
            onChange={(e) => handleInputChange('documentType', e.target.value)}
            className="select w-full"
          >
            <option value="">{t('placeholders.selectType')}</option>
            {documentTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Target Audience */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-tum-gray-700 mb-2">
            {t('form.recipient')}
          </label>
          <input
            type="text"
            value={formData.targetAudience}
            onChange={(e) => handleInputChange('targetAudience', e.target.value)}
            className="input"
            placeholder={t('placeholders.recipient')}
          />
        </div>

        {/* Start Date */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-tum-gray-700 mb-2">
            {t('form.startDate')}
          </label>
          <input
            type="text"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className="input"
            placeholder={t('placeholders.startDate')}
          />
        </div>

        {/* End Date */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-tum-gray-700 mb-2">
            {t('form.endDate')}
          </label>
          <input
            type="text"
            value={formData.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            className="input"
            placeholder={t('placeholders.endDate')}
          />
        </div>

        {/* Additional Note */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-tum-gray-700 mb-2">
            {t('form.additionalNote')}
          </label>
          <textarea
            value={formData.additionalNote}
            onChange={(e) => handleInputChange('additionalNote', e.target.value)}
            className="textarea h-32"
            placeholder={t('placeholders.additionalNote')}
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm mb-4">{error}</div>
        )}

        {/* Generate Button */}
        <button
          onClick={generateDraft}
          disabled={isGenerating}
          className="btn-primary w-full flex items-center justify-center"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              {t('messages.loading')}
            </>
          ) : (
            t('actions.generate')
          )}
        </button>
      </div>
    </div>
  )
}

export default StructuredInput 