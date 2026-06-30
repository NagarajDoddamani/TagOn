import { useState, useEffect, useRef } from 'react'
import { chatService } from '../../services/chat.service'
import { formatDate } from '../../utils/helpers'
import { useAuthStore } from '../../store/auth.store'

export default function ChatWindow({ orderId, orderStatus }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)
  const user = useAuthStore((s) => s.user)
  const isLocked = orderStatus === 'payment_pending_verification'

  useEffect(() => {
    loadMessages()
    const interval = setInterval(loadMessages, 5000)
    return () => clearInterval(interval)
  }, [orderId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadMessages() {
    try {
      const data = await chatService.getMessages(orderId)
      setMessages(data)
    } catch { } finally {
      setLoading(false)
    }
  }

  async function send() {
    if (!text.trim() || sending || isLocked) return
    setSending(true)
    try {
      await chatService.sendMessage(orderId, text.trim())
      setText('')
      await loadMessages()
    } catch (e) { console.error(e) } finally { setSending(false) }
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file || isLocked) return
    setSending(true)
    try {
      await chatService.uploadAttachment(orderId, file)
      await loadMessages()
    } catch (e) { console.error(e) } finally { setSending(false) }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (isLocked) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        Chat will be available after payment verification.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow flex flex-col h-[500px]">
      <div className="p-4 border-b font-semibold text-gray-700">Order Chat</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === user?.id
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-lg px-4 py-2 ${isMine ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  {!isMine && msg.sender_name && (
                    <p className="text-xs font-medium mb-1 opacity-75">{msg.sender_name}</p>
                  )}
                  {msg.message && <p className="text-sm whitespace-pre-wrap">{msg.message}</p>}
                  {msg.attachment_url && (
                    <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer"
                       className="text-sm underline block mt-1">
                      {msg.attachment_type?.startsWith('image/') ? (
                        <img src={msg.attachment_url} alt="attachment" className="max-w-[200px] rounded mt-1" />
                      ) : (
                        'View Attachment'
                      )}
                    </a>
                  )}
                  <p className={`text-xs mt-1 ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>
                    {formatDate(msg.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={sending}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-2 bg-gray-200 rounded-lg text-sm hover:bg-gray-300"
          disabled={sending}
          title="Attach file"
        >
          📎
        </button>
        <button
          onClick={send}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50"
          disabled={sending || !text.trim()}
        >
          Send
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,.pdf" />
      </div>
    </div>
  )
}
