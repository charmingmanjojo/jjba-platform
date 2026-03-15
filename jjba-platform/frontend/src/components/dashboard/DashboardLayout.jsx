import { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Zap, BookOpen, MessageSquare,
  User, LogOut, Menu, X, ChevronRight, Star
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

// ── Stand stat rank display ─────────────────────────────────
function StatRank({ label, rank }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-400 w-24 font-mono uppercase tracking-wider">{label}</span>
      <span className={`stat-rank stat-rank-${rank}`}>{rank}</span>
    </div>
  )
}

// ── Sidebar nav item ────────────────────────────────────────
function NavItem({ to, icon: Icon, label, active }) {
  return (
    <Link
      to={to}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg mx-2 
        font-body text-sm tracking-wide transition-all duration-200
        ${active
          ? 'text-jojo-gold bg-jojo-gold/10 border border-jojo-gold/30 shadow-stand-glow'
          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
        }
      `}
    >
      <Icon size={16} className={active ? 'text-jojo-gold' : ''} />
      <span>{label}</span>
      {active && <ChevronRight size={12} className="ml-auto text-jojo-gold" />}
    </Link>
  )
}

// ── Mini Stand card for sidebar ─────────────────────────────
function SidebarStandCard({ stand }) {
  if (!stand) return (
    <Link to="/stands/new" className="glass-light rounded-lg p-3 mx-2 block hover:border-jojo-gold/40 transition-colors">
      <p className="text-xs text-gray-500 text-center font-mono">No Stand equipped</p>
      <p className="text-xs text-jojo-gold text-center mt-1 hover:underline">+ Create Stand</p>
    </Link>
  )

  return (
    <div className="glass-light rounded-lg p-3 mx-2 animate-pulse-gold">
      <p className="heading-gold text-xs mb-1 truncate">{stand.name}</p>
      <p className="text-gray-400 text-xs mb-2 font-mono truncate">{stand.ability_name}</p>
      <div className="grid grid-cols-2 gap-1">
        {[
          ['POW', stand.stat_destructive_power],
          ['SPD', stand.stat_speed],
          ['RNG', stand.stat_range],
          ['DUR', stand.stat_durability],
        ].map(([label, rank]) => (
          <div key={label} className="flex items-center gap-1">
            <span className="text-gray-500 font-mono text-xs w-8">{label}</span>
            <span className={`stat-rank stat-rank-${rank} w-6 h-5 text-xs`}>{rank}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Dashboard Layout ───────────────────────────────────
export default function DashboardLayout() {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const activeStand = profile?.stands?.[0] ?? null

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/parts', icon: BookOpen, label: 'Parts' },
    { to: '/stands', icon: Zap, label: 'Stands' },
    { to: '/chat', icon: MessageSquare, label: 'Chat Rooms' },
    { to: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <div className="min-h-screen">
      {/* Fixed background */}
      <div className="app-background" />

      {/* Mobile hamburger */}
      <button
        className="fixed top-4 left-4 z-[60] glass p-2 rounded-lg md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={18} className="text-jojo-gold" /> : <Menu size={18} className="text-jojo-gold" />}
      </button>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''} flex flex-col`}>
        {/* Logo */}
        <div className="px-4 py-6 border-b border-jojo-gold/20">
          <h1 className="heading-gold text-lg leading-tight">
            「JJBA」
          </h1>
          <p className="text-gray-500 text-xs font-mono mt-1 tracking-widest uppercase">
            Roleplay Platform
          </p>
          <div className="mt-1">
            <span className="badge-recruiting">Beta</span>
          </div>
        </div>

        {/* User info */}
        {profile && (
          <div className="px-4 py-4 border-b border-jojo-gold/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-jojo-purple-mid border border-jojo-gold/40 
                              flex items-center justify-center font-display text-jojo-gold text-sm">
                {profile.display_name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="overflow-hidden">
                <p className="text-gray-200 text-sm font-semibold truncate">{profile.display_name}</p>
                <p className="text-gray-500 text-xs font-mono truncate">@{profile.username}</p>
              </div>
            </div>
            {/* Active stand */}
            <SidebarStandCard stand={activeStand} />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavItem
              key={item.to}
              {...item}
              active={location.pathname === item.to || location.pathname.startsWith(item.to + '/')}
            />
          ))}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-jojo-gold/10">
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-gray-500 hover:text-red-400 
                       text-sm font-body transition-colors w-full px-2 py-2 rounded-lg
                       hover:bg-red-900/20"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="main-content">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
