import styles from "../../assets/chat.module.css";
import { useEffect, useState, useRef } from "react";
import { useApp } from "../../Context/AppContext";
import {
  getChildMessages,
  sendMessage,
  markMessageRead,
  getConversations,
  deleteMessage,
} from "../../api/messagesService";
import { getChildProfile } from "../../api/childrenService";
import { getParentProfileById, getParentProfileImage } from "../../api/parentProfileService";
import { startConnection } from "../../api/chatHub.js";
import toast from "react-hot-toast";

function Chat() {
  const { userId, role, specialistName, specialistImage: specialistImageFromContext } = useApp();
  const myId = Number(userId);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [parentImages, setParentImages] = useState({});
  const [specialistImage, setSpecialistImage] = useState(specialistImageFromContext || null);
  const bottomRef = useRef();
  const connectionRef = useRef(null);
  const activeChatRef = useRef(null);

  useEffect(() => {
    loadConversations();
    initSignalR();
    return () => {
      connectionRef.current?.off("ReceiveMessage");
    };
  }, []);

  const loadParentImage = async (parentId) => {
    if (parentImages[parentId]) return parentImages[parentId];
    try {
      const res = await getParentProfileImage(parentId);
      if (res && res.imageUrl) {
        setParentImages(prev => ({ ...prev, [parentId]: res.imageUrl }));
        return res.imageUrl;
      }
    } catch (error) {
      console.error("Error loading parent image:", error);
    }
    return null;
  };

  const initSignalR = async () => {
    const conn = await startConnection();
    connectionRef.current = conn;
    conn.on("ReceiveMessage", async (message) => {
      if (message.childId !== activeChatRef.current?.childId) return;
      setMessages((prev) => {
        if (prev.find((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      setConversations((prev) =>
        prev.map((c) =>
          c.childId === message.childId
            ? { ...c, lastMessage: message.content }
            : c
        )
      );
      if (Number(message.receiverUserId) === myId) {
        await markMessageRead(message.id);
      }
      scrollDown();
    });
  };

  const loadConversations = async () => {
    try {
      const res = await getConversations();
      let list = res || [];

      if (role === "Specialist") {
        for (let i = 0; i < list.length; i++) {
          const chat = list[i];
          let parentName = "ولي الأمر";
          let parentImage = null;
          
          try {
            const child = await getChildProfile(chat.childId);
            if (child && child.parentProfileId) {
              const parent = await getParentProfileById(child.parentProfileId);
              if (parent) {
                parentName = parent.fullName || "ولي الأمر";
                const image = await loadParentImage(parent.id);
                parentImage = image;
              }
            }
          } catch (error) {
            console.error("Error:", error);
          }
          
          list[i] = { ...chat, parentName, parentImage };
        }
      }

      setConversations(list);

      if (list.length) {
        const firstChat = list[0];
        setActiveChat(firstChat);
        activeChatRef.current = firstChat;
        loadMessages(firstChat.childId);
      }
    } catch {
      toast.error("فشل تحميل المحادثات");
    }
  };

  const loadMessages = async (childId) => {
    if (!childId) return;
    setLoading(true);
    try {
      const res = await getChildMessages(childId);
      const msgs = (res.items || []).sort(
        (a, b) => new Date(a.sentAtUtc) - new Date(b.sentAtUtc)
      );
      setMessages(msgs);
      await Promise.all(
        msgs
          .filter((m) => !m.isRead && Number(m.receiverUserId) === myId)
          .map((m) => markMessageRead(m.id))
      );
      scrollDown();
    } catch {
      toast.error("فشل تحميل الرسائل");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim() || !activeChat) return;
    const receiverId = activeChat.otherUserId;
    if (!receiverId) {
      toast.error("لا يوجد مستقبل ❌");
      return;
    }
    try {
      const newMsg = await sendMessage({
        childId: activeChat.childId,
        receiverUserId: Number(receiverId),
        content: text,
      });
      setMessages((prev) => {
        if (prev.find((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setConversations((prev) =>
        prev.map((c) =>
          c.childId === activeChat.childId
            ? { ...c, lastMessage: newMsg.content }
            : c
        )
      );
      setText("");
      scrollDown();
    } catch {
      toast.error("فشل الإرسال ❌");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setSelectedMessage(null);
      toast.success("تم حذف الرسالة");
    } catch {
      toast.error("فشل حذف الرسالة");
    }
  };

  const scrollDown = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const getCurrentAvatar = () => {
    if (role === "Parent") {
      return specialistImage || null;
    } else {
      return activeChat?.parentImage || null;
    }
  };

  const getCurrentName = () => {
    if (role === "Parent") {
      return specialistName || "الأخصائي";
    } else {
      return activeChat?.parentName || "ولي الأمر";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        {conversations.map((c) => (
          <div
            key={c.conversationId}
            className={`${styles.chatItem} ${
              activeChat?.conversationId === c.conversationId ? styles.active : ""
            }`}
            onClick={() => {
              setActiveChat(c);
              activeChatRef.current = c;
              loadMessages(c.childId);
            }}
          >
            <div className={styles.avatar}>
              {role === "Parent" ? (
                specialistImage ? (
                  <img src={specialistImage} alt="الأخصائي" />
                ) : (
                  <span>👤</span>
                )
              ) : (
                c.parentImage ? (
                  <img src={c.parentImage} alt="ولي الأمر" />
                ) : (
                  <span>👤</span>
                )
              )}
            </div>
            <div className={styles.chatInfo}>
              <h4>
                {role === "Parent"
                  ? specialistName || "الأخصائي"
                  : c.parentName || "ولي الأمر"}
                <small>الطفل: {c.childName}</small>
              </h4>
              <p>{c.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.chatArea}>
        <div className={styles.header}>
          <div className={styles.headerAvatar}>
            {getCurrentAvatar() ? (
              <img src={getCurrentAvatar()} alt={getCurrentName()} />
            ) : (
              <span>👤</span>
            )}
          </div>
          <div className={styles.headerInfo}>
            <h3>{getCurrentName()}</h3>
            <p>الطفل: {activeChat?.childName}</p>
          </div>
        </div>

        <div className={styles.messages}>
          {loading ? (
            <p>جاري التحميل...</p>
          ) : messages.length === 0 ? (
            <p>لا توجد رسائل</p>
          ) : (
            messages.map((msg) => {
              const isMine = Number(msg.senderUserId) === myId;
              return (
                <div
                  key={msg.id}
                  className={isMine ? styles.myMsg : styles.otherMsg}
                  onClick={() => {
                    if (!isMine) return;
                    setSelectedMessage(msg);
                  }}
                >
                  <p>{msg.content}</p>
                  {isMine && (
                    <span className={styles.readMark}>
                      {msg.isRead ? "✔✔" : "✔"}
                    </span>
                  )}
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className={styles.inputBox}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب رسالة..."
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend}>➤</button>
        </div>
      </div>

      {selectedMessage && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <button
              className={styles.deleteBtn}
              onClick={() => handleDelete(selectedMessage.id)}
            >
              حذف الرسالة
            </button>
            <button
              className={styles.cancelBtn}
              onClick={() => setSelectedMessage(null)}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;