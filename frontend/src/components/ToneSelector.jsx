import React from 'react'
import { useTranslation } from '../translations'

const ToneSelector = ({ selectedTone, onToneChange }) => {
  const { t } = useTranslation()

  const tones = [
    {
      value: 'neutral',
      label: t('tone.neutral.label'),
      description: t('tone.neutral.description'),
      color: 'bg-tum-gray-100 text-tum-gray-700 border-tum-gray-300'
    },
    {
      value: 'friendly',
      label: t('tone.friendly.label'),
      description: t('tone.friendly.description'),
      color: 'bg-tum-blue-100 text-tum-blue-700 border-tum-blue-300'
    },
    {
      value: 'firm',
      label: t('tone.firm.label'),
      description: t('tone.firm.description'),
      color: 'bg-tum-orange-100 text-tum-orange-700 border-tum-orange-300'
    }
  ]

  return (
    <div className="space-y-3">
      {tones.map((tone) => (
        <label
          key={tone.value}
          className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
            selectedTone === tone.value
              ? `${tone.color} border-current`
              : 'border-tum-gray-200 hover:border-tum-gray-300'
          }`}
        >
          <input
            type="radio"
            name="tone"
            value={tone.value}
            checked={selectedTone === tone.value}
            onChange={(e) => onToneChange(e.target.value)}
            className="sr-only"
          />
          <div className="flex-1">
            <div className="font-medium">{tone.label}</div>
            <div className="text-sm opacity-75">{tone.description}</div>
          </div>
          <div className={`w-4 h-4 rounded-full border-2 ${
            selectedTone === tone.value
              ? 'border-current bg-current'
              : 'border-tum-gray-300'
          }`}>
            {selectedTone === tone.value && (
              <div className="w-2 h-2 bg-white rounded-full m-0.5" />
            )}
          </div>
        </label>
      ))}
    </div>
  )
}

export default ToneSelector 