import styles from "../../assets/chat.module.css"
import { useEffect, useState, useRef } from "react"
import { useApp } from "../../Context/AppContext"
import {
  getChildMessages,
  sendMessage,
  markMessageRead
} from "../../api/messagesService"
import { getChildren } from "../../api/childrenService"
//import { getSpecialistUserId } from "../../api/specialistsHelper"
import toast from "react-hot-toast"

function Chat() {

  const { role, userId } = useApp()
  const myId = Number(userId)

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
        const child = list[0]
        setActiveChild(child)
        loadMessages(child.id)
      }

    } catch {
      toast.error("فشل تحميل الأطفال")
    }
  }

  const loadMessages = async (childId) => {
    if (!childId) return

    setLoading(true)

    try {
      const res = await getChildMessages(childId)
      const msgs = res.items || []
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
    if (!text.trim() || !activeChild) return

    let receiverId = null

    if (role === "Parent") {
      receiverId = await getSpecialistUserId(
        activeChild.specialistProfileId
      )
    } else {
      receiverId = activeChild.parentUserId
    }

    if (!receiverId) {
      toast.error("الطفل غير مربوط ❌")
      return
    }

    try {
      const newMsg = await sendMessage({
        childId: activeChild.id,
        receiverUserId: Number(receiverId),
        content: text
      })

      setMessages(prev => [...prev, newMsg])
      setText("")
      scrollDown()

    } catch (err) {
      console.log(err)
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
        {children.map(c => (
          <div
            key={c.id}
            className={`${styles.chatItem} ${
              activeChild?.id === c.id ? styles.active : ""
            }`}
            onClick={() => {
              setActiveChild(c)
              loadMessages(c.id)
            }}
          >
            {c.fullName}
          </div>
        ))}
      </div>

      <div className={styles.chatArea}>

        <div className={styles.header}>
          <h3>{activeChild?.fullName || "اختر محادثة"}</h3>
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