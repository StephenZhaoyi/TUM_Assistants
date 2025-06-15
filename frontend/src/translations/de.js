export const de = {
  // Navigation
  nav: {
    home: 'Startseite',
    structuredInput: 'Strukturierte Eingabe',
    freePrompt: 'Freitext',
    history: 'Verlauf'
  },

  // Header
  header: {
    title: 'TUM Verwaltungsdokument-Generator',
    logo: 'TUM Logo'
  },

  // Dashboard
  dashboard: {
    welcome: {
      title: 'Willkommen beim TUM Verwaltungsdokument-Generator',
      subtitle: 'Generieren Sie hochwertige Verwaltungsdokumente schnell mit KI-Unterstützung, einschließlich Ankündigungen, Benachrichtigungen, Sitzungsprotokolle und andere professionelle Dokumente',
      structuredButton: 'Strukturierte Eingabe-Generierung',
      freeButton: 'Freitext-Generierung'
    },
    recentDrafts: {
      title: 'Kürzlich generierte Entwürfe',
      viewAll: 'Alle anzeigen',
      empty: {
        title: 'Noch keine Entwürfe generiert',
        subtitle: 'Beginnen Sie mit der Erstellung Ihres ersten Verwaltungsdokuments',
        button: 'Generierung starten'
      }
    },
    stats: {
      totalGenerated: 'Gesamt generiert',
      todayGenerated: 'Heute generiert',
      avgTime: 'Durchschnittliche Zeit',
      avgTimeValue: '<5 Sek'
    }
  },

  // Structured Input
  structuredInput: {
    title: 'Strukturierte Eingabe-Generierung',
    subtitle: 'Generieren Sie professionelle Verwaltungsdokumente schnell durch Ausfüllen von Formularen',
    form: {
      title: 'Eingabeinformationen',
      documentType: 'Dokumenttyp',
      targetAudience: 'Zielgruppe',
      keyPoints: 'Wichtige Inhaltspunkte',
      tone: 'Tonauswahl',
      required: 'Erforderlich',
      selectType: 'Bitte wählen Sie den Dokumenttyp',
      describePoints: 'Bitte beschreiben Sie detailliert die wichtigsten Inhaltspunkte, die Sie einbeziehen möchten...',
      fillForm: 'Füllen Sie das Formular links aus und klicken Sie auf die Generierungsschaltfläche'
    },
    output: {
      title: 'Generierungsergebnis',
      copyContent: 'Inhalt kopieren',
      saveEdit: 'Speichern & Bearbeiten',
      regenerate: 'Neu generieren'
    },
    generating: 'Generiere...',
    generateDraft: 'Entwurf generieren',
    error: 'Bitte füllen Sie alle erforderlichen Felder aus',
    generationError: 'Generierung fehlgeschlagen, bitte versuchen Sie es erneut'
  },

  // Free Prompt Input
  freePrompt: {
    title: 'Freitext-Generierung',
    subtitle: 'Beschreiben Sie Ihre Anforderungen in natürlicher Sprache, und KI generiert professionelle Verwaltungsdokumente für Sie',
    form: {
      title: 'Eingabeanforderungen',
      description: 'Beschreiben Sie Ihre Anforderungen',
      placeholder: 'Bitte geben Sie den Inhalt ein, den Sie generieren möchten, z.B.: "Schreiben Sie eine Benachrichtigung, um Studenten über Änderungen im Prüfungsplan zu informieren"',
      examples: 'Beispiel-Prompts',
      tone: 'Tonauswahl'
    },
    output: {
      title: 'Generierungsergebnis',
      copyContent: 'Inhalt kopieren',
      saveEdit: 'Speichern & Bearbeiten',
      regenerate: 'Neu generieren',
      fillForm: 'Geben Sie Ihre Anforderungen links ein und klicken Sie auf die Generierungsschaltfläche'
    },
    generating: 'Generiere...',
    generateDraft: 'Entwurf generieren',
    error: 'Bitte geben Sie den Inhalt ein, den Sie generieren möchten',
    generationError: 'Generierung fehlgeschlagen, bitte versuchen Sie es erneut'
  },

  // Draft History
  draftHistory: {
    title: 'Verlauf',
    subtitle: 'Alle Ihre generierten Entwürfe anzeigen und verwalten',
    totalDrafts: 'Gesamt {count} Entwürfe',
    search: 'Entwürfe durchsuchen...',
    allTypes: 'Alle Typen',
    sortBy: {
      newest: 'Neueste erstellt',
      oldest: 'Älteste erstellt',
      type: 'Nach Typ'
    },
    empty: {
      title: 'Keine Entwürfe',
      subtitle: 'Sie haben noch keine Entwürfe generiert',
      noResults: 'Keine passenden Entwürfe gefunden',
      startGenerating: 'Generierung starten'
    },
    edited: '(Bearbeitet)',
    copy: 'Kopieren',
    edit: 'Bearbeiten',
    delete: 'Löschen'
  },

  // Draft Editor
  draftEditor: {
    title: 'Entwurfs-Editor',
    newDraft: 'Neuer Entwurf',
    draft: 'Entwurf',
    back: 'Zurück',
    copy: 'Kopieren',
    save: 'Speichern',
    regenerate: 'Neu generieren',
    suggestions: 'Vorschläge',
    placeholder: 'Beginnen Sie mit der Bearbeitung Ihres Dokuments...',
    saving: 'Speichere...',
    saveSuccess: 'Erfolgreich gespeichert',
    saveError: 'Speichern fehlgeschlagen',
    regenerateError: 'Neu generieren fehlgeschlagen',
    suggestionsError: 'Vorschläge generieren fehlgeschlagen',
    generatingSuggestions: 'Generiere Vorschläge...',
    applySuggestion: 'Vorschlag anwenden',
    moreFormal: 'Formellere Ausdrucksweise',
    moreDetailed: 'Detailliertere Beschreibung',
    morePolite: 'Höflichere Ausdrucksweise',
    noSuggestions: 'Keine Vorschläge verfügbar'
  },

  // Document types
  documentTypes: {
    announcement: 'Ankündigung',
    studentNotice: 'Studentische Mitteilung',
    meetingMinutes: 'Sitzungsprotokoll',
    formalLetter: 'Formeller Brief',
    notification: 'Benachrichtigung',
    report: 'Bericht',
    letter: 'Brief',
    memo: 'Memo',
    policy: 'Richtlinie',
    guideline: 'Leitfaden',
    freeTextGeneration: 'Freitextgenerierung'
  },

  // Audience options
  audience: {
    students: 'Studenten',
    faculty: 'Lehrpersonal & Mitarbeiter',
    department: 'Bestimmte Abteilung',
    all: 'Alle Mitarbeiter'
  },

  // Common actions
  actions: {
    copy: 'Kopieren',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    save: 'Speichern',
    cancel: 'Abbrechen',
    generate: 'Generieren',
    clear: 'Löschen',
    download: 'Herunterladen',
    upload: 'Hochladen',
    submit: 'Absenden',
    back: 'Zurück',
    next: 'Weiter',
    previous: 'Zurück'
  },

  // Tone selector
  tone: {
    neutral: {
      label: 'Neutral',
      description: 'Objektiv, formal'
    },
    friendly: {
      label: 'Freundlich',
      description: 'Sanft, zugänglich'
    },
    firm: {
      label: 'Höflich aber bestimmt',
      description: 'Ernst, autoritativ'
    }
  },

  // Form labels
  form: {
    title: 'Titel',
    content: 'Inhalt',
    type: 'Typ',
    tone: 'Ton',
    date: 'Datum',
    author: 'Autor',
    department: 'Abteilung',
    recipient: 'Empfänger',
    subject: 'Betreff',
    description: 'Beschreibung',
    keywords: 'Schlüsselwörter',
    template: 'Vorlage'
  },

  // Messages
  messages: {
    copySuccess: 'Inhalt in die Zwischenablage kopiert',
    deleteConfirm: 'Sind Sie sicher, dass Sie diesen Entwurf löschen möchten?',
    saveSuccess: 'Entwurf erfolgreich gespeichert',
    generateSuccess: 'Dokument erfolgreich generiert',
    error: 'Ein Fehler ist aufgetreten',
    loading: 'Generiere...',
    noResults: 'Keine Ergebnisse gefunden'
  },

  // Language switcher
  language: {
    en: 'English',
    de: 'Deutsch',
    switchLanguage: 'Sprache wechseln'
  },

  // Placeholders
  placeholders: {
    title: 'Dokumenttitel eingeben...',
    content: 'Geben Sie hier Ihren Inhalt ein...',
    description: 'Beschreibung eingeben...',
    keywords: 'Schlüsselwörter durch Kommas getrennt eingeben...',
    search: 'Entwürfe durchsuchen...'
  }
} 