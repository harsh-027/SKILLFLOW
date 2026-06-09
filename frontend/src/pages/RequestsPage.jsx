import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useApp } from "../context/AppContext";
import TrashSolidIcon from "../components/ui/trash-solid-icon";
import { getPreferredUserLabel } from "../lib/user-display";

const formatDate = (timestamp) => new Date(timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

function RequestCard({ request, currentTab, onRespond, onDelete, currentUserId }) {
  const sender = request.sender;
  const receiver = request.receiver;
  const senderId = typeof sender === "string" ? sender : sender?._id;
  const receiverId = typeof receiver === "string" ? receiver : receiver?._id;
  const canMessage = request.status === "accepted" && Boolean(currentUserId) && (senderId === currentUserId || receiverId === currentUserId);
  const otherUserId = senderId === currentUserId ? receiverId : senderId;
  const offeredValue = request.skillOffered || request.offeredSkill || "Not specified";
  const wantedValue = request.skillWanted || request.requestedSkill || "Not specified";
  const statusClassName = request.status === "accepted" ? "badge badge-accepted" : request.status === "rejected" ? "badge badge-rejected" : "badge badge-pending";

  return (
    <article className="glass-card request-card">
      <div>
        <p className="request-from">{getPreferredUserLabel(sender)} to {getPreferredUserLabel(receiver)}</p>
        <p className="request-offering">Offering <strong>{offeredValue}</strong> for <strong>{wantedValue}</strong></p>
        <p className="request-date">{formatDate(request.createdAt)}</p>
      </div>
      <div style={{ display: "grid", gap: "10px", justifyItems: "end" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", width: "100%" }}>
          <span className={statusClassName}>{request.status}</span>
          <button
            type="button"
            onClick={onDelete}
            className="btn-delete-icon"
            aria-label="Delete request"
            title="Delete request"
          >
            <TrashSolidIcon size={16} />
          </button>
        </div>
        {currentTab === "received" && request.status === "pending" ? (
          <div className="card-actions">
            <button className="btn-red" onClick={() => onRespond("accepted")}>Accept</button>
            <button className="btn-outline-red" onClick={() => onRespond("rejected")}>Reject</button>
          </div>
        ) : null}
        {canMessage && otherUserId ? <Link to={`/messages/${otherUserId}`} className="btn-outline-red">Message</Link> : null}
      </div>
    </article>
  );
}

function RequestsPage() {
  const { addToast, currentUser } = useApp();
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("received");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const endpoint = activeTab === "sent" ? "/swap-requests?type=sent" : "/swap-requests";
        const { data } = await API.get(endpoint);
        setRequests(Array.isArray(data) ? data : []);
      } catch (error) {
        const message = error.response?.data?.message || "Failed to load swap requests.";
        addToast(message, "error");
        setRequests([]);
      } finally { setLoading(false); }
    };
    fetchRequests();
  }, [activeTab, addToast]);

  const handleRespond = async (requestId, status) => {
    try {
      const endpoint = status === "accepted" ? "accept" : "reject";
      await API.put(`/swap-requests/${endpoint}/${requestId}`);
      setRequests((prev) => prev.map((request) => request._id === requestId ? { ...request, status } : request));
      addToast(`Request ${status}.`, "success");
    } catch (error) {
      const message = error.response?.data?.message || `Failed to ${status} request.`;
      addToast(message, "error");
    }
  };

  const handleDelete = async (requestId) => {
    const shouldDelete = window.confirm("Delete this request?");
    if (!shouldDelete) {
      return;
    }

    try {
      await API.delete(`/swap-requests/${requestId}`);
      setRequests((prev) => prev.filter((request) => request._id !== requestId));
      addToast("Request deleted.", "success");
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete request.";
      addToast(message, "error");
    }
  };

  return (
    <section className="page">
      <div><h2 className="section-title">Skill Requests</h2></div>
      <div className="tab-switcher">
        <button className={`tab-item ${activeTab === "received" ? "active" : ""}`} onClick={() => setActiveTab("received")}>Received Requests</button>
        <button className={`tab-item ${activeTab === "sent" ? "active" : ""}`} onClick={() => setActiveTab("sent")}>Sent Requests</button>
      </div>
      <div>
        {loading ? (
          <div style={{ display: "grid", gap: "12px" }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="card" key={index}>
                <p className="muted">Loading request...</p>
              </div>
            ))}
          </div>
        ) : requests.length ? requests.map((request) => <RequestCard key={request._id} request={request} currentTab={activeTab} currentUserId={currentUser?._id} onRespond={(status) => handleRespond(request._id, status)} onDelete={() => handleDelete(request._id)} />) : <div className="card"><p className="muted">No requests in this tab yet.</p></div>}
      </div>
    </section>
  );
}

export default RequestsPage;
