import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, UserPlus, X, Save, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { db } from '../../lib/supabase'

const PART_STATUSES = [
  { value: 'recruiting', label: 'Recruiting Players' },
  { value: 'active',     label: 'Active / In Progress' },
  { value: 'on_hiatus',  label: 'On Hiatus' },
]

export default function PartCreator() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    part_number: '',
    title: '',
    description: '',
    setting: '',
    status: 'recruiting',
    max_players: 6,
    world_rules: [''],
  })

  const [inviteUsername, setInviteUsername] = useState('')
  const [invitedUsers, setInvitedUsers] = useState([]) // { id, username, display_name }
  const [searchError, setSearchError] = useState('')

  const set = (key) => (e) => setForm(prev => ({
    ...prev,
    [key]: e.target ? e.target.value : e
  }))

  function setWorldRule(index, value) {
    setForm(prev => {
      const rules = [...prev.world_rules]
      rules[index] = value
      return { ...prev, world_rules: rules }
    })
  }

  function addWorldRule() {
    setForm(prev => ({ ...prev, world_rules: [...prev.world_rules, ''] }))
  }

  function removeWorldRule(index) {
    setForm(prev => ({
      ...prev,
      world_rules: prev.world_rules.filter((_, i) => i !== index)
    }))
  }

  async function searchUser() {
    setSearchError('')
    if (!inviteUsername.trim()) return

    const { data, error } = await db.profiles()
      .select('id, username, display_name')
      .eq('username', inviteUsername.trim().toLowerCase())
      .single()

    if (error || !data) {
      setSearchError(`User "@${inviteUsername}" not found`)
      return
    }

    if (data.id === profile.id) {
      setSearchError("You're the GM — you're already in this Part")
      return
    }

    if (invitedUsers.find(u => u.id === data.id)) {
      setSearchError(`@${data.username} is already on the list`)
      return
    }

    setInvitedUsers(prev => [...prev, data])
    setInviteUsername('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.title.trim()) return toast.error('Give your Part a title')

    setSaving(true)

    // Create the Part
    const { data: part, error } = await db.parts().insert({
      creator_id: profile.id,
      part_number: form.part_number ? parseInt(form.part_number) : null,
      title: form.title,
      full_title: form.part_number ? `Part ${form.part_number}: ${form.title}` : form.title,
      description: form.description,
      setting: form.setting,
      status: form.status,
      max_players: parseInt(form.max_players),
      world_rules: form.world_rules.filter(r => r.trim()),
      is_private: true,
    }).select().single()

    if (error) {
      toast.error(error.message)
      setSaving(false)
      return
    }

    // Add GM as narrator
    await db.memberships().insert({
      part_id: part.id,
      user_id: profile.id,
      role: 'narrator',
      invite_status: 'accepted',
      invited_by: profile.id,
      joined_at: new Date().toISOString(),
    })

    // Send invites
    if (invitedUsers.length > 0) {
      await db.memberships().insert(
        invitedUsers.map(user => ({
          part_id: part.id,
          user_id: user.id,
          role: 'player',
          invite_status: 'pending',
          invited_by: profile.id,
        }))
      )
    }

    setSaving(false)
    toast.success(`「${form.title}」 has begun!`)
    navigate(`/parts/${part.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="text-jojo-gold" size={24} />
          <h2 className="heading-gold text-2xl">Begin a New Part</h2>
          <span className="flex items-center gap-1 text-gray-500 text-xs font-mono ml-auto">
            <Lock size={11} /> Always Private
          </span>
        </div>
        <p className="text-gray-500 font-body text-sm">
          Your Part will be completely hidden from the public. Only players you invite will know it exists.
        </p>
        <div className="divider-gold mt-4" />
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Basic Info ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6 space-y-4"
        >
          <h3 className="text-jojo-gold font-display text-xs uppercase tracking-widest">
            Part Info
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5 block">
                Part #
              </label>
              <input
                className="input-glass"
                placeholder="1"
                type="number"
                min="1"
                value={form.part_number}
                onChange={set('part_number')}
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5 block">
                Title *
              </label>
              <input
                className="input-glass"
                placeholder="Gilded Echoes"
                value={form.title}
                onChange={set('title')}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5 block">
              Setting
            </label>
            <input
              className="input-glass"
              placeholder="e.g. Naples, Italy — 2001"
              value={form.setting}
              onChange={set('setting')}
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5 block">
              Description
            </label>
            <textarea
              className="input-glass min-h-[100px] resize-y"
              placeholder="The premise of this Part..."
              value={form.description}
              onChange={set('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5 block">
                Status
              </label>
              <select className="select-glass" value={form.status} onChange={set('status')}>
                {PART_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-1.5 block">
                Max Players
              </label>
              <input
                className="input-glass"
                type="number"
                min="1"
                max="20"
                value={form.max_players}
                onChange={set('max_players')}
              />
            </div>
          </div>
        </motion.section>

        {/* ── World Rules ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-xl p-6 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-jojo-gold font-display text-xs uppercase tracking-widest">
              World Rules
            </h3>
            <button type="button" onClick={addWorldRule} className="text-jojo-gold text-xs hover:underline font-mono">
              + Add Rule
            </button>
          </div>
          <p className="text-gray-600 text-xs">
            Special rules that apply in this Part's universe (e.g. "Stands cannot affect memories")
          </p>
          {form.world_rules.map((rule, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="input-glass flex-1"
                placeholder={`Rule ${i + 1}...`}
                value={rule}
                onChange={e => setWorldRule(i, e.target.value)}
              />
              {form.world_rules.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeWorldRule(i)}
                  className="text-gray-600 hover:text-red-400 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </motion.section>

        {/* ── Invite Players ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6 space-y-4"
        >
          <h3 className="text-jojo-gold font-display text-xs uppercase tracking-widest">
            Invite Players
          </h3>
          <p className="text-gray-600 text-xs">
            Search by username. You can also invite more players after creating the Part.
          </p>

          <div className="flex gap-2">
            <input
              className="input-glass flex-1"
              placeholder="Search by username..."
              value={inviteUsername}
              onChange={e => setInviteUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), searchUser())}
            />
            <button type="button" onClick={searchUser} className="btn-glass flex items-center gap-1.5">
              <UserPlus size={14} />
              Add
            </button>
          </div>

          {searchError && (
            <p className="text-red-400 text-xs font-mono">{searchError}</p>
          )}

          {invitedUsers.length > 0 && (
            <div className="space-y-2">
              {invitedUsers.map(user => (
                <div
                  key={user.id}
                  className="glass-light rounded-lg px-3 py-2 flex items-center justify-between"
                >
                  <div>
                    <span className="text-gray-200 text-sm font-semibold">{user.display_name}</span>
                    <span className="text-gray-500 text-xs ml-2 font-mono">@{user.username}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInvitedUsers(prev => prev.filter(u => u.id !== user.id))}
                    className="text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <p className="text-gray-600 text-xs font-mono">
                {invitedUsers.length} player{invitedUsers.length !== 1 ? 's' : ''} will receive an invite
              </p>
            </div>
          )}
        </motion.section>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex justify-end gap-3 pb-8"
        >
          <button type="button" onClick={() => navigate(-1)} className="btn-glass">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-gold flex items-center gap-2">
            <Save size={14} />
            {saving ? 'Creating...' : 'Begin Part'}
          </button>
        </motion.div>
      </form>
    </div>
  )
}
