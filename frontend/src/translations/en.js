export const en = {
  // Navigation
  nav: {
    home: 'Home',
    structuredInput: 'Structured Input',
    freePrompt: 'Free Text',
    history: 'History'
  },

  // Header
  header: {
    title: 'TUM Administrative Document Generator',
    logo: 'TUM Logo'
  },

  // Dashboard
  dashboard: {
    welcome: {
      title: 'Welcome to TUM Administrative Document Generator',
      subtitle: 'Generate high-quality administrative documents quickly with AI assistance, including announcements, notifications, meeting minutes, and other professional documents',
      structuredButton: 'Structured Input Generation',
      freeButton: 'Free Text Generation'
    },
    recentDrafts: {
      title: 'Recently Generated Drafts',
      viewAll: 'View All',
      empty: {
        title: 'No drafts generated yet',
        subtitle: 'Start creating your first administrative document',
        button: 'Start Generating'
      }
    },
    stats: {
      totalGenerated: 'Total Generated',
      todayGenerated: 'Generated Today',
      avgTime: 'Average Time',
      avgTimeValue: '<5 sec'
    }
  },

  // Structured Input
  structuredInput: {
    title: 'Structured Input Generation',
    subtitle: 'Generate professional administrative documents quickly by filling out forms',
    form: {
      required: 'Required',
      selectType: 'Please select document type',
      describePoints: 'Please describe in detail the main content points you want to include...',
      fillForm: 'Fill out the form on the left and click generate button'
    },
    output: {
      title: 'Generation Result',
      copyContent: 'Copy Content',
      saveEdit: 'Save & Edit',
      regenerate: 'Regenerate',
      fillForm: 'Fill out the form on the left and click generate to see the result here.'
    },
    generating: 'Generating...',
    generateDraft: 'Generate Draft',
    error: 'Please fill in all required fields',
    generationError: 'Generation failed, please try again'
  },

  // Free Prompt Input
  freePrompt: {
    title: 'Free Text Generation',
    subtitle: 'Describe your requirements in natural language, and AI will generate professional administrative documents for you',
    form: {
      title: 'Input Requirements',
      description: 'Describe Your Requirements',
      placeholder: 'Please enter the content you want to generate, such as: "Write a notice to inform students about exam schedule changes"',
      examples: 'Example Prompts',
      tone: 'Tone Selection'
    },
    output: {
      title: 'Generation Result',
      copyContent: 'Copy Content',
      saveEdit: 'Save & Edit',
      regenerate: 'Regenerate',
      fillForm: 'Enter your requirements on the left and click the generate button'
    },
    generating: 'Generating...',
    generateDraft: 'Generate Draft',
    error: 'Please enter the content you want to generate',
    generationError: 'Generation failed, please try again'
  },

  // Draft History
  draftHistory: {
    title: 'History',
    subtitle: 'View and manage all your generated drafts',
    totalDrafts: 'Total {count} drafts',
    search: 'Search drafts...',
    allTypes: 'All Types',
    sortBy: {
      newest: 'Newest Created',
      oldest: 'Oldest Created',
      type: 'By Type'
    },
    empty: {
      title: 'No drafts',
      subtitle: 'You haven\'t generated any drafts yet',
      noResults: 'No matching drafts found',
      startGenerating: 'Start Generating'
    },
    edited: '(Edited)',
    copy: 'Copy',
    edit: 'Edit',
    delete: 'Delete',
    timeAgo: {
      justNow: 'Just now',
      minutesAgo: '{minutes} minutes ago',
      hourAgo: '1 hour ago',
      hoursAgo: '{hours} hours ago'
    }
  },

  // Draft Editor
  draftEditor: {
    title: 'Draft Editor',
    newDraft: 'New Draft',
    draft: 'Draft',
    back: 'Back',
    copy: 'Copy',
    save: 'Save',
    regenerate: 'Regenerate',
    suggestions: 'Suggestions',
    placeholder: 'Start editing your document...',
    saving: 'Saving...',
    saveSuccess: 'Saved successfully',
    saveError: 'Save failed',
    regenerateError: 'Regeneration failed',
    suggestionsError: 'Failed to generate suggestions',
    generatingSuggestions: 'Generating suggestions...',
    applySuggestion: 'Apply Suggestion',
    moreFormal: 'More formal expression',
    moreDetailed: 'More detailed description',
    morePolite: 'More polite expression',
    noSuggestions: 'No suggestions available'
  },

  // Document types
  documentTypes: {
    announcement: 'Announcement',
    studentNotice: 'Student Notice',
    meetingMinutes: 'Meeting Minutes',
    formalLetter: 'Formal Letter',
    notification: 'Notification',
    report: 'Report',
    letter: 'Letter',
    memo: 'Memo',
    policy: 'Policy',
    guideline: 'Guideline',
    courseRegistration: 'Course Registration Notice',
    freeTextGeneration: 'Free Text Generation',
    eventNotice: 'Event Notice',
    scheduleRequest: 'Schedule Request',
    scheduleAnnouncement: 'Schedule Announcement',
    scheduleChange: 'Schedule Change',
    studentReply: 'Student Reply',
    holidayNotice: 'Holiday Notice'
  },

  // Audience options
  audience: {
    students: 'Students',
    faculty: 'Faculty & Staff',
    department: 'Specific Department',
    all: 'All Personnel'
  },

  // Common actions
  actions: {
    copy: 'Copy',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    generate: 'Generate',
    clear: 'Clear',
    download: 'Download',
    upload: 'Upload',
    submit: 'Submit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous'
  },

  // Tone selector
  tone: {
    neutral: {
      label: 'Neutral',
      description: 'Objective, formal'
    },
    friendly: {
      label: 'Friendly',
      description: 'Gentle, approachable'
    },
    firm: {
      label: 'Polite but Firm',
      description: 'Serious, authoritative'
    }
  },

  // Form labels
  form: {
    title: 'Title',
    content: 'Content',
    type: 'Document Type',
    tone: 'Tone',
    date: 'Date',
    author: 'Author',
    department: 'Department',
    recipient: 'Target Audience',
    subject: 'Subject',
    description: 'Description',
    keywords: 'Keywords',
    template: 'Template',
    startDate: 'Start Date',
    endDate: 'End Date',
    additionalNote: 'Additional Notes',
    courseName: 'Course Name',
    courseCode: 'Course Code',
    instructorName: 'Instructor Name',
    courseStartDate: 'Course Start Date',
    weeklyTime: 'Weekly Time',
    weeklyLocation: 'Weekly Location',
    eventName: 'Event Name',
    eventIntro: 'Event Introduction',
    eventTime: 'Event Time',
    location: 'Location',
    registration: 'Registration',
    language: 'Language',
    reason: 'Reason',
    oldTime: 'Original Time',
    oldLocation: 'Original Location',
    newTime: 'New Time',
    newLocation: 'New Location',
    studentName: 'Student Name',
    holidayName: 'Holiday Name',
    holidayDate: 'Holiday Date',
    replyDeadline: 'Reply Deadline',
    timeOptions: 'Time Options',
    semester: 'Semester'
  },

  // Messages
  messages: {
    copySuccess: 'Content copied to clipboard',
    deleteConfirm: 'Are you sure you want to delete this draft?',
    saveSuccess: 'Draft saved successfully',
    generateSuccess: 'Document generated successfully',
    error: 'An error occurred',
    loading: 'Generating...',
    noResults: 'No results found'
  },

  // Language switcher
  language: {
    en: 'English',
    de: 'Deutsch',
    switchLanguage: 'Switch Language'
  },

  // Placeholders
  placeholders: {
    title: 'Enter document title...',
    content: 'Enter your content here...',
    description: 'Enter description...',
    keywords: 'Enter keywords separated by commas...',
    search: 'Search drafts...',
    recipient: 'Enter target audience...',
    additionalNote: 'Enter any additional notes or requirements...',
    startDate: 'Enter start date (e.g., "01.05.2025")',
    endDate: 'Enter end date (e.g., "01.06.2025")'
  }
} 