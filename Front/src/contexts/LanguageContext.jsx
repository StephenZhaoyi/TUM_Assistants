import React, { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en') // Default to English
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    try {
      // Load saved language preference from localStorage
      const savedLanguage = localStorage.getItem('language')
      if (savedLanguage && ['en', 'de'].includes(savedLanguage)) {
        setLanguage(savedLanguage)
      }
    } catch (error) {
      console.warn('Failed to load language preference from localStorage:', error)
      // Keep default language
    } finally {
      setIsInitialized(true)
    }
  }, [])

  const changeLanguage = (newLanguage) => {
    if (['en', 'de'].includes(newLanguage)) {
      setLanguage(newLanguage)
      try {
        localStorage.setItem('language', newLanguage)
      } catch (error) {
        console.warn('Failed to save language preference to localStorage:', error)
      }
    }
  }

  const value = {
    language,
    changeLanguage,
    isInitialized
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
} 