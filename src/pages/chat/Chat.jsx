import styles from "../../assets/chat.module.css";
import { useEffect, useState, useRef, useCallback } from "react";
import { useApp } from "../../Context/AppContext";
import {
  getChildMessages,
  sendMessage,
  markMessageRead,
  getConversations,
  deleteMessage,
} from "../../api/messagesService";
import { getChildProfile } from "../../api/childrenService";
import { getParentProfileById } from "../../api/parentProfileService";
import {
  getSpecialistProfileById,
  getSpecialistProfile,
} from "../../api/specialistProfileService";
import { startConnection } from "../../api/chatHub.js";
import toast from "react-hot-toast";

function Chat() {
  const {
    userId,
    role,
    specialistName,
    specialistImage,
    parentImage,
    childrenWithDetails,
  } = useApp();
  const myId = Number(userId);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const bottomRef = useRef();
  const connectionRef = useRef(null);
  const activeChatRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await getConversations();
      let list = res || [];

      if (role === "Specialist") {
        for (let i = 0; i < list.length; i++) {
          const chat = list[i];
          let parentName = "ولي الأمر";
          let parentImageUrl = parentImage;

          try {
            const child = await getChildProfile(chat.childId);
            if (child?.parentProfileId) {
              const parent = await getParentProfileById(child.parentProfileId);
              parentName = parent?.fullName || "ولي الأمر";
              parentImageUrl = parent?.profilePictureUrl || parentImage;
            }
          } catch (error) {
            console.error("Error fetching parent:", error);
          }

          list[i] = {
            ...chat,
            parentName: parentName,
            parentImage: parentImageUrl,
          };
        }
      } else if (role === "Parent") {
        let specialistImageFromProfile = specialistImage;
        let specialistNameFromProfile = specialistName || "الأخصائي";
        
        if (!specialistImageFromProfile) {
          try {
            const childrenList = childrenWithDetails || [];
            if (childrenList.length > 0 && childrenList[0].specialistImageUrl) {
              specialistImageFromProfile = childrenList[0].specialistImageUrl;
            }
          } catch (err) {
            console.log("Error getting specialist image from children:", err);
          }
        }

        for (let i = 0; i < list.length; i++) {
          const chat = list[i];
          
          list[i] = {
            ...chat,
            specialistImage: specialistImageFromProfile,
            specialistName: specialistNameFromProfile,
          };
        }
      }

      const latestByChild = new Map();
      for (const chat of list) {
        const existing = latestByChild.get(chat.childId);
        if (
          !existing ||
          new Date(chat.lastMessageAtUtc || 0) >
            new Date(existing.lastMessageAtUtc || 0)
        ) {
          latestByChild.set(chat.childId, chat);
        }
      }

      list = Array.from(latestByChild.values());
      setConversations(list);

      if (list.length > 0) {
        const firstChat = list[0];
        setActiveChat(firstChat);
        activeChatRef.current = firstChat;
        loadMessages(firstChat.childId);
      } else {
        toast.error("لا توجد محادثات متاحة حالياً");
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("فشل تحميل المحادثات");
    }
  }, [role, parentImage, specialistImage, specialistName, childrenWithDetails]);

  const loadMessages = useCallback(
    async (childId) => {
      if (!childId) {
        toast.error("معرف الطفل غير موجود");
        return;
      }
      setLoading(true);
      try {
        const res = await getChildMessages(childId);
        const msgs = (res.items || []).sort(
          (a, b) => new Date(a.sentAtUtc) - new Date(b.sentAtUtc),
        );
        setMessages(msgs);
        await Promise.all(
          msgs
            .filter((m) => !m.isRead && Number(m.receiverUserId) === myId)
            .map((m) => markMessageRead(m.id)),
        );
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } catch (error) {
        console.error("Error loading messages:", error);
        toast.error("فشل تحميل الرسائل");
      } finally {
        setLoading(false);
      }
    },
    [myId],
  );

  const initSignalR = useCallback(async () => {
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
            : c,
        ),
      );
      if (Number(message.receiverUserId) === myId) {
        await markMessageRead(message.id);
      }
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });
  }, [myId]);

  useEffect(() => {
    if (!role) return;
    loadConversations();
    initSignalR();
    return () => {
      connectionRef.current?.off("ReceiveMessage");
    };
  }, [role, loadConversations, initSignalR]);

  const handleSend = async () => {
    if (!text.trim() || !activeChat) return;
    if (!activeChat.childId) {
      toast.error("معرف الطفل غير متوفر");
      return;
    }
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
            : c,
        ),
      );
      setText("");
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("فشل الإرسال ❌");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setSelectedMessage(null);
      toast.success("تم حذف الرسالة");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("فشل حذف الرسالة");
    }
  };

  const getOtherUserName = () => {
    if (role === "Parent") {
      return activeChat?.specialistName || specialistName || "الأخصائي";
    } else {
      return activeChat?.parentName || "ولي الأمر";
    }
  };

  const getOtherUserImage = () => {
    if (role === "Parent") {
      return activeChat?.specialistImage || specialistImage || null;
    } else {
      return activeChat?.parentImage || parentImage || null;
    }
  };

  if (conversations.length === 0 && !loading) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>لا توجد محادثات متاحة</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        {conversations.map((c) => (
          <div
            key={c.conversationId}
            className={`${styles.chatItem} ${
              activeChat?.conversationId === c.conversationId
                ? styles.active
                : ""
            }`}
            onClick={() => {
              setActiveChat(c);
              activeChatRef.current = c;
              loadMessages(c.childId);
            }}
          >
            <div className={styles.avatar}>
              {role === "Parent" ? (
                (c.specialistImage || specialistImage) ? (
                  <img
                    src={c.specialistImage || specialistImage}
                    alt="الأخصائي"
                  />
                ) : (
                  <span>👤</span>
                )
              ) : (c.parentImage || parentImage) ? (
                <img src={c.parentImage || parentImage} alt="ولي الأمر" />
              ) : (
                <span>👤</span>
              )}
            </div>
            <div className={styles.chatInfo}>
              <h4>
                {role === "Parent"
                  ? c.specialistName || "الأخصائي"
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
            {getOtherUserImage() ? (
              <img src={getOtherUserImage()} alt={getOtherUserName()} />
            ) : (
              <span>👤</span>
            )}
          </div>
          <div className={styles.headerInfo}>
            <h3>{getOtherUserName()}</h3>
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