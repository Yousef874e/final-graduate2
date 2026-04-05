import styles from "../../assets/dashboard.module.css"
import communityStyles from "../../assets/community.module.css"
import { FaUser, FaBell, FaHeart, FaComment, FaShare } from "react-icons/fa"
import { useState } from "react"

function Community() {

  const userName = localStorage.getItem("userName") || "ابراهيم محمد"

  const [posts, setPosts] = useState([
    {
      id: 1,
      name: "أم سارة",
      time: "منذ ساعتين",
      content: "تجربتي كانت ممتازة بفضل الله تم بفضل برنامج رفيق، تحسن ملحوظ في حركة اليد لابنتي.",
      likes: 24,
      comments: 12
    },
    {
      id: 2,
      name: "أبو خالد",
      time: "منذ 5 ساعات",
      content: "هل يوجد أحد جرب مركز الأمل للعلاج الطبيعي؟ أبحث عن توصيات لأخصائيين جيدين هناك.",
      likes: 8,
      comments: 34
    },
    {
      id: 3,
      name: "د. ليلى",
      time: "منذ يوم",
      content: "نصيحة اليوم: التحدث المستمر مع الطفل حتى لو لم يستجب يساعد بشكل كبير في تطوير مراكز اللغة في الدماغ.",
      likes: 156,
      comments: 42
    }
  ])

  const [text, setText] = useState("")

  const handlePost = () => {
    if (!text) return

    setPosts([
      {
        id: Date.now(),
        name: userName,
        time: "الآن",
        content: text,
        likes: 0,
        comments: 0
      },
      ...posts
    ])

    setText("")
  }

  return (
    <div className={styles.specialistsPage}>

      {/* 🔥 Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topRight}>
          <h3>لوحة التحكم</h3>
        </div>

        <div className={styles.topLeft}>
          <div className={styles.userBox}>
            <span>{userName}</span>
            <FaUser className={styles.iconCircle}/>
          </div>

          <div className={styles.iconWrapper}>
            <FaBell />
          </div>
        </div>
      </div>

      {/* 🔥 Title */}
      <h2 className={styles.pageTitle}>مجتمع رفيق</h2>
      <p className={styles.pageDesc}>
        شارك تجربتك وتواصل مع عائلات وأخصائيين
      </p>

      <div className={communityStyles.layout}>

        {/* 🔵 Sidebar */}
        <div className={communityStyles.sidebar}>

          <h4>المواضيع الشائعة</h4>

          <div className={communityStyles.tags}>
            <span>علاج طبيعي</span>
            <span>تغذية</span>
            <span>نصائح</span>
            <span>استشارات</span>
          </div>

          <h4 style={{marginTop:"20px"}}>أعضاء نشطين</h4>

          <div className={communityStyles.users}>
            <span>👩</span>
            <span>👨</span>
            <span>👧</span>
            <span>👦</span>
          </div>

        </div>

        {/* 🔵 Main */}
        <div className={communityStyles.main}>

          {/* 🔥 Create Post */}
          <div className={communityStyles.createPost}>
            <input
              placeholder="اكتب تجربتك..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button onClick={handlePost}>نشر</button>
          </div>

          {/* 🔥 Posts */}
          {posts.map((post) => (
            <div key={post.id} className={communityStyles.post}>

              <div className={communityStyles.postHeader}>
                <div>
                  <strong>{post.name}</strong>
                  <p>{post.time}</p>
                </div>
              </div>

              <p className={communityStyles.content}>{post.content}</p>

              <div className={communityStyles.actions}>
                <span><FaHeart /> {post.likes}</span>
                <span><FaComment /> {post.comments}</span>
                <span><FaShare /> مشاركة</span>
              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  )
}

export default Community