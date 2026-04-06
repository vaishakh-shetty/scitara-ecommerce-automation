import { useEffect, useState } from 'react'

interface Props {
  message: string
  show: boolean
  onClose: () => void
}

export default function Toast({ message, show, onClose }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        onClose()
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!visible) return null

  return (
    <div
      data-testid="toast"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg animate-fade-in"
    >
      <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span className="text-sm font-medium">{message}</span>
    </div>
  )
}
