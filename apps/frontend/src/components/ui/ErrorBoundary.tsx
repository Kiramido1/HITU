import React, { Component, ErrorInfo } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props { children: React.ReactNode }
interface State { hasError: boolean; error: Error | null; errorInfo: ErrorInfo | null }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    console.error('[HITU ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,50,50,0.06)_0%,transparent_70%)]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="font-sora text-2xl font-bold text-[#F8FAFC] mb-2">Something went wrong</h1>
          <p className="text-sm text-[#94A3B8] mb-6">
            An unexpected error occurred. The engineering team has been notified.
          </p>
          {this.state.error && (
            <div className="mb-6 p-3 rounded-xl bg-[rgba(15,23,42,0.6)] border border-red-500/15 text-left">
              <p className="text-xs font-mono text-red-400 break-all">{this.state.error.message}</p>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[rgba(200,169,91,0.1)] border border-[rgba(200,169,91,0.25)] text-[#C8A95B] text-sm font-semibold hover:bg-[rgba(200,169,91,0.15)] transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
            <button
              onClick={() => { window.location.href = '/' }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[rgba(15,23,42,0.6)] border border-[rgba(200,169,91,0.1)] text-[#94A3B8] text-sm font-semibold hover:text-[#F8FAFC] transition-colors"
            >
              <Home className="w-4 h-4" /> Go Home
            </button>
          </div>
        </motion.div>
      </div>
    )
  }
}
