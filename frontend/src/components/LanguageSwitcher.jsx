import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useTranslation } from '../translations'
import { Globe } from 'lucide-react'

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage()
  const { t } = useTranslation()

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ]

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <Globe className="h-5 w-5 text-tum-gray-600" />
        <select
          value={language}
          onChange={(e) => changeLanguage(e.target.value)}
          className="bg-transparent border-none text-sm font-medium text-tum-gray-700 focus:outline-none focus:ring-0 cursor-pointer"
          title={t('language.switchLanguage')}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default LanguageSwitcher 