// backend/src/index.js
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'

const app = express()
const PORT = process.env.PORT || 3001

// ── Supabase admin client (service role — server only, never expose to client) ──
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,  // Admin key — server ONLY
  { auth: { persistSession: false } }
)

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// ── Auth middleware: verify Supabase JWT ────────────────────
async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Invalid token' })

  req.user = user
  next()
}

// ── Routes ──────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'JJBA Platform API' })
})

// Stand approval (GM action — server-side to enforce authorization)
app.patch('/api/stands/:id/approve', requireAuth, async (req, res) => {
  const { id } = req.params
  const { verdict, rejection_reason } = req.body

  // Verify the requester is a GM of a Part containing this stand
  const { data: membership } = await supabaseAdmin
    .from('part_memberships')
    .select('*, parts!inner(*)')
    .eq('user_id', req.user.id)
    .eq('role', 'narrator')
    .eq('invite_status', 'accepted')
    .single()

  if (!membership) {
    return res.status(403).json({ error: 'Only a Part Narrator can approve Stands' })
  }

  const update = {
    approval_status: verdict === 'approve' ? 'approved' : 'rejected',
    approved_by: verdict === 'approve' ? req.user.id : null,
    approved_at: verdict === 'approve' ? new Date().toISOString() : null,
    rejection_reason: verdict !== 'approve' ? rejection_reason : null,
  }

  const { data, error } = await supabaseAdmin
    .from('stands')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// Remove player from Part (GM action)
app.delete('/api/parts/:partId/members/:userId', requireAuth, async (req, res) => {
  const { partId, userId } = req.params

  // Verify requester is the Part creator
  const { data: part } = await supabaseAdmin
    .from('parts')
    .select('creator_id')
    .eq('id', partId)
    .single()

  if (!part || part.creator_id !== req.user.id) {
    return res.status(403).json({ error: 'Only the Part creator can remove members' })
  }

  await supabaseAdmin
    .from('part_memberships')
    .update({ invite_status: 'removed' })
    .eq('part_id', partId)
    .eq('user_id', userId)

  res.json({ success: true })
})

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🟡 JJBA Platform API running on :${PORT}`)
})
