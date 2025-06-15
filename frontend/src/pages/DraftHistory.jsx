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
  Calendar,
  FileText,
  MessageSquare
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
    
    try {
      // Get all drafts from localStorage
      const savedDrafts = JSON.parse(localStorage.getItem('drafts') || '[]')
      setDrafts(savedDrafts)
      setFilteredDrafts(savedDrafts)
    } catch (error) {
      console.warn('Failed to load drafts from localStorage:', error)
      setDrafts([])
      setFilteredDrafts([])
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized])

  useEffect(() => {
    // Filter and sort drafts
    let filtered = drafts.filter(draft => {
      const matchesSearch = draft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           draft.content.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = selectedType === 'all' || draft.type === selectedType
      return matchesSearch && matchesType
    })

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt)
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt)
      } else if (sortBy === 'type') {
        return a.type.localeCompare(b.type)
      }
      return 0
    })

    setFilteredDrafts(filtered)
  }, [drafts, searchTerm, selectedType, sortBy])

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content)
    // Could add copy success notification here
  }

  const handleDelete = (id) => {
    const updatedDrafts = drafts.filter(draft => draft.id !== id)
    setDrafts(updatedDrafts)
    localStorage.setItem('drafts', JSON.stringify(updatedDrafts))
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case t('documentTypes.announcement'):
      case t('documentTypes.studentNotice'):
      case t('documentTypes.meetingMinutes'):
      case t('documentTypes.formalLetter'):
        return <FileText className="h-5 w-5" />
      case t('documentTypes.freeTextGeneration'):
        return <MessageSquare className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case t('documentTypes.announcement'):
        return 'bg-blue-100 text-blue-800'
      case t('documentTypes.studentNotice'):
        return 'bg-green-100 text-green-800'
      case t('documentTypes.meetingMinutes'):
        return 'bg-purple-100 text-purple-800'
      case t('documentTypes.formalLetter'):
        return 'bg-orange-100 text-orange-800'
      case t('documentTypes.freeTextGeneration'):
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-neutral-100 text-neutral-800'
    }
  }

  const documentTypes = ['all', t('documentTypes.announcement'), t('documentTypes.studentNotice'), t('documentTypes.meetingMinutes'), t('documentTypes.formalLetter'), t('documentTypes.freeTextGeneration')]

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
                <option key={type} value={type}>
                  {type === 'all' ? t('draftHistory.allTypes') : type}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
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
        {filteredDrafts.length === 0 ? (
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(draft.type)}`}>
                      {getTypeIcon(draft.type)}
                      <span className="ml-1">{draft.type}</span>
                    </span>
                    <span className="text-sm text-neutral-500">
                      {new Date(draft.createdAt).toLocaleDateString()}
                    </span>
                    {draft.updatedAt && (
                      <span className="text-xs text-neutral-400">
                        {t('draftHistory.edited')}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-neutral-900 mb-2">
                    {draft.title}
                  </h3>
                  <p className="text-sm text-neutral-600 line-clamp-2">
                    {draft.content.substring(0, 150)}...
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleCopy(draft.content)}
                    className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded"
                    title={t('draftHistory.copy')}
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                  <Link
                    to={`/draft/${draft.id}`}
                    className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded"
                    title={t('draftHistory.edit')}
                  >
                    <Edit className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(draft.id)}
                    className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded"
                    title={t('draftHistory.delete')}
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
  )
}

export default DraftHistory 