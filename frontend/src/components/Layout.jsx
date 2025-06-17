import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from '../translations'
import LanguageSwitcher from './LanguageSwitcher'
import { 
  Home, 
  FileText, 
  MessageSquare, 
  History
} from 'lucide-react'
import tumLogo from '../assets/TUM.png'

const Layout = ({ children }) => {
  const location = useLocation()
  const { t, isInitialized } = useTranslation()

  const navItems = [
    { path: '/', label: t('nav.home'), icon: Home },
    { path: '/generate/structured', label: t('nav.structuredInput'), icon: FileText },
    { path: '/generate/free', label: t('nav.freePrompt'), icon: MessageSquare },
    { path: '/history', label: t('nav.history'), icon: History },
  ]

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tum-blue-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src={tumLogo}
                alt={t('header.logo')}
                className="h-12 w-auto"
              />
            </div>
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-4">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-2 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? 'bg-tum-blue-100 text-tum-blue-700'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

export default Layout 