import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Zap, BookOpen, MessageSquare,
  User, LogOut, Menu, X, ChevronRight,
  Music, Volume2, VolumeX, SkipForward, SkipBack,
  Play, Pause, Image
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

// ── Background wallpapers ────────────────────────────────────
// Add your own images to /public/backgrounds/ and list them here
const BACKGROUNDS = [
  '/bg.jpg',
  '/backgrounds/bg2.jpg',
  '/backgrounds/bg3.jpg',
  '/backgrounds/bg4.jpg',
]

// ── Music tracks ─────────────────────────────────────────────
// Add your own mp3s to /public/music/ and list them here
const TRACKS = [
  { title: "Giorno's Theme", artist: 'Yugo Kanno', file: '/music/giornos-theme.mp3' },
  { title: "il vento d'oro", artist: 'Yugo Kanno', file: '/music/il-vento-doro.mp3' },
  { title: 'Great Days', artist: 'Karen Aoki', file: '/music/great-days.mp3' },
  { title: 'Sono Chi no Sadame', artist: 'Hiroaki Tommy Tominaga', file: '/music/sono-chi-no-sadame.mp3' },
  { title: 'Chase', artist: 'JJBA OST', file: '/music/chase.mp3' },
]

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
    <Link to="/stands/new" className="glass-light rounded-lg p-3 block hover:border-jojo-gold/40 transition-colors">
      <p className="text-xs text-gray-500 text-center font-mono">No Stand equipped</p>
      <p className="text-xs text-jojo-gold text-center mt-1 hover:underline">+ Create Stand</p>
    </Link>
  )
  return (
    <div className="glass-light rounded-lg p-3">
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

// ── Music Player ─────────────────────────────────────────────
function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [volume, setVolume] = useState(0.4)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = isMuted ? 0 : volume

    const updateProgress = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100)
    }
    const onEnded = () => nextTrack()

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('ended', onEnded)
    }
  }, [currentTrack, isMuted, volume])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) { audio.pause() } else { audio.play().catch(() => {}) }
    setIsPlaying(!isPlaying)
  }

  function nextTrack() {
    const next = (currentTrack + 1) % TRACKS.length
    setCurrentTrack(next)
    setProgress(0)
    if (isPlaying) setTimeout(() => audioRef.current?.play().catch(() => {}), 100)
  }

  function prevTrack() {
    const prev = (currentTrack - 1 + TRACKS.length) % TRACKS.length
    setCurrentTrack(prev)
    setProgress(0)
    if (isPlaying) setTimeout(() => audioRef.current?.play().catch(() => {}), 100)
  }

  function seek(e) {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration
  }

  const track = TRACKS[currentTrack]

  return (
    <>
      <audio ref={audioRef} src={track.file} preload="none" />

      {/* Collapsed pill */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 glass px-3 py-2 rounded-full
                       flex items-center gap-2 hover:border-jojo-gold/50 transition-all"
          >
            <Music size={14} className={isPlaying ? 'text-jojo-gold animate-pulse' : 'text-gray-400'} />
            {isPlaying && (
              <span className="text-jojo-gold text-xs font-mono truncate max-w-[120px]">
                {track.title}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded player */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 glass rounded-xl p-4 w-72"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Music size={14} className="text-jojo-gold" />
                <span className="text-jojo-gold font-display text-xs uppercase tracking-widest">Now Playing</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-gray-300 transition-colors">
                <X size={14} />
              </button>
            </div>

            <div className="mb-3">
              <p className="text-gray-200 text-sm font-semibold truncate">{track.title}</p>
              <p className="text-gray-500 text-xs font-mono truncate">{track.artist}</p>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-gray-800 rounded-full mb-3 cursor-pointer" onClick={seek}>
              <div className="h-full bg-jojo-gold rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setIsMuted(!isMuted); if (audioRef.current) audioRef.current.volume = isMuted ? volume : 0 }}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>

              <div className="flex items-center gap-3">
                <button onClick={prevTrack} className="text-gray-400 hover:text-gray-200 transition-colors">
                  <SkipBack size={16} />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-9 h-9 rounded-full bg-jojo-gold/20 border border-jojo-gold/40
                             flex items-center justify-center text-jojo-gold hover:bg-jojo-gold/30 transition-all"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button onClick={nextTrack} className="text-gray-400 hover:text-gray-200 transition-colors">
                  <SkipForward size={16} />
                </button>
              </div>

              <input
                type="range" min="0" max="1" step="0.05"
                value={isMuted ? 0 : volume}
                onChange={e => {
                  const v = parseFloat(e.target.value)
                  setVolume(v)
                  setIsMuted(false)
                  if (audioRef.current) audioRef.current.volume = v
                }}
                className="w-16 accent-jojo-gold"
              />
            </div>

            {/* Track list */}
            <div className="mt-3 border-t border-jojo-gold/10 pt-3 space-y-1">
              {TRACKS.map((t, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentTrack(i)
                    setProgress(0)
                    if (isPlaying) setTimeout(() => audioRef.current?.play().catch(() => {}), 100)
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors
                    ${i === currentTrack ? 'text-jojo-gold bg-jojo-gold/10' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                >
                  <span className="font-mono mr-2">{i + 1}.</span>{t.title}
                </button>
              ))}
            </div>

            <p className="text-gray-700 text-xs mt-3 font-mono text-center">
              Add mp3s to /public/music/
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Background Rotator ───────────────────────────────────────
function BackgroundRotator() {
  const [current, setCurrent] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [autoRotate, setAutoRotate] = useState(false)
  const [rotateInterval, setRotateInterval] = useState(30)

  useEffect(() => {
    if (!autoRotate) return
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % BACKGROUNDS.length)
    }, rotateInterval * 1000)
    return () => clearInterval(timer)
  }, [autoRotate, rotateInterval])

  useEffect(() => {
    const bg = document.getElementById('app-bg')
    if (bg) bg.style.backgroundImage = `url('${BACKGROUNDS[current]}')`
  }, [current])

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-24 z-50 glass px-3 py-2 rounded-full
                       flex items-center gap-2 hover:border-jojo-gold/50 transition-all"
          >
            <Image size={14} className="text-gray-400" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-28 z-50 glass rounded-xl p-4 w-64"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Image size={14} className="text-jojo-gold" />
                <span className="text-jojo-gold font-display text-xs uppercase tracking-widest">Background</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-gray-300">
                <X size={14} />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {BACKGROUNDS.map((bg, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-16 rounded-lg border-2 transition-all bg-cover bg-center
                    ${i === current ? 'border-jojo-gold' : 'border-transparent hover:border-jojo-gold/40'}`}
                  style={{ backgroundImage: `url('${bg}')`, backgroundSize: 'cover' }}
                >
                  {i === current && (
                    <div className="w-full h-full rounded-lg bg-jojo-gold/20 flex items-center justify-center">
                      <span className="text-jojo-gold text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Prev / Next */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setCurrent((current - 1 + BACKGROUNDS.length) % BACKGROUNDS.length)} className="btn-glass text-xs px-3 py-1">← Prev</button>
              <span className="text-gray-500 text-xs font-mono">{current + 1}/{BACKGROUNDS.length}</span>
              <button onClick={() => setCurrent((current + 1) % BACKGROUNDS.length)} className="btn-glass text-xs px-3 py-1">Next →</button>
            </div>

            {/* Auto-rotate */}
            <div className="border-t border-jojo-gold/10 pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs font-mono">Auto-rotate</span>
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`w-10 h-5 rounded-full transition-all relative ${autoRotate ? 'bg-jojo-gold/40' : 'bg-gray-700'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${autoRotate ? 'left-5 bg-jojo-gold' : 'left-0.5 bg-gray-400'}`} />
                </button>
              </div>
              {autoRotate && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs font-mono">Every</span>
                  <select value={rotateInterval} onChange={e => setRotateInterval(parseInt(e.target.value))} className="select-glass text-xs py-1 flex-1">
                    <option value={15}>15s</option>
                    <option value={30}>30s</option>
                    <option value={60}>1 min</option>
                    <option value={300}>5 min</option>
                  </select>
                </div>
              )}
            </div>

            <p className="text-gray-700 text-xs mt-3 font-mono text-center">
              Add images to /public/backgrounds/
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
      <div id="app-bg" className="app-background" />

      <button
        className="fixed top-4 left-4 z-[60] glass p-2 rounded-lg md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={18} className="text-jojo-gold" /> : <Menu size={18} className="text-jojo-gold" />}
      </button>

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

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''} flex flex-col`}>
        <div className="px-4 py-6 border-b border-jojo-gold/20">
          <h1 className="heading-gold text-lg leading-tight">「JJBA」</h1>
          <p className="text-gray-500 text-xs font-mono mt-1 tracking-widest uppercase">Roleplay Platform</p>
          <div className="mt-1"><span className="badge-recruiting">Beta</span></div>
        </div>

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
            <SidebarStandCard stand={activeStand} />
          </div>
        )}

        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavItem
              key={item.to}
              {...item}
              active={location.pathname === item.to || location.pathname.startsWith(item.to + '/')}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-jojo-gold/10">
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-gray-500 hover:text-red-400
                       text-sm font-body transition-colors w-full px-2 py-2 rounded-lg hover:bg-red-900/20"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

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

      {/* ── FLOATING WIDGETS (bottom right) ── */}
      <BackgroundRotator />
      <MusicPlayer />
    </div>
  )
}
