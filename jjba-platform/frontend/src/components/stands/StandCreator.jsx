import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, AlertTriangle, ChevronDown, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { db } from '../../lib/supabase'

const RANKS = ['A', 'B', 'C', 'D', 'E']
const STAND_TYPES = [
  { value: 'close-range', label: 'Close-Range Punch Ghost' },
  { value: 'long-range', label: 'Long-Range / Remote' },
  { value: 'automatic', label: 'Automatic Stand' },
  { value: 'bound', label: 'Bound Stand' },
  { value: 'colony', label: 'Colony Stand' },
  { value: 'act', label: 'Act Stand' },
  { value: 'special', label: 'Special / Unique' },
]

const STAT_LABELS = [
  { key: 'stat_destructive_power', label: 'Destructive Power' },
  { key: 'stat_speed',             label: 'Speed' },
  { key: 'stat_range',             label: 'Range' },
  { key: 'stat_durability',        label: 'Durability' },
  { key: 'stat_precision',         label: 'Precision' },
  { key: 'stat_potential',         label: 'Potential' },
]

const RANK_COLORS = {
  A: 'border-yellow-400 bg-yellow-400/20 text-yellow-300',
  B: 'border-green-400 bg-green-400/20 text-green-300',
  C: 'border-blue-400 bg-blue-400/20 text-blue-300',
  D: 'border-orange-400 bg-orange-400/20 text-orange-300',
  E: 'border-red-400 bg-red-400/20 text-red-300',
}

function RankSelector({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-mono uppercase tracking-wider text-gray-400">{label}</label>
      <div className="flex gap-1.5">
        {RANKS.map(rank => (
          <button
            key={rank}
            type="button"
            onClick={() => onChange(rank)}
            className={`
              w-10 h-10 rounded border-2 font-mono font-bold text-sm
              transition-all duration-150
              ${value === rank
                ? RANK_COLORS[rank]
                : 'border-gray-700 text-gray-600 hover:border-gray-500 hover:text-gray-400'
              }
            `}
          >
            {rank}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function StandCreator() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    battle_cry: '',
    stand_type: 'close-range',
    stat_destructive_power: 'C',
    stat_speed: 'C',
    stat_range: 'C',
    stat_durability: 'C',
    stat_precision: 'C',
    stat_potential: 'C',
    ability_name: '',
    ability_description: '',
    critical_weakness: '',
    weakness_detail: '',
  })

  const set = (key) => (e) => setForm(prev => ({
    ...prev,
    [key]: typeof e === 'string' ? e : e.target.value
  }))

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.name.trim()) return toast.error('Stand needs a name')
    if (!form.ability_name.trim()) return toast.error('Stand needs an ability name')
    if (!form.ability_description.trim()) return toast.error('Describe how the ability works')
    if (!form.critical_weakness.trim()) return toast.error('A critical weakness is MANDATORY')

    setSaving(true)
    const { data, error } = await db.stands().insert({
      owner_id: profile.id,
      ...form,
      approval_status: 'pending',
    }).select().single()

    setSaving(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(`「${form.name}」 has awakened!`)
      navigate(`/stands/${data.id}`)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Zap className="text-jojo-gold" size={24} />
          <h2 className="heading-gold text-2xl">Stand Awakening</h2>
        </div>
        <p className="text-gray-500 font-body text-sm">
          Define your Stand's power, limits, and — critically — its weakness. 
          Stands without exploitable flaws will not be approved.
        </p>
        <div className="divider-gold mt-4" />
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ── Identity ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6 space-y-4"
        >
          <h3 className="text-jojo-gold font-display text-sm uppercase tracking-widest mb-4">
            Identity
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5 block">
                Stand Name *
              </label>
              <input
                className="input-glass"
                placeholder="e.g. Crazy Diamond"
                value={form.name}
                onChange={set('name')}
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5 block">
                Battle Cry
              </label>
              <input
                className="input-glass"
                placeholder="e.g. DORA DORA DORA"
                value={form.battle_cry}
                onChange={set('battle_cry')}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5 block">
              Stand Type *
            </label>
            <div className="relative">
              <select
                className="select-glass"
                value={form.stand_type}
                onChange={set('stand_type')}
              >
                {STAND_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.section>

        {/* ── Stats ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-jojo-gold font-display text-sm uppercase tracking-widest mb-6">
            Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {STAT_LABELS.map(({ key, label }) => (
              <RankSelector
                key={key}
                label={label}
                value={form[key]}
                onChange={(rank) => setForm(prev => ({ ...prev, [key]: rank }))}
              />
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-yellow-900/20 border border-yellow-800/40">
            <p className="text-yellow-600 text-xs font-mono">
              ⚠ A-rank across the board will be flagged. GMs value creative stats over raw power.
            </p>
          </div>
        </motion.section>

        {/* ── Ability ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6 space-y-4"
        >
          <h3 className="text-jojo-gold font-display text-sm uppercase tracking-widest mb-4">
            Ability
          </h3>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5 block">
              Ability Name *
            </label>
            <input
              className="input-glass"
              placeholder="e.g. Restoration"
              value={form.ability_name}
              onChange={set('ability_name')}
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5 block">
              Ability Logic — Be Precise *
            </label>
            <p className="text-gray-600 text-xs mb-2 font-body">
              Explain the physics. What exactly can it do? What are its spatial limits? 
              Time constraints? Can it affect non-organic matter? The more specific, the better.
            </p>
            <textarea
              className="input-glass min-h-[140px] resize-y"
              placeholder={`Example: "Restoration" can repair any non-living object to its previous state by touch. The restoration is limited to objects the user has personally touched before. It cannot restore living tissue. The process takes approximately 3 seconds per cubic foot of material. Objects destroyed by Stand abilities require 2x the normal time...`}
              value={form.ability_description}
              onChange={set('ability_description')}
            />
          </div>
        </motion.section>

        {/* ── Critical Weakness (mandatory, styled prominently) ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-xl p-6 space-y-4 border-red-900/50"
          style={{ borderColor: 'rgba(185, 28, 28, 0.4)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-red-400" size={18} />
            <h3 className="text-red-400 font-display text-sm uppercase tracking-widest">
              Critical Weakness — Mandatory
            </h3>
          </div>

          <div className="p-3 rounded-lg bg-red-900/20 border border-red-800/30 mb-4">
            <p className="text-red-400 text-xs font-mono leading-relaxed">
              Every Stand must have an exploitable weakness. This is what enables tactical combat. 
              "The user takes damage" is not specific enough. Describe EXACTLY how the weakness can 
              be exploited by an opponent.
            </p>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5 block">
              The Achilles Heel *
            </label>
            <input
              className="input-glass border-red-900/50 focus:border-red-500/50"
              placeholder="e.g. Cannot restore objects currently being observed by another Stand"
              value={form.critical_weakness}
              onChange={set('critical_weakness')}
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5 block">
              Exploitation Detail
            </label>
            <textarea
              className="input-glass min-h-[100px] resize-y border-red-900/30"
              placeholder="Explain precisely how an opponent could use this weakness in a fight..."
              value={form.weakness_detail}
              onChange={set('weakness_detail')}
            />
          </div>
        </motion.section>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-end gap-3 pb-8"
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-glass"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-gold flex items-center gap-2"
          >
            <Save size={14} />
            {saving ? 'Awakening...' : 'Awaken Stand'}
          </button>
        </motion.div>
      </form>
    </div>
  )
}
