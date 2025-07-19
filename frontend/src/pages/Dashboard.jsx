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
  Plus,
  Check
} from 'lucide-react'
import { apiUrl } from '../utils/api'

// Helper: snake_case -> camelCase
const toCamel = (str) => str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

const Dashboard = () => {
  const [recentDrafts, setRecentDrafts] = useState([])
  const [allDrafts, setAllDrafts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { t, isInitialized } = useTranslation()
  const [showCopySuccess, setShowCopySuccess] = useState(false)

  // Helper: Get document type label
  const getDocumentTypeLabel = (type) => {
    if (!type) return 'N/A';
    
    // First try with toCamel conversion
    const camelCase = toCamel(type);
    const translated = t(`documentTypes.${camelCase}`);
    
    // If translation exists and is not the key itself, use it
    if (translated && translated !== `documentTypes.${camelCase}`) {
      return translated;
    }
    
    // Fallback: try direct type mapping
    const directMapping = {
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
      'guideline': t('documentTypes.guideline')
    };
    
    return directMapping[type] || type || 'N/A';
  };

  // Helper: Generate title from content and source data
  const generateTitleFromContent = (draft) => {
    if (!draft) return 'Untitled Draft';
    
    // If draft has source data, use it to generate meaningful title
    if (draft.source) {
      const source = draft.source;
      
      switch (draft.type) {
        case 'student_reply':
          return source.studentName ? `Reply to ${source.studentName}` : 'Student Reply';
          
        case 'holiday_notice':
          if (source.holidayName && source.holidayDate) {
            return `${source.holidayName} - ${source.holidayDate}`;
          } else if (source.holidayName) {
            return source.holidayName;
          } else if (source.holidayDate) {
            return `Holiday - ${source.holidayDate}`;
          }
          return 'Holiday Notice';
          
        case 'course_registration':
          const audience = source.targetAudience || 'Students';
          const startDate = source.startDate || '';
          const endDate = source.endDate || '';
          if (startDate && endDate) {
            return `${audience} - ${startDate} to ${endDate}`;
          } else if (startDate) {
            return `${audience} - From ${startDate}`;
          }
          return `${audience} Registration`;
          
        case 'event_notice':
          const eventName = source.courseName || source.eventName || '';
          const eventTime = source.eventTime || '';
          if (eventName && eventTime) {
            return `${eventName} - ${eventTime}`;
          } else if (eventName) {
            return eventName;
          }
          return 'Event Notice';
          
        case 'schedule_request':
          const courseName = source.courseName || '';
          const courseCode = source.courseCode || '';
          if (courseName && courseCode) {
            return `${courseName} (${courseCode}) - Schedule Coordination Request`;
          } else if (courseName) {
            return `${courseName} - Schedule Coordination Request`;
          }
          return 'Schedule Coordination Request';
          
        case 'schedule_announcement':
          const annCourseName = source.courseName || '';
          const annCourseCode = source.courseCode || '';
          const weeklyTime = source.weeklyTime || '';
          if (annCourseName && weeklyTime) {
            return `${annCourseName} - ${weeklyTime}`;
          } else if (annCourseName) {
            return `${annCourseName} - Schedule Announcement`;
          }
          return 'Schedule Announcement';
          
        case 'schedule_change':
          const changeCourseName = source.courseName || '';
          const oldTime = source.oldTime || '';
          const newTime = source.newTime || '';
          if (changeCourseName && oldTime && newTime) {
            return `${changeCourseName} - ${oldTime} → ${newTime}`;
          } else if (changeCourseName) {
            return `${changeCourseName} - Schedule Change`;
          }
          return 'Schedule Change';
          
        default:
          break;
      }
    }
    
    // For free text generation, summarize content into a title
    if (draft.type === 'freeTextGeneration' && draft.content) {
      // Remove HTML tags and get plain text
      const plainText = draft.content.replace(/<[^>]*>/g, '').replace(/<br>/g, ' ');
      
      // Try to extract meaningful information from content
      const lines = plainText.split('\n').filter(line => line.trim().length > 0);
      
      // Look for common patterns in administrative documents
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Look for titles/headings (usually in ** or all caps)
        if (trimmedLine.includes('**') || /^[A-Z\s]+$/.test(trimmedLine)) {
          const title = trimmedLine.replace(/\*\*/g, '').trim();
          if (title.length > 5 && title.length < 80) {
            return title;
          }
        }
        
        // Look for "Dear" or "Sehr geehrte" (letter openings)
        if (trimmedLine.startsWith('Dear ') || trimmedLine.startsWith('Sehr geehrte ')) {
          const match = trimmedLine.match(/(?:Dear|Sehr geehrte)\s+([^,]+)/);
          if (match && match[1]) {
            return `Letter to ${match[1].trim()}`;
          }
        }
        
        // Look for specific document types in content
        if (trimmedLine.toLowerCase().includes('notice') || trimmedLine.toLowerCase().includes('bekanntmachung')) {
          return 'Notice';
        }
        if (trimmedLine.toLowerCase().includes('announcement') || trimmedLine.toLowerCase().includes('ankündigung')) {
          return 'Announcement';
        }
        if (trimmedLine.toLowerCase().includes('schedule') || trimmedLine.toLowerCase().includes('termin')) {
          return 'Schedule Information';
        }
        if (trimmedLine.toLowerCase().includes('exam') || trimmedLine.toLowerCase().includes('prüfung')) {
          return 'Exam Information';
        }
        if (trimmedLine.toLowerCase().includes('course') || trimmedLine.toLowerCase().includes('kurs')) {
          return 'Course Information';
        }
        if (trimmedLine.toLowerCase().includes('holiday') || trimmedLine.toLowerCase().includes('feiertag')) {
          return 'Holiday Notice';
        }
        if (trimmedLine.toLowerCase().includes('meeting') || trimmedLine.toLowerCase().includes('sitzung')) {
          return 'Meeting Information';
        }
      }
      
      // If no specific pattern found, extract first meaningful sentence
      const sentences = plainText.split(/[.!?。！？]/).filter(s => s.trim().length > 10);
      if (sentences.length > 0) {
        const firstSentence = sentences[0].trim();
        // Clean up the sentence and limit length
        const cleanSentence = firstSentence.replace(/^\s*[A-Z\s]+\s*/, ''); // Remove leading caps
        if (cleanSentence.length > 5) {
          return cleanSentence.length > 60 ? cleanSentence.substring(0, 60) + '...' : cleanSentence;
        }
      }
      
      // Fallback: use prompt if available
      if (draft.prompt) {
        const prompt = draft.prompt.trim();
        if (prompt.length > 0) {
          return prompt.length > 60 ? prompt.substring(0, 60) + '...' : prompt;
        }
      }
    }
    
    // Fallback: extract from content
    if (draft.content) {
      // Remove HTML tags and get plain text
      const plainText = draft.content.replace(/<[^>]*>/g, '').replace(/<br>/g, ' ');
      
      // Get first meaningful sentence or first 50 characters
      const sentences = plainText.split(/[.!?。！？]/).filter(s => s.trim().length > 0);
      if (sentences.length > 0) {
        const firstSentence = sentences[0].trim();
        if (firstSentence.length > 10) {
          return firstSentence.length > 60 ? firstSentence.substring(0, 60) + '...' : firstSentence;
        }
      }
      
      // Fallback to first 50 characters
      return plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText || 'Untitled Draft';
    }
    
    return 'Untitled Draft';
  };

  // Helper: Format date with minutes (show "xx minutes ago" if within 30 minutes, otherwise show date and time)
  const formatDateWithMinutes = (dateString) => {
    if (!dateString || isNaN(Date.parse(dateString))) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    if (diffInMinutes < 30) {
      return diffInMinutes < 1 ? t('draftHistory.timeAgo.justNow') : t('draftHistory.timeAgo.minutesAgo', { minutes: diffInMinutes });
    }
    // Otherwise show date and time
    return date.toLocaleString(t('language') === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (!isInitialized) return
    setIsLoading(true)
    fetch(apiUrl('/api/drafts'))
      .then(res => {
        if (!res.ok) {
          return res.text().then(text => { throw new Error('API 请求失败: ' + res.status + ' 内容: ' + text); });
        }
        return res.json();
      })
      .then(data => {
        setAllDrafts(data)
        setRecentDrafts(data.slice(0, 5))
      })
      .catch(() => {
        setAllDrafts([])
        setRecentDrafts([])
      })
      .finally(() => setIsLoading(false))
  }, [isInitialized])

  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content)
      setShowCopySuccess(true)
      // Automatically hide the prompt after 3 seconds
      setTimeout(() => {
        setShowCopySuccess(false)
      }, 3000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const handleDelete = async (id) => {
    // Optimistically update UI
    const updatedDrafts = recentDrafts.filter(draft => draft.id !== id);
    setRecentDrafts(updatedDrafts);
    
    // Call API to delete on server
    try {
      await fetch(apiUrl(`/api/drafts/${id}`), { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to delete draft:', error);
      // If API call fails, revert UI change
      // (This part can be improved with a more robust state management)
      fetch(apiUrl('/api/drafts'))
        .then(res => res.json())
        .then(data => setRecentDrafts(data.slice(0, 5)))
    }
  }

  // Statistics
  const totalGenerated = allDrafts.length
  const generatedToday = allDrafts.filter(draft => draft.createdAt && new Date(draft.createdAt).toDateString() === new Date().toDateString()).length
  // Average generation time (seconds)
  const avgTime = (() => {
    const times = allDrafts
      .map(d => {
        if (d.createdAt && d.updatedAt) {
          return (new Date(d.updatedAt) - new Date(d.createdAt)) / 1000
        }
        return null
      })
      .filter(t => t !== null && !isNaN(t) && t >= 0)
    if (!times.length) return '--'
    const avg = times.reduce((a, b) => a + b, 0) / times.length
    return `${Math.round(avg)}s`
  })()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Copy Success Toast */}
      {showCopySuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50">
          <Check className="h-4 w-4" />
          <span>{t('messages.copySuccess')}</span>
        </div>
      )}
      
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-tum-gray-900 mb-4">
          {t('dashboard.welcome.title')}
        </h1>
        <p className="text-lg text-tum-gray-600 mb-8 max-w-2xl mx-auto">
          {t('dashboard.welcome.subtitle')}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/structured-input" className="btn-primary">
            {t('dashboard.welcome.structuredButton')}
          </Link>
          <Link to="/free-prompt" className="btn-outline">
            {t('dashboard.welcome.freeButton')}
          </Link>
          <Link to="/self-customizing-templates" className="btn-outline">
            {t('nav.selfCustomizingTemplates')}
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
            to="/draft-history"
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
                        {getDocumentTypeLabel(draft.type)}
                      </span>
                      <span className="text-sm text-tum-gray-500">
                        {formatDateWithMinutes(draft.createdAt)}
                      </span>
                    </div>
                    <h3 className="font-medium text-tum-gray-900 mb-2">
                      {generateTitleFromContent(draft)}
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
                {totalGenerated}
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
                {generatedToday}
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
                {avgTime}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 