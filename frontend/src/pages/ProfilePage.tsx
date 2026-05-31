import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MapPin, PencilLine } from "lucide-react";
import API from "../api/axios";
import SkillTagInput from "../components/SkillTagInput";
import SwapRequestModal from "../components/SwapRequestModal";
import { type User, useApp } from "../context/AppContext";
import { getPreferredUserLabel, getSecondaryUserName } from "../lib/user-display";

type Draft = {
  name: string;
  bio: string;
  location: string;
  avatar: string;
  banner: string;
  skillsOffered: string[];
  skillsWanted: string[];
};

type ProfileUser = User & {
  createdAt?: string;
};

type SwapRequest = {
  skillOffered: string;
  skillWanted: string;
};

type ImageField = "avatar" | "banner";

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () =>
      resolve(typeof reader.result === "string" ? reader.result : "");

    reader.onerror = () =>
      reject(new Error("Failed to read file."));

    reader.readAsDataURL(file);
  });

const createDraftFromUser = (user: ProfileUser): Draft => ({
  name: user.name || "",
  bio: user.bio || "",
  location: user.location || "",
  avatar: user.avatar || "",
  banner: user.banner || "",
  skillsOffered: [...(user.skillsOffered || [])],
  skillsWanted: [...(user.skillsWanted || [])],
});

const formatJoinRingText = (joinedAt?: string): string => {
  if (!joinedAt) {
    return "SKILLFLOW MEMBER";
  }

  const date = new Date(joinedAt);
  if (Number.isNaN(date.getTime())) {
    return "SKILLFLOW MEMBER";
  }

  const label = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date).toUpperCase();

  return `JOINED IN ${label}`;
};

