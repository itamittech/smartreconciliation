const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="shrink-0 border-t border-space-600 bg-space-900/50 px-6 py-3 flex items-center justify-between text-xs text-gray-500">
      <span>&copy; {currentYear} Smart Reconciliation. All rights reserved.</span>
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400">
          v1.0.0
        </span>
        <span className="px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          AI Enabled
        </span>
      </div>
    </footer>
  )
}

export { Footer }
