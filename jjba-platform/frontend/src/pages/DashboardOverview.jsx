import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Zap, Users, Plus, ChevronRight, Crown } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { db } from '../../lib/supabase'

function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="glass-card"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-2xl font-display text-gray-100">{value}</p>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">{label}</p>
        </div>
      </div>
    </motion.div>
  )
}

function PartCard({ part, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Link
        to={`/parts/${part.id}`}
        className="glass-card flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-jojo-purple-mid border border-jojo-gold/30 
                          flex items-center justify-center font-display text-jojo-gold text-sm">
            {part.part_number ?? '?'}
          </div>
          <div>
            <p className="text-gray-200 font-semibold text-sm">{part.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`badge-${part.status}`}>{part.status}</span>
              <span className="text-gray-600 text-xs">•</span>
              <span className="text-gray-500 text-xs font-mono">{part.setting ?? 'Setting TBD'}</span>
            </div>
          </div>
        </div>
        <ChevronRight size={14} className="text-gray-600 group-hover:text-jojo-gold transition-colors" />
      </Link>
    </motion.div>
  )
}

export default function DashboardOverview() {
  const { profile } = useAuth()
  const [myParts, setMyParts] = useState([])
  const [invitedParts, setInvitedParts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    loadData()
  }, [profile])

  async function loadData() {
    // Parts I created
    const { data: created } = await db.parts()
      .select('*')
      .eq('creator_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5)

    // Parts I was invited to
    const { data: memberships } = await db.memberships()
      .select('*, parts(*)')
      .eq('user_id', profile.id)
      .eq('invite_status', 'accepted')
      .limit(5)

    setMyParts(created ?? [])
    setInvitedParts(memberships?.map(m => m.parts).filter(Boolean) ?? [])
    setLoading(false)
  }

  const standCount = profile?.stands?.length ?? 0
  const hasStand = standCount > 0

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-2"
      >
        <h2 className="heading-gold text-2xl mb-1">
          Yare yare daze...
        </h2>
        <p className="text-gray-400 font-body">
          Welcome back, <span className="text-gray-200 font-semibold">{profile?.display_name}</span>.
          {!hasStand && (
            <span className="text-jojo-gold ml-2">
              You haven't created a Stand yet.{' '}
              <Link to="/stands/new" className="underline hover:text-jojo-gold-light">Create one →</Link>
            </span>
          )}
        </p>
      </motion.div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Parts Created" value={myParts.length} 
          color="bg-purple-900/60 text-purple-300" delay={0.05} />
        <StatCard icon={Users} label="Parts Joined" value={invitedParts.length}
          color="bg-cyan-900/60 text-cyan-300" delay={0.1} />
        <StatCard icon={Zap} label="Stands" value={standCount}
          color="bg-yellow-900/60 text-yellow-300" delay={0.15} />
        <StatCard icon={Crown} label="Role" value={profile?.role === 'game_master' ? 'GM' : 'Player'}
          color="bg-pink-900/60 text-pink-300" delay={0.2} />
      </div>

      {/* ── My Parts ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-300 font-display text-sm uppercase tracking-widest">
            My Parts (GM)
          </h3>
          <Link to="/parts/new" className="btn-gold text-xs flex items-center gap-1">
            <Plus size={12} /> New Part
          </Link>
        </div>

        {loading ? (
          <div className="glass-card text-center py-8 text-gray-600 font-mono text-sm">
            Loading...
          </div>
        ) : myParts.length === 0 ? (
          <div className="glass-card text-center py-10">
            <BookOpen size={32} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 font-body mb-4">No Parts created yet.</p>
            <Link to="/parts/new" className="btn-gold">
              Create Your First Part
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {myParts.map((part, i) => (
              <PartCard key={part.id} part={part} delay={i * 0.05} />
            ))}
          </div>
        )}
      </section>

      {/* ── Invited Parts ── */}
      {invitedParts.length > 0 && (
        <section>
          <h3 className="text-gray-300 font-display text-sm uppercase tracking-widest mb-4">
            Parts I'm In
          </h3>
          <div className="space-y-2">
            {invitedParts.map((part, i) => (
              <PartCard key={part.id} part={part} delay={i * 0.05} />
            ))}
          </div>
        </section>
      )}

      {/* ── Pending invites ── */}
      <PendingInvites userId={profile?.id} />
    </div>
  )
}

function PendingInvites({ userId }) {
  const [invites, setInvites] = useState([])

  useEffect(() => {
    if (!userId) return
    db.memberships()
      .select('*, parts(*), profiles!invited_by(username, display_name)')
      .eq('user_id', userId)
      .eq('invite_status', 'pending')
      .then(({ data }) => setInvites(data ?? []))
  }, [userId])

  if (invites.length === 0) return null

  async function respond(membershipId, accept) {
    await db.memberships()
      .update({
        invite_status: accept ? 'accepted' : 'declined',
        ...(accept ? { joined_at: new Date().toISOString() } : {})
      })
      .eq('id', membershipId)
    setInvites(prev => prev.filter(i => i.id !== membershipId))
  }

  return (
    <section>
      <h3 className="text-gray-300 font-display text-sm uppercase tracking-widest mb-4">
        Pending Invites
      </h3>
      <div className="space-y-2">
        {invites.map(invite => (
          <motion.div
            key={invite.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card flex items-center justify-between"
          >
            <div>
              <p className="text-gray-200 text-sm font-semibold">{invite.parts?.title}</p>
              <p className="text-gray-500 text-xs">
                Invited by <span className="text-jojo-gold">@{invite.profiles?.username}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => respond(invite.id, true)}
                className="btn-gold text-xs px-3 py-1"
              >
                Accept
              </button>
              <button
                onClick={() => respond(invite.id, false)}
                className="btn-glass text-xs px-3 py-1"
              >
                Decline
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
