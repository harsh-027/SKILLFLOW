import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MapPin } from "lucide-react";
import LoadingIndicator from "@/components/LoadingIndicator";
import API from "../api/axios";
import SkillTagInput from "../components/SkillTagInput";
import SwapRequestModal from "../components/SwapRequestModal";
import { type User, useApp } from "../context/AppContext";
import { getPreferredUserLabel, getSecondaryUserName } from "../lib/user-display";

type Draft = {
  name: string;
  bio: string;
  location: string;
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

const createDraftFromUser = (user: ProfileUser): Draft => ({
  name: user.name || "",
  bio: user.bio || "",
  location: user.location || "",
  skillsOffered: [...(user.skillsOffered || [])],
  skillsWanted: [...(user.skillsWanted || [])],
});

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
    skillsOffered: [],
    skillsWanted: [],
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!id) return;
        if (currentUser && currentUser._id === id) { setProfileUser(currentUser); return; }
        const { data } = await API.get<ProfileUser>(`/users/${id}`, {
          params: { _t: Date.now() },
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
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
  const handleRequest = async () => { if (!profileUser || !currentUser) { addToast("Please login to request a swap.", "warning"); navigate("/", { state: { authModal: "login" } }); return; } setIsSwapModalOpen(true); };
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
    const updatedUser = await updateProfile({
      name: draft.name.trim(),
      bio: draft.bio.trim(),
      location: draft.location.trim(),
      skillsOffered: draft.skillsOffered,
      skillsWanted: draft.skillsWanted,
    });
    setProfileUser(updatedUser);
    setDraft(createDraftFromUser(updatedUser));
      setEditing(false);
    } catch (error: any) {
      addToast(error?.response?.data?.message || error?.message || "Unable to save profile.", "error");
    } finally {
      setSaving(false);
    }
  };
  if (bootstrapping || loadingUser) return <section className="page profile-page profile-loading-page"><div className="profile-loading-content"><LoadingIndicator label="Loading profile..." /></div></section>;
  if (!profileUser) return <section className="page"><div className="glass-card card"><h2 className="section-title">User not found</h2><Link className="btn-outline-red" to="/users">Back to Users</Link></div></section>;

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
        skillsOffered: draft.skillsOffered?.length ? draft.skillsOffered : profileUser.skillsOffered,
        skillsWanted: draft.skillsWanted?.length ? draft.skillsWanted : profileUser.skillsWanted,
      }
    : profileUser;

  const offeredSkills = displayProfile.skillsOffered || [];
  const wantedSkills = displayProfile.skillsWanted || [];
  const totalSkills = new Set([...offeredSkills, ...wantedSkills]).size;
  const profileHeadline = displayProfile.bio?.trim() || "Building a strong skill exchange profile.";
  const preferredProfileLabel = getPreferredUserLabel(displayProfile);
  const secondaryProfileName = getSecondaryUserName(displayProfile);

  return (
    <section className={`page profile-page ${isOwnProfile && editing ? "is-editing" : ""}`}>
      <div className={`profile-showcase-layout ${isOwnProfile && editing ? "is-editing" : ""}`}>
        <div className="profile-showcase-column">
          <article className="glass-card card profile-showcase-card">
            <div className="profile-showcase-body">
              <div className="profile-showcase-content">
                <div className="profile-showcase-identity">
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
          <form onSubmit={handleSaveProfile} className="glass-card profile-showcase-editor">
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
