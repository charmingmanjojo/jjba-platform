import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Eye, Zap, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../../hooks/useAuth'
import { supabase, db } from '../../lib/supabase'

const MESSAGE_TYPES = [
  { value: 'player',       label: 'Action',         icon: MessageSquare, color: 'text-gray-300' },
  { value: 'stand_action', label: 'Stand Action',   icon: Zap,           color: 'text-cyan-400' },
  { value: 'ooc',          label: 'Out of Character', icon: Eye,          color: 'text-gray-500' },
]

const GM_TYPES = [
  { value: 'narrator', label: 'Narrate', icon: Mic, color: 'text-pink-400' },
  ...MESSAGE_TYPES,
]

function MessageBubble({ msg, isOwn }) {
  const typeClass = {
    narrator:     'message-narrator',
    stand_action: 'message-stand',
    ooc:          'message-ooc',
    player:       '',
    system:       '',
  }[msg.message_type] ?? ''

  if (msg.message_type === 'system') {
    return (
      <div className="text-center py-2">
        <span className="text-gray-600 text-xs font-mono">{msg.content}</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div className={`max-w-[80%] ${msg.message_type === 'narrator' ? 'w-full max-w-full' : ''}`}>
        {/* Author line */}
        {!isOwn && msg.message_type !== 'narrator' && (
          <div className="flex items-center gap-2 mb-1 ml-1">
            <span className="text-jojo-gold text-xs font-mono font-bold">
              {msg.profiles?.username ?? 'Unknown'}
            </span>
            {msg.stand_used && (
              <span className="text-cyan-400 text-xs">
                「{msg.stand_used}」
              </span>
            )}
          </div>
        )}

        {msg.message_type === 'narrator' && (
          <div className="flex items-center gap-2 mb-2">
            <Mic size={12} className="text-pink-400" />
            <span className="text-pink-400 text-xs font-mono uppercase tracking-widest">Narrator</span>
          </div>
        )}

        {/* Message bubble */}
        <div className={`
          rounded-lg px-4 py-3 font-body text-sm leading-relaxed
          ${typeClass}
          ${!typeClass && isOwn
            ? 'bg-jojo-purple-mid/80 border border-jojo-gold/20 text-gray-200'
            : !typeClass
            ? 'glass-light text-gray-300'
            : 'text-gray-200'}
        `}>
          {msg.message_type === 'ooc'
            ? <span className="text-gray-500">( {msg.content} )</span>
            : msg.content
          }
        </div>

        {/* Timestamp */}
        <p className={`text-gray-700 text-xs mt-1 font-mono ${isOwn ? 'text-right' : 'text-left'}`}>
          {msg.created_at
            ? formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })
            : 'just now'}
        </p>
      </div>
    </motion.div>
  )
}

export default function PartChat({ partId, isGM }) {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [msgType, setMsgType] = useState('player')
  const [standName, setStandName] = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  // Load history
  useEffect(() => {
    if (!partId) return
    loadMessages()

    // Subscribe to realtime
    const channel = supabase
      .channel(`chat:${partId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `part_id=eq.${partId}`,
      }, (payload) => {
        // Fetch full message with profile info
        fetchSingleMessage(payload.new.id)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [partId])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadMessages() {
    const { data } = await db.chat()
      .select('*, profiles(username, display_name)')
      .eq('part_id', partId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .limit(100)

    setMessages(data ?? [])
    setLoading(false)
  }

  async function fetchSingleMessage(id) {
    const { data } = await db.chat()
      .select('*, profiles(username, display_name)')
      .eq('id', id)
      .single()
    if (data) setMessages(prev => [...prev, data])
  }

  async function sendMessage(e) {
    e?.preventDefault()
    if (!input.trim()) return

    const payload = {
      part_id: partId,
      author_id: user.id,
      message_type: msgType,
      content: input.trim(),
      ...(msgType === 'stand_action' && standName ? { stand_used: standName } : {}),
    }

    setInput('')
    await db.chat().insert(payload)
  }

  const typeOptions = isGM ? GM_TYPES : MESSAGE_TYPES

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] glass rounded-xl overflow-hidden">

      {/* Message area */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600 font-mono text-sm">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <MessageSquare size={40} className="text-gray-700" />
            <p className="text-gray-600 font-mono text-sm">
              {isGM ? 'Set the scene, Narrator.' : 'The story awaits...'}
            </p>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isOwn={msg.author_id === user?.id}
              />
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Message type selector */}
      <div className="border-t border-jojo-gold/10 px-4 pt-3 pb-2">
        <div className="flex gap-2 mb-3">
          {typeOptions.map(type => (
            <button
              key={type.value}
              type="button"
              onClick={() => setMsgType(type.value)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono
                transition-all duration-150
                ${msgType === type.value
                  ? `${type.color} bg-white/10 border border-white/20`
                  : 'text-gray-600 hover:text-gray-400'
                }
              `}
            >
              <type.icon size={11} />
              {type.label}
            </button>
          ))}
        </div>

        {/* Stand name for stand actions */}
        <AnimatePresence>
          {msgType === 'stand_action' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-2 overflow-hidden"
            >
              <input
                className="input-glass text-xs h-8"
                placeholder="Stand name..."
                value={standName}
                onChange={e => setStandName(e.target.value)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input row */}
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            className="input-glass flex-1"
            placeholder={
              msgType === 'narrator'     ? 'Set the scene...' :
              msgType === 'stand_action' ? 'Describe your Stand ability...' :
              msgType === 'ooc'          ? 'Out of character...' :
              'Your action or dialogue...'
            }
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="btn-gold px-4 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={14} />
          </button>
        </form>

        {/* Narrator styling reminder */}
        {isGM && msgType === 'narrator' && (
          <p className="text-pink-600/60 text-xs font-mono mt-1.5">
            Narrator messages are styled prominently and visible to all players
          </p>
        )}
      </div>
    </div>
  )
}
