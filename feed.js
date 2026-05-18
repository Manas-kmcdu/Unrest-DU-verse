const { useState } = React;

const INITIAL_POSTS = [
  {
    id: 1,
    author: "Rohan Mehta",
    college: "Hindu College",
    text: "North Campus winters are unmatched.",
    w: 32,
    l: 4
  },
  {
    id: 2,
    author: "Priya Sharma",
    college: "LSR",
    text: "Placement season has made everyone insane.",
    w: 18,
    l: 2
  }
];

function PostCard({ post, onW, onL }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "16px"
      }}
    >
      <div
        style={{
          fontWeight: 700,
          marginBottom: "4px"
        }}
      >
        {post.author}
      </div>

      <div
        style={{
          fontSize: "13px",
          color: "#777",
          marginBottom: "12px"
        }}
      >
        {post.college}
      </div>

      <div
        style={{
          fontSize: "15px",
          lineHeight: 1.6,
          marginBottom: "14px"
        }}
      >
        {post.text}
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px"
        }}
      >
        <button
          onClick={() => onW(post.id)}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "none",
            background: "#111",
            color: "#fff",
            cursor: "pointer"
          }}
        >
          W {post.w}
        </button>

        <button
          onClick={() => onL(post.id)}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            background: "#fff",
            cursor: "pointer"
          }}
        >
          L {post.l}
        </button>
      </div>
    </div>
  );
}

function App() {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [text, setText] = useState("");

  function createPost() {
    if (!text.trim()) return;

    const newPost = {
      id: Date.now(),
      author: "You",
      college: "Kirori Mal",
      text,
      w: 0,
      l: 0
    };

    setPosts([newPost, ...posts]);
    setText("");
  }

  function addW(id) {
    setPosts(posts.map(p =>
      p.id === id ? { ...p, w: p.w + 1 } : p
    ));
  }

  function addL(id) {
    setPosts(posts.map(p =>
      p.id === id ? { ...p, l: p.l + 1 } : p
    ));
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f2eb",
        fontFamily: "Arial",
        padding: "30px"
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto"
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            marginBottom: "30px"
          }}
        >
          UNREST
        </h1>

        <div
          style={{
            background: "#fff",
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "24px",
            border: "1px solid rgba(0,0,0,0.08)"
          }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's happening at DU?"
            rows={4}
            style={{
              width: "100%",
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "12px",
              resize: "none",
              marginBottom: "12px"
            }}
          />

          <button
            onClick={createPost}
            style={{
              background: "#111",
              color: "#fff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "10px",
              cursor: "pointer"
            }}
          >
            Post
          </button>
        </div>

        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onW={addW}
            onL={addL}
          />
        ))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(
  document.getElementById("root")
).render(<App />);
