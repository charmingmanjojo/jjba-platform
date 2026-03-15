import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'

export default function AuthPage() {
  const { user, signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    email: '', password: '', username: '', displayName: ''
  })

  if (user) return <Navigate to="/dashboard" replace />

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn({ email: form.email, password: form.password })
      if (error) toast.error(error.message)
    } else {
      if (!form.username.trim()) return toast.error('Username required')
      if (form.username.length < 3) return toast.error('Username must be at least 3 characters')
      const { error } = await signUp({
        email: form.email,
        password: form.password,
        username: form.username.toLowerCase().replace(/\s/g, '_'),
        displayName: form.displayName || form.username,
      })
      if (error) toast.error(error.message)
      else toast.success('Welcome. Check your email to confirm your account.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="app-background" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass rounded-2xl p-8 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="heading-gold text-3xl mb-1">「JJBA」</h1>
          <p className="text-gray-500 font-mono text-xs tracking-widest uppercase">
            Roleplay Platform — Beta
          </p>
          <div className="divider-gold mt-4" />
        </div>

        {/* Mode tabs */}
        <div className="flex rounded-lg overflow-hidden border border-jojo-gold/20 mb-6">
          {['login', 'signup'].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`
                flex-1 py-2 text-xs font-mono uppercase tracking-widest transition-all duration-200
                ${mode === m
                  ? 'bg-jojo-gold/20 text-jojo-gold border-jojo-gold/40'
                  : 'text-gray-500 hover:text-gray-300'
                }
              `}
            >
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, x: mode === 'login' ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {mode === 'signup' && (
              <>
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5 block">
                    Username *
                  </label>
                  <input
                    className="input-glass"
                    placeholder="jotaro_k"
                    value={form.username}
                    onChange={set('username')}
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5 block">
                    Display Name
                  </label>
                  <input
                    className="input-glass"
                    placeholder="Jotaro Kujo"
                    value={form.displayName}
                    onChange={set('displayName')}
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5 block">
                Email *
              </label>
              <input
                className="input-glass"
                type="email"
                placeholder="user@example.com"
                value={form.email}
                onChange={set('email')}
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5 block">
                Password *
              </label>
              <input
                className="input-glass"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'One moment...'
                : mode === 'login' ? 'Yare yare...' : 'Awaken Your Stand'
              }
            </button>
          </motion.form>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
