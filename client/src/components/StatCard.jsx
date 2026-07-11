export default function StatCard({ label, value, icon, accent = 'text-brand-600' }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <p className={`text-2xl font-bold mt-2 ${accent}`}>{value}</p>
    </div>
  )
}
