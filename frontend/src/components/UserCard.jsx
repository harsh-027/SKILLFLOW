import { Link } from "react-router-dom";
import { getPreferredUserLabel } from "../lib/user-display";

function SkillSet({ title, values }) {
  return <div><p className="meta-title">{title}</p><div className="skill-list">{values.map((value) => <span className="skill-tag" key={`${title}-${value}`}>{value}</span>)}</div></div>;
}

function UserCard({ user, currentUser, onRequest }) {
  const isOwnProfile = currentUser?._id === user._id;
  const requestDisabled = !currentUser || isOwnProfile;
  const requestLabel = !currentUser ? "Login to Request" : isOwnProfile ? "Your Profile" : "Request Swap";
  const displayLabel = getPreferredUserLabel(user);

  return (
    <article className="glass-card card user-card">
      <div className="flex-center gap-12 mb-16">
        <img src={user.profileImage || "/assets/default-profile.png"} alt={displayLabel} className="profile-avatar-ring" style={{ width: "52px", height: "52px", fontSize: "18px", margin: 0 }} />
        <div>
          <h3 className="profile-name">{displayLabel}</h3>
          {user.name ? <p className="profile-meta">{user.name}</p> : null}
          <p className="profile-meta">{user.location}</p>
        </div>
      </div>
      <p className="section-sub">{user.bio}</p>
      <SkillSet title="Offers" values={user.skillsOffered} />
      <SkillSet title="Wants" values={user.skillsWanted} />
      <div className="card-actions" style={{ marginTop: "16px" }}>
        <Link to={`/profile/${user._id}`} className="btn-outline-red">View Profile</Link>
        <button className="btn-red" disabled={requestDisabled} onClick={() => onRequest(user)}>{requestLabel}</button>
      </div>
    </article>
  );
}

export default UserCard;
