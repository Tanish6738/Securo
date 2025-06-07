'use client'

export default function Loading() {  return (
    <div className="min-h-screen bg-theme-background flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-theme-primary rounded-full animate-spin">
          <div className="w-12 h-12 bg-theme-background rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-theme-primary rounded-full"></div>
          </div>
        </div>
        <p className="mt-4 text-theme-text text-lg">Securing your privacy...</p>
      </div>
    </div>
  )
}
