import React, { createContext, useContext, useState } from 'react'
import ReactDOM from 'react-dom'
import { Check } from 'lucide-react'

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

const ToastComponent = ({ toast }) => {
  if (!toast) return null

  return ReactDOM.createPortal(
    <div 
      className={`fixed ${toast.position || 'bottom-8'} left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-[10000] transition-all duration-300 ease-in-out ${
        toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <Check className="h-4 w-4" />
      <span>{toast.message}</span>
    </div>,
    document.body
  )
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = (message, options = {}) => {
    const id = Date.now()
    const toast = {
      id,
      message,
      position: options.position || 'bottom-8',
      visible: false
    }

    setToasts(prev => [...prev, toast])

    requestAnimationFrame(() => {
      setToasts(prev => 
        prev.map(t => t.id === id ? { ...t, visible: true } : t)
      )
    })

    setTimeout(() => {
      setToasts(prev => 
        prev.map(t => t.id === id ? { ...t, visible: false } : t)
      )
      
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 300)
    }, 2000)
  }

  const showCopySuccess = (message) => {
    showToast(message, { position: 'bottom-8' })
  }

  const showSaveSuccess = (message) => {
    showToast(message, { position: 'bottom-20' })
  }

  const value = {
    showToast,
    showCopySuccess,
    showSaveSuccess
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.map(toast => (
        <ToastComponent key={toast.id} toast={toast} />
      ))}
    </ToastContext.Provider>
  )
}
