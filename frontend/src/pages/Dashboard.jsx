import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../translations'
import { 
  FileText, 
  MessageSquare, 
  Clock, 
  Copy, 
  Edit, 
  Trash2,
  Plus 
} from 'lucide-react'

// Helper: snake_case -> camelCase
const toCamel = (str) => str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

const Dashboard = () => {
  const [recentDrafts, setRecentDrafts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { t, isInitialized } = useTranslation()

  useEffect(() => {
    if (!isInitialized) return
    setIsLoading(true)
    fetch('/api/drafts')
      .then(res => res.json())
      .then(data => setRecentDrafts(data.slice(0, 5)))
      .catch(() => setRecentDrafts([]))
      .finally(() => setIsLoading(false))
  }, [isInitialized])

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content)
    // Could add copy success notification here
  }

  const handleDelete = async (id) => {
    // Optimistically update UI
    const updatedDrafts = recentDrafts.filter(draft => draft.id !== id);
    setRecentDrafts(updatedDrafts);
    
    // Call API to delete on server
    try {
      await fetch(`/api/drafts/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to delete draft:', error);
      // If API call fails, revert UI change
      // (This part can be improved with a more robust state management)
      fetch('/api/drafts')
        .then(res => res.json())
        .then(data => setRecentDrafts(data.slice(0, 5)))
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-tum-gray-900 mb-4">
          {t('dashboard.welcome.title')}
        </h1>
        <p className="text-lg text-tum-gray-600 mb-8 max-w-2xl mx-auto">
          {t('dashboard.welcome.subtitle')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/generate/structured"
            className="btn-primary inline-flex items-center"
          >
            <FileText className="h-6 w-6 mr-2" />
            {t('dashboard.welcome.structuredButton')}
          </Link>
          <Link
            to="/generate/free"
            className="btn-outline inline-flex items-center"
          >
            <MessageSquare className="h-6 w-6 mr-2" />
            {t('dashboard.welcome.freeButton')}
          </Link>
        </div>
      </div>

      {/* Recent Drafts */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-tum-gray-900">
            {t('dashboard.recentDrafts.title')}
          </h2>
          <Link
            to="/history"
            className="text-tum-blue-600 hover:text-tum-blue-700 text-sm font-medium"
          >
            {t('dashboard.recentDrafts.viewAll')}
          </Link>
        </div>

        {recentDrafts.length === 0 ? (
          <div className="card p-12 text-center">
            <FileText className="h-20 w-20 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-500 mb-2">{t('dashboard.recentDrafts.empty.title')}</p>
            <Link to="/generate/structured" className="btn-primary block mt-4 mx-auto w-max">
              {t('dashboard.recentDrafts.empty.button')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentDrafts.map((draft) => (
              <div key={draft.id} className="border border-tum-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-tum-blue-100 text-tum-blue-800">
                        {t(`documentTypes.${toCamel(draft.type || '')}`) || draft.type || 'N/A'}
                      </span>
                      <span className="text-sm text-tum-gray-500">
                        {draft.createdAt ? new Date(draft.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <h3 className="font-medium text-tum-gray-900 mb-2">
                      {draft.title || 'Untitled Draft'}
                    </h3>
                    <div 
                      className="text-sm text-tum-gray-600 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: (draft.content || '').substring(0, 150) + '...' }}
                    />
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleCopy(draft.content)}
                      className="p-2 text-tum-gray-500 hover:text-tum-gray-700 hover:bg-tum-gray-100 rounded"
                      title={t('actions.copy')}
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                    <Link
                      to={`/draft/${draft.id}`}
                      className="p-2 text-tum-gray-500 hover:text-tum-gray-700 hover:bg-tum-gray-100 rounded"
                      title={t('actions.edit')}
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(draft.id)}
                      className="p-2 text-tum-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                      title={t('actions.delete')}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-tum-blue-100 rounded-lg">
              <FileText className="h-8 w-8 text-tum-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-tum-gray-600">{t('dashboard.stats.totalGenerated')}</p>
              <p className="text-2xl font-bold text-tum-gray-900">
                {recentDrafts.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-tum-orange-100 rounded-lg">
              <Clock className="h-8 w-8 text-tum-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-tum-gray-600">{t('dashboard.stats.todayGenerated')}</p>
              <p className="text-2xl font-bold text-tum-gray-900">
                {recentDrafts.filter(draft => 
                  draft.createdAt && new Date(draft.createdAt).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-tum-gray-100 rounded-lg">
              <MessageSquare className="h-8 w-8 text-tum-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-tum-gray-600">{t('dashboard.stats.avgTime')}</p>
              <p className="text-2xl font-bold text-tum-gray-900">
                {t('dashboard.stats.avgTimeValue')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 