'use client'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-spin">
          <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          </div>
        </div>
        <p className="mt-4 text-gray-300 text-lg">Securing your privacy...</p>
      </div>
    </div>
  )
}
