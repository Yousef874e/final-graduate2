import styles from "../../assets/chat.module.css"
import { useEffect, useState, useRef } from "react"
import { useApp } from "../../Context/AppContext"
import {
  getChildMessages,
  sendMessage,
  markMessageRead,
  getConversations
} from "../../api/messagesService"
import { startConnection } from "../../api/chatHub.js"
import toast from "react-hot-toast"

function Chat() {

  const { userId } = useApp()
  const myId = Number(userId)

  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)

  const bottomRef = useRef()
  const connectionRef = useRef(null)
  const activeChatRef = useRef(null)

  useEffect(() => {
    loadConversations()
    initSignalR()

    return () => {
      connectionRef.current?.off("ReceiveMessage")
    }
  }, [])

  const initSignalR = async () => {
    const conn = await startConnection()
    connectionRef.current = conn

    conn.on("ReceiveMessage", async (message) => {

      if (message.childId !== activeChatRef.current?.childId) return

      setMessages(prev => {
        if (prev.find(m => m.id === message.id)) return prev
        return [...prev, message]
      })

      setConversations(prev =>
        prev.map(c =>
          c.childId === message.childId
            ? { ...c, lastMessage: message.content }
            : c
        )
      )

      if (Number(message.receiverUserId) === myId) {
        await markMessageRead(message.id)
      }

      scrollDown()
    })
  }

  const loadConversations = async () => {
    try {
      const res = await getConversations()
      const list = res || []
      setConversations(list)

      if (list.length) {
        const chat = list[0]
        setActiveChat(chat)
        activeChatRef.current = chat
        loadMessages(chat.childId)
      }
    } catch {
      toast.error("فشل تحميل المحادثات")
    }
  }

  const loadMessages = async (childId) => {
    if (!childId) return

    setLoading(true)

    try {
      const res = await getChildMessages(childId)
      const msgs = (res.items || []).sort(
        (a, b) => new Date(a.sentAtUtc) - new Date(b.sentAtUtc)
      )

      setMessages(msgs)

      await Promise.all(
        msgs
          .filter(m => !m.isRead && Number(m.receiverUserId) === myId)
          .map(m => markMessageRead(m.id))
      )

      scrollDown()
    } catch {
      toast.error("فشل تحميل الرسائل")
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!text.trim() || !activeChat) return

    const receiverId = activeChat.otherUserId

    if (!receiverId) {
      toast.error("لا يوجد مستقبل ❌")
      return
    }

    try {
      const newMsg = await sendMessage({
        childId: activeChat.childId,
        receiverUserId: Number(receiverId),
        content: text
      })

      setMessages(prev => {
        if (prev.find(m => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })

      setConversations(prev =>
        prev.map(c =>
          c.childId === activeChat.childId
            ? { ...c, lastMessage: newMsg.content }
            : c
        )
      )

      setText("")
      scrollDown()

    } catch {
      toast.error("فشل الإرسال ❌")
    }
  }

  const scrollDown = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  return (
    <div className={styles.container}>

      <div className={styles.sidebar}>
        {conversations.map(c => (
          <div
            key={c.conversationId}
            className={`${styles.chatItem} ${
              activeChat?.conversationId === c.conversationId ? styles.active : ""
            }`}
            onClick={() => {
              setActiveChat(c)
              activeChatRef.current = c
              loadMessages(c.childId)
            }}
          >
            <div>{c.childName}</div>
            <small>{c.lastMessage}</small>
          </div>
        ))}
      </div>

      <div className={styles.chatArea}>

        <div className={styles.header}>
          <h3>{activeChat?.childName || "اختر محادثة"}</h3>
        </div>

        <div className={styles.messages}>
          {loading ? (
            <p>Loading...</p>
          ) : messages.length === 0 ? (
            <p>لا توجد رسائل</p>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={
                  Number(msg.senderUserId) === myId
                    ? styles.myMsg
                    : styles.otherMsg
                }
              >
                {msg.content}
              </div>
            ))
          )}

          <div ref={bottomRef}></div>
        </div>

        <div className={styles.inputBox}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب رسالة..."
          />
          <button onClick={handleSend}>➤</button>
        </div>

      </div>

    </div>
  )
}

export default Chat