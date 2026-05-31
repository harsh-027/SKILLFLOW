import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";
import MessageBox from "../components/MessageBox";
import { useApp } from "../context/AppContext";
import { getPreferredUserLabel } from "../lib/user-display";
import { getConversation, sendMessage } from "../services/messageService";

function Messages() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser, addToast } = useApp();
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [input, setInput] = useState("");
  const [loadingConversation, setLoadingConversation] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => { if (!currentUser) navigate("/login"); }, [currentUser, navigate]);
  useEffect(() => {
    const loadOtherUser = async () => { if (!userId) return; try { const { data } = await API.get(`/users/${userId}`); setOtherUser(data); } catch { setOtherUser(null); } };
    loadOtherUser();
  }, [userId]);
  useEffect(() => {
    let intervalId;
    const loadMessages = async (silent = false) => {
      if (!userId || !currentUser?._id) return;
      if (!silent) setLoadingConversation(true);
      try { const data = await getConversation(userId); setMessages(Array.isArray(data) ? data : []); }
      catch (error) { if (!silent) addToast(error.response?.data?.message || "Failed to load messages.", "error"); }
      finally { if (!silent) setLoadingConversation(false); }
    };
    loadMessages(false);
    intervalId = window.setInterval(() => loadMessages(true), 7000);
    return () => { if (intervalId) window.clearInterval(intervalId); };
  }, [userId, currentUser, addToast]);

  const handleSend = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !userId || sending) return;
    try { setSending(true); const created = await sendMessage({ receiverId: userId, content: trimmed }); setMessages((prev) => [...prev, created]); setInput(""); }
    catch (error) { addToast(error.response?.data?.message || "Failed to send message.", "error"); }
    finally { setSending(false); }
  };

  return (
    <section className="page" style={{ height: "calc(100vh - var(--header-height) - 64px)" }}>
      <article className="card" style={{ display:'flex', flexDirection:'column', height:'100%' }}>
        <header className="mb-16">
          <h3 className="section-title">{getPreferredUserLabel(otherUser) || "Messages"}</h3>
          <p className="section-sub">Conversation</p>
        </header>
        {loadingConversation ? (
          <div className="card">
            <p className="muted">Loading conversation...</p>
          </div>
        ) : (
          <>
            <MessageBox messages={messages} currentUserId={currentUser?._id} />
            <form onSubmit={handleSend} className="comment-form" style={{ marginTop: "12px" }}>
              <input type="text" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Type a message..." className="input-dark" />
              <button type="submit" className="btn-red" disabled={sending || !input.trim()}>Send</button>
            </form>
          </>
        )}
      </article>
    </section>
  );
}

export default Messages;
