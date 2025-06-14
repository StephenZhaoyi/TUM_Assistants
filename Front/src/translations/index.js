import { en } from './en'
import { de } from './de'
import { useLanguage } from '../contexts/LanguageContext'

const translations = {
  en,
  de
}

export const useTranslation = () => {
  const { language, isInitialized } = useLanguage()
  
  const t = (key, params = {}) => {
    // If not initialized yet, return a fallback
    if (!isInitialized) {
      return key
    }
    
    const keys = key.split('.')
    let value = translations[language]
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        console.warn(`Translation key not found: ${key} for language: ${language}`)
        return key
      }
    }
    
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      // Handle interpolation
      return Object.keys(params).reduce((str, param) => {
        return str.replace(new RegExp(`{${param}}`, 'g'), params[param])
      }, value)
    }
    
    return value || key
  }
  
  return { t, language, isInitialized }
}

export { translations } 