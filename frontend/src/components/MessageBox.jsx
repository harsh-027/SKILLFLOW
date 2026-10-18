import { useEffect, useRef } from "react";

const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

function MessageBox({ messages, currentUserId }) {
  const listRef = useRef(null);
  useEffect(() => { if (!listRef.current) return; listRef.current.scrollTop = listRef.current.scrollHeight; }, [messages]);

  return (
    <div ref={listRef} className="card" style={{ display:'flex', flexDirection:'column', height:'100%', overflowY:'auto', gap:'10px' }}>
      {messages.length === 0 ? <p className="muted" style={{ textAlign: "center" }}>No messages yet. Start the conversation.</p> : messages.map((message) => {
        const senderId = typeof message.sender === "string" ? message.sender : message.sender?._id;
        const mine = senderId === currentUserId;
        return (
          <div key={message._id} style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}>
            <div
              style={{
                background: mine ? "#eeeeee" : "#ffffff",
                border: "1px solid #cccccc",
                color: "#111111",
                borderRadius: "3px",
                padding: "10px 16px",
                maxWidth: "70%",
                alignSelf: mine ? "flex-end" : "flex-start",
                fontSize: "14px",
              }}
            >
              {message.content}
            </div>
            <p className="request-date" style={{ marginTop: "4px" }}>{formatTime(message.createdAt)}</p>
          </div>
        );
      })}
    </div>
  );
}

export default MessageBox;
