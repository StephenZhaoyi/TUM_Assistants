import React, { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import StructuredInput from './pages/StructuredInput'
import FreePromptInput from './pages/FreePromptInput'
import DraftEditor from './pages/DraftEditor'
import DraftHistory from './pages/DraftHistory'
import SelfCustomizingTemplates from './pages/SelfCustomizingTemplates'

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tum-blue-600 mx-auto mb-4"></div>
      <p className="text-neutral-600">Loading...</p>
    </div>
  </div>
)

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-neutral-900 mb-2">Something went wrong</h1>
            <p className="text-neutral-600 mb-4">
              We encountered an error while loading the application. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/draft/:id" element={<DraftEditor />} />
            <Route path="/draft/template-edit" element={<DraftEditor />} />
            <Route path="/draft-history" element={<DraftHistory />} />
            <Route path="/structured-input" element={<StructuredInput />} />
            <Route path="/free-prompt" element={<FreePromptInput />} />
            <Route path="/self-customizing-templates" element={<SelfCustomizingTemplates />} />
          </Routes>
        </Layout>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App 