import styles from "../../assets/chat.module.css"
import { useEffect, useState, useRef } from "react"
import { useApp } from "../../Context/AppContext"
import {
  getChildMessages,
  sendMessage,
  markMessageRead
} from "../../api/messagesService"
import { getChildren } from "../../api/childrenService"
import toast from "react-hot-toast"

function Chat() {

  const { data, role } = useApp()
  const myId = data?.userId

  const [children, setChildren] = useState([])
  const [activeChild, setActiveChild] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)

  const bottomRef = useRef()

  useEffect(() => {
    loadChildren()
  }, [])

  const loadChildren = async () => {
    try {
      const res = await getChildren()
      const list = res.items || []
      setChildren(list)

      if (list.length) {
        const first = list[0]
        setActiveChild(first)
        await loadMessages(first.childId)
      }

    } catch {
      toast.error("فشل تحميل الأطفال")
    }
  }

  const loadMessages = async (childId) => {
    setLoading(true)
    try {
      const res = await getChildMessages(childId)
      const msgs = res.items || []

      setMessages(msgs)

      msgs.forEach(m => {
        if (!m.isRead && m.receiverUserId === myId) {
          markMessageRead(m.id)
        }
      })

      scrollDown()

    } catch {
      toast.error("فشل تحميل الرسائل")
    } finally {
      setLoading(false)
    }
  }

  const getReceiverId = () => {
    if (!activeChild) return null

    return role === "Parent"
      ? activeChild.specialistId
      : activeChild.parentId
  }

  const handleSend = async () => {
    if (!text.trim() || !activeChild) return

    const receiverId = getReceiverId()
    if (!receiverId) {
      toast.error("لا يمكن تحديد المستقبل")
      return
    }

    const tempMsg = {
      id: Date.now(),
      content: text,
      senderUserId: myId
    }

    setMessages(prev => [...prev, tempMsg])
    setText("")
    scrollDown()

    try {
      const newMsg = await sendMessage({
        childId: activeChild.childId,
        receiverUserId: receiverId,
        content: tempMsg.content
      })

      setMessages(prev =>
        prev.map(m => (m.id === tempMsg.id ? newMsg : m))
      )

    } catch {
      toast.error("فشل الإرسال")
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
        {children.map(c => (
          <div
            key={c.childId}
            className={`${styles.chatItem} ${activeChild?.childId === c.childId ? styles.active : ""}`}
            onClick={async () => {
              setActiveChild(c)
              await loadMessages(c.childId)
            }}
          >
            {c.childName}
          </div>
        ))}
      </div>

      <div className={styles.chatArea}>

        <div className={styles.header}>
          <h3>
            {activeChild?.childName || "اختر محادثة"}
          </h3>
        </div>

        <div className={styles.messages}>

          {loading ? (
            <p>Loading...</p>
          ) : messages.length === 0 ? (
            <p className={styles.empty}>لا توجد رسائل</p>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={
                  msg.senderUserId === myId
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