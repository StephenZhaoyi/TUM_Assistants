import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const BackButton = () => {
  const navigate = useNavigate()
  const location = useLocation()
  // Show back button when not on the home page
  if (location.pathname === '/') {
    return null
  }
  return (
    <button
      onClick={() => navigate(-1)}
      className="p-2 mr-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded"
      title="Back"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  )
}

export default BackButton 