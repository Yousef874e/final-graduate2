import styles from "../../assets/chat.module.css"
import { useEffect, useState, useRef } from "react"
import { useApp } from "../../Context/AppContext"
import {
  getChildMessages,
  sendMessage,
  markMessageRead
} from "../../api/messagesService"
import toast from "react-hot-toast"

function Chat() {

  const { data } = useApp()
  const childId = data?.children?.[0]?.childId
  const myId = data?.userId

  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(true)
  const [receiverId, setReceiverId] = useState(null)

  const bottomRef = useRef()

  useEffect(() => {
    if (!childId) {
      setLoading(false)
      return
    }

    fetchMessages()
  }, [childId])

  const fetchMessages = async () => {
    try {
      const res = await getChildMessages(childId)
      const msgs = res?.items || res || []

      setMessages(msgs)

      const doctorMsg = msgs.find(m => m.senderUserId !== myId)
      if (doctorMsg) {
        setReceiverId(doctorMsg.senderUserId)
      } else if (msgs.length > 0) {
        setReceiverId(msgs[0].receiverUserId)
      }

      msgs.forEach(m => {
        if (!m.isRead) markMessageRead(m.id)
      })

      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)

    } catch {
      toast.error("فشل تحميل الرسائل")
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!text.trim()) return

    if (!receiverId) {
      toast.error("لا يمكن تحديد الدكتور")
      return
    }

    try {
      const newMsg = await sendMessage({
        childId,
        receiverUserId: receiverId,
        content: text
      })

      setMessages(prev => [...prev, newMsg])
      setText("")

      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)

    } catch {
      toast.error("فشل الإرسال")
    }
  }

  return (
    <div className={styles.container}>

      <div className={styles.chatHeader}>
        <h3>المحادثة</h3>
      </div>

      <div className={styles.chatBox}>

        {loading ? (
          <p>Loading...</p>
        ) : !childId ? (
          <p className={styles.empty}>لا يوجد طفل</p>
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

        <button onClick={handleSend}>
          ارسال
        </button>

      </div>

    </div>
  )
}

export default Chat