function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, sendRequest, updateProfile, addToast, bootstrapping } = useApp();
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState<boolean>(false);
  const [sendingSwap, setSendingSwap] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [draft, setDraft] = useState<Draft>({
    name: "",
    bio: "",
    location: "",
    avatar: "",
    banner: "",
    skillsOffered: [],
    skillsWanted: [],
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!id) return;
        if (currentUser && currentUser._id === id) { setProfileUser(currentUser); return; }
        const { data } = await API.get<ProfileUser>(`/users/${id}`);
        setProfileUser(data);
      } catch {
        setProfileUser(null);
      }
      finally { setLoadingUser(false); }
    };
    fetchUser();
  }, [id, currentUser]);

  useEffect(() => {
    if (!profileUser) {
      return;
    }

    setDraft(createDraftFromUser(profileUser));
  }, [profileUser]);

  const isOwnProfile = currentUser?._id === id;
  const handleRequest = async () => { if (!profileUser || !currentUser) { addToast("Please login to request a swap.", "warning"); navigate("/login"); return; } setIsSwapModalOpen(true); };
  const handleCloseSwapModal = () => { if (sendingSwap) return; setIsSwapModalOpen(false); };
  const handleSubmitSwap = async ({ skillOffered, skillWanted }: SwapRequest) => {
  if (!profileUser) return;

  setSendingSwap(true);

  const success = await sendRequest({
    receiverId: profileUser._id,
    skillOffered,
    skillWanted,
  });

  setSendingSwap(false);

  if (success) handleCloseSwapModal();
};
 const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  setSaving(true);
  try {
    await updateProfile({
      name: draft.name.trim(),
      bio: draft.bio.trim(),
      location: draft.location.trim(),
      avatar: draft.avatar,
      banner: draft.banner,
      skillsOffered: draft.skillsOffered,
      skillsWanted: draft.skillsWanted,
    });
    setProfileUser((prev: ProfileUser | null) =>
  prev
    ? {
        ...prev,
        name: draft.name.trim(),
        bio: draft.bio.trim(),
        location: draft.location.trim(),
        avatar: draft.avatar,
        banner: draft.banner,
        skillsOffered: draft.skillsOffered,
        skillsWanted: draft.skillsWanted,
      }
    : prev
    );
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };
  const handleImageSelection = async (
    field: ImageField,
    file: File | null
  ) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast("Please choose an image file.", "warning");
      return;
    }

    try {
      const imageDataUrl = await readFileAsDataUrl(file);

      setDraft((prev: Draft) => ({
        ...prev,
        [field]: imageDataUrl,
      }));
    } catch {
      addToast("Unable to read the selected image.", "error");
    }
  };

  if (bootstrapping || loadingUser) return <section className="page"><div className="card">Loading profile...</div></section>;
  if (!profileUser) return <section className="page"><div className="card"><h2 className="section-title">User not found</h2><Link className="btn-outline-red" to="/users">Back to Users</Link></div></section>;

  const handleCancelEditing = () => {
    setDraft(createDraftFromUser(profileUser));
    setEditing(false);
  };

  const displayProfile = isOwnProfile
    ? {
        ...profileUser,
        name: draft.name || profileUser.name,
        bio: draft.bio || profileUser.bio,
        location: draft.location || profileUser.location,
        avatar: draft.avatar || profileUser.avatar,
        banner: draft.banner || profileUser.banner,
        skillsOffered: draft.skillsOffered?.length ? draft.skillsOffered : profileUser.skillsOffered,
        skillsWanted: draft.skillsWanted?.length ? draft.skillsWanted : profileUser.skillsWanted,
      }
    : profileUser;

  const offeredSkills = displayProfile.skillsOffered || [];
  const wantedSkills = displayProfile.skillsWanted || [];
  const totalSkills = new Set([...offeredSkills, ...wantedSkills]).size;
  const profileHeadline = displayProfile.bio?.trim() || "Building a strong skill exchange profile.";
  const avatarRingLabel = formatJoinRingText(displayProfile.createdAt);
  const avatarRingTopId = `profile-avatar-ring-top-${displayProfile._id}`;
  const avatarRingBottomId = `profile-avatar-ring-bottom-${displayProfile._id}`;
  const preferredProfileLabel = getPreferredUserLabel(displayProfile);
  const secondaryProfileName = getSecondaryUserName(displayProfile);

  return (
    <section className="page">
      <div className={`profile-showcase-layout ${isOwnProfile && editing ? "is-editing" : ""}`}>
        <div className="profile-showcase-column">
          <article className="card profile-showcase-card">
            <div
              className={`profile-showcase-cover ${displayProfile.banner ? "has-image" : ""}`}
              style={
                displayProfile.banner
                  ? {
                      backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.18), rgba(23,23,23,0.92)), url(${displayProfile.banner})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
               <div className="profile-showcase-cover-content">
                <p className="profile-showcase-cover-kicker">SkillFlow profile</p>
              </div>
            </div>

            <div className="profile-showcase-body">
              <div className="profile-showcase-content">
                <div className="profile-showcase-identity">
                  <div className="profile-showcase-avatar-shell">
                    <svg
                      className="profile-showcase-avatar-orbit"
                      viewBox="0 0 200 200"
                      aria-hidden="true"
                      role="presentation"
                    >
                      <defs>
                        <path
                          id={avatarRingTopId}
                          d="M 37,100 a 63,63 0 0,1 126,0"
                        />
                        <path
                          id={avatarRingBottomId}
                          d="M 163,100 a 63,63 0 0,1 -126,0"
                        />
                      </defs>
                      <text className="profile-showcase-avatar-orbit-text">
                        <textPath href={`#${avatarRingTopId}`} startOffset="50%" textAnchor="middle">
                          {avatarRingLabel}
                        </textPath>
                      </text>
                      <text className="profile-showcase-avatar-orbit-text">
                        <textPath href={`#${avatarRingBottomId}`} startOffset="50%" textAnchor="middle">
                          {avatarRingLabel}
                        </textPath>
                      </text>
                    </svg>
                    <div className="profile-avatar-ring profile-showcase-avatar-frame">
                      <img
                        src={displayProfile.avatar || "/default-avatar.png"}
                        alt={preferredProfileLabel}
                        className="profile-showcase-avatar"
                      />
                    </div>
                  </div>

                  <div className="profile-showcase-intro">
                    <div className="profile-showcase-name-row">
                      <div className="profile-showcase-name-block">
                        <p className="profile-showcase-eyebrow">Member spotlight</p>
                        <h2 className="profile-name profile-showcase-name">{preferredProfileLabel}</h2>
                        {secondaryProfileName && secondaryProfileName !== preferredProfileLabel ? (
                          <p className="profile-meta">{secondaryProfileName}</p>
                        ) : null}
                      </div>
                      <div className="profile-showcase-mini-badge">Ready to swap</div>
                    </div>

                    <div className="profile-showcase-location-row">
                      <MapPin size={15} />
                      <p className="profile-meta profile-showcase-location">{displayProfile.location || "Location not shared"}</p>
                    </div>

                    <p className="section-sub profile-showcase-bio">{profileHeadline}</p>
                  </div>
                </div>

                <div className="profile-stats-row profile-showcase-stats">
                  <div className="profile-stat-cell">
                    <div className="profile-stat-num">{offeredSkills.length}</div>
                    <div className="profile-stat-lbl">Skills offered</div>
                  </div>
                  <div className="profile-stat-cell">
                    <div className="profile-stat-num">{wantedSkills.length}</div>
                    <div className="profile-stat-lbl">Skills wanted</div>
                  </div>
                  <div className="profile-stat-cell">
                    <div className="profile-stat-num">{totalSkills}</div>
                    <div className="profile-stat-lbl">Total listed</div>
                  </div>
                </div>

                <div className="profile-showcase-skill-grid">
                  <div className="profile-showcase-skills">
                    <p className="meta-title">Skills Offered</p>
                    <div className="skill-list">
                      {offeredSkills.length
                        ? offeredSkills.map((skill: string) => (
                            <span key={`profile-offered-${skill}`} className="skill-tag profile-skill-tag">
                              {skill}
                            </span>
                          ))
                        : <span className="profile-showcase-empty">No offered skills yet</span>}
                    </div>
                  </div>

                  <div className="profile-showcase-skills">
                    <p className="meta-title">Skills Wanted</p>
                    <div className="skill-list">
                      {wantedSkills.length
                        ? wantedSkills.map((skill: string) => (
                            <span key={`profile-wanted-${skill}`} className="skill-tag profile-skill-tag">
                              {skill}
                            </span>
                          ))
                        : <span className="profile-showcase-empty">No wanted skills yet</span>}
                    </div>
                  </div>
                </div>

                {isOwnProfile ? (
                  !editing ? (
                    <div className="profile-showcase-actions">
                      <button className="btn-outline-red" onClick={() => setEditing(true)}>
                        <PencilLine size={16} />
                        Edit Profile
                      </button>
                    </div>
                  ) : null
                ) : (
                  <div className="profile-showcase-actions">
                    <button className="btn-red" onClick={handleRequest}>Send Request</button>
                  </div>
                )}
              </div>
            </div>
          </article>

        </div>

        {isOwnProfile && editing ? (
          <form onSubmit={handleSaveProfile} className="profile-showcase-editor">
            <div className="profile-editor-head">
              <p className="field-label">Edit profile</p>
              </div>

            <div className="profile-editor-grid">
              <label className="field-wrap">
                <span className="field-label">Name</span>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft((prev: Draft) => ({ ...prev, name: event.target.value }))}
                  placeholder="Your name"
                  className="input-dark"
                  required
                />
              </label>

              <label className="field-wrap">
                <span className="field-label">Location</span>
                <input
                  type="text"
                  value={draft.location}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft((prev: Draft) => ({ ...prev, location: event.target.value }))}
                  placeholder="City or region"
                  className="input-dark"
                  required
                />
              </label>

              <div className="profile-asset-stack">
                <label className="field-wrap">
                  <span className="field-label">Profile Picture</span>
                </label>

                <label className="profile-image-field">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      const file: File | null = event.target.files?.[0] ?? null;
                      handleImageSelection("avatar", file);
                    }}
                  />
                </label>
              </div>

              <div className="profile-asset-stack">
                <label className="field-wrap">
                  <span className="field-label">Profile Banner</span>
                </label>

                <label className="profile-image-field">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      const file: File | null = event.target.files?.[0] ?? null;
                      handleImageSelection("banner", file);
                    }}
                  />
                </label>
              </div>

              <label className="field-wrap profile-editor-span-2">
                <span className="field-label">Bio</span>
                <textarea
                  value={draft.bio}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setDraft((prev: Draft) => ({ ...prev, bio: event.target.value }))}
                  placeholder="Tell people what you do, what you are building, and what you want to learn next."
                  rows={4}
                  className="input-dark"
                  required
                />
              </label>

              <SkillTagInput
                label="Skills Offered"
                tags={draft.skillsOffered}
                onChange={(nextTags: string[]) => setDraft((prev: Draft) => ({ ...prev, skillsOffered: nextTags }))}
              />

              <SkillTagInput
                label="Skills Wanted"
                tags={draft.skillsWanted}
                onChange={(nextTags: string[]) => setDraft((prev: Draft) => ({ ...prev, skillsWanted: nextTags }))}
              />

              <div className="profile-editor-actions">
                <button type="button" disabled={saving} className="btn-outline-red" onClick={handleCancelEditing}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-red">
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>
          </form>
        ) : null}
      </div>
      <SwapRequestModal isOpen={isSwapModalOpen} currentUser={currentUser} targetUser={profileUser} submitting={sendingSwap} onClose={handleCloseSwapModal} onSubmit={handleSubmitSwap} />
    </section>
  );
}

export default ProfilePage;
