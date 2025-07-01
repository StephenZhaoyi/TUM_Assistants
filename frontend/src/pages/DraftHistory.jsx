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
  Loader2,
  Check
} from 'lucide-react'

const DraftHistory = () => {
  const { t, isInitialized } = useTranslation()
  const [drafts, setDrafts] = useState([])
  const [filteredDrafts, setFilteredDrafts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [isLoading, setIsLoading] = useState(true)
  const [showCopySuccess, setShowCopySuccess] = useState(false)


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
    { value: 'course_registration', label: t('documentTypes.courseRegistration'), category: 'student' },
    { value: 'event_notice', label: t('documentTypes.eventNotice'), category: 'student' },
    { value: 'schedule_request', label: t('documentTypes.scheduleRequest'), category: 'staff' },
    { value: 'schedule_announcement', label: t('documentTypes.scheduleAnnouncement'), category: 'student' },
    { value: 'schedule_change', label: t('documentTypes.scheduleChange'), category: 'all' },
    { value: 'student_reply', label: t('documentTypes.studentReply'), category: 'student' },
    { value: 'holiday_notice', label: t('documentTypes.holidayNotice'), category: 'all' },
    { value: 'freeTextGeneration', label: t('documentTypes.freeTextGeneration') }
  ];

  // Group document types by category for the select dropdown
  const groupedDocumentTypes = [
    { value: 'all', label: t('draftHistory.allTypes') },
    ...Object.entries({
      staff: documentTypes.filter(dt => dt.category === 'staff'),
      student: documentTypes.filter(dt => dt.category === 'student'),
      all: documentTypes.filter(dt => dt.category === 'all')
    }).map(([category, types]) => ({
      label: t(`documentCategories.${category}`),
      options: types
    }))
  ];

  // Helper: snake_case -> camelCase
  const toCamel = (str) => str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

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

  // Helper: Format date with minutes
  const formatDateWithMinutes = (dateString) => {
    if (!dateString || isNaN(Date.parse(dateString))) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    if (diffInMinutes < 30) {
      return diffInMinutes < 1 ? t('draftHistory.timeAgo.justNow') : t('draftHistory.timeAgo.minutesAgo', { minutes: diffInMinutes });
    }
    // 否则显示日月年时分
    return date.toLocaleString(t('language') === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCopy = async (content) => {
    try {
      const div = document.createElement('div');
      div.innerHTML = content.replace(/<br>/g, '\n');
      await navigator.clipboard.writeText(div.innerText);
      setShowCopySuccess(true);
      // 3秒后自动隐藏提示
      setTimeout(() => {
        setShowCopySuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }

  const handleDelete = async (id) => {
    await fetch(`/api/drafts/${id}`, { method: 'DELETE' })
    const newDrafts = drafts.filter(d => d.id !== id)
    setDrafts(newDrafts)
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
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 text-center flex-col">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">{t('draftHistory.title')}</h1>
        <p className="text-lg text-neutral-600">{t('draftHistory.subtitle')}</p>
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
              <option value="all">{t('draftHistory.allTypes')}</option>
              <optgroup label={t('documentCategories.staff')}>
                {documentTypes.filter(dt => dt.category === 'staff').map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label={t('documentCategories.student')}>
                {documentTypes.filter(dt => dt.category === 'student').map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label={t('documentCategories.all')}>
                {documentTypes.filter(dt => dt.category === 'all').map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </optgroup>
              <option value="freeTextGeneration">{t('documentTypes.freeTextGeneration')}</option>
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
                      {getDocumentTypeLabel(draft.type)}
                    </span>
                    <span className="text-sm text-neutral-500">
                      {formatDateWithMinutes(draft.createdAt)}
                    </span>
                    {draft.updatedAt && (
                      <span className="text-xs text-neutral-400">
                        {t('draftHistory.edited')}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-neutral-900 mb-2">
                    {generateTitleFromContent(draft)}
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