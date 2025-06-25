import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../translations'
import { 
  History, 
  Search, 
  Filter, 
  Copy, 
  Edit, 
  Trash2,
  FileText,
  Loader2
} from 'lucide-react'

const DraftHistory = () => {
  const { t, isInitialized } = useTranslation()
  const [drafts, setDrafts] = useState([])
  const [filteredDrafts, setFilteredDrafts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isInitialized) return
    setIsLoading(true)
    fetch('/api/drafts')
      .then(res => res.json())
      .then(data => {
        const draftsArray = Array.isArray(data) ? data : []
        setDrafts(draftsArray)
        setFilteredDrafts(draftsArray)
      })
      .catch(() => {
        setDrafts([])
        setFilteredDrafts([])
      })
      .finally(() => setIsLoading(false))
  }, [isInitialized])

  useEffect(() => {
    let filtered = drafts.filter(draft => {
      if (!draft || !draft.title || !draft.content) return false;
      const matchesSearch = (draft.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (draft.content || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = selectedType === 'all' || (draft.type || '') === selectedType
      return matchesSearch && matchesType
    })

    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        const dateA = a.createdAt && !isNaN(Date.parse(a.createdAt)) ? Date.parse(a.createdAt) : 0
        const dateB = b.createdAt && !isNaN(Date.parse(b.createdAt)) ? Date.parse(b.createdAt) : 0
        return dateB - dateA
      } else if (sortBy === 'oldest') {
        const dateA = a.createdAt && !isNaN(Date.parse(a.createdAt)) ? Date.parse(a.createdAt) : 0
        const dateB = b.createdAt && !isNaN(Date.parse(b.createdAt)) ? Date.parse(b.createdAt) : 0
        return dateA - dateB
      } else if (sortBy === 'type') {
        return (a.type || '').localeCompare(b.type || '')
      }
      return 0
    })

    setFilteredDrafts(filtered)
  }, [drafts, searchTerm, selectedType, sortBy])
  
  const documentTypes = [
    { value: 'all', label: t('draftHistory.allTypes') },
    { value: 'course_registration', label: t('documentTypes.courseRegistration') },
    { value: 'event_notice', label: t('documentTypes.eventNotice') },
    { value: 'schedule_request', label: t('documentTypes.scheduleRequest') },
    { value: 'schedule_announcement', label: t('documentTypes.scheduleAnnouncement') },
    { value: 'schedule_change', label: t('documentTypes.scheduleChange') },
    { value: 'student_reply', label: t('documentTypes.studentReply') },
    { value: 'holiday_notice', label: t('documentTypes.holidayNotice') },
    { value: 'free_prompt', label: t('documentTypes.freeTextGeneration') }
  ];

  // Helper: snake_case -> camelCase
  const toCamel = (str) => str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

  const handleCopy = (content) => {
    const div = document.createElement('div');
    div.innerHTML = content.replace(/<br>/g, '\n');
    navigator.clipboard.writeText(div.innerText);
  }

  const handleDelete = async (id) => {
    await fetch(`/api/drafts/${id}`, { method: 'DELETE' })
    const newDrafts = drafts.filter(d => d.id !== id)
    setDrafts(newDrafts)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            {t('draftHistory.title')}
          </h1>
          <p className="text-lg text-neutral-600">
            {t('draftHistory.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">
            {t('draftHistory.totalDrafts', { count: filteredDrafts.length })}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder={t('draftHistory.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="select pl-10 w-full"
            >
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select pl-10 w-full"
            >
              <option value="newest">{t('draftHistory.sortBy.newest')}</option>
              <option value="oldest">{t('draftHistory.sortBy.oldest')}</option>
              <option value="type">{t('draftHistory.sortBy.type')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drafts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="card p-12 text-center">
             <Loader2 className="h-12 w-12 text-neutral-400 mx-auto mb-4 animate-spin" />
          </div>
        ) : filteredDrafts.length === 0 ? (
          <div className="card p-12 text-center">
            <History className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              {t('draftHistory.empty.title')}
            </h3>
            <p className="text-neutral-500 mb-4">
              {searchTerm || selectedType !== 'all' 
                ? t('draftHistory.empty.noResults')
                : t('draftHistory.empty.subtitle')
              }
            </p>
            {!searchTerm && selectedType === 'all' && (
              <Link to="/generate/structured" className="btn-primary">
                {t('draftHistory.empty.startGenerating')}
              </Link>
            )}
          </div>
        ) : (
          filteredDrafts.map((draft) => (
            <div key={draft.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                      <FileText className="h-4 w-4 mr-1.5" />
                      {t(`documentTypes.${toCamel(draft.type || '')}`) || draft.type || 'N/A'}
                    </span>
                    <span className="text-sm text-neutral-500">
                      {draft.createdAt && !isNaN(Date.parse(draft.createdAt))
                        ? new Date(draft.createdAt).toLocaleDateString()
                        : '-'}
                    </span>
                    {draft.updatedAt && (
                      <span className="text-xs text-neutral-400">
                        {t('draftHistory.edited')}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-neutral-900 mb-2">
                    {draft.title || 'Untitled Draft'}
                  </h3>
                  <div 
                    className="text-sm text-neutral-600 line-clamp-2 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: (draft.content || '').substring(0, 200) + '...' }}
                  />
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleCopy(draft.content)}
                    className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded"
                    title={t('actions.copy')}
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                  <Link
                    to={`/draft/${draft.id}`}
                    className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded"
                    title={t('actions.edit')}
                  >
                    <Edit className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(draft.id)}
                    className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded"
                    title={t('actions.delete')}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DraftHistory; 