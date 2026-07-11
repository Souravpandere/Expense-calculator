export default function LoadingSpinner({ fullPage = false, label = 'Loading...' }) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      <p className="text-slate-500 dark:text-slate-400 text-sm">{label}</p>
    </div>
  )
  if (fullPage) {
    return <div className="min-h-[60vh] flex items-center justify-center">{spinner}</div>
  }
  return spinner
}
