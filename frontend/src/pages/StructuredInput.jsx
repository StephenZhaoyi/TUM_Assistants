import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../translations'
import { 
  Copy, 
  Save,
  Loader2,
  Check
} from 'lucide-react'

const StructuredInput = () => {
  const navigate = useNavigate()
  const { t, isInitialized } = useTranslation()
  const [formData, setFormData] = useState({})
  const [generatedContent, setGeneratedContent] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [lastGenerationData, setLastGenerationData] = useState(null)
  const [showCopySuccess, setShowCopySuccess] = useState(false)

  if (!isInitialized) {
    return null
  }

  // Document categories with their respective document types
  const documentCategories = {
    staff: [
      { value: 'schedule_request', label: t('documentTypes.scheduleRequest') }
    ],
    student: [
      { value: 'course_registration', label: t('documentTypes.courseRegistration') },
      { value: 'event_notice', label: t('documentTypes.eventNotice') },
      { value: 'schedule_announcement', label: t('documentTypes.scheduleAnnouncement') },
      { value: 'student_reply', label: t('documentTypes.studentReply') }
    ],
    all: [
      { value: 'schedule_change', label: t('documentTypes.scheduleChange') },
      { value: 'holiday_notice', label: t('documentTypes.holidayNotice') }
    ]
  }

  // Get available document types based on selected category
  const getDocumentTypesForCategory = (category) => {
    return documentCategories[category] || []
  }

  const fieldsByType = {
    course_registration: [
      { name: 'startDate', label: t('form.startDate'), placeholder: t('placeholders.startDate'), required: true },
      { name: 'endDate', label: t('form.endDate'), placeholder: t('placeholders.endDate'), required: true },
      { name: 'targetAudience', label: t('form.recipient'), placeholder: t('placeholders.recipient'), required: true },
      { name: 'name', label: t('form.author'), placeholder: t('form.author'), required: true },
      { name: 'additionalNote', label: t('form.additionalNote'), placeholder: t('placeholders.additionalNote'), type: 'textarea', required: false }
    ],
    event_notice: [
      { name: 'courseName', label: t('form.eventName'), placeholder: t('form.eventName'), required: true },
      { name: 'additionalNote', label: t('form.eventIntro'), placeholder: t('form.eventIntro'), type: 'textarea', required: true },
      { name: 'eventTime', label: t('form.eventTime'), placeholder: t('form.eventTime'), required: true },
      { name: 'location', label: t('form.location'), placeholder: t('form.location'), required: true },
      { name: 'targetAudience', label: t('form.recipient'), placeholder: t('placeholders.recipient'), required: true },
      { name: 'language', label: t('form.language'), placeholder: t('form.language'), required: true },
      { name: 'name', label: t('form.author'), placeholder: t('form.author'), required: true },
      { name: 'registration', label: t('form.registration'), placeholder: t('form.registration'), required: false }
    ],
    schedule_request: [
      { name: 'courseName', label: t('form.courseName'), placeholder: t('form.courseName'), required: true },
      { name: 'courseCode', label: t('form.courseCode'), placeholder: t('form.courseCode'), required: true },
      { name: 'semester', label: t('form.semester'), placeholder: t('form.semester'), required: true },
      { name: 'timeOptions', label: t('form.timeOptions'), placeholder: t('form.timeOptions'), type: 'textarea', required: true },
      { name: 'replyDeadline', label: t('form.replyDeadline'), placeholder: t('form.replyDeadline'), required: true },
      { name: 'name', label: t('form.author'), placeholder: t('form.author'), required: true },
      { name: 'targetAudience', label: t('form.recipient'), placeholder: t('placeholders.recipient'), required: true }
    ],
    schedule_announcement: [
      { name: 'courseName', label: t('form.courseName'), placeholder: t('form.courseName'), required: true },
      { name: 'courseCode', label: t('form.courseCode'), placeholder: t('form.courseCode'), required: true },
      { name: 'instructorName', label: t('form.instructorName'), placeholder: t('form.instructorName'), required: true },
      { name: 'courseStartDate', label: t('form.courseStartDate'), placeholder: t('form.courseStartDate'), required: true },
      { name: 'weeklyTime', label: t('form.weeklyTime'), placeholder: t('form.weeklyTime'), required: true },
      { name: 'weeklyLocation', label: t('form.weeklyLocation'), placeholder: t('form.weeklyLocation'), required: true },
      { name: 'targetAudience', label: t('form.recipient'), placeholder: t('placeholders.recipient'), required: true },
      { name: 'name', label: t('form.author'), placeholder: t('form.author'), required: true }
    ],
    schedule_change: [
      { name: 'courseName', label: t('form.courseName'), placeholder: t('form.courseName'), required: true },
      { name: 'courseCode', label: t('form.courseCode'), placeholder: t('form.courseCode'), required: true },
      { name: 'reason', label: t('form.reason'), placeholder: t('form.reason'), type: 'textarea', required: true },
      { name: 'oldTime', label: t('form.oldTime'), placeholder: t('form.oldTime'), required: true },
      { name: 'oldLocation', label: t('form.oldLocation'), placeholder: t('form.oldLocation'), required: true },
      { name: 'newTime', label: t('form.newTime'), placeholder: t('form.newTime'), required: true },
      { name: 'newLocation', label: t('form.newLocation'), placeholder: t('form.newLocation'), required: true },
      { name: 'targetAudience', label: t('form.recipient'), placeholder: t('placeholders.recipient'), required: true },
      { name: 'name', label: t('form.author'), placeholder: t('form.author'), required: true }
    ],
    student_reply: [
      { name: 'studentName', label: t('form.studentName'), placeholder: t('form.studentName'), required: true },
      { name: 'name', label: t('form.author'), placeholder: t('form.author'), required: true }
    ],
    holiday_notice: [
      { name: 'holidayName', label: t('form.holidayName'), placeholder: t('form.holidayName'), required: true },
      { name: 'holidayDate', label: t('form.holidayDate'), placeholder: t('form.holidayDate'), required: true },
      { name: 'name', label: t('form.author'), placeholder: t('form.author'), required: true }
    ]
  }

  const currentFields = fieldsByType[formData.documentType] || [];

  const handleInputChange = (field, value) => {
    setError('');
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle category selection
  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      category: category,
      documentType: '' // Reset document type when category changes
    }))
  }

  const handleGenerate = async () => {
    if (!formData.documentType) {
      setError(t('structuredInput.form.selectType'))
      return
    }

    const requiredFields = fieldsByType[formData.documentType]
    const missingField = requiredFields.find(field => field.required && !formData[field.name])

    if (missingField) {
      setError(`${t('structuredInput.error')} - ${missingField.label}`)
      return
    }

    setIsGenerating(true)
    setGeneratedContent(null)
    setError('')

    try {
      const { documentType, ...rest } = formData
      let apiEndpoint = '/api/generate'
      let payload = { ...rest, templateType: documentType }

      if (documentType === 'student_reply') {
        apiEndpoint = '/api/student_reply'
        payload = { student_name: formData.studentName, name: formData.name }
      } else if (documentType === 'holiday_notice') {
        apiEndpoint = '/api/holiday_notice'
        payload = { holiday_name: formData.holidayName, holiday_date: formData.holidayDate, name: formData.name }
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Generation failed' }))
        throw new Error(errorData.detail || 'Generation failed')
      }

      const data = await response.json()
      setGeneratedContent(data.content)
      setLastGenerationData(formData)
    } catch (err) {
      console.error('Generation error:', err)
      setError(err.message || t('structuredInput.generationError'))
    } finally {
      setIsGenerating(false)
    }
  }
  
  const handleSaveDraft = async () => {
    if (!generatedContent || !lastGenerationData) return;
    setIsSaving(true)
    setError('') 
    try {
      const typeLabel = t(`documentTypes.${lastGenerationData.documentType}`) || lastGenerationData.documentType
      const title = lastGenerationData.targetAudience 
        ? `${typeLabel} - ${lastGenerationData.targetAudience}`
        : typeLabel

      const newDraft = {
        type: lastGenerationData.documentType,
        title: title,
        content: generatedContent,
        createdAt: new Date().toISOString(),
        source: lastGenerationData,
      }
      
      const saveRes = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDraft)
      })

      if (!saveRes.ok) {
        const errorData = await saveRes.json().catch(() => ({}));
        throw new Error(errorData.detail || t('draftEditor.saveError'));
      }

      const savedDraft = await saveRes.json()
      navigate(`/draft/${savedDraft.id}`)

    } catch(err) {
        console.error("Save error:", err);
        setError(err.message || t('draftEditor.saveError'))
    } finally {
        setIsSaving(false);
    }
  }

  const handleCopy = () => {
    if(!generatedContent) return;
    const div = document.createElement('div');
    div.innerHTML = generatedContent.replace(/<br>/g, '\n');
    navigator.clipboard.writeText(div.innerText);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 3000);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">{t('structuredInput.title')}</h1>
        <p className="text-lg text-neutral-600">{t('structuredInput.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="card p-6">
          <div className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-tum-gray-700 mb-2">
                {t('form.category')}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(documentCategories).map(([categoryKey, documentTypes]) => (
                  <button
                    key={categoryKey}
                    onClick={() => handleCategoryChange(categoryKey)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formData.category === categoryKey
                        ? 'border-tum-blue bg-tum-blue/5 text-tum-blue'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="font-medium">{t(`documentCategories.${categoryKey}`)}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {documentTypes.length} {documentTypes.length === 1 ? t('form.type') : t('form.types')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Document Type Select - Only show if category is selected */}
            {formData.category && (
              <div>
                <label className="block text-sm font-medium text-tum-gray-700 mb-2">
                  {t('form.type')}
                </label>
                <select
                  value={formData.documentType || ''}
                  onChange={(e) => handleInputChange('documentType', e.target.value)}
                  className="select w-full"
                >
                  <option value="">{t('structuredInput.form.selectType')}</option>
                  {getDocumentTypesForCategory(formData.category).map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Dynamic Fields */}
            {currentFields.map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-tum-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-600 ml-1">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.name] || ''}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    className="textarea h-32"
                    placeholder={field.placeholder}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData[field.name] || ''}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    className="input"
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !formData.documentType}
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

        {/* Right Column: Output */}
        <div className="card p-6 sticky top-4">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">{t('structuredInput.output.title')}</h2>
          
          <div className="bg-neutral-50 p-4 rounded-lg min-h-[400px] max-h-[60vh] overflow-y-auto">
            {isGenerating ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 mr-2 animate-spin text-tum-blue" />
                <span className="text-neutral-600">{t('messages.loading')}</span>
              </div>
            ) : generatedContent ? (
              <div dangerouslySetInnerHTML={{ __html: generatedContent }} className="prose prose-sm max-w-none"/>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-neutral-500 text-center">{t('structuredInput.output.fillForm')}</p>
              </div>
            )}
          </div>
          
          {generatedContent && !isGenerating && (
            <div className="mt-4 flex gap-4">
              <button onClick={handleCopy} className="btn-secondary">
                <Copy className="h-4 w-4 mr-2"/>
                {t('actions.copy')}
              </button>
              <button onClick={handleSaveDraft} disabled={isSaving} className="btn-primary">
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Save className="h-4 w-4 mr-2"/>}
                {isSaving ? t('draftEditor.saving') : t('structuredInput.output.saveEdit')}
              </button>
            </div>
          )}
        </div>
      </div>

      {showCopySuccess && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-[9999]">
          <Check className="h-4 w-4" />
          <span>{t('messages.copySuccess')}</span>
        </div>
      )}
    </div>
  )
}

export default StructuredInput